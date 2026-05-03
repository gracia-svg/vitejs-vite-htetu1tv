import React, { useState, useEffect, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// ==========================================
// 1. ICONOS
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
  X: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>'
};

const Icon = ({ name, size = 24, strokeWidth = 2, className = "" }) => {
  const path = ICON_PATHS[name];
  if (!path) return null;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className} dangerouslySetInnerHTML={{ __html: path }} />
  );
};

// ==========================================
// 2. CONFIGURACIÓN FIREBASE Y TEMARIO TRADUCIDO
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

const RAW_TITLES = [
  "Language learning in the educational curriculum. Language as communication. Learning and acquisition.",
  "Communication. The communicative competence. Components.",
  "The communication process. Functions and language use. Language in context.",
  "The English language as a vehicle for culture. Integration of linguistic and cultural contents.",
  "Oral language. Elements and rules of oral communication. Functions and strategies.",
  "Written language. Reading and writing. Evolution, types, and strategies.",
  "The phonological system I. Vowels and diphthongs. Comparison with the mother tongue.",
  "The phonological system II. Consonants. Comparison with the mother tongue.",
  "The phonological system III. Stress, rhythm, and intonation. Comparison with the mother tongue.",
  "Concept of grammar. Main grammar models. Linguistic categories.",
  "The Noun Phrase I. The noun: types, gender, and number.",
  "The Noun Phrase II. The determiner: articles, pronouns, and adjectives.",
  "The Verb Phrase I. The verb: tense, aspect, and mood.",
  "The Verb Phrase II. Modal verbs.",
  "The Adjective Phrase. Types, comparison, and order.",
  "The Adverbial Phrase. Adverbs and adverbial locutions.",
  "Prepositions and prepositional phrases.",
  "The simple sentence. Constituents and types.",
  "Coordination and subordination. Sentence linking.",
  "Expression of quantity, quality, and degree.",
  "Expression of time, space, and manner.",
  "Expression of possession, focus, and emphasis.",
  "Expression of cause, consequence, and purpose.",
  "Expression of condition and concession.",
  "Expression of assertion, negation, and doubt.",
  "The passive voice and the impersonal voice.",
  "Reported speech.",
  "Lexicology. Word formation. Semantic relations.",
  "Textual linguistics I. Cohesion and coherence.",
  "Textual linguistics II. Macro-structure and micro-structure.",
  "The narrative text. Characteristics and structures.",
  "The descriptive text. Characteristics and structures.",
  "The expository text. Characteristics and structures.",
  "The argumentative text. Characteristics and structures.",
  "The instructional text. Characteristics and structures.",
  "The poetic text. Characteristics and structures.",
  "The dramatic text. Characteristics and structures.",
  "Discourse analysis I. Register and style.",
  "Discourse analysis II. Pragmatics and speech acts.",
  "The use of ICT in English language learning.",
  "Old and Middle English literature. Beowulf and Chaucer.",
  "The Renaissance and the Elizabethan Age. Shakespeare.",
  "17th Century literature. Milton and the metaphysical poets.",
  "The 18th Century. The rise of the novel. Defoe, Swift, and Richardson.",
  "Romanticism. The Lake Poets and the second generation.",
  "The American Revolution and the foundation of the USA.",
  "Victorian literature I. The great novelists: Dickens, Bronte, Thackeray.",
  "Victorian literature II. Poetry and drama: Tennyson, Browning, Wilde.",
  "Modernism in Britain. James Joyce and Virginia Woolf.",
  "Contemporary British literature. Main trends.",
  "The development of English in the USA. Colonial period.",
  "19th Century American literature. Hawthorne, Melville, and Poe.",
  "American Romanticism. Transcendentalism: Emerson and Thoreau.",
  "American Realism and Naturalism. Mark Twain and Henry James.",
  "20th Century American literature I. The Lost Generation.",
  "20th Century American literature II. The Southern Renaissance.",
  "20th Century American literature III. Contemporary trends.",
  "History and culture of the United Kingdom.",
  "History and culture of the United States.",
  "Commonwealth literature. Main authors and themes.",
  "Institutions and political systems of the UK and the USA.",
  "Social and educational systems in the English-speaking world.",
  "The press and media in the UK and the USA.",
  "Scientific and technical development in the English-speaking world.",
  "Art and architecture in the UK and the USA.",
  "Music and cinema in the English-speaking world.",
  "Traditions and festivals in the UK and the USA.",
  "Geography and natural resources of the UK and the USA.",
  "Current challenges in the English-speaking world."
];

const INITIAL_TOPICS = Array.from({ length: 69 }, (_, i) => {
  const t = RAW_TITLES[i];
  return { 
    id: i + 1, 
    title: t, 
    redactado: false, 
    estudiado: false, 
    reviews: 0, 
    mocks: 0, 
    miniMocks: 0, 
    finished: false, 
    discarded: false, 
    stars: 0,
    indexNotes: `Introduction\n\n${t.split('. ').join('\n')}\n\nTopic ${i+1} in the classroom\n\nBibliography\n\nConclusion\n\nBIBLIOGRAPHY`
  };
});

const INITIAL_PLANNING = [
  { id: 'p1', title: 'Contextualización', status: 0 }, { id: 'p2', title: 'Objetivos y Competencias', status: 0 }, { id: 'p3', title: 'Saberes Básicos', status: 0 },
  { id: 'p4', title: 'Metodología y Situaciones', status: 0 }, { id: 'p5', title: 'Evaluación', status: 0 }, { id: 'p6', title: 'Atención a la Diversidad', status: 0 },
];

const INITIAL_UNITS = Array.from({ length: 6 }, (_, i) => ({ id: `ud${i + 1}`, title: `Unidad Didáctica ${i + 1}`, status: 0 }));

const INITIAL_SKILLS = [
  { id: 's1', label: 'Use of English', level: 0 },
  { id: 's2', label: 'Traducción', level: 0 },
  { id: 's3', label: 'Listening', level: 0 }
];

const getTopicBlock = (id) => {
  if ([1, 2].includes(id)) return { name: 'Metodología', box: 'bg-orange-50 text-orange-600 border-orange-200', badge: 'bg-orange-100 text-orange-700 border-orange-200', color: '!bg-orange-500' };
  if ([3, 4, 5, 6, 28, 40].includes(id)) return { name: 'Comunicación', box: 'bg-purple-50 text-purple-600 border-purple-200', badge: 'bg-purple-100 text-purple-700 border-purple-200', color: '!bg-purple-500' };
  if ([7, 8, 9].includes(id)) return { name: 'Fonética', box: 'bg-slate-100 text-slate-700 border-slate-300', badge: 'bg-slate-200 text-slate-800 border-slate-300', color: '!bg-slate-500' };
  if (id >= 10 && id <= 27) return { name: 'Gramática', box: 'bg-sky-50 text-sky-600 border-sky-200', badge: 'bg-sky-100 text-sky-700 border-sky-200', color: '!bg-sky-500' };
  if (id >= 29 && id <= 39) return { name: 'Análisis Discurso', box: 'bg-pink-50 text-pink-600 border-pink-200', badge: 'bg-pink-100 text-pink-700 border-pink-200', color: '!bg-pink-500' };
  if ([41, 42, 43, 44, 45, 47, 48, 49, 50, 51, 56, 57, 58, 62].includes(id)) return { name: 'Lit. Británica', box: 'bg-green-50 text-green-600 border-green-200', badge: 'bg-green-100 text-green-700 border-green-200', color: '!bg-green-500' };
  if ([46, 52, 53, 54, 55, 59, 60].includes(id)) return { name: 'Lit. Americana', box: 'bg-yellow-50 text-yellow-600 border-yellow-200', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', color: '!bg-yellow-500' };
  if ([61, 63, 64, 65, 66, 67, 68, 69].includes(id)) return { name: 'Cultura', box: 'bg-indigo-50 text-indigo-600 border-indigo-200', badge: 'bg-indigo-100 text-indigo-700 border-indigo-200', color: '!bg-indigo-500' };
  return { name: 'General', box: 'bg-gray-50 text-gray-600 border-gray-200', badge: 'bg-gray-100 text-gray-700 border-gray-200', color: '!bg-slate-600' };
};

const PLANNING_STATUS = ['Nada', 'Esbozo', 'Escrita', 'Repasada', 'Ensayada', 'Finalizada'];
const NOTE_COLORS = [
  { id: 'yellow', bg: 'bg-yellow-200', border: 'border-yellow-300', text: 'text-yellow-900', pin: 'text-yellow-600' },
  { id: 'blue', bg: 'bg-blue-200', border: 'border-blue-300', text: 'text-blue-900', pin: 'text-blue-600' },
  { id: 'green', bg: 'bg-green-200', border: 'border-green-300', text: 'text-green-900', pin: 'text-green-600' },
  { id: 'pink', bg: 'bg-pink-200', border: 'border-pink-300', text: 'text-pink-900', pin: 'text-pink-600' },
  { id: 'purple', bg: 'bg-purple-200', border: 'border-purple-300', text: 'text-purple-900', pin: 'text-purple-600' },
];

// ==========================================
// 3. APP PRINCIPAL
// ==========================================
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
  const [practicoSessions, setPracticoSessions] = useState(0);
  const [lastActiveDate, setLastActiveDate] = useState(null);

  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);
  const [customMinutes, setCustomMinutes] = useState("");
  const [luckyNumbers, setLuckyNumbers] = useState([0,0,0,0]);
  const [activeDeckId, setActiveDeckId] = useState(null);
  const [examDeck, setExamDeck] = useState(null);
  const [selectedTopicModal, setSelectedTopicModal] = useState(null);

  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const s = document.createElement('script'); s.id = 'tailwind-cdn'; s.src = "https://cdn.tailwindcss.com"; document.head.appendChild(s);
    }
    if (syncCode) setIsLogged(true);
    const init = async () => { try { await signInAnonymously(auth); } catch(e){} }; init();
  }, [syncCode]);

  useEffect(() => {
    if (!isLogged || !syncCode) return;
    const docRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'turtle_users', syncCode);
    return onSnapshot(docRef, (snap) => {
      if (snap.exists() && !isDataLoaded) {
        const d = snap.data();
        setPoints(d.points || 0); 
        setTopics(d.topics?.length ? d.topics : INITIAL_TOPICS);
        setPlanning(d.planning?.length ? d.planning : INITIAL_PLANNING); 
        setUnits(d.units?.length ? d.units : INITIAL_UNITS);
        setSkills(d.skills?.length ? d.skills : INITIAL_SKILLS); 
        setDecks(d.decks || []);
        setTodos(d.todos || []); 
        setNotes(d.notes || []); 
        setActionLogs(d.actionLogs || []);
        setExamDate(d.examDate || "2026-06-20"); 
        setStreak(d.streak || 0);
        setMaxStreak(d.maxStreak || 0); 
        setPracticoSessions(d.practicoSessions || 0);
        setLevelDates(d.levelDates || { 1: new Date().toLocaleDateString() });
        setLastActiveDate(d.lastActiveDate || null);
      }
      setIsDataLoaded(true);
    });
  }, [isLogged, syncCode, isDataLoaded]);

  useEffect(() => {
    if (!isDataLoaded || !isLogged) return;
    const save = async () => {
      const docRef = doc(db, 'artifacts', APP_ID_PATH, 'public', 'data', 'turtle_users', syncCode);
      await setDoc(docRef, { 
        points, topics, 
        planning: planning.length ? planning : INITIAL_PLANNING, 
        units: units.length ? units : INITIAL_UNITS, 
        skills: skills.length ? skills : INITIAL_SKILLS, 
        decks, todos, notes, actionLogs, examDate, streak, maxStreak, practicoSessions, levelDates, lastActiveDate 
      });
    };
    const t = setTimeout(save, 1500); return () => clearTimeout(t);
  }, [points, topics, planning, units, skills, decks, todos, notes, actionLogs, examDate, streak, maxStreak, practicoSessions, levelDates, lastActiveDate, isDataLoaded]);

  const addPoints = (amount, desc, actionData = null) => {
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
    setActionLogs(prev => [{ id: Date.now().toString(), amount, description: desc, timestamp: Date.now(), actionData }, ...prev]);
  };

  const undoAction = (id) => {
    const log = actionLogs.find(l => l.id === id);
    if (log) { 
      setPoints(p => Math.max(0, p - log.amount)); 
      if (log.actionData) {
        const { entity, id: entityId, field, prevValue } = log.actionData;
        if (entity === 'topic') {
          setTopics(prev => prev.map(t => t.id === entityId ? { ...t, [field]: prevValue } : t));
        } else if (entity === 'planning') {
          if (entityId.startsWith('p')) setPlanning(prev => prev.map(p => p.id === entityId ? { ...p, [field]: prevValue } : p));
          else setUnits(prev => prev.map(u => u.id === entityId ? { ...u, [field]: prevValue } : u));
        } else if (entity === 'skill') {
          setSkills(prev => prev.map(s => s.id === entityId ? { ...s, level: prevValue } : s));
        } else if (entity === 'practico_sessions') {
          setPracticoSessions(prevValue);
        } else if (entity === 'todo') {
          setTodos(prev => prev.map(t => t.id === entityId ? { ...t, completed: prevValue } : t));
        }
      }
      setActionLogs(prev => prev.filter(l => l.id !== id)); 
    }
  };

  useEffect(() => {
    let int;
    if (isTimerActive && timeLeft > 0) int = setInterval(() => setTimeLeft(t => t - 1), 1000);
    else if (timeLeft === 0) setIsTimerActive(false);
    return () => clearInterval(int);
  }, [isTimerActive, timeLeft]);

  const currentLevel = Math.floor(points/200)+1;
  const fullyCount = topics.filter(t => t.redactado && t.estudiado && t.finished).length;
  const totalCards = decks.reduce((a,d)=>a+d.cards.length, 0);
  const BADGES = [
    { id: 'l1', icon: '🐢', title: 'Primeros Pasos', desc: 'Nivel 5', cond: currentLevel >= 5 },
    { id: 'l2', icon: '🥷', title: 'Tortuga Ninja', desc: 'Nivel 25', cond: currentLevel >= 25 },
    { id: 'l3', icon: '🥋', title: 'Cinturón Negro', desc: 'Nivel 75', cond: currentLevel >= 75 },
    { id: 'l4', icon: '🐉', title: 'Maestro Jedi', desc: 'Nivel 150', cond: currentLevel >= 150 },
    { id: 'l5', icon: '🌌', title: 'Dios de la Opo', desc: 'Nivel 200', cond: currentLevel >= 200 },
    { id: 's1', icon: '🔥', title: 'Hábito Hierro', desc: '30 días racha', cond: maxStreak >= 30 },
    { id: 's2', icon: '🧘', title: 'Modo Monje', desc: '100 días racha', cond: maxStreak >= 100 },
    { id: 't1', icon: '📖', title: 'Iniciado', desc: '10 temas OK', cond: fullyCount >= 10 },
    { id: 't2', icon: '⚖️', title: 'Medio Camino', desc: '21 temas OK', cond: fullyCount >= 21 },
    { id: 't3', icon: '🏆', title: 'Maestro Absoluto', desc: '42 temas OK', cond: fullyCount >= 42 },
    { id: 'p1', icon: '🏅', title: 'Analista', desc: '10 supuestos', cond: practicoSessions >= 10 },
    { id: 'p2', icon: '🕵️', title: 'Sherlock', desc: '30 supuestos', cond: practicoSessions >= 30 },
    { id: 'f1', icon: '📸', title: 'Memoria Visual', desc: '50 Flashcards', cond: totalCards >= 50 },
    { id: 'm1', icon: '✨', title: 'Perfeccionista', desc: 'Skills Nivel 10', cond: skills.length > 0 && skills.every(s=>s.level>=10) }
  ];

  if (!isLogged) return <LoginScreen onLogin={(c) => { setSyncCode(c); localStorage.setItem('turtle_sync_code', c); }} />;
  if (!isDataLoaded) return <LoadingScreen />;

  return (
    <div className="min-h-screen pb-32 font-sans relative overflow-x-hidden">
      <style>{`
        body { background-color: #f8fafc; background-image: radial-gradient(#fbbf24 2px, transparent 2px), radial-gradient(#f472b6 2px, transparent 2px), radial-gradient(#60a5fa 2px, transparent 2px), radial-gradient(#34d399 2px, transparent 2px); background-size: 80px 80px; background-position: 0 0, 40px 40px, 20px 60px, 60px 20px; }
        .bento-card { border-radius: 28px; border: 2px solid #f1f5f9; box-shadow: 0 4px 15px rgba(0,0,0,0.05); }
        .map-bubble { width: 80px; height: 80px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; border: 6px solid white; box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
        .modal-overlay { background: rgba(15, 23, 42, 0.8); backdrop-filter: blur(8px); position: fixed; inset: 0; z-index: 500; display: flex; align-items: center; justify-content: center; padding: 1rem; }
        .modal-content { background: white; width: 100%; max-width: 600px; max-height: 85vh; border-radius: 40px; overflow-y: auto; position: relative; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      {/* VENTANA EMERGENTE DE TEMA */}
      {selectedTopicModal && (
        <div className="modal-overlay animate-in fade-in duration-300" onClick={() => setSelectedTopicModal(null)}>
          <div className="modal-content p-8 custom-scrollbar animate-in zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedTopicModal(null)} className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-400 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors">
              <Icon name="X" size={20} />
            </button>
            <div className="text-center space-y-6">
              <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl border-4 ${getTopicBlock(selectedTopicModal.id).badge}`}>
                {selectedTopicModal.id}
              </div>
              <h3 className="text-2xl font-black text-slate-900 leading-tight">
                {selectedTopicModal.title}
              </h3>
              
              <div className="border-t-2 border-slate-50 pt-6 text-left">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Index & Notes</span>
                  <button 
                    onClick={() => {
                      if (selectedTopicModal.isEditing) {
                        setTopics(prev => prev.map(t => t.id === selectedTopicModal.id ? { ...t, indexNotes: selectedTopicModal.tempNotes } : t));
                        setSelectedTopicModal({ ...selectedTopicModal, isEditing: false, indexNotes: selectedTopicModal.tempNotes });
                      } else {
                        setSelectedTopicModal({ ...selectedTopicModal, isEditing: true, tempNotes: selectedTopicModal.indexNotes });
                      }
                    }}
                    className={`p-2 rounded-xl transition-all ${selectedTopicModal.isEditing ? 'bg-emerald-500 text-white shadow-lg' : 'bg-slate-100 text-slate-500'}`}
                  >
                    <Icon name={selectedTopicModal.isEditing ? "Check" : "Edit"} size={18} />
                  </button>
                </div>
                
                {selectedTopicModal.isEditing ? (
                  <textarea 
                    autoFocus
                    className="w-full h-96 p-4 bg-slate-50 rounded-2xl border-2 border-emerald-200 outline-none font-medium text-slate-700 leading-relaxed resize-none"
                    value={selectedTopicModal.tempNotes}
                    onChange={e => setSelectedTopicModal({ ...selectedTopicModal, tempNotes: e.target.value })}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap font-sans text-slate-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 min-h-[200px]">
                    {selectedTopicModal.indexNotes || "No notes yet..."}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="sticky top-0 z-[100] bg-white/95 backdrop-blur-md border-b-2 border-slate-100 p-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('map')}>
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg"><Icon name="Turtle" size={24} /></div>
            <span className="font-black text-emerald-950 text-xl tracking-tighter hidden sm:block">TurtleStudy</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-black flex items-center gap-2 text-sm shadow-sm">
              <Icon name="Trophy" size={16} /><span>{points} pts</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowTimerMenu(!showTimerMenu)}
                className={`px-3 py-2 rounded-2xl font-black flex items-center gap-2 border transition-all text-sm ${isTimerActive ? 'bg-emerald-600 text-white border-transparent shadow-emerald-200 shadow-lg' : 'bg-white text-emerald-600 border-slate-200'}`}
              >
                <Icon name="Clock" size={16} className={isTimerActive ? 'animate-spin' : ''} />
                <span className="tabular-nums">{timeLeft > 0 ? (Math.floor(timeLeft/60)+":"+(timeLeft%60).toString().padStart(2,'0')) : '00:00'}</span>
              </button>
              
              {showTimerMenu && (
                <div className="absolute top-full right-0 mt-2 bg-white border-2 border-slate-100 rounded-2xl p-4 shadow-2xl z-[200] w-64 animate-in zoom-in-95">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <button onClick={()=>{setTimeLeft(7200); setIsTimerActive(true); setShowTimerMenu(false)}} className="p-2 bg-slate-50 hover:bg-emerald-50 rounded-xl text-[10px] font-black uppercase">2H Tema</button>
                    <button onClick={()=>{setTimeLeft(3600); setIsTimerActive(true); setShowTimerMenu(false)}} className="p-2 bg-slate-50 hover:bg-emerald-50 rounded-xl text-[10px] font-black uppercase">1H Prog</button>
                  </div>
                  <div className="flex gap-2">
                    <input type="number" placeholder="Mins..." value={customMinutes} onChange={e=>setCustomMinutes(e.target.value)} className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-xs font-black outline-none border-2 border-transparent focus:border-emerald-200" />
                    <button onClick={()=>{if(customMinutes){setTimeLeft(parseInt(customMinutes)*60); setIsTimerActive(true); setShowTimerMenu(false);}}} className="bg-emerald-600 text-white p-2 rounded-xl shadow-md"><Icon name="Check" size={18}/></button>
                  </div>
                  <button onClick={()=>{setTimeLeft(0); setIsTimerActive(false); setShowTimerMenu(false)}} className="w-full mt-3 p-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase">Parar</button>
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
              <HeaderToolBtn active={activeTab==='stats'} icon="BarChart3" label="ESTATS" color="violet" onClick={()=>setActiveTab('stats')} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-center gap-3 p-3 bg-orange-50 rounded-2xl border border-orange-100 text-orange-700 shadow-sm">
                <Icon name="Flame" size={20} className="fill-orange-500" />
                <div className="text-left leading-none"><p className="text-[10px] font-black uppercase opacity-60">Racha / Máx</p><p className="text-sm font-black">{streak} / {maxStreak}</p></div>
              </div>
              <button onClick={() => { const pool = Array.from({length: 69}, (_,i)=>i+1); const drawn = []; for(let i=0; i<4; i++) drawn.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]); setLuckyNumbers(drawn.sort((a,b)=>a-b)); }} className="flex items-center justify-center gap-3 p-3 bg-amber-50 rounded-2xl border border-amber-100 text-amber-700 active:scale-95 transition-transform shadow-sm">
                <Icon name="Dices" size={20} />
                <div className="flex gap-1">{luckyNumbers.map((n,i)=><span key={i} className="text-xs font-black w-6 h-6 bg-white border border-amber-200 rounded flex items-center justify-center">{n||'?'}</span>)}</div>
              </button>
            </div>
          </div>
        )}
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-8">
        {activeTab === 'map' && <ProgressMap level={currentLevel} progress={points%200} examDate={examDate} setExamDate={setExamDate} levelDates={levelDates} addPoints={addPoints} />}
        {activeTab === 'syllabus' && <Syllabus topics={topics} setTopics={setTopics} addPoints={addPoints} onOpenModal={setSelectedTopicModal} />}
        {activeTab === 'planning' && <PlanningHub planning={planning} setPlanning={setPlanning} units={units} setUnits={setUnits} addPoints={addPoints} />}
        {activeTab === 'practico' && <PracticoView skills={skills} setSkills={setSkills} addPoints={addPoints} sessions={practicoSessions} setSessions={setPracticoSessions} />}
        {activeTab === 'flashcards' && !examDeck && !activeDeckId && <FlashcardsManager decks={decks} setDecks={setDecks} onSelect={setActiveDeckId} onExam={setExamDeck} />}
        {activeTab === 'flashcards' && (activeDeckId || examDeck) && <DeckStudyView deck={examDeck || decks.find(d=>d.id.toString()===activeDeckId)} onBack={()=>{setActiveDeckId(null); setExamDeck(null);}} addPoints={addPoints} />}
        {activeTab === 'todo' && <TodoView todos={todos} setTodos={setTodos} addPoints={addPoints} />}
        {activeTab === 'notes' && <NotesView notes={notes} setNotes={setNotes} />}
        {activeTab === 'badges' && <BadgesView badges={BADGES} maxStreak={maxStreak} />}
        {activeTab === 'stats' && <StatsView actionLogs={actionLogs} undoAction={undoAction} topics={topics} />}
      </main>

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
// 4. VISTAS ESPECIALIZADAS
// ==========================================
function Syllabus({ topics, setTopics, addPoints, onOpenModal }) {
  const [search, setSearch] = useState("");
  const updateField = (id, field, value, pts) => {
    setTopics(prev => prev.map(t => {
      if (t.id === id) {
        if (pts && value) {
          addPoints(pts, `Tema ${id}: ${field}`, { entity: 'topic', id, field, prevValue: t[field] });
        }
        let updated = { ...t, [field]: value };
        if (field === 'finished' && value === true) updated.discarded = false;
        if (field === 'discarded' && value === true) updated.finished = false;
        return updated;
      }
      return t;
    }));
  };

  const displayList = [...topics]
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || t.id.toString().includes(search))
    .sort((a, b) => {
      if (a.discarded !== b.discarded) return a.discarded ? 1 : -1;
      return a.id - b.id; 
    });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-black text-slate-900 bg-white/50 backdrop-blur inline-block px-4 py-2 rounded-2xl shadow-sm">Temario Oficial</h2>
        <div className="relative w-full sm:w-64">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Buscar tema..." value={search} onChange={e=>setSearch(e.target.value)} className="w-full bg-white border-2 border-slate-100 rounded-2xl pl-10 pr-4 py-2 text-sm font-black outline-none focus:border-emerald-200 shadow-sm" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayList.map(t => {
          const blk = getTopicBlock(t.id);
          let cardStyle = "bg-white border-slate-100 shadow-sm";
          let textStyle = "text-slate-900";
          let badgeStyle = blk.badge;

          if (t.discarded) {
            cardStyle = "!bg-slate-200 opacity-60 grayscale scale-95 shadow-inner";
          } else if (t.finished) {
            cardStyle = `${blk.color} !border-transparent ring-4 ring-offset-2 ${blk.color.replace('!bg-','ring-')} shadow-2xl scale-[1.02]`;
            textStyle = "!text-white";
            badgeStyle = "!bg-white/20 !border-transparent !text-white shadow-sm";
          }

          return (
            <div key={t.id} className={`bento-card p-5 border-2 transition-all duration-300 ${cardStyle}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div 
                    onClick={() => onOpenModal(t)}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl border-2 cursor-pointer active:scale-90 transition-transform ${badgeStyle}`}
                  >
                    {t.id}
                  </div>
                  <div className="text-left leading-tight flex-1">
                    <p className={`text-[10px] font-black uppercase opacity-80 tracking-widest ${textStyle}`}>{blk.name}</p>
                    <p className={`text-sm font-black line-clamp-1 ${textStyle}`}>{t.title}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={()=>updateField(t.id,'finished',!t.finished)} className={`p-2 rounded-lg transition-all active:scale-90 ${t.finished ? '!text-slate-900 !bg-white shadow-md' : 'text-slate-300 bg-slate-50 hover:bg-slate-100'}`} title="Cerrar tema (Celebrar)"><Icon name="Lock" size={18}/></button>
                  <button onClick={()=>updateField(t.id,'discarded',!t.discarded)} className={`p-2 rounded-lg transition-all active:scale-90 ${t.discarded ? '!text-slate-600 !bg-slate-300 shadow-inner' : (t.finished ? '!text-white !bg-black/20' : 'text-slate-300 bg-slate-50 hover:bg-slate-100')}`} title="Descartar tema (Mover al final)"><Icon name="Archive" size={18}/></button>
                </div>
              </div>
              <div className={`flex justify-center gap-2 mb-4 py-2 rounded-xl border transition-colors ${t.finished ? '!bg-black/20 !border-transparent' : 'bg-slate-50 border-slate-100 shadow-inner'}`}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} onClick={() => updateField(t.id, 'stars', star)} className="active:scale-125 transition-transform"><Icon name="Star" size={20} className={`transition-all ${t.stars >= star ? 'fill-yellow-400 text-yellow-400 scale-110 shadow-sm' : (t.finished ? 'text-white/30' : 'text-slate-200')}`} /></button>
                ))}
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => updateField(t.id, 'redactado', !t.redactado, t.redactado ? 0 : 15)} className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all active:scale-95 ${t.redactado ? (t.finished ? '!bg-white !text-slate-900 !border-transparent' : 'bg-amber-500 text-white border-transparent shadow-md') : (t.finished ? '!bg-black/20 !text-white !border-transparent' : 'bg-white text-slate-400 border-slate-50 shadow-sm')}`}>REDAC.</button>
                  <button onClick={() => updateField(t.id, 'estudiado', !t.estudiado, t.estudiado ? 0 : 25)} className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all active:scale-95 ${t.estudiado ? (t.finished ? '!bg-white !text-slate-900 !border-transparent' : 'bg-orange-600 text-white border-transparent shadow-md') : (t.finished ? '!bg-black/20 !text-white !border-transparent' : 'bg-white text-slate-400 border-slate-50 shadow-sm')}`}>ESTUD.</button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Counter label="REPASOS" count={Number(t.reviews || 0)} onAdd={() => updateField(t.id, 'reviews', Number(t.reviews || 0) + 1, 10)} color={t.finished ? "!text-white" : "text-emerald-600"} finished={t.finished} />
                  <Counter label="SIMULAC." count={Number(t.mocks || 0)} onAdd={() => updateField(t.id, 'mocks', Number(t.mocks || 0) + 1, 40)} color={t.finished ? "!text-white" : "text-rose-600"} finished={t.finished} />
                  <Counter label="MINI SIM." count={Number(t.miniMocks || 0)} onAdd={() => updateField(t.id, 'miniMocks', Number(t.miniMocks || 0) + 1, 20)} color={t.finished ? "!text-white" : "text-sky-600"} finished={t.finished} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Counter({ label, count, onAdd, color, finished }) {
  return (
    <div className={`flex flex-col items-center p-2 rounded-xl border transition-colors ${finished ? '!bg-black/20 !border-transparent shadow-sm' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
      <p className={`text-[7px] font-black uppercase opacity-80 mb-1 leading-none ${finished ? '!text-white/80' : 'text-slate-400'}`}>{label}</p>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-black ${color}`}>{count}</span>
        <button onClick={onAdd} className={`w-5 h-5 rounded flex items-center justify-center text-xs font-black shadow-sm active:scale-90 transition-transform ${finished ? 'bg-white/20 text-white border border-white/30 hover:bg-white/30' : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-600'}`}>+</button>
      </div>
    </div>
  );
}

function PlanningHub({ planning, setPlanning, units, setUnits, addPoints }) {
  const upd = (id, list, setter, field, nv, pts) => setter(list.map(i => { 
    if(i.id===id){ 
      if(pts) addPoints(pts, i.title, { entity: 'planning', id: i.id, field, prevValue: i[field] }); 
      return {...i, [field]: nv};
    } 
    return i; 
  }));
  return (
    <div className="space-y-6 text-left">
      <h2 className="text-2xl font-black text-slate-950 bg-white/50 backdrop-blur inline-block px-4 py-2 rounded-2xl shadow-sm border border-white/50">Programación y UDs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...planning, ...units].map(item => (
          <div key={item.id} className="bento-card bg-white p-5 border-teal-50 shadow-sm transition-all hover:border-teal-100">
            <div className="flex justify-between items-center mb-3 text-left">
              <EditableTitle value={item.title} onSave={(nv)=>upd(item.id, item.id.startsWith('p')?planning:units, item.id.startsWith('p')?setPlanning:setUnits, 'title', nv)} className="text-sm font-black pr-4 leading-tight text-slate-900" />
              <button onClick={()=>{const ns = (item.status+1)%6; upd(item.id, item.id.startsWith('p')?planning:units, item.id.startsWith('p')?setPlanning:setUnits, 'status', ns, ns>item.status?15:0);}} className={`px-3 py-1.5 rounded-xl text-[9px] font-black border-2 transition-all shrink-0 ${item.status===5 ? 'bg-teal-600 text-white border-transparent shadow-md' : 'bg-white border-teal-50 text-teal-600 hover:bg-teal-50 shadow-sm'}`}>{PLANNING_STATUS[item.status]}</button>
            </div>
            <div className="flex gap-1 h-2">{Array.from({length:6}).map((_,i)=><div key={i} className={`flex-1 rounded-full transition-colors ${i<=item.status?'bg-teal-500 shadow-sm':'bg-slate-100'}`} />)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PracticoView({ skills, setSkills, addPoints, sessions, setSessions }) {
  const [newSkill, setNewSkill] = useState("");
  const handleAddSkill = (e) => { e.preventDefault(); if(newSkill.trim()) { setSkills([...skills, { id: Date.now().toString(), label: newSkill.trim(), level: 0 }]); setNewSkill(""); } };
  const updateSkillLabel = (id, newLabel) => { setSkills(skills.map(s => s.id === id ? { ...s, label: newLabel } : s)); };

  return (
    <div className="space-y-6 text-left">
      <h2 className="text-2xl font-black text-slate-950 bg-white/50 backdrop-blur inline-block px-4 py-2 rounded-2xl shadow-sm border border-white/50">Examen Práctico</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bento-card bg-white p-6 space-y-6 border-indigo-50 shadow-md">
          <form onSubmit={handleAddSkill} className="flex gap-2 mb-4"><input placeholder="Nueva habilidad..." value={newSkill} onChange={e => setNewSkill(e.target.value)} className="flex-1 bg-slate-50 rounded-xl px-3 py-2 text-xs font-black outline-none border-2 border-transparent focus:border-indigo-200" /><button type="submit" className="bg-indigo-600 text-white p-2 rounded-xl shadow-md active:scale-95 transition-transform"><Icon name="Plus" size={18}/></button></form>
          {skills.length === 0 && <p className="text-xs text-slate-400 font-bold italic text-center py-4">No hay habilidades. ¡Añade una!</p>}
          {skills.map(s => (
            <div key={s.id} className="space-y-2 text-left">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500"><EditableTitle value={s.label} onSave={(nv) => updateSkillLabel(s.id, nv)} className="flex-1 mr-2 leading-tight" /><div className="flex gap-1 shrink-0"><button onClick={() => { if(s.level > 0) { setSkills(prev => prev.map(ps => ps.id === s.id ? { ...ps, level: ps.level - 1 } : ps)); addPoints(-25, "Ajuste: " + s.label, { entity: 'skill', id: s.id, prevValue: s.level }); } }} className="w-6 h-6 bg-slate-50 text-slate-400 rounded-lg shadow-sm hover:bg-slate-100 transition-colors font-black flex items-center justify-center active:scale-90">-</button><button onClick={() => { if(s.level < 10) { setSkills(prev => prev.map(ps => ps.id === s.id ? { ...ps, level: ps.level + 1 } : ps)); addPoints(25, s.label, { entity: 'skill', id: s.id, prevValue: s.level }); } }} className="w-6 h-6 bg-indigo-50 text-indigo-600 rounded-lg shadow-sm hover:bg-indigo-100 transition-colors font-black flex items-center justify-center active:scale-90">+</button></div></div>
              <div className="h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200"><div className="h-full bg-indigo-500 transition-all duration-700 shadow-sm" style={{ width: `${s.level * 10}%` }} /></div>
            </div>
          ))}
        </div>
        <div className="bento-card bg-white p-8 text-center flex flex-col justify-center items-center gap-4 border-indigo-100 shadow-lg">
          <p className="text-6xl font-black text-indigo-600 tabular-nums leading-none tracking-tighter">{sessions}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">Supuestos Realizados</p>
          <div className="flex gap-2 w-full mt-2"><button onClick={() => { if(sessions > 0) { setSessions(s => s - 1); addPoints(-25, "Ajuste Supuesto", { entity: 'practico_sessions', prevValue: sessions }); } }} className="w-16 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black shadow-inner active:scale-95 transition-all hover:bg-slate-200">-</button><button onClick={() => { setSessions(s => s + 1); addPoints(25, "Supuesto Realizado", { entity: 'practico_sessions', prevValue: sessions }); }} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 active:scale-95 transition-all hover:bg-indigo-700">REGISTRAR (+25 PTS)</button></div>
        </div>
      </div>
    </div>
  );
}

function FlashcardsManager({ decks, setDecks, onSelect, onExam }) {
  const [open, setOpen] = useState(false);
  const [txt, setTxt] = useState("");
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [shuffledId, setShuffledId] = useState(null);

  const startExamMode = () => { const allCards = decks.flatMap(d => d.cards.map(c => ({...c, deckName: d.name}))); if (allCards.length === 0) return alert("¡Sin tarjetas!"); onExam({ id: 'exam-mode', name: 'EXAMEN TOTAL', cards: allCards.sort(() => Math.random() - 0.5) }); };
  
  const saveDeck = () => { 
    if(txt.includes(':') && name){
      const cards = txt.split('\n').filter(l=>l.includes(':')).map(l=>{const [q,a]=l.split(':'); return {q:q.trim(),a:a.trim(),id:Math.random().toString(36)};}); 
      if (editingId) {
        setDecks(decks.map(d => d.id === editingId ? { ...d, name, cards } : d));
      } else {
        setDecks([{id:Date.now().toString(), name, cards}, ...decks]);
      }
      setOpen(false); setName(""); setTxt(""); setEditingId(null);
    } 
  };

  const loadForEdit = (deck) => {
    setName(deck.name);
    setTxt(deck.cards.map(c => `${c.q} : ${c.a}`).join('\n'));
    setEditingId(deck.id);
    setOpen(true);
  };

  const shuffleDeck = (id) => {
    setDecks(prev => prev.map(d => {
      if(d.id === id) {
        return { ...d, cards: [...d.cards].sort(() => Math.random() - 0.5) };
      }
      return d;
    }));
    setShuffledId(id);
    setTimeout(() => setShuffledId(null), 1000);
  };
  
  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-center bg-white/50 backdrop-blur px-4 py-2 rounded-2xl shadow-sm border border-white/50">
        <h2 className="text-2xl font-black text-rose-950">Flashcards</h2>
        <button onClick={startExamMode} className="p-3 bg-rose-100 text-rose-700 rounded-xl font-black text-[10px] flex items-center gap-2 border border-rose-200 active:scale-95 transition-all shadow-sm">
          <Icon name="Zap" size={14} className="fill-rose-700"/> MODO EXAMEN
        </button>
      </div>
      
      <button onClick={()=>{setOpen(!open); setEditingId(null); setName(""); setTxt("");}} className="w-full p-4 bg-rose-600 text-white rounded-2xl font-black shadow-lg shadow-rose-100 active:scale-95 transition-all">
        {editingId ? 'EDITANDO MAZO' : 'NUEVO MAZO'}
      </button>

      {open && (
        <div className="bento-card p-6 border-rose-100 space-y-4 shadow-xl animate-in zoom-in-95 bg-white">
          <input placeholder="Nombre del mazo..." value={name} onChange={e=>setName(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl font-black outline-none border-2 border-transparent focus:border-rose-200 shadow-inner" />
          <textarea placeholder="Pregunta : Respuesta (Una por línea)" value={txt} onChange={e=>setTxt(e.target.value)} className="w-full h-32 bg-slate-50 p-3 rounded-xl font-black outline-none resize-none border-2 border-transparent focus:border-rose-200 shadow-inner" />
          <button onClick={saveDeck} className="w-full p-3 bg-rose-600 text-white rounded-xl font-black shadow-md uppercase">
            {editingId ? 'Guardar Cambios' : 'Guardar Nuevo Mazo'}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {decks.map(d=>(
          <div key={d.id} onClick={()=>onSelect(d.id.toString())} className="bento-card bg-white p-5 flex justify-between items-center cursor-pointer hover:border-rose-300 transition-all shadow-sm group">
            <div>
              <p className="font-black text-left text-slate-800 leading-tight">{d.name}</p>
              <p className="text-[9px] text-rose-400 font-black uppercase tracking-widest mt-1 flex items-center gap-2">
                {d.cards.length} tarjetas 
                {shuffledId === d.id && <Icon name="Shuffle" size={10} className="animate-bounce" />}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={(e)=>{e.stopPropagation(); shuffleDeck(d.id)}} className="text-slate-300 hover:text-rose-500 transition-colors p-1" title="Mezclar tarjetas"><Icon name="Shuffle" size={18}/></button>
              <button onClick={(e)=>{e.stopPropagation(); loadForEdit(d)}} className="text-slate-300 hover:text-emerald-500 transition-colors p-1" title="Editar mazo"><Icon name="Edit" size={18}/></button>
              <button onClick={(e)=>{e.stopPropagation(); setDecks(decks.filter(x=>x.id.toString()!==d.id.toString()))}} className="text-slate-300 hover:text-red-500 transition-colors p-1" title="Borrar mazo"><Icon name="Trash2" size={18}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DeckStudyView({ deck, onBack, addPoints }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = deck?.cards[idx];
  if(!card) return null;
  return (
    <div className="max-w-xl mx-auto py-10 space-y-8 text-left"><button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-rose-600 transition-all"><Icon name="ChevronRight" className="rotate-180" size={16}/> Volver a Biblioteca</button><div className="h-80 w-full relative" style={{ perspective: '1000px' }} onClick={()=>{if(!flipped) addPoints(2,"Flashcard"); setFlipped(!flipped);}}><div className={`relative w-full h-full transition-transform duration-500 rounded-[40px] shadow-2xl cursor-pointer ${flipped ? '[transform:rotateY(180deg)]' : ''}`} style={{ transformStyle: 'preserve-3d' }}><div className="absolute inset-0 bg-white border-8 border-rose-50 rounded-[40px] flex flex-col items-center justify-center p-10 text-center [backface-visibility:hidden] shadow-inner">{card?.deckName && <span className="absolute top-6 px-3 py-1 bg-rose-50 text-rose-500 text-[8px] font-black rounded-full uppercase border border-rose-100">{card.deckName}</span>}<p className="text-2xl font-black text-slate-800">{card?.q}</p></div><div className="absolute inset-0 bg-rose-600 text-white rounded-[40px] flex items-center justify-center p-10 text-center [transform:rotateY(180deg)] [backface-visibility:hidden] shadow-xl shadow-rose-200"><p className="text-xl font-medium italic">{card?.a}</p></div></div></div><div className="flex gap-4"><button onClick={()=>{setIdx(p=>Math.max(0,p-1)); setFlipped(false);}} className="flex-1 py-4 bg-white border-2 border-rose-100 rounded-2xl font-black text-rose-600 shadow-sm active:scale-95 transition-all" disabled={idx===0}>ANTERIOR</button><button onClick={()=>{setIdx(p=>Math.min(deck.cards.length-1,p+1)); setFlipped(false);}} className="flex-1 py-4 bg-rose-600 text-white rounded-2xl font-black shadow-xl shadow-rose-100 active:scale-95 transition-all" disabled={idx===deck.cards.length-1}>SIGUIENTE</button></div></div>
  );
}

function ProgressMap({ level, progress, examDate, setExamDate, levelDates, addPoints }) {
  const diff = new Date(examDate) - new Date();
  const days = Math.ceil(diff / (1000*60*60*24));
  const levelsToShow = [level + 2, level + 1, level, level - 1, level - 2].filter(l => l > 0);
  
  const [showDate, setShowDate] = useState(false);
  const [showPts, setShowPts] = useState(false);

  return (
    <div className="space-y-12 max-w-xl mx-auto py-8">
      <div className="grid grid-cols-2 gap-4">
        <div className="bento-card bg-white p-6 text-center border-emerald-100 shadow-sm flex flex-col justify-center items-center">
          <p onClick={() => setShowDate(!showDate)} className="text-4xl font-black text-emerald-950 tabular-nums cursor-pointer hover:scale-105 transition-transform">{days}</p>
          {showDate && <input type="date" value={examDate} onChange={e=>{setExamDate(e.target.value); setShowDate(false);}} className="mt-2 text-[10px] font-black bg-emerald-50 p-2 rounded-xl outline-none shadow-inner w-full text-center" />}
        </div>
        
        <div className="relative">
          <div onClick={() => setShowPts(!showPts)} className="bento-card bg-white p-6 flex flex-col justify-center items-center border-emerald-100 shadow-sm cursor-pointer hover:border-emerald-300 transition-colors h-full">
            <div className="flex justify-between items-end w-full mb-1">
              <span className="text-sm font-black text-emerald-600 uppercase tracking-tighter">Nivel Actual</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tabular-nums">{progress} / 200 PTS</span>
            </div>
            <div className="w-full h-3 bg-emerald-50 rounded-full mt-1 overflow-hidden shadow-inner">
              <div className="h-full bg-emerald-500 transition-all duration-1000 shadow-sm" style={{width:`${(progress/200)*100}%`}}/>
            </div>
          </div>
          
          {showPts && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-emerald-100 rounded-2xl p-3 shadow-2xl z-50 flex flex-col gap-2 animate-in zoom-in-95">
              <button onClick={(e) => { e.stopPropagation(); addPoints(10, '30 min de estudio'); setShowPts(false); }} className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl text-xs font-black uppercase shadow-sm active:scale-95 transition-transform">+30 MIN (10 PTS)</button>
              <button onClick={(e) => { e.stopPropagation(); addPoints(25, '1 hora de estudio'); setShowPts(false); }} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-xs font-black uppercase shadow-md active:scale-95 transition-transform">+1 HORA (25 PTS)</button>
              <button onClick={(e) => { e.stopPropagation(); addPoints(5, 'Puntos extra'); setShowPts(false); }} className="w-full bg-slate-50 text-slate-500 py-2 rounded-xl text-[10px] font-black uppercase active:scale-95 transition-transform">+5 EXTRA</button>
            </div>
          )}
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-16 relative"><div className="absolute top-0 bottom-0 w-2 bg-emerald-100/30 rounded-full -z-10" />{levelsToShow.map(l => (<div key={l} className={`map-bubble transition-all duration-500 ${l === level ? 'bg-white border-emerald-500 scale-125 z-10 shadow-emerald-200' : l < level ? 'bg-emerald-500 border-emerald-200 text-white shadow-sm' : 'bg-slate-50 border-slate-100 text-slate-300'}`}>{l === level && <Icon name="Turtle" size={20} className="absolute -top-10 text-emerald-600 animate-bounce" />}<span className="text-2xl font-black tabular-nums">{l}</span>{levelDates[l] && <span className={`text-[8px] font-black uppercase mt-1 ${l < level ? 'text-emerald-100' : 'text-emerald-500'}`}>{levelDates[l]}</span>}</div>))}</div>
    </div>
  );
}

function BadgesView({ badges, maxStreak }) {
  return (
    <div className="space-y-8 text-left"><div className="bento-card bg-white p-8 border-4 border-amber-50 text-center space-y-2 shadow-inner shadow-amber-50"><Icon name="Flame" size={48} className="fill-orange-500 text-orange-500 mx-auto" /><p className="text-5xl font-black text-slate-900 tabular-nums">{maxStreak}</p><p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest leading-none">Racha Histórica Máxima</p></div><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">{badges.map(b => (<div key={b.id} className={`bento-card bg-white p-6 flex flex-col items-center text-center transition-all ${b.cond ? 'bg-amber-50 border-amber-200 shadow-lg scale-105' : 'opacity-20 grayscale scale-95'}`}><span className="text-4xl mb-2">{b.icon}</span><p className="text-sm font-black text-slate-800 leading-tight mb-1">{b.title}</p><p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{b.desc}</p></div>))}</div></div>
  );
}

function NotesView({ notes, setNotes }) {
  const [txt, setTxt] = useState("");
  const [selColor, setSelColor] = useState(NOTE_COLORS[0]);
  const add = () => { if(txt.trim()){setNotes([{id:Date.now().toString(),text:txt,color:selColor,rot:Math.floor(Math.random()*6)-3}, ...notes]); setTxt(""); } };
  return (
    <div className="space-y-6 text-left"><div className="bento-card bg-white p-6 border-yellow-100 shadow-xl shadow-yellow-50"><textarea placeholder="Anota un concepto o idea..." value={txt} onChange={e=>setTxt(e.target.value)} className="w-full h-24 bg-transparent border-none font-bold outline-none resize-none text-slate-800" /><div className="flex justify-between items-center pt-4 border-t border-slate-50"><div className="flex gap-2">{NOTE_COLORS.map(c=>(<button key={c.id} onClick={()=>setSelColor(c)} className={`w-6 h-6 rounded-full border-2 transition-all ${c.bg} ${selColor.id===c.id ? 'border-slate-800 scale-125 shadow-md':'border-white hover:border-slate-200'}`} />))}</div><button onClick={add} className="px-6 py-2 bg-yellow-500 text-white rounded-xl font-black text-xs shadow-md active:scale-95 transition-transform">PINCHAR NOTA</button></div></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-6">{notes.map(n=>(<div key={n.id} style={{transform:`rotate(${n.rot}deg)`}} className={`relative p-5 aspect-square rounded shadow-lg border-t-[8px] ${n.color.bg} ${n.color.border} group transition-all hover:scale-105 shadow-yellow-100`}><Icon name="Pin" size={16} className={`absolute top-2 left-1/2 -translate-x-1/2 opacity-20 ${n.color.pin}`} /><p className={`text-[11px] font-black h-full ${n.color.text} text-left overflow-y-auto custom-scrollbar`}>{n.text}</p><button onClick={()=>setNotes(notes.filter(x=>x.id!==n.id))} className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all"><Icon name="Trash2" size={14}/></button></div>))}</div></div>
  );
}

function StatsView({ actionLogs, undoAction, topics }) {
  const [tab, setTab] = useState('hist');
  
  const stats = useMemo(() => {
    const useful = topics.filter(t => !t.discarded);
    const total = useful.length;
    const done = useful.filter(t => t.finished).length;
    const started = useful.filter(t => (t.redactado || t.estudiado) && !t.finished).length;
    const pending = total - done - started;
    return { total, done, started, pending, 
      donePct: Math.round((done/total)*100) || 0,
      startedPct: Math.round((started/total)*100) || 0,
      pendingPct: Math.round((pending/total)*100) || 0
    };
  }, [topics]);

  const groupLogs = (mode) => { const groups = {}; actionLogs.forEach(l => { const d = new Date(l.timestamp); const key = mode === 'week' ? `Semana ${Math.ceil(d.getDate()/7)} - ${d.toLocaleString('es-ES',{month:'short'})}` : d.toLocaleString('es-ES',{month:'long',year:'numeric'}); if(!groups[key]) groups[key] = { pts: 0, count: 0 }; groups[key].pts += l.amount; groups[key].count += 1; }); return Object.entries(groups).reverse(); };
  
  return (
    <div className="space-y-6 text-left">
      {/* GRÁFICO DE QUESITO */}
      <div className="bento-card bg-white p-8 border-violet-100 shadow-xl">
        <h3 className="text-center font-black text-slate-900 mb-6 uppercase tracking-widest text-sm">Progreso Real (Sin descartados)</h3>
        <div className="flex flex-col md:flex-row items-center justify-center gap-12">
          <div className="relative w-48 h-48 rounded-full shadow-inner border-8 border-slate-50 flex items-center justify-center" 
               style={{ background: `conic-gradient(#10b981 ${stats.donePct}%, #8b5cf6 ${stats.donePct}% ${stats.donePct + stats.startedPct}%, #f1f5f9 ${stats.donePct + stats.startedPct}% 100%)` }}>
            <div className="w-32 h-32 bg-white rounded-full shadow-2xl flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-slate-900">{stats.donePct}%</span>
              <span className="text-[8px] font-bold text-slate-400 uppercase">Completado</span>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-emerald-500 shadow-sm" /><div className="text-left leading-none"><p className="text-xs font-black text-slate-800">{stats.done} Terminados</p><p className="text-[10px] font-bold text-slate-400">Totalmente listos</p></div></div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-violet-500 shadow-sm" /><div className="text-left leading-none"><p className="text-xs font-black text-slate-800">{stats.started} En proceso</p><p className="text-[10px] font-bold text-slate-400">Redactando/Estudiando</p></div></div>
            <div className="flex items-center gap-3"><div className="w-4 h-4 rounded-full bg-slate-200 shadow-sm" /><div className="text-left leading-none"><p className="text-xs font-black text-slate-800">{stats.pending} Pendientes</p><p className="text-[10px] font-bold text-slate-400">Sin tocar aún</p></div></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center bg-white/50 backdrop-blur px-4 py-2 rounded-2xl overflow-x-auto shadow-sm border border-white/50">
        <h2 className="text-xl font-black text-violet-950">Historial</h2>
        <div className="flex bg-slate-200 p-1 rounded-xl shrink-0">{['hist','week','month'].map(t=>(<button key={t} onClick={()=>setTab(t)} className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase transition-all ${tab===t?'bg-white shadow-md text-violet-600':'text-slate-500'}`}>{t==='hist'?'Historial':t==='week'?'Semanas':'Meses'}</button>))}</div>
      </div>
      
      <div className="min-h-[400px]">{tab === 'hist' ? (<div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">{actionLogs.length === 0 ? <p className="italic text-slate-300 font-bold">No hay registros.</p> : actionLogs.slice(0,50).map(l=>(<div key={l.id} className="bento-card bg-white p-4 flex justify-between items-center border-violet-50 transition-all hover:border-violet-200 shadow-sm"><div className="text-left leading-tight"><p className="text-sm font-black text-slate-800">{l.description}</p><p className="text-[9px] font-bold text-slate-400 uppercase">{new Date(l.timestamp).toLocaleString()}</p></div><div className="flex items-center gap-3"><span className="text-xs font-black text-violet-700 bg-violet-50 px-2 py-1 rounded-lg shadow-inner">+{l.amount}</span><button onClick={()=>undoAction(l.id)} className="text-slate-300 hover:text-violet-600 transition-colors" title="Deshacer permanentemente"><Icon name="Undo2" size={18}/></button></div></div>))}</div>) : (<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{groupLogs(tab).map(([key, data]) => (<div key={key} className="bento-card bg-white p-6 border-violet-100 flex justify-between items-center shadow-md"><div className="text-left leading-tight"><p className="text-xs font-black text-violet-900 uppercase tracking-tighter">{key}</p><p className="text-[10px] font-bold text-slate-400">{data.count} acciones</p></div><div className="text-right"><p className="text-2xl font-black text-violet-600">+{data.pts}</p><p className="text-[8px] font-black opacity-40 uppercase tracking-widest">Puntos</p></div></div>))}</div>)}</div>
    </div>
  );
}

function TodoView({ todos, setTodos, addPoints }) {
  const [type, setType] = useState('goal');
  const [inp, setInp] = useState("");
  return (
    <div className="space-y-6 text-left"><div className="flex p-1 bg-slate-100 rounded-2xl shadow-inner"><button onClick={()=>setType('goal')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type==='goal'?'bg-white text-orange-600 shadow-md':'text-slate-400'}`}>OBJETIVOS</button><button onClick={()=>setType('review')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type==='review'?'bg-white text-orange-600 shadow-md':'text-slate-400'}`}>REPASOS</button></div><form onSubmit={(e)=>{e.preventDefault(); if(inp.trim()){setTodos([{id:Date.now().toString(),text:inp,completed:false,type}, ...todos]); setInp("");}}} className="flex gap-2"><input placeholder="Tarea..." value={inp} onChange={e=>setInp(e.target.value)} className="flex-1 bento-card bg-white px-4 py-3 text-sm font-black outline-none border-orange-50 focus:border-orange-200 shadow-sm" /><button type="submit" className="p-3 bg-orange-600 text-white rounded-xl shadow-lg shadow-orange-100 active:scale-95 transition-all"><Icon name="Plus" size={24}/></button></form><div className="space-y-3">{todos.filter(t=>t.type===type).map(t=>(<div key={t.id} className="bento-card bg-white p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all"><div className="flex items-center gap-3"><button onClick={()=>{setTodos(todos.map(pt=>pt.id===t.id?{...pt,completed:!pt.completed}:pt)); if(!t.completed) addPoints(5,t.text, { entity: 'todo', id: t.id, prevValue: t.completed });}} className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${t.completed?'bg-emerald-500 border-emerald-500 text-white shadow-sm':'border-orange-100 hover:border-orange-300'}`}>{t.completed && <Icon name="Check" size={16}/>}</button><span className={`text-sm font-black text-left transition-all ${t.completed?'line-through text-slate-300':'text-slate-700'}`}>{t.text}</span></div><button onClick={()=>setTodos(todos.filter(x=>x.id!==t.id))} className="text-slate-200 hover:text-red-500 transition-colors active:scale-90"><Icon name="Trash2" size={18}/></button></div>))}</div></div>
  );
}

function HeaderToolBtn({ active, icon, label, color, onClick }) {
  const c = active ? `bg-${color}-600 text-white shadow-lg` : `bg-${color}-50 text-${color}-600 border border-${color}-100 shadow-sm`;
  return <button onClick={onClick} className={`flex flex-col items-center gap-1 p-3 rounded-2xl transition-all active:scale-95 ${c}`}><Icon name={icon} size={20} /><span className="text-[8px] font-black uppercase tracking-widest leading-none mt-1">{label}</span></button>;
}
function NavBtn({ active, icon, label, color, onClick }) {
  const c = active ? `text-${color}-600 bg-${color}-50 shadow-inner` : 'text-slate-400';
  return <button onClick={onClick} className={`flex flex-col items-center gap-1 p-2 transition-all ${active?'scale-110':''}`}><div className={`p-2 rounded-xl ${c} transition-all shadow-sm`}><Icon name={icon} size={24} strokeWidth={active?3:2}/></div><span className={`text-[9px] font-black tracking-widest mt-1 ${active?`text-${color}-600`:'text-slate-400'}`}>{label}</span></button>;
}
function LoginScreen({ onLogin }) {
  const [c, setC] = useState("");
  return <div className="min-h-screen flex items-center justify-center bg-emerald-50 p-6 text-center"><div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-sm border-4 border-emerald-100"><Icon name="Turtle" size={80} className="text-emerald-500 mx-auto mb-6" /><h1 className="text-3xl font-black mb-2 tracking-tighter text-emerald-950">TurtleStudy</h1><input placeholder="Clave de sincronización..." value={c} onChange={e=>setC(e.target.value)} className="w-full p-4 bg-slate-50 rounded-2xl mb-4 text-center font-black outline-none border-2 border-transparent focus:border-emerald-200 transition-all shadow-inner" /><button onClick={()=>onLogin(c)} className="w-full py-5 bg-emerald-600 text-white rounded-[24px] font-black shadow-lg hover:bg-emerald-700 active:scale-95 transition-all shadow-emerald-100 uppercase tracking-tighter">Acceder al Mapa</button></div></div>;
}
function LoadingScreen() { return <div className="min-h-screen flex items-center justify-center bg-white"><Icon name="Turtle" className="text-emerald-500 animate-bounce" size={60} /></div>; }
