import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Mail, 
  Phone, 
  CheckCircle2, 
  X,
  Loader2,
  Trash2,
  AlertCircle
} from 'lucide-react';

const AdminStudents = () => {
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Helper to format semester label
  const getSemesterLabel = (sem) => {
    if (!sem) return 'N/A';
    const num = parseInt(sem);
    if (isNaN(num)) return sem;
    const year = Math.ceil(num / 2);
    const suffix = year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th';
    return `${year}${suffix} Year - Sem ${num}`;
  };
  
  const [formData, setFormData] = useState({
    name: '',
    regNumber: '',
    branch: '',
    semester: '',
    phone: '',
    email: '',
    attendance: '',
    cgpa: '',
    fees: '',
    backlogs: ''
  });

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/v1/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    if (location.pathname === '/admin/students/add') {
      openAddModal();
    }
  }, [location.pathname]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    try {
      if (editMode) {
        await axios.put(`/api/v1/admin/students/update/${selectedStudent._id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('/api/v1/admin/students/add', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setShowModal(false);
      setFormData({ name: '', regNumber: '', branch: '', semester: '', phone: '', email: '', attendance: '', cgpa: '', fees: '', backlogs: '' });
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.error || 'Operation failed');
    }
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormData({ name: '', regNumber: '', branch: '', semester: '', phone: '', email: '', attendance: '', cgpa: '', fees: '', backlogs: '' });
    setShowModal(true);
  };

  const openEditModal = (student) => {
    setEditMode(true);
    setSelectedStudent(student);
    setFormData({
      name: student.name || '',
      regNumber: student.regNumber || '',
      branch: student.branch || '',
      semester: student.semester || '',
      phone: student.phone || '',
      email: student.email || '',
      attendance: student.attendance || '',
      cgpa: student.cgpa || '',
      fees: student.fees || '',
      backlogs: student.backlogs || ''
    });
    setShowModal(true);
  };

  const [alertLoading, setAlertLoading] = useState({});

  const sendAttendanceAlert = async (regNumber) => {
    setAlertLoading(prev => ({ ...prev, [regNumber]: true }));
    const token = localStorage.getItem('adminToken');
    try {
      await axios.post('/api/v1/admin/send-attendance-alert', { regNumber }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Attendance alert sent successfully');
    } catch (err) {
      alert('Error sending alert');
    } finally {
      setAlertLoading(prev => ({ ...prev, [regNumber]: false }));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student and ALL their records? This cannot be undone.')) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      await axios.delete(`/api/v1/admin/students/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchStudents();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.regNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Student Management</h1>
          <p className="text-slate-500 text-sm">Managing records of {students.length} students</p>
        </div>
        <button 
          onClick={openAddModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-medium whitespace-nowrap"
        >
          <Plus size={20} />
          Add New Student
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2">
          <Search className="text-slate-400 ml-2" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or registration number..." 
            className="bg-transparent border-none focus:ring-0 text-sm w-full py-1 dark:text-gray-100"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Branch/Sem</th>
                <th className="px-6 py-4 text-center">Attendance</th>
                <th className="px-6 py-4 text-center">CGPA</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto mb-2" size={24} />
                    <span className="text-sm text-slate-400">Loading student records...</span>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <span className="text-sm text-slate-400">No student records found.</span>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr key={student._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                          {student.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-gray-100">{student.name}</p>
                          <p className="text-xs text-slate-500 uppercase font-medium">{student.regNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 dark:text-gray-300 font-medium">{student.branch}</p>
                      <p className="text-xs text-slate-500">{getSemesterLabel(student.semester)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-center">
                        <span className={`text-sm font-bold ${(student.attendance || 0) < 75 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {student.attendance || 0}%
                        </span>
                        {(student.attendance || 0) < 75 && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              sendAttendanceAlert(student.regNumber);
                            }}
                            disabled={alertLoading[student.regNumber]}
                            className="text-[10px] text-red-600 hover:bg-red-50 disabled:bg-slate-50 disabled:text-slate-400 px-2 py-0.5 rounded border border-red-200 mt-1 flex items-center gap-1 transition-all"
                          >
                            {alertLoading[student.regNumber] ? <Loader2 size={10} className="animate-spin" /> : null}
                            {alertLoading[student.regNumber] ? 'Sending...' : 'Send Alert'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className="text-sm font-bold text-slate-700 dark:text-gray-300">{student.cgpa || '0.00'}</span>
                    </td>
                    <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${student.backlogs > 0 ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                            {student.backlogs > 0 ? 'Backlogs Active' : 'Consistent'}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(student)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Edit Details"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(student._id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Student"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h2 className="text-lg font-bold text-slate-800 dark:text-white">
                {editMode ? 'Edit Student Record' : 'Enroll New Student'}
              </h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 grid grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                <input 
                  type="text" name="name" required value={formData.name} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reg Number</label>
                <input 
                  type="text" name="regNumber" required value={formData.regNumber} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                <input 
                  type="email" name="email" required value={formData.email} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                <input 
                  type="text" name="phone" required value={formData.phone} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Branch</label>
                <input 
                  type="text" name="branch" value={formData.branch} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Semester</label>
                <input 
                  type="number" name="semester" value={formData.semester} onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-indigo-500 outline-none text-sm dark:text-white"
                />
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl col-span-2 grid grid-cols-4 gap-4">
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Attendance %</label>
                      <input type="number" name="attendance" value={formData.attendance} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-900 border-none rounded-lg p-2 text-sm font-bold shadow-sm dark:text-white" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">CGPA</label>
                      <input type="number" step="0.01" name="cgpa" value={formData.cgpa} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-900 border-none rounded-lg p-2 text-sm font-bold shadow-sm dark:text-white" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Fees Due</label>
                      <input type="number" name="fees" value={formData.fees} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-900 border-none rounded-lg p-2 text-sm font-bold shadow-sm dark:text-white" />
                  </div>
                  <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">Backlogs</label>
                      <input type="number" name="backlogs" value={formData.backlogs} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-900 border-none rounded-lg p-2 text-sm font-bold shadow-sm dark:text-white" />
                  </div>
              </div>

              <div className="col-span-2 pt-4">
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  {editMode ? 'Update Database Record' : 'Enroll Student'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStudents;
