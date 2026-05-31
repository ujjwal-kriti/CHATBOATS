const axios = require('axios');
require('dotenv').config();

async function test() {
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  try {
    const res = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: fast2smsKey,
        route: 'q',
        message: 'Akash Bandaru: 1234',
        numbers: '8688611404',
        language: 'english'
      }
    });
    console.log('Fast2SMS Quick SMS Response:', res.data);
  } catch (error) {
    console.error('Fast2SMS Quick SMS Error:', error.response ? error.response.data : error.message);
  }
}

test();
