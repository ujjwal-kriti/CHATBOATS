import { Phone, Mail, User2, Building2 } from 'lucide-react';

export default function QuickContacts() {
  const contacts = [
    {
      role: 'Class Advisor',
      name: 'Prof. Sarah Jenkins',
      phone: '+1 (555) 123-4567',
      email: 's.jenkins@university.edu',
      icon: User2,
    },
    {
      role: 'Child Counsellor',
      name: 'Dr. Emily Watson',
      phone: '+1 (555) 234-5678',
      email: 'e.watson@university.edu',
      icon: User2,
    }
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm p-6 transition-colors duration-300">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-gray-100 mb-5 flex items-center gap-2">
        <Phone className="w-5 h-5 text-blue-500" />
        Quick Contacts
      </h3>
      <div className="space-y-4">
        {contacts.map((contact, idx) => {
          const Icon = contact.icon;
          return (
            <div key={idx} className="flex flex-col gap-2 p-4 rounded-xl bg-slate-50 dark:bg-gray-700/50 border border-slate-200 dark:border-gray-600">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg text-blue-600 dark:text-blue-400">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider">{contact.role}</p>
                  <p className="font-semibold text-slate-900 dark:text-gray-100">{contact.name}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <a
                  href={`tel:${contact.phone}`}
                  className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Phone className="w-4 h-4 text-emerald-500" />
                  Call
                </a>
                <a
                  href={`mailto:${contact.email}`}
                  className="flex-1 flex justify-center items-center gap-2 py-2 text-sm font-medium text-slate-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-slate-200 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-4 h-4 text-blue-500" />
                  Email
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
