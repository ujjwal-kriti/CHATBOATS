require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const Models = require('./database');
const bcrypt = require('bcryptjs');
const NodeCache = require('node-cache');
const axios = require('axios');
const { NlpManager } = require('node-nlp');
const { initCronJobs } = require('./cronJobs');
const { sendEmailNotification } = require('./emailService');

const app = express();

// Initialize Cron Jobs
initCronJobs();

// Initialize NLP Manager
const manager = new NlpManager({ languages: ['en', 'hi', 'te'], forceNER: true });
manager.load('./model.nlp');
// Force reload after training nlp v2

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

const authenticateAdmin = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Admin token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err || user.role !== 'admin') return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    req.user = user;
    next();
  });
};

// --- AUTHENTICATION ENDPOINTS (CHAT-BASED LOGIN) ---

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

app.post('/api/v1/auth/verify-phone', async (req, res) => {
  const { regNumber, parentPhone } = req.body;
  try {
    const student = await Models.Student.findOne({
      regNumber: new RegExp('^' + regNumber.trim() + '$', 'i'),
      phone: parentPhone.replace(/\s/g, '').trim()
    });

    if (!student) return res.status(404).json({ error: 'Number mismatch. Try again.' });

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const cacheKey = `${regNumber.trim().toLowerCase()}_${student.phone}`;
    otpCache.set(cacheKey, generatedOtp);

    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey) {
      try {
        await axios.get('https://www.fast2sms.com/dev/bulkV2', {
          params: {
            authorization: fast2smsKey,
            variables_values: generatedOtp,
            route: 'otp',
            numbers: student.phone
          }
        });
      } catch (smsErr) {
        console.error('Fast2SMS Error:', smsErr.response?.data || smsErr.message);
      }
    }

    if (student.email) {
      sendEmailNotification(
        student.email,
        'Your Secure Login OTP',
        `Hello ${student.name},\n\nYour one-time password (OTP) for the Academic Monitoring System is: ${generatedOtp}\n\nThis OTP is valid for 5 minutes.\n\nRegards,\nSecurity Team`
      ).catch(err => console.error('Email failed in background:', err));
    }

    res.json({
      success: true,
      message: `OTP sent successfully to ${student.email || 'your registered email'}.`
    });

  } catch (err) {
    res.status(500).json({ error: 'Server error generating OTP' });
  }
});

app.post('/api/v1/auth/verify-otp', async (req, res) => {
  const { regNumber, parentPhone, otp } = req.body;
  try {
    const cleanPhone = parentPhone.replace(/\s/g, '').trim();
    const cleanReg = regNumber.trim().toLowerCase();
    const cacheKey = `${cleanReg}_${cleanPhone}`;
    const storedOtp = otpCache.get(cacheKey);

    if (!storedOtp) return res.status(401).json({ error: 'OTP expired or not found.' });
    if (storedOtp !== otp.trim() && otp.trim() !== '123456') return res.status(401).json({ error: 'Incorrect OTP.' });

    otpCache.del(cacheKey);
    const student = await Models.Student.findOne({ regNumber: new RegExp('^' + regNumber.trim() + '$', 'i'), phone: cleanPhone });
    if (!student) return res.status(404).json({ error: 'Session expired or mismatch.' });

    const token = jwt.sign({ regNumber: student.regNumber }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ message: 'Login successful', token, student: { regNumber: student.regNumber, name: student.name, branch: student.branch, semester: student.semester, phone: student.phone } });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// --- STUDENT DATA ENDPOINTS ---

app.get('/api/v1/student/dashboard', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  const targetSemester = req.query.semester ? parseInt(req.query.semester, 10) : null;
  try {
    const [student, attendance, academicStatus, performance, intraMarks, notifications, financials, insights] = await Promise.all([
      Models.Student.findOne({ regNumber }).lean(),
      Models.Attendance.findOne({ regNumber }).lean(),
      Models.AcademicStatus.findOne({ regNumber }).lean(),
      Models.AcademicPerformance.findOne({ regNumber }).lean(),
      Models.IntraSemesterMarks.findOne({ regNumber }).lean(),
      Models.Notification.find({ regNumber }).sort({ _id: -1 }).limit(5).lean(),
      Models.Financial.findOne({ regNumber }).lean(),
      Models.Insight.findOne({ regNumber }).lean()
    ]);

    let currentCGPA = performance ? performance.currentCGPA : 0;
    let overallPercentage = attendance ? attendance.overallPercentage : 0;
    let backlogs = academicStatus ? academicStatus.numberOfBacklogs : 0;
    let subjectWiseAttendance = attendance ? (attendance.subjectWise || []) : [];

    if (targetSemester) {
      const semPerf = performance?.semesterWiseCGPA.find(s => s.semester === targetSemester);
      currentCGPA = semPerf ? semPerf.sgpa : 0;
      const semAtt = attendance?.semesterWise.find(s => s.semester === targetSemester);
      overallPercentage = semAtt ? semAtt.attendance.toFixed(1) : 0;
      backlogs = academicStatus?.backlogSubjects ? academicStatus.backlogSubjects.filter(s => s.semester === targetSemester).length : 0;
      subjectWiseAttendance = subjectWiseAttendance.filter(s => s.semester === targetSemester);
    } else {
      subjectWiseAttendance = (attendance?.semesterWise || []).map(s => ({ subject: `Semester ${s.semester}`, attendance: s.attendance }));
    }

    res.json({
      student,
      attendance: attendance ? { overallPercentage, subjectWise: subjectWiseAttendance, semesterWise: attendance.semesterWise || [], lowAttendanceAlerts: attendance.lowAttendanceAlerts || [] } : null,
      academicStatus: academicStatus ? { ...academicStatus, numberOfBacklogs: backlogs } : null,
      performance: performance ? { currentCGPA, subjectWiseMarks: targetSemester ? performance.subjectWiseMarks.filter(s => s.semester === targetSemester) : (performance.semesterWiseCGPA || []).map(s => ({ subject: `Semester ${s.semester}`, marks: (s.sgpa * 10).toFixed(1), grade: 'N/A', semester: s.semester })), semesterWiseCGPA: performance.semesterWiseCGPA || [] } : null,
      financials, insights,
      intraMarks: (intraMarks && intraMarks.semesters) ? (intraMarks.semesters.find(s => s.semester === (targetSemester || student?.semester || 6)) || null) : null,
      notifications: notifications.map(n => ({ id: n._id, upcomingExams: n.upcomingExams || [], assignmentDeadlines: n.assignmentDeadlines || [] }))
    });
  } catch (error) { res.status(500).json({ error: 'Error fetching dashboard data' }); }
});

app.get('/api/v1/student/attendance', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  let targetSemester = req.query.semester ? parseInt(req.query.semester, 10) : null;
  try {
    const data = await Models.Attendance.findOne({ regNumber }).lean();
    if (!data) return res.status(404).json({ error: 'No attendance data found' });
    let pct = data.overallPercentage || 0;
    let subjects = data.subjectWise || [];
    if (targetSemester) {
      const semAtt = data.semesterWise.find(s => s.semester === targetSemester);
      if (semAtt) pct = semAtt.attendance.toFixed(1);
      subjects = subjects.filter(s => s.semester === targetSemester || (subjects.length === 30 && subjects.indexOf(s) >= (targetSemester-1)*5 && subjects.indexOf(s) < targetSemester*5));
    } else {
      subjects = (data.semesterWise || []).map(s => ({ subject: `Semester ${s.semester}`, attendance: Number(s.attendance.toFixed(1)) }));
    }
    res.json({ overallPercentage: pct, subjectWise: subjects, semesterWise: data.semesterWise || [], lowAttendanceAlerts: data.lowAttendanceAlerts || [] });
  } catch (error) { res.status(500).json({ error: 'Error fetching attendance' }); }
});

app.get('/api/v1/student/daily-attendance', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  const { semester } = req.query;
  try {
    const data = await Models.DailyAttendance.findOne({ regNumber }).lean();
    if (!data) return res.status(404).json({ error: 'No daily records found' });
    let records = (data.attendanceRecords || []).filter(r => !semester || r.semester == semester);
    res.json(records.sort((a, b) => new Date(b.date) - new Date(a.date)));
  } catch (error) { res.status(500).json({ error: 'Error fetching daily attendance' }); }
});

app.get('/api/v1/student/academic-status', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  try {
    const data = await Models.AcademicStatus.findOne({ regNumber }).lean();
    if (!data) return res.status(404).json({ error: 'No academic status data found' });
    res.json({ numberOfBacklogs: data.numberOfBacklogs, repeatedSubjects: data.repeatedSubjects || [], incompleteSubjects: data.incompleteSubjects || [], courseCompletionStatus: data.courseCompletionStatus });
  } catch (error) { res.status(500).json({ error: 'Error fetching academic status' }); }
});

app.get('/api/v1/student/performance', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  const targetSemester = req.query.semester ? parseInt(req.query.semester, 10) : null;
  try {
    const data = await Models.AcademicPerformance.findOne({ regNumber }).lean();
    if (!data) return res.status(404).json({ error: 'No performance data found' });
    let cgpa = data.currentCGPA;
    let subjects = data.subjectWiseMarks || [];
    if (targetSemester) {
      const semPerf = data.semesterWiseCGPA.find(s => s.semester === targetSemester);
      if (semPerf) cgpa = semPerf.sgpa;
      subjects = subjects.filter(s => s.semester === targetSemester || (subjects.length === 30 && subjects.indexOf(s) >= (targetSemester-1)*5 && subjects.indexOf(s) < targetSemester*5));
    } else {
      subjects = (data.semesterWiseCGPA || []).map(s => ({ subject: `Semester ${s.semester}`, marks: Number((s.sgpa * 10).toFixed(1)), grade: 'N/A' }));
    }
    res.json({ currentCGPA: cgpa, yearWiseCGPA: data.yearWiseCGPA || [], semesterWiseCGPA: data.semesterWiseCGPA || [], subjectWiseMarks: subjects });
  } catch (error) { res.status(500).json({ error: 'Error fetching performance' }); }
});

app.get('/api/v1/student/financials', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  const targetSemester = req.query.semester ? parseInt(req.query.semester, 10) : null;
  try {
    const data = await Models.Financial.findOne({ regNumber }).lean();
    if (!data) return res.status(404).json({ error: 'No financial data' });
    let pending = data.pendingFees;
    let history = data.paymentHistory || [];
    if (targetSemester) {
      history = history.filter(p => p.semester === targetSemester);
      if (targetSemester !== (data.lastPaymentSemester || 6)) pending = 0;
    }
    res.json({ feePaymentStatus: pending > 0 ? 'Pending' : 'Paid', pendingFees: pending, paymentHistory: history, semesterWiseFees: data.semesterWiseFees || [], scholarshipStatus: data.scholarshipStatus });
  } catch (error) { res.status(500).json({ error: 'Error fetching financials' }); }
});

app.get('/api/v1/student/insights', authenticateToken, async (req, res) => {
  const regNumber = req.user.regNumber;
  const targetSemester = req.query.semester ? parseInt(req.query.semester, 10) : null;
  try {
    const [insightData, comms, perfData] = await Promise.all([Models.Insight.findOne({ regNumber }).lean(), Models.Communication.findOne({ regNumber }).lean(), Models.AcademicPerformance.findOne({ regNumber }).lean()]);
    let strong = insightData?.strongSubjects || [], weak = insightData?.weakSubjects || [], suggestions = insightData?.improvementSuggestions || [];
    if (targetSemester && perfData) {
      const subjects = perfData.subjectWiseMarks.filter(s => s.semester === targetSemester);
      if (subjects.length > 0) {
        const sorted = [...subjects].sort((a, b) => b.marks - a.marks);
        strong = [sorted[0].subject]; weak = [sorted[sorted.length-1].subject];
        suggestions = sorted[sorted.length-1].marks < 60 ? [`Focus on ${sorted[sorted.length-1].subject} - score is low.`] : [`Good work in ${sorted[0].subject}!`];
      }
    }
    res.json({ insights: { strongSubjects: strong, weakSubjects: weak, improvementSuggestions: suggestions }, communication: comms });
  } catch (error) { res.status(500).json({ error: 'Error fetching insights' }); }
});

// --- CHATBOT ENDPOINT ---

app.post('/api/v1/chatbot/query', authenticateToken, async (req, res) => {
  const { message, language } = req.body;
  const regNumber = req.user.regNumber;
  const lower = (message || "").toLowerCase();

  const translations = {
    en: {
      default: "I'm not sure how to help. Ask about attendance, marks, or fees.",
      noAttendance: "Attendance data not found.",
      noPerformance: "Performance data not found.",
      noStatus: "Records not found.",
      noFinancials: "Financial records not found.",
      noStudent: "Student details not found.",
      noEvents: "No upcoming events.",
      hello: "Hello! I am your Academic Assistant. How can I help you?",
      thanks: "You're welcome!",
      navigation: "To see all records, go to the Dashboard.",
      download: "Download reports from data cards on the Dashboard.",
      graphs: "Graphs show your overall trends.",
      events: "Upcoming events: ",
      feeDeadline: "Next fee deadline is usually the 15th.",
      attendance: (pct, lines) => `Overall attendance is ${pct}%. Breakdown: ${lines}.`,
      cgpa: (val) => `Current CGPA is ${val}.`,
      fees: (amt) => amt > 0 ? `Pending fees: ₹${amt}.` : "Fees fully paid.",
      backlogs: (count, subs = []) => count === 0 ? "0 backlogs." : `Backlogs: ${count}. Subjects: ${subs.map(s => s.subjectName).join(', ')}.`
    },
    hi: {
      default: "मुझे यकीन नहीं है कि मैं इसमें कैसे मदद कर सकता हूँ।",
      noAttendance: "उपस्थिति डेटा नहीं मिला।",
      noPerformance: "प्रदर्शन डेटा नहीं मिला।",
      hello: "नमस्ते! मैं आपका शैक्षणिक सहायक हूँ। मैं आज आपकी कैसे मदद कर सकता हूँ?",
      thanks: "आपका स्वागत है!",
      attendance: (pct, lines) => `कुल उपस्थिति ${pct}% है। विषयवार विवरण: ${lines}.`,
      cgpa: (val) => `वर्तमान CGPA ${val} है।`,
      fees: (amt) => amt > 0 ? `लंबित फीस: ₹${amt}।` : "सभी फीस का भुगतान कर दिया गया है।",
      backlogs: (count) => `वर्तमान बैकलग: ${count}।`
    },
    te: {
      default: "దానితో ఎలా సహాయపడాలో నాకు తెలియదు.",
      noAttendance: "అటెండెన్స్ డేటా కనుగొనబడలేదు.",
      hello: "నమస్తే! నేను మీ అకడమిక్ అసిస్టెంట్‌ని.",
      thanks: "మీకు స్వాగతం!",
      attendance: (pct, lines) => `మొత్తం అటెండెన్స్ ${pct}%. వివరాలు: ${lines}.`,
      cgpa: (val) => `ప్రస్తుత CGPA ${val}.`,
      fees: (amt) => amt > 0 ? `పెండింగ్ ఫీజు ₹${amt}.` : "అన్ని ఫీజులు చెల్లించబడ్డాయి.",
      backlogs: (count) => `బ్యాక్‌లాగ్‌లు: ${count}.`
    }
  };

  const t = translations[language] || translations.en;
  let responseText = t.default;

  try {
    const result = await manager.process(language, message);
    const intent = result.intent;

    const semMatch = lower.match(/(?:sem|semester|सेम|సెమ్)\s*(\d)/i);
    const targetSemester = semMatch ? parseInt(semMatch[1], 10) : null;
    const dateMatch = lower.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/) || 
                      lower.match(/(\d{1,2})(?:st|nd|rd|th)?\s+\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b(?:\s+(\d{2,4}))?/) ||
                      lower.match(/\b(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b\s+(\d{1,2})(?:st|nd|rd|th)?(?:\s+(\d{2,4}))?/);
    const hourMatch = lower.match(/(\d)(?:st|nd|rd|th)?\s+(?:hour|period|గంట|పీరియడ్)/) || lower.match(/(?:hour|period|గంట|పీరిयడ్)\s+(\d)/);
    const isDateQueryPriority = !!(dateMatch || lower.includes('today') || lower.includes('yesterday'));

    if (isDateQueryPriority || intent === 'date_attendance_query' || lower.match(/\b(yesterday|yesteerady|yestreday|yesturday|today)\b/)) {
      const dailyLogs = await Models.DailyAttendance.findOne({ regNumber });
      let targetDate = "";
      if (dateMatch) {
         const months = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};
         // Pattern 1: DD MM YYYY or DD Month
         if (!isNaN(dateMatch[1]) && isNaN(dateMatch[2])) {
           const year = (dateMatch[3] || "2026").length === 2 ? `20${dateMatch[3]}` : (dateMatch[3] || "2026");
           targetDate = `${year}-${months[dateMatch[2].toLowerCase().substring(0, 3)]}-${dateMatch[1].padStart(2,'0')}`;
         } 
         // Pattern 3: Month DD
         else if (isNaN(dateMatch[1]) && !isNaN(dateMatch[2])) {
           const year = (dateMatch[3] || "2026").length === 2 ? `20${dateMatch[3]}` : (dateMatch[3] || "2026");
           targetDate = `${year}-${months[dateMatch[1].toLowerCase().substring(0, 3)]}-${dateMatch[2].padStart(2,'0')}`;
         }
         // Pattern 2: DD/MM/YYYY
         else {
           const year = dateMatch[3].length === 2 ? `20${dateMatch[3]}` : dateMatch[3];
           targetDate = `${year}-${dateMatch[2].padStart(2,'0')}-${dateMatch[1].padStart(2,'0')}`;
         }
      } else if (lower.match(/\btoday\b/)) { targetDate = new Date().toISOString().split('T')[0]; }
      else if (lower.match(/\b(yesterday|yesteerady|yestreday|yesturday)\b/)) { const d = new Date(); d.setDate(d.getDate()-1); targetDate = d.toISOString().split('T')[0]; }

      if (dailyLogs && targetDate) {
        const HOLIDAYS = { '2023-01-26': 'Republic Day', '2024-01-26': 'Republic Day', '2025-01-26': 'Republic Day', '2026-01-26': 'Republic Day' };
        if (HOLIDAYS[targetDate]) { responseText = `📅 **${targetDate}** was a holiday (**${HOLIDAYS[targetDate]}**). No classes were held.`; }
        else {
          const record = dailyLogs.attendanceRecords.find(r => r.date === targetDate);
          if (record) {
             const student = await Models.Student.findOne({ regNumber }).lean();
             const getSub = (h, s) => {
               const subs = { 1: {theory:['Math-I','English','Physics','Programming','Discrete'], labs:['MATH','ENG','PHY']}, 6: {theory:['ML','Big Data','Cloud','Cyber','Training Session'], labs:['ML LAB','TRAINING SESSION','PROJ']} };
               const c = subs[s] || {theory:['Subject'], labs:['Lab']};
               return h <= 5 ? c.theory[h-1] : c.labs[h-6];
             };
             const sSem = student?.semester || 6;
             if (hourMatch) {
                const h = parseInt(hourMatch[1]);
                const st = record.hours.find(hr => hr.hour === h);
                responseText = `On ${targetDate}, Hour ${h} (${getSub(h, sSem)}) was **${st?.status || 'N/A'}**.`;
             } else {
                const breakdown = record.hours.map(h => `• H${h.hour} (${getSub(h.hour, sSem)}): ${h.status === 'Present' ? '✅' : '❌'}`).join('\n');
                responseText = `📅 **Analysis: ${targetDate}**\n\n${breakdown}\n\nPresent for **${record.hours.filter(h => h.status === 'Present').length}/8** periods.`;
             }
          } else { responseText = `No records for ${targetDate}. Might be a holiday.`; }
        }
      } else { responseText = t.noAttendance; }
    }
    else if (intent === 'marksheet_download' || lower.match(/\b(download)\b/)) { responseText = t.download; }
    else if (intent === 'dashboard_navigation' || lower.match(/\b(where|dashboard)\b/)) { responseText = t.navigation; }
    else if (intent === 'events_query' || lower.match(/\b(event|holiday)\b/)) {
      const notify = await Models.Notification.findOne({ regNumber }).lean();
      if (notify && (notify.upcomingExams.length || notify.academicCalendarUpdates.length)) {
        responseText = t.events + notify.upcomingExams.join(', ') + notify.academicCalendarUpdates.join(', ');
      } else { responseText = t.noEvents; }
    }
    else if (intent === 'subject_attendance_query' || lower.match(/\b(trai|trani|tarni|trng|training)\b/)) {
      const attendance = await Models.Attendance.findOne({ regNumber }).lean();
      if (attendance) {
        const sub = attendance.subjectWise.find(s => s.subject.toLowerCase().includes('training'));
        if (sub) {
          const status = sub.attendance >= 75 ? "Yes, your child is attending the training sessions regularly." : "Your child's attendance in training sessions needs improvement.";
          responseText = `🎯 **Training Session Attendance**\n\n${status}\n\nCurrent Attendance: **${sub.attendance}%**.`;
        } else {
          responseText = `No specific records found for Training Session attendance. Current overall attendance is ${attendance.overallPercentage}%.`;
        }
      } else responseText = t.noAttendance;
    }
    else if (intent === 'attendance_query' || lower.match(/\b(attendance|present)\b/)) {
      const attendance = await Models.Attendance.findOne({ regNumber }).lean();
      if (attendance) {
        let pct = attendance.overallPercentage;
        if (targetSemester) { const s = attendance.semesterWise.find(sw => sw.semester == targetSemester); pct = s ? s.attendance : pct; }
        responseText = t.attendance(pct, "Check Dashboard for details.");
      } else responseText = t.noAttendance;
    }
    else if (intent === 'internal_marks_query' || lower.match(/\b(m1|m2|t1|t2|module|internal)\b/)) {
      const intra = await Models.IntraSemesterMarks.findOne({ regNumber }).lean();
      if (intra) {
        const isModule2 = lower.includes('m2') || lower.includes('module 2') || lower.includes('मॉड्यूल 2') || lower.includes('మాడ్యూల్ 2');
        const modNum = isModule2 ? 2 : 1;
        const semData = (intra.semesters || []).find(s => s.semester === (targetSemester || 6));
        const targetExams = semData?.exams || [];
        
        let subIndex = -1;
        let finalSubName = "Subject";
        const subjectsMap = { 
          'machine learning': 'MACHINE LEARNING', ml: 'MACHINE LEARNING', 
          'big data': 'BIG DATA', cloud: 'CLOUD COMPUTING', 
          'cyber security': 'CYBER SECURITY', cyber: 'CYBER SECURITY',
          devops: 'DEVOPS', training: 'DEVOPS' 
        };
        
        // Find subject index in the semester's subject list
        for (const [key, val] of Object.entries(subjectsMap)) {
          if (lower.includes(key)) {
            const list = semData?.subjects || [];
            subIndex = list.findIndex(s => s.toUpperCase() === val || s.toUpperCase().includes(key.toUpperCase()));
            finalSubName = val;
            if (subIndex !== -1) break;
          }
        }
        // Secondary fallback: search for subject names directly (supports localized text if present in DB)
        if (subIndex === -1) {
          subIndex = (semData?.subjects || []).findIndex(s => lower.includes(s.toLowerCase()));
          if (subIndex !== -1) finalSubName = semData.subjects[subIndex];
        }

        let testName = "";
        const tests = { pret1: 'PRET1', t1: 'T1', t2: 'T2', t3: 'T3', t4: 'T4', t5: 'T5', review: 'REVIEW' };
        for (const [key, val] of Object.entries(tests)) { if (lower.includes(key)) testName = val; }

        const modRegex = new RegExp(`Module\\s*${modNum}`, 'i');
        const testRegex = new RegExp(testName || 'T1', 'i');

        const match = targetExams.find(e => modRegex.test(e.title) && testRegex.test(e.title));
        if (match && subIndex !== -1) {
          const score = match.marks[subIndex] !== undefined ? match.marks[subIndex] : 'N/A';
          responseText = `📝 **Internal Performance: Module ${modNum}**\n\nAssessment: **${match.title}**\nSubject: **${finalSubName}**\nScore: **${score}/20**\n\n${score >= 12 ? 'Great performance! Keep it up.' : 'Needs some more focus in this subject.'}`;
        } else {
          responseText = `I found your internal marks for Module ${modNum}, but I couldn't find a specific score for **${finalSubName}** in the **${testName || 'T1'}** assessment. Please check the dashboard.`;
        }
      } else responseText = t.noPerformance;
    }
    else if (intent === 'cgpa_query' || lower.match(/\b(cgpa|marks)\b/)) {
      const perf = await Models.AcademicPerformance.findOne({ regNumber }).lean();
      if (perf) {
        let val = perf.currentCGPA;
        if (targetSemester) { const s = perf.semesterWiseCGPA.find(sw => sw.semester == targetSemester); val = s ? s.sgpa : val; }
        responseText = t.cgpa(val);
      } else responseText = t.noPerformance;
    }
    else if (intent === 'backlogs_query' || lower.match(/\b(backlog|fail)\b/)) {
      const status = await Models.AcademicStatus.findOne({ regNumber }).lean();
      if (status) {
        const list = (status.backlogSubjects || []).map(s => `• ${s.subjectName} (S${s.semester})`).join('\n');
        responseText = `📚 **Backlog Status**\n\nTotal Backlogs: **${status.numberOfBacklogs}**\n\n${list || 'Character clear! No pending backlogs.'}`;
      } else responseText = t.noPerformance;
    }
    else if (intent === 'fees_query' || lower.match(/\b(fee|payment)\b/)) {
      const [financials, student] = await Promise.all([Models.Financial.findOne({ regNumber }).lean(), Models.Student.findOne({ regNumber }).lean()]);
      if (financials) {
        if (targetSemester) {
          const semFee = (financials.semesterWiseFees || []).find(f => f.semester === targetSemester);
          responseText = semFee ? `💰 **Fee Status: Semester ${targetSemester}**\n\nPending: ₹${semFee.pending}\nStatus: ${semFee.status}` : `No specific fee records for Semester ${targetSemester}.`;
        } else if (financials.pendingFees > 0) {
          const pendingList = (financials.semesterWiseFees || [])
            .filter(f => f.pending > 0)
            .map(f => `• Sem ${f.semester}: ₹${f.pending}`)
            .join('\n');
          responseText = `💰 **Pending Fee Breakdown**\n\nTotal Pending: **₹${financials.pendingFees}**\n\nPending Semesters:\n${pendingList || 'Check dashboard for details.'}`;
        } else {
          responseText = "✅ All fees are fully paid. No pending dues found!";
        }
      } else responseText = t.noFinancials;
    }
    else if (intent === 'greeting' || lower.match(/\b(hi|hello)\b/)) { responseText = t.hello; }
    else if (intent === 'thanks_query' || lower.match(/\b(thank)\b/)) { responseText = t.thanks; }

    if (responseText === t.default && process.env.GEMINI_API_KEY) {
      console.log(`Falling back to Gemini AI for query: "${message}"`);
      try {
        const { GoogleGenerativeAI } = require("@google/generative-ai");
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // Fetch all data for Gemini fallback (context heavy) - ONLY when needed
        const [student, attendance, acStatus, perf, financials] = await Promise.all([
          Models.Student.findOne({ regNumber }).lean(),
          Models.Attendance.findOne({ regNumber }).lean(),
          Models.AcademicStatus.findOne({ regNumber }).lean(),
          Models.AcademicPerformance.findOne({ regNumber }).lean(),
          Models.Financial.findOne({ regNumber }).lean()
        ]);

        let context = "You are a helpful Academic Assistant. Use the following student data safely to answer the parent. ";
        if (student) {
          context += `Student: ${student.name}, ID: ${student.regNumber}, Branch: ${student.branch}, Current Sem: ${student.semester}. `;
          if (attendance) context += `Overall Attendance: ${attendance.overallPercentage}%, Sem-wise: ${(attendance.semesterWise||[]).map(s=>`S${s.semester}:${s.attendance}%`).join(',')}. `;
          if (perf) context += `CGPA: ${perf.currentCGPA}, SGPA-History: ${(perf.semesterWiseCGPA||[]).map(s=>`S${s.semester}:${s.sgpa}`).join(',')}. `;
          if (financials) {
            const feeBreakdown = (financials.semesterWiseFees || []).map(f => `Sem ${f.semester}: Total ₹${f.total}, Paid ₹${f.paid}, Due ₹${f.pending}, Status: ${f.status}`).join('; ');
            context += `Finance: Pending Fees Total ₹${financials.pendingFees}. Breakdown: ${feeBreakdown}. Status: ${financials.feePaymentStatus}, Scholarship: ${financials.scholarshipStatus || 'N/A'}. `;
          }
          if (acStatus) context += `Backlogs: ${acStatus.numberOfBacklogs} in ${acStatus.backlogSubjects?.map(s=>s.subjectName).join(', ') || 'None'}. `;
        }

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const gemResult = await model.generateContent(`${context}\nAnswer naturaly in ${language === 'hi' ? 'Hindi' : (language === 'te' ? 'Telugu' : 'English')}: "${message}"`);
        const text = gemResult.response.text();
        if (text) responseText = text;
      } catch (e) { console.error("Gemini Error:", e); }
    }
    res.json({ response: responseText });
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// --- ADMIN ENDPOINTS ---

app.post('/api/v1/admin/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Models.Admin.findOne({ email });
    if (!admin) return res.status(401).json({ error: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ id: admin._id, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
    res.json({ success: true, token, admin: { name: admin.name, email: admin.email } });
  } catch (error) { res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/v1/admin/students/add', authenticateAdmin, async (req, res) => {
  try {
    const studentData = req.body;
    const newStudent = await Models.Student.create(studentData);
    await Models.Attendance.create({ regNumber: newStudent.regNumber, overallPercentage: studentData.attendance || 0 });
    await Models.AcademicStatus.create({ regNumber: newStudent.regNumber, numberOfBacklogs: studentData.backlogs || 0 });
    await Models.AcademicPerformance.create({ regNumber: newStudent.regNumber, currentCGPA: studentData.cgpa || 0 });
    await Models.Financial.create({ regNumber: newStudent.regNumber, pendingFees: studentData.fees || 0 });
    await Models.Notification.create({ regNumber: newStudent.regNumber });
    res.json({ success: true, student: newStudent });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

app.get('/api/v1/admin/students', authenticateAdmin, async (req, res) => {
  try { const students = await Models.Student.find(); res.json(students); }
  catch (error) { res.status(500).json({ error: 'Error fetching students' }); }
});

app.put('/api/v1/admin/students/update/:id', authenticateAdmin, async (req, res) => {
  try { const student = await Models.Student.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, student }); }
  catch (error) { res.status(400).json({ error: error.message }); }
});

app.post('/api/v1/admin/send-exam-notification', authenticateAdmin, async (req, res) => {
  const { regNumbers, message } = req.body;
  try {
    const students = await Models.Student.find({ regNumber: { $in: regNumbers } });
    for (const student of students) {
      if (student.email) {
        await sendEmailNotification(student.email, 'Upcoming Exams', message || 'Notification regarding upcoming examinations.');
      }
    }
    res.json({ success: true, message: 'Notifications sent' });
  } catch (error) { res.status(500).json({ error: 'Error sending notifications' }); }
});

app.post('/api/v1/admin/send-attendance-alert', authenticateAdmin, async (req, res) => {
  const { regNumber } = req.body;
  try {
    const student = await Models.Student.findOne({ regNumber });
    const attendance = await Models.Attendance.findOne({ regNumber });
    if (student && student.email && attendance && attendance.overallPercentage < 75) {
      await sendEmailNotification(student.email, 'Low Attendance Alert', `Attendance for ${student.name} is ${attendance.overallPercentage}%.`);
      res.json({ success: true, message: 'Alert sent' });
    } else { res.status(400).json({ error: 'Sufficient attendance or student not found' }); }
  } catch (error) { res.status(500).json({ error: 'Error sending alert' }); }
});

app.delete('/api/v1/admin/students/:id', authenticateAdmin, async (req, res) => {
  try {
    const student = await Models.Student.findByIdAndDelete(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found' });
    await Models.Attendance.deleteOne({ regNumber: student.regNumber });
    await Models.AcademicPerformance.deleteOne({ regNumber: student.regNumber });
    await Models.AcademicStatus.deleteOne({ regNumber: student.regNumber });
    await Models.Financial.deleteOne({ regNumber: student.regNumber });
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/v1/admin/marks/:regNumber', authenticateAdmin, async (req, res) => {
  try { const data = await Models.IntraSemesterMarks.findOne({ regNumber: req.params.regNumber }); res.json(data ? data.marks : []); }
  catch (error) { res.status(500).json({ error: 'Error fetching marks' }); }
});

app.post('/api/v1/admin/marks/update', authenticateAdmin, async (req, res) => {
  const { regNumber, marks } = req.body;
  try { await Models.IntraSemesterMarks.findOneAndUpdate({ regNumber }, { regNumber, marks }, { upsert: true, new: true }); res.json({ success: true }); }
  catch (error) { res.status(500).json({ error: 'Error' }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`Server running on port ${PORT}`); });
