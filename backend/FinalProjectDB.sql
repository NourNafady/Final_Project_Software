-- CREATE TYPE state AS ENUM ('opened', 'closed');

CREATE TYPE g AS ENUM ('male', 'female');

CREATE TYPE stateOfRegistration AS ENUM ('Booked', 'Available');

CREATE TYPE weekday_enum AS ENUM (
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
);


CREATE TABLE specialty (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL
);


CREATE TABLE clinic (
    id SERIAL PRIMARY KEY,
    address TEXT NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    specialty_id INTEGER REFERENCES specialty(id) NOT NULL
);

CREATE TABLE clinic_hours (
    hours_id     SERIAL PRIMARY KEY,
    clinic_id    INTEGER REFERENCES clinic(id) NOT NULL,
    weekday      weekday_enum NOT NULL,
    open_time    TIME NOT NULL,
    close_time   TIME NOT NULL,
    -- status state NOT NULL
);

CREATE TABLE patient(
    id SERIAL PRIMARY KEY,
    full_Name VARCHAR(100) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    age INTEGER NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    gender g NOT NULL
);


CREATE TABLE admin(
    id SERIAL PRIMARY KEY,
    full_Name VARCHAR(100) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);

CREATE TABLE doctor(
    id SERIAL PRIMARY KEY,
    full_Name VARCHAR(100) NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    age INTEGER NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    gender g NOT NULL,
    specialty_id INTEGER REFERENCES specialty(id) NOT NULL
);

CREATE TABLE doctor_clinic(
    id         SERIAL PRIMARY KEY,
    doctor_id  INT REFERENCES doctor(id),
    clinic_id  INT REFERENCES clinic(id),
    UNIQUE (doctor_id, clinic_id)
);

CREATE TABLE doctor_clinic_time (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    doctor_clinic_id  INTEGER NOT NULL
    REFERENCES doctor_clinic(id) ON DELETE CASCADE,
    CONSTRAINT uniq_slot
    UNIQUE (doctor_clinic_id, date, start_time)
);



CREATE TABLE registration (
    id SERIAL PRIMARY KEY,
    slot_id           INTEGER NOT NULL UNIQUE
    REFERENCES doctor_clinic_time(id)
    ON DELETE RESTRICT,
    patient_id        INTEGER NOT NULL
    REFERENCES patient(id)
    ON DELETE RESTRICT,
    status stateOfRegistration NOT NULL,
    registration_time TIMESTAMPTZ NOT NULL DEFAULT now()
);


-- Code of Insertion for the specialty table
INSERT INTO specialty (name) VALUES
    ('General Medicine'),
    ('Cardiology'),
    ('Neurology'),
    ('Pediatrics'),
    ('Physical Therapy'),
    ('Mental Health'),
    ('General Dentistry'),
    ('Insurance');


-- Code of Insertion for the clinic table
INSERT INTO clinic (address, phone, specialty_id) VALUES
    ('1 Nile Avenue, Cairo, Egypt', '01001000001', 1),
    ('12 Tahrir Square, Cairo, Egypt','01001000002', 2),
    ('23 Ramses St., Cairo, Egypt', '01001000003', 3),
    ('34 Gezira St., Zamalek, Cairo, Egypt','01001000004', 4),
    ('45 Maadi Corniche, Maadi, Cairo, Egypt','01001000005', 5),
    ('56 Heliopolis St., Heliopolis, Cairo','01001000006', 6),
    ('67 Sixth of October City, Giza, EG','01001000007', 7),
    ('78 Smart Village, Giza, Egypt', '01001000008', 8);

-- Code of Modification for the clinic_hours table if you already add status column
ALTER TABLE clinic_hours
DROP COLUMN status;


-- Code of Insertion for the clinic_hours table
INSERT INTO clinic_hours (clinic_id, weekday, open_time, close_time) VALUES
    (1, 'Monday',   '08:00:00', '17:00:00'),
    (2, 'Tuesday',   '09:00:00', '18:00:00'),
    (3, 'Wednesday', '07:30:00', '16:30:00'),
    (4, 'Thursday', '10:00:00', '19:00:00'),
    (5, 'Friday',   '08:30:00', '17:30:00'),
    (6, 'Saturday', '09:30:00', '18:30:00'),
    (7, 'Sunday',   '07:00:00', '15:00:00'),
    (8, 'Monday',   '11:00:00', '20:00:00');