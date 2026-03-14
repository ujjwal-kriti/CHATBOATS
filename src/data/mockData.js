// Mock data for Parent Academic Monitoring System Dashboard

export const studentDetails = {
  name: "Rahul Sharma",
  registrationNumber: "21BCS045",
  department: "Computer Science & Engineering",
  year: "3rd Year",
  section: "B",
  parentPhone: "+91 98765 43210",
};

export const studentData = { ...studentDetails };

export const academicSummary = {
  attendancePercentage: 78,
  cgpa: 8.2,
  backlogsCount: 1,
  pendingFees: "12,500",
};

export const attendanceData = [
  { subject: "Mathematics", attendance: 72, fullMarks: 100 },
  { subject: "DSA", attendance: 85, fullMarks: 100 },
  { subject: "Operating Systems", attendance: 80, fullMarks: 100 },
  { subject: "DBMS", attendance: 75, fullMarks: 100 },
];

export const cgpaTrend = [
  { semester: "Sem 1", cgpa: 7.5 },
  { semester: "Sem 2", cgpa: 7.8 },
  { semester: "Sem 3", cgpa: 8.0 },
  { semester: "Sem 4", cgpa: 8.1 },
  { semester: "Sem 5", cgpa: 8.2 },
  { semester: "Sem 6", cgpa: 8.2 },
];

export const alerts = [
  { id: 1, type: "attendance", title: "Low Attendance", message: "Mathematics attendance is below 75%. Please ensure regular class attendance.", date: "2025-03-12" },
  { id: 2, type: "exam", title: "Upcoming Exam", message: "DSA Mid-Term Exam on March 20, 2025", date: "2025-03-20" },
  { id: 3, type: "assignment", title: "Assignment Deadline", message: "DBMS Assignment 3 due by March 15, 2025", date: "2025-03-15" },
  { id: 4, type: "exam", title: "Semester Registration", message: "Semester 7 registration opens March 25, 2025", date: "2025-03-25" },
];

export const performanceInsights = {
  strongSubject: "Data Structures & Algorithms",
  weakSubject: "Mathematics",
  suggestion: "Improve practice in Calculus topics. Consider attending extra classes for Mathematics.",
};

export const chatbotResponses = [
  "Your child's attendance is at 78%. Mathematics needs improvement.",
  "Current CGPA is 8.2. Great progress this semester!",
  "1 backlog pending in DBMS. Retest scheduled for April.",
  "Fee payment of ₹12,500 is pending. Please pay before March 31.",
  "I can help you with attendance, grades, fees, and exam schedules.",
];
