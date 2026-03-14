import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  GraduationCap,
  ArrowRight,
  CalendarCheck,
  Award,
  CreditCard,
  MessageCircle,
  LogIn,
  Shield,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react'
import ThemeToggle from '../components/ThemeToggle'

export default function Landing() {
  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How it works', href: '#how-it-works' },
    { name: 'About', href: '#about' },
  ]

  const features = [
    {
      icon: CalendarCheck,
      title: 'Automated Attendance',
      description: 'Get instant notifications if your child misses a class. Monitor real-time records effortlessly.',
    },
    {
      icon: Award,
      title: 'Performance Insights',
      description: 'Track CGPA progression, view subject-wise results, and analyze academic trends deeply.',
    },
    {
      icon: CreditCard,
      title: 'Fee Management',
      description: 'Stay ahead of due dates with smart alerts for tuition and other institutional fees.',
    },
    {
      icon: MessageCircle,
      title: 'AI Smart Assistant',
      description: 'Ask our 24/7 AI chatbot about anything—from library dues to upcoming examination dates.',
    },
  ]



  return (
    <div className="min-h-screen bg-white dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {/* Header / Navbar section */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#0b0f19]/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex bg-indigo-600 rounded-lg p-2 text-white">
                <GraduationCap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold tracking-tight">EduPortal</span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 font-medium text-sm">
              {navLinks.map((link) => (
                <a 
                  key={link.name} 
                  href={link.href}
                  className="text-slate-600 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Right side buttons */}
            <div className="flex items-center gap-4">
              <ThemeToggle className="hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-full transition-colors" />
              <div className="hidden sm:block h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center justify-center font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Log in
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-indigo-700 hover:shadow-lg dark:hover:bg-indigo-500"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-20">
        
        {/* Chatbot.com style Two-Column Hero */}
        <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              
              {/* Left Column: Text Content */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="max-w-2xl"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6 leading-[1.1]">
                  Connect, track, and support with a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">data-driven</span> parent portal
                </h1>
                <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-lg">
                  Empower your child's success. Track attendance, monitor academic performance, and get instant answers powered by AI—all in one place.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/login"
                    className="inline-flex h-14 items-center justify-center rounded-full bg-indigo-600 px-8 text-lg font-semibold text-white shadow-lg transition-all hover:bg-indigo-700 hover:scale-[1.02]"
                  >
                    Start logging in free
                  </Link>
                  <a
                    href="#features"
                    className="inline-flex h-14 items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-700 px-8 text-lg font-semibold text-slate-700 dark:text-slate-300 transition-all hover:border-indigo-600 hover:text-indigo-600 dark:hover:border-indigo-500 dark:hover:text-indigo-400"
                  >
                    Discover features
                  </a>
                </div>
                <div className="mt-8 flex items-center gap-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required</div>
                  <div className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant access</div>
                </div>
              </motion.div>

              {/* Right Column: Hero Graphic/Mockup */}
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="relative lg:ml-auto w-full max-w-lg lg:max-w-none"
              >
                <div className="relative rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xl p-4 sm:p-6 overflow-hidden">
                  {/* Decorative window controls */}
                  <div className="flex gap-2 mb-6">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  </div>
                  
                  {/* Mockup Content - Chatbot/Dashboard abstract */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex-shrink-0 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-700/50 rounded-2xl rounded-tl-none p-4 max-w-[85%] text-sm text-slate-700 dark:text-slate-300">
                        Hello! I am your AI assistant. Would you like to check attendance or recent grades?
                      </div>
                    </div>
                    <div className="flex items-start gap-4 flex-row-reverse">
                      <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex-shrink-0 flex items-center justify-center">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Felix`} alt="User" className="w-8 h-8 rounded-full" />
                      </div>
                      <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none p-4 max-w-[85%] text-sm">
                        Show me this week's attendance report.
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex-shrink-0 flex items-center justify-center">
                        <MessageCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="bg-slate-100 dark:bg-slate-700/50 rounded-2xl rounded-tl-none p-4 w-full text-sm text-slate-700 dark:text-slate-300 space-y-3">
                        <p>Here is the summary for this week:</p>
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 w-[95%]"></div>
                          </div>
                          <p className="text-xs text-slate-500">Physics: 95% <span className="text-emerald-500 font-medium">Excellent</span></p>
                        </div>
                        <div className="space-y-2">
                          <div className="h-2 w-full bg-slate-200 dark:bg-slate-600 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500 w-[88%]"></div>
                          </div>
                          <p className="text-xs text-slate-500">Mathematics: 88% <span className="text-indigo-500 font-medium">Good</span></p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Faded bottom */}
                  <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-white dark:from-slate-800 to-transparent"></div>
                </div>
                
                {/* Decorative floating elements */}
                <motion.div 
                  initial={{ y: 0 }}
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-6 -bottom-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 hidden sm:flex items-center gap-4"
                >
                  <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">All Clear</p>
                  </div>
                </motion.div>
              </motion.div>
              
            </div>
          </div>
          
          {/* Background decoration */}
          <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[800px] h-[800px] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1423] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                All your child's updates in one connected dashboard
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Forget waiting for parent-teacher meetings. Stay reliably updated with actionable data synchronized dynamically.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="bg-white dark:bg-[#1a2035] rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow"
                >
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center mb-6">
                    <feature.icon className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">{feature.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps section */}
        <section id="how-it-works" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-12 gap-16 items-center">
              
              <div className="lg:col-span-5 lg:order-last">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                  Set up in minutes without any heavy configuration.
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                  Just three quick steps and you're paired with your child's academic profile globally. Safe, secure, and intuitive.
                </p>
                <div className="space-y-6">
                  {[
                    { step: 1, icon: LogIn, text: "Verify with Student ID and Parent contact." },
                    { step: 2, icon: Shield, text: "System safely binds you to the dashboard." },
                    { step: 3, icon: LayoutDashboard, text: "Monitor all notifications and progress daily." }
                  ].map((s) => (
                    <div key={s.step} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {s.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                          <s.icon className="w-4 h-4" /> Step {s.step}
                        </h4>
                        <p className="mt-1 text-slate-600 dark:text-slate-400 text-sm">{s.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-7 bg-indigo-50 dark:bg-slate-800/50 rounded-3xl p-8 sm:p-12">
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700">
                  {/* Dummy UI header */}
                  <div className="border-b border-slate-200 dark:border-slate-800 p-4 font-semibold text-slate-900 dark:text-white flex items-center gap-3">
                    <LayoutDashboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    Parent Dashboard
                  </div>
                  <div className="p-6 grid gap-4 grid-cols-2">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Attendance</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">92.5%</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700">
                      <p className="text-xs text-slate-500 uppercase font-bold mb-1">Current CGPA</p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">8.40</p>
                    </div>
                    <div className="col-span-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-500 uppercase font-bold mb-1">Upcoming Exam</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">Data Structures Midterm</p>
                      </div>
                      <div className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
                        In 3 days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0b0f19] py-24 text-center">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-6">
              Ready to enhance communication?
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
              Set up your parent account completely free in less than two minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Link
                to="/login"
                className="inline-flex h-14 items-center justify-center rounded-full bg-indigo-600 px-8 text-lg font-semibold text-white shadow-lg transition-all hover:bg-indigo-700"
              >
                Sign up free
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 font-semibold"
              >
                Go to Login <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* Comprehensive Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0b0f19] py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex bg-indigo-600 rounded-lg p-2 text-white">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">EduPortal</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-sm">
                The all-in-one parent academic monitoring system. Stay connected with your child's educational journey through automated attendance and AI-powered insights.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 transition-all">
                  <span className="sr-only">Twitter</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900/50 dark:hover:text-indigo-400 transition-all">
                  <span className="sr-only">GitHub</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Features</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Integrations</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">API Documentation</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Community</a></li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">About Us</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Contact</a></li>
                <li><a href="#" className="text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Partners</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © {new Date().getFullYear()} EduPortal. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
