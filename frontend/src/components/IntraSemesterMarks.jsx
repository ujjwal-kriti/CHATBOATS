import React, { useState } from 'react';
import { ClipboardList, LayoutGrid, Layers, Filter } from 'lucide-react';

const IntraSemesterMarks = ({ marks }) => {
  const [selectedModule, setSelectedModule] = useState('m1');

  // 'marks' is now the IntraSemesterMarks object: { subjects: [], exams: [] }
  if (!marks || !marks.subjects || marks.subjects.length === 0) {
    return (
      <div className="bg-[#0F172A] rounded-2xl border border-slate-800 shadow-2xl p-8 text-center">
        <p className="text-slate-500 font-medium tracking-tight">No intra-semester marks available yet.</p>
      </div>
    );
  }

  const { subjects, exams } = marks;

  // Filter exams based on selected module
  const filteredExams = exams.filter(exam => {
    if (selectedModule === 'm1') return exam.title.toLowerCase().includes('module1');
    if (selectedModule === 'm2') return exam.title.toLowerCase().includes('module2');
    return true;
  });

  return (
    <div className="bg-[#111827] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
      <div className="p-6 border-b border-slate-800 bg-[#1F2937]/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-xl">
            <ClipboardList className="text-indigo-400" size={20} />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Intra Semester Examinations</h3>
            <p className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 tracking-tighter">Granular Performance Breakdown</p>
          </div>
        </div>

        {/* Module Selector */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
          <button 
            onClick={() => setSelectedModule('m1')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedModule === 'm1' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Module 1
          </button>
          <button 
            onClick={() => setSelectedModule('m2')}
            className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedModule === 'm2' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
          >
            Module 2
          </button>
        </div>
      </div>

      <div className="overflow-x-auto relative custom-scrollbar">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-[#111827]">
              <th className="sticky left-0 z-20 bg-[#111827] text-left p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-r border-slate-800 min-w-[240px]">
                Examination / Assessment
              </th>
              {subjects.map((sub, idx) => (
                <th key={idx} className="p-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-800 min-w-[100px] bg-[#111827]">
                  {sub}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredExams.map((exam, examIdx) => (
              <tr key={examIdx} className="hover:bg-indigo-500/5 transition-colors group">
                <td className="sticky left-0 z-10 bg-[#111827] p-4 border-r border-slate-800 whitespace-nowrap">
                  <span className="text-[11px] font-bold text-slate-400 group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                    {exam.title}
                  </span>
                </td>
                {exam.marks.map((val, markIdx) => {
                  const isNumber = typeof val === 'number';
                  const isLow = isNumber && val < 9;
                  const isHigh = isNumber && val >= 15;
                  
                  return (
                    <td key={markIdx} className="p-4 text-center border-slate-800/20">
                      <span className={`text-xs font-black tracking-tighter ${
                        !isNumber ? 'text-slate-700' :
                        isLow ? 'text-rose-500' : 
                        isHigh ? 'text-emerald-400' : 
                        'text-slate-400 font-bold'
                      }`}>
                        {val === -1 ? '-' : val}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-4 bg-[#1F2937]/30 border-t border-slate-800 flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500" />
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Attention Required ( {'<'} 9)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Excellence Detected ({'>='} 15)</span>
        </div>
        {filteredExams.length === 0 && (
          <div className="flex-1 text-center">
             <span className="text-[10px] font-bold text-rose-400 uppercase italic">No data available for the selected module filter.</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntraSemesterMarks;
