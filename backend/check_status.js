const Models = require('./database');
const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const status = await Models.AcademicStatus.findOne({ regNumber: /231fa04g25/i });
    console.log('Academic Status:', JSON.stringify(status, null, 2));
    await mongoose.disconnect();
}
check();
