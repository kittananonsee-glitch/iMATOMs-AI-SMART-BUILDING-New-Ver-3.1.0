
import React, { useState, useEffect, useRef } from 'react';
import { AppView, User, AnalyticsAlertHistory, Language } from '../types';
import { GoogleGenAI } from '@google/genai';
import AIAssistant from './AIAssistant';

interface MainDashboardProps {
  user: User;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
  lang: Language;
  setLang: (l: Language) => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ user, onNavigate, onLogout, lang, setLang }) => {
  const [time, setTime] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [activeAlertCount, setActiveAlertCount] = useState(0);
  const [aiInsight, setAiInsight] = useState<string>('Initializing neural analysis...');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const logoutTimerRef = useRef<number | null>(null);

  const VERSION = lang === 'TH' ? "รุ่น 3.1.0 ศูนย์บัญชาการเอไออัจฉริยะ" : "Ver 3.1.0 AI ANALYTICS";

  const t = {
    dashboard: lang === 'TH' ? 'หน้าหลัก' : 'Main iMATOMs',
    ai_analytics: lang === 'TH' ? 'เอไอ วิเคราะห์' : 'AI Analytics',
    mobile_hub: lang === 'TH' ? 'ศูนย์รวมแอป' : 'Mobile Apps',
    looker: lang === 'TH' ? 'รายงานสถิติ' : 'IoT & Dashboard',
    assets: lang === 'TH' ? 'ฐานข้อมูลพัสดุ' : 'Asset Management',
    work_orders: lang === 'TH' ? 'ใบแจ้งซ่อม' : 'Work Orders',
    ppm: lang === 'TH' ? 'แผนบำรุงรักษา' : 'PPM Schedule',
    inventory: lang === 'TH' ? 'คลังอะไหล่' : 'Inventory control',
    admin: lang === 'TH' ? 'ตั้งค่าระบบ' : 'Admin Setup',
    command: lang === 'TH' ? 'ศูนย์ควบคุมยุทธศาสตร์' : 'iMATOMs Mobilization',
    os_hub: lang === 'TH' ? '5 ระบบปฏิบัติการอัจฉริยะ' : '5 Strategic Center',
    quick_access: lang === 'TH' ? 'เข้าถึงด่วน' : 'Quick System',
    operational: lang === 'TH' ? 'ระบบปฏิบัติการ' : 'Operational Modules'
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const checkStatus = () => {
      const usersStr = localStorage.getItem('imatoms_users');
      if (usersStr) {
        const users: User[] = JSON.parse(usersStr);
        setPendingCount(users.filter(u => u.status === 'pending').length);
      }
      // Check alerts from storage
      const storedAlerts = localStorage.getItem('ai_analytics_alert_count');
      if (storedAlerts) {
        setActiveAlertCount(parseInt(storedAlerts));
      } else {
        const alertHistoryStr = localStorage.getItem('ai_analytics_history');
        if (alertHistoryStr) {
          const history: AnalyticsAlertHistory[] = JSON.parse(alertHistoryStr);
          setActiveAlertCount(history.filter(h => !h.resolvedAt).length);
        }
      }
    };
    checkStatus();
    const statusTimer = setInterval(checkStatus, 3000);
    return () => {
      clearInterval(timer);
      clearInterval(statusTimer);
    };
  }, []);

  useEffect(() => {
    const fetchInsight = async () => {
      setIsAiLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: `Provide a one-sentence professional facility manager summary in ${lang === 'TH' ? 'Thai' : 'English'} for iMATOMs v3.1.0. Mention: Reliability, Safety, Efficiency, ESG, and Utilization. User: ${user.username}.`,
          config: {
            systemInstruction: 'You are the iMATOMs AI Hub. Futuristic and professional tone.',
          }
        });
        setAiInsight(response.text || (lang === 'TH' ? "เชื่อมต่อระบบประสาทสำเร็จ ระบบพร้อมทำงาน" : "Neural connection established. Ready."));
      } catch (err) {
        setAiInsight(lang === 'TH' ? "คำเตือน: ระบบเชื่อมต่อไม่เสถียร" : "Warning: Neural bridge unstable.");
      } finally {
        setIsAiLoading(false);
      }
    };
    fetchInsight();
  }, [user.username, lang]);

  const Sidebar = () => (
    <>
      <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsSidebarOpen(false)} />
      <nav className={`fixed inset-y-0 left-0 w-72 bg-[#0a0e17] border-r border-[#00f5ff]/10 z-[70] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-6 overflow-y-auto no-scrollbar">
          <div className="mb-10 flex items-center justify-between">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 leading-tight">iMATOMs</h1>
              <p className="text-[9px] text-white/30 uppercase font-black tracking-widest truncate">{VERSION}</p>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-white/5"><i className="fa-solid fa-xmark text-cyan-400"></i></button>
          </div>

          <div className="flex-1 space-y-2">
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/30 px-4 py-2 font-black">{t.quick_access}</div>
            <NavItem icon="fa-atom" label={t.dashboard} active onClick={() => setIsSidebarOpen(false)} />
            <NavItem 
              icon="fa-brain" 
              label={t.ai_analytics} 
              alertCount={activeAlertCount} 
              showWarning={activeAlertCount > 0}
              onClick={() => onNavigate(AppView.AI_ANALYTICS)} 
            />
            <NavItem icon="fa-mobile-screen" label={t.mobile_hub} onClick={() => onNavigate(AppView.MOBILE_APPS)} />
            <NavItem icon="fa-chart-line" label={t.looker} onClick={() => onNavigate(AppView.DASHBOARD_MONITOR)} />
            <div className="h-px bg-white/5 my-4"></div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-cyan-400/30 px-4 py-2 font-black">{t.operational}</div>
            <NavItem icon="fa-cube" label={t.assets} onClick={() => onNavigate(AppView.ASSET)} />
            <NavItem icon="fa-wrench" label={t.work_orders} onClick={() => onNavigate(AppView.WORK_ORDER)} />
            <NavItem icon="fa-calendar-check" label={t.ppm} onClick={() => onNavigate(AppView.PPM)} />
            <NavItem icon="fa-boxes-stacked" label={t.inventory} onClick={() => onNavigate(AppView.INVENTORY)} />
            {user.role === 'admin' && (
              <>
                <div className="h-px bg-white/5 my-4"></div>
                <NavItem icon="fa-user-shield" label={t.admin} alertCount={pendingCount} onClick={() => onNavigate(AppView.ADMIN)} />
              </>
            )}
          </div>

          <div className="mt-auto pt-6 border-t border-white/5">
             <div className={`relative flex items-center gap-3 p-4 rounded-2xl transition-all duration-300 bg-white/5 border h-20 overflow-hidden ${showLogoutConfirm ? 'border-red-500/40 bg-red-500/5' : 'border-white/5'}`}>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center text-lg shrink-0 shadow-lg"><i className="fa-solid fa-user"></i></div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate text-white">{user.username}</p>
                <p className="text-[10px] text-cyan-400 uppercase font-black truncate">{user.role}</p>
              </div>
              <button onClick={onLogout} className="w-12 h-12 flex items-center justify-center rounded-xl transition-all duration-500 shrink-0 bg-red-500 text-white"><i className="fa-solid fa-power-off text-lg"></i></button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );

  return (
    <div className="flex h-full bg-[#0a0e17] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:p-10 lg:p-14 no-scrollbar pb-28 lg:pb-14 w-full">
        <div className="max-w-7xl mx-auto flex flex-col h-full">
          <header className="flex items-center justify-between mb-12 lg:mb-16">
            <div className="flex items-center gap-5 min-w-0">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden w-14 h-14 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 shadow-xl"><i className="fa-solid fa-bars-staggered text-cyan-400 text-xl"></i></button>
              <div className="min-w-0">
                <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20 uppercase tracking-tighter italic truncate leading-tight">{t.command}</h2>
                <div className="flex items-center gap-2 mt-1">
                   <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_#00f5ff]"></span>
                   <p className="text-white/40 text-[10px] sm:text-xs font-black uppercase tracking-[0.4em] truncate">{t.os_hub}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
               <div className="hidden sm:flex bg-black/40 border border-white/10 rounded-xl p-1 backdrop-blur-md">
                 <button onClick={() => setLang('TH')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'TH' ? 'bg-cyan-500 text-black shadow-[0_0_10px_#00f5ff]' : 'text-white/40 hover:text-white'}`}>TH</button>
                 <button onClick={() => setLang('EN')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'EN' ? 'bg-cyan-500 text-black shadow-[0_0_10px_#00f5ff]' : 'text-white/40 hover:text-white'}`}>EN</button>
               </div>
               <div className="hidden sm:block text-right">
                  <p className="text-sm font-display font-black text-white/80">{time.toLocaleTimeString()}</p>
                  <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest">{time.toLocaleDateString()}</p>
               </div>
               <button onClick={() => setIsAssistantOpen(true)} className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(0,245,255,0.1)] hover:bg-cyan-500 hover:text-black transition-all"><i className="fa-solid fa-brain-circuit text-xl animate-pulse"></i></button>
            </div>
          </header>

          <div className="mb-14 cyber-card p-8 rounded-[3rem] border-white/10 bg-gradient-to-br from-cyan-950/20 to-purple-950/20 relative overflow-hidden group shadow-2xl">
             <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[100px]"></div>
             <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                <div className="w-20 h-20 rounded-[2rem] bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-4xl text-cyan-400 shadow-[0_0_40px_rgba(0,245,255,0.2)]"><i className="fa-solid fa-robot"></i></div>
                <div className="flex-1">
                   <h3 className="font-display text-[10px] font-black text-cyan-400 uppercase tracking-[0.4em] mb-3">{lang === 'TH' ? 'ข้อมูลสรุปเชิงลึก' : 'AI Analytics Index'}</h3>
                   <p className={`text-xl sm:text-2xl font-bold text-white/90 leading-tight tracking-tight ${isAiLoading ? 'animate-pulse' : ''}`}>{aiInsight}</p>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4 mb-8">
             <h3 className="font-display text-[11px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap">{lang === 'TH' ? 'ระบบย่อยทางยุทธศาสตร์' : 'Strategic Sub-Systems'}</h3>
             <div className="flex-1 h-px bg-white/5"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-16">
            <SubsystemCard icon="fa-shield-halved" title={lang === 'TH' ? 'บริหารความน่าเชื่อถือ' : 'Reliability System'} desc={lang === 'TH' ? 'จัดการพัสดุและบำรุงรักษา' : 'Asset & PPM Management'} color="cyan" onClick={() => onNavigate(AppView.ASSET)} />
            <SubsystemCard icon="fa-clipboard-check" title={lang === 'TH' ? 'บริหารความปลอดภัย' : 'Quality & Safety'} desc={lang === 'TH' ? 'ตรวจสอบใบแจ้งซ่อม' : 'Work Order Compliance'} color="orange" onClick={() => onNavigate(AppView.WORK_ORDER)} />
            <SubsystemCard icon="fa-chart-pie" title={lang === 'TH' ? 'บริหารต้นทุน' : 'Cost Efficiency'} desc={lang === 'TH' ? 'จัดการคลังและทรัพยากร' : 'Inventory & Resource Ops'} color="emerald" onClick={() => onNavigate(AppView.INVENTORY)} />
            <SubsystemCard icon="fa-leaf" title={lang === 'TH' ? 'บริหารสิ่งแวดล้อม' : 'ESG & Environmental'} desc={lang === 'TH' ? 'ความยั่งยืนและอากาศ' : 'Sustainability & IAQ Pulse'} color="purple" onClick={() => onNavigate(AppView.AI_ANALYTICS)} />
            <SubsystemCard icon="fa-users-gear" title={lang === 'TH' ? 'บริหารบุคลากร' : 'Staff Utilization'} desc={lang === 'TH' ? 'ภาระงานและวิเคราะห์ข้อมูล' : 'Workload & BI Analytics'} color="blue" onClick={() => onNavigate(AppView.DASHBOARD_MONITOR)} />
          </div>

          <section className="mt-auto">
            <div className="flex items-center gap-4 mb-8">
               <h3 className="font-display text-[11px] font-black text-white/40 uppercase tracking-[0.5em] whitespace-nowrap">{lang === 'TH' ? 'สถานะการทำงานปัจจุบัน' : 'Daily Operational Monitor'}</h3>
               <div className="flex-1 h-px bg-white/5"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               <SnapshotCard label={lang === 'TH' ? 'ความน่าเชื่อถือระบบวิศวกรรม' : 'Reliability of Engineering '} value="98.0" status="normal" unit="%" />
               <SnapshotCard label={lang === 'TH' ? 'อัตราความถูกต้อง' : 'Compliance Rate'} value="98.2" status="normal" unit="%" />
               <SnapshotCard label={lang === 'TH' ? 'ประหยัดพลังงาน' : 'Energy Savings'} value="-350,000" status="normal" unit="kWh" />
               <SnapshotCard label={lang === 'TH' ? 'สภาวะแวดล้อม' : 'Environmental'} value="30.0" status="warning" unit="°C" />
            </div>
          </section>
        </div>
      </main>
      <AIAssistant isOpen={isAssistantOpen} onClose={() => setIsAssistantOpen(false)} systemContext={`User Lang: ${lang}, Context: ${VERSION}`} />
    </div>
  );
};

const NavItem = ({ icon, label, active, onClick, alertCount, showWarning }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all relative group h-14 ${active ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-400/20' : 'text-white/30 hover:text-white hover:bg-white/5 border-transparent'}`}>
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${active ? 'bg-cyan-400/20' : 'bg-white/5'}`}>
       <i className={`fa-solid ${icon} text-base`}></i>
    </div>
    <span className="text-[14px] font-bold tracking-wide truncate uppercase flex items-center gap-2">
      {label}
      {showWarning && (
        <i className="fa-solid fa-triangle-exclamation text-red-500 text-[10px] animate-pulse"></i>
      )}
    </span>
    {alertCount > 0 && <span className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-red-500 text-[9px] font-black text-white flex items-center justify-center animate-pulse">{alertCount}</span>}
  </button>
);

const SubsystemCard = ({ icon, title, desc, color, onClick }: any) => {
  const colorMap: any = {
    cyan: 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:border-cyan-500/50',
    orange: 'border-orange-500/20 bg-orange-500/5 text-orange-400 hover:border-orange-500/50',
    emerald: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:border-emerald-500/50',
    purple: 'border-purple-500/20 bg-purple-500/5 text-purple-400 hover:border-purple-500/50',
    blue: 'border-blue-500/20 bg-blue-500/5 text-blue-400 hover:border-blue-500/50'
  };
  return (
    <div onClick={onClick} className={`cyber-card p-6 rounded-[2.5rem] border transition-all duration-500 cursor-pointer group h-52 flex flex-col justify-between ${colorMap[color]}`}>
      <div className="flex items-center justify-between"><div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl transition-all"><i className={`fa-solid ${icon}`}></i></div></div>
      <div>
        <h3 className="font-display text-[16px] font-black text-white mb-2 leading-tight uppercase">{title}</h3>
        <p className="text-[10px] text-white/30 leading-relaxed font-black uppercase tracking-widest">{desc}</p>
      </div>
    </div>
  );
};

const SnapshotCard = ({ label, value, status, unit }: any) => {
  const statusColors: any = {
    normal: 'text-emerald-400 border-emerald-500/10 bg-emerald-500/5',
    warning: 'text-yellow-400 border-yellow-500/10 bg-yellow-500/5',
    danger: 'text-red-400 border-red-500/10 bg-red-500/5'
  };
  return (
    <div className={`p-6 rounded-[2rem] border ${statusColors[status]} text-center h-28 flex flex-col justify-center items-center`}>
      <p className="text-[9px] uppercase font-black tracking-[0.3em] opacity-30 mb-2 truncate w-full">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-display font-black leading-none italic">{value}</p>
        <span className="text-[10px] font-black uppercase tracking-tighter opacity-40 italic">{unit}</span>
      </div>
    </div>
  );
};

export default MainDashboard;
