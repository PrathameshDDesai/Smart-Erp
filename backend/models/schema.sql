-- Core Users Table (Handling RBAC)
CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK(role IN ('ADMIN', 'FACULTY', 'STUDENT')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Departments
CREATE TABLE IF NOT EXISTS Departments (
    dept_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL
);

-- Students Table
CREATE TABLE IF NOT EXISTS Students (
    prn VARCHAR(20) PRIMARY KEY,
    user_id INTEGER,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    dept_id INTEGER,
    semester INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES Departments(dept_id) ON DELETE SET NULL
);

-- Faculty Table
CREATE TABLE IF NOT EXISTS Faculty (
    faculty_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    dept_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (dept_id) REFERENCES Departments(dept_id) ON DELETE SET NULL
);

-- Subjects Table
CREATE TABLE IF NOT EXISTS Subjects (
    subject_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    dept_id INTEGER,
    semester INTEGER,
    credits INTEGER,
    FOREIGN KEY (dept_id) REFERENCES Departments(dept_id) ON DELETE CASCADE
);

-- Teacher_Subject Mapping Table (NEW)
CREATE TABLE IF NOT EXISTS Teacher_Subject (
    faculty_id INTEGER,
    subject_id INTEGER,
    PRIMARY KEY (faculty_id, subject_id),
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id) ON DELETE CASCADE
);

-- Attendance Table
CREATE TABLE IF NOT EXISTS Attendance (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    prn VARCHAR(20),
    subject_id INTEGER,
    faculty_id INTEGER,
    date DATE,
    status VARCHAR(10) CHECK(status IN ('PRESENT', 'ABSENT')),
    FOREIGN KEY (prn) REFERENCES Students(prn) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id) ON DELETE CASCADE,
    FOREIGN KEY (faculty_id) REFERENCES Faculty(faculty_id) ON DELETE CASCADE
);

-- Marks Table
CREATE TABLE IF NOT EXISTS Marks (
    mark_id INTEGER PRIMARY KEY AUTOINCREMENT,
    prn VARCHAR(20),
    subject_id INTEGER,
    exam_type VARCHAR(20) CHECK(exam_type IN ('CIA', 'SEMESTER', 'PRACTICAL')),
    score DECIMAL(5,2),
    total DECIMAL(5,2),
    FOREIGN KEY (prn) REFERENCES Students(prn) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES Subjects(subject_id) ON DELETE CASCADE
);

-- Fees Table
CREATE TABLE IF NOT EXISTS Fees (
    fee_id INTEGER PRIMARY KEY AUTOINCREMENT,
    prn VARCHAR(20),
    amount DECIMAL(10,2),
    due_date DATE,
    status VARCHAR(10) CHECK(status IN ('PAID', 'PENDING')),
    FOREIGN KEY (prn) REFERENCES Students(prn) ON DELETE CASCADE
);
