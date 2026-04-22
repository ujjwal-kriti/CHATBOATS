const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function fixT2T3() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const perfs = await Models.IntraSemesterMarks.find({});
    for (const perf of perfs) {
      perf.semesters.forEach(sem => {
        sem.exams.forEach(exam => {
          if (exam.title.includes('T2') || exam.title.includes('T3')) {
             exam.marks = exam.marks.map(m => {
               if (typeof m === 'number') {
                 // Make them less than or equal to 5
                 return Math.floor(Math.random() * 6); // 0 to 5
               }
               return m;
             });
          }
        });
      });
      await perf.save();
    }

    console.log('T2 and T3 marks updated to be <= 5 for all students!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

fixT2T3();
