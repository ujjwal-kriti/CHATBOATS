const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI);
  const regNumber = '231fa04g25';
  const intra = await Models.IntraSemesterMarks.findOne({ regNumber }).lean();
  if (intra && intra.semesters) {
    intra.semesters.forEach(s => {
      console.log(`Sem ${s.semester}: ${s.subjects.join(', ')}`);
    });
  }
  process.exit(0);
}
check();
