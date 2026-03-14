const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/chatboat', {
  // Use new options for mongoose 6+ are defaults, but keeping safe URI string
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error.message);
});

// Define Schemas

const StudentSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  parentPhone: { type: String, required: true },
  name: String,
  branch: String,
  semester: Number
});

const AttendanceSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  overallPercentage: Number,
  subjectWise: [{ subject: String, attendance: Number }],
  semesterWise: [{ semester: Number, attendance: Number }],
  lowAttendanceAlerts: [String]
});

const AcademicStatusSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  numberOfBacklogs: Number,
  repeatedSubjects: [String],
  incompleteSubjects: [String],
  courseCompletionStatus: String
});

const AcademicPerformanceSchema = new mongoose.Schema({
  regNumber: { type: String, required: true, unique: true },
  currentCGPA: Number,
  yearWiseCGPA: [{ year: Number, cgpa: Number }],
  semesterWiseCGPA: [{ semester: Number, sgpa: Number }],
  subjectWiseMarks: [{ subject: String, grade: String, marks: Number }]
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
  paymentHistory: [{ date: String, amount: Number, receipt: String }],
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

const Models = {
  Student: mongoose.models.Student || mongoose.model('Student', StudentSchema),
  Attendance: mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema),
  AcademicStatus: mongoose.models.AcademicStatus || mongoose.model('AcademicStatus', AcademicStatusSchema),
  AcademicPerformance: mongoose.models.AcademicPerformance || mongoose.model('AcademicPerformance', AcademicPerformanceSchema),
  Notification: mongoose.models.Notification || mongoose.model('Notification', NotificationSchema),
  Financial: mongoose.models.Financial || mongoose.model('Financial', FinancialSchema),
  Communication: mongoose.models.Communication || mongoose.model('Communication', CommunicationSchema),
  Insight: mongoose.models.Insight || mongoose.model('Insight', InsightSchema)
};

module.exports = Models;
