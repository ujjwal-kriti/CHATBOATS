require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Models = require('./database');
const NodeCache = require('node-cache');
const axios = require('axios');

const app = express();

// Initialize in-memory cache for OTPs with a standard TTL of 300 seconds (5 minutes)
const otpCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });
app.use(express.json());
app.use(cors());

const JWT_SECRET = 'supersecuresecretkey_for_chatbot';

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ENDPOINTS (CHAT-BASED LOGIN) ---

// Step 1: Verify Registration Number
app.post('/api/v1/auth/verify-reg', async (req, res) => {
  const { regNumber } = req.body;
  if (!regNumber) return res.status(400).json({ error: 'Registration number required' });

  try {
    const student = await Models.Student.findOne({ 
      regNumber: new RegExp('^' + regNumber.trim() + '$', 'i')
    });
    if (!student) return res.status(404).json({ error: 'Registration not found. Try again.' });
    res.json({ success: true, message: 'Registration found.' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Step 2: Verify Phone Number & Send OTP
app.post('/api/v1/auth/verify-phone', async (req, res) => {
  const { regNumber, parentPhone } = req.body;
  
  try {
    const student = await Models.Student.findOne({ 
      regNumber: new RegExp('^' + regNumber.trim() + '$', 'i'),
      parentPhone: parentPhone.replace(/\s/g, '').trim()
    });

    if (!student) return res.status(404).json({ error: 'Number mismatch. Try again.' });

    // Generate random 6-digit numeric OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store temporarily mapped by regNumber+Phone combo
    const cacheKey = `${regNumber.trim().toLowerCase()}_${student.parentPhone}`;
    otpCache.set(cacheKey, generatedOtp);
    
    // Send SMS via Fast2SMS
    const fast2smsKey = process.env.FAST2SMS_API_KEY || ''; // Usually stored in a .env file
    if (fast2smsKey) {
      await axios.get('https://www.fast2sms.com/dev/bulkV2', {
        headers: { 'authorization': fast2smsKey },
        params: {
          variables_values: generatedOtp,
          route: 'otp',
          numbers: student.parentPhone
        }
      });
      res.json({ success: true, message: 'OTP sent. Please enter OTP.' });
    } else {
      // For fallback/demonstration without valid API key, log it in terminal instead
      console.log(`\n=========================================\n[DEMO MODE] Fast2SMS API Key missing.\nSkipping real remote dispatch.\n--> OTP for ${student.parentPhone} is: ${generatedOtp}\n=========================================\n`);
      res.json({ success: true, message: `OTP sent. Please enter OTP. (Check backend terminal!)` });
    }
  } catch (err) {
    if (err.response && err.response.data) {
      console.error('Fast2SMS API Error:', err.response.data);
      return res.status(500).json({ error: `Fast2SMS Error: ${err.response.data.message || err.message}` });
    }
    console.error('OTP Dispatch Error:', err.message);
    res.status(500).json({ error: 'Server error generating OTP' });
  }
});

// Step 3: Verify OTP & Login
app.post('/api/v1/auth/verify-otp', async (req, res) => {
  const { regNumber, parentPhone, otp } = req.body;

  try {
    const cleanPhone = parentPhone.replace(/\s/g, '').trim();
    const cleanReg = regNumber.trim().toLowerCase();
    const cacheKey = `${cleanReg}_${cleanPhone}`;
    
    // Fetch stored OTP from NodeCache
    const storedOtp = otpCache.get(cacheKey);

    if (!storedOtp) {
      return res.status(401).json({ error: 'OTP expired or not found. Please try again.' });
    }

    if (storedOtp !== otp.trim()) {
      return res.status(401).json({ error: 'Incorrect OTP.' });
    }

    // OTP matched perfectly, clear the cache to prevent reuse attacks
    otpCache.del(cacheKey);

    const student = await Models.Student.findOne({ 
      regNumber: new RegExp('^' + regNumber.trim() + '$', 'i'),
      parentPhone: cleanPhone
    });

    if (!student) return res.status(404).json({ error: 'Session expired or mismatch.' });

    const token = jwt.sign({ regNumber: student.regNumber }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({
      message: 'Login successful',
      token,
      student: {
        regNumber: student.regNumber,
        name: student.name,
        branch: student.branch,
        semester: student.semester
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// --- STUDENT DATA ENDPOINTS ---

app.get('/api/v1/student/dashboard', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  try {
    const student = await Models.Student.findOne({ regNumber });
    const attendance = await Models.Attendance.findOne({ regNumber });
    const academicStatus = await Models.AcademicStatus.findOne({ regNumber });
    const performance = await Models.AcademicPerformance.findOne({ regNumber });
    const notifications = await Models.Notification.find({ regNumber }).sort({ _id: -1 }).limit(5);
    
    res.json({
      student,
      attendance: attendance ? {
        overallPercentage: attendance.overallPercentage,
        lowAttendanceAlerts: attendance.lowAttendanceAlerts || []
      } : null,
      academicStatus: academicStatus || null,
      performance: performance ? { currentCGPA: performance.currentCGPA } : null,
      notifications: notifications.map(n => ({
        id: n._id,
        upcomingExams: n.upcomingExams || [],
        assignmentDeadlines: n.assignmentDeadlines || []
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching dashboard data' });
  }
});

app.get('/api/v1/student/attendance', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  try {
    const data = await Models.Attendance.findOne({ regNumber });
    if (!data) return res.status(404).json({ error: 'No attendance data found' });

    res.json({
      overallPercentage: data.overallPercentage,
      subjectWise: data.subjectWise || [],
      semesterWise: data.semesterWise || [],
      lowAttendanceAlerts: data.lowAttendanceAlerts || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching attendance' });
  }
});

app.get('/api/v1/student/academic-status', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  try {
    const data = await Models.AcademicStatus.findOne({ regNumber });
    if (!data) return res.status(404).json({ error: 'No academic status data found' });

    res.json({
      numberOfBacklogs: data.numberOfBacklogs,
      repeatedSubjects: data.repeatedSubjects || [],
      incompleteSubjects: data.incompleteSubjects || [],
      courseCompletionStatus: data.courseCompletionStatus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching academic status' });
  }
});

app.get('/api/v1/student/performance', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  try {
    const data = await Models.AcademicPerformance.findOne({ regNumber });
    if (!data) return res.status(404).json({ error: 'No performance data found' });

    res.json({
      currentCGPA: data.currentCGPA,
      yearWiseCGPA: data.yearWiseCGPA || [],
      semesterWiseCGPA: data.semesterWiseCGPA || [],
      subjectWiseMarks: data.subjectWiseMarks || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching performance data' });
  }
});

app.get('/api/v1/student/financials', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  try {
    const data = await Models.Financial.findOne({ regNumber });
    if (!data) return res.status(404).json({ error: 'No financial data found' });

    res.json({
      feePaymentStatus: data.feePaymentStatus,
      pendingFees: data.pendingFees,
      paymentHistory: data.paymentHistory || [],
      scholarshipStatus: data.scholarshipStatus
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching financials' });
  }
});

app.get('/api/v1/student/insights', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  try {
    const data = await Models.Insight.findOne({ regNumber });
    const comms = await Models.Communication.findOne({ regNumber });

    res.json({
      insights: data ? {
        strongSubjects: data.strongSubjects || [],
        weakSubjects: data.weakSubjects || [],
        improvementSuggestions: data.improvementSuggestions || []
      } : null,
      communication: comms ? {
        facultyContact: comms.facultyContact || [],
        classAdvisor: comms.classAdvisor || {},
        academicOfficeContacts: comms.academicOfficeContacts || []
      } : null
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching insights and communication data' });
  }
});

app.post('/api/v1/chatbot/query', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const lower = message.toLowerCase().trim();
  let responseText = "I can help you with attendance, CGPA, backlogs, fees, or student details. What would you like to know?";

  try {
    if (lower.includes('attendance')) {
      const attendance = await Models.Attendance.findOne({ regNumber });
      if (attendance) {
        const subWise = attendance.subjectWise || [];
        const subLines = subWise.map(s => `${s.subject} ${s.attendance}%`).join(', ');
        responseText = `Current attendance is ${attendance.overallPercentage}%. Subject-wise attendance: ${subLines}.`;
      } else {
        responseText = "No attendance data found.";
      }
    } 
    else if (lower.includes('cgpa') || lower.includes('grade') || lower.includes('gpa')) {
      const perf = await Models.AcademicPerformance.findOne({ regNumber }).select('currentCGPA');
      if (perf) responseText = `Current CGPA is ${perf.currentCGPA}.`;
      else responseText = "No performance data found.";
    } 
    else if (lower.includes('backlog')) {
      const acStatus = await Models.AcademicStatus.findOne({ regNumber }).select('numberOfBacklogs');
      if (acStatus) responseText = `The student currently has ${acStatus.numberOfBacklogs} backlog(s).`;
      else responseText = "No academic status data found.";
    } 
    else if (lower.includes('fee') || lower.includes('fees') || lower.includes('payment')) {
      const fin = await Models.Financial.findOne({ regNumber }).select('pendingFees');
      if (fin) responseText = `Pending fees amount is ₹${fin.pendingFees}.`;
      else responseText = "No financial data found.";
    } 
    else if (lower.includes('student') || lower.includes('detail') || lower.includes('information') || lower.includes('reg') || lower.includes('who')) {
      const student = await Models.Student.findOne({ regNumber });
      if (student) responseText = `Student: ${student.name}, Registration: ${student.regNumber}, Department: ${student.branch}, Semester: ${student.semester}, Parent Phone: ${student.parentPhone}.`;
      else responseText = "Student details not found.";
    } 
    else if (lower.includes('hi') || lower.includes('hello') || lower.includes('help')) {
      responseText = "Hello! I'm your Academic Assistant. Ask me about attendance, CGPA, backlogs, fees, or student details.";
    }

    res.json({ response: responseText });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error processing chatbot query' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
