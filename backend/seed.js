const mongoose = require('mongoose');
const Models = require('./database');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const path = require('path');

const semesterSubjects = {
  1: ['Math-I', 'English', 'Physics', 'Programming', 'Discrete'],
  2: ['Mathematics II', 'Physics II', 'Data Structures', 'Basic Electrical', 'Environmental Science'],
  3: ['DBMS', 'Discrete Math', 'DLD', 'Web Technologies', 'Software Engineering'],
  4: ['Algorithms', 'Operating Systems', 'Computer Networks', 'Automata Theory', 'Microprocessors'],
  5: ['Machine Learning', 'Compiler Design', 'Cyber Security', 'Cloud Computing', 'Data Analytics'],
  6: ['Machine Learning', 'Big Data', 'Cloud Computing', 'Cyber Security', 'Training Session']
};

async function seedData() {
  try {
    const workbook = xlsx.readFile(path.join(__dirname, '../../Student_Profile_System.xlsx'));

    const profileData = xlsx.utils.sheet_to_json(workbook.Sheets['Student_Profile']);
    const financeData = xlsx.utils.sheet_to_json(workbook.Sheets['Finance']);
    const backlogsData = xlsx.utils.sheet_to_json(workbook.Sheets['Backlogs']);
    const marksData = xlsx.utils.sheet_to_json(workbook.Sheets['Internal_Marks']);
    const academicsData = xlsx.utils.sheet_to_json(workbook.Sheets['Academics']);
    const attendanceData = xlsx.utils.sheet_to_json(workbook.Sheets['Attendance']);

    const studentsMap = {};

    profileData.forEach(row => {
      studentsMap[row.registerno] = {
        regNumber: row.registerno,
        phone: row.ParentPhone?.toString(),
        name: row.name,
        branch: row.Branch,
        semester: 6, // Forced to 6 as requested
        email: row.studentmailid,
        attendance: 0,
        subjects: [],
        semCGPA: [],
        fees: 0,
        backlogs: 0,
        repeatedSubjects: []
      };
    });

    financeData.forEach(row => {
      if (studentsMap[row.registerno]) {
        studentsMap[row.registerno].fees = row.PendingAmount || 0;
      }
    });

    backlogsData.forEach(row => {
      if (studentsMap[row.registerno]) {
        studentsMap[row.registerno].backlogs = row.TotalBacklogs || 0;
        if (row.Subjects) {
          studentsMap[row.registerno].repeatedSubjects = row.Subjects.split(',').map(s => s.trim());
        }
      }
    });

    // Populate students with 6 semesters and 5 subjects each
    for (const reg in studentsMap) {
      let overallAttendanceSum = 0;
      let totalSubjects = 0;
      const student = studentsMap[reg];

      for (let sem = 1; sem <= 6; sem++) {
        let semSgpaSum = 0;
        const subs = semesterSubjects[sem];

        subs.forEach(sub => {
          // generate random marks and attendance
          const att = Math.floor(Math.random() * 30) + 70; // 70 to 99
          const marks = Math.floor(Math.random() * 40) + 60; // 60 to 99
          let grade = 'C';
          if (marks >= 90) grade = 'O';
          else if (marks >= 80) grade = 'A';
          else if (marks >= 70) grade = 'B';

          student.subjects.push({
            subject: sub,
            semester: sem,
            attendance: att,
            marks: marks,
            grade: grade,
            m1: Math.floor(marks * 0.4),
            m2: Math.floor(marks * 0.4)
          });

          semSgpaSum += (marks / 10);
          overallAttendanceSum += att;
          totalSubjects++;
        });

        student.semCGPA.push({
          semester: sem,
          sgpa: parseFloat((semSgpaSum / 5).toFixed(2))
        });
      }

      student.attendance = totalSubjects > 0 ? parseFloat((overallAttendanceSum / totalSubjects).toFixed(2)) : 80;
    }

    const studentsData = Object.values(studentsMap);

    for (const data of studentsData) {
      const { regNumber, phone, name, branch, semester } = data;

      let currentCGPA = 0;
      if (data.semCGPA.length > 0) {
        currentCGPA = (data.semCGPA.reduce((acc, curr) => acc + curr.sgpa, 0) / data.semCGPA.length).toFixed(2);
      }

      await Models.Student.findOneAndUpdate(
        { regNumber },
        {
          regNumber,
          phone: phone || '0000000000',
          name: name || 'Unknown',
          branch: branch || 'General',
          semester: semester || 1,
          email: data.email || `${regNumber}@example.com`,
          attendance: data.attendance || 0,
          cgpa: currentCGPA || 0,
          fees: data.fees || 0,
          backlogs: data.backlogs || 0
        },
        { upsert: true, new: true }
      );

      await Models.Attendance.findOneAndUpdate(
        { regNumber },
        {
          regNumber,
          overallPercentage: data.attendance || 0,
          subjectWise: data.subjects.map(s => ({ subject: s.subject, attendance: s.attendance })),
          semesterWise: data.semCGPA.map(s => ({ semester: s.semester, attendance: 80 + Math.random() * 15 })),
          lowAttendanceAlerts: data.attendance < 75 ? [`Low overall attendance: ${data.attendance || 0}%`] : []
        },
        { upsert: true, new: true }
      );

      // Generate detailed backlog records
      const pendingBacklogs = [];
      if (data.backlogs > 0) {
        const totalBacklogs = data.backlogs;
        for (let i = 0; i < totalBacklogs; i++) {
          // Identify a random previous semester and a subject from it
          const randomSem = Math.floor(Math.random() * (semester > 1 ? semester - 1 : 1)) + 1;
          const subjectsInSem = semesterSubjects[randomSem] || semesterSubjects[1];
          const randomSub = subjectsInSem[Math.floor(Math.random() * subjectsInSem.length)];
          
          // Ensure the semester recorded matches where the subject actually belongs
          let actualSubSem = randomSem;
          for (const [sem, subs] of Object.entries(semesterSubjects)) {
            if (subs.includes(randomSub)) {
              actualSubSem = parseInt(sem);
              break;
            }
          }

          // If a student has a backlog in this subject, set their marks to a failing grade
          const subjToUpdate = data.subjects.find(s => s.subject === randomSub);
          if (subjToUpdate) {
            subjToUpdate.internalMarks = Math.floor(Math.random() * 10) + 5; // 5 - 15
            subjToUpdate.externalMarks = Math.floor(Math.random() * 15) + 5; // 5 - 20
            subjToUpdate.marks = subjToUpdate.internalMarks + subjToUpdate.externalMarks;
            subjToUpdate.grade = 'F';
          }

          pendingBacklogs.push({
             subjectName: randomSub,
             semester: actualSubSem,
             status: 'Pending',
             nextReattemptDate: 'Aug 2026'
          });
        }
      }

      const repeatedDetailed = (data.repeatedSubjects || []).map(subName => ({
        subjectName: subName,
        attemptCount: 2,
        nextExam: 'May 2026'
      }));

      await Models.AcademicStatus.findOneAndUpdate(
        { regNumber },
        {
          regNumber,
          numberOfBacklogs: data.backlogs,
          backlogSubjects: pendingBacklogs,
          repeatedSubjects: repeatedDetailed,
          incompleteSubjects: [],
          courseCompletionStatus: semester >= 6 ? 'Completed' : 'In Progress'
        },
        { upsert: true, new: true }
      );

      await Models.AcademicPerformance.findOneAndUpdate(
        { regNumber },
        {
          regNumber,
          currentCGPA,
          yearWiseCGPA: [
            { year: 1, cgpa: ((data.semCGPA[0].sgpa + data.semCGPA[1].sgpa) / 2).toFixed(2) },
            { year: 2, cgpa: ((data.semCGPA[2].sgpa + data.semCGPA[3].sgpa) / 2).toFixed(2) },
            { year: 3, cgpa: ((data.semCGPA[4].sgpa + data.semCGPA[5].sgpa) / 2).toFixed(2) }
          ],
          semesterWiseCGPA: data.semCGPA,
          subjectWiseMarks: data.subjects.map(s => ({
            subject: s.subject,
            grade: s.grade,
            marks: s.marks,
            semester: s.semester,
            internalMarks: s.internalMarks || Math.floor(s.marks * 0.3),
            externalMarks: s.externalMarks || Math.floor(s.marks * 0.7)
          }))
        },
        { upsert: true, new: true }
      );

      await Models.Notification.deleteMany({ regNumber });
      if (data.subjects.length > 0) {
        await Models.Notification.create({
          regNumber,
          upcomingExams: [`Final exam for ${data.subjects[0].subject} on Dec 20`],
          assignmentDeadlines: data.subjects.length > 1 ? [`Assignment for ${data.subjects[1].subject} due in 3 days`] : [],
          academicCalendarUpdates: ['Winter vacation starts from Dec 25']
        });
      }

      await Models.Financial.findOneAndUpdate(
        { regNumber },
        {
          regNumber,
          feePaymentStatus: data.fees > 0 ? 'Pending' : 'Paid',
          pendingFees: data.fees,
          totalFees: 330000,
          lastPaymentSemester: 6,
          semesterWiseFees: [
            { semester: 1, total: 55000, paid: 55000, pending: 0, status: 'Paid', lastPaymentDate: '2023-01-10' },
            { semester: 2, total: 55000, paid: 55000, pending: 0, status: 'Paid', lastPaymentDate: '2023-06-12' },
            { semester: 3, total: 55000, paid: 55000, pending: 0, status: 'Paid', lastPaymentDate: '2024-01-15' },
            { semester: 4, total: 55000, paid: 40000, pending: 15000, status: 'Pending', lastPaymentDate: '2024-07-20' },
            { semester: 5, total: 55000, paid: 55000, pending: 0, status: 'Paid', lastPaymentDate: '2025-01-05' },
            { semester: 6, total: 55000, paid: 55000, pending: 0, status: 'Paid', lastPaymentDate: '2025-08-22' }
          ],
          paymentHistory: [
            { date: '2023-01-10', amount: 55000, receipt: 'REC-101', semester: 1, method: 'Bank Transfer' },
            { date: '2023-06-12', amount: 55000, receipt: 'REC-202', semester: 2, method: 'Online' },
            { date: '2024-01-15', amount: 55000, receipt: 'REC-303', semester: 3, method: 'Card' },
            { date: '2024-07-20', amount: 40000, receipt: 'REC-404', semester: 4, method: 'Online' }
          ],
          scholarshipStatus: 'General'
        },
        { upsert: true, new: true }
      );

      await Models.Communication.findOneAndUpdate(
        { regNumber },
        {
          regNumber,
          facultyContact: [{ role: 'Professor', name: 'Dr. Smith', email: 'smith@college.edu' }],
          classAdvisor: { name: 'Prof. Johnson', email: 'johnson@college.edu', phone: '9000000000' },
          academicOfficeContacts: [{ department: 'Admin', email: 'admin@college.edu' }]
        },
        { upsert: true, new: true }
      );

      await Models.Insight.findOneAndUpdate(
        { regNumber },
        {
          regNumber,
          strongSubjects: data.subjects.length > 0 ? [data.subjects[0].subject] : [],
          weakSubjects: data.backlogs > 0 && data.subjects.length > 1 ? [data.subjects[1].subject] : [],
          improvementSuggestions: ['Keep up the consistent effort!']
        },
        { upsert: true, new: true }
      );

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
          marks: subjects.map(() => {
            if (Math.random() < 0.3) return "-";
            return Math.floor(Math.random() * 20) + 5;
          })
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
    }

    const adminEmail = 'admin@college.edu';
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await Models.Admin.findOneAndUpdate(
      { email: adminEmail },
      { email: adminEmail, password: hashedPassword, name: 'System Admin' },
      { upsert: true, new: true }
    );

    console.log(`Successfully seeded ${studentsData.length} student records and 1 Admin into MongoDB!`);
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.connection.close();
  }
}

mongoose.connection.once('open', () => {
  console.log("Connected to DB, running seed data...");
  seedData();
});
