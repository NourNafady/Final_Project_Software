
const express = require('express'); 
const cors = require('cors'); 
const bodyParser = require('body-parser');
const validator = require('validator'); 
const pg = require('pg'); 
const dotenv = require('dotenv'); 
const bcrypt = require('bcrypt'); 
const app = express();  
const port = 4200; 
const saltRounds = 10;  dotenv.config();  
app.use(express.json()); 
app.use(bodyParser.urlencoded()); 
app.use(cors());   
const db =  new pg.Client({     host: process.env.DB_HOST,    
    database: process.env.DB_DATABASE,     
    port: process.env.DB_PORT,     
    user: process.env.DB_USER,     
    password: process.env.DB_PASSWORD, });  
db.connect() 
.then(() => console.log('Connected to PostgreSQL'))
.catch(err => console.error('Connection error', err));

app.get('/api/admin/doctors', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        d.id, 
        d.full_name, 
        d.email, 
        d.age, 
        d.phone, 
        d.gender,
        d.specialty_id,
        d.clinic_id,
        d.created_at
      FROM doctor d
      ORDER BY d.created_at DESC
    `);

    res.json({
      success: true,
      doctors: result.rows
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
});

// Get specific doctor by ID
app.get('/api/admin/doctors/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    const result = await db.query(`
      SELECT 
        d.id, 
        d.full_name, 
        d.email, 
        d.age, 
        d.phone, 
        d.gender,
        d.specialty_id,
        d.clinic_id,
        d.created_at
      FROM doctor d
      WHERE d.id = $1
    `, [doctorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      success: true,
      doctor: result.rows[0]
    });
  } catch (error) {
    console.error('Error fetching doctor:', error);
    res.status(500).json({ error: 'Failed to fetch doctor' });
  }
});

// Get doctor hours/schedule by doctor ID
app.get('/api/admin/doctor-hours/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    
    // First check if doctor exists
    const doctorCheck = await db.query('SELECT id FROM doctor WHERE id = $1', [doctorId]);
    if (doctorCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    const result = await db.query(`
      SELECT 
        id,
        date,
        weekdays,
        start_time,
        end_time,
        created_at
      FROM doctor_hours
      WHERE doctor_id = $1
      ORDER BY date DESC, start_time ASC
    `, [doctorId]);

    res.json({
      success: true,
      hours: result.rows
    });
  } catch (error) {
    console.error('Error fetching doctor hours:', error);
    res.status(500).json({ error: 'Failed to fetch doctor hours' });
  }
});

// Get all doctors with their schedules (comprehensive view)
app.get('/api/admin/doctors-with-schedules', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        d.id, 
        d.full_name, 
        d.email, 
        d.age, 
        d.phone, 
        d.gender,
        d.specialty_id,
        d.clinic_id,
        d.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', dh.id,
              'date', dh.date,
              'weekdays', dh.weekdays,
              'start_time', dh.start_time,
              'end_time', dh.end_time
            ) ORDER BY dh.date DESC, dh.start_time ASC
          ) FILTER (WHERE dh.id IS NOT NULL), 
          '[]'
        ) as schedules
      FROM doctor d
      LEFT JOIN doctor_hours dh ON d.id = dh.doctor_id
      GROUP BY d.id, d.full_name, d.email, d.age, d.phone, d.gender, d.specialty_id, d.clinic_id, d.created_at
      ORDER BY d.created_at DESC
    `);

    res.json({
      success: true,
      doctors: result.rows
    });
  } catch (error) {
    console.error('Error fetching doctors with schedules:', error);
    res.status(500).json({ error: 'Failed to fetch doctors with schedules' });
  }
});


// Add new doctor
app.post('/api/admin/doctors', async (req, res) => {
  try {
    const { 
      full_name, email, password, age, phone, gender, 
      specialty_id, clinic_id 
    } = req.body;

    // Validate required fields
    if (!full_name || !email || !password || !age || !phone || !gender || !specialty_id || !clinic_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists
    const emailCheck = await db.query('SELECT id FROM doctor WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new doctor
    const result = await db.query(`
      INSERT INTO doctor (full_name, email, password, age, phone, gender, specialty_id, clinic_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, full_name, email, age, phone, gender
    `, [full_name, email, hashedPassword, age, phone, gender, specialty_id, clinic_id]);

    res.status(201).json({
      success: true,
      message: 'Doctor added successfully',
      doctor: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding doctor:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'Email or phone already exists' });
    } else {
      res.status(500).json({ error: 'Failed to add doctor' });
    }
  }
});



// Add doctor hours
app.post('/api/admin/doctor-hours', async (req, res) => {
  try {
    const { doctor_id, date, start_time, end_time } = req.body;

    // Validate required fields
    if (!doctor_id || !date || !start_time || !end_time) {
      return res.status(400).json({ error: 'All fields are required' });
    }


    // Validate that doctor exists
    const doctorCheck = await db.query('SELECT id FROM doctor WHERE id = $1', [doctor_id]);
    if (doctorCheck.rows.length === 0) {
      return res.status(400).json({ error: 'Doctor not found' });
    }
        // Combine date + times into full datetime objects
    const startDateTime = new Date(`${date}T${start_time}`);
    const endDateTime = new Date(`${date}T${end_time}`);
    const now = new Date();

    // Check 1: start_time must be in the future
    if (startDateTime <= now) {
      return res.status(400).json({ error: 'Start time must be in the future' });
    }

    // Check 2: end_time must be after start_time
    if (endDateTime <= startDateTime) {
      return res.status(400).json({ error: 'End time must be after start time' });
    // 
    }
    // check the clinic in open 
    const clinicCheck = await db.query(`
      SELECT ch.open_time, ch.close_time
      FROM doctor d
      JOIN clinic_hours ch ON d.clinic_id = ch.clinic_id
      WHERE d.id =$1`,[doctor_id]);
      if (clinicCheck.rows.length === 0) {
  return res.status(400).json({ error: 'Clinic hours not found ' });
      }
      const clinicOpen = clinicCheck.rows[0].open_time;  // e.g., '08:00:00'
      const clinicClose = clinicCheck.rows[0].close_time;

      // Convert both times to Date objects for comparison
      const clinicOpenDateTime = new Date(`${date}T${clinicOpen}`);
      const clinicCloseDateTime = new Date(`${date}T${clinicClose}`);
      if (startDateTime < clinicOpenDateTime || endDateTime > clinicCloseDateTime) {
        return res.status(400).json({ error: 'Time slot is outside clinic hours' });}
      
        const conflictQuery = `
      SELECT *
      FROM doctor_hours
      WHERE doctor_id = $1
        AND date = $2
         AND date >= CURRENT_DATE
        
        AND (
          (start_time < $4 AND end_time > $3)  -- overlap check
        );
    `;

    const conflictResult = await db.query(conflictQuery, [
      doctor_id,
      date,
      start_time,
      end_time,
    ]);

    if (conflictResult.rows.length > 0) {
      console.log('Conflict found:', conflictResult.rows);
     res.status(400).json({ error: 'This time slot already exists for the doctor' });
     return { success: false, error: "conflict found" };
    }

  

   


    // Insert new doctor hours
    const result = await db.query(`
      INSERT INTO doctor_hours (doctor_id, date, start_time, end_time)
      VALUES ($1, $2, $3, $4)
      RETURNING id, date, start_time, end_time
    `, [doctor_id, date, start_time, end_time]);

    res.status(201).json({
      success: true,
      message: 'Doctor hours added successfully',
      hours: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding doctor hours:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({ error: 'This time slot already exists for the doctor' });
    } else {
      res.status(500).json({ error: 'Failed to add doctor hours' });
    }
  }
});

// Delete doctor hours
app.delete('/api/admin/doctor-hours/:hourId', async (req, res) => {
  try {
    const { hourId } = req.params;

    // Check if there are any registrations for this time slot
    const registrationCheck = await db.query(
      'SELECT id FROM registration WHERE slot_id = $1',
      [hourId]
    );

    if (registrationCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete time slot with existing patient registrations' 
      });
    }

    const result = await db.query(
      'DELETE FROM doctor_hours WHERE id = $1 RETURNING id',
      [hourId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor hours not found' });
    }

    res.json({
      success: true,
      message: 'Doctor hours deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting doctor hours:', error);
    res.status(500).json({ error: 'Failed to delete doctor hours' });
  }
});

// Update doctor information
app.put('/api/admin/doctors/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { 
      full_name, email, age, phone, gender, 
      specialty_id, clinic_id 
    } = req.body;

    // Validate required fields
    if (!full_name || !email || !age || !phone || !gender || !specialty_id || !clinic_id) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Validate email format
    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Check if email already exists for other doctors
    const emailCheck = await db.query(
      'SELECT id FROM doctor WHERE email = $1 AND id != $2', 
      [email, doctorId]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Update doctor
    const result = await db.query(`
      UPDATE doctor 
      SET full_name = $1, email = $2, age = $3, phone = $4, 
          gender = $5, specialty_id = $6, clinic_id = $7
      WHERE id = $8
      RETURNING id, full_name, email, age, phone, gender
    `, [full_name, email, age, phone, gender, specialty_id, clinic_id, doctorId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      success: true,
      message: 'Doctor updated successfully',
      doctor: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating doctor:', error);
    res.status(500).json({ error: 'Failed to update doctor' });
  }
});

// Delete doctor
app.delete('/api/admin/doctors/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;

    // Check if doctor has any registrations
    const registrationCheck = await db.query(`
      SELECT r.id FROM registration r
      JOIN doctor_hours dh ON r.slot_id = dh.id
      WHERE dh.doctor_id = $1
    `, [doctorId]);

    if (registrationCheck.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete doctor with existing patient appointments' 
      });
    }

    const result = await db.query(
      'DELETE FROM doctor WHERE id = $1 RETURNING id',
      [doctorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting doctor:', error);
    res.status(500).json({ error: 'Failed to delete doctor' });
  }
});
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});