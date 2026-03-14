const mongoose = require('mongoose');
const Models = require('./database');

const regNumber = '231fa04g25';
const phone = '9876543210';

async function seedData() {
  try {
    // 1. Insert Student
    await Models.Student.findOneAndUpdate(
      { regNumber },
      { regNumber, parentPhone: phone, name: 'Rahul Sharma', branch: 'Computer Science and Engineering', semester: 6 },
      { upsert: true, new: true }
    );

    // 2. Insert Attendance
    await Models.Attendance.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        overallPercentage: 85.5,
        subjectWise: [
          { subject: 'Data Structures', attendance: 88 },
          { subject: 'Operating Systems', attendance: 76 },
          { subject: 'Computer Networks', attendance: 92 }
        ],
        semesterWise: [
          { semester: 1, attendance: 90 },
          { semester: 2, attendance: 85 },
          { semester: 3, attendance: 88 }
        ],
        lowAttendanceAlerts: ['Low attendance in Operating Systems (76%) - Minimum required 75%']
      },
      { upsert: true, new: true }
    );

    // 3. Insert Academic Status
    await Models.AcademicStatus.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        numberOfBacklogs: 1,
        repeatedSubjects: ['Engineering Mathematics II'],
        incompleteSubjects: [],
        courseCompletionStatus: 'In Progress'
      },
      { upsert: true, new: true }
    );

    // 4. Insert Academic Performance
    await Models.AcademicPerformance.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        currentCGPA: 8.2,
        yearWiseCGPA: [{ year: 1, cgpa: 8.5 }, { year: 2, cgpa: 7.9 }, { year: 3, cgpa: 8.2 }],
        semesterWiseCGPA: [
          { semester: 1, sgpa: 8.6 }, { semester: 2, sgpa: 8.4 }, 
          { semester: 3, sgpa: 7.8 }, { semester: 4, sgpa: 8.0 }, 
          { semester: 5, sgpa: 8.2 }
        ],
        subjectWiseMarks: [
          { subject: 'Data Structures', grade: 'A', marks: 85 },
          { subject: 'Operating Systems', grade: 'B', marks: 72 },
          { subject: 'Computer Networks', grade: 'O', marks: 95 }
        ]
      },
      { upsert: true, new: true }
    );

    // 5. Insert Notifications
    await Models.Notification.deleteMany({ regNumber });
    await Models.Notification.create({
      regNumber,
      upcomingExams: ['Mid-term OS exam on Oct 15'],
      assignmentDeadlines: ['DSA Assignment 3 due on Oct 10'],
      academicCalendarUpdates: ['Diwali break from Oct 22 to Oct 26']
    });

    // 6. Insert Financials
    await Models.Financial.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        feePaymentStatus: 'Pending',
        pendingFees: 25000,
        paymentHistory: [
          { date: '2023-01-15', amount: 50000, receipt: 'REC-12345' },
          { date: '2023-07-20', amount: 50000, receipt: 'REC-67890' }
        ],
        scholarshipStatus: 'Merit Scholarship (20%)'
      },
      { upsert: true, new: true }
    );

    // 7. Insert Communication
    await Models.Communication.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        facultyContact: [
          { role: 'OS Professor', name: 'Dr. Vivek Singh', email: 'vivek.s@college.edu' },
          { role: 'DSA Professor', name: 'Dr. Anita Desai', email: 'anita.d@college.edu' }
        ],
        classAdvisor: { name: 'Prof. Ramesh Kumar', email: 'ramesh.k@college.edu', phone: '9876500001' },
        academicOfficeContacts: [
          { department: 'Accounts', email: 'accounts@college.edu' },
          { department: 'Registrar', email: 'registrar@college.edu' }
        ]
      },
      { upsert: true, new: true }
    );

    // 8. Insert Insights
    await Models.Insight.findOneAndUpdate(
      { regNumber },
      {
        regNumber,
        strongSubjects: ['Computer Networks', 'Data Structures'],
        weakSubjects: ['Operating Systems'],
        improvementSuggestions: [
          'Consider attending remedial classes for Operating Systems.',
          'Solve last 5 years question papers for OS to clear concepts.'
        ]
      },
      { upsert: true, new: true }
    );

    console.log('Dummy data inserted successfully into MongoDB!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.connection.close();
  }
}

// Ensure the database connects before seeding
mongoose.connection.once('open', () => {
  seedData();
});
