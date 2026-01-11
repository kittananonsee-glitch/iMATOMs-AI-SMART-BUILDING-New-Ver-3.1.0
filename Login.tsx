
import React, { useState } from 'react';
import { User, Language } from '../types';

interface LoginProps {
  onLogin: (user: User) => void;
  lang: Language;
  setLang: (l: Language) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang, setLang }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin1234');
  const [email, setEmail] = useState('');
  const [building, setBuilding] = useState('ViMUT');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const t = {
    login: lang === 'TH' ? 'เข้าสู่ระบบ' : 'Login',
    register: lang === 'TH' ? 'ลงทะเบียน' : 'Register',
    subtitle: lang === 'TH' ? 'ระบบการจัดการวิศวกรรมอาคาร v3.1.0' : 'AI ANLYTICS PRO Ver3.1.0',
    user: lang === 'TH' ? 'ชื่อผู้ใช้งาน' : 'Username',
    pass: lang === 'TH' ? 'รหัสผ่าน' : 'Password',
    email: lang === 'TH' ? 'อีเมล' : 'Email Address',
    building: lang === 'TH' ? 'อาคารที่สังกัด' : 'Building Response',
    btn_login: lang === 'TH' ? 'เข้าใช้งานระบบ' : 'Access System',
    btn_register: lang === 'TH' ? 'สร้างบัญชีผู้ใช้' : 'Register Account',
    error_fields: lang === 'TH' ? 'กรุณากรอกข้อมูลให้ครบถ้วน' : 'Please fill in all required fields.',
    success_reg: lang === 'TH' ? 'ลงทะเบียนสำเร็จ! กรุณารอการอนุมัติจากผู้ดูแลระบบ' : 'Registration successful! Please wait for administrator approval.',
    auth_only: lang === 'TH' ? 'เฉพาะผู้ที่ได้รับอนุญาตเท่านั้น' : 'Authorized Personnel Only'
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const usersStr = localStorage.getItem('imatoms_users');
    let users: User[] = usersStr ? JSON.parse(usersStr) : [];

    const adminExists = users.some(u => u.username === 'admin');
    if (!adminExists) {
      users.push({
        id: 'admin-1',
        username: 'admin',
        password: 'admin1234',
        role: 'admin',
        building: 'all',
        status: 'approved',
        email: 'admin@imatoms.pro'
      });
      localStorage.setItem('imatoms_users', JSON.stringify(users));
    }

    if (isRegistering) {
      if (!username || !email || !password) {
        setError(t.error_fields);
        return;
      }
      const userExists = users.some(u => u.username === username || u.email === email);
      if (userExists) {
        setError(lang === 'TH' ? 'ชื่อผู้ใช้หรืออีเมลนี้มีอยู่ในระบบแล้ว' : 'Username or Email already exists.');
        return;
      }
      const newUser: User = {
        id: `user-${Date.now()}`,
        username,
        email,
        password,
        building,
        role: 'user',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem('imatoms_users', JSON.stringify(users));
      setSuccess(t.success_reg);
      setIsRegistering(false);
      return;
    }

    const foundUser = users.find(u => u.username === username && u.password === password);
    if (foundUser) {
      if (foundUser.status === 'pending') {
        setError(lang === 'TH' ? 'บัญชีของคุณกำลังรอการอนุมัติ' : 'Your account is pending approval.');
      } else if (foundUser.status === 'rejected') {
        setError(lang === 'TH' ? 'การลงทะเบียนถูกปฏิเสธ กรุณาติดต่อผู้ดูแล' : 'Your registration has been rejected.');
      } else {
        onLogin(foundUser);
      }
    } else {
      setError(lang === 'TH' ? 'ข้อมูลไม่ถูกต้อง (Hint: admin / admin1234)' : 'Invalid credentials. Hint: admin / admin1234');
    }
  };

  return (
    <div className="min-h-full flex items-center justify-center p-4 bg-gradient-to-b from-[#0a0e17] via-[#0f1629] to-[#0a0e17]">
      {/* Language Toggle Fixed Top Right */}
      <div className="fixed top-8 right-8 z-50 flex bg-black/40 border border-white/10 rounded-xl p-1 backdrop-blur-md">
        <button onClick={() => setLang('TH')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'TH' ? 'bg-cyan-500 text-black shadow-[0_0_10px_#00f5ff]' : 'text-white/40 hover:text-white'}`}>TH</button>
        <button onClick={() => setLang('EN')} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${lang === 'EN' ? 'bg-cyan-500 text-black shadow-[0_0_10px_#00f5ff]' : 'text-white/40 hover:text-white'}`}>EN</button>
      </div>

      <div className="w-full max-w-md cyber-card p-8 rounded-2xl shadow-2xl transition-all duration-500">
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center mb-4 animate-pulse">
            <i className="fa-solid fa-atom text-4xl text-white"></i>
          </div>
          <h1 className="font-display text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">iMATOMs</h1>
          <p className="text-sm mt-1 text-white/60">{t.subtitle}</p>
        </div>

        <div className="flex mb-6 bg-black/20 rounded-xl p-1 border border-white/5">
          <button onClick={() => { setIsRegistering(false); setError(''); setSuccess(''); }} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${!isRegistering ? 'bg-cyan-500/20 text-cyan-400 shadow-inner' : 'text-white/40 hover:text-white'}`}>{t.login}</button>
          <button onClick={() => { setIsRegistering(true); setError(''); setSuccess(''); }} className={`flex-1 py-2 text-xs font-bold uppercase tracking-widest rounded-lg transition-all ${isRegistering ? 'bg-purple-500/20 text-purple-400 shadow-inner' : 'text-white/40 hover:text-white'}`}>{t.register}</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/60">{t.user}</label>
            <input type="text" className="cyber-input w-full p-4 rounded-xl text-sm" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          {isRegistering && (
            <div className="animate-fadeIn">
              <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/60">{t.email}</label>
              <input type="email" className="cyber-input w-full p-4 rounded-xl text-sm" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
          )}
          <div>
            <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/60">{t.pass}</label>
            <input type="password" className="cyber-input w-full p-4 rounded-xl text-sm" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {isRegistering && (
            <div className="animate-fadeIn">
              <label className="block text-[10px] uppercase font-black tracking-widest mb-2 text-white/60">{t.building}</label>
              <select className="cyber-input w-full p-4 rounded-xl text-sm appearance-none" value={building} onChange={(e) => setBuilding(e.target.value)}>
                <option value="ViMUT">ViMUT Hospital</option>
                <option value="VTH">ViMUT-Theptarin (VTH)</option>
                <option value="Phahonyothin">ViMUT Phahonyothin</option>
              </select>
            </div>
          )}
          {error && <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-xs"><i className="fa-solid fa-circle-exclamation mr-2"></i>{error}</div>}
          {success && <div className="p-3 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs"><i className="fa-solid fa-circle-check mr-2"></i>{success}</div>}
          <button type="submit" className={`w-full py-4 text-sm font-black uppercase tracking-[0.2em] rounded-xl shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] ${isRegistering ? 'bg-purple-600 hover:bg-purple-500' : 'bg-cyan-600 hover:bg-cyan-400 text-black font-black'}`}>
            {isRegistering ? t.btn_register : t.btn_login}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/30 uppercase tracking-widest leading-relaxed">{t.auth_only}<br/>&copy; 2026 : Mr.Kittanan Onsee Edited:iMATOMs Application</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
