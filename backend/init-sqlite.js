const db = require('./config/db');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

async function seed() {
    try {
        console.log("Starting SQLite DB initialization...");
        const conn = await db.getConnection(); // SQLite wrapper handles this

        // 1. Execute schema.sql
        const schemaPath = path.join(__dirname, 'models', 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        
        // Split by semicolon because node-sqlite might struggle with multiple statements in a single run() sometimes, 
        // but let's try dropping them first just in case
        console.log("Executing Schema...");
        const statements = schemaSql.split(';').filter(stmt => stmt.trim());
        for (let stmt of statements) {
             await conn.execute(stmt);
        }

        console.log("Checking if data already exists...");
        const [users] = await conn.execute("SELECT count(*) as count FROM Users");
        if (users[0].count > 0) {
            console.log("Data already seeded! Skipping.");
            process.exit(0);
        }

        console.log("Seeding Database...");
        
        // Departments
        const depts = [
            'Computer Science',
            'Information Technology',
            'Mechanical Engineering'
        ];
        
        for (let d of depts) {
            await conn.execute("INSERT INTO Departments (name) VALUES (?)", [d]);
        }

        // Passwords
        const adminHash = await bcrypt.hash('admin123', 10);
        const facultyHash = await bcrypt.hash('faculty123', 10);
        const studentHash = await bcrypt.hash('student123', 10);

        // 1 Admin
        await conn.execute("INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)", ['admin@erp.com', adminHash, 'ADMIN']);

        // 5 Teachers
        const teachers = [
            { first: 'Ramesh', last: 'Sharma', email: 'prof.sharma@erp.com', dept: 1 },
            { first: 'Anita', last: 'Mehta', email: 'prof.mehta@erp.com', dept: 2 },
            { first: 'John', last: 'Doe', email: 'johndoe@erp.com', dept: 1 },
            { first: 'Jane', last: 'Smith', email: 'janesmith@erp.com', dept: 3 },
            { first: 'Vikram', last: 'Singh', email: 'vikram@erp.com', dept: 2 }
        ];

        let facultyIdMap = {};
        for (let [i, t] of teachers.entries()) {
            const [uRes] = await conn.execute("INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)", [t.email, facultyHash, 'FACULTY']);
            const userId = uRes.insertId;
            const [fRes] = await conn.execute("INSERT INTO Faculty (user_id, first_name, last_name, dept_id) VALUES (?, ?, ?, ?)", [userId, t.first, t.last, t.dept]);
            facultyIdMap[i+1] = fRes.insertId;
        }

        // Subjects (2 per department = 6 subjects)
        const subjects = [
            { name: 'Data Structures', dept: 1, sem: 4 },
            { name: 'Operating Systems', dept: 1, sem: 5 },
            { name: 'Web Development', dept: 2, sem: 4 },
            { name: 'Cloud Computing', dept: 2, sem: 6 },
            { name: 'Thermodynamics', dept: 3, sem: 3 },
            { name: 'Fluid Mechanics', dept: 3, sem: 4 },
        ];
        
        let subjectIdMap = {};
        for (let [i, s] of subjects.entries()) {
            const [sRes] = await conn.execute("INSERT INTO Subjects (name, dept_id, semester, credits) VALUES (?, ?, ?, 4)", [s.name, s.dept, s.sem]);
            subjectIdMap[i+1] = sRes.insertId;
        }

        // Teacher_Subject mappings
        await conn.execute("INSERT INTO Teacher_Subject (faculty_id, subject_id) VALUES (?, ?)", [1, 1]); // Sharma -> OS
        await conn.execute("INSERT INTO Teacher_Subject (faculty_id, subject_id) VALUES (?, ?)", [1, 2]); // Sharma -> OS
        await conn.execute("INSERT INTO Teacher_Subject (faculty_id, subject_id) VALUES (?, ?)", [2, 3]); // Mehta -> Web Dev
        await conn.execute("INSERT INTO Teacher_Subject (faculty_id, subject_id) VALUES (?, ?)", [3, 1]); 
        await conn.execute("INSERT INTO Teacher_Subject (faculty_id, subject_id) VALUES (?, ?)", [4, 5]); 
        await conn.execute("INSERT INTO Teacher_Subject (faculty_id, subject_id) VALUES (?, ?)", [4, 6]); 
        await conn.execute("INSERT INTO Teacher_Subject (faculty_id, subject_id) VALUES (?, ?)", [5, 4]); 

        // 20 Students
        const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Ananya', 'Diya', 'Avni', 'Kavya', 'Sanya', 'Riya', 'Aarohi', 'Neha', 'Pooja', 'Sneha'];
        const lastNames = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Das', 'Sen', 'Gupta', 'Verma', 'Reddy', 'Rao', 'Nair', 'Pillai', 'Menon', 'Bose', 'Basu', 'Datta', 'Ghosh', 'Saha', 'Mukherjee', 'Banerjee'];
        
        // Insert Ritu Patel for the specific login they like using
        const [uRes0] = await conn.execute("INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)", ['ritu.patel@erp.com', studentHash, 'STUDENT']);
        await conn.execute("INSERT INTO Students (prn, user_id, first_name, last_name, dept_id, semester) VALUES (?, ?, ?, ?, ?, ?)", ['PRN000', uRes0.insertId, 'Ritu', 'Patel', 1, 4]);

        for (let i = 1; i <= 19; i++) {
            const fname = firstNames[i];
            const lname = lastNames[i];
            const dept = (i % 3) + 1; // Round-robin dept 1,2,3
            const sem = (i % 8) + 1;
            const email = `${fname.toLowerCase()}.${lname.toLowerCase()}${i}@erp.com`;
            const prn = `PRN${i.toString().padStart(3, '0')}`;
            
            const [uRes] = await conn.execute("INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)", [email, studentHash, 'STUDENT']);
            await conn.execute("INSERT INTO Students (prn, user_id, first_name, last_name, dept_id, semester) VALUES (?, ?, ?, ?, ?, ?)", [prn, uRes.insertId, fname, lname, dept, sem]);

            // Add fees
            await conn.execute("INSERT INTO Fees (prn, amount, due_date, status) VALUES (?, ?, ?, ?)", [prn, 50000, '2026-06-30', i % 2 === 0 ? 'PAID' : 'PENDING']);
            
            // Generate some random attendance and marks for Computer Science students (dept 1)
            if (dept === 1) {
                // OS Attendance (subject 2, faculty 1)
                await conn.execute("INSERT INTO Attendance (prn, subject_id, faculty_id, date, status) VALUES (?, ?, ?, ?, ?)", [prn, 2, 1, '2026-04-10', 'PRESENT']);
                await conn.execute("INSERT INTO Attendance (prn, subject_id, faculty_id, date, status) VALUES (?, ?, ?, ?, ?)", [prn, 2, 1, '2026-04-11', i % 4 === 0 ? 'ABSENT' : 'PRESENT']);
                
                // OS Marks
                await conn.execute("INSERT INTO Marks (prn, subject_id, exam_type, score, total) VALUES (?, ?, ?, ?, ?)", [prn, 2, 'CIA', Math.floor(Math.random() * 20), 20]);
            }
        }
        
        // Ensure PRN000 (Ritu) has fees, attendance and marks in dept 1
        await conn.execute("INSERT INTO Fees (prn, amount, due_date, status) VALUES (?, ?, ?, ?)", ['PRN000', 50000, '2026-06-30', 'PENDING']);
        await conn.execute("INSERT INTO Attendance (prn, subject_id, faculty_id, date, status) VALUES (?, ?, ?, ?, ?)", ['PRN000', 1, 1, '2026-04-10', 'PRESENT']);
        await conn.execute("INSERT INTO Attendance (prn, subject_id, faculty_id, date, status) VALUES (?, ?, ?, ?, ?)", ['PRN000', 1, 1, '2026-04-11', 'PRESENT']);
        await conn.execute("INSERT INTO Marks (prn, subject_id, exam_type, score, total) VALUES (?, ?, ?, ?, ?)", ['PRN000', 1, 'CIA', 18, 20]);
        await conn.execute("INSERT INTO Marks (prn, subject_id, exam_type, score, total) VALUES (?, ?, ?, ?, ?)", ['PRN000', 1, 'SEMESTER', 85, 100]);

        console.log("Seeding complete!");
        process.exit(0);

    } catch(err) {
        console.error("Setup Error:", err);
        process.exit(1);
    }
}

seed();
