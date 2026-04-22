const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function checkCD() {
  await mongoose.connect(process.env.MONGO_URI);
  const intra = await Models.IntraSemesterMarks.findOne({ regNumber: '231fa04g25' });
  if (intra) {
    const semData = intra.semesters.find(s => s.semester === 6);
    if (semData) {
      const cdIdx = semData.subjects.indexOf('Compiler Design');
      if (cdIdx !== -1) {
        console.log('Compiler Design Marks:');
        const m1 = semData.exams.filter(e => e.title.includes('Module1')).map(e => e.marks[cdIdx]);
        const m2 = semData.exams.filter(e => e.title.includes('Module2')).map(e => e.marks[cdIdx]);
        
        console.log('M1 Rows:', m1);
        console.log('M2 Rows:', m2);
      } else {
        console.log('Compiler Design not found in sem 6');
      }
    }
  }
  mongoose.connection.close();
}
checkCD();
