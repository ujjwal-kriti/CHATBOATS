const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
  });
// Define Schemas

const StudentSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  email: { type: String },
  name: String,
  branch: String,
  semester: Number,
  attendance: Number,
  cgpa: Number,
  fees: Number,
  backlogs: Number
});

const AttendanceSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  overallPercentage: Number,
  subjectWise: [{ subject: String, attendance: Number, semester: Number }],
  semesterWise: [{ semester: Number, attendance: Number }],
  lowAttendanceAlerts: [String]
});

const DailyAttendanceSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  attendanceRecords: [{
    date: String, // YYYY-MM-DD
    semester: Number,
    hours: [{
      hour: Number, // 1 to 8
      status: { type: String, enum: ['Present', 'Absent', 'Late', 'N/A'] }
    }]
  }]
});

const AcademicStatusSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  numberOfBacklogs: Number,
  backlogSubjects: [{
    subjectName: String,
    semester: Number,
    status: { type: String, default: 'Pending' },
    nextReattemptDate: String
  }],
  repeatedSubjects: [{
    subjectName: String,
    attemptCount: Number,
    nextExam: String
  }],
  incompleteSubjects: [String],
  courseCompletionStatus: String
});

const AcademicPerformanceSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  currentCGPA: Number,
  yearWiseCGPA: [{ year: Number, cgpa: Number }],
  semesterWiseCGPA: [{ semester: Number, sgpa: Number }],
  subjectWiseMarks: [{ subject: String, grade: String, marks: Number, externalMarks: Number, semester: Number }]
});

const IntraSemesterMarksSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  semesters: [{
    semester: Number,
    subjects: [String], // ["DBMS", "DLD", ...]
    exams: [{
      title: String, // "Module1-PreT1"
      marks: [mongoose.Schema.Types.Mixed]
    }]
  }]
});

const NotificationSchema = new mongoose.Schema({
  regNumber: { type: String, required: true },
  upcomingExams: [String],
  assignmentDeadlines: [String],
  academicCalendarUpdates: [String]
});

const FinancialSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  feePaymentStatus: String,
  pendingFees: Number,
  totalFees: Number,
  lastPaymentSemester: Number,
  semesterWiseFees: [{
    semester: Number,
    total: Number,
    paid: Number,
    pending: Number,
    status: String,
    lastPaymentDate: String
  }],
  paymentHistory: [{
    date: String,
    amount: Number,
    receipt: String,
    semester: Number,
    method: { type: String, default: 'Online' }
  }],
  scholarshipStatus: String
});

const CommunicationSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  facultyContact: [{ role: String, name: String, email: String }],
  classAdvisor: { name: String, email: String, phone: String },
  academicOfficeContacts: [{ department: String, email: String }]
});

const InsightSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  strongSubjects: [String],
  weakSubjects: [String],
  improvementSuggestions: [String]
});

const AdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: String
});

const Models = {
  Student: mongoose.models.Student || mongoose.model('Student', StudentSchema),
  Attendance: mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema),
  AcademicStatus: mongoose.models.AcademicStatus || mongoose.model('AcademicStatus', AcademicStatusSchema),
  AcademicPerformance: mongoose.models.AcademicPerformance || mongoose.model('AcademicPerformance', AcademicPerformanceSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', NotificationSchema),
  Financial: mongoose.models.Financial || mongoose.model('Financial', FinancialSchema),
  Communication: mongoose.models.Communication || mongoose.model('Communication', CommunicationSchema),
  Insight: mongoose.models.Insight || mongoose.model('Insight', InsightSchema),
  Admin: mongoose.models.Admin || mongoose.model('Admin', AdminSchema),
  IntraSemesterMarks: mongoose.models.IntraSemesterMarks || mongoose.model('IntraSemesterMarks', IntraSemesterMarksSchema),
  DailyAttendance: mongoose.models.DailyAttendance || mongoose.model('DailyAttendance', DailyAttendanceSchema)
};

module.exports = Models;
