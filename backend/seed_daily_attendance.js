const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function seedDailyAttendance() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const students = await Models.Student.find({});
    
    // Define Academic Windows
    const semConfigs = [
      { sem: 6, start: '2026-01-01', end: '2026-04-21' },
      { sem: 5, start: '2025-07-01', end: '2025-11-30' },
      { sem: 4, start: '2025-01-01', end: '2025-04-30' },
      { sem: 3, start: '2024-07-01', end: '2024-11-30' },
      { sem: 2, start: '2024-01-01', end: '2024-04-30' },
      { sem: 1, start: '2023-07-01', end: '2023-11-30' }
    ];

    for (const student of students) {
      const records = [];
      
      for (const config of semConfigs) {
        let currentDate = new Date(config.start);
        const endDate = new Date(config.end);

        while (currentDate <= endDate) {
          if (currentDate.getDay() !== 0) { // Skip Sundays
            const dateStr = currentDate.toISOString().split('T')[0];
            const hours = [];
            for (let h = 1; h <= 8; h++) {
              const status = Math.random() < 0.88 ? 'Present' : 'Absent';
              hours.push({ hour: h, status });
            }
            records.push({ date: dateStr, semester: config.sem, hours });
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      await Models.DailyAttendance.findOneAndUpdate(
        { regNumber: student.regNumber },
        { attendanceRecords: records },
        { upsert: true, new: true }
      );
      console.log(`Seeded multi-sem attendance for ${student.regNumber}`);
    }

    console.log('Daily attendance seeding complete!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedDailyAttendance();
