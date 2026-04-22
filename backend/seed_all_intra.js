const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function seedAllIntraMarks() {
  try {
    // Increase timeout for slow connections
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000
    });
    console.log('Connected to MongoDB Atlas');

    // Fetch all registration numbers
    const allStudents = await Models.Student.find({}, 'regNumber').lean();
    console.log(`Found ${allStudents.length} students to seed.`);

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

    // Process in batches to avoid overwhelming the connection
    const batchSize = 10;
    for (let i = 0; i < allStudents.length; i += batchSize) {
      const batch = allStudents.slice(i, i + batchSize);
      const promises = batch.map(student => {
        const regNumber = student.regNumber;
        const exams = examNames.map(name => ({
          title: name,
          marks: subjects.map(() => {
            if (Math.random() < 0.1) return "-";
            return Math.floor(Math.random() * 14) + 6; // 6 to 19
          })
        }));

        return Models.IntraSemesterMarks.findOneAndUpdate(
          { regNumber },
          { regNumber, subjects, exams },
          { upsert: true, new: true }
        );
      });

      await Promise.all(promises);
      console.log(`Successfully seeded batch ending at index ${Math.min(i + batchSize, allStudents.length)}`);
    }

    console.log('Successfully seeded intra-semester marks for EVERY student in the database!');
  } catch (err) {
    console.error('CRITICAL ERROR:', err);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

seedAllIntraMarks();
