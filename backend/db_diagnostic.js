const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function diagnose() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully!');

    const studentCount = await Models.Student.countDocuments();
    const attendanceCount = await Models.Attendance.countDocuments();
    const academicStatusCount = await Models.AcademicStatus.countDocuments();
    const performanceCount = await Models.AcademicPerformance.countDocuments();
    const financialCount = await Models.Financial.countDocuments();
    const intraMarksCount = await Models.IntraSemesterMarks.countDocuments();
    const dailyAttendanceCount = await Models.DailyAttendance.countDocuments();
    const adminCount = await Models.Admin.countDocuments();

    console.log('\n--- DATABASE STATS ---');
    console.log(`Students: ${studentCount}`);
    console.log(`Attendance Records: ${attendanceCount}`);
    console.log(`Academic Status Records: ${academicStatusCount}`);
    console.log(`Academic Performance Records: ${performanceCount}`);
    console.log(`Financial Records: ${financialCount}`);
    console.log(`Intra Semester Marks: ${intraMarksCount}`);
    console.log(`Daily Attendance Records: ${dailyAttendanceCount}`);
    console.log(`Admins: ${adminCount}`);
    console.log('----------------------\n');

    if (studentCount > 0) {
      const sample = await Models.Student.find().limit(3).lean();
      console.log('Sample Students in Database:');
      sample.forEach(s => console.log(` - ${s.name} (${s.regNumber})`));
    } else {
      console.log('No student records found. You need to run seed.js!');
    }

  } catch (error) {
    console.error('Database connection failed:', error.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}
diagnose();
