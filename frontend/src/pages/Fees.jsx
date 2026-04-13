import { useState, useEffect } from 'react';
import { IndianRupee, Wallet, CheckCircle2, AlertTriangle, Receipt, GraduationCap, CreditCard, ChevronRight, Activity } from 'lucide-react';
import { useSemester } from '../context/SemesterContext';

export default function Fees() {
  const [financials, setFinancials] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { selectedSemester } = useSemester();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const queryParams = selectedSemester && selectedSemester !== 'all' ? `?semester=${selectedSemester}` : '';
        
        // Fetch Financials
        // Endpoint expected: /api/v1/student/financials
        const finRes = await fetch(`/api/v1/student/financials${queryParams}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!finRes.ok) throw new Error('Failed to fetch financial data');
        const finData = await finRes.json();
        
        setFinancials(finData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedSemester]);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-slate-500 font-medium">Loading Financial Records...</p>
    </div>
  );

  if (error) return (
    <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center gap-3">
      <AlertTriangle className="w-5 h-5" />
      <span className="font-semibold">Error: {error}</span>
    </div>
  );

  // Derive values (Some of these might be hardcoded/estimated if backend doesn't explicitly send them yet)
  const paymentHistory = financials?.paymentHistory || [];
  const totalPaid = paymentHistory.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  const pendingFees = financials?.pendingFees || 0;
  const totalFees = totalPaid + pendingFees;
  const isFullyPaid = pendingFees === 0;

  // Find last payment details
  const lastPayment = paymentHistory.length > 0 ? paymentHistory[paymentHistory.length - 1] : null;

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase flex items-center gap-3">
            Fee <span className={isFullyPaid ? "text-emerald-500" : "text-amber-500"}>Status</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Tracking payments, dues, and scholarships</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Fees */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-gray-700 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-slate-600 dark:text-gray-300" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Fees</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                ₹{totalFees.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Paid Amount */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid Amount</p>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-500">
                ₹{totalPaid.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Pending Fees */}
        <div className={`border rounded-3xl p-6 shadow-sm transition-all ${
          !isFullyPaid 
            ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800/50' 
            : 'bg-white dark:bg-gray-800 border-slate-200 dark:border-gray-700'
        }`}>
          <div className="flex items-center gap-4 mb-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              !isFullyPaid 
                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' 
                : 'bg-slate-50 dark:bg-gray-700 text-slate-400'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Pending</p>
              <p className={`text-3xl font-black ${
                !isFullyPaid ? 'text-amber-600 dark:text-amber-500' : 'text-slate-900 dark:text-white'
              }`}>
                ₹{pendingFees.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Scholarship Indicator */}
        <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-3xl p-6 shadow-sm flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="w-5 h-5 text-indigo-500" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Scholarship Status</p>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
            {financials?.scholarshipStatus || 'N/A'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Area (Payment Status + History) */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Current Payment Status Hero */}
           <div className={`rounded-[2.5rem] p-8 shadow-sm border border-slate-200 dark:border-gray-700 relative overflow-hidden flex items-center justify-between ${
              isFullyPaid ? 'bg-emerald-50 dark:bg-emerald-900/10' : 'bg-[#0F172A]'
           }`}>
              {/* Desktop Decorative Element */}
              {!isFullyPaid && (
                 <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[80px] -mr-20 -mt-20" />
              )}
              
              <div className="relative z-10">
                 <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-md mb-4 border border-white/5 dark:border-gray-600">
                    <Activity className={`w-3.5 h-3.5 ${isFullyPaid ? 'text-emerald-500' : 'text-amber-400'}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isFullyPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-400'}`}>Current Status</span>
                 </div>
                 
                 <h2 className={`text-3xl font-black uppercase tracking-tight mb-2 ${isFullyPaid ? 'text-emerald-600 dark:text-emerald-500' : 'text-white'}`}>
                    {financials?.feePaymentStatus || (isFullyPaid ? 'Fully Paid' : 'Partially Paid')}
                 </h2>
                 
                 {lastPayment ? (
                    <div className="flex items-center gap-4 text-sm mt-4 font-medium">
                       <span className={isFullyPaid ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'}>
                          Last Payment: <strong className={isFullyPaid ? 'dark:text-emerald-100' : 'text-white'}>₹{lastPayment.amount.toLocaleString()}</strong>
                       </span>
                       <span className={isFullyPaid ? 'text-emerald-700/50' : 'text-slate-600'}>•</span>
                       <span className={isFullyPaid ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400'}>
                          Date: <strong className={isFullyPaid ? 'dark:text-emerald-100' : 'text-white'}>{new Date(lastPayment.date).toLocaleDateString()}</strong>
                       </span>
                    </div>
                 ) : (
                    <p className="text-slate-400 text-sm mt-4 font-medium">No prior payments recorded.</p>
                 )}
              </div>
              
              <div className="hidden sm:flex shrink-0 w-24 h-24 rounded-full items-center justify-center relative z-10 dark:bg-gray-800 bg-white shadow-lg border border-slate-100 dark:border-gray-700">
                 {isFullyPaid ? <CheckCircle2 className="w-12 h-12 text-emerald-500" /> : <CreditCard className="w-12 h-12 text-slate-300 dark:text-gray-600" />}
              </div>
           </div>

           {/* Payment History Table */}
           <div className="bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-[2rem] overflow-hidden shadow-sm">
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-900/20 flex justify-between items-center">
                 <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-indigo-500" />
                    Transaction History
                 </h3>
                 <span className="text-[10px] font-bold text-slate-400 uppercase">{paymentHistory.length} Records</span>
              </div>
              
              {paymentHistory.length === 0 ? (
                 <div className="p-12 text-center text-slate-400">
                    No payment history available.
                 </div>
              ) : (
                 <div className="overflow-x-auto">
                    <table className="w-full">
                       <thead>
                          <tr className="bg-slate-50 dark:bg-gray-900/50 border-b border-slate-100 dark:border-gray-800">
                             <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                             <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                             <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Receipt / Method</th>
                             <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-gray-700">
                          {paymentHistory.map((p, idx) => (
                             <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-5">
                                   <span className="font-bold text-slate-800 dark:text-gray-200 block text-sm">{new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}</span>
                                </td>
                                <td className="px-6 py-5">
                                   <span className="font-black text-slate-900 dark:text-white">₹{p.amount.toLocaleString()}</span>
                                </td>
                                <td className="px-6 py-5 text-center">
                                   <span className="inline-flex px-3 py-1 rounded-lg bg-slate-100 dark:bg-gray-700 text-slate-600 dark:text-gray-300 text-xs font-bold font-mono">
                                      {p.receipt || 'Online'}
                                   </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                   <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-black">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Successful
                                   </span>
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                 </div>
              )}
           </div>
        </div>

        {/* Right Area (Alerts & Scholarship) */}
        <div className="lg:col-span-1 space-y-6">
           
           {/* Pending Fee Alert Box */}
           <div className={`rounded-[2.5rem] p-8 relative overflow-hidden shadow-sm border ${
              !isFullyPaid 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-amber-600/50' 
                : 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30'
           }`}>
              <div className="relative z-10 flex flex-col h-full items-center text-center">
                 {!isFullyPaid ? (
                    <>
                       <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-6 shadow-inner">
                          <AlertTriangle className="w-8 h-8 text-white" />
                       </div>
                       
                       <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-2">Pending Fee Alert</p>
                       <p className="text-3xl font-black text-white shrink-0 mb-4">₹{pendingFees.toLocaleString()}</p>
                       
                       <div className="w-full p-4 bg-white/10 rounded-2xl border border-white/20 backdrop-blur-sm mt-auto">
                          <p className="text-xs font-bold text-white/90 uppercase mb-1">Due Date</p>
                          <p className="text-sm font-black text-white">30 April 2026</p>
                       </div>
                    </>
                 ) : (
                    <>
                       <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-6">
                          <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                       </div>
                       
                       <p className="text-sm font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-500 mb-2">All Clear</p>
                       <p className="text-slate-600 dark:text-slate-300 font-medium">No pending fees. All payments have been successfully completed.</p>
                    </>
                 )}
              </div>
           </div>

           {/* Scholarship Details */}
           <div className="bg-[#0F172A] rounded-[2.5rem] p-8 shadow-xl border border-slate-800 relative overflow-hidden text-white">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -mr-10 -mt-10" />
              
              <div className="relative z-10">
                 <div className="mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                       <GraduationCap className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-black uppercase tracking-tight">Scholarship Details</h3>
                 </div>
                 
                 <div className="space-y-4">
                    <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scholarship Type</p>
                       <p className="font-bold text-slate-200">{financials?.scholarshipStatus || 'None'}</p>
                    </div>
                    
                    {financials?.scholarshipStatus && financials.scholarshipStatus !== 'General' && (
                       <div className="grid grid-cols-2 gap-4">
                          <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                             <p className="font-black text-emerald-400">₹10,000</p>
                          </div>
                          <div className="p-5 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grant</p>
                             <p className="font-black text-indigo-400">20%</p>
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
