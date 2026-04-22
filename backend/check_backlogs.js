const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function checkBacklogs() {
  await mongoose.connect(process.env.MONGO_URI);
  const regNumber = '231fa04g25';
  const status = await Models.AcademicStatus.findOne({ regNumber }).lean();
  if (status) {
    console.log(`Total Backlogs: ${status.numberOfBacklogs}`);
    console.log('Backlog Subjects:');
    status.backlogSubjects.forEach(s => {
      console.log(`- ${s.subjectName} (Sem ${s.semester})`);
    });
  }
  process.exit(0);
}
checkBacklogs();
