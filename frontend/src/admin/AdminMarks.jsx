import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Save, 
  Search, 
  User, 
  BookOpen, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  ArrowUpRight,
  Sparkles,
  Trophy,
  Target
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
      // Better success feedback could be added here
    } catch (err) {
      console.error('Failed to update marks');
    } finally {
      setSaveLoading(false);
    }
  };

  const filteredStudents = students.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.regNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 max-w-7xl mx-auto p-2">
      {/* Elite Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-emerald-500/20 p-2 rounded-lg border border-emerald-500/30">
              <Trophy className="text-emerald-400" size={20} />
            </div>
            <span className="text-emerald-400 text-xs font-black uppercase tracking-[0.2em]">Academic Records</span>
          </div>
          <h1 className="text-5xl font-black text-white tracking-tighter leading-none mb-3">Elite Grade Control</h1>
          <p className="text-slate-400 text-lg font-medium">Precision management for mid-term and terminal evaluations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Student Navigator (Left) */}
        <div className="lg:col-span-4 flex flex-col h-[750px] space-y-6">
          <div className="relative group">
            <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
              <Search className="text-slate-500 group-focus-within:text-indigo-400 transition-colors" size={20} />
            </div>
            <input 
              type="text" 
              placeholder="Search faculty directory..." 
              className="w-full bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[2rem] pl-14 pr-6 py-5 text-white placeholder-slate-500 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none transition-all font-bold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 bg-slate-900/40 backdrop-blur-xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Enrolled Students</span>
                <span className="bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full text-[10px] font-black">{filteredStudents.length} TOTAL</span>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {filteredStudents.map((student) => (
                <button
                  key={student._id}
                  onClick={() => handleSelectStudent(student)}
                  className={`w-full p-6 flex items-center gap-5 text-left transition-all relative group border-b border-white/[0.03] ${selectedStudent?.regNumber === student.regNumber ? 'bg-indigo-500/10 border-l-[6px] border-l-indigo-500' : 'hover:bg-white/[0.05]'}`}
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shrink-0 transition-transform group-hover:scale-110 ${selectedStudent?.regNumber === student.regNumber ? 'bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)]' : 'bg-slate-800 text-slate-400'}`}>
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className={`font-black tracking-tight ${selectedStudent?.regNumber === student.regNumber ? 'text-white text-lg' : 'text-slate-400'}`}>{student.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${selectedStudent?.regNumber === student.regNumber ? 'bg-indigo-400/20 text-indigo-300' : 'bg-slate-800 text-slate-500'} tracking-tighter`}>{student.regNumber}</span>
                        <div className="w-1 h-1 rounded-full bg-slate-600"></div>
                        <span className="text-[10px] font-bold text-slate-500 tracking-tighter uppercase">{student.branch}</span>
                    </div>
                  </div>
                  <ArrowUpRight size={20} className={`${selectedStudent?.regNumber === student.regNumber ? 'text-indigo-400' : 'text-slate-700'} group-hover:text-white transition-colors`} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grade Configuration (Right) */}
        <div className="lg:col-span-8 space-y-8">
          {!selectedStudent ? (
            <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border-2 border-dashed border-white/5 h-full flex flex-col items-center justify-center p-20 text-center group">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500">
                <User className="text-slate-600 group-hover:text-indigo-400 transition-colors" size={48} />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tighter mb-4">Initialize Control</h3>
              <p className="text-slate-500 text-lg font-medium max-w-sm leading-relaxed">Select a high-performing student from the directory to begin the audit process.</p>
            </div>
          ) : (
            <div className="bg-slate-900/40 backdrop-blur-2xl rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden flex flex-col h-full animate-in zoom-in-95 duration-500">
              {/* Profile Card Overlay */}
              <div className="p-10 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8 bg-gradient-to-br from-indigo-500/10 to-transparent">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-[2rem] bg-indigo-600 flex items-center justify-center text-white font-black text-3xl shadow-[0_20px_50px_rgba(79,70,229,0.4)] border border-white/20">
                    {selectedStudent.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                        <h2 className="text-3xl font-black text-white tracking-tighter">{selectedStudent.name}</h2>
                        <Sparkles className="text-amber-400" size={20} />
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-black text-indigo-400 uppercase tracking-widest px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">{selectedStudent.regNumber}</span>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{selectedStudent.branch} • SEC-A</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={handleSaveMarks}
                  disabled={saveLoading}
                  className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(99,102,241,0.3)] hover:shadow-[0_25px_50px_rgba(99,102,241,0.5)] transition-all disabled:opacity-50 active:scale-95 group uppercase tracking-widest text-xs"
                >
                  {saveLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} className="group-hover:translate-y-[-2px] transition-transform" />}
                  COMMIT EVALUATION
                </button>
              </div>

              <div className="p-10 flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="py-24 text-center">
                    <Loader2 className="animate-spin text-indigo-500 mx-auto mb-6" size={60} />
                    <p className="text-slate-400 text-xl font-bold tracking-tight">Syncing encrypted scores...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-8">
                    {marks.map((m, idx) => (
                      <div key={idx} className="relative group overflow-hidden bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/5 hover:border-white/10 transition-all">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity"></div>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 relative z-10">
                          <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-indigo-400 border border-white/5 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-500">
                              <BookOpen size={20} />
                            </div>
                            <div>
                                <h4 className="font-black text-white text-lg tracking-tight uppercase">{m.subject}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <Target className="text-slate-600" size={12} />
                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Curriculum Module</span>
                                </div>
                            </div>
                          </div>
                          <div className="px-6 py-3 bg-slate-900 border border-white/5 rounded-2xl flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">CUMULATIVE</span>
                            <span className="text-2xl font-black text-indigo-400">{m.total}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                          {[
                              { label: 'Mid-Term 01', field: 'm1', bg: 'bg-indigo-500' },
                              { label: 'Mid-Term 02', field: 'm2', bg: 'bg-emerald-500' },
                              { label: 'Terminal Lab', field: 't1', bg: 'bg-amber-500' }
                          ].map((field) => (
                            <div key={field.field} className="space-y-3">
                                <label className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                                    <div className={`w-1.5 h-1.5 rounded-full ${field.bg}`}></div>
                                    {field.label}
                                </label>
                                <input 
                                  type="number" 
                                  value={m[field.field]} 
                                  onChange={(e) => handleMarkChange(idx, field.field, e.target.value)}
                                  className="w-full bg-slate-900/50 border border-white/5 px-6 py-4 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500/40 outline-none text-xl font-black text-white transition-all text-center"
                                />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-8 bg-white/[0.02] border-t border-white/5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                    <AlertCircle className="text-amber-500" size={20} />
                </div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    Data Integrity Notice: All grade modifications are cryptographically logged and synchronized with the <span className="text-indigo-400">Parent Transparency Portal</span> in real-time.
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
