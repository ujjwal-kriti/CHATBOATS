const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function fixData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const perfs = await Models.AcademicPerformance.find({});
    console.log(`Fixing ${perfs.length} performance records...`);

    for (const perf of perfs) {
      if (perf.subjectWiseMarks && perf.subjectWiseMarks.length > 0) {
        perf.subjectWiseMarks.forEach((s, index) => {
          // Assign semester based on index: 0-4 -> 1, 5-9 -> 2, etc.
          s.semester = Math.floor(index / 5) + 1;
        });
        await perf.save();
      }
    }

    console.log('Fixed subject semesters. Now re-running dynamic seed...');
    
    // Now re-run the dynamic seeding logic (copying from seed_dynamic_intra.js)
    const examNames = [
      "Module1-PreT1 R22 : 1", "Module2-PreT1 R22 : 1", "Module1-T1 R22 : 1", "Module2-T1 R22 : 1",
      "Module1-T2 Review 1 R22 : 1", "Module1-T2 Review 2 R22 : 1", "Module2-T2 Review 1 R22 : 1", "Module2-T2 Review 2 R22 : 1",
      "Module1-T3 IEEE / APA Format R22 : 1", "Module1-T3 A Voice in-built Presentation R22 : 1",
      "Module2-T3 Voice in-built Presentation R22 : 1", "Module2-T3 IEEE / APA Format R22 : 1",
      "Module1-T4 R22 : 1", "Module2-T4 R22 : 1",
      "Module1-T5 Assignment /CLA R22 : 1", "Module1-T5 Assignment /CLA R22 : 2",
      "Module1-T5 Assignment /CLA R22 : 3", "Module1-T5 Assignment /CLA R22 : 4"
    ];

    const students = await Models.Student.find({}, 'regNumber');
    for (const student of students) {
      const regNumber = student.regNumber;
      const perf = await Models.AcademicPerformance.findOne({ regNumber });
      if (!perf) continue;

      const semesterWiseData = [];
      const semMap = {};
      perf.subjectWiseMarks.forEach(s => {
        const sem = s.semester;
        if (!semMap[sem]) semMap[sem] = [];
        semMap[sem].push(s.subject);
      });

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
        { upsert: true }
      );
    }

    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

fixData();
