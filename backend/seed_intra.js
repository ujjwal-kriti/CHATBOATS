const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function seedIntraMarks() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB Atlas');

    const student = await Models.Student.findOne({ regNumber: '231FA04G25' });
    const regNumbers = student ? [student.regNumber] : [];
    
    // Also get all other students to seed them too
    const allStudents = await Models.Student.find({}, 'regNumber');
    const allRegs = allStudents.map(s => s.regNumber);

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

    for (const regNumber of allRegs) {
      const exams = examNames.map(name => {
        return {
          title: name,
          marks: subjects.map(() => {
            if (Math.random() < 0.2) return "-";
            const val = Math.floor(Math.random() * 15) + 5;
            return val;
          })
        };
      });

      await Models.IntraSemesterMarks.findOneAndUpdate(
        { regNumber },
        {
          regNumber,
          subjects,
          exams
        },
        { upsert: true, new: true }
      );
      console.log(`Seeded IntraSemesterMarks for ${regNumber}`);
    }

    console.log('Successfully seeded intra-semester marks for all students!');
  } catch (err) {
    console.error('Error seeding data:', err);
  } finally {
    mongoose.connection.close();
  }
}

seedIntraMarks();
