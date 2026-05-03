import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot, 
  collection 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithCustomToken, 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';

// ==========================================
// 1. SISTEMA DE ICONOS NATIVOS
// ==========================================
const ICON_PATHS = {
  Turtle: '<path d="m12 10 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a8 8 0 1 0-16 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3l2-4h4Z"/><path d="M4.82 7.9 8 10"/><path d="M15.18 7.9 12 10"/><path d="M16.93 10H20a2 2 0 0 1 0 4H2"/>',
  MapIcon: '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>',
  BookOpen: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  CreditCard: '<rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>',
  FileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  CheckCircle2: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  Lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  Dices: '<rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/><path d="M6 18h.01"/><path d="M10 14h.01"/><path d="M15 6h.01"/><path d="M18 9h.01"/>',
  Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  Flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  Trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  ChevronRight: '<polyline points="9 18 15 12 9 6"/>',
  X: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  Check: '<polyline points="20 6 9 17 4 12"/>',
  Plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  Languages: '<path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/>',
  Search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  Minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  Layers: '<polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/>',
  Trash2: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  Library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  ListTodo: '<rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  StickyNote: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/>',
  Pin: '<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-15l-2.5-3.5V5a2 2 0 0 0-4 0v7l-2.5 3.5Z"/>',
  Calendar: '<rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  Mic2: '<path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"/><circle cx="17" cy="7" r="5"/>',
  RotateCw: '<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/>',
  ClipboardCheck: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  BarChart3: '<path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/>',
  Undo2: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>',
  Target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  Zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  Award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  Eye: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  EyeOff: '<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/>'
};

const Icon = ({ name, size = 24, strokeWidth = 2, className = "" }) => {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} dangerouslySetInnerHTML={{ __html: path }} />
  );
};

// ==========================================
// 2. CONFIGURACIÓN FIREBASE & CONSTANTES
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyAGkD-7KAe7h7OFPMQLswVKE4fOiJXYykU",
  authDomain: "turtlestudy-83103.firebaseapp.com",
  projectId: "turtlestudy-83103",
  storageBucket: "turtlestudy-83103.firebasestorage.app",
  messagingSenderId: "270840155415",
  appId: "1:270840155415:web:cab89669409275e1a2fb52",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const APP_ID_PATH = 'turtlestudy-v2'; // Identificador para la ruta de base de datos

const COLORS = { bg: '#ffffff' };
const NOTE_COLORS = [
  { id: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-yellow-900', pin: 'text-yellow-600' },
  { id: 'blue', bg: 'bg-blue-200', border: 'border-blue-300', text: 'text-blue-900', pin: 'text-blue-600' },
  { id: 'green', bg: 'bg-green-200', border: 'border-green-300', text: 'text-green-900', pin: 'text-green-600' },
  { id: 'pink', bg: 'bg-pink-200', border: 'border-pink-300', text: 'text-pink-900', pin: 'text-pink-600' },
  { id: 'purple', bg: 'bg-purple-200', border: 'border-purple-300', text: 'text-purple-900', pin: 'text-purple-600' },
];

const INITIAL_TOPICS = Array.from({ length: 69 }, (_, i) => ({
  id: i + 1, title: `Tema ${i + 1}`, priority: 0, written: false, summarized: false, deepStudy: false, reviews: 0, fullMocks: 0, miniMocks: 0, active: true,
}));

const INITIAL_PLANNING = [
  { id: 'p1', title: 'Contextualización', status: 0 }, { id: 'p2', title: 'Objetivos y Competencias', status: 0 }, { id: 'p3', title: 'Saberes Básicos', status: 0 },
  { id: 'p4', title: 'Metodología y Situaciones', status: 0 }, { id: 'p5', title: 'Evaluación', status: 0 }, { id: 'p6', title: 'Atención a la Diversidad', status: 0 },
];

const INITIAL_UNITS = Array.from({ length: 6 }, (_, i) => ({ id: `ud${i + 1}`, title: `Unidad Didáctica ${i + 1}`, status: 0 }));
const INITIAL_ORAL_PROG = [{ id: 'op1', label: 'Fluidez y Ritmo', level: 0, color: 'bg-teal-500' }, { id: 'op2', label: 'Lenguaje Corporal', level: 0, color: 'bg-teal-400' }];
const INITIAL_ORAL_UD = [{ id: 'ou1', label: 'Claridad en Tareas', level: 0, color: 'bg-teal-500' }, { id: 'ou2', label: 'Defensa Metodológica', level: 0, color: 'bg-teal-400' }];
const INITIAL_SKILLS = [{ id: 's1', label: 'Traducción Directa', level: 0, color: 'bg-indigo-500' }, { id: 's2', label: 'Traducción Inversa', level: 0, color: 'bg-indigo-400' }, { id: 's3', label: 'Análisis Literario', level: 0, color: 'bg-violet-500' }, { id: 's4', label: 'Análisis Lingüístico', level: 0, color: 'bg-indigo-300' }];

const PLANNING_STATUS = ['Nada', 'Esbozo', 'Escrita', 'Repasada', 'Finalizada'];

const getTopicBlock = (id) => {
  if ([1, 2].includes(id)) return { name: 'Metodología', box: 'bg-orange-50 text-orange-600 border-orange-200', badge: 'bg-orange-100 text-orange-700 border-orange-200' };
  if ([3, 4, 5, 6, 28, 40].includes(id)) return { name: 'Comunicación', box: 'bg-purple-50 text-purple-600 border-purple-200', badge: 'bg-purple-100 text-purple-700 border-purple-200' };
  if ([7, 8, 9].includes(id)) return { name: 'Fonética', box: 'bg-slate-100 text-slate-700 border-slate-300', badge: 'bg-slate-200 text-slate-800 border-slate-300' };
  if (id >= 10 && id <= 27) return { name: 'Gramática', box: 'bg-sky-50 text-sky-600 border-sky-200', badge: 'bg-sky-100 text-sky-700 border-sky-200' };
  if (id >= 29 && id <= 39) return { name: 'Análisis Discurso', box: 'bg-pink-50 text-pink-600 border-pink-200', badge: 'bg-pink-100 text-pink-700 border-pink-200' };
  if ([41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 56, 57, 58, 62].includes(id)) return { name: 'Lit. Británica', box: 'bg-green-50 text-green-600 border-green-200', badge: 'bg-green-100 text-green-700 border-green-200' };
  if ([46, 52, 53, 54, 55, 59, 60].includes(id)) return { name: 'Lit. Americana', box: 'bg-yellow-50 text-yellow-600 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  if ([61, 63, 64, 65, 66, 67, 68, 69].includes(id)) return { name: 'Cultura', box: 'bg-indigo-50 text-indigo-600 border-indigo-200', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200' };
  return { name: 'General', box: 'bg-gray-50 text-gray-600 border-gray-200', badge: 'bg-gray-100 text-gray-700 border-gray-200' };
};

const getSkillIcon = (id) => {
  switch(id) {
    case 's1': case 's2': return <Icon name="Languages" size={14} />;
    case 's3': return <Icon name="BookOpen" size={14} />;
    case 's4': return <Icon name="Search" size={14} />;
    case 'op1': case 'ou2': return <Icon name="Mic2" size={14} />;
    case 'op2': return <Icon name="Target" size={14} />;
    case 'ou1': return <Icon name="Layers" size={14} />;
    default: return <Icon name="Star" size={14} />;
  }
};

// ==========================================
// 3. COMPONENTES DE UI
// ==========================================
function HeaderIconBtn({ active, onClick, color, icon, badge }) {
  const colorMap = {
    yellow: "bg-yellow-50 border-yellow-200 text-yellow-600", 
    orange: "bg-orange-50 border-orange-200 text-orange-600",
    violet: "bg-violet-50 border-violet-200 text-violet-600", 
    amber: "bg-amber-50 border-amber-200 text-amber-600", 
    rose: "bg-rose-50 border-rose-200 text-rose-600"
  };
  return (
    <button onClick={onClick} className={`p-2.5 rounded-full border transition-all relative ${active ? 'bg-slate-800 text-white shadow-md border-slate-700' : colorMap[color]}`}>
      {icon}{badge && <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 border-2 border-white rounded-full animate-pulse" />}
    </button>
  );
}

function SectionHeader({ icon, title, badge, colorClass = "emerald" }) {
  const colorMap = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100", 
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100", 
    teal: "bg-teal-50 text-teal-600 border-teal-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100", 
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100", 
    violet: "bg-violet-50 text-violet-600 border-violet-100"
  };
  return (
    <div className="flex justify-between items-center mb-6 text-left">
      <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3"><div className={`p-2.5 rounded-xl border ${colorMap[colorClass]}`}>{React.cloneElement(icon, { size: 24 })}</div>{title}</h2>
      <span className={`text-[11px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest ${colorMap[colorClass]}`}>{badge}</span>
    </div>
  );
}

function NavButton({ active, icon, label, onClick, color }) {
  const colorText = active ? `text-${color}-600` : 'text-slate-400';
  const colorBg = active ? `bg-${color}-50` : 'hover:bg-slate-50';
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all duration-300 flex-1 py-1 ${active ? 'scale-110' : ''}`}>
      <div className={`p-2 rounded-xl transition-colors ${colorText} ${colorBg}`}>{React.cloneElement(icon, { size: 24, strokeWidth: active ? 2.5 : 2 })}</div>
      <span className={`text-[10px] font-black uppercase tracking-widest ${colorText}`}>{label}</span>
    </button>
  );
}

// ==========================================
// 4. APP PRINCIPAL
// ==========================================
export default function App() {
  // Inyección de Tailwind
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  const [syncCode, setSyncCode] = useState(() => localStorage.getItem('turtle_sync_code') || "");
  const [isLogged, setIsLogged] = useState(false);
  const [tempCode, setTempCode] = useState("");
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [activeDeckId, setActiveDeckId] = useState(null);

  // Estados de la App
  const [points, setPoints] = useState(0);
  const [topics, setTopics] = useState(INITIAL_TOPICS);
  const [planning, setPlanning] = useState(INITIAL_PLANNING);
  const [units, setUnits] = useState(INITIAL_UNITS);
  const [oralProg, setOralProg] = useState(INITIAL_ORAL_PROG);
  const [oralUd, setOralUd] = useState(INITIAL_ORAL_UD);
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [decks, setDecks] = useState([]);
  const [todos, setTodos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [examDate, setExamDate] = useState("2026-06-20");
  const [practicoSessions, setPracticoSessions] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState(null);
  const [levelDates, setLevelDates] = useState({ 1: new Date().toLocaleDateString() });

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [luckyNumbers, setLuckyNumbers] = useState([0,0,0,0]);
  const [isRolling, setIsRolling] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");

  const level = Math.floor(points / 200) + 1;
  const progressInLevel = points % 200;

  // 1. Gestión de Auth
  useEffect(() => {
    if (syncCode) setIsLogged(true);
    
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) { console.warn("Modo Offline"); }
    };
    initAuth();
  }, [syncCode]);

  // 2. Carga de datos con ruta segura
  useEffect(() => {
    if (!isLogged || !syncCode) return;
    
    // Ruta adaptada para permisos: /artifacts/{id}/public/data/{coleccion}/{doc}
    const docRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'turtle_users', syncCode);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists() && !isDataLoaded) {
        const d = docSnap.data();
        setPoints(d.points || 0); setTopics(d.topics || INITIAL_TOPICS); 
        setPlanning(d.planning || INITIAL_PLANNING); setUnits(d.units || INITIAL_UNITS);
        setOralProg(d.oralProg || INITIAL_ORAL_PROG); setOralUd(d.oralUd || INITIAL_ORAL_UD);
        setSkills(d.skills || INITIAL_SKILLS); setDecks(d.decks || []);
        setTodos(d.todos || []); setNotes(d.notes || []); setActionLogs(d.actionLogs || []);
        setExamDate(d.examDate || "2026-06-20"); setPracticoSessions(d.practicoSessions || 0);
        setStreak(d.streak || 0); setMaxStreak(d.maxStreak || 0);
        setLastActiveDate(d.lastActiveDate || null); setLevelDates(d.levelDates || { 1: new Date().toLocaleDateString() });
      }
      setIsDataLoaded(true);
    }, (err) => {
      console.error("Firestore Error:", err);
      setIsDataLoaded(true);
    });

    return () => unsubscribe();
  }, [isLogged, syncCode, isDataLoaded]);

  // 3. Guardado automático
  useEffect(() => {
    if (!isDataLoaded || !isLogged || !syncCode) return;
    
    const saveData = async () => {
      const today = new Date().toDateString();
      const dataToSave = {
        points, topics, planning, units, oralProg, oralUd, skills, decks,
        todos: todos.filter(t => !t.completed || t.completedAt === today),
        notes, actionLogs, examDate, practicoSessions, streak, maxStreak, 
        lastActiveDate, levelDates
      };
      
      try {
        const docRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'turtle_users', syncCode);
        await setDoc(docRef, dataToSave);
      } catch (e) { console.error("Error al guardar", e); }
    };

    const timeout = setTimeout(saveData, 1000);
    return () => clearTimeout(timeout);
  }, [points, topics, planning, units, oralProg, oralUd, skills, decks, todos, notes, actionLogs, examDate, practicoSessions, streak, maxStreak, lastActiveDate, levelDates, isDataLoaded, isLogged, syncCode]);

  // Lógica de Puntos y Racha
  const addPoints = (amount, description = "Estudio") => {
    setPoints(p => p + amount);
    if (amount > 0) {
      const todayStr = new Date().toDateString();
      if (lastActiveDate !== todayStr) {
        if (lastActiveDate) {
          const diff = Math.round((new Date(todayStr) - new Date(lastActiveDate)) / (1000*60*60*24));
          if (diff === 1) setStreak(s => s + 1); else setStreak(1);
        } else setStreak(1);
        setLastActiveDate(todayStr);
      }
      setActionLogs(prev => [{ id: Date.now().toString() + Math.random().toString(36).substr(2,4), amount, description, timestamp: Date.now() }, ...prev]);
    }
  };

  const startTimer = (sec) => { setTimeLeft(sec); setIsTimerActive(true); setShowTimerMenu(false); };
  useEffect(() => {
    let int;
    if (isTimerActive && timeLeft > 0) int = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (timeLeft === 0) setIsTimerActive(false);
    return () => clearInterval(int);
  }, [isTimerActive, timeLeft]);

  if (!isLogged) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#f4f9f7]">
         <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-sm border-4 border-emerald-50 text-center">
           <Icon name="Turtle" size={70} className="text-emerald-500 mx-auto mb-6" />
           <h1 className="text-3xl font-black text-emerald-950 mb-3 tracking-tighter">TurtleStudy</h1>
           <p className="text-sm font-bold text-slate-500 mb-8 leading-relaxed">Escribe una clave secreta para sincronizar tu progreso en todos tus dispositivos.</p>
           <input type="text" value={tempCode} onChange={e=>setTempCode(e.target.value)} placeholder="Ej: MariaOpos26" className="w-full bg-emerald-50 p-4 rounded-2xl border-none outline-none font-black text-center mb-5 text-emerald-900 focus:ring-2 focus:ring-emerald-300 transition-all" />
           <button onClick={() => { if(tempCode.trim()) { setSyncCode(tempCode.trim()); localStorage.setItem('turtle_sync_code', tempCode.trim()); setIsLogged(true); } }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-4 rounded-2xl active:scale-95 transition-all shadow-lg shadow-emerald-200">ENTRAR</button>
         </div>
      </div>
    );
  }

  if (!isDataLoaded) return <div className="min-h-screen flex items-center justify-center bg-white"><Icon name="Turtle" className="text-emerald-500 animate-bounce" size={60} /></div>;

  return (
    <div className="min-h-screen pb-32 text-slate-800 font-sans relative" style={{ backgroundColor: COLORS.bg }}>
      <style>{`
        .bento-card { background: rgba(255,255,255,0.9); backdrop-filter: blur(12px); border-radius: 30px; }
        .flip-card-inner { transition: transform 0.6s; transform-style: preserve-3d; }
        .flipped { transform: rotateY(180deg); }
        .flip-card-front, .flip-card-back { backface-visibility: hidden; position: absolute; inset: 0; }
        .flip-card-back { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
      
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b-2 border-slate-100 p-4 shadow-sm">
        <div className="max-w-6xl mx-auto flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setActiveTab('map'); setActiveDeckId(null); }}>
              <div className="p-2 bg-emerald-600 rounded-2xl text-white shadow-lg"><Icon name="Turtle" size={28} /></div>
              <span className="font-black text-emerald-950 text-2xl tracking-tighter">TurtleStudy</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <HeaderIconBtn active={activeTab === 'flashcards'} onClick={() => setActiveTab('flashcards')} color="rose" icon={<Icon name="CreditCard" size={20} />} />
              <HeaderIconBtn active={activeTab === 'stats'} onClick={() => setActiveTab('stats')} color="violet" icon={<Icon name="BarChart3" size={20} />} />
              <HeaderIconBtn active={activeTab === 'badges'} onClick={() => setActiveTab('badges')} color="amber" icon={<Icon name="Award" size={20} />} />
              <HeaderIconBtn active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} color="yellow" icon={<Icon name="StickyNote" size={20} />} />
              <HeaderIconBtn active={activeTab === 'todo'} onClick={() => setActiveTab('todo')} color="orange" icon={<Icon name="ListTodo" size={20} />} badge={todos.filter(t=>!t.completed).length > 0} />
              <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-orange-50 border-orange-200 text-orange-700">
                <Icon name="Flame" size={18} className="fill-orange-500" /> <span className="text-sm font-black">{streak}</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full border bg-emerald-50 border-emerald-200 text-emerald-700">
                <Icon name="Trophy" size={18} /> <span className="text-sm font-black">{points} pts</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className={`flex-1 bento-card p-3 flex justify-between items-center border-2 transition-all cursor-pointer relative ${isTimerActive ? 'bg-emerald-600 text-white border-emerald-500' : 'border-emerald-50 shadow-sm'}`} onClick={() => setShowTimerMenu(!showTimerMenu)}>
              <div className="flex items-center gap-3 px-2">
                <Icon name="Clock" size={20} className={isTimerActive ? 'animate-spin' : 'text-emerald-600'} />
                <span className="text-base font-black tabular-nums">{timeLeft > 0 ? (Math.floor(timeLeft/60)+":"+(timeLeft%60).toString().padStart(2,'0')) : 'TEMPORIZADOR'}</span>
              </div>
              {showTimerMenu && (
                <div className="absolute top-16 left-0 right-0 bg-white border-2 border-slate-100 rounded-3xl p-5 shadow-2xl z-50 grid grid-cols-2 gap-3 text-slate-800" onClick={e => e.stopPropagation()}>
                  <button onClick={() => startTimer(7200)} className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-[10px] font-black">2h TEMA</button>
                  <button onClick={() => startTimer(3600)} className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-[10px] font-black">1h PROG</button>
                  <button onClick={() => startTimer(1200)} className="p-3 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-[10px] font-black">20m MINI</button>
                  <button onClick={() => startTimer(300)} className="p-3 bg-red-50 hover:bg-red-100 rounded-xl text-[10px] font-black">5m DESC</button>
                </div>
              )}
            </div>
            
            <button onClick={() => {
                 setIsRolling(true);
                 setTimeout(() => {
                  const pool = Array.from({ length: 69 }, (_, i) => i + 1);
                  const drawn = []; 
                  for(let i=0; i<4; i++) drawn.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
                  setLuckyNumbers(drawn.sort((a,b)=>a-b)); 
                  setIsRolling(false);
                }, 800);
               }} disabled={isRolling} className="flex-1 bento-card p-3 border-2 border-amber-100 bg-amber-50/50 flex justify-between items-center text-amber-800">
              <div className="flex items-center gap-3"><Icon name="Dices" size={20} /> <div className="flex gap-1">{ (isRolling ? ['?','?','?','?'] : luckyNumbers[0]!==0 ? luckyNumbers : ['-','-','-','-']).map((n,i)=><span key={i} className="w-8 h-8 bg-white border border-amber-200 rounded-xl text-xs flex items-center justify-center font-black">{n}</span>) }</div></div>
              <span className="text-[10px] font-black opacity-60">SORTEO</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6 text-left">
        {activeTab === 'map' && <ProgressMap level={level} progressInLevel={progressInLevel} examDate={examDate} setExamDate={setExamDate} levelDates={levelDates} />}
        {activeTab === 'syllabus' && <Syllabus topics={topics} setTopics={setTopics} addPoints={addPoints} />}
        {activeTab === 'planning' && <PlanningHub planning={planning} setPlanning={setPlanning} units={units} setUnits={setUnits} oralProg={oralProg} setOralProg={setOralProg} oralUd={oralUd} setOralUd={setOralUd} addPoints={addPoints} />}
        {activeTab === 'practico' && <PracticoView skills={skills} setSkills={setSkills} addPoints={addPoints} sessions={practicoSessions} setSessions={setPracticoSessions} />}
        {activeTab === 'flashcards' && !activeDeckId && <FlashcardsManager decks={decks} setDecks={setDecks} addPoints={addPoints} onSelect={setActiveDeckId} />}
        {activeTab === 'flashcards' && activeDeckId && <DeckStudyView deck={decks.find(d=>d.id===activeDeckId)} onBack={() => setActiveDeckId(null)} addPoints={addPoints} />}
        {activeTab === 'todo' && <TodoView todos={todos} setTodos={setTodos} addPoints={addPoints} />}
        {activeTab === 'notes' && <NotesView notes={notes} setNotes={setNotes} />}
        {activeTab === 'stats' && <StatsView actionLogs={actionLogs} levelDates={levelDates} />}
        {activeTab === 'badges' && <BadgesView maxStreak={maxStreak} points={points} topics={topics} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t-2 border-slate-100 p-4 z-50">
        <div className="max-w-4xl mx-auto flex justify-around items-center">
          <NavButton active={activeTab === 'map'} icon={<Icon name="MapIcon" />} label="MAPA" color="emerald" onClick={() => { setActiveTab('map'); setActiveDeckId(null); }} />
          <NavButton active={activeTab === 'syllabus'} icon={<Icon name="BookOpen" />} label="TEMAS" color="amber" onClick={() => { setActiveTab('syllabus'); setActiveDeckId(null); }} />
          <NavButton active={activeTab === 'planning'} icon={<Icon name="FileText" />} label="PROG" color="teal" onClick={() => { setActiveTab('planning'); setActiveDeckId(null); }} />
          <NavButton active={activeTab === 'practico'} icon={<Icon name="Target" />} label="PRACT" color="indigo" onClick={() => { setActiveTab('practico'); setActiveDeckId(null); }} />
        </div>
      </nav>
    </div>
  );
}

// ==========================================
// COMPONENTES DE VISTA (Adaptados)
// ==========================================

function ProgressMap({ level, progressInLevel, examDate, setExamDate, levelDates }) {
  const diff = new Date(examDate) - new Date();
  const days = Math.max(0, Math.ceil(diff / (1000*60*60*24)));
  const nodes = [level + 2, level + 1, level, level - 1, level - 2].filter(l => l > 0);

  return (
    <div className="space-y-12 max-w-2xl mx-auto py-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bento-card p-6 border-4 border-emerald-50 flex justify-between items-center">
          <div><p className="text-3xl font-black">{days} días</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Para el examen</p></div>
          <input type="date" value={examDate} onChange={e => setExamDate(e.target.value)} className="bg-emerald-50 border-none rounded-xl p-2 text-xs font-black" />
        </div>
        <div className="flex-1 bento-card p-6 border-4 border-emerald-50">
          <div className="flex justify-between mb-2"><span className="text-xs font-black">NIVEL {level}</span><span className="text-[10px] font-bold">{progressInLevel}/200 PTS</span></div>
          <div className="h-4 bg-emerald-50 rounded-full overflow-hidden border border-emerald-100"><div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${(progressInLevel/200)*100}%` }} /></div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-20 py-10 relative">
        <div className="absolute inset-0 flex justify-center -z-10"><div className="w-1 border-r-4 border-dashed border-emerald-100" /></div>
        {nodes.map(l => (
          <div key={l} className={`relative w-24 h-24 rounded-full border-8 flex items-center justify-center transition-all ${l === level ? 'bg-white border-emerald-500 shadow-2xl scale-125 z-10 ring-8 ring-emerald-50' : l < level ? 'bg-emerald-50 border-emerald-200 text-emerald-300' : 'bg-white border-slate-100 text-slate-200'}`}>
            <span className="text-3xl font-black">{l}</span>
            {l === level && <Icon name="Turtle" size={30} className="absolute -top-12 text-emerald-600 animate-bounce" />}
            {levelDates[l] && <span className="absolute -right-24 text-[10px] font-black text-slate-300 uppercase">{levelDates[l]}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Syllabus({ topics, setTopics, addPoints }) {
  const update = (id, f) => {
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        const nv = !t[f];
        if (nv) addPoints(f === 'deepStudy' ? 25 : 10, `Tema ${id}: ${f}`);
        return { ...t, [f]: nv };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon={<Icon name="BookOpen" />} title="Temario" badge="69 Temas" colorClass="amber" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topics.map(t => (
          <div key={t.id} className="bento-card p-5 border-4 border-amber-50 hover:border-amber-100 transition-all">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xl">{t.id}</div>
              <div className="flex-1"><p className="text-sm font-black leading-tight">{t.title}</p></div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button onClick={() => update(t.id, 'written')} className={`py-2 rounded-xl text-[9px] font-black border-2 ${t.written ? 'bg-amber-500 text-white border-transparent' : 'bg-white border-slate-50 text-slate-400'}`}>ESCRITO</button>
              <button onClick={() => update(t.id, 'summarized')} className={`py-2 rounded-xl text-[9px] font-black border-2 ${t.summarized ? 'bg-amber-500 text-white border-transparent' : 'bg-white border-slate-50 text-slate-400'}`}>RESUMEN</button>
              <button onClick={() => update(t.id, 'deepStudy')} className={`py-2 rounded-xl text-[9px] font-black border-2 ${t.deepStudy ? 'bg-orange-500 text-white border-transparent' : 'bg-white border-slate-50 text-slate-400'}`}>ESTUDIO</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PlanningHub({ planning, setPlanning, units, setUnits, addPoints }) {
  const upd = (id, list, setList) => setList(prev => prev.map(i => {
    if (i.id === id) {
      const ns = (i.status + 1) % 5;
      if (ns > i.status) addPoints(15, `Avance: ${i.title}`);
      return { ...i, status: ns };
    }
    return i;
  }));

  return (
    <div className="space-y-6">
      <SectionHeader icon={<Icon name="FileText" />} title="Programación" badge="Diseño" colorClass="teal" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...planning, ...units].map(item => (
          <div key={item.id} className="bento-card p-6 border-4 border-teal-50 flex flex-col gap-4">
            <div className="flex justify-between items-center"><span className="text-sm font-black">{item.title}</span><button onClick={() => upd(item.id, null, item.id.startsWith('p') ? setPlanning : setUnits)} className={`px-4 py-2 rounded-xl text-[10px] font-black border-2 ${item.status===4 ? 'bg-teal-500 text-white border-transparent':'bg-white border-teal-50 text-teal-600'}`}>{PLANNING_STATUS[item.status]}</button></div>
            <div className="flex gap-1 h-2">{Array.from({length:5}).map((_, i) => <div key={i} className={`flex-1 rounded-full ${i <= item.status ? 'bg-teal-500' : 'bg-slate-100'}`} />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PracticoView({ skills, setSkills, addPoints, sessions, setSessions }) {
  return (
    <div className="space-y-6">
      <SectionHeader icon={<Icon name="Target" />} title="Práctico" badge="Skills" colorClass="indigo" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card p-8 border-4 border-indigo-50 space-y-6">
          {skills.map(s => (
            <div key={s.id} className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400">
                <div className="flex items-center gap-2"><span>{s.label}</span></div>
                <button onClick={() => { if(s.level < 10) { setSkills(prev => prev.map(ps=>ps.id===s.id?{...ps,level:ps.level+1}:ps)); addPoints(25, `Mejora: ${s.label}`); } }} className="w-6 h-6 flex items-center justify-center bg-indigo-50 text-indigo-600 rounded-lg">+</button>
              </div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200"><div className="h-full bg-indigo-500" style={{ width: `${s.level*10}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="bento-card p-8 border-4 border-indigo-100 text-center flex flex-col justify-center items-center gap-4">
          <p className="text-6xl font-black text-indigo-600">{sessions}</p>
          <p className="text-xs font-bold text-slate-400 uppercase">Supuestos Realizados</p>
          <button onClick={() => { setSessions(s=>s+1); addPoints(25, "Supuesto Práctico"); }} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100">REGISTRAR SESIÓN (+25 pts)</button>
        </div>
      </div>
    </div>
  );
}

function FlashcardsManager({ decks, setDecks, onSelect }) {
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState("");
  const [name, setName] = useState("");
  
  const add = () => {
    const cards = txt.split('\n').filter(l=>l.includes(':')).map(l=>{const [q,a]=l.split(':'); return {q:q.trim(),a:a.trim(),id:Math.random().toString(36)};});
    if(cards.length && name) { setDecks([{id:Date.now().toString(), name, cards}, ...decks]); setTxt(""); setName(""); setOpen(false); }
  };

  return (
    <div className="space-y-6">
      <SectionHeader icon={<Icon name="Library" />} title="Flashcards" badge={`${decks.length} mazos`} colorClass="rose" />
      <button onClick={() => setOpen(!open)} className="w-full p-4 bg-rose-600 text-white rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-rose-100"><Icon name="Plus" size={20} /> CREAR MAZO</button>
      {open && (
        <div className="bento-card p-6 border-4 border-rose-100 space-y-4">
          <input placeholder="Nombre del mazo..." value={name} onChange={e=>setName(e.target.value)} className="w-full bg-rose-50 rounded-xl p-3 border-none font-bold" />
          <textarea placeholder="Pregunta : Respuesta (una por línea)" value={txt} onChange={e=>setTxt(e.target.value)} className="w-full h-32 bg-rose-50 rounded-xl p-3 border-none font-bold resize-none" />
          <button onClick={add} className="w-full p-3 bg-rose-600 text-white rounded-xl font-black">GUARDAR</button>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decks.map(d => (
          <div key={d.id} onClick={()=>onSelect(d.id)} className="bento-card p-5 border-4 border-rose-50 flex justify-between items-center cursor-pointer hover:border-rose-100">
            <div><p className="text-base font-black">{d.name}</p><p className="text-[10px] font-bold text-rose-400 uppercase">{d.cards.length} tarjetas</p></div>
            <button onClick={e=>{e.stopPropagation(); setDecks(decks.filter(x=>x.id!==d.id));}} className="p-2 text-slate-200 hover:text-rose-500"><Icon name="Trash2" size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeckStudyView({ deck, onBack, addPoints }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck.cards[idx];

  return (
    <div className="space-y-8 max-w-xl mx-auto py-6">
      <button onClick={onBack} className="text-xs font-black text-slate-400 uppercase flex items-center gap-2"><Icon name="ChevronRight" className="rotate-180" size={16} /> Volver</button>
      <div className="h-80 w-full relative" style={{ perspective: '1000px' }} onClick={() => { if(!flipped) addPoints(2, "Estudio Flashcard"); setFlipped(!flipped); }}>
        <div className={`flip-card-inner w-full h-full relative rounded-[40px] cursor-pointer ${flipped ? 'flipped' : ''}`}>
          <div className="flip-card-front bg-white border-8 border-rose-50 flex items-center justify-center p-10 rounded-[40px] text-center shadow-xl">
            <p className="text-2xl font-black">{card?.q}</p>
          </div>
          <div className="flip-card-back bg-rose-600 text-white flex items-center justify-center p-10 rounded-[40px] text-center shadow-xl border-8 border-rose-500">
            <p className="text-xl font-medium">{card?.a}</p>
          </div>
        </div>
      </div>
      <div className="flex gap-4">
        <button onClick={()=> {setIdx(p=>Math.max(0,p-1)); setFlipped(false);}} className="flex-1 py-4 bg-white border-2 border-rose-100 rounded-2xl font-black" disabled={idx===0}>ANTERIOR</button>
        <button onClick={()=> {setIdx(p=>Math.min(deck.cards.length-1,p+1)); setFlipped(false);}} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black" disabled={idx===deck.cards.length-1}>SIGUIENTE</button>
      </div>
    </div>
  );
}

function TodoView({ todos, setTodos, addPoints }) {
  const [inp, setInp] = useState("");
  const add = (e) => { e.preventDefault(); if (inp.trim()) { setTodos([{ id: Date.now().toString(), text: inp, completed: false, type: 'goal' }, ...todos]); setInp(""); } };
  
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <SectionHeader icon={<Icon name="ListTodo" />} title="Tareas" badge={todos.filter(t=>!t.completed).length} colorClass="orange" />
      <form onSubmit={add} className="flex gap-2"><input placeholder="¿Qué quieres conseguir hoy?..." value={inp} onChange={e=>setInp(e.target.value)} className="flex-1 bg-white border-4 border-orange-50 rounded-2xl px-5 py-4 text-sm font-bold outline-none shadow-sm" /><button type="submit" className="p-4 bg-orange-600 text-white rounded-2xl shadow-lg active:scale-95"><Icon name="Plus" size={28} /></button></form>
      <div className="space-y-3">
        {todos.map(t => (
          <div key={t.id} className={`bento-card p-4 border-2 flex items-center gap-4 ${t.completed ? 'opacity-40 grayscale border-slate-50' : 'border-orange-50'}`}>
            <button onClick={()=>{
              setTodos(prev => prev.map(pt => { if(pt.id===t.id) { const nc = !pt.completed; if(nc) addPoints(5, t.text); return {...pt, completed: nc}; } return pt; }));
            }} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center ${t.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-orange-200'}`}>{t.completed && <Icon name="Check" size={16} />}</button>
            <span className={`flex-1 text-sm font-bold ${t.completed?'line-through':''}`}>{t.text}</span>
            <button onClick={()=>setTodos(prev=>prev.filter(x=>x.id!==t.id))} className="text-slate-200 hover:text-red-500"><Icon name="Trash2" size={18} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesView({ notes, setNotes }) {
  const [txt, setTxt] = useState("");
  const add = () => { if(txt.trim()) { setNotes([{id:Date.now().toString(), text:txt, color:NOTE_COLORS[0], rot:Math.floor(Math.random()*6)-3}, ...notes]); setTxt(""); } };
  
  return (
    <div className="space-y-6">
      <SectionHeader icon={<Icon name="StickyNote" />} title="Muro de Notas" badge={notes.length} colorClass="yellow" />
      <div className="bento-card p-6 border-4 border-yellow-50 space-y-4">
        <textarea placeholder="Cita motivadora, ley o recordatorio..." value={txt} onChange={e=>setTxt(e.target.value)} className="w-full h-24 bg-transparent border-none text-base font-bold outline-none resize-none" />
        <button onClick={add} className="w-full py-3 bg-yellow-500 text-white rounded-xl font-black text-sm">PEGAR NOTA</button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
        {notes.map(n=>(
          <div key={n.id} style={{ transform: `rotate(${n.rot}deg)` }} className={`relative p-5 aspect-square rounded shadow-xl border-t-[8px] bg-yellow-100 border-yellow-200 flex flex-col justify-between group`}>
            <p className="text-xs font-black overflow-y-auto leading-relaxed text-yellow-900 custom-scrollbar">{n.text}</p>
            <button onClick={()=>setNotes(prev=>prev.filter(x=>x.id!==n.id))} className="self-end opacity-0 group-hover:opacity-100 text-slate-400 transition-opacity"><Icon name="Trash2" size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsView({ actionLogs, levelDates }) {
  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <SectionHeader icon={<Icon name="BarChart3" />} title="Estadísticas" badge="Historial" colorClass="violet" />
      <div className="space-y-3">
        {actionLogs.slice(0, 20).map(l => (
          <div key={l.id} className="bento-card p-4 border-2 border-violet-50 flex justify-between items-center">
            <div className="text-left"><p className="text-sm font-black text-slate-800">{l.description}</p><p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(l.timestamp).toLocaleString()}</p></div>
            <span className="text-xs font-black text-violet-700 bg-violet-50 px-3 py-1.5 rounded-xl">+{l.amount} pts</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BadgesView({ maxStreak, points, topics }) {
  const badges = [
    { id: '1', icon: '🐢', title: 'Iniciado', cond: points >= 500 },
    { id: '2', icon: '🔥', title: 'Constante', cond: maxStreak >= 7 },
    { id: '3', icon: '🎯', title: 'Enfocado', cond: topics.filter(t=>t.written).length >= 10 },
    { id: '4', icon: '🐉', title: 'Maestro', cond: points >= 5000 },
  ];
  
  return (
    <div className="space-y-6">
      <SectionHeader icon={<Icon name="Award" />} title="Logros" badge={badges.filter(b=>b.cond).length} colorClass="amber" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map(b => (
          <div key={b.id} className={`bento-card p-6 border-4 flex flex-col items-center text-center transition-all ${b.cond ? 'border-amber-200 bg-amber-50' : 'opacity-20 grayscale'}`}>
            <span className="text-4xl mb-2">{b.icon}</span>
            <p className="text-sm font-black">{b.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
