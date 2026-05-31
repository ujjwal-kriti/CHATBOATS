const Models = require('./database');
const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const student = await Models.Student.findOne({ regNumber: /231fa04g25/i });
    console.log('Student Info:', JSON.stringify(student, null, 2));
    await mongoose.disconnect();
}
check();
