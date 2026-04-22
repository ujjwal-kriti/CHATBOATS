const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function seedDynamic() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const allStudents = await Models.Student.find({}, 'regNumber');
    const examNames = [
      "Module1-PreT1 R22 : 1", "Module2-PreT1 R22 : 1", "Module1-T1 R22 : 1", "Module2-T1 R22 : 1",
      "Module1-T2 Review 1 R22 : 1", "Module1-T2 Review 2 R22 : 1", "Module2-T2 Review 1 R22 : 1", "Module2-T2 Review 2 R22 : 1",
      "Module1-T3 IEEE / APA Format R22 : 1", "Module1-T3 A Voice in-built Presentation R22 : 1",
      "Module2-T3 Voice in-built Presentation R22 : 1", "Module2-T3 IEEE / APA Format R22 : 1",
      "Module1-T4 R22 : 1", "Module2-T4 R22 : 1",
      "Module1-T5 Assignment /CLA R22 : 1", "Module1-T5 Assignment /CLA R22 : 2",
      "Module1-T5 Assignment /CLA R22 : 3", "Module1-T5 Assignment /CLA R22 : 4"
    ];

    for (const student of allStudents) {
      const regNumber = student.regNumber;
      // Fetch performance to get real subjects
      const perf = await Models.AcademicPerformance.findOne({ regNumber });
      if (!perf) continue;

      const semesterWiseData = [];

      // Group subjects by semester
      const semMap = {};
      perf.subjectWiseMarks.forEach(s => {
        const sem = s.semester || 1; // Fallback to 1 if missing
        if (!semMap[sem]) semMap[sem] = [];
        semMap[sem].push(s.subject);
      });

      // For every semester found, create intra marks
      for (const sem in semMap) {
        const subjects = semMap[sem];
        const exams = examNames.map(name => ({
          title: name,
          marks: subjects.map(() => {
            if (Math.random() < 0.15) return "-";
            return Math.floor(Math.random() * 14) + 6;
          })
        }));

        semesterWiseData.push({
          semester: parseInt(sem),
          subjects,
          exams
        });
      }

      await Models.IntraSemesterMarks.findOneAndUpdate(
        { regNumber },
        { regNumber, semesters: semesterWiseData },
        { upsert: true, new: true }
      );
      console.log(`Seeded dynamic marks for ${regNumber}`);
    }

    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedDynamic();
