import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, 
  Search, 
  User, 
  BookOpen, 
  Loader2, 
  CheckCircle2,
  AlertCircle 
} from 'lucide-react';

const AdminMarks = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/v1/admin/students', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStudents(response.data);
    } catch (err) {
      console.error('Error fetching students');
    }
  };

  const fetchMarks = async (regNumber) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`/api/v1/admin/marks/${regNumber}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMarks(response.data.length > 0 ? response.data : [
        { subject: 'Data Structures', m1: 0, m2: 0, t1: 0, total: 0 },
        { subject: 'Operating Systems', m1: 0, m2: 0, t1: 0, total: 0 },
        { subject: 'Computer Networks', m1: 0, m2: 0, t1: 0, total: 0 },
        { subject: 'Artificial Intelligence', m1: 0, m2: 0, t1: 0, total: 0 },
        { subject: 'Cloud Computing', m1: 0, m2: 0, t1: 0, total: 0 }
      ]);
    } catch (err) {
      console.error('Error fetching marks');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    fetchMarks(student.regNumber);
  };

  const handleMarkChange = (index, field, value) => {
    const updatedMarks = [...marks];
    updatedMarks[index][field] = parseInt(value) || 0;
    // Auto-calculate total: M1 + M2 + T1
    updatedMarks[index].total = updatedMarks[index].m1 + updatedMarks[index].m2 + updatedMarks[index].t1;
    setMarks(updatedMarks);
  };

  const handleSaveMarks = async () => {
    setSaveLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      await axios.post('/api/v1/admin/marks/update', {
        regNumber: selectedStudent.regNumber,
        marks: marks
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Marks updated successfully');
    } catch (err) {
      alert('Failed to update marks');
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.regNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Academic Grades Management</h1>
          <p className="text-slate-500 text-sm">Update Mid-term (M1, M2) and Terminal (T1) marks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Student Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Search className="text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter students..." 
              className="bg-transparent border-none focus:ring-0 text-sm w-full dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredStudents.map((student) => (
              <button
                key={student._id}
                onClick={() => handleSelectStudent(student)}
                className={`w-full p-4 flex items-center gap-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all border-b border-slate-50 dark:border-slate-800 ${selectedStudent?.regNumber === student.regNumber ? 'bg-indigo-50 dark:bg-indigo-500/10 border-l-4 border-l-indigo-500' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold shrink-0 uppercase">
                  {student.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className={`font-bold text-sm truncate ${selectedStudent?.regNumber === student.regNumber ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-gray-200'}`}>{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{student.regNumber}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Marks Entry Form */}
        <div className="lg:col-span-2 space-y-6">
          {!selectedStudent ? (
            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 h-full flex flex-col items-center justify-center p-12 text-center">
              <User className="text-slate-300 dark:text-slate-700 mb-4" size={64} />
              <h3 className="text-lg font-bold text-slate-400">Select a student</h3>
              <p className="text-sm text-slate-400 max-w-xs">Choose a student from the left panel to begin updating their academic marks.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col h-full animate-in fade-in duration-500">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-indigo-50/30 dark:bg-indigo-500/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold dark:text-white">{selectedStudent.name}</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.1em]">{selectedStudent.regNumber} • {selectedStudent.branch}</p>
                  </div>
                </div>
                <button 
                  onClick={handleSaveMarks}
                  disabled={saveLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all disabled:opacity-50 active:scale-95"
                >
                  {saveLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  Save All Changes
                </button>
              </div>

              <div className="p-8 overflow-y-auto">
                <div className="grid grid-cols-1 gap-6">
                  {loading ? (
                    <div className="py-20 text-center">
                      <Loader2 className="animate-spin text-indigo-500 mx-auto mb-4" size={40} />
                      <p className="text-slate-400 font-medium">Retrieving semester scores...</p>
                    </div>
                  ) : (
                    marks.map((m, idx) => (
                      <div key={idx} className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-800">
                              <BookOpen size={16} />
                            </div>
                            <h4 className="font-black text-slate-800 dark:text-gray-100 uppercase tracking-widest text-[11px]">{m.subject}</h4>
                          </div>
                          <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">
                            Total: {m.total}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mid 1 (M1)</label>
                            <input 
                              type="number" 
                              value={m.m1} 
                              onChange={(e) => handleMarkChange(idx, 'm1', e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mid 2 (M2)</label>
                            <input 
                              type="number" 
                              value={m.m2} 
                              onChange={(e) => handleMarkChange(idx, 'm2', e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold dark:text-white"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tutorial (T1)</label>
                            <input 
                              type="number" 
                              value={m.t1} 
                              onChange={(e) => handleMarkChange(idx, 't1', e.target.value)}
                              className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-4 py-2.5 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-bold dark:text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <AlertCircle className="text-amber-500" size={18} />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Changes saved here will be immediately visible on the Parent Dashboard.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminMarks;
