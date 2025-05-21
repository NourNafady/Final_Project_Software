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
    weekdays      weekday_enum[] NOT NULL,
    open_time    TIME NOT NULL,
    close_time   TIME NOT NULL
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
    specialty_id INTEGER REFERENCES specialty(id) NOT NULL,
    clinic_id INTEGER REFERENCES clinic(id) NOT NULL
);


CREATE TABLE doctor_hours (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL DEFAULT now(),
    doctor_id INTEGER NOT NULL REFERENCES doctor(id) ON DELETE CASCADE,
    weekdays weekday_enum[] NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT uniq_weekly_slot
    UNIQUE (doctor_id, weekdays, start_time)
);



CREATE TABLE registration (
    id SERIAL PRIMARY KEY,
    slot_id           INTEGER NOT NULL UNIQUE
    REFERENCES doctor_hours(id)
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
-- ALTER TABLE clinic_hours
-- DROP COLUMN status;


-- Code of Insertion for the clinic_hours table
INSERT INTO clinic_hours (clinic_id, weekdays, open_time, close_time) VALUES
    (1, ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday']   ::weekday_enum[], '08:00:00','17:00:00'),
    (2, ARRAY['Tuesday','Wednesday','Thursday','Friday','Saturday']::weekday_enum[], '09:00:00','18:00:00'),
    (3, ARRAY['Monday','Wednesday','Friday']                         ::weekday_enum[], '07:30:00','16:30:00'),
    (4, ARRAY['Thursday','Friday','Saturday','Sunday']              ::weekday_enum[], '10:00:00','19:00:00'),
    (5, ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday']   ::weekday_enum[], '08:30:00','17:30:00'),
    (6, ARRAY['Saturday','Sunday']                                  ::weekday_enum[], '09:30:00','18:30:00'),
    (7, ARRAY['Monday','Tuesday','Wednesday']                       ::weekday_enum[], '07:00:00','15:00:00'),
    (8, ARRAY['Friday','Saturday','Sunday']                         ::weekday_enum[], '11:00:00','20:00:00');

-- Code of Insertion for the doctor table
-- Make sure pgcrypto is enabled:
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Insert 6 doctors per specialty (IDs 1–8) with bcrypt-hashed passwords:
INSERT INTO doctor (full_name, email, password, age, phone, gender, specialty_id, clinic_id) VALUES
  -- Specialty 1: Neurology
  ('Dr. Alice Neu',     'alice.neu@example.com',     crypt('passAlice1', gen_salt('bf')), 45, '01000000001', 'female', 1, 1),
  ('Dr. Bob Brain',     'bob.brain@example.com',     crypt('passBob2', gen_salt('bf')), 50, '01000000002', 'male',   1, 1),
  ('Dr. Cara Cortex',   'cara.cortex@example.com',   crypt('passCara3', gen_salt('bf')), 38, '01000000003', 'female', 1, 1),
  ('Dr. Dan Dendrite',  'dan.dendrite@example.com',  crypt('passDan4', gen_salt('bf')), 42, '01000000004', 'male',   1, 1),
  ('Dr. Eve Enceph',    'eve.enceph@example.com',    crypt('passEve5', gen_salt('bf')), 47, '01000000005', 'female', 1, 1),
  ('Dr. Frank Frontal', 'frank.frontal@example.com', crypt('passFrank6', gen_salt('bf')),55, '01000000006', 'male',   1, 1),

  -- Specialty 2: General Medicine
  ('Dr. Grace General', 'grace.gen@example.com',     crypt('passGrace1', gen_salt('bf')),35, '01000000011', 'female', 2, 2),
  ('Dr. Hank Health',   'hank.health@example.com',   crypt('passHank2', gen_salt('bf')), 41, '01000000012', 'male',   2, 2),
  ('Dr. Iris Internal', 'iris.int@example.com',      crypt('passIris3', gen_salt('bf')), 39, '01000000013', 'female', 2, 2),
  ('Dr. Jack Junction', 'jack.junc@example.com',     crypt('passJack4', gen_salt('bf')), 44, '01000000014', 'male',   2, 2),
  ('Dr. Kelly Kinney',  'kelly.kin@example.com',     crypt('passKelly5', gen_salt('bf')),36, '01000000015', 'female', 2, 2),
  ('Dr. Liam Latin',    'liam.latin@example.com',    crypt('passLiam6', gen_salt('bf')),48, '01000000016', 'male',   2, 2),

  -- Specialty 3: Cardiology
  ('Dr. Mia Myo',       'mia.myo@example.com',       crypt('passMia1', gen_salt('bf')),  37, '01000000021', 'female', 3, 3),
  ('Dr. Nate Node',     'nate.node@example.com',     crypt('passNate2', gen_salt('bf')), 52, '01000000022', 'male',   3, 3),
  ('Dr. Olga Onda',     'olga.onda@example.com',     crypt('passOlga3', gen_salt('bf')), 43, '01000000023', 'female', 3, 3),
  ('Dr. Paul Pulse',    'paul.pulse@example.com',    crypt('passPaul4', gen_salt('bf')), 46, '01000000024', 'male',   3, 3),
  ('Dr. Quinn Quiver',  'quinn.quiv@example.com',    crypt('passQuinn5', gen_salt('bf')),40, '01000000025', 'female', 3, 3),
  ('Dr. Rick Rhythm',   'rick.rhythm@example.com',   crypt('passRick6', gen_salt('bf')),51, '01000000026', 'male',   3, 3),

  -- Specialty 4: Pediatrics
  ('Dr. Sara Smile',    'sara.smile@example.com',    crypt('passSara1', gen_salt('bf')),  34, '01000000031', 'female', 4, 4),
  ('Dr. Tom Tot',       'tom.tot@example.com',       crypt('passTom2', gen_salt('bf')),  39, '01000000032', 'male',   4, 4),
  ('Dr. Uma Umbra',     'uma.umbra@example.com',     crypt('passUma3', gen_salt('bf')),  37, '01000000033', 'female', 4, 4),
  ('Dr. Vince Vax',     'vince.vax@example.com',     crypt('passVax4',   gen_salt('bf')), 42, '01000000034', 'male',   4, 4),
  ('Dr. Wendy Wee',     'wendy.wee@example.com',     crypt('passWendy5', gen_salt('bf')), 36, '01000000035', 'female', 4, 4),
  ('Dr. Xavier Xyle',   'xavier.xyle@example.com',   crypt('passXavier6',gen_salt('bf')),49, '01000000036', 'male',   4, 4),

  -- Specialty 5: Physical Therapy
  ('Dr. Yara Yoga',     'yara.yoga@example.com',     crypt('passYara1', gen_salt('bf')),  30, '01000000041', 'female', 5, 5),
  ('Dr. Zack Zener',    'zack.zener@example.com',    crypt('passZack2', gen_salt('bf')),  45, '01000000042', 'male',   5, 5),
  ('Dr. Abby Agile',    'abby.agile@example.com',    crypt('passAbby3', gen_salt('bf')),  33, '01000000043', 'female', 5, 5),
  ('Dr. Ben Balance',   'ben.balance@example.com',   crypt('passBen4', gen_salt('bf')),   38, '01000000044', 'male',   5, 5),
  ('Dr. Cara Core',     'cara.core@example.com',     crypt('passCara5', gen_salt('bf')),  41, '01000000045', 'female', 5, 5),
  ('Dr. Dan Drive',     'dan.drive@example.com',     crypt('passDan6', gen_salt('bf')),   47, '01000000046', 'male',   5, 5),

  -- Specialty 6: Mental Health
  ('Dr. Ella Emote',    'ella.emote@example.com',     crypt('passElla1', gen_salt('bf')),  50, '01000000051', 'female', 6, 6),
  ('Dr. Finn Feel',     'finn.feel@example.com',      crypt('passFinn2', gen_salt('bf')),  44, '01000000052', 'male',   6, 6),
  ('Dr. Gina Gaze',     'gina.gaze@example.com',      crypt('passGina3', gen_salt('bf')),  39, '01000000053', 'female', 6, 6),
   ('Dr. Hank Healing', 'hank.heal@example.com',  crypt('passHank4', gen_salt('bf')), 47, '01000000054', 'male',   6, 6),
  ('Dr. Ivy Insight',  'ivy.insight@example.com', crypt('passIvy5', gen_salt('bf')), 36, '01000000055', 'female', 6, 6),
  ('Dr. Jack Joy',     'jack.joy@example.com',    crypt('passJack6', gen_salt('bf')), 41, '01000000056', 'male',   6, 6),

  -- Specialty 7: General Dentistry
    ('Dr. Karen Krown',  'karen.krown@example.com', crypt('passKaren1', gen_salt('bf')), 38, '01000000061', 'female', 7, 7),
  ('Dr. Leo Ledge',    'leo.ledge@example.com',   crypt('passLeo2', gen_salt('bf')), 45, '01000000062', 'male',   7, 7),
  ('Dr. Maya Molar',   'maya.molar@example.com',  crypt('passMaya3', gen_salt('bf')), 33, '01000000063', 'female', 7, 7),
  ('Dr. Nick Nib',     'nick.nib@example.com',    crypt('passNick4', gen_salt('bf')), 48, '01000000064', 'male',   7, 7),
  ('Dr. Opal Oral',    'opal.oral@example.com',   crypt('passOpal5', gen_salt('bf')), 40, '01000000065', 'female', 7, 7),
  ('Dr. Pete Probe',   'pete.probe@example.com',  crypt('passPete6', gen_salt('bf')), 42, '01000000066', 'male',   7, 7),

  -- Specialty 8: Insurance
  ('Dr. Quinn Quote',  'quinn.quote@example.com',  crypt('passQuinn1', gen_salt('bf')), 52, '01000000071', 'female', 8, 8),
  ('Dr. Ronald Rate',  'ronald.rate@example.com',  crypt('passRonald2', gen_salt('bf')), 47, '01000000072', 'male',   8, 8),
  ('Dr. Sara Sure',    'sara.sure@example.com',    crypt('passSara3', gen_salt('bf')), 44, '01000000073', 'female', 8, 8),
  ('Dr. Tim Terms',   'tim.terms@example.com',    crypt('passTim4', gen_salt('bf')),    39, '01000000074', 'male',   8, 8),
  ('Dr. Uma Underw',  'uma.underw@example.com',   crypt('passUma5', gen_salt('bf')),    35, '01000000075', 'female', 8, 8),
  ('Dr. Vic Verify',  'vic.verify@example.com',   crypt('passVic6', gen_salt('bf')),    48, '01000000076', 'male',   8, 8);


WITH numbered AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY id) AS rn
  FROM doctor
)
INSERT INTO doctor_hours (date, doctor_id, weekdays, start_time, end_time)
SELECT
  -- each doctor gets a unique date = today + (rn-1) days
  (CURRENT_DATE + (rn - 1) * INTERVAL '1 day')::date         AS date,

  id,

  ARRAY['Monday','Tuesday','Wednesday','Thursday','Friday']::weekday_enum[],

  -- generate start = 10:00 + (rn-1)*15min, clamped to [10:00,16:00]
  GREATEST(
    LEAST(
      (TIME '10:00:00' + (rn - 1) * INTERVAL '15 minutes')::time,
      TIME '16:00:00'
    ),
    TIME '10:00:00'
  )                                                             AS start_time,

  -- end = start + 10h, clamped to 22:30
  LEAST(
    (
      GREATEST(
        LEAST(
          (TIME '10:00:00' + (rn - 1) * INTERVAL '15 minutes')::time,
          TIME '16:00:00'
        ),
        TIME '10:00:00'
      ) + INTERVAL '10 hours'
    )::time,
    TIME '22:30:00'
  )                                                             AS end_time

FROM numbered;
