const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser')
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
            const specializationResult = await db.query("SELECT * FROM specialization WHERE name = $1", [specialization]);
            if (specializationResult.rows.length === 0) {
                return res.status(400).json({message: "Invalid specialization"});
            }
            const result = await db.query("SELECT * FROM doctor WHERE email = $1", [req.body.email]);
            if (result.rows.length > 0) {
                return res.status(400).json({message: "Email already exists"});
            }
            const hash = await bcrypt.hash(req.body.password, saltRounds);
            const query = await db.query(
                "INSERT INTO doctor (full_name, email, password, age, phone, gender, specialization_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;",
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


app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});

