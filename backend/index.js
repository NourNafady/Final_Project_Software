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
        } else if (role == "doctor") {
            const specialization = req.body.specialization;
            const specializationResult = await db.query("SELECT * FROM specialty WHERE name = $1", [specialization]);
            if (specializationResult.rows.length === 0) {
                return res.status(400).json({message: "Invalid specialization"});
            }
            const result = await db.query("SELECT * FROM doctor WHERE email = $1", [req.body.email]);
            if (result.rows.length > 0) {
                return res.status(400).json({message: "Email already exists"});
            }
            const hash = await bcrypt.hash(req.body.password, saltRounds);
            const query = await db.query(
                "INSERT INTO doctor (full_name, email, password, age, phone, gender, specialty_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;",
                [req.body.name, req.body.email, hash, req.body.age, req.body.phone, req.body.gender, specializationResult.rows[0].id]
            );
            console.log(query.rows[0]);
            return res.status(200).json({message: "Doctor registered successfully"});
        } else if (role == "admin") {
            const result = await db.query("SELECT * FROM admin WHERE email = $1", [req.body.email]);
            if (result.rows.length > 0) {
                return res.status(400).json({message: "Email already exists"});
            }
            const hash = await bcrypt.hash(req.body.password, saltRounds);
            const query = await db.query(
                "INSERT INTO admin (full_name, email, password) VALUES ($1, $2, $3) RETURNING *;",
                [req.body.name, req.body.email, hash]
            );
            console.log(query.rows[0]);
            return res.status(200).json({message: "Admin registered successfully"});
        } else {
            return res.status(400).json({message: "Invalid role"});
        }
    } catch (error) {
        console.log(error);
        return res.status(500).json({message: "Internal Server Error"});
    }
});
async function authenticateUser(email, password, doctor, admin) {
try{
    let query;
    if (doctor) {
        query = "SELECT * FROM doctor WHERE email = $1 ";
    } else if (admin) {
        query = "SELECT * FROM admin WHERE email = $1 ";
    } else {
        query = "SELECT * FROM patient WHERE email = $1 ";
    }
    const result = await db.query(query, [email]);
    if (result.rows.length > 0) {
        const user = result.rows[0];
        const match = await bcrypt.compare(password, user.password)
        console.log(match);
        if (match) {
            delete user.password;
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
    const {email,password,admin,doctor} = req.body;
    // const hash = await bcrypt.hash(password, saltRounds);
    // console.log(hash);
    if (admin && doctor) {
        return res.status(400).json({message: "Choose only one role"});
    }
    if (!email || !password) {
        return res.status(400).json({message: "Email and password are required"});
    }
    if (validator.isEmail(email) == false){
        return res.status(400).json({message: "Invalid email"});
    }
    // Assuming you have an authenticateUser function defined elsewhere
    try{
    const user = await authenticateUser(email,password,doctor,admin);
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
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

