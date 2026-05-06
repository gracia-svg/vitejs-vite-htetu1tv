import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot, collection, getDoc } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// ==========================================
// 1. ICONOS Y AYUDANTES
// ==========================================
const ICON_PATHS = {
  Turtle: '<path d="m12 10 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a8 8 0 1 0-16 0v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3l2-4h4Z"/><path d="M4.82 7.9 8 10"/><path d="M15.18 7.9 12 10"/><path d="M16.93 10H20a2 2 0 0 1 0 4H2"/>',
  MapIcon: '<polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/>',
  BookOpen: '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',
  FileText: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  Clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  Trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>',
  ChevronDown: '<polyline points="6 9 12 15 18 9"/>',
  Target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  Plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  Minus: '<line x1="5" y1="12" x2="19" y2="12"/>',
  Star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  Dices: '<rect width="12" height="12" x="2" y="10" rx="2" ry="2"/><path d="m17.92 14 3.5-3.5a2.24 2.24 0 0 0 0-3l-5-4.92a2.24 2.24 0 0 0-3 0L10 6"/>',
  Award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  StickyNote: '<path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z"/><path d="M15 3v6h6"/>',
  Library: '<path d="m16 6 4 14"/><path d="M12 6v14"/><path d="M8 8v12"/><path d="M4 4v16"/>',
  ListTodo: '<rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/><path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>',
  Flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  Undo2: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/>',
  Trash2: '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>',
  Archive: '<polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/>',
  Lock: '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
  Search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  ChevronRight: '<polyline points="9 18 15 12 9 6"/>',
  Check: '<polyline points="20 6 9 17 4 12"/>',
  Pin: '<line x1="12" y1="17" x2="12" y2="22"/><path d="M5 17h14v-15l-2.5-3.5V5a2 2 0 0 0-4 0v7l-2.5 3.5Z"/>',
  BarChart3: '<path d="M3 3v18h18"/><rect width="4" height="7" x="7" y="10" rx="1"/><rect width="4" height="12" x="15" y="5" rx="1"/>',
  Zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  Edit: '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>',
  Shuffle: '<polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/>',
  X: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  Maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/>',
  Minimize: '<path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>',
  Calendar: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
  AlertTriangle: '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  Settings: '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.72V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.17a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>'
};

const Icon = ({ name, size = 24, strokeWidth = 2, className = "" }) => {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} dangerouslySetInnerHTML={{ __html: path }} />
  );
};

// Generador de ID de semana ISO para Misiones Semanales
const getWeekId = () => {
  const d = new Date();
  d.setUTCDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  return `${d.getUTCFullYear()}-W${weekNo}`;
};

const DECK_CATEGORIES = ["General", "Metodología", "Comunicación", "Fonética", "Gramática", "Discurso", "Lit. Británica", "Lit. Americana", "Cultura"];
const INITIAL_TOPICS = [];
const INITIAL_PLANNING = [
  { id: 'p1', title: 'Introduction and Justification', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p2', title: 'Contextualization', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p3', title: 'Legal Framework', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p4', title: 'Objectives', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p5', title: 'Competences', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p6', title: 'Basic Knowledge', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p7', title: 'Methodology and DUA', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p8', title: 'Transversal Elements', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p9', title: 'Interdisciplinarity', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p10', title: 'Evaluation and Criteria', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p11', title: 'Resources and Materials', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p12', title: 'Complementary Activities', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" },
  { id: 'p13', title: 'Conclusion and Bibliography', status: 0, indexNotes: "", priority: null, leg: "LOMLOE" }
];

const INITIAL_UNITS = Array.from({ length: 6 }, (_, i) => ({ 
  id: `ud${i + 1}`, title: `Didactic Unit ${i + 1}`, status: 0, indexNotes: "", priority: null, ce: "", sb: "", do: "", cr: "", leg: "LOMLOE"
}));

const INITIAL_SKILLS = [
  { id: 's1', label: 'Translation', level: 0 },
  { id: 's2', label: 'Use of English', level: 0 },
  { id: 's3', label: 'Didactical Application', level: 0 },
  { id: 's4', label: 'Phonetics', level: 0 }
];

const getTopicBlock = (id) => {
  if (typeof id === 'string' && id.startsWith('ud')) return { name: 'Unit', badge: 'bg-teal-100 text-teal-700 border-teal-200', color: '!bg-teal-500' };
  if (typeof id === 'string' && id.startsWith('p')) return { name: 'Planning', badge: 'bg-blue-100 text-blue-700 border-blue-200', color: '!bg-blue-500' };
  
  if ([1, 2].includes(id)) return { name: 'Methodology', badge: 'bg-orange-100 text-orange-700 border-orange-200', color: '!bg-orange-500' };
  if ([3, 4, 5, 6, 28, 40].includes(id)) return { name: 'Communication', badge: 'bg-purple-100 text-purple-700 border-purple-200', color: '!bg-purple-500' };
  if ([7, 8, 9].includes(id)) return { name: 'Phonetics', badge: 'bg-slate-200 text-slate-800 border-slate-300', color: '!bg-slate-500' };
  if (id >= 10 && id <= 27) return { name: 'Grammar', badge: 'bg-sky-100 text-sky-700 border-sky-200', color: '!bg-sky-500' };
  if (id >= 29 && id <= 39) return { name: 'Discourse', badge: 'bg-pink-100 text-pink-700 border-pink-200', color: '!bg-pink-500' };
  if ([41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 56, 57, 58, 62].includes(id)) return { name: 'Brit Lit', badge: 'bg-green-100 text-green-700 border-green-200', color: '!bg-green-500' };
  if ([46, 52, 53, 54, 55, 59, 60].includes(id)) return { name: 'Amer Lit', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', color: '!bg-yellow-500' };
  if ([61, 63, 64, 65, 66, 67, 68, 69].includes(id)) return { name: 'Culture', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', color: '!bg-indigo-500' };
  return { name: 'General', badge: 'bg-gray-100 text-gray-700 border-gray-200', color: '!bg-slate-600' };
};

const getPlanningStatusLabel = (status) => {
  if (status === 0) return 'NONE';
  if (status <= 3) return `SKETCH (${status}/3)`;
  if (status <= 6) return `WRITING (${status-3}/3)`;
  if (status <= 9) return `REHEARSAL (${status-6}/3)`;
  if (status === 10) return 'FINISHED';
  return 'NONE';
};

const EditableText = ({ value, onSave, className, isArea = false }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTemp] = useState(value);

  if (isEditing) {
    return isArea ? (
      <textarea 
        autoFocus 
        className={`bg-white border-2 border-emerald-300 rounded p-2 outline-none text-slate-900 w-full resize-none ${className}`} 
        value={temp} 
        onChange={e => setTemp(e.target.value)} 
        onBlur={() => { if(temp !== value) onSave(temp); setIsEditing(false); }} 
      />
    ) : (
      <input 
        autoFocus 
        className={`bg-white border-2 border-emerald-300 rounded px-1 outline-none text-slate-900 ${className}`} 
        value={temp} 
        onChange={e => setTemp(e.target.value)} 
        onBlur={() => { if(temp !== value) onSave(temp); setIsEditing(false); }} 
        onKeyDown={e => { if(e.key === 'Enter') { if(temp !== value) onSave(temp); setIsEditing(false); } }} 
      />
    );
  }
  return <span onClick={() => setIsEditing(true)} className={`cursor-pointer hover:bg-emerald-50 rounded transition-colors ${className}`}>{value || "..."}</span>;
};

// ==========================================
// 3. APP PRINCIPAL
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
const db = getFirestore(app);
const auth = getAuth(app);

const APP_ID_PATH = 'turtlestudy-v6';

export default function App() {
  const [syncCode, setSyncCode] = useState(() => localStorage.getItem('turtle_sync_code') || "");
  const [isLogged, setIsLogged] = useState(false);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('map');
  const [isToolsExpanded, setIsToolsExpanded] = useState(false);

  const [points, setPoints] = useState(0);
  const [topics, setTopics] = useState(INITIAL_TOPICS);
  const [planning, setPlanning] = useState(INITIAL_PLANNING);
  const [units, setUnits] = useState(INITIAL_UNITS);
  const [skills, setSkills] = useState(INITIAL_SKILLS);
  const [decks, setDecks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [todos, setTodos] = useState([]);
  const [actionLogs, setActionLogs] = useState([]);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [levelDates, setLevelDates] = useState({ 1: new Date().toLocaleDateString() });
  const [examDate, setExamDate] = useState("2026-06-20");
  const [submissionDate, setSubmissionDate] = useState("2026-06-01");
  const [practicoSessions, setPracticoSessions] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState(null);

  // NUEVOS ESTADOS (Misiones y SRS)
  const [perfectWeeks, setPerfectWeeks] = useState(0);
  const [totalDailyChallenges, setTotalDailyChallenges] = useState(0);
  const [lastChallengeDate, setLastChallengeDate] = useState(null);
  const [weeklyData, setWeeklyData] = useState({ 
    weekId: getWeekId(), points: 0, topicsTouched: false, progTouched: false, practicoTouched: false, dailyChallengesDone: 0, claimed1: false, claimed2: false 
  });

  // ESTADOS DEL VAULT
  const [vaultItems, setVaultItems] = useState([]);
  const [showVaultModal, setShowVaultModal] = useState(false);
  const [showVaultCarousel, setShowVaultCarousel] = useState(false);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [endTime, setEndTime] = useState(null);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");

  const [luckyNumbers, setLuckyNumbers] = useState([0,0,0,0]);
  const [activeDeckId, setActiveDeckId] = useState(null);
  const [examDeck, setExamDeck] = useState(null);
  const [selectedTopicModal, setSelectedTopicModal] = useState(null);
  const [isModalFullscreen, setIsModalFullscreen] = useState(false);

  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const s = document.createElement('script'); s.id = 'tailwind-cdn'; s.src = "https://cdn.tailwindcss.com"; document.head.appendChild(s);
    }
    if (syncCode) setIsLogged(true);
    const init = async () => { try { await signInAnonymously(auth); } catch(e){} }; init();
  }, [syncCode]);

 // 1. LÓGICA DE MIGRACIÓN (Sube los temas a la nube si no están)
  useEffect(() => {
    if (!isLogged) return;
    const syncDatabaseStructure = async () => {
      try {
        const masterRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'master_syllabus');
        const masterSnap = await getDoc(masterRef);
        if (!masterSnap.exists()) {
          console.log("Migrando temas a Firestore...");
          await setDoc(masterRef, { 
            master_topics: INITIAL_TOPICS.map(t => ({
              id: t.id, title: t.title, ce: t.ce, do: t.do, sb: t.sb, cr: t.cr, leg: t.leg, indexNotes: t.indexNotes 
            }))
          });
        }
      } catch (e) { console.error("Error en migración:", e); }
    };
    syncDatabaseStructure();
  }, [isLogged]);

  // 2. CARGA INTELIGENTE Y SEGURO DE DESBLOQUEO
  useEffect(() => {
    if (!isLogged || !syncCode) return;
    const userDocRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'turtle_users', syncCode);
    const masterDocRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'master_syllabus');

    const unsubscribe = onSnapshot(userDocRef, async (userSnap) => {
      try {
        if (userSnap.exists()) {
          const userData = userSnap.data();
          // Intentamos traer títulos de la nube, si falla usamos los del código
          let masterTopics = INITIAL_TOPICS;
          try {
            const masterSnap = await getDoc(masterDocRef);
            if (masterSnap.exists()) masterTopics = masterSnap.data().master_topics;
          } catch (e) { console.warn("Usando temas locales temporalmente"); }

          const finalTopics = masterTopics.map(mT => {
            const uT = userData.topics?.find(ts => ts.id === mT.id);
            return {
              ...mT,
              redactado: uT?.redactado || false,
              estudiado: uT?.estudiado || 0,
              reviews: uT?.reviews || 0,
              mocks: uT?.mocks || 0,
              miniMocks: uT?.miniMocks || 0,
              finished: uT?.finished || false,
              discarded: uT?.discarded || false,
              stars: uT?.stars || 0,
              indexNotes: uT?.indexNotes || mT.indexNotes, 
              priority: uT?.priority ?? null
            };
          });

          setPoints(userData.points || 0);
          setTopics(finalTopics);
          setPlanning(userData.planning || INITIAL_PLANNING);
          setUnits(userData.units || INITIAL_UNITS);
          setSkills(userData.skills || INITIAL_SKILLS);
          setDecks(userData.decks || []);
          setTodos(userData.todos || []); 
          setNotes(userData.notes || []); 
          setActionLogs(userData.actionLogs || []);
          setStreak(userData.streak || 0);
          setMaxStreak(userData.maxStreak || 0); 
          setLevelDates(userData.levelDates || { 1: new Date().toLocaleDateString() });
          setPerfectWeeks(userData.perfectWeeks || 0);
          setWeeklyData(userData.weeklyData || weeklyData);
          setTotalDailyChallenges(userData.totalDailyChallenges || 0);
          setVaultItems(userData.vaultItems || []);
        } else {
          // Si el usuario es nuevo, no lo bloqueamos
          setTopics(INITIAL_TOPICS);
        }
      } catch (err) {
        console.error("Error crítico de carga:", err);
      } finally {
        // ESTO ES LO IMPORTANTE: Pase lo que pase, quitamos la pantalla de carga
        setIsDataLoaded(true);
      }
    });

    return () => unsubscribe();
  }, [isLogged, syncCode]);

  useEffect(() => {
    if (!isDataLoaded || !isLogged) return;
    const save = async () => {
      const docRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'turtle_users', syncCode);
      await setDoc(docRef, { points, topics, planning, units, skills, decks, todos, notes, actionLogs, examDate, submissionDate, streak, maxStreak, practicoSessions, levelDates, lastActiveDate, perfectWeeks, totalDailyChallenges, lastChallengeDate, weeklyData, vaultItems });
    };
    const t = setTimeout(save, 1500); return () => clearTimeout(t);
  }, [points, topics, planning, units, skills, decks, todos, notes, actionLogs, examDate, submissionDate, streak, maxStreak, practicoSessions, levelDates, lastActiveDate, perfectWeeks, totalDailyChallenges, lastChallengeDate, weeklyData, vaultItems, isDataLoaded]);

  const addPoints = (amount, desc, actionData = null) => {
    let finalLogs = [...actionLogs];

    // Payload Cleanup 24h
    const twentyFourHoursAgo = Date.now() - 86400000;
    finalLogs = finalLogs.map(log => {
      if (log.actionData && log.timestamp < twentyFourHoursAgo) {
        const cleanedLog = { ...log };
        delete cleanedLog.actionData;
        return cleanedLog;
      }
      return log;
    });

    const oldLevel = Math.floor(points / 200) + 1;
    const newPoints = Math.max(0, points + amount);
    const newLevel = Math.floor(newPoints / 200) + 1;
    setPoints(newPoints);
    
    if (newLevel > oldLevel) setLevelDates(prev => ({ ...prev, [newLevel]: new Date().toLocaleDateString() }));
    
    if (amount > 0) {
      const today = new Date().toDateString();
      if (lastActiveDate !== today) {
        const newStreak = lastActiveDate ? (Math.round((new Date(today) - new Date(lastActiveDate)) / 864e5) === 1 ? streak + 1 : 1) : 1;
        setStreak(newStreak);
        if (newStreak > maxStreak) setMaxStreak(newStreak);
        setLastActiveDate(today);
      }
    }

    finalLogs.unshift({ id: Date.now().toString(), amount, description: desc, timestamp: Date.now(), actionData });
    setActionLogs(finalLogs);

    // Sumar a Misiones Semanales
    const currentWeekId = getWeekId();
    setWeeklyData(prev => {
      let newData = { ...prev };
      if (newData.weekId !== currentWeekId) {
        newData = { weekId: currentWeekId, points: 0, topicsTouched: false, progTouched: false, practicoTouched: false, dailyChallengesDone: 0, claimed1: false, claimed2: false };
      }
      if (amount > 0) newData.points += amount;
      return newData;
    });
  };

  const touchWeekly = (field) => {
    setWeeklyData(prev => {
      const currentWeek = getWeekId();
      if (prev.weekId !== currentWeek) {
        return { weekId: currentWeek, points: 0, topicsTouched: field==='topics', progTouched: field==='prog', practicoTouched: field==='practico', dailyChallengesDone: 0, claimed1: false, claimed2: false };
      }
      return { ...prev, [field + 'Touched']: true };
    });
  };

  const claimMission = (num) => {
    addPoints(50, `Misión Semanal ${num} Completada`);
    setWeeklyData(prev => {
      const next = {...prev, [`claimed${num}`]: true};
      if (next.claimed1 && next.claimed2 && (!prev.claimed1 || !prev.claimed2)) {
        setPerfectWeeks(pw => pw + 1);
        /* --- SWIFTIE REFERENCE START --- */
        setTimeout(() => alert("Perfect week! That's a real fucking legacy to leave. 🍷"), 500);
        /* --- SWIFTIE REFERENCE END --- */
      }
      return next;
    });
  };

  const handleUpdateCard = (deckId, cardId, newData) => {
    setDecks(prev => prev.map(d => {
       if (d.id.toString() === deckId.toString()) {
          return { ...d, cards: d.cards.map(c => c.id === cardId ? { ...c, ...newData } : c) };
       }
       return d;
    }));
  };

  const handleChallengeFinish = () => {
    setTotalDailyChallenges(prev => prev + 1);
    const todayStr = new Date().toDateString();
    if (lastChallengeDate !== todayStr) {
        setLastChallengeDate(todayStr);
        setWeeklyData(prev => prev.weekId === getWeekId() ? {...prev, dailyChallengesDone: prev.dailyChallengesDone + 1} : { weekId: getWeekId(), points: 0, topicsTouched: false, progTouched: false, practicoTouched: false, dailyChallengesDone: 1, claimed1: false, claimed2: false });
    }
    addPoints(25, "Daily Anki Challenge Completed");
    setActiveDeckId(null);
    setExamDeck(null);
  };

  const undoAction = (id) => {
    const log = actionLogs.find(l => l.id === id);
    if (log) { 
      if (!log.actionData && log.amount !== 0) {
         alert("Esta acción es demasiado antigua para deshacer sus cambios específicos de forma segura. Sin embargo, se restaurarán tus puntos a nivel general.");
      }

      const newPoints = Math.max(0, points - log.amount);
      const oldLevel = Math.floor(points / 200) + 1;
      const newLevel = Math.floor(newPoints / 200) + 1;
      
      if (newLevel < oldLevel) {
        setLevelDates(prev => {
          const nextDates = { ...prev };
          for (let i = newLevel + 1; i <= oldLevel; i++) delete nextDates[i];
          return nextDates;
        });
      }
      setPoints(newPoints);

      if (log.actionData) {
        const { entity, id: entityId, field, prevValue } = log.actionData;
        if (entity === 'topic') setTopics(prev => prev.map(t => t.id === entityId ? { ...t, [field]: prevValue } : t));
        else if (entity === 'planning') setPlanning(prev => prev.map(p => p.id === entityId ? { ...p, [field]: prevValue } : p));
        else if (entity === 'unit') setUnits(prev => prev.map(u => u.id === entityId ? { ...u, [field]: prevValue } : u));
        else if (entity === 'skill') setSkills(prev => prev.map(s => s.id === entityId ? { ...s, level: prevValue } : s));
        else if (entity === 'practico_sessions') setPracticoSessions(prevValue);
        else if (entity === 'todo') setTodos(prev => prev.map(t => t.id === entityId ? { ...t, completed: prevValue } : t));
        else if (entity === 'topics_reset') setTopics(prevValue);
        else if (entity === 'planning_reset') { setPlanning(prevValue.planning); setUnits(prevValue.units); }
        else if (entity === 'practico_reset') { setSkills(prevValue.skills); setPracticoSessions(prevValue.sessions); }
      }
      setActionLogs(prev => prev.filter(l => l.id !== id)); 
    }
  };

  const handleResetTopics = () => {
    if(window.confirm("¿Resetear TODO el progreso de los Temas?")) {
      addPoints(0, "Reset Temas", { entity: 'topics_reset', prevValue: topics });
      setTopics(topics.map(t => ({...t, redactado: false, estudiado: 0, reviews: 0, mocks: 0, miniMocks: 0, finished: false, stars: 0})));
    }
  };

  const handleResetPlanning = () => {
    if(window.confirm("¿Resetear progreso de Programación y UDs?")) {
      addPoints(0, "Reset Programación", { entity: 'planning_reset', prevValue: { planning, units } });
      setPlanning(planning.map(p => ({...p, status: 0})));
      setUnits(units.map(u => ({...u, status: 0})));
    }
  };

  const handleResetPractico = () => {
    if(window.confirm("¿Resetear progreso Práctico?")) {
      addPoints(0, "Reset Práctico", { entity: 'practico_reset', prevValue: { skills, sessions: practicoSessions } });
      setSkills(skills.map(s => ({...s, level: 0})));
      setPracticoSessions(0);
    }
  };

  useEffect(() => {
    let int;
    if (isTimerActive && endTime) {
      const checkTime = () => {
        const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining <= 0) {
          setIsTimerActive(false);
          setEndTime(null);
        }
      };
      checkTime();
      int = setInterval(checkTime, 1000);
    } else if (!isTimerActive && timeLeft === 0) {
      setEndTime(null);
    }
    return () => clearInterval(int);
  }, [isTimerActive, endTime]);

  const currentLevel = Math.floor(points/200)+1;

  if (!isLogged) return <LoginScreen onLogin={(c) => { setSyncCode(c); localStorage.setItem('turtle_sync_code', c); }} />;
  if (!isDataLoaded) return <LoadingScreen />;

  return (
    <div className="min-h-screen pb-32 font-sans relative overflow-x-hidden">
      <style>{`
        body { background-color: #f8fafc; background-image: radial-gradient(#fbbf24 2px, transparent 2px), radial-gradient(#f472b6 2px, transparent 2px), radial-gradient(#60a5fa 2px, transparent 2px), radial-gradient(#34d399 2px, transparent 2px); background-size: 80px 80px; background-position: 0 0, 40px 40px, 20px 60px, 60px 20px; }
        .bento-card { border-radius: 28px; border: 2px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.05); transition: all 0.3s ease; background: white; }
        .map-bubble { width: 80px; height: 80px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; border: 6px solid white; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .modal-overlay { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); position: fixed; inset: 0; z-index: 500; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal-content { background: white; width: 100%; max-width: 600px; max-height: 85vh; border-radius: 40px; overflow-y: auto; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1); }
        .modal-fullscreen { max-width: 100vw !important; max-height: 100vh !important; height: 100vh !important; border-radius: 0 !important; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .vault-pill { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #cbd5e1; border: 1px solid #334155; }
      `}</style>

      {/* MODALES DEL VAULT */}
      {showVaultModal && (
        <div className="modal-overlay animate-in fade-in" onClick={() => { setShowVaultModal(false); setShowVaultCarousel(true); }}>
          <div className="bg-white rounded-[40px] p-8 max-w-sm w-full text-center shadow-2xl relative animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
             <button onClick={() => { setShowVaultModal(false); setShowVaultCarousel(true); }} className="absolute top-4 right-4 text-slate-300 hover:text-red-500"><Icon name="X" size={24}/></button>
             <p className="text-[10px] font-black uppercase text-amber-500 tracking-[0.3em] mb-4">Daily Wisdom From The Vault 🗝️</p>
             {vaultItems.length > 0 ? (
               <div className="space-y-4">
                 <p className="text-xl font-black text-slate-800 leading-tight italic">"{vaultItems[Math.floor(Math.random() * vaultItems.length)].text}"</p>
                 <p className="text-xs font-bold text-slate-400">— {vaultItems[Math.floor(Math.random() * vaultItems.length)].reference}</p>
               </div>
             ) : (
               <p className="text-sm font-bold text-slate-400 italic">Vault is empty. Import citations in settings.</p>
             )}
             <p className="mt-8 text-[8px] font-black text-slate-300 uppercase animate-pulse">Touch to enter full carousel</p>
          </div>
        </div>
      )}

      {showVaultCarousel && (
        <VaultCarousel items={vaultItems} setItems={setVaultItems} onClose={() => setShowVaultCarousel(false)} />
      )}

      {/* MODAL GLOBAL */}
      {selectedTopicModal && (
        <div className="modal-overlay animate-in fade-in duration-300" onClick={() => { setSelectedTopicModal(null); setIsModalFullscreen(false); }}>
          <div className={`modal-content p-8 custom-scrollbar animate-in zoom-in-95 duration-300 ${isModalFullscreen ? 'modal-fullscreen' : ''}`} onClick={e => e.stopPropagation()}>
            <div className="absolute top-6 right-6 flex gap-2">
              <button onClick={() => setIsModalFullscreen(!isModalFullscreen)} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-emerald-50 hover:text-emerald-500 transition-colors">
                <Icon name={isModalFullscreen ? "Minimize" : "Maximize"} size={20} />
              </button>
              <button onClick={() => { setSelectedTopicModal(null); setIsModalFullscreen(false); }} className="p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>
            
            <div className="text-center space-y-6">
              <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-4 ${getTopicBlock(selectedTopicModal.id).badge}`}>
                {selectedTopicModal.id.toString().startsWith('ud') ? selectedTopicModal.id.replace('ud','') : selectedTopicModal.id.toString().startsWith('p') ? selectedTopicModal.id.replace('p','') : selectedTopicModal.id}
              </div>
              
              <div className="px-4">
                <EditableText 
                  value={selectedTopicModal.title} 
                  onSave={(nv) => { 
                    const listName = selectedTopicModal.id.toString().startsWith('p') ? 'planning' : selectedTopicModal.id.toString().startsWith('ud') ? 'units' : 'topics';
                    const setter = listName === 'planning' ? setPlanning : listName === 'units' ? setUnits : setTopics;
                    setter(prev => prev.map(t => t.id === selectedTopicModal.id ? { ...t, title: nv } : t));
                    setSelectedTopicModal({...selectedTopicModal, title: nv});
                  }} 
                  className="text-2xl font-black text-slate-900 leading-tight block" 
                />
              </div>

              {/* CURRICULAR ALIGNMENT */}
              {selectedTopicModal.id.toString().startsWith('ud') ? (
                <div className="flex flex-wrap justify-center gap-2 px-4 border-b border-slate-50 pb-6">
                  {['ce', 'sb', 'do', 'cr', 'leg'].map(key => (
                    <div key={key} className="flex flex-col items-center">
                      <span className="text-[7px] font-black uppercase text-slate-400 mb-1">{key}</span>
                      <EditableText 
                        value={selectedTopicModal[key]} 
                        onSave={(nv) => { 
                          setUnits(prev => prev.map(u => u.id === selectedTopicModal.id ? { ...u, [key]: nv } : u)); 
                          setSelectedTopicModal({...selectedTopicModal, [key]: nv}); 
                        }} 
                        className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-[9px] font-black border border-slate-100" 
                      />
                    </div>
                  ))}
                </div>
              ) : selectedTopicModal.id.toString().startsWith('p') ? (
                <div className="flex justify-center gap-2 px-4 border-b border-slate-50 pb-6">
                  <div className="flex flex-col items-center">
                    <span className="text-[7px] font-black uppercase text-slate-400 mb-1">Legislación</span>
                    <EditableText 
                      value={selectedTopicModal.leg || "LOMLOE"} 
                      onSave={(nv) => { 
                        setPlanning(prev => prev.map(p => p.id === selectedTopicModal.id ? { ...p, leg: nv } : p)); 
                        setSelectedTopicModal({...selectedTopicModal, leg: nv}); 
                      }} 
                      className="px-2 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black border border-blue-100" 
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-2 px-4 border-b border-slate-50 pb-6">
                  {['ce', 'do', 'sb', 'cr', 'leg'].map(key => (
                    <div key={key} className="flex flex-col items-center">
                      <span className="text-[7px] font-black uppercase text-slate-400 mb-1">{key}</span>
                      <EditableText 
                        value={selectedTopicModal[key]} 
                        onSave={(nv) => { 
                          setTopics(prev => prev.map(t => t.id === selectedTopicModal.id ? { ...t, [key]: nv } : t)); 
                          setSelectedTopicModal({...selectedTopicModal, [key]: nv}); 
                        }} 
                        className={`px-2 py-1 rounded-lg text-[9px] font-black border ${
                          key==='ce' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                          key==='do' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          key==='sb' ? 'bg-violet-50 text-violet-600 border-violet-100' :
                          key==='cr' ? 'bg-pink-50 text-pink-600 border-pink-100' :
                          'bg-amber-50 text-amber-600 border-amber-100'
                        }`} 
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* LEY ALERT */}
              {!selectedTopicModal.id.toString().startsWith('p') && !selectedTopicModal.id.toString().startsWith('ud') && [1, 2, 39, 40, 62, 65, 66].includes(selectedTopicModal.id) && (
                <div className="mx-4 p-3 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center gap-3 text-amber-700 animate-pulse">
                  <Icon name="AlertTriangle" size={24} />
                  <p className="text-[10px] font-black text-left uppercase leading-tight">
                    { [62, 65, 66].includes(selectedTopicModal.id) ? "Must comply with Law 1/2024 (Libertad Educativa CV)" : "Must comply with Decree 104/2018 (Inclusión CV)" }
                  </p>
                </div>
              )}

              <div className="border-t-2 border-slate-50 pt-6 text-left">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content & Script</span>
                  <button onClick={() => { 
                    const listName = selectedTopicModal.id.toString().startsWith('p') ? 'planning' : selectedTopicModal.id.toString().startsWith('ud') ? 'units' : 'topics';
                    const setter = listName === 'planning' ? setPlanning : listName === 'units' ? setUnits : setTopics;
                    if (selectedTopicModal.isEditing) {
                      setter(prev => prev.map(t => t.id === selectedTopicModal.id ? { ...t, indexNotes: selectedTopicModal.tempNotes } : t));
                      setSelectedTopicModal({ ...selectedTopicModal, isEditing: false, indexNotes: selectedTopicModal.tempNotes });
                    } else {
                      setSelectedTopicModal({ ...selectedTopicModal, isEditing: true, tempNotes: selectedTopicModal.indexNotes });
                    }
                  }} className={`p-2 rounded-xl transition-all ${selectedTopicModal.isEditing ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon name={selectedTopicModal.isEditing ? "Check" : "Edit"} size={18} />
                  </button>
                </div>
                {selectedTopicModal.isEditing ? (
                  <textarea 
                    autoFocus 
                    className="w-full h-96 p-4 bg-slate-50 rounded-2xl border-2 border-emerald-200 outline-none font-medium text-slate-700 leading-relaxed resize-none custom-scrollbar" 
                    value={selectedTopicModal.tempNotes} 
                    onChange={e => setSelectedTopicModal({ ...selectedTopicModal, tempNotes: e.target.value })} 
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 min-h-[200px] overflow-x-auto">
                    {selectedTopicModal.indexNotes || "Notes..."}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER PREMIUM */}
      <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b-2 border-slate-100 p-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer transition-transform active:scale-95" onClick={() => setActiveTab('map')}>
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg"><Icon name="Turtle" size={24} /></div>
            <span className="font-black text-emerald-950 text-xl tracking-tighter hidden sm:block">TurtleStudy</span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => { setActiveTab('stats'); setIsToolsExpanded(true); }} className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-black flex items-center gap-2 text-sm shadow-sm hover:bg-emerald-100 transition-colors">
              <Icon name="Trophy" size={16} /><span>{points}</span>
            </button>
            
            <div className="relative">
              <button onClick={() => setShowTimerMenu(!showTimerMenu)} className={`px-3 py-2 rounded-2xl font-black flex items-center gap-2 border transition-all text-sm ${isTimerActive ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-lg' : 'bg-white text-emerald-600 border-slate-200'}`}>
                <Icon name="Clock" size={16} className={isTimerActive ? 'animate-spin' : ''} />
                <span className="tabular-nums">{timeLeft > 0 ? (Math.floor(timeLeft/60)+":"+(timeLeft%60).toString().padStart(2,'0')) : '00:00'}</span>
              </button>
              {showTimerMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-2xl z-[200] w-64 animate-in zoom-in-95">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button onClick={()=>{setTimeLeft(7200); setEndTime(Date.now() + 7200000); setIsTimerActive(true); setShowTimerMenu(false)}} className="p-2 bg-slate-50 hover:bg-emerald-50 rounded-xl text-[10px] font-black uppercase">2H Focus</button>
                    <button onClick={()=>{setTimeLeft(3600); setEndTime(Date.now() + 3600000); setIsTimerActive(true); setShowTimerMenu(false)}} className="p-2 bg-slate-50 hover:bg-emerald-50 rounded-xl text-[10px] font-black uppercase">1H Plan</button>
                  </div>
                  
                  {/* Temporizador Personalizado */}
                  <div className="pt-2 border-t border-slate-100 flex gap-2 items-center">
                    <input 
                      type="number" 
                      placeholder="Min..." 
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-black outline-none focus:border-emerald-300"
                      value={customMinutes}
                      onChange={e => setCustomMinutes(e.target.value)}
                    />
                    <button 
                      onClick={() => {
                        const mins = parseInt(customMinutes);
                        if(mins > 0) {
                          const ms = mins * 60 * 1000;
                          setTimeLeft(mins * 60);
                          setEndTime(Date.now() + ms);
                          setIsTimerActive(true);
                          setShowTimerMenu(false);
                          setCustomMinutes("");
                        }
                      }}
                      className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-[10px] font-black"
                    >
                      SET
                    </button>
                  </div>

                  <button onClick={()=>{setTimeLeft(0); setEndTime(null); setIsTimerActive(false); setShowTimerMenu(false)}} className="w-full p-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest mt-2">Reset Timer</button>
                </div>
              )}
            </div>

            <button onClick={() => setIsToolsExpanded(!isToolsExpanded)} className={`p-2 rounded-xl transition-all ${isToolsExpanded ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
              <Icon name="ChevronDown" size={24} className={isToolsExpanded ? 'rotate-180' : ''} />
            </button>
          </div>
        </div>

        {isToolsExpanded && (
          <div className="max-w-5xl mx-auto pt-4 border-t border-slate-100 mt-4 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-5 gap-2 mb-4">
              <HeaderToolBtn active={activeTab==='badges'} icon="Award" label="LOGROS" color="amber" onClick={()=>setActiveTab('badges')} />
              <HeaderToolBtn active={activeTab==='flashcards'} icon="Library" label="CARDS" color="rose" onClick={()=>setActiveTab('flashcards')} />
              <HeaderToolBtn active={activeTab==='notes'} icon="StickyNote" label="NOTAS" color="yellow" onClick={()=>setActiveTab('notes')} />
              <HeaderToolBtn active={activeTab==='todo'} icon="ListTodo" label="TAREAS" color="orange" onClick={()=>setActiveTab('todo')} />
              <HeaderToolBtn active={activeTab==='stats'} icon="BarChart3" label="STATS" color="violet" onClick={()=>setActiveTab('stats')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex bg-orange-50 rounded-2xl border border-orange-100 shadow-sm transition-all hover:bg-orange-100 overflow-hidden">
                <div className="flex-1 flex flex-col items-center justify-center p-2 border-r border-orange-200">
                  <Icon name="Flame" size={20} className="fill-orange-500 text-orange-500" />
                  <p className="text-xs font-black text-orange-700 mt-1">{streak} Días</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center p-2">
                  <span className="text-lg leading-none">👑</span>
                  <p className="text-xs font-black text-amber-600 mt-1">{perfectWeeks} Semanas</p>
                </div>
              </div>
              <button 
                onClick={() => { 
                  const drawn = []; 
                  const pool = Array.from({length:69}, (_,i)=>i+1); 
                  for(let i=0; i<4; i++) drawn.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]); 
                  setLuckyNumbers(drawn.sort((a,b)=>a-b)); 
                }} 
                className="flex items-center justify-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 shadow-sm active:scale-95 transition-all hover:bg-amber-100"
              >
                <Icon name="Dices" size={20} />
                <div className="flex gap-1">
                  {luckyNumbers.map((n,i)=><span key={i} className="text-xs font-black w-6 h-6 bg-white border border-amber-200 rounded flex items-center justify-center">{n||'?'}</span>)}
                </div>
              </button>
            </div>

            {/* Misiones Semanales UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-slate-50 rounded-3xl border border-slate-100">
               <div className="space-y-2">
                 <div className="flex justify-between items-center"><span className="text-xs font-black uppercase text-slate-700">Misión 1: 500 Puntos</span><span className="text-[10px] font-bold text-slate-400">{weeklyData.points}/500</span></div>
                 <div className="h-2 bg-slate-200 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 transition-all duration-500" style={{width: `${Math.min(100, (weeklyData.points/500)*100)}%`}}></div></div>
                 {weeklyData.points >= 500 && !weeklyData.claimed1 && <button onClick={()=>claimMission(1)} className="w-full py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase shadow-md active:scale-95 transition-all">Reclamar +50 Pts</button>}
                 {weeklyData.claimed1 && <div className="text-center text-[10px] font-black text-emerald-600 uppercase">¡Completada!</div>}
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between items-center"><span className="text-xs font-black uppercase text-slate-700">Misión 2: Constancia</span><span className="text-[10px] font-bold text-slate-400">{weeklyData.dailyChallengesDone}/5 Retos</span></div>
                 <div className="flex gap-2 justify-between mt-1">
                    <span className={`text-[9px] font-black uppercase ${weeklyData.topicsTouched ? 'text-emerald-600' : 'text-slate-400'}`}>Temas {weeklyData.topicsTouched ? '✓' : ''}</span>
                    <span className={`text-[9px] font-black uppercase ${weeklyData.progTouched ? 'text-emerald-600' : 'text-slate-400'}`}>Prog {weeklyData.progTouched ? '✓' : ''}</span>
                    <span className={`text-[9px] font-black uppercase ${weeklyData.practicoTouched ? 'text-emerald-600' : 'text-slate-400'}`}>Práctico {weeklyData.practicoTouched ? '✓' : ''}</span>
                 </div>
                 {weeklyData.topicsTouched && weeklyData.progTouched && weeklyData.practicoTouched && weeklyData.dailyChallengesDone >= 5 && !weeklyData.claimed2 && <button onClick={()=>claimMission(2)} className="w-full py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-black uppercase shadow-md active:scale-95 transition-all">Reclamar +50 Pts</button>}
                 {weeklyData.claimed2 && <div className="text-center text-[10px] font-black text-emerald-600 uppercase">¡Completada!</div>}
               </div>
            </div>

          </div>
        )}
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {activeTab === 'map' && (
          <ProgressMap 
            points={points} 
            level={Math.floor(points/200)+1} 
            xp={points%200} 
            addPoints={addPoints} 
            streak={streak} 
            perfectWeeks={perfectWeeks} 
            onVaultOpen={() => setShowVaultModal(true)} 
          />
        )}
        {activeTab === 'syllabus' && (
          <SyllabusView 
            topics={topics} 
            setTopics={setTopics} 
            addPoints={addPoints} 
            onOpenModal={setSelectedTopicModal} 
            actionLogs={actionLogs} 
            onReset={handleResetTopics} 
            touchWeekly={touchWeekly} 
            examDate={examDate}
            setExamDate={setExamDate}
          />
        )}
        {activeTab === 'planning' && <PlanningHub planning={planning} setPlanning={setPlanning} units={units} setUnits={setUnits} addPoints={addPoints} submissionDate={submissionDate} setSubmissionDate={setSubmissionDate} actionLogs={actionLogs} onOpenModal={setSelectedTopicModal} onReset={handleResetPlanning} touchWeekly={touchWeekly} />}
        {activeTab === 'practico' && <PracticoView skills={skills} setSkills={setSkills} addPoints={addPoints} sessions={practicoSessions} setSessions={setPracticoSessions} onReset={handleResetPractico} touchWeekly={touchWeekly} />}
        {activeTab === 'flashcards' && !activeDeckId && !examDeck && <FlashcardsManager decks={decks} setDecks={setDecks} onSelect={setActiveDeckId} onExam={setExamDeck} />}
        {activeTab === 'flashcards' && (activeDeckId || examDeck) && <DeckStudyView deck={examDeck || decks.find(d=>d.id.toString()===activeDeckId)} onBack={()=>{setActiveDeckId(null); setExamDeck(null);}} addPoints={addPoints} onUpdateCard={handleUpdateCard} onFinishChallenge={handleChallengeFinish} />}
        {activeTab === 'todo' && <TodoView todos={todos} setTodos={setTodos} addPoints={addPoints} />}
        {activeTab === 'notes' && <NotesView notes={notes} setNotes={setNotes} />}
        {activeTab === 'badges' && <BadgesView points={points} streak={streak} maxStreak={maxStreak} topics={topics} planning={planning} units={units} skills={skills} perfectWeeks={perfectWeeks} totalDailyChallenges={totalDailyChallenges} />}
        {activeTab === 'stats' && <StatsView actionLogs={actionLogs} undoAction={undoAction} topics={topics} planning={planning} units={units} levelDates={levelDates} />}
      </main>

      {/* NAV FOOTER FIXED */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t-2 border-slate-100 p-4 pb-8 z-50 shadow-lg">
        <div className="max-w-md mx-auto flex justify-around">
          <NavBtn active={activeTab==='map'} icon="MapIcon" label="MAPA" color="emerald" onClick={()=>setActiveTab('map')} />
          <NavBtn active={activeTab==='syllabus'} icon="BookOpen" label="TEMAS" color="amber" onClick={()=>setActiveTab('syllabus')} />
          <NavBtn active={activeTab==='planning'} icon="FileText" label="PROG" color="teal" onClick={()=>setActiveTab('planning')} />
          <NavBtn active={activeTab==='practico'} icon="Target" label="PRACT" color="indigo" onClick={()=>setActiveTab('practico')} />
        </div>
      </nav>
    </div>
  );
}

// ==========================================
// 5. COMPONENTES DE VISTA (COMPLETOS)
// ==========================================

function ProgressMap({ points, level, xp, addPoints, streak, perfectWeeks, onVaultOpen }) {
  const [ptsMenu, setPtsMenu] = useState('closed');

  return (
    <div className="space-y-8 max-w-xl mx-auto py-8 text-center animate-in fade-in">
      <div className="grid grid-cols-2 gap-4">
        
        {/* CARD 1: NIVEL Y XP */}
        <div className="relative">
          <div onClick={() => setPtsMenu(ptsMenu === 'closed' ? 'main' : 'closed')} className="bento-card p-6 border-emerald-100 shadow-md cursor-pointer h-full flex flex-col items-center justify-center hover:border-emerald-300">
            <div className="flex justify-between items-end w-full mb-1">
              <span className="text-sm font-black text-emerald-600 uppercase">Lvl {level}</span>
              <span className="text-[10px] font-black text-emerald-500 tabular-nums">{xp || 0}/200</span>
            </div>
            <div className="w-full h-3 bg-slate-50 rounded-full overflow-hidden border shadow-inner">
              <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-lg" style={{width:`${((xp||0)/200)*100}%`}}/>
            </div>
          </div>
          
          {ptsMenu !== 'closed' && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-emerald-100 rounded-2xl p-3 shadow-2xl z-50 flex flex-col gap-2 animate-in zoom-in-95">
              {ptsMenu === 'main' && (
                <div className="flex gap-2">
                  <button onClick={(e) => { e.stopPropagation(); setPtsMenu('add'); }} className="flex-1 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-black hover:bg-emerald-100 transition-colors"><Icon name="Plus" size={20} className="mx-auto" /></button>
                  <button onClick={(e) => { e.stopPropagation(); setPtsMenu('sub'); }} className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl font-black hover:bg-red-100 transition-colors"><Icon name="Minus" size={20} className="mx-auto" /></button>
                </div>
              )}
              {ptsMenu === 'add' && (
                <div className="grid grid-cols-2 gap-2">
                  {[5, 10, 15, 25].map(v => (
                    <button key={v} onClick={(e) => { e.stopPropagation(); addPoints(v, `+${v} Pts (Manual)`); setPtsMenu('closed'); }} className="p-2 bg-emerald-500 text-white rounded-xl font-black text-xs hover:bg-emerald-600 transition-colors">+{v}</button>
                  ))}
                  <button onClick={(e) => { e.stopPropagation(); setPtsMenu('main'); }} className="col-span-2 p-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-colors">Volver</button>
                </div>
              )}
              {ptsMenu === 'sub' && (
                <div className="grid grid-cols-2 gap-2">
                  {[5, 10, 15, 25].map(v => (
                    <button key={v} onClick={(e) => { e.stopPropagation(); addPoints(-v, `-${v} Pts (Manual)`); setPtsMenu('closed'); }} className="p-2 bg-red-500 text-white rounded-xl font-black text-xs hover:bg-red-600 transition-colors">-{v}</button>
                  ))}
                  <button onClick={(e) => { e.stopPropagation(); setPtsMenu('main'); }} className="col-span-2 p-2 bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase hover:bg-slate-200 transition-colors">Volver</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CARD 2: RACHA Y SEMANAS */}
        <div className="bento-card p-4 border-orange-100 shadow-md flex items-center justify-between">
           <div className="flex-1 flex flex-col items-center border-r border-slate-100">
              <Icon name="Flame" size={24} className="fill-orange-500 text-orange-500" />
              <p className="text-lg font-black text-slate-800 leading-none mt-1">{streak}</p>
              <p className="text-[7px] font-black uppercase text-slate-400">Days</p>
           </div>
           <div className="flex-1 flex flex-col items-center">
              <span className="text-2xl leading-none">👑</span>
              <p className="text-lg font-black text-amber-600 leading-none mt-1">{perfectWeeks}</p>
              <p className="text-[7px] font-black uppercase text-slate-400">Weeks</p>
           </div>
        </div>
      </div>

      {/* WIDGET: FROM THE VAULT (REDUCIDO) */}
      <div className="flex justify-center">
        <button 
          onClick={onVaultOpen}
          className="vault-pill py-2 px-5 rounded-full flex items-center gap-2 shadow-lg active:scale-95 transition-all border border-slate-700/50"
        >
          <span className="text-sm">🗝️</span>
          <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80">Vault</span>
        </button>
      </div>

      {/* MAPA DE NIVELES */}
      <div className="flex flex-col items-center gap-16 relative mt-12">
        <div className="absolute top-0 bottom-0 w-2 bg-emerald-50 rounded-full -z-10" />
        {[level+1, level, level-1, level-2].filter(l=>l>0).map(l => (
          <div key={l} className={`w-20 h-20 rounded-full border-4 flex flex-col items-center justify-center transition-all relative ${l === level ? 'bg-white border-emerald-500 scale-125 shadow-xl ring-8 ring-emerald-50' : 'bg-slate-50 border-slate-200 text-slate-300 opacity-60'}`}>
            <span className="text-2xl font-black tabular-nums">{l}</span>
            {l === level && <Icon name="Turtle" size={24} className="absolute -top-8 text-emerald-600 animate-bounce" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function SyllabusView({ topics, setTopics, addPoints, onOpenModal, actionLogs, onReset, touchWeekly, examDate, setExamDate }) {
  const [search, setSearch] = useState("");
  const [showDate, setShowDate] = useState(false);

  const diff = new Date(examDate) - new Date();
  const days = Math.ceil(diff / 864e5);
  
  const updateField = (id, field, value, pts) => {
    touchWeekly('topics');
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        if (pts && value !== undefined) addPoints(pts, `Topic ${id}: ${field}`, { entity: 'topic', id, field, prevValue: t[field] });
        let updated = { ...t, [field]: value };
        if (field === 'finished' && value === true) updated.discarded = false;
        if (field === 'discarded' && value === true) updated.finished = false;
        return updated;
      }
      return t;
    }));
  };

  const cyclePriority = (id, current) => {
    const next = current === null ? 1 : current === 4 ? null : current + 1;
    addPoints(0, `Topic ${id}: Priority`, { entity: 'topic', id, field: 'priority', prevValue: current });
    setTopics(prev => prev.map(t => t.id === id ? { ...t, priority: next } : t));
  };

  const getPriorityColor = (topic) => {
    if (topic.priority === 1) return 'bg-emerald-500';
    if (topic.priority === 2) return 'bg-amber-500';
    if (topic.priority === 3) return 'bg-red-500';
    if (topic.priority === 4) return 'bg-slate-500'; 
    const logs = actionLogs.filter(l => l.actionData && l.actionData.entity === 'topic' && String(l.actionData.id) === String(topic.id)).sort((a,b) => b.timestamp - a.timestamp);
    if (logs.length === 0) return 'bg-slate-200/50';
    const diff = (Date.now() - logs[0].timestamp) / 864e5;
    return diff < 7 ? 'bg-emerald-500/40' : diff < 15 ? 'bg-amber-500/40' : 'bg-red-500/40';
  };

  const displayList = topics.filter(t => (t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toString().includes(search))).sort((a, b) => {
    if (a.discarded !== b.discarded) return a.discarded ? 1 : -1;
    return a.id - b.id;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* HEADER TEMAS CON COUNTDOWN SWIFTIE */}
      <div className="bg-white/50 backdrop-blur p-6 rounded-3xl border border-white/50 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-start">
           <div className="flex items-center gap-3"><Icon name="BookOpen" className="text-amber-600" /><h2 className="text-2xl font-black text-slate-950">Temas</h2></div>
           <div className="text-right cursor-pointer relative" onClick={() => setShowDate(!showDate)}>
              <p className="text-3xl font-black text-slate-800 tabular-nums leading-none">{days}</p>
              {/* --- SWIFTIE REFERENCE START --- */}
              <p className="text-[8px] font-black uppercase text-amber-600 tracking-widest mt-1">Days to End Game 🖤</p>
              {/* --- SWIFTIE REFERENCE END --- */}
              {showDate && <input type="date" value={examDate} onChange={e=>{setExamDate(e.target.value); setShowDate(false);}} className="absolute top-0 right-0 bg-white shadow-xl rounded-lg p-2 text-xs border z-50" />}
           </div>
        </div>
        <div className="flex items-center gap-3 w-full">
          <div className="relative flex-1"><Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input placeholder="Buscar temas..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-2 text-sm font-black outline-none focus:border-emerald-200 transition-all" /></div>
          <button onClick={onReset} className="px-3 py-2 bg-red-50 text-red-600 font-black text-[10px] rounded-xl hover:bg-red-100 transition-all shrink-0 uppercase tracking-widest">Reset</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayList.map(t => {
          const blk = getTopicBlock(t.id);
          const shortTitle = t.title.split('.')[0];
          let cardStyle = t.discarded ? "!bg-slate-200 opacity-60 grayscale scale-95 shadow-inner" : t.finished ? `${blk.color} !border-transparent ring-4 ring-offset-2 ${blk.color.replace('!bg-','ring-')} shadow-2xl scale-[1.02]` : "bg-white border-slate-100 shadow-sm";
          let textStyle = t.finished ? "!text-white" : "text-slate-900";
          let badgeStyle = t.finished ? "!bg-white/20 !border-transparent !text-white shadow-sm" : blk.badge;
          
          return (
            <div key={t.id} className={`bento-card p-5 border-2 transition-all duration-300 relative overflow-hidden ${cardStyle}`}>
              <div onClick={() => cyclePriority(t.id, t.priority)} className={`absolute left-0 top-0 bottom-0 w-2.5 ${getPriorityColor(t)} cursor-pointer transition-all hover:w-4 z-10`} />
              
              <div className="flex items-center justify-between mb-4 pl-4">
                <div className="flex items-center gap-4">
                  <div onClick={() => onOpenModal(t)} className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg border-2 cursor-pointer active:scale-90 transition-transform ${badgeStyle}`}>{t.id}</div>
                  <div className="text-left leading-tight flex-1">
                    <p className={`text-[10px] font-black uppercase opacity-60 tracking-widest mb-0.5`}>{getTopicBlock(t.id).name}</p>
                    <div className="flex"><EditableText value={shortTitle} onSave={(nv) => { const rest = t.title.includes('.') ? t.title.substring(t.title.indexOf('.')) : ''; setTopics(prev => prev.map(x => x.id === t.id ? { ...x, title: nv + rest } : x)); }} className={`text-sm font-black line-clamp-1 ${textStyle} flex-1`} /></div>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={()=>updateField(t.id,'finished',!t.finished, 0)} className={`p-2 rounded-xl transition-all active:scale-90 ${t.finished ? '!text-slate-900 !bg-white shadow-md' : 'text-slate-300 bg-slate-50 hover:bg-slate-100'}`}><Icon name="Lock" size={16}/></button>
                  <button onClick={()=>updateField(t.id,'discarded',!t.discarded, 0)} className={`p-2 rounded-xl transition-all active:scale-90 ${t.discarded ? '!text-slate-600 !bg-slate-300 shadow-inner' : (t.finished ? '!text-white !bg-black/20' : 'text-slate-300 bg-slate-50 hover:bg-slate-100')}`}><Icon name="Archive" size={16}/></button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4 pl-4">
                <button onClick={() => updateField(t.id, 'redactado', !t.redactado, t.redactado ? -15 : 15)} className={`py-2.5 rounded-2xl text-[10px] font-black border-2 transition-all active:scale-95 ${t.redactado ? (t.finished ? '!bg-white !text-slate-900 !border-transparent' : 'bg-emerald-500 text-white border-transparent shadow-md') : (t.finished ? '!bg-black/20 !text-white !border-transparent' : 'bg-white text-slate-400 border-slate-50')}`}>
                  WRITTEN
                </button>
                <button onClick={() => { const next = (t.estudiado + 1) % 4; updateField(t.id, 'estudiado', next, next === 0 ? -75 : 25); }} className={`py-2.5 rounded-2xl text-[10px] font-black border-2 transition-all relative overflow-hidden active:scale-95 ${t.estudiado > 0 ? (t.finished ? '!bg-white !text-slate-900 !border-transparent' : 'bg-orange-500 text-white border-transparent shadow-md') : (t.finished ? '!bg-black/20 !text-white !border-transparent' : 'bg-white text-slate-400 border-slate-50')}`}>
                  {t.estudiado > 0 && t.estudiado < 3 && !t.finished && <div className="absolute left-0 top-0 bottom-0 bg-white/20 transition-all" style={{ width: `${(t.estudiado/3)*100}%` }} />}
                  <span className="relative z-10 uppercase">Studied {t.estudiado > 0 ? `(${t.estudiado}/3)` : ''}</span>
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 pl-4">
                <CounterPill label="REVIEWS" count={t.reviews} onAdd={()=>updateField(t.id,'reviews',Number(t.reviews||0)+1,10)} onSub={()=>updateField(t.id,'reviews',Math.max(0,Number(t.reviews||0)-1),-10)} />
                <CounterPill label="MOCKS" count={t.mocks} onAdd={()=>updateField(t.id,'mocks',Number(t.mocks||0)+1,40)} onSub={()=>updateField(t.id,'mocks',Math.max(0,Number(t.mocks||0)-1),-40)} />
                <CounterPill label="MINI" count={t.miniMocks} onAdd={()=>updateField(t.id,'miniMocks',Number(t.miniMocks||0)+1,20)} onSub={()=>updateField(t.id,'miniMocks',Math.max(0,Number(t.miniMocks||0)-1),-20)} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CounterPill({ label, count, onAdd, onSub }) {
  const [open, setOpen] = useState(false);
  
  useEffect(() => {
    let timer;
    if (open) {
      timer = setTimeout(() => setOpen(false), 3000);
    }
    return () => clearTimeout(timer);
  }, [open, count]);

  return (
    <div 
      className={`flex flex-col items-center p-2 rounded-2xl border-2 transition-all cursor-pointer relative h-12 justify-center bg-slate-50 hover:border-emerald-100 shadow-inner`} 
      onClick={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <p className="text-[7px] font-black text-slate-400 uppercase mb-1 leading-none">{label}</p>
      <div className="flex items-center justify-center w-full relative">
        {open && (<button onClick={(e)=>{e.stopPropagation(); onSub(); setOpen(true);}} className={`absolute left-0 w-7 h-7 bg-white shadow-sm rounded-lg flex items-center justify-center text-[10px] active:scale-90`}><Icon name="Minus" size={12} /></button>)}
        <span className="text-sm font-black text-slate-700 tabular-nums">{count || 0}</span>
        {open && (<button onClick={(e)=>{e.stopPropagation(); onAdd(); setOpen(true);}} className={`absolute right-0 w-7 h-7 bg-white shadow-sm rounded-lg flex items-center justify-center text-[10px] active:scale-90`}><Icon name="Plus" size={12} /></button>)}
      </div>
    </div>
  );
}

function PlanningHub({ planning, setPlanning, units, setUnits, addPoints, submissionDate, setSubmissionDate, actionLogs, onOpenModal, onReset, touchWeekly }) {
  const diff = new Date(submissionDate) - new Date();
  const days = Math.ceil(diff / 864e5);
  const [showSubDate, setShowSubDate] = useState(false);
  const [newPlan, setNewPlan] = useState("");

  const upd = (id, list, setter, field, nv, pts = 0) => {
    touchWeekly('prog');
    setter(list.map(i => { 
      if(i.id===id){ 
        if (i[field] === nv) return i;
        addPoints(pts, i.title, { entity: id.toString().startsWith('ud') ? 'unit' : 'planning', id: i.id, field, prevValue: i[field] }); 
        return {...i, [field]: nv}; 
      } 
      return i; 
    }));
  };

  const cyclePriority = (id, current, isUnit) => {
    const next = current === null ? 1 : current === 4 ? null : current + 1;
    const entity = isUnit ? 'unit' : 'planning';
    addPoints(0, `Prioridad`, { entity, id, field: 'priority', prevValue: current });
    (isUnit ? setUnits : setPlanning)(prev => prev.map(t => t.id === id ? { ...t, priority: next } : t));
  };

  const getPriorityColor = (item, isUnit) => {
    if (item.priority === 1) return 'bg-emerald-500';
    if (item.priority === 2) return 'bg-amber-500';
    if (item.priority === 3) return 'bg-red-500';
    if (item.priority === 4) return 'bg-slate-500'; 
    const entity = isUnit ? 'unit' : 'planning';
    const logs = actionLogs.filter(l => l.actionData && l.actionData.entity === entity && String(l.actionData.id) === String(item.id)).sort((a,b) => b.timestamp - a.timestamp);
    if (logs.length === 0) return 'bg-slate-200/50';
    const d = (Date.now() - logs[0].timestamp) / 864e5;
    return d < 7 ? 'bg-emerald-500/40' : d < 15 ? 'bg-amber-500/40' : 'bg-red-500/40';
  };

  return (
    <div className="space-y-8 text-left animate-in slide-in-from-right-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur p-4 rounded-3xl border border-white/50 shadow-sm">
        <div className="flex items-center gap-3"><Icon name="FileText" className="text-teal-600" /><h2 className="text-2xl font-black text-slate-950">Programación</h2></div>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border-2 border-blue-50 shadow-sm cursor-pointer relative" onClick={() => setShowSubDate(!showSubDate)}>
            <Icon name="Calendar" size={16} className="text-blue-500" />
            <span className="text-xl font-black text-blue-600 tabular-nums leading-none">{days}</span>
            <span className="text-[10px] font-black uppercase text-slate-400">Días</span>
            {showSubDate && <input type="date" value={submissionDate} onChange={e=>{setSubmissionDate(e.target.value); setShowSubDate(false);}} onClick={e=>e.stopPropagation()} className="absolute top-full right-0 mt-2 bg-white text-blue-900 rounded-xl p-2 text-xs font-black outline-none shadow-xl z-50 border-2 border-blue-100" />}
          </div>
          <button onClick={onReset} className="px-3 py-2 bg-red-50 text-red-600 font-black text-[10px] rounded-xl hover:bg-red-100 transition-all shrink-0 uppercase tracking-widest">Reset</button>
        </div>
      </div>

      <div className="bento-card p-6 border-blue-100 shadow-sm flex flex-col justify-center">
         <form onSubmit={e => { e.preventDefault(); if(newPlan.trim()){ setPlanning([...planning, {id: 'p'+(planning.length+1), title: newPlan.trim(), status: 0, indexNotes: "", priority: null, leg: "LOMLOE"}]); setNewPlan(""); } }} className="flex gap-2">
            <input placeholder="Añadir nueva sección a la programación..." value={newPlan} onChange={e=>setNewPlan(e.target.value)} className="flex-1 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-sm font-black outline-none focus:border-blue-200 shadow-sm" />
            <button type="submit" className="bg-blue-600 text-white p-3 rounded-xl shadow-md active:scale-95 transition-transform"><Icon name="Plus" size={20}/></button>
          </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...planning, ...units].map(item => {
          const isU = item.id.toString().startsWith('ud');
          return (
            <div key={item.id} className={`bento-card bg-white p-5 border-2 ${isU ? 'border-teal-100 hover:border-teal-300' : 'border-blue-100 hover:border-blue-300'} transition-all relative overflow-hidden`}>
              <div onClick={() => cyclePriority(item.id, item.priority, isU)} className={`absolute left-0 top-0 bottom-0 w-2.5 ${getPriorityColor(item, isU)} cursor-pointer transition-all hover:w-4 z-10`} />
              
              <div className="flex justify-between items-center mb-4 pl-3">
                <div className="flex items-center gap-4 flex-1">
                  <div onClick={() => onOpenModal(item)} className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border-2 cursor-pointer shadow-sm active:scale-90 transition-transform shrink-0 ${isU ? 'bg-teal-50 text-teal-600 border-teal-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{isU ? item.id.replace('ud','') : item.id.replace('p','')}</div>
                  <EditableText value={item.title} onSave={nv => upd(item.id, isU?units:planning, isU?setUnits:setPlanning, 'title', nv)} className="text-sm font-black text-slate-900 flex-1 leading-tight" />
                </div>
                <button onClick={(e)=>{e.stopPropagation(); if(window.confirm("¿Eliminar sección?")) (isU?setUnits:setPlanning)(p=>p.filter(x=>x.id!==item.id))}} className="text-slate-200 hover:text-red-500 p-2 transition-colors"><Icon name="Trash2" size={16}/></button>
              </div>

              <div className="pl-3">
                <button onClick={()=>{const ns = (item.status===10) ? 0 : item.status+1; upd(item.id, isU?units:planning, isU?setUnits:setPlanning, 'status', ns, ns===0 ? -(item.status*15) : 15);}} className={`w-full py-2 px-3 rounded-xl text-[10px] font-black border-2 transition-all relative overflow-hidden text-center active:scale-95 ${item.status > 0 ? (item.status===10 ? (isU ? 'bg-emerald-500 text-white border-transparent shadow-md' : 'bg-emerald-500 text-white border-transparent shadow-md') : (item.status <= 3 ? 'bg-amber-50 text-amber-700 border-amber-200' : item.status <= 6 ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200')) : 'bg-white text-slate-400 border-slate-100 shadow-sm'}`}>
                  {item.status > 0 && item.status < 10 && <div className={`absolute left-0 top-0 bottom-0 opacity-20 transition-all duration-500 ${item.status <= 3 ? 'bg-amber-500' : item.status <= 6 ? 'bg-blue-500' : 'bg-purple-500'}`} style={{ width: `${((item.status % 3 || 3)/3)*100}%` }} />}
                  <span className="relative z-10">{getPlanningStatusLabel(item.status)}</span>
                </button>
                <div className="flex gap-1 h-1.5 mt-2 bg-slate-50 rounded-full p-0.5 border border-slate-100">
                  {Array.from({length:10}).map((_,i)=><div key={i} className={`flex-1 rounded-full transition-all duration-500 ${i<item.status ? (item.status <= 3 ? 'bg-amber-400' : item.status <= 6 ? 'bg-blue-400' : item.status < 10 ? 'bg-purple-400' : 'bg-emerald-500') : 'bg-transparent'}`} />)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PracticoView({ skills, setSkills, addPoints, sessions, setSessions, onReset, touchWeekly }) {
  const [newSkill, setNewSkill] = useState("");
  return (
    <div className="space-y-6 animate-in slide-in-from-left-4 text-left">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white/50 backdrop-blur p-4 rounded-3xl border border-white/50 shadow-sm">
        <div className="flex items-center gap-3"><Icon name="Target" className="text-indigo-600" /><h2 className="text-2xl font-black text-slate-950">Práctico</h2></div>
        <button onClick={onReset} className="px-3 py-2 bg-red-50 text-red-600 font-black text-[10px] rounded-xl hover:bg-red-100 transition-all shrink-0 uppercase tracking-widest">Reset</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card bg-white p-6 space-y-6 border-indigo-50 shadow-md">
          <form onSubmit={e => { e.preventDefault(); if(newSkill.trim()){setSkills([...skills,{id:Date.now().toString(),label:newSkill.trim(),level:0}]); setNewSkill("");} }} className="flex gap-2 mb-4"><input placeholder="New skill..." value={newSkill} onChange={e=>setNewSkill(e.target.value)} className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-xs font-black outline-none border-2 border-transparent focus:border-indigo-200" /><button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl shadow-md active:scale-95 transition-transform"><Icon name="Plus" size={18}/></button></form>
          {skills.length === 0 && <p className="text-xs text-slate-400 font-bold italic text-center py-4">No skills registered yet.</p>}
          {skills.map(s => (
            <div key={s.id} className="space-y-2 text-left mb-4">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500"><EditableText value={s.label} onSave={(nv)=>{touchWeekly('practico'); setSkills(skills.map(x=>x.id===s.id?{...x,label:nv}:x));}} className="flex-1 mr-2 leading-tight" /><div className="flex gap-1 shrink-0"><button onClick={()=>{touchWeekly('practico'); if(s.level>0){setSkills(skills.map(ps=>ps.id===s.id?{...ps,level:ps.level-1}:ps)); addPoints(-25,"Skill Adjustment",{entity:'skill',id:s.id,prevValue:s.level});}}} className="w-6 h-6 bg-slate-50 text-slate-400 rounded-lg shadow-sm hover:bg-slate-100 transition-colors font-black flex items-center justify-center active:scale-90">-</button><button onClick={()=>{touchWeekly('practico'); if(s.level<10){setSkills(skills.map(ps=>ps.id===s.id?{...ps,level:ps.level+1}:ps)); addPoints(25,s.label,{entity:'skill',id:s.id,prevValue:s.level});}}} className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-100 transition-colors font-black flex items-center justify-center active:scale-90">+</button></div></div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200"><div className="h-full bg-indigo-500 transition-all duration-700 shadow-sm" style={{width:`${s.level*10}%`}} /></div>
            </div>
          ))}
        </div>
        <div className="bento-card bg-white p-8 text-center flex flex-col justify-center items-center gap-4 border-indigo-100 shadow-md">
          <p className="text-6xl font-black text-indigo-600 tabular-nums leading-none tracking-tighter">{sessions || 0}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Cases Completed</p>
          <div className="flex gap-2 w-full mt-2">
            <button onClick={()=>{touchWeekly('practico'); if(sessions>0){setSessions(s=>s-1); addPoints(-25,"Case adjustment",{entity:'practico_sessions',prevValue:sessions});}}} className="w-16 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black active:scale-95 transition-all hover:bg-slate-200">-</button>
            <button onClick={()=>{touchWeekly('practico'); setSessions(s=>(s||0)+1); addPoints(25,"Case Completed",{entity:'practico_sessions',prevValue:sessions});}} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all hover:bg-indigo-700">RECORD (+25 PTS)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function NoteItem({ n, notes, setNotes }) {
  const [isEditing, setIsEditing] = useState(false);
  const [temp, setTemp] = useState(n.text);
  
  return (
    <div style={{transform:`rotate(${n.rot}deg)`}} className={`relative p-5 aspect-square rounded shadow-lg border-t-[8px] ${n.color.bg} ${n.color.border} transition-all hover:scale-105 shadow-yellow-100`}>
      <Icon name="Pin" size={16} className={`absolute top-2 left-1/2 -translate-x-1/2 opacity-20 ${n.color.pin}`} />
      
      <button onClick={() => setIsEditing(!isEditing)} className={`absolute top-2 right-2 text-slate-400 hover:text-emerald-600 transition-colors ${isEditing ? 'text-emerald-600' : ''}`}>
        <Icon name={isEditing ? "Check" : "Edit"} size={14} />
      </button>

      <div className="pt-2 h-full">
        {isEditing ? (
          <textarea autoFocus value={temp} onChange={e=>setTemp(e.target.value)} onBlur={() => { if(temp.trim()) setNotes(notes.map(x=>x.id===n.id?{...x,text:temp}:x)); setIsEditing(false); }} className={`w-full h-full bg-transparent resize-none outline-none text-[11px] font-black ${n.color.text} custom-scrollbar`} />
        ) : (
          <p className={`text-[11px] font-black h-full ${n.color.text} text-left overflow-y-auto custom-scrollbar`}>{n.text}</p>
        )}
      </div>
      
      <button onClick={()=>setNotes(notes.filter(x=>x.id!==n.id))} className="absolute bottom-2 right-2 text-slate-400 hover:text-red-500 transition-colors">
        <Icon name="Trash2" size={14}/>
      </button>
    </div>
  );
}

function NotesView({ notes, setNotes }) {
  const [txt, setTxt] = useState("");
  const [selColor, setSelColor] = useState({ id: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-yellow-900', pin: 'text-yellow-600' });
  const NOTE_COLORS = [
    { id: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-yellow-900', pin: 'text-yellow-600' },
    { id: 'blue', bg: 'bg-blue-200', border: 'border-blue-300', text: 'text-blue-900', pin: 'text-blue-600' },
    { id: 'green', bg: 'bg-green-200', border: 'border-green-300', text: 'text-green-900', pin: 'text-green-600' },
    { id: 'pink', bg: 'bg-pink-200', border: 'border-pink-300', text: 'text-pink-900', pin: 'text-pink-600' },
    { id: 'purple', bg: 'bg-purple-200', border: 'border-purple-300', text: 'text-purple-900', pin: 'text-purple-600' },
  ];
  return (
    <div className="space-y-6 text-left">
      <div className="bento-card bg-white p-6 border-yellow-100 shadow-xl shadow-yellow-50">
        <textarea placeholder="Sticky idea..." value={txt} onChange={e=>setTxt(e.target.value)} className="w-full h-24 bg-transparent border-none font-bold outline-none resize-none text-slate-800" />
        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
          <div className="flex gap-2">{NOTE_COLORS.map(c=>(<button key={c.id} onClick={()=>setSelColor(c)} className={`w-6 h-6 rounded-full border-2 transition-all ${c.bg} ${selColor.id===c.id ? 'border-slate-800 scale-125 shadow-md':'border-white hover:border-slate-200'}`} />))}</div>
          <button onClick={()=>{if(txt.trim()){setNotes([{id:Date.now().toString(),text:txt,color:selColor,rot:Math.floor(Math.random()*6)-3}, ...notes]); setTxt("");}}} className="px-6 py-2 bg-yellow-500 text-white rounded-xl font-black text-xs shadow-md active:scale-95 transition-transform">PIN IT</button>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
        {notes.map(n => <NoteItem key={n.id} n={n} notes={notes} setNotes={setNotes} />)}
      </div>
    </div>
  );
}

// ==========================================
// COMPONENTES DE FLASHCARDS ACTUALIZADOS
// ==========================================

function FlashcardsManager({ decks, setDecks, onSelect, onExam }) {
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState("");
  const [name, setName] = useState("");
  const [deckCat, setDeckCat] = useState("General");
  const [editingId, setEditingId] = useState(null);

  const [showDailyModal, setShowDailyModal] = useState(false);
  const [dailyCats, setDailyCats] = useState(DECK_CATEGORIES);

  const startExamMode = () => { 
    const allCards = decks.flatMap(d => d.cards.map(c => ({...c, deckName: d.name, deckId: d.id}))); 
    if (allCards.length === 0) return alert("Empty library!"); 
    onExam({ id: 'exam-mode', name: 'TOTAL EXAM', cards: allCards.sort(() => Math.random() - 0.5) }); 
  };

  const startDailyChallenge = () => {
    let dueCards = [];
    const now = Date.now();
    decks.forEach(d => {
      const ctg = d.category || "General";
      if (dailyCats.includes(ctg)) {
        d.cards.forEach(c => {
          if (!c.nextDate || c.nextDate <= now) {
            dueCards.push({...c, deckId: d.id, deckName: d.name});
          }
        });
      }
    });
    if (dueCards.length === 0) return alert("¡No hay tarjetas urgentes en estas categorías hoy!");
    dueCards = dueCards.sort(() => Math.random() - 0.5).slice(0, 50);
    onExam({ id: 'daily-challenge', name: 'DAILY CHALLENGE', isChallenge: true, cards: dueCards });
    setShowDailyModal(false);
  };

  const saveDeck = () => { 
    if(txt.includes(':') && name){ 
      const cards = txt.split('\n').filter(l=>l.includes(':')).map(l=>{
        const [q,a]=l.split(':'); 
        return {q:q.trim(), a:a.trim(), id:Math.random().toString(36), interval: 0, ease: 2.5, nextDate: 0};
      }); 
      if(editingId) setDecks(decks.map(d=>d.id===editingId?{...d, name, category: deckCat, cards}:d)); 
      else setDecks([{id:Date.now().toString(), name, category: deckCat, cards}, ...decks]); 
      setOpen(false); setName(""); setTxt(""); setDeckCat("General"); setEditingId(null); 
    } 
  };

  const loadForEdit = (deck) => { 
    setName(deck.name); 
    setDeckCat(deck.category || "General");
    setTxt(deck.cards.map(c => `${c.q} : ${c.a}`).join('\n')); 
    setEditingId(deck.id); setOpen(true); 
  };

  const exportDecks = () => {
    const json = JSON.stringify(decks);
    navigator.clipboard.writeText(json).then(() => {
      alert("¡Mazos copiados al portapapeles!");
    });
  };

  const importDecks = () => {
    const input = prompt("Pega aquí el código de tus mazos:");
    if (input) {
      try {
        const imported = JSON.parse(input);
        if (Array.isArray(imported)) {
          setDecks(prev => [...prev, ...imported]);
          alert("¡Mazos importados!");
        }
      } catch (e) { alert("Error al importar."); }
    }
  };

  const sortedDecks = useMemo(() => [...decks].sort((a, b) => a.name.localeCompare(b.name)), [decks]);

  return (
    <div className="space-y-6 text-left relative">
      {showDailyModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={()=>setShowDailyModal(false)}>
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95" onClick={e=>e.stopPropagation()}>
            <h3 className="text-xl font-black text-rose-950 mb-4 flex items-center gap-2"><Icon name="Zap" className="text-amber-500"/> Reto Diario SRS</h3>
            
            <div className="flex justify-between items-center mb-4">
               <p className="text-xs font-bold text-slate-500">Selecciona categorías:</p>
               <button 
                onClick={() => setDailyCats(DECK_CATEGORIES)}
                className="text-[10px] font-black text-rose-600 uppercase hover:underline"
               >
                 Seleccionar Todas
               </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {DECK_CATEGORIES.map(c => (
                <button 
                  key={c} 
                  onClick={() => setDailyCats(prev => prev.includes(c) ? prev.filter(x=>x!==c) : [...prev, c])}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${dailyCats.includes(c) ? 'bg-rose-100 text-rose-700 border border-rose-300' : 'bg-slate-100 text-slate-400'}`}
                >
                  {c}
                </button>
              ))}
            </div>
            <button onClick={startDailyChallenge} className="w-full p-4 bg-rose-600 text-white rounded-xl font-black shadow-lg hover:bg-rose-700 active:scale-95 transition-all uppercase">…Ready For It? 🐍</button>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center bg-white/50 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-white/50 gap-4">
        <h2 className="text-2xl font-black text-rose-950">Library</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button onClick={exportDecks} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors shrink-0">Exportar</button>
          <button onClick={importDecks} className="px-3 py-2 bg-slate-100 text-slate-600 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors shrink-0">Importar</button>
          <button onClick={()=>setShowDailyModal(true)} className="px-3 py-2 bg-amber-100 text-amber-700 rounded-xl font-black text-[10px] flex items-center gap-2 border border-amber-200 active:scale-95 transition-all shadow-sm shrink-0"><Icon name="Flame" size={14} className="fill-amber-700"/> RETO DIARIO</button>
          <button onClick={startExamMode} className="px-3 py-2 bg-rose-100 text-rose-700 rounded-xl font-black text-[10px] flex items-center gap-2 border border-rose-200 active:scale-95 transition-all shadow-sm shrink-0"><Icon name="Dices" size={14}/> EXAM MODE</button>
        </div>
      </div>
      
      <button onClick={()=>{setOpen(!open); setEditingId(null); setName(""); setDeckCat("General"); setTxt("");}} className="w-full p-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-100 active:scale-95 transition-all">{editingId ? 'EDITING DECK' : 'NEW DECK'}</button>
      
      {open && (
        <div className="bento-card p-6 border-rose-100 space-y-4 shadow-xl animate-in zoom-in-95 bg-white">
          <div className="flex gap-2">
            <input placeholder="Deck name..." value={name} onChange={e=>setName(e.target.value)} className="flex-1 bg-slate-50 p-3 rounded-xl font-black outline-none border-2 border-transparent focus:border-rose-200 shadow-inner" />
            <select value={deckCat} onChange={e=>setDeckCat(e.target.value)} className="bg-slate-50 p-3 rounded-xl font-black outline-none border-2 border-transparent focus:border-rose-200 text-slate-600 cursor-pointer shadow-inner">
              {DECK_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <textarea placeholder="Question : Answer (One per line)" value={txt} onChange={e=>setTxt(e.target.value)} className="w-full h-32 bg-slate-50 p-3 rounded-xl font-black outline-none resize-none border-2 border-transparent focus:border-rose-200 shadow-inner custom-scrollbar" />
          <button onClick={saveDeck} className="w-full p-3 bg-rose-600 text-white rounded-xl font-black shadow-md uppercase">{editingId ? 'Save Changes' : 'Create Deck'}</button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedDecks.map(d=>(
          <div key={d.id} onClick={()=>onSelect(d.id.toString())} className="bento-card bg-white p-5 flex justify-between items-center cursor-pointer hover:border-rose-300 transition-all shadow-sm group">
            <div>
              <p className="font-black text-left text-slate-800 leading-tight">{d.name}</p>
              <div className="flex gap-2 items-center mt-1">
                <span className="text-[8px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase font-black">{d.category || "General"}</span>
                <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest">{d.cards.length} cards</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={(e)=>{e.stopPropagation(); loadForEdit(d)}} className="text-slate-300 hover:text-emerald-500 p-1"><Icon name="Edit" size={18}/></button>
              <button onClick={(e)=>{e.stopPropagation(); setDecks(decks.filter(x=>x.id.toString()!==d.id.toString()))}} className="text-slate-300 hover:text-red-500 p-1"><Icon name="Trash2" size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeckStudyView({ deck, onBack, addPoints, onUpdateCard, onFinishChallenge }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [challengeStarted, setChallengeStarted] = useState(false);
  
  const isChallenge = deck.isChallenge;
  const [challengeQueue, setChallengeQueue] = useState(isChallenge ? deck.cards : []);

  // Reset de la vuelta al cambiar de tarjeta para evitar el "spoiler" de la respuesta
  useEffect(() => {
    setFlipped(false);
  }, [idx]);

  const cardsToStudy = useMemo(() => {
    if (isChallenge) return challengeQueue;
    if (!isShuffled) return deck.cards;
    return [...deck.cards].sort(() => Math.random() - 0.5);
  }, [deck.cards, isShuffled, challengeQueue, isChallenge]);

  if (isChallenge && !challengeStarted) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-8 animate-in zoom-in-95">
        <div className="w-24 h-24 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto text-4xl">🧣</div>
        <h2 className="text-2xl font-black text-slate-800 leading-tight">Do you have 10 minutes to spare?</h2>
        <button 
          onClick={() => setChallengeStarted(true)} 
          className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all uppercase tracking-widest"
        >
          Yes
        </button>
      </div>
    );
  }

  if (idx >= cardsToStudy.length) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-6 animate-in zoom-in-95">
        <Icon name="Award" size={80} className="mx-auto text-amber-500" />
        <h2 className="text-3xl font-black text-rose-950">You're out of the woods! 🌲</h2>
        <p className="text-sm font-bold text-slate-500">Sesión de repaso completada.</p>
        <button onClick={onFinishChallenge || onBack} className="px-8 py-4 bg-rose-600 text-white rounded-2xl font-black shadow-xl hover:bg-rose-700 active:scale-95 transition-all uppercase">Volver</button>
      </div>
    );
  }

  const card = cardsToStudy[idx];

  const handleAnki = (rating) => {
    if (!onUpdateCard) return;

    // Fix del cuelgue: Aseguramos que deckId sea un string válido
    const targetDeckId = (card.deckId || deck.id)?.toString();
    if (!targetDeckId) {
        console.error("Error: No se pudo encontrar el ID del mazo para esta tarjeta.");
        return;
    }

    let { interval = 0, ease = 2.5 } = card;
    let newInterval = interval;
    let newEase = ease;

    if (rating === 'repeat') {
      newInterval = 0;
    } else if (rating === 'hard') {
      newInterval = Math.max(1, interval * 1.2);
      newEase = Math.max(1.3, ease - 0.15);
    } else if (rating === 'good') {
      newInterval = interval === 0 ? 1 : interval * 2.5;
    } else if (rating === 'easy') {
      newInterval = interval === 0 ? 4 : interval * ease * 1.3;
      newEase += 0.15;
    }

    const newNextDate = rating === 'repeat' ? 0 : Date.now() + (newInterval * 86400000);
    
    // Llamada segura
    onUpdateCard(targetDeckId, card.id, { interval: newInterval, ease: newEase, nextDate: newNextDate });

    if (rating === 'repeat' && isChallenge) {
      setChallengeQueue(prev => [...prev, {...card, interval: newInterval, ease: newEase, nextDate: newNextDate}]);
    }

    setIdx(p => p + 1);
  };

  return (
    <div className="max-w-xl mx-auto py-10 space-y-8 text-left">
      <div className="flex justify-between items-center">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-all">
          <Icon name="ChevronRight" className="rotate-180" size={16}/> Back
        </button>
        {!isChallenge && (
          <button 
            onClick={() => { setIsShuffled(!isShuffled); setIdx(0); }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl font-black text-[10px] uppercase transition-all ${isShuffled ? 'bg-rose-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
          >
            <Icon name="Shuffle" size={14}/> {isShuffled ? 'Shuffled' : 'Normal'}
          </button>
        )}
      </div>

      <div className="h-80 w-full relative" style={{ perspective: '1000px' }} onClick={()=>{if(!flipped) addPoints(2,"Flashcard Mastery"); setFlipped(!flipped);}}>
        <div className={`relative w-full h-full transition-transform duration-500 rounded-[40px] shadow-2xl cursor-pointer ${flipped ? '[transform:rotateY(180deg)]' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 bg-white border-8 border-rose-50 rounded-[40px] flex flex-col items-center justify-center p-10 text-center [backface-visibility:hidden] shadow-inner">
            {(card?.deckName || deck.name) && <span className="absolute top-6 px-3 py-1 bg-rose-50 text-rose-500 text-[8px] font-black rounded-full uppercase border border-rose-100">{card.deckName || deck.name}</span>}
            <p className="text-2xl font-black text-slate-800">{card?.q}</p>
          </div>
          <div className="absolute inset-0 bg-rose-600 text-white rounded-[40px] flex items-center justify-center p-10 text-center [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-xl shadow-rose-200">
            <p className="text-xl font-medium italic">{card?.a}</p>
          </div>
        </div>
      </div>
      
      {flipped ? (
        <div className="grid grid-cols-4 gap-2 animate-in fade-in slide-in-from-bottom-2">
          <button onClick={(e)=>{e.stopPropagation(); handleAnki('repeat')}} className="py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase shadow-sm active:scale-95 transition-all">Repetir<br/><span className="text-[8px] opacity-60">Ahora</span></button>
          <button onClick={(e)=>{e.stopPropagation(); handleAnki('hard')}} className="py-4 bg-orange-100 text-orange-700 rounded-2xl font-black text-[10px] uppercase shadow-sm active:scale-95 transition-all">Difícil<br/><span className="text-[8px] opacity-60">Mañana</span></button>
          <button onClick={(e)=>{e.stopPropagation(); handleAnki('good')}} className="py-4 bg-emerald-100 text-emerald-700 rounded-2xl font-black text-[10px] uppercase shadow-sm active:scale-95 transition-all">Bien<br/><span className="text-[8px] opacity-60">Días</span></button>
          <button onClick={(e)=>{e.stopPropagation(); handleAnki('easy')}} className="py-4 bg-blue-100 text-blue-700 rounded-2xl font-black text-[10px] uppercase shadow-sm active:scale-95 transition-all">Fácil<br/><span className="text-[8px] opacity-60">Semanas</span></button>
        </div>
      ) : (
        <div className="flex gap-4">
          <button onClick={(e)=>{e.stopPropagation(); setIdx(p=>Math.max(0,p-1))}} className="flex-1 py-4 bg-white border-2 border-rose-100 rounded-2xl font-black text-rose-600 shadow-sm active:scale-95 transition-all" disabled={idx===0}>PREVIOUS</button>
          <button onClick={(e)=>{e.stopPropagation(); setIdx(p=>p+1)}} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black shadow-xl shadow-rose-100 active:scale-95 transition-all">NEXT</button>
        </div>
      )}
      <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{idx + 1} / {cardsToStudy.length}</p>
    </div>
  );
}
function BadgesView({ points, streak, maxStreak, topics, planning, units, skills, perfectWeeks, totalDailyChallenges }) {
  const doneTopics = topics.filter(t=>t.finished).length;
  const studiedTopics = topics.filter(t=>t.estudiado > 0).length;
  const writtenTopics = topics.filter(t=>t.redactado).length;
  const planningDone = planning.filter(p=>p.status===10).length;
  const unitsDone = units.filter(u=>u.status===10).length;
  const allSkills = skills.reduce((a, s) => a + s.level, 0);
  const totalMocks = topics.reduce((a, t) => a + (t.mocks || 0), 0);

  /* --- SWIFTIE REFERENCE START --- */
  const BADGES = [
    { icon: '🥚', title: 'Hatching', desc: '500 pts', cond: points >= 500 },
    { icon: '🐾', title: 'Walker', desc: '2,500 pts', cond: points >= 2500 },
    { icon: '🥋', title: 'Black Belt', desc: '10k pts', cond: points >= 10000 },
    { icon: '🌌', title: 'Cosmic', desc: '50k pts', cond: points >= 50000 },

    { icon: '🔥', title: 'Spark', desc: '3 Day Streak', cond: maxStreak >= 3 },
    { icon: '🏕️', title: 'Camper', desc: '7 Day Streak', cond: maxStreak >= 7 },
    { icon: '🕰️', title: 'Meet me at midnight', desc: '13 Day Streak', cond: maxStreak >= 13 },
    { icon: '🏔️', title: 'Mountain', desc: '60 Day Streak', cond: maxStreak >= 60 },

    { icon: '✍️', title: 'Writer', desc: '1 Topic Written', cond: writtenTopics >= 1 },
    { icon: '📚', title: 'Author', desc: '10 Topics Written', cond: writtenTopics >= 10 },
    
    { icon: '🎓', title: 'Professor', desc: '30 Topics Studied', cond: studiedTopics >= 30 },

    { icon: '🎧', title: 'YOYOK', desc: '5 Simulacros', cond: totalMocks >= 5 },
    { icon: '🏰', title: 'Long Live', desc: '69 Mastered', cond: doneTopics === 69 },

    { icon: '🏗️', title: 'Foundation', desc: '1 Prog Part', cond: planningDone >= 1 },
    { icon: '🏛️', title: 'Architect', desc: 'All Prog Final', cond: planningDone === planning.length && planning.length > 0 },
    { icon: '🧩', title: 'Mastermind', desc: 'All Units Final', cond: unitsDone === units.length && units.length > 0 },

    { icon: '🎯', title: 'Sharp', desc: '1 Skill Maxed', cond: skills.some(s=>s.level===10) },

    { icon: '🫶', title: 'Fearless', desc: '10 Sem. Perfectas', cond: perfectWeeks >= 10 },
    { icon: '✨', title: 'Bejeweled', desc: '30 Sem. Perfectas', cond: perfectWeeks >= 30 },
    { icon: '🧠', title: 'Leyenda Repaso', desc: '50 Retos Diarios', cond: totalDailyChallenges >= 50 },
  ];
  /* --- SWIFTIE REFERENCE END --- */

  return (
    <div className="space-y-8 text-left animate-in fade-in slide-in-from-bottom-6">
      <div className="bento-card bg-white p-8 border-4 border-amber-50 text-center space-y-2 shadow-inner"><Icon name="Flame" size={48} className="fill-orange-500 text-orange-500 mx-auto" /><p className="text-5xl font-black text-slate-900 tabular-nums">{maxStreak}</p><p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest leading-none">Max Consecutive Days</p></div>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-4">
        {BADGES.map((b, i) => (
          <div key={i} className={`bento-card bg-white p-4 flex flex-col items-center text-center transition-all ${b.cond ? 'bg-amber-50 border-amber-200 shadow-md scale-105' : 'opacity-20 grayscale scale-95 shadow-none border-dashed'}`}>
            <span className="text-3xl mb-2">{b.icon}</span>
            <p className="text-[9px] font-black text-slate-800 leading-tight mb-1 uppercase">{b.title}</p>
            <p className="text-[7px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function VaultCarousel({ items, setItems, onClose }) {
  const [idx, setIdx] = useState(0);
  const [importOpen, setImportOpen] = useState(false);
  const [importTxt, setImportTxt] = useState("");

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importTxt);
      if (Array.isArray(parsed)) {
        setItems(parsed);
        setImportOpen(false);
        setImportTxt("");
        alert("Vault updated successfully!");
      }
    } catch(e) {
      alert("Invalid JSON format. Check your input.");
    }
  };

  const handleShuffle = () => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    setItems(shuffled);
    setIdx(0);
  };

  if (items.length === 0 && !importOpen) {
    return (
      <div className="fixed inset-0 z-[600] bg-slate-900 flex items-center justify-center p-8">
        <button onClick={onClose} className="absolute top-6 right-6 text-white/50 hover:text-white"><Icon name="X" size={32}/></button>
        <div className="text-center space-y-6">
           <p className="text-white font-black text-xl italic uppercase tracking-widest">Vault is empty</p>
           <button onClick={() => setImportOpen(true)} className="px-6 py-3 bg-white text-slate-900 rounded-xl font-black">Import Citations</button>
        </div>
      </div>
    );
  }

  const current = items[idx];

  return (
    <div className="fixed inset-0 z-[600] bg-slate-900 flex flex-col items-center justify-center p-6 sm:p-12 animate-in fade-in">
       <div className="absolute top-6 right-6 flex gap-4">
          <button onClick={handleShuffle} title="Shuffle Vault" className="text-white/30 hover:text-amber-500 transition-colors"><Icon name="Shuffle" size={24}/></button>
          <button onClick={() => setImportOpen(!importOpen)} title="Settings" className="text-white/30 hover:text-white transition-colors"><Icon name="Settings" size={24}/></button>
          <button onClick={onClose} className="text-white/30 hover:text-red-500 transition-colors"><Icon name="X" size={28}/></button>
       </div>

       {importOpen ? (
         <div className="w-full max-w-md space-y-4 animate-in zoom-in-95">
           <p className="text-white text-center font-black uppercase text-xs tracking-widest">Import citations (JSON)</p>
           <textarea 
             className="w-full h-64 bg-slate-800 border-2 border-slate-700 rounded-2xl p-4 text-white font-mono text-xs outline-none focus:border-amber-500"
             placeholder='[{"category": "...", "reference": "...", "text": "..."}]'
             value={importTxt}
             onChange={e => setImportTxt(e.target.value)}
           />
           <button onClick={handleImport} className="w-full py-4 bg-amber-500 text-slate-950 font-black rounded-2xl uppercase shadow-xl">Apply Updates</button>
         </div>
       ) : (
         <div className="w-full max-w-2xl flex flex-col items-center gap-12">
            <div className="text-center space-y-4 animate-in slide-in-from-bottom-4">
               <span className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">{current.category}</span>
               <p className="text-white text-2xl sm:text-4xl font-black leading-tight">"{current.text}"</p>
               <p className="text-slate-400 font-bold italic">— {current.reference}</p>
            </div>
            
            <div className="flex gap-8 items-center">
              <button onClick={() => setIdx(p => Math.max(0, p-1))} className={`p-4 rounded-full border-2 border-white/10 text-white transition-all ${idx === 0 ? 'opacity-20' : 'hover:bg-white/5 active:scale-90'}`} disabled={idx===0}><Icon name="ChevronRight" className="rotate-180" size={32}/></button>
              <p className="text-white/20 font-black tabular-nums">{idx + 1} / {items.length}</p>
              <button onClick={() => setIdx(p => Math.min(items.length-1, p+1))} className={`p-4 rounded-full border-2 border-white/10 text-white transition-all ${idx === items.length-1 ? 'opacity-20' : 'hover:bg-white/5 active:scale-90'}`} disabled={idx===items.length-1}><Icon name="ChevronRight" size={32}/></button>
            </div>
         </div>
       )}
    </div>
  );
}

function StatsView({ actionLogs, undoAction, topics, planning, units, levelDates }) {
  const [tab, setTab] = useState('hist');
  const [statsView, setStatsView] = useState('syllabus');

  const exportData = () => {
    const exportObj = {
      levelHistory: {}, // <-- HISTORIAL DE NIVELES INCLUIDO
      topics: {},
      planning: {},
      practico: []
    };

    if (levelDates) {
      Object.entries(levelDates).forEach(([level, date]) => {
        exportObj.levelHistory[`Level ${level}`] = date;
      });
    }

    actionLogs.forEach(log => {
      if (log.actionData) {
        const { entity, id, field } = log.actionData;
        const date = new Date(log.timestamp).toLocaleString();
        if (entity === 'topic') {
          if (!exportObj.topics[id]) exportObj.topics[id] = [];
          exportObj.topics[id].push({ date, action: field || log.description, points: log.amount });
        } else if (entity === 'planning' || entity === 'unit') {
          if (!exportObj.planning[id]) exportObj.planning[id] = [];
          exportObj.planning[id].push({ date, action: field || log.description, points: log.amount });
        } else {
          exportObj.practico.push({ date, entity, action: log.description, points: log.amount });
        }
      }
    });
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "study_logs_export.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const syllabusStats = useMemo(() => {
    const useful = topics.filter(t => !t.discarded);
    const total = useful.length;
    const done = useful.filter(t => t.finished).length;
    const started = useful.filter(t => (t.redactado || t.estudiado > 0) && !t.finished).length;
    const pending = total - done - started;
    return { done, started, pending, total, donePct: Math.round((done/total)*100) || 0, startedPct: Math.round((started/total)*100) || 0 };
  }, [topics]);

  const planningStats = useMemo(() => {
    const combined = [...planning, ...units];
    const total = combined.length;
    const done = combined.filter(i => i.status === 10).length;
    const started = combined.filter(i => i.status > 0 && i.status < 10).length;
    const pending = total - done - started;
    return { done, started, pending, total, donePct: Math.round((done/total)*100) || 0, startedPct: Math.round((started/total)*100) || 0 };
  }, [planning, units]);

  const currentStats = statsView === 'syllabus' ? syllabusStats : planningStats;
  const groupLogs = (mode) => { const groups = {}; actionLogs.forEach(l => { const d = new Date(l.timestamp); const key = mode === 'week' ? `Week ${Math.ceil(d.getDate()/7)} - ${d.toLocaleString('en-US',{month:'short'})}` : d.toLocaleString('en-US',{month:'long',year:'numeric'}); if(!groups[key]) groups[key] = { pts: 0, count: 0 }; groups[key].pts += l.amount; groups[key].count += 1; }); return Object.entries(groups).reverse(); };
  
  return (
    <div className="space-y-6 text-left animate-in zoom-in-95">
      <div className="bento-card bg-white p-8 border-violet-100 shadow-xl">
        <div className="flex justify-center mb-8 bg-slate-100 p-1 rounded-2xl w-fit mx-auto">
          <button onClick={()=>setStatsView('syllabus')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${statsView==='syllabus'?'bg-white text-violet-600 shadow-md':'text-slate-400'}`}>SYLLABUS</button>
          <button onClick={()=>setStatsView('planning')} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${statsView==='planning'?'bg-white text-violet-600 shadow-md':'text-slate-400'}`}>PLANNING</button>
        </div>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="relative w-48 h-48 rounded-full shadow-inner border-8 border-slate-50 flex items-center justify-center" style={{ background: `conic-gradient(#10b981 ${currentStats.donePct}%, #8b5cf6 ${currentStats.donePct}% ${currentStats.donePct + currentStats.startedPct}%, #f1f5f9 ${currentStats.donePct + currentStats.startedPct}% 100%)` }}><div className="w-32 h-32 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center"><span className="text-3xl font-black text-slate-900">{currentStats.donePct}%</span><span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mastered</span></div></div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm" /><div className="text-left leading-none"><p className="text-xs font-black text-slate-800">{currentStats.done} Finished</p></div></div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-violet-500 shadow-sm" /><div className="text-left leading-none"><p className="text-xs font-black text-slate-800">{currentStats.started} In Progress</p></div></div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm" /><div className="text-left leading-none"><p className="text-xs font-black text-slate-800">{currentStats.pending} Pending</p></div></div>
          </div>
        </div>
      </div>
      <div id="activity-log" className="flex flex-col sm:flex-row justify-between items-center bg-white/50 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-white/50 gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <h2 className="text-xl font-black text-violet-950">Activity Log</h2>
          <button onClick={exportData} className="px-3 py-1.5 bg-violet-100 text-violet-700 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-violet-200 transition-colors shadow-sm whitespace-nowrap">Export Logs</button>
        </div>
        <div className="flex bg-slate-200 p-1 rounded-xl shrink-0 w-full sm:w-auto overflow-x-auto">
          {['hist','week','month'].map(t=>(<button key={t} onClick={()=>setTab(t)} className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase transition-all flex-1 sm:flex-none ${tab===t?'bg-white shadow-md text-violet-600':'text-slate-500'}`}>{t==='hist'?'History':t==='week'?'Weeks':'Months'}</button>))}
        </div>
      </div>
      <div className="min-h-[400px]">
        {tab === 'hist' ? (
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {actionLogs.length === 0 ? <p className="italic text-slate-300 font-bold">No records found.</p> : actionLogs.slice(0,50).map(l=>(
              <div key={l.id} className="bento-card bg-white p-4 flex justify-between items-center border-violet-50 hover:border-violet-200 transition-all">
                <div className="text-left leading-tight">
                  <p className="text-sm font-black text-slate-800 line-clamp-1">{l.description}</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">{new Date(l.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-black px-2 py-1 rounded-lg shadow-inner ${l.amount > 0 ? 'text-violet-700 bg-violet-50' : l.amount < 0 ? 'text-red-700 bg-red-50' : 'text-slate-500 bg-slate-100'}`}>{l.amount > 0 ? '+'+l.amount : l.amount}</span>
                  <button onClick={()=>undoAction(l.id)} className="text-slate-300 hover:text-red-500 transition-colors active:scale-90" title="Undo"><Icon name="Undo2" size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupLogs(tab).map(([key, data]) => (
              <div key={key} className="bento-card bg-white p-6 border-violet-100 flex justify-between items-center shadow-md">
                <div className="text-left leading-tight">
                  <p className="text-xs font-black text-violet-900 uppercase tracking-tighter">{key}</p>
                  <p className="text-[10px] font-bold text-slate-400">{data.count} actions</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-violet-600">{data.pts > 0 ? '+'+data.pts : data.pts}</p>
                  <p className="text-[8px] font-black opacity-40 uppercase tracking-widest">Points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TodoView({ todos, setTodos, addPoints }) {
  const [type, setType] = useState('goal');
  const [inp, setInp] = useState("");
  return (
    <div className="space-y-6 text-left">
      <div className="flex p-1 bg-slate-100 rounded-2xl shadow-inner">
        <button onClick={()=>setType('goal')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type==='goal'?'bg-white text-orange-600 shadow-md':'text-slate-400'}`}>GOALS</button>
        <button onClick={()=>setType('review')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type==='review'?'bg-white text-orange-600 shadow-md':'text-slate-400'}`}>REVIEWS</button>
      </div>
      <form onSubmit={e=>{e.preventDefault(); if(inp.trim()){setTodos([{id:Date.now().toString(),text:inp,completed:false,type}, ...todos]); setInp("");}}} className="flex gap-2">
        {/* --- SWIFTIE REFERENCE START --- */}
        <input placeholder="Got a blank space, baby... ¡añade una tarea!" value={inp} onChange={e=>setInp(e.target.value)} className="flex-1 bento-card bg-white px-4 py-3 text-sm font-black outline-none border-orange-50 focus:border-orange-200 shadow-sm" />
        {/* --- SWIFTIE REFERENCE END --- */}
        <button type="submit" className="p-3 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-100 active:scale-95 transition-all"><Icon name="Plus" size={24}/></button>
      </form>
      <div className="space-y-3">
        {todos.filter(t=>t.type===type).map(t=>(
          <div key={t.id} className="bento-card bg-white p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <button onClick={()=>{const isDone = !t.completed; setTodos(todos.map(pt=>pt.id===t.id?{...pt,completed:isDone}:pt)); addPoints(isDone ? 5 : -5, t.text, { entity: 'todo', id: t.id, prevValue: t.completed });}} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${t.completed?'bg-emerald-500 border-emerald-500 text-white shadow-sm':'border-orange-100 hover:border-orange-300'}`}>{t.completed && <Icon name="Check" size={16}/>}</button>
              <span className={`text-sm font-black text-left transition-all ${t.completed?'line-through text-slate-300':'text-slate-700'}`}>{t.text}</span>
            </div>
            <button onClick={()=>setTodos(todos.filter(x=>x.id!==t.id))} className="text-slate-200 hover:text-red-500 transition-colors active:scale-90"><Icon name="Trash2" size={18}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function HeaderToolBtn({ active, icon, label, color, onClick }) {
  const c = active ? `bg-${color}-50 text-${color}-600 shadow-md` : `bg-white text-slate-600 border border-slate-100 hover:bg-slate-50`;
  return <button onClick={onClick} className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all active:scale-95 ${c}`}><Icon name={icon} size={16} /><span className="text-[7px] font-black uppercase tracking-widest leading-none mt-0.5">{label}</span></button>;
}

function NavBtn({ active, icon, label, color, onClick }) {
  const c = active ? `text-${color}-600 bg-${color}-50 shadow-inner` : 'text-slate-400 opacity-60 hover:opacity-100';
  return <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 transition-all ${active?'scale-110':''}`}><div className={`p-2.5 rounded-xl ${c} transition-all shadow-sm`}><Icon name={icon} size={24} strokeWidth={active?3:2}/></div><span className={`text-[9px] font-black tracking-widest mt-1 ${active?`text-${color}-600`:'text-slate-400'}`}>{label}</span></button>;
}

function LoginScreen({ onLogin }) {
  const [c, setC] = useState("");
  return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6 text-center animate-in fade-in">
      <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-sm border-4 border-emerald-100">
        <Icon name="Turtle" size={80} className="text-emerald-500 mx-auto mb-6" />
        <h1 className="text-3xl font-black mb-2 tracking-tighter text-emerald-950 leading-none">TurtleStudy</h1>
        <p className="text-slate-400 text-xs font-bold uppercase mb-6 tracking-widest">Master Syllabus Manager</p>
        <input placeholder="Sync Code" value={c} onChange={e=>setC(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-black outline-none border-2 border-transparent focus:border-emerald-300 transition-all shadow-inner" />
        <button onClick={()=>onLogin(c)} className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black shadow-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-emerald-100 uppercase tracking-tighter">Enter App</button>
      </div>
    </div>
  );
}

function LoadingScreen() { 
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <Icon name="Turtle" className="text-emerald-500 animate-bounce mx-auto" size={80} />
        <p className="font-black text-emerald-900 animate-pulse uppercase tracking-[0.4em] text-xs">Synchronizing Vault...</p>
      </div>
    </div>
  ); 
}
