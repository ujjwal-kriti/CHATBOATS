const mongoose = require('mongoose');
const Models = require('./database');
require('dotenv').config();

async function debugData() {
  await mongoose.connect(process.env.MONGO_URI);
  const regNumber = "231fa04g25"; // From user screenshot usually
  const intra = await Models.IntraSemesterMarks.findOne({ regNumber }).lean();
  console.log("INTRA DATA:", JSON.stringify(intra, null, 2));
  process.exit(0);
}
debugData();
