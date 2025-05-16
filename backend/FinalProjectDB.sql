CREATE TYPE state AS ENUM ('opened', 'closed');

CREATE TYPE g AS ENUM ('Male', 'Female');

CREATE TABLE clinic (
id SERIAL PRIMARY KEY,
address TEXT NOT NULL,
opening_time TIME NOT NULL,
closing_time TIME NOT NULL,
status state NOT NULL,
phone VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE patient(
id SERIAL PRIMARY KEY,
first_name VARCHAR(50) NOT NULL,
last_name VARCHAR(50) NOT NULL,
email TEXT NOT NULL UNIQUE,
gender g,
date_of_birth DATE
);


CREATE TABLE doctor(
id SERIAL PRIMARY KEY,
first_name VARCHAR(50) NOT NULL,
last_name VARCHAR(50) NOT NULL,
email TEXT NOT NULL UNIQUE,
phone VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE doctor_clinic(
    doctor_id INTEGER REFERENCES doctor(id),
    clinic_id INTEGER REFERENCES clinic(id),
    PRIMARY KEY (doctor_id, clinic_id)
);