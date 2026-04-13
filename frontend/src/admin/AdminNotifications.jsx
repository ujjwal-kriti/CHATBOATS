import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Send, 
  MessageSquare, 
  Users, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  Mail
} from 'lucide-react';

const AdminNotifications = () => {
  const [students, setStudents] = useState([]);
  const [selectedRegs, setSelectedRegs] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
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
        setFetching(false);
      }
    };
    fetchStudents();
  }, []);

  const handleSelectAll = () => {
    if (selectedRegs.length === students.length) {
      setSelectedRegs([]);
    } else {
      setSelectedRegs(students.map(s => s.regNumber));
    }
  };

  const handleToggleSelect = (reg) => {
    if (selectedRegs.includes(reg)) {
      setSelectedRegs(selectedRegs.filter(r => r !== reg));
    } else {
      setSelectedRegs([...selectedRegs, reg]);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (selectedRegs.length === 0) return alert('Select at least one student');
    
    setLoading(true);
    const token = localStorage.getItem('adminToken');
    try {
      await axios.post('/api/v1/admin/send-exam-notification', {
        regNumbers: selectedRegs,
        message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Notifications sent successfully');
      setMessage('');
      setSelectedRegs([]);
    } catch (err) {
      alert('Error sending notifications');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-gray-100">Notification Broadcast</h1>
        <p className="text-slate-500 text-sm font-medium">Send priority academic updates to parents and students</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recipient Selection */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col h-[500px]">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users size={18} className="text-indigo-500" />
              Select Recipients
            </h3>
            <button 
              onClick={handleSelectAll}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              {selectedRegs.length === students.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="flex-1 overflow-auto p-4 space-y-2">
            {fetching ? (
                 <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-indigo-500" />
                 </div>
            ) : students.map(student => (
              <div 
                key={student.regNumber}
                onClick={() => handleToggleSelect(student.regNumber)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedRegs.includes(student.regNumber)
                    ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                    : 'bg-white border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-indigo-100'
                }`}
              >
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${selectedRegs.includes(student.regNumber) ? 'bg-indigo-500' : 'bg-slate-200'}`}></div>
                    <div>
                        <p className="text-sm font-bold text-slate-700 dark:text-gray-200">{student.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">{student.regNumber}</p>
                    </div>
                </div>
                {selectedRegs.includes(student.regNumber) && <CheckCircle2 size={16} className="text-indigo-500" />}
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 font-medium">{selectedRegs.length} Recipients selected</p>
          </div>
        </div>

        {/* Message Composition */}
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <Mail size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">Compose Broadcast</h3>
                </div>

                <form onSubmit={handleSendNotification} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Message Content</label>
                        <textarea 
                            rows="6"
                            placeholder="Type your academic notification here..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        ></textarea>
                    </div>

                    <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-xl flex gap-3">
                        <AlertCircle className="text-amber-600 shrink-0" size={20} />
                        <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed font-medium">
                            Warning: This message will be sent via email to all selected student/parent accounts. Ensure the content is accurate and verified.
                        </p>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading || selectedRegs.length === 0}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                        Dispatch Notifications
                    </button>
                </form>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-400 text-center uppercase font-bold tracking-widest mb-4 italic">Message Preview</p>
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-inner">
                    <p className="text-xs text-slate-400 mb-2">Subject: Academic Notification: Upcoming Exams</p>
                    <p className="text-[10px] text-slate-500 leading-relaxed whitespace-pre-wrap italic">
                        Dear Parent/Student,
                        {"\n\n"}
                        {message || "[Your message will appear here]"}
                        {"\n\n"}
                        Regards,{"\n"}Academic Office
                    </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AdminNotifications;
