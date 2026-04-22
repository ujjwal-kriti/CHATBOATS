const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function seedExternal() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    const perfs = await Models.AcademicPerformance.find({});
    for (const perf of perfs) {
      perf.subjectWiseMarks = perf.subjectWiseMarks.map(s => ({
        ...s.toObject(),
        externalMarks: Math.floor(Math.random() * 25) + 40 // Random 40-65 out of 70
      }));
      await perf.save();
    }

    console.log('External marks seeded for all students!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

seedExternal();
