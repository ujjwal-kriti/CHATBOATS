const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function updateSubjectNames() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // Update Attendance collection
    const attendanceRecords = await Models.Attendance.find({ "subjectWise.subject": { $in: ["DevOps", "DEVOPS", "Devops"] } });
    for (const rec of attendanceRecords) {
      rec.subjectWise.forEach(s => {
        if (s.subject === "DevOps" || s.subject === "DEVOPS" || s.subject === "Devops") {
          s.subject = "Training Session";
        }
      });
      await rec.save();
    }
    console.log(`Updated attendance for ${attendanceRecords.length} records`);

    // Update AcademicPerformance collection
    const perfRecords = await Models.AcademicPerformance.find({ "subjectWiseMarks.subject": { $in: ["DevOps", "DEVOPS", "Devops"] } });
    for (const rec of perfRecords) {
      rec.subjectWiseMarks.forEach(s => {
        if (s.subject === "DevOps" || s.subject === "DEVOPS" || s.subject === "Devops") {
          s.subject = "Training Session";
        }
      });
      await rec.save();
    }
    console.log(`Updated performance for ${perfRecords.length} records`);

    // Update Insight collection
    const insightRecords = await Models.Insight.find({ $or: [ { strongSubjects: "DevOps" }, { weakSubjects: "DevOps" } ] });
    for (const rec of insightRecords) {
      rec.strongSubjects = rec.strongSubjects.map(s => s === "DevOps" ? "Training Session" : s);
      rec.weakSubjects = rec.weakSubjects.map(s => s === "DevOps" ? "Training Session" : s);
      await rec.save();
    }
    console.log(`Updated insights for ${insightRecords.length} records`);

  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
  }
}

updateSubjectNames();
