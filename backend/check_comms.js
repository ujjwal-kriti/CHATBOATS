const Models = require('./database');
const mongoose = require('mongoose');
require('dotenv').config();

async function check() {
    await mongoose.connect(process.env.MONGO_URI);
    const comms = await Models.Communication.findOne({ regNumber: /231fa04g25/i });
    console.log('Communication Info:', JSON.stringify(comms, null, 2));
    await mongoose.disconnect();
}
check();
