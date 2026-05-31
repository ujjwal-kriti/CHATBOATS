const axios = require('axios');
require('dotenv').config();

async function test() {
  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  try {
    const res = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
      params: {
        authorization: fast2smsKey,
        variables_values: '999999',
        route: 'otp',
        numbers: '8688611404'
      }
    });
    console.log('Fast2SMS OTP Response:', res.data);
  } catch (error) {
    console.error('Fast2SMS OTP Error:', error.response ? error.response.data : error.message);
  }
}

test();
