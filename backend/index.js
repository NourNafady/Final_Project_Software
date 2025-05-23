const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
const validator = require('validator');
const pg = require('pg');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const app = express();

const port = 4000;
const saltRounds = 10;

dotenv.config();

app.use(express.json());
app.use(bodyParser.urlencoded());
app.use(cors());


const db =  new pg.Client({
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

db.connect()

app.get('/', (req, res) => {
    res.send('Hello World!');
});


app.post('/signup', async (req, res) => {
    try {
        const role = req.body.role;

        if (role == "patient") {
            const result = await db.query("SELECT * FROM patient WHERE email = $1", [req.body.email]);
            if (result.rows.length > 0) {
                return res.status(400).json({message: "Email already exists"});
            }
            const hash = await bcrypt.hash(req.body.password, saltRounds);
            const query = await db.query(
                "INSERT INTO patient (full_name, email, password, age, phone, gender) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;",
                [req.body.name, req.body.email, hash, req.body.age, req.body.phone, req.body.gender]
            );
            console.log(query.rows[0]);
            return res.status(200).json({message: "Patient registered successfully"});
        // } else if (role == "doctor") {
        //     const specialization = req.body.specialization;
        //     const specializationResult = await db.query("SELECT * FROM specialty WHERE name = $1", [specialization]);
        //     if (specializationResult.rows.length === 0) {
        //         return res.status(400).json({message: "Invalid specialization"});
        //     }
        //     const result = await db.query("SELECT * FROM doctor WHERE email = $1", [req.body.email]);
        //     if (result.rows.length > 0) {
        //         return res.status(400).json({message: "Email already exists"});
        //     }
        //     const hash = await bcrypt.hash(req.body.password, saltRounds);
        //     const query = await db.query(
        //         "INSERT INTO doctor (full_name, email, password, age, phone, gender, specialty_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;",
        //         [req.body.name, req.body.email, hash, req.body.age, req.body.phone, req.body.gender, specializationResult.rows[0].id]
        //     );
        //     console.log(query.rows[0]);
        //     return res.status(200).json({message: "Doctor registered successfully"});
        // } else if (role == "admin") {
        //     const result = await db.query("SELECT * FROM admin WHERE email = $1", [req.body.email]);
        //     if (result.rows.length > 0) {
        //         return res.status(400).json({message: "Email already exists"});
        //     }
        //     const hash = await bcrypt.hash(req.body.password, saltRounds);
        //     const query = await db.query(
        //         "INSERT INTO admin (full_name, email, password) VALUES ($1, $2, $3) RETURNING *;",
        //         [req.body.name, req.body.email, hash]
        //     );
        //     console.log(query.rows[0]);
        //     return res.status(200).json({message: "Admin registered successfully"});
        } else {
            return res.status(400).json({message: "Invalid role"});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
});
async function authenticateUser(email, password, doctor) {
try{
    let query;
    let userType;
    if (doctor) {
        query = "SELECT * FROM doctor WHERE email = $1 ";
        userType = 'doctor';
    // } else if (admin) {
    //     query = "SELECT * FROM admin WHERE email = $1 ";
    } else {
        query = "SELECT * FROM patient WHERE email = $1 ";
        userType = 'patient';
    }
    const result = await db.query(query, [email]);
    if (result.rows.length > 0) {
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password)
        console.log(match);
        if (match) {
            delete user.password;
            user.userType = userType; 
            console.log(user);
            return user;
        }
    }
    return null;
}
catch (error) {
    console.error('Error authenticating user:', error);
    throw error; // Rethrow the error to be handled by the calling function

}}
app.post('/signin', async (req,res)=>{
    const {email,password,doctor} = req.body;
    // const hash = await bcrypt.hash(password, saltRounds);
    // console.log(hash);
    // if (admin && doctor) {
    //     return res.status(400).json({message: "Choose only one role"});
    // }
    if (!email || !password) {
        return res.status(400).json({message: "Email and password are required"});
    }
    if (validator.isEmail(email) == false){
        return res.status(400).json({message: "Invalid email"});
    }
    // Assuming you have an authenticateUser function defined elsewhere
    try{
    const user = await authenticateUser(email,password,doctor);
    if (user !== null) {
        return res.status(200).json({message: "Login successful", user});
    } else {
        return res.status(401).json({message: "Invalid email or password"});
    }}
    catch (error) {
        console.error('Error during authentication:', error);
        return res.status(500).json({message: "Internal Server Error"});
    }
});

app.get('/clinics', async (req, res) => {
    try {
    // Join clinic, specialty, and clinic_hours
    const result = await db.query(`
        SELECT 
        c.id,
        s.name AS name,
        c.address,
        c.phone,
        ch.open_time,
        ch.close_time
        FROM clinic c
        JOIN specialty s ON c.specialty_id = s.id
        JOIN clinic_hours ch ON ch.clinic_id = c.id
        ORDER BY c.id ASC
    `);

    console.log(result.rows);
    // Format the weekdays array and time fields for frontend
    const clinics = result.rows.map(row => ({
        id: row.id,
        name: row.name,
        address: row.address,
        phone: row.phone,
        open_time: row.open_time.slice(0,5),   
        close_time: row.close_time.slice(0,5), 
    }));

    res.json(clinics);
    } catch (error) {
    console.error('Error fetching clinics:', error);
    res.status(500).json({ message: 'Internal Server Error' });
    }
});


app.get('/doctors', async (req, res) => {
    const clinic_id = req.query.clinic_id; 
    console.log(clinic_id);
    try {
        const result = await db.query("SELECT d.*, s.name AS specialty_name FROM doctor d JOIN specialty s ON d.specialty_id = s.id WHERE d.clinic_id = $1;", [clinic_id]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).json({ message: "No doctors found for this clinic" });
        }
    } catch (error) {
        console.error('Error fetching doctors:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.get('/doctor/:id/time-slots', async (req, res) => {
    const doctorId = req.params.id;

    try {
        const result = await db.query("SELECT d.* FROM doctor_hours AS d FULL OUTER JOIN registration AS r ON d.id = r.slot_id WHERE doctor_id = $1 AND r.id IS NULL AND d.date >=CURRENT_DATE ORDER BY d.date ASC;", [doctorId]);
        if (result.rows.length > 0) {
            res.status(200).json(result.rows);
        } else {
            res.status(404).json({ message: "No time slots found for this doctor" });
        }
    } catch (error) {
        console.error('Error fetching time slots:', error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});


app.get('/doctor/:doctorEmail/my-appointment-slots', async (req, res) => {
  const doctorEmail= req.params.doctorEmail;
// console.log(`Received request for doctor: ${doctorEmail}'s appointment slots.`);
  try {   
    const queryText = `
      SELECT
      r.id AS slot_id,
        d.start_time,
        d.end_time,
        p.full_name AS patient_name,
        p.email AS patient_email,
        p.phone AS patient_phone,
        d.date
      FROM
        registration r
      inner JOIN
        doctor_hours d ON d.id = r.slot_id 
      inner JOIN
        patient p ON r.patient_id = p.id
      inner JOIN
       doctor doc ON doc.id = d.doctor_id
      WHERE
        doc.email = $1 AND d.date >= CURRENT_DATE
      ORDER BY
         d.date,d.start_time;
    `;

    const result = await db.query(queryText, [doctorEmail]);

    const formatted = result.rows.map(row => ({
      id: row.slot_id,
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      patient_name: row.patient_name || null,
      patient_email: row.patient_email || null,
      patient_phone: row.patient_phone || null,
    }));

    // 4. Send the successful response
    res.status(200).json(formatted);

  } catch (error) {
    console.error('Error fetching appointment slots:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

app.get('/patient/:patientEmail/my-appointment-slots', async (req, res) => {
  const patientEmail= req.params.patientEmail;
  try {   
    const queryText = `
      SELECT
      r.id AS slot_id,
        d.start_time,
        d.end_time,
        doc.full_name AS doctor_name,
        doc.email AS doctor_email,
        doc.phone AS doctor_phone,
        d.date
      FROM
        registration r
      inner JOIN
        doctor_hours d ON d.id = r.slot_id 
      inner JOIN
        patient p ON r.patient_id = p.id
      inner JOIN
       doctor doc ON doc.id = d.doctor_id
      WHERE
        p.email = $1 AND d.date >= CURRENT_DATE
      ORDER BY
         d.date,d.start_time;
    `;

    const result = await db.query(queryText, [patientEmail]);

    const formatted = result.rows.map(row => ({
      id: row.slot_id,
      date: row.date,
      start_time: row.start_time,
      end_time: row.end_time,
      doctor_name: row.doctor_name || null,
      doctor_email: row.doctor_email || null,
      doctor_phone: row.doctor_phone || null,
    }));

    // 4. Send the successful response
    res.status(200).json(formatted);

  } catch (error) {
    console.error('Error fetching appointment slots:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


app.post('/doctor/makeappointment', async (req, res) => {
  try {
    const { doctor_clinic_time_id, patient_id } = req.body;

    // Validate inputs
    if (!doctor_clinic_time_id || !patient_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if the time slot exists
    const timeSlotCheck = await db.query(
      'SELECT * FROM doctor_hours WHERE id = $1',
      [doctor_clinic_time_id]
    );
    if (timeSlotCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Time slot not found' });
    }

    // Check if an appointment already exists for this slot
    const existingAppointment = await db.query(
      'SELECT * FROM registration WHERE slot_id = $1',
      [doctor_clinic_time_id]
    );
    if (existingAppointment.rows.length > 0) {
      return res.status(409).json({ error: 'This time slot is already booked' });
    }

    // Insert the new appointment
    await db.query(
      'INSERT INTO registration (slot_id, patient_id,status ) VALUES ($1, $2,$3)',
      [doctor_clinic_time_id, patient_id,"Booked"]
    );

    return res.status(201).json({ message: 'Appointment booked successfully' });

  } catch (error) {
    console.error('Error making appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

