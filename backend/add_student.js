const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

const semesterSubjects = {
  1: ['Math-I', 'English', 'Physics', 'Programming', 'Discrete'],
  2: ['Mathematics II', 'Physics II', 'Data Structures', 'Basic Electrical', 'Environmental Science'],
  3: ['DBMS', 'Discrete Math', 'DLD', 'Web Technologies', 'Software Engineering'],
  4: ['Algorithms', 'Operating Systems', 'Computer Networks', 'Automata Theory', 'Microprocessors'],
  5: ['Machine Learning', 'Compiler Design', 'Cyber Security', 'Cloud Computing', 'Data Analytics'],
  6: ['Machine Learning', 'Big Data', 'Cloud Computing', 'Cyber Security', 'Training Session']
};

async function addStudent() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const regNumber = '231FA04867';
    const phone = '8688611404';
    const name = 'Akash Bandaru';
    const email = 'akash.bandaru@college.edu';
    const branch = 'CSE';
    const semester = 6;

    // Generate top class details
    // CGPA 9.45, Attendance 92.4%
    const studentAttendance = 92.4;
    const studentCgpa = 9.45;

    // Subjects and marks generation
    const subjectsList = [];
    const semCGPA = [
      { semester: 1, sgpa: 9.20 },
      { semester: 2, sgpa: 9.40 },
      { semester: 3, sgpa: 9.50 },
      { semester: 4, sgpa: 9.60 },
      { semester: 5, sgpa: 9.30 },
      { semester: 6, sgpa: 9.70 }
    ];

    for (let sem = 1; sem <= 6; sem++) {
      const subs = semesterSubjects[sem];
      subs.forEach(sub => {
        // High marks and high attendance for top class details
        const att = Math.floor(Math.random() * 8) + 90; // 90 to 98
        const marks = Math.floor(Math.random() * 10) + 90; // 90 to 100
        let grade = 'A';
        if (marks >= 95) grade = 'O';
        else if (marks >= 85) grade = 'A';

        subjectsList.push({
          subject: sub,
          semester: sem,
          attendance: att,
          marks: marks,
          grade: grade,
          internalMarks: Math.floor(marks * 0.3),
          externalMarks: Math.floor(marks * 0.7)
        });
      });
    }

    // 1. Student Profile
    await Models.Student.findOneAndUpdate(
      { regNumber: new RegExp('^' + regNumber.trim() + '$', 'i') },
      {
        regNumber,
        phone,
        name,
        branch,
        semester,
        email,
        attendance: studentAttendance,
        cgpa: studentCgpa,
        fees: 0, // Fully Paid
        backlogs: 0,
        parentName: 'Mr. Bandaru',
        parentPhone: phone
      },
      { upsert: true, new: true }
    );
    console.log('1. Upserted Student Profile');

    // 2. Attendance Summary
    await Models.Attendance.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        overallPercentage: studentAttendance,
        subjectWise: subjectsList.map(s => ({ subject: s.subject, attendance: s.attendance, semester: s.semester })),
        semesterWise: semCGPA.map(s => ({ semester: s.semester, attendance: 90 + Math.random() * 8 })),
        lowAttendanceAlerts: []
      },
      { upsert: true, new: true }
    );
    console.log('2. Upserted Attendance Summary');

    // 3. Academic Status
    await Models.AcademicStatus.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        numberOfBacklogs: 0,
        backlogSubjects: [],
        repeatedSubjects: [],
        incompleteSubjects: [],
        courseCompletionStatus: 'In Progress'
      },
      { upsert: true, new: true }
    );
    console.log('3. Upserted Academic Status');

    // 4. Academic Performance
    await Models.AcademicPerformance.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        currentCGPA: studentCgpa,
        yearWiseCGPA: [
          { year: 1, cgpa: 9.30 },
          { year: 2, cgpa: 9.55 },
          { year: 3, cgpa: 9.50 }
        ],
        semesterWiseCGPA: semCGPA,
        subjectWiseMarks: subjectsList.map(s => ({
          subject: s.subject,
          grade: s.grade,
          marks: s.marks,
          semester: s.semester,
          internalMarks: s.internalMarks,
          externalMarks: s.externalMarks
        }))
      },
      { upsert: true, new: true }
    );
    console.log('4. Upserted Academic Performance');

    // 5. Daily Attendance
    const dailyRecords = [];
    const semConfigs = [
      { sem: 6, start: '2026-01-01', end: '2026-04-21' },
      { sem: 5, start: '2025-07-01', end: '2025-11-30' },
      { sem: 4, start: '2025-01-01', end: '2025-04-30' },
      { sem: 3, start: '2024-07-01', end: '2024-11-30' },
      { sem: 2, start: '2024-01-01', end: '2024-04-30' },
      { sem: 1, start: '2023-07-01', end: '2023-11-30' }
    ];

    for (const config of semConfigs) {
      let currentDate = new Date(config.start);
      const endDate = new Date(config.end);

      while (currentDate <= endDate) {
        if (currentDate.getDay() !== 0) { // Skip Sundays
          const dateStr = currentDate.toISOString().split('T')[0];
          const hours = [];
          for (let h = 1; h <= 8; h++) {
            const status = Math.random() < 0.95 ? 'Present' : 'Absent'; // 95% present
            hours.push({ hour: h, status });
          }
          dailyRecords.push({ date: dateStr, semester: config.sem, hours });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    await Models.DailyAttendance.findOneAndUpdate(
      { regNumber },
      { attendanceRecords: dailyRecords },
      { upsert: true, new: true }
    );
    console.log('5. Upserted Daily Attendance');

    // 6. Notifications
    await Models.Notification.deleteMany({ regNumber });
    await Models.Notification.create({
      regNumber,
      upcomingExams: ['Final exam for ML on June 15', 'Final Project Presentation on June 20'],
      assignmentDeadlines: ['Advanced Big Data analytics assignment due in 5 days'],
      academicCalendarUpdates: ['End semester examinations begin June 10']
    });
    console.log('6. Created Notifications');

    // 7. Financials (Fully Paid)
    await Models.Financial.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        feePaymentStatus: 'Paid',
        pendingFees: 0,
        totalFees: 330000,
        lastPaymentSemester: 6,
        semesterWiseFees: [
          { semester: 1, total: 55000, paid: 55000, pending: 0, status: 'Paid', lastPaymentDate: '2023-01-10' },
          { semester: 2, total: 55000, paid: 55000, pending: 0, status: 'Paid', lastPaymentDate: '2023-06-12' },
          { semester: 3, total: 55000, paid: 55000, pending: 0, status: 'Paid', lastPaymentDate: '2024-01-15' },
          { semester: 4, total: 55000, paid: 55000, pending: 0, status: 'Paid', lastPaymentDate: '2024-07-20' },
          { semester: 5, total: 55000, paid: 55000, pending: 0, status: 'Paid', lastPaymentDate: '2025-01-05' },
          { semester: 6, total: 55000, paid: 55000, pending: 0, status: 'Paid', lastPaymentDate: '2025-08-22' }
        ],
        paymentHistory: [
          { date: '2023-01-10', amount: 55000, receipt: 'REC-A01', semester: 1, method: 'Bank Transfer' },
          { date: '2023-06-12', amount: 55000, receipt: 'REC-A02', semester: 2, method: 'Online' },
          { date: '2024-01-15', amount: 55000, receipt: 'REC-A03', semester: 3, method: 'Card' },
          { date: '2024-07-20', amount: 55000, receipt: 'REC-A04', semester: 4, method: 'Online' },
          { date: '2025-01-05', amount: 55000, receipt: 'REC-A05', semester: 5, method: 'Online' },
          { date: '2025-08-22', amount: 55000, receipt: 'REC-A06', semester: 6, method: 'Bank Transfer' }
        ],
        scholarshipStatus: 'Merit Scholarship (100% tuition waiver)'
      },
      { upsert: true, new: true }
    );
    console.log('7. Upserted Financials');

    // 8. Communication
    await Models.Communication.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        facultyContact: [
          { role: 'Professor (ML)', name: 'Dr. Emily Watson', email: 'e.watson@university.edu' },
          { role: 'Professor (Big Data)', name: 'Dr. Alan Turing', email: 'a.turing@university.edu' }
        ],
        classAdvisor: { name: 'Prof. Johnson', email: 'johnson@college.edu', phone: '9000000000' },
        academicOfficeContacts: [{ department: 'Academic Section', email: 'academics@college.edu' }]
      },
      { upsert: true, new: true }
    );
    console.log('8. Upserted Communication');

    // 9. Insight
    await Models.Insight.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        strongSubjects: ['Machine Learning', 'Big Data', 'Cloud Computing'],
        weakSubjects: [],
        improvementSuggestions: ['Excellent academic standing. Focus on publishing research papers and undertaking advanced projects.']
      },
      { upsert: true, new: true }
    );
    console.log('9. Upserted Insights');

    // 10. IntraSemesterMarks
    const subjects = ["SE", "PADCOM", "CNS", "CLSA", "IIC", "SE Lab", "CNS-L", "ADS Lab", "QALR", "ADS", "MIH&IC", "IDP-II", "library", "Counseling", "TRg"];
    const examNames = [
      "Module1-PreT1 R22 : 1", "Module2-PreT1 R22 : 1", "Module1-T1 R22 : 1", "Module2-T1 R22 : 1",
      "Module1-T2 Review 1 R22 : 1", "Module1-T2 Review 2 R22 : 1", "Module2-T2 Review 1 R22 : 1", "Module2-T2 Review 2 R22 : 1",
      "Module1-T3 IEEE / APA Format R22 : 1", "Module1-T3 A Voice in-built Presentation R22 : 1",
      "Module2-T3 Voice in-built Presentation R22 : 1", "Module2-T3 IEEE / APA Format R22 : 1",
      "Module1-T4 R22 : 1", "Module2-T4 R22 : 1",
      "Module1-T5 Assignment /CLA R22 : 1", "Module1-T5 Assignment /CLA R22 : 2",
      "Module1-T5 Assignment /CLA R22 : 3", "Module1-T5 Assignment /CLA R22 : 4"
    ];

    const exams = examNames.map(name => {
      return {
        title: name,
        marks: subjects.map(() => Math.floor(Math.random() * 4) + 17) // Top tier internal marks (17-20)
      };
    });

    await Models.IntraSemesterMarks.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        subjects,
        exams
      },
      { upsert: true, new: true }
    );
    console.log('10. Upserted Intra Semester Marks');

    console.log(`\n🎉 Success! Akash Bandaru (${regNumber}) has been added to the database with top class details.`);
  } catch (err) {
    console.error('Error seeding student:', err);
  } finally {
    mongoose.connection.close();
  }
}

addStudent();
