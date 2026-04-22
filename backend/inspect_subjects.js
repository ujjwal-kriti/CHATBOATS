const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function inspect() {
  await mongoose.connect(process.env.MONGO_URI);
  const regNumber = '231fa04g25';
  const perf = await Models.AcademicPerformance.findOne({ regNumber });
  const intra = await Models.IntraSemesterMarks.findOne({ regNumber });

  if (perf) {
    console.log(`--- AcademicPerformance Subjects for ${regNumber} ---`);
    perf.subjectWiseMarks.forEach(s => {
      console.log(`Sem ${s.semester}: ${s.subject}`);
    });
  }

  if (intra && intra.semesters) {
    console.log(`\n--- IntraSemesterMarks Subjects for ${regNumber} ---`);
    intra.semesters.forEach(sem => {
      console.log(`Sem ${sem.semester}: ${sem.subjects.join(', ')}`);
    });
  }
  mongoose.connection.close();
}
inspect();
