DROP TABLE IF EXISTS case_files;
DROP TABLE IF EXISTS case_team;
DROP TABLE IF EXISTS case_messages;
DROP TABLE IF EXISTS case_notes;
DROP TABLE IF EXISTS case_medications;
DROP TABLE IF EXISTS case_labs;
DROP TABLE IF EXISTS case_vitals;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS activities;
DROP TABLE IF EXISTS cases;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  id varchar(191) PRIMARY KEY,
  title varchar(32) DEFAULT 'Dr.',
  first_name varchar(191) NOT NULL,
  last_name varchar(191) NOT NULL,
  specialty varchar(191) NULL,
  hospital varchar(255) NULL,
  email varchar(191) NULL,
  avatar_url text NULL,
  phone_number varchar(32) NULL,
  license varchar(191) NULL,
  is_accepting_cases boolean NOT NULL DEFAULT true,
  is_accepting_notifications boolean NOT NULL DEFAULT true,
  status enum('online', 'away', 'dnd') NOT NULL DEFAULT 'online',
  notif_prefs json NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id varchar(191) PRIMARY KEY,
  cid varchar(32) NOT NULL,
  passport_no varchar(64) NULL,
  hn varchar(64) NOT NULL,
  patient_name varchar(191) NOT NULL,
  first_name varchar(191) NOT NULL,
  last_name varchar(191) NOT NULL,
  gender enum('male', 'female', 'other', 'unknown') NOT NULL DEFAULT 'unknown',
  birth_date date NULL,
  age int NULL,
  phone_number varchar(32) NULL,
  district varchar(191) NULL,
  province varchar(191) NULL,
  blood_type enum('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown') NOT NULL DEFAULT 'unknown',
  allergies json NOT NULL,
  conditions json NOT NULL,
  UNIQUE KEY patients_cid_unique (cid),
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cases (
  id varchar(191) PRIMARY KEY,
  patient_name varchar(191) NOT NULL,
  hospital varchar(255) NOT NULL,
  status enum('Pending', 'Approved', 'Declined', 'Active', 'Critical', 'Archived', 'Discharge', 'Referred', 'Dead') NOT NULL DEFAULT 'Pending',
  priority enum('IMMEDIATE', 'EMERGENCY', 'URGENT', 'SEMI-URGENT', 'NON-URGENT') NOT NULL,
  age int NULL,
  gender varchar(32) NULL,
  specialty varchar(191) NULL,
  reason text NULL,
  hn varchar(64) NULL,
  an varchar(64) NULL,
  cid varchar(32) NULL,
  blood_type varchar(16) NULL,
  allergies json NULL,
  conditions json NULL,
  current_symptoms text NULL,
  initial_diagnosis text NULL,
  clinical_notes text NULL,
  sender_id varchar(191) NULL,
  date_string varchar(191) NULL,
  close_date_string varchar(191) NULL,
  closed_timestamp timestamp NULL,
  last_action varchar(255) NULL,
  last_active_time varchar(191) NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_cases_cid FOREIGN KEY (cid) REFERENCES patients(cid) ON DELETE SET NULL,
  CONSTRAINT fk_cases_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS notifications (
  id varchar(191) PRIMARY KEY,
  user_id varchar(191) NOT NULL,
  title varchar(255) NOT NULL,
  message text NOT NULL,
  time_string varchar(191) NULL,
  `read` boolean NOT NULL DEFAULT false,
  type enum('request', 'message', 'alert') NOT NULL DEFAULT 'alert',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS activities (
  id varchar(191) PRIMARY KEY,
  title varchar(255) NOT NULL,
  `desc` text NOT NULL,
  time_string varchar(191) NULL,
  details text NULL,
  icon enum('alert', 'note', 'system', 'update') NOT NULL DEFAULT 'system',
  timestamp_unix int NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS case_vitals (
  id varchar(191) PRIMARY KEY,
  case_id varchar(191) NOT NULL,
  bp varchar(32) NULL,
  hr int NULL,
  temp double NULL,
  rr int NULL,
  spo2 int NULL,
  gcs varchar(32) NULL,
  recorded_at_string varchar(191) NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_case_vitals_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS case_labs (
  id varchar(191) PRIMARY KEY,
  case_id varchar(191) NOT NULL,
  name varchar(191) NOT NULL,
  result varchar(191) NOT NULL,
  unit varchar(64) NOT NULL,
  ref_range varchar(191) NULL,
  status enum('normal', 'high', 'low', 'critical') NOT NULL DEFAULT 'normal',
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_case_labs_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS case_medications (
  id varchar(191) PRIMARY KEY,
  case_id varchar(191) NOT NULL,
  name varchar(191) NOT NULL,
  dose varchar(191) NOT NULL,
  freq varchar(191) NOT NULL,
  route varchar(191) NOT NULL,
  start_date varchar(191) NULL,
  category varchar(191) NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_case_medications_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS case_notes (
  id varchar(191) PRIMARY KEY,
  case_id varchar(191) NOT NULL,
  author_id varchar(191) NOT NULL,
  author_name varchar(191) NULL,
  author_role varchar(191) NULL,
  author_color varchar(32) NULL,
  body text NOT NULL,
  posted_time_string varchar(191) NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_case_notes_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS case_messages (
  id varchar(191) PRIMARY KEY,
  case_id varchar(191) NOT NULL,
  sender_id varchar(191) NULL,
  sender_name varchar(191) NULL,
  text text NOT NULL,
  timestamp_string varchar(191) NULL,
  is_self boolean NOT NULL DEFAULT false,
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_case_messages_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS case_team (
  id varchar(191) PRIMARY KEY,
  case_id varchar(191) NOT NULL,
  user_id varchar(191) NOT NULL,
  role enum('General Surgeon', 'Radiologist', 'Pulmonologist', 'Attending Physician', 'Consultant') NOT NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_case_team_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  CONSTRAINT fk_case_team_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS case_files (
  id varchar(191) PRIMARY KEY,
  case_id varchar(191) NOT NULL,
  uploaded_by_id varchar(191) NULL,
  file_name varchar(255) NOT NULL,
  file_type enum('image', 'document', 'dicom', 'csv', 'other') NOT NULL DEFAULT 'other',
  category enum('imaging', 'lab', 'report', 'medication', 'note', 'other') NOT NULL DEFAULT 'other',
  mime_type varchar(191) NULL,
  file_url text NULL,
  size_kb int NULL,
  description text NULL,
  is_previewable boolean NOT NULL DEFAULT false,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_case_files_case FOREIGN KEY (case_id) REFERENCES cases(id) ON DELETE CASCADE,
  CONSTRAINT fk_case_files_user FOREIGN KEY (uploaded_by_id) REFERENCES users(id) ON DELETE SET NULL
);
