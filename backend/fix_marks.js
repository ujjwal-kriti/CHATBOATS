const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function fix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const regNumber = '231FA04G25';
    const subjects = ["SE", "PADCOM", "CNS", "CLSA", "IIC", "SE Lab", "CNS-L", "ADS Lab", "QALR", "ADS", "MIH&IC", "IDP-II", "library", "Counseling", "TRg"];
    const examNames = [
      "Module1-PreT1 R22 : 1", "Module2-PreT1 R22 : 1", "Module1-T1 R22 : 1", "Module2-T1 R22 : 1",
      "Module1-T2 Review 1 R22 : 1", "Module1-T2 Review 2 R22 : 1", "Module2-T2 Review 1 R22 : 1", "Module2-T2 Review 2 R22 : 1",
      "Module1-T3 IEEE / APA Format R22 : 1", "Module1-T3 A Voice in-built Presentation R22 : 1",
      "Module2-T3 Voice in-built Presentation R22 : 1", "Module2-T3 IEEE / APA Format R22 : 1",
      "Module1-T4 R22 : 1", "Module2-T4 R22 : 1",
      "Module1-T5 Assignment /CLA R22 : 1", "Module1-T5 Assignment /CLA R22 : 2",
      "Module1-T5 Assignment /CLA R22 : 3", "Module1-T5 Assignment /CLA R22 : 4"
    ];

    const exams = examNames.map(name => ({
      title: name,
      marks: subjects.map(() => {
        if (Math.random() < 0.15) return "-";
        return Math.floor(Math.random() * 15) + 5;
      })
    }));

    await Models.IntraSemesterMarks.findOneAndUpdate(
      { regNumber },
      { regNumber, subjects, exams },
      { upsert: true, new: true }
    );

    console.log('Done for 231FA04G25');
  } catch (e) {
    console.error(e);
  } finally {
    mongoose.connection.close();
  }
}
fix();
