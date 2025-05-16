CREATE TYPE state AS ENUM ('opened', 'closed');

CREATE TYPE g AS ENUM ('Male', 'Female');

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
    status state NOT NULL
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
