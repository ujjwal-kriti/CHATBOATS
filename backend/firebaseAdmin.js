const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

let isFirebaseInitialized = false;

if (projectId && clientEmail && privateKey) {
  try {
    // Replace escaped newlines if passed directly in .env
    const formattedPrivateKey = privateKey.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey
      })
    });
    isFirebaseInitialized = true;
    console.log('Firebase Admin SDK initialized successfully.');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
  }
} else {
  console.log('\x1b[33m[FIREBASE ADMIN WARNING] Firebase credentials missing in env.\x1b[0m');
  console.log('\x1b[33mAuthentication will run in SIMULATION mode.\x1b[0m');
}

module.exports = {
  admin,
  isFirebaseInitialized
};
