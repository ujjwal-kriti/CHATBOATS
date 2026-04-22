const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function fixSymmetry() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const students = await Models.Student.find({}, 'regNumber').lean();
    console.log(`Checking symmetry for ${students.length} students...`);

    const examNames = [
      // Module 1
      "Module1-PreT1 R22 : 1",
      "Module1-T1 R22 : 1",
      "Module1-T2 Review 1 R22 : 1",
      "Module1-T2 Review 2 R22 : 1",
      "Module1-T3 IEEE / APA Format R22 : 1",
      "Module1-T3 A Voice in-built Presentation R22 : 1",
      "Module1-T4 R22 : 1",
      "Module1-T5 Assignment /CLA R22 : 1",
      "Module1-T5 Assignment /CLA R22 : 2",
      "Module1-T5 Assignment /CLA R22 : 3",
      "Module1-T5 Assignment /CLA R22 : 4",
      // Module 2
      "Module2-PreT1 R22 : 1",
      "Module2-T1 R22 : 1",
      "Module2-T2 Review 1 R22 : 1",
      "Module2-T2 Review 2 R22 : 1",
      "Module2-T3 IEEE / APA Format R22 : 1",
      "Module2-T3 A Voice in-built Presentation R22 : 1",
      "Module2-T4 R22 : 1",
      "Module2-T5 Assignment /CLA R22 : 1",
      "Module2-T5 Assignment /CLA R22 : 2",
      "Module2-T5 Assignment /CLA R22 : 3",
      "Module2-T5 Assignment /CLA R22 : 4"
    ];

    for (const s of students) {
      const regNumber = s.regNumber;
      const perf = await Models.AcademicPerformance.findOne({ regNumber }).lean();
      if (!perf) continue;

      const semMap = {};
      perf.subjectWiseMarks.forEach(sub => {
        const sm = sub.semester || 1;
        if (!semMap[sm]) semMap[sm] = [];
        semMap[sm].push(sub.subject);
      });

      const semestersData = [];
      for (const sem in semMap) {
        const subjects = semMap[sem];
        const exams = examNames.map(name => ({
          title: name,
          marks: subjects.map(() => {
            if (Math.random() < 0.1) return "-";
            return Math.floor(Math.random() * 14) + 6; // 6 to 19
          })
        }));

        semestersData.push({
          semester: parseInt(sem),
          subjects,
          exams
        });
      }

      await Models.IntraSemesterMarks.findOneAndUpdate(
        { regNumber },
        { regNumber, semesters: semestersData },
        { upsert: true, new: true }
      );
      console.log(`Synchronized subjects for ${regNumber}`);
    }

    console.log('All students synchronized successfully!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

fixSymmetry();
