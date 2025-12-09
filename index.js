(function(){
  const dayOrder = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  function getUpcomingSunday(){
    const d = new Date();
    const day = d.getDay();
    const offset = day === 0 ? 0 : 7 - day;
    d.setDate(d.getDate() + offset);
    d.setHours(23,59,0,0);
    return d;
  }
  function getStoredCalendarEvents(){
    try{
      const raw = localStorage.getItem("planner-calendar-events");
      return raw ? JSON.parse(raw) : [];
    }catch(e){
      return [];
    }
  }
  const moodOptions = [
    { emoji: "😊", label: "Grateful" },
    { emoji: "😌", label: "Calm" },
    { emoji: "😴", label: "Tired" },
    { emoji: "😵", label: "Overwhelmed" },
    { emoji: "💪", label: "Confident" },
    { emoji: "🧘", label: "Centered" },
    { emoji: "🤪", label: "Playful" }
  ];
  const buttonSelector = "button, .tab";
  let dragPayload = null;
  let audioCtx = null;
  const confettiWrapper = document.getElementById("confetti-wrapper");
  const celebrationOverlay = document.getElementById("celebration-overlay");
  const celebrationTitle = document.getElementById("celebration-title");
  const celebrationText = document.getElementById("celebration-text");
  const celebrationClose = document.getElementById("celebration-close");
  const confettiColors = ["#a855f7","#f59e0b","#10b981","#3b82f6","#ec4899"];
  const fallbackClassEvents = [
    { title:"Knowledge Check: CompTIA Linux+ and LPIC-1 Pre-Assessment Quiz [25/FA CSC-121-OL01]", start:"2025-10-19T00:00:00.000Z", end:"2025-10-19T23:59:00.000Z", allDay:true, description:"Pre-assessment quiz for Linux+ and LPIC-1." },
    { title:"Lab 9-1: Digital Forensics Analysis and Validation [25/FA CIS-602-OL01]", start:"2025-10-19T00:00:00.000Z", end:"2025-10-19T23:59:00.000Z", allDay:true, description:"Digital forensics lab." },
    { title:"Linux Chapter One Discussion Post [25/FA CSC-121-OL01]", start:"2025-10-19T00:00:00.000Z", end:"2025-10-19T23:59:00.000Z", allDay:true, description:"Initial post Friday, replies Sunday." },
    { title:"Module 9 Discussion [25/FA CIS-602-OL01]", start:"2025-10-19T00:00:00.000Z", end:"2025-10-19T23:59:00.000Z", allDay:true, description:"Data-hiding techniques discussion." },
    { title:"Module 9 Quiz [25/FA CIS-602-OL01]", start:"2025-10-19T00:00:00.000Z", end:"2025-10-19T23:59:00.000Z", allDay:true, description:"Weekly module quiz." },
    { title:"Quiz: Chapter 01 Introduction to Linux [25/FA CSC-121-OL01]", start:"2025-10-19T00:00:00.000Z", end:"2025-10-19T23:59:00.000Z", allDay:true, description:"Linux chapter 1 quiz." },
    { title:"Simulation 1-1: Overview of Linux [25/FA CSC-121-OL01]", start:"2025-10-19T00:00:00.000Z", end:"2025-10-19T23:59:00.000Z", allDay:true, description:"Hands-on Linux simulation." }
  ];
  function ensureAudio(){
    if(audioCtx) return audioCtx;
    try{
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }catch(e){
      audioCtx = null;
    }
    return audioCtx;
  }
  function playClickTone(){
    const ctx = ensureAudio();
    if(!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(540, ctx.currentTime);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }
  function launchConfetti(){
    if(!confettiWrapper) return;
    const pieces = 24;
    for(let i=0;i<pieces;i++){
      const piece = document.createElement("span");
      piece.className = "confetti-piece";
      const delay = Math.random() * 0.4;
      const left = Math.random() * 100;
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      piece.style.left = `${left}%`;
      piece.style.background = color;
      piece.style.animationDuration = `${1.4 + Math.random()}s`;
      piece.style.animationDelay = `${delay}s`;
      confettiWrapper.append(piece);
      piece.addEventListener("animationend", ()=> piece.remove());
    }
  }
  // Hide the streak celebration overlay.
  function hideCelebration(){
    if(!celebrationOverlay) return;
    celebrationOverlay.classList.add("hidden");
  }
  // Show the streak celebration overlay with custom text.
  function showCelebration(title, text){
    if(!celebrationOverlay) return;
    if(celebrationTitle) celebrationTitle.textContent = title;
    if(celebrationText) celebrationText.textContent = text;
    celebrationOverlay.classList.remove("hidden");
    clearTimeout(celebrationTimer);
    celebrationTimer = setTimeout(()=> hideCelebration(), 3800);
    launchConfetti();
  }
  celebrationClose?.addEventListener("click", hideCelebration);
  celebrationOverlay?.addEventListener("click", e=>{ if(e.target === celebrationOverlay) hideCelebration(); });
  function animateButton(el){
    if(!el) return;
    el.classList.add("btn-press");
    setTimeout(()=>el.classList.remove("btn-press"),180);
  }
  document.addEventListener("click", evt=>{
    const btn = evt.target.closest(buttonSelector);
    if(!btn) return;
    animateButton(btn);
    playClickTone();
  });

  const sample = {
    Monday: [
      "1-4 AM: Discussion Posts (Pomodoro)",
      "1:00-1:25 Focus, 1:25-1:30 Jumping Jacks",
      "1:30-1:55 Focus, 1:55-2:00 Jumping Jacks",
      "2:00-2:25 Focus, 2:25-2:30 Jumping Jacks",
      "2:30-2:55 Focus, 2:55-3:25 BIG BREAK Walk/Stretch",
      "5-6 AM: Easier Essays",
      "6 AM: Wake, shower, breakfast",
      "7-9 AM: Finish Essays (Pomodoro cycles)",
      "9-12 PM: Polish Essays (Pomodoro cycles)",
      "12 PM: Lunch + Coursera",
      "1-5 PM: Quizzes/Labs/Assignments (Pomodoro w/ breaks)",
      "5-6 PM: Dinner",
      "6-7 PM: Labs/Simulations",
      "8-9:30 PM: Emails (7:30-9)",
      "9:30-11 PM: Essay writing",
      "11 PM: Sleep"
    ],
    Tuesday: [
      "6 AM: Wake, shower, breakfast",
      "7-9 AM: Chill Skills",
      "9-12 PM: Chill Skills",
      "12 PM: Lunch",
      "1-5 PM: Relax (Manga, Anime)",
      "5-6 PM: Dinner",
      "6-7 PM: Free",
      "7-8:30 PM: Emails (7:30-8)",
      "8:30-9 PM: Night Routine",
      "9-11 PM: Sleep"
    ],
    Wednesday: [
      "6 AM: Wake, shower, breakfast",
      "7-9 AM: Relax",
      "9-12 PM: Work",
      "12 PM: Lunch (Spanish/Japanese)",
      "1-5 PM: Work",
      "5-6 PM: Dinner + rehab stretch",
      "6-7 PM: Martial Arts",
      "7-8:30 PM: Gym (weights/conditioning)",
      "8:30-9 PM: Night Routine",
      "9-11 PM: Sleep"
    ],
    Thursday: [
      "6 AM: Wake, shower, breakfast",
      "7-9 AM: Polish Essays (Pomodoro)",
      "9-12 PM: Check assignments, finish",
      "12 PM: Lunch",
      "1-5 PM: Study Notes (Pomodoro cycles)",
      "5-6 PM: Dinner",
      "6-7 PM: Martial Arts",
      "7-8:30 PM: Gym (weights/conditioning)",
      "8:30-9 PM: Shower + Night Routine + Sleep",
      "9-11 PM: Sleep"
    ],
    Friday: [
      "6 AM: Wake, shower, breakfast",
      "7-9 AM: Reply to Posts (Pomodoro)",
      "9-12 PM: PC Support Labs & Quizzes (Pomodoro)",
      "12 PM: Lunch",
      "1-5 PM: Textbook Study (Pomodoro cycles)",
      "5-6 PM: Dinner",
      "6-7 PM: Gym (weights)",
      "7-8:30 PM: Jiu-Jitsu",
      "8:30-9 PM: Night Routine",
      "9-11 PM: Sleep"
    ],
    Saturday: [
      "6 AM: Wake, shower, breakfast",
      "7-9 AM: Me Time Skills",
      "9-12 PM: Textbook Studies (Pomodoro)",
      "12 PM: Lunch",
      "1-5 PM: Textbook Studies (Pomodoro cycles)",
      "5-6 PM: Dinner",
      "6-7 PM: Textbook Studies",
      "7-8:30 PM: Textbook Studies",
      "8:30-9 PM: Night Routine",
      "9-11 PM: Sleep"
    ],
    Sunday: [
      "6 AM: Wake, shower, breakfast",
      "7-9 AM: PC Textbook Studies (Pomodoro)",
      "12 PM: Lunch",
      "1-5 PM: PC Studies 1–2 + Rest",
      "5-6 PM: Dinner",
      "6-7 PM: Free",
      "7-8:30 PM: Plan next week",
      "8:30-9 PM: Night Routine",
      "9-11 PM: Sleep"
    ]
  };
  const HABIT_CATEGORIES = [
    { id: "study", label: "📚 Study/Work", emoji: "📚" },
    { id: "exercise", label: "🏋️ Exercise", emoji: "🏋️" },
    { id: "meals", label: "🍽 Meals", emoji: "🍽" },
    { id: "admin", label: "🌅 Morning/Admin", emoji: "🌅" },
    { id: "free", label: "🎉 Free/Breaks", emoji: "🎉" },
    { id: "night", label: "🌙 Night", emoji: "🌙" },
    { id: "none", label: "🔖 None", emoji: "🔖" },
  ];
  const defaultHabits = [
    { name: "Spanish/French", cat: "study" },
    { name: "Stretch", cat: "exercise" },
    { name: "Guitar/Violin", cat: "study" },
    { name: "Calligraphy/Shorthand", cat: "study" },
    { name: "Japanese", cat: "study" },
    { name: "Technique", cat: "study" },
    { name: "Sewing", cat: "study" },
    { name: "Coding", cat: "study" },
    { name: "Night routine", cat: "night" },
  ];
  const blankWeek = () => [false,false,false,false,false,false,false];
  const habitCatById = (id) => HABIT_CATEGORIES.find(c => c.id === id) || HABIT_CATEGORIES[HABIT_CATEGORIES.length-1];
  const habitCatFromLabel = (label="")=>{
    const lc = label.trim().toLowerCase();
    return HABIT_CATEGORIES.find(c=>c.id===lc || c.label.toLowerCase()===lc || c.emoji===label.trim()) || HABIT_CATEGORIES[HABIT_CATEGORIES.length-1];
  };
  const createHabitId = (name="habit")=>{
    const safe = String(name||"habit").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "habit";
    return `habit-${safe}-${Date.now().toString(36)}-${Math.floor(Math.random()*9000)+1000}`;
  };
  const normalizeHabit = (h={}) => ({
    id: h.id || createHabitId(h.name),
    name: h.name || "New habit",
    cat: habitCatById(h.cat || "none").id,
    days: Array.from({length:7}, (_,i)=> !!(h.days && h.days[i]))
  });
  const defaultRoadmap = [
    { id:"phase-goals", title:"Big Picture Calisthenics Goals", range:"Skill checklist", focus:["Front lever & back lever progressions","Full planche or strong straddle planche","90° hold + handstand pushups","One-arm pullup progressions","Maltese / Iron Cross basics","Human flag and static holds","Backflip and freestyle flow"], checkpoints:[] },
    { id:"phase-1", title:"Phase 1 - Foundation & Habit", range:"0-8 weeks", focus:["Everyday Warmup + Night Stretch most days","Strength 3x/week (chest/back, legs/abs/traps, arms/shoulder/wrist)","Skill practice 4-6x/week with low volume quality reps","Fix wrist/shoulder issues before pushing difficulty"], checkpoints:["30-60s comfortable wall handstand","8-10 clean dips and pullups","Controlled dragon flag negatives to halfway","No persistent wrist/shoulder pain for 2-3 weeks"] },
    { id:"phase-2", title:"Phase 2 - Skill Families", range:"2-6 months", focus:["Pull skills on Mon + Fri","Push skills on Tue + Fri","Inversions/handstands on Wed + Thu","Protect technique by keeping fatigue low"], checkpoints:["5-10s tuck front/back lever holds","5-10s freestanding handstand","Controlled jump to backbend or flip progression"] },
    { id:"phase-3", title:"Phase 3 - Peak Skills & Freestyle", range:"6-18+ months", focus:["Test lever/planche holds weekly and film form","Build handstand pushups + one-arm pullups","Lock in safe backflip on proper surface","Keep heavy Saturday strength high"], checkpoints:["3-5s straddle front/back lever","3-5s straddle planche or strong pseudo planche pushups","Consistent backflip","Weighted pullups trending toward one-arm pullup","Visible recovery plan and film-ready form"] }
  ];
  const defaultSkills = [
    { id:"planche", title:"Planche", stages:["Tuck","Advanced Tuck","Straddle","Full"], level:0 },
    { id:"lever", title:"Front Lever", stages:["Tuck","Advanced Tuck","One-leg","Straddle","Full"], level:0 },
    { id:"handstand", title:"Handstand", stages:["Wall hold","Wall away","Freestanding 5s","Freestanding 20s"], level:0 },
    { id:"pistol", title:"Pistol Squat", stages:["Assisted","Box","Full bodyweight","Weighted"], level:0 }
  ];

  // storage detection
  const hasStorage = (()=>{ try { const k="__t"; localStorage.setItem(k,"1"); localStorage.removeItem(k); return true; } catch(e){ return false; } })();
  const S_KEY="planner_v3_data"; const M_KEY="planner_v3_mood"; const E_KEY="planner_v3_edit";
  const J_KEY="planner_v3_journal"; const NOTES_KEY="planner_v3_notes";
  const WORKOUT_KEY="planner_v3_workout"; const ROADMAP_KEY="planner_v3_roadmap"; const SKILL_KEY="planner_v3_skills"; const COACH_KEY="planner_v3_coach";
  const HABIT_HISTORY_KEY="planner_v3_habit_history"; const HABIT_HISTORY_RETENTION_DAYS=180;
  const STREAK_FREEZE_KEY="planner_v3_streak_freeze"; const STREAK_FREEZE_COST=50;
  const INTEGRATION_KEY="planner_v3_integrations";
  const REFLECTION_KEY="planner_v3_reflection";
  const DANGER_BOSS_KEY="planner_danger_boss_done";
  const BOSS_REWARD_KEY="planner_boss_reward";
  const BRIEF_KEY="planner_brief_log";
  const BRIEF_PREF_KEY="planner_brief_prefs";
  const REPLIES_KEY="planner_discussion_replies";
  const STABILITY_KEY="planner_stability_state";
  const STABILITY_PREF_KEY="planner_stability_prefs";
  const CAL_KEY="planner-calendar-events";
  const DAILY_STREAK_KEY="planner_v3_daily_streak";
  const DAILY_STREAK_REWARD=15;
  const startOfWeek = (date)=>{
    const d = new Date(date);
    const day = d.getDay(); // 0=Sun, 1=Mon
    const diff = day === 0 ? 6 : day - 1; // shift so Monday is start
    d.setDate(d.getDate() - diff);
    d.setHours(0,0,0,0);
    return d;
  };
  const normalizeTitle = (t)=>{
    const strip = (s)=> {
      if(!s) return "";
      const trimmed = String(s).trim();
      if(/^\[object\s.*\]$/i.test(trimmed)) return "";
      return trimmed;
    };
    if(typeof t === "string") return strip(t);
    if(t && typeof t === "object"){
      if(typeof t.textContent === "string" && t.textContent.trim()) return strip(t.textContent);
      if(typeof t.innerText === "string" && t.innerText.trim()) return strip(t.innerText);
      return "";
    }
    return strip(t);
  };
  let currentWeek = startOfWeek(new Date());
  let plannerViewMode = "week";
  let classTermFilter = "all";
  let classCourses = [];
  let selectedCourseId = null;
  let isRenderingPlanner = false; // prevent nested renders triggered by event saves
  const RPG_KEY="planner_v3_rpg";
  const MOOD_STATE_KEY="planner_v3_mood_energy";
  const DEFAULT_ASSIGNMENT_WINDOW_DAYS = 10;
  const rpgTitles = [
    { level:1, title:"Notebook Novice" },
    { level:2, title:"Keyboard Cadet" },
    { level:3, title:"Hash Function Wizard" },
    { level:4, title:"Cache Scout" },
    { level:5, title:"Forensics Gremlin" },
    { level:6, title:"Stack Explorer" },
    { level:7, title:"Pomodoro Demon" },
    { level:8, title:"Packet Mapper" },
    { level:9, title:"Terminal Tinkerer" },
    { level:10, title:"Week 10 Scholar" },
    { level:11, title:"Kernel Conjurer" },
    { level:12, title:"Systems Sage" },
    { level:13, title:"API Wrangler" },
    { level:14, title:"Breakpoint Sleuth" },
    { level:15, title:"Cipher Runner" },
    { level:16, title:"Query Alchemist" },
    { level:17, title:"Sprint Sprinter" },
    { level:18, title:"Memory Mapper" },
    { level:19, title:"Parallel Planner" },
    { level:20, title:"Latency Slayer" },
    { level:21, title:"Thread Whisperer" },
    { level:22, title:"Schedule Samurai" },
    { level:23, title:"Repo Ranger" },
    { level:24, title:"Branch Bard" },
    { level:25, title:"Sync Sorcerer" },
    { level:26, title:"Buildsmith" },
    { level:27, title:"Deadline Duelist" },
    { level:28, title:"Task Cartographer" },
    { level:29, title:"Cron Captain" },
    { level:30, title:"Focus Vanguard" },
    { level:31, title:"Heuristic Hunter" },
    { level:32, title:"Feature Forger" },
    { level:33, title:"Regression Guard" },
    { level:34, title:"Dataset Diver" },
    { level:35, title:"Signal Spotter" },
    { level:36, title:"Protocol Paladin" },
    { level:37, title:"Uptime Guardian" },
    { level:38, title:"Latent Lorekeeper" },
    { level:39, title:"Insight Illuminator" },
    { level:40, title:"Habit Herald" },
    { level:41, title:"Routine Ronin" },
    { level:42, title:"Study Strategist" },
    { level:43, title:"Iteration Illusionist" },
    { level:44, title:"Velocity Virtuoso" },
    { level:45, title:"Domain Dreamer" },
    { level:46, title:"Arcane Architect" },
    { level:47, title:"Blueprint Baron" },
    { level:48, title:"Cognitive Captain" },
    { level:49, title:"Execution Envoy" },
    { level:50, title:"Priorities Pharaoh" },
    { level:51, title:"Flowstate Finder" },
    { level:52, title:"Resilience Ranger" },
    { level:53, title:"Tempo Tactician" },
    { level:54, title:"Context Commander" },
    { level:55, title:"Milestone Mystic" },
    { level:56, title:"Scope Sentinel" },
    { level:57, title:"Boundary Breaker" },
    { level:58, title:"Deep Work Druid" },
    { level:59, title:"Academic Arcanist" },
    { level:60, title:"Planning Paragon" },
    { level:61, title:"Feedback Falcon" },
    { level:62, title:"Signal Scribe" },
    { level:63, title:"Alignment Adept" },
    { level:64, title:"Momentum Marshal" },
    { level:65, title:"Reliability Regent" },
    { level:66, title:"Review Raconteur" },
    { level:67, title:"Energy Engineer" },
    { level:68, title:"Stability Steward" },
    { level:69, title:"Precision Paladin" },
    { level:70, title:"Insight Inquisitor" },
    { level:71, title:"Delivery Dragon" },
    { level:72, title:"Triage Titan" },
    { level:73, title:"Outcome Oracle" },
    { level:74, title:"Craft Conductor" },
    { level:75, title:"Sprint Sage" },
    { level:76, title:"Ritual Regent" },
    { level:77, title:"Focused Firebrand" },
    { level:78, title:"Cadence Conjurer" },
    { level:79, title:"Schedule Sage Supreme" },
    { level:80, title:"Strategy Seer" },
    { level:81, title:"Timeline Tactician" },
    { level:82, title:"Resilience Revenant" },
    { level:83, title:"Productivity Paladin" },
    { level:84, title:"Systematic Seeker" },
    { level:85, title:"Efficiency Envoy" },
    { level:86, title:"Clarity Champion" },
    { level:87, title:"Apex Planner" },
    { level:88, title:"Summit Scholar" },
    { level:89, title:"Pinnacle Pathfinder" },
    { level:90, title:"Zenith Zealot" },
    { level:91, title:"Aurora Analyst" },
    { level:92, title:"Nebula Navigator" },
    { level:93, title:"Galaxy Guardian" },
    { level:94, title:"Cosmos Cartographer" },
    { level:95, title:"Quantum Quartermaster" },
    { level:96, title:"Stellar Strategist" },
    { level:97, title:"Nova Nomad" },
    { level:98, title:"Eclipse Executor" },
    { level:99, title:"Horizon Herald" },
    { level:100, title:"Ascendant Architect" }
  ];
  const storyStages = [
    { name:"Boot Camp Operative", desc:"HQ just pulled you into the cyber-forensics division. Run drills and keep your scanners sharp." },
    { name:"Signal Tracer", desc:"You're tracing hostile packets across campus networks. Every checklist gives you new fingerprints." },
    { name:"Forensics Detective", desc:"Advanced cases land on your desk. Triage evidence and stay ahead of the breach." },
    { name:"Incident Commander", desc:"You're coordinating takedowns. Keep the intel synced and the team briefed." },
    { name:"Cyber Guardian", desc:"You run the entire task force. Keep the whole board green to unlock the next saga." }
  ];
  const integrationScripts = {
    newTab: "Set your browser's new-tab page to show the task list so idle browsing triggers a mini review.",
    calendar: "Automate .ics exports on Sunday so every device calendar mirrors this planner.",
    voice: "Create a voice shortcut like “start focus timer” that launches Pomodoro hands-free.",
    email: "Schedule a 7am email summary with your top three priorities to start the day aligned.",
    widget: "Add a home-screen widget that shows habit streaks; it keeps you accountable the moment you unlock your phone."
  };
  const reflectionPrompts = [
    "What did you handle this week that would've derailed you last month?",
    "Where did you feel the most focused flow, and what triggered it?",
    "What friction showed up repeatedly? How can next week's plan reduce it?",
    "How did your energy trend across the week compared to your expectations?",
    "Which habit win are you proudest of and why?"
  ];
  function xpForLevel(level){
    return 100 + (level-1)*80;
  }
  function parseICSFeed(raw=""){
    const text = String(raw||"");
    if(!text.includes("BEGIN:VEVENT")) return [];
    const blocks = text.split(/BEGIN:VEVENT/).slice(1).map(b=>"BEGIN:VEVENT"+b.split(/END:VEVENT/)[0]+"END:VEVENT");
    const events = [];
    blocks.forEach(block=>{
      const lines = block.split(/\r?\n/).filter(Boolean);
      let start = null;
      let summary = "";
      let description = "";
      let url = "";
      lines.forEach(line=>{
        if(line.startsWith("DTSTART")){
          const val = line.split(":").slice(1).join(":").trim();
          const clean = val.replace(/[^0-9T]/g,"").replace("T","");
          if(clean.length>=8){
            const y = +clean.slice(0,4), m=+clean.slice(4,6)-1, d=+clean.slice(6,8);
            start = new Date(y,m,d,0,0,0,0).toISOString();
          }
        } else if(line.startsWith("SUMMARY")){
          summary = line.split(":").slice(1).join(":").trim();
        } else if(line.startsWith("DESCRIPTION")){
          description = line.split(":").slice(1).join(":").trim();
        } else if(line.startsWith("URL")){
          url = line.split(":").slice(1).join(":").trim();
        }
      });
      if(start && summary){
        events.push({
          start,
          end: start,
          allDay: true,
          title: summary,
          description,
          url
        });
      }
    });
    return events;
  }

  function loadEvents(){
    const sanitize = (list)=>{
      const cleaned = [];
      let changed = false;
      (Array.isArray(list) ? list : []).forEach(ev=>{
        if(!ev || typeof ev !== "object") { changed = true; return; }
        const title = normalizeTitle(ev.title || "");
        if(!title || /^\[object\s/i.test(title)) { changed = true; return; }
        const start = new Date(ev.start);
        if(isNaN(start)) { changed = true; return; }
        const end = ev.end ? new Date(ev.end) : null;
        cleaned.push({
          start: start.toISOString(),
          end: end && !isNaN(end) ? end.toISOString() : start.toISOString(),
          allDay: !!ev.allDay,
          title,
          description: normalizeTitle(ev.description || ""),
          url: typeof ev.url === "string" ? ev.url : ""
        });
      });
      return { cleaned, changed };
    };
    try{
      const raw = localStorage.getItem(CAL_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      const { cleaned, changed } = sanitize(parsed);
      if(changed){
        try{ localStorage.setItem(CAL_KEY, JSON.stringify(cleaned)); }catch(e){}
      }
      return cleaned;
    }catch(e){
      return [];
    }
  }

  function saveEvents(evts){
    try{
      const cleaned = Array.isArray(evts) ? evts.map(ev=>({
        start: ev.start,
        end: ev.end,
        allDay: !!ev.allDay,
        title: normalizeTitle(ev.title || ""),
        description: normalizeTitle(ev.description || ""),
        url: typeof ev.url === "string" ? ev.url : ""
      })).filter(ev=>ev.title && !/^\[object\s/i.test(ev.title)) : [];
      localStorage.setItem(CAL_KEY, JSON.stringify(cleaned));
    }catch(e){}
    buildClassData();
    if(plannerViewMode==="class") render();
  }
  function loadRPG(){
    const raw = hasStorage ? localStorage.getItem(RPG_KEY) : null;
    if(!raw) return { level:1, xp:0 };
    try{
      const parsed = JSON.parse(raw);
      if(parsed && typeof parsed.level==="number" && typeof parsed.xp==="number"){
        return parsed;
      }
    }catch(e){}
    return { level:1, xp:0 };
  }
  function loadMoodEnergy(){
    if(!hasStorage) return { mood:"neutral", energy:"medium" };
    try{
      const raw = localStorage.getItem(MOOD_STATE_KEY);
      const parsed = raw ? JSON.parse(raw) : null;
      if(parsed && parsed.mood && parsed.energy) return parsed;
    }catch(e){}
    return { mood:"neutral", energy:"medium" };
  }
  function saveMoodEnergy(state){
    if(hasStorage) localStorage.setItem(MOOD_STATE_KEY, JSON.stringify(state));
  }
  function saveRPG(state){
    if(hasStorage) localStorage.setItem(RPG_KEY, JSON.stringify(state));
  }
  function addXP(amount){
    rpgState.xp = Math.max(0, rpgState.xp + amount);
    let needed = xpForLevel(rpgState.level);
    while(rpgState.xp >= needed){
      rpgState.xp -= needed;
      rpgState.level += 1;
      needed = xpForLevel(rpgState.level);
      showToast(`Level up! Now level ${rpgState.level} — ${getRpgTitle(rpgState.level)}.`, "success");
    }
    saveRPG(rpgState);
    renderRpgHUD();
    updateStoryModeCard();
  }
  function getRpgTitle(level){
    let title = "Learner";
    rpgTitles.forEach(t=>{ if(level>=t.level) title = t.title; });
    return title;
  }

  function deepCopy(x){ return JSON.parse(JSON.stringify(x)); }
  function loadData(){ if(!hasStorage) return deepCopy(sample); try{ const s = JSON.parse(localStorage.getItem(S_KEY)); if(s && typeof s==="object") return s; }catch{} return deepCopy(sample); }
  function saveData(d){ if(hasStorage) localStorage.setItem(S_KEY, JSON.stringify(d)); }
  function loadMood(){ if(!hasStorage) return {}; try{ const m = JSON.parse(localStorage.getItem(M_KEY)); if(m && typeof m==="object") return m; }catch{} return {}; }
  function saveMood(m){ if(hasStorage) localStorage.setItem(M_KEY, JSON.stringify(m)); }
  function loadJournal(){ if(!hasStorage) return []; try{ const j = JSON.parse(localStorage.getItem(J_KEY)); return Array.isArray(j)?j:[]; }catch(e){ return []; } }
  function saveJournal(list){ if(hasStorage) localStorage.setItem(J_KEY, JSON.stringify(list)); }
  function loadNotes(){ if(!hasStorage) return []; try{ const n = JSON.parse(localStorage.getItem(NOTES_KEY)); return Array.isArray(n)?n:[]; }catch(e){ return []; } }
  function saveNotes(list){ if(hasStorage) localStorage.setItem(NOTES_KEY, JSON.stringify(list)); }
  function loadHabits(){ if(!hasStorage) return null; try{ const h = JSON.parse(localStorage.getItem("habits-data")); return Array.isArray(h)?h:null; }catch(e){ return null; } }
  function saveHabits(list){ if(hasStorage) localStorage.setItem("habits-data", JSON.stringify(list)); }
  function loadDailyStreak(){
    if(!hasStorage) return { current:0, best:0, lastVisit:null };
    try{
      const raw = JSON.parse(localStorage.getItem(DAILY_STREAK_KEY));
      if(raw && typeof raw === "object"){
        return {
          current: Number(raw.current) || 0,
          best: Number(raw.best) || 0,
          lastVisit: typeof raw.lastVisit === "string" ? raw.lastVisit : null
        };
      }
    }catch(e){}
    return { current:0, best:0, lastVisit:null };
  }
  function saveDailyStreak(state){
    if(!hasStorage) return;
    try{
      localStorage.setItem(DAILY_STREAK_KEY, JSON.stringify(state || { current:0, best:0, lastVisit:null }));
    }catch(e){}
  }
  // Detect non-ASCII/garbled chars so we can ignore corrupted entries
  function isGarbled(str=""){ return /[^\x00-\x7F]/.test(str); }
  function sanitizePlannerData(d){
    const cleaned = deepCopy(sample);
    let garbled = false;
    dayOrder.forEach(day=>{
      const arr = Array.isArray(d?.[day]) ? d[day] : [];
      cleaned[day] = arr.map(entry=>{
       // if(isGarbled(entry)) { garbled = true; return "X, "; }
        return typeof entry === "string" ? entry : String(entry||"");
      });
    });
    return { cleaned, garbled };
  }
  function loadHabitHistory(){
    if(!hasStorage) return {};
    try{
      const raw = JSON.parse(localStorage.getItem(HABIT_HISTORY_KEY));
      if(raw && typeof raw === "object"){
        const normalized = {};
        Object.keys(raw).forEach(k=>{
          if(Array.isArray(raw[k])){
            normalized[k] = raw[k].filter(v=>typeof v==="string");
          }
        });
        return normalized;
      }
    }catch(e){}
    return {};
  }
  function saveHabitHistory(){
    if(!hasStorage) return;
    localStorage.setItem(HABIT_HISTORY_KEY, JSON.stringify(habitHistory));
  }
  // Load stored integration toggle preferences.
  function loadIntegrationPrefs(){
    if(!hasStorage) return {};
    try{
      const raw = JSON.parse(localStorage.getItem(INTEGRATION_KEY));
      return raw && typeof raw === "object" ? raw : {};
    }catch(e){
      return {};
    }
  }
  // Persist integration toggle preferences.
  function saveIntegrationPrefs(){
    if(!hasStorage) return;
    localStorage.setItem(INTEGRATION_KEY, JSON.stringify(integrationPrefs));
  }
  // Load saved weekly reflection state (text, timestamp, prompt index).
  function loadReflectionState(){
    if(!hasStorage) return { text:"", savedAt:null, promptIndex:0 };
    try{
      const raw = JSON.parse(localStorage.getItem(REFLECTION_KEY));
      if(raw && typeof raw === "object"){
        return {
          text: raw.text || "",
          savedAt: raw.savedAt || null,
          promptIndex: typeof raw.promptIndex === "number" ? raw.promptIndex : 0
        };
      }
    }catch(e){}
    return { text:"", savedAt:null, promptIndex:0 };
  }
  // Persist weekly reflection state.
  function saveReflectionState(){
    if(!hasStorage) return;
    localStorage.setItem(REFLECTION_KEY, JSON.stringify(reflectionState));
  }
  function loadStreakFreeze(){
    if(!hasStorage) return { charges:0, used:[], lastUsed:null };
    try{
      const raw = JSON.parse(localStorage.getItem(STREAK_FREEZE_KEY));
      if(raw && typeof raw === "object"){
        return {
          charges: Number(raw.charges)||0,
          used: Array.isArray(raw.used)? raw.used.filter(v=>typeof v==="string") : [],
          lastUsed: raw.lastUsed || null
        };
      }
    }catch(e){}
    return { charges:0, used:[], lastUsed:null };
  }
  function saveStreakFreeze(){
    if(!hasStorage) return;
    localStorage.setItem(STREAK_FREEZE_KEY, JSON.stringify(streakFreeze));
  }
  function getFreezeSet(){
    const set = new Set();
    (streakFreeze.used||[]).forEach(d=>set.add(d));
    return set;
  }
  function formatHabitDate(date){
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth()+1).padStart(2,"0");
    const day = String(d.getDate()).padStart(2,"0");
    return `${year}-${month}-${day}`;
  }
  function getHabitWeekStart(date=new Date()){
    const d = new Date(date);
    const raw = d.getDay();
    const offset = raw === 0 ? -6 : 1 - raw;
    d.setDate(d.getDate() + offset);
    d.setHours(0,0,0,0);
    return d;
  }
  function getHabitDateForDay(dayIdx){
    const weekStart = getHabitWeekStart();
    const d = new Date(weekStart);
    d.setDate(d.getDate() + dayIdx);
    return d;
  }
  // Return raw completion dates for a habit (without streak freeze days).
  function getHabitHistoryRawSet(habitId){
    const list = habitHistory[habitId] || [];
    return new Set(list);
  }
  function getHabitHistorySet(habitId){
    const merged = getHabitHistoryRawSet(habitId);
    getFreezeSet().forEach(d=>merged.add(d));
    return merged;
  }
  function trimHabitHistory(habitId){
    const list = habitHistory[habitId] || [];
    if(!list.length) return;
    const cutoff = new Date();
    cutoff.setHours(0,0,0,0);
    cutoff.setDate(cutoff.getDate() - HABIT_HISTORY_RETENTION_DAYS);
    habitHistory[habitId] = list.filter(entry => {
      const entryDate = new Date(entry);
      return entryDate >= cutoff;
    }).sort();
  }
  function recordHabitCompletion(habitId, dayDate, completed){
    if(!habitId || !dayDate) return;
    const key = formatHabitDate(dayDate);
    const rawSet = getHabitHistoryRawSet(habitId);
    const beforeSet = getHabitHistorySet(habitId);
    const beforeCurrent = calculateConsecutiveDays(new Set(beforeSet));
    const beforeBest = calculateBestStreak(new Set(beforeSet));
    if(completed){
      rawSet.add(key);
    } else {
      rawSet.delete(key);
    }
    habitHistory[habitId] = Array.from(rawSet).sort();
    trimHabitHistory(habitId);
    if(!habitHistory[habitId].length){
      delete habitHistory[habitId];
    }
    const afterSet = getHabitHistorySet(habitId);
    const afterCurrent = calculateConsecutiveDays(new Set(afterSet));
    const afterBest = calculateBestStreak(new Set(afterSet));
    if(completed){
      launchConfetti();
      maybeCelebrateStreak(beforeCurrent, afterCurrent, beforeBest, afterBest);
    }
    saveHabitHistory();
    updateHabitStreakPanel();
    updateStreakFreezeBar();
  }
  function calculateConsecutiveDays(set, anchor=new Date()){
    let count = 0;
    const cursor = new Date(anchor);
    cursor.setHours(0,0,0,0);
    while(true){
      const key = formatHabitDate(cursor);
      if(!set.has(key)) break;
      count += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return count;
  }
  function calculateBestStreak(set){
    if(!set.size) return 0;
    const dates = Array.from(set).map(v => new Date(v));
    dates.sort((a,b)=>a-b);
    let best = 1;
    let current = 1;
    for(let i=1;i<dates.length;i++){
      const diff = Math.round((dates[i] - dates[i-1]) / 86400000);
      if(diff === 1){
        current += 1;
      } else if(diff === 0){
        continue;
      } else {
        current = 1;
      }
      best = Math.max(best, current);
    }
    return best;
  }
  function getSundayStart(date=new Date()){
    const d = new Date(date);
    const day = d.getDay();
    d.setDate(d.getDate() - day);
    d.setHours(0,0,0,0);
    return d;
  }
  function calculatePerfectWeekStreak(completions){
    const set = new Set(completions);
    let streak = 0;
    let reference = getSundayStart();
    while(true){
      let weekPerfect = true;
      for(let i=0;i<7;i++){
        const day = new Date(reference);
        day.setDate(reference.getDate() + i);
        if(!set.has(formatHabitDate(day))){
          weekPerfect = false;
          break;
        }
      }
      if(!weekPerfect) break;
      streak++;
      reference.setDate(reference.getDate() - 7);
    }
    return streak;
  }
  function updateHabitStreakPanel(){
    if(!habitStreakPanel) return;
    const completions = new Set();
    Object.values(habitHistory).forEach(list=>{ list.forEach(entry=>completions.add(entry)); });
    getFreezeSet().forEach(date=>completions.add(date));
    const sunday = getSundayStart();
    const dayLabels = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    habitStreakPanel.innerHTML = "";
    const dayRow = document.createElement("div");
    dayRow.className = "habit-streak-days";
    dayLabels.forEach((label, idx)=>{
      const day = new Date(sunday);
      day.setDate(sunday.getDate() + idx);
      const done = completions.has(formatHabitDate(day));
      const dayEl = document.createElement("div");
      dayEl.className = `habit-streak-day${done ? " on" : ""}`;
      dayEl.innerHTML = `<span class="day-label">${label}</span><span class="fire-icon">${done ? "🔥" : "🔥"}</span>`;
      dayRow.append(dayEl);
    });
    const perfect = calculatePerfectWeekStreak(completions);
    const info = document.createElement("div");
    info.className = "habit-streak-info";
    info.textContent = `Perfect streak: ${perfect} week${perfect === 1 ? "" : "s"}`;
    habitStreakPanel.append(dayRow, info);
  }
  function updateStreakFreezeBar(){
    if(!streakFreezeBar) return;
    if(freezeCountEl) freezeCountEl.textContent = `${streakFreeze.charges||0} stocked`;
    if(freezeUseBtn) freezeUseBtn.disabled = (streakFreeze.charges||0) <= 0;
    if(freezeNoteEl){
      const last = streakFreeze.lastUsed ? `Last used: ${streakFreeze.lastUsed}` : "Buy a freeze to protect one missed day.";
      freezeNoteEl.textContent = last;
    }
    updateStoryModeCard();
  }
  function updateDailyStreakUI(note){
    if(!dailyStreakCard) return;
    const current = Math.max(0, dailyStreakState.current || 0);
    const best = Math.max(0, dailyStreakState.best || 0);
    if(dailyStreakCountEl) dailyStreakCountEl.textContent = current;
    if(dailyStreakBestEl) dailyStreakBestEl.textContent = best;
    if(dailyStreakNoteEl){
      const defaultNote = hasStorage
        ? `Back tomorrow for +${DAILY_STREAK_REWARD} XP.`
        : "Browser storage is blocked; streak won't persist after this tab.";
      dailyStreakNoteEl.textContent = note || defaultNote;
    }
  }
  function recordDailyCheckIn(){
    const today = new Date();
    const todayKey = formatHabitDate(today);
    if(dailyStreakState.lastVisit === todayKey){
      updateDailyStreakUI(`Check-in logged. Today's +${DAILY_STREAK_REWARD} XP is already banked.`);
      return;
    }
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const yesterdayKey = formatHabitDate(yesterday);
    const continued = dailyStreakState.lastVisit === yesterdayKey;
    dailyStreakState.current = continued ? Math.max(1, (dailyStreakState.current || 0) + 1) : 1;
    dailyStreakState.lastVisit = todayKey;
    dailyStreakState.best = Math.max(dailyStreakState.best || 0, dailyStreakState.current);
    saveDailyStreak(dailyStreakState);
    updateDailyStreakUI(continued ? `Streak extended. Back tomorrow to lock another +${DAILY_STREAK_REWARD} XP.` : `Fresh streak started today. +${DAILY_STREAK_REWARD} XP locked in.`);
    addXP(DAILY_STREAK_REWARD);
    showToast(`Daily check-in +${DAILY_STREAK_REWARD} XP (streak ${dailyStreakState.current}d)`);
  }

  function exportDailyStreak(){
    const payload = {
      current: Number(dailyStreakState.current)||0,
      best: Number(dailyStreakState.best)||0,
      lastVisit: dailyStreakState.lastVisit || null,
      exportedAt: new Date().toISOString(),
      version: "v1"
    };
    downloadBlob(JSON.stringify(payload,null,2), "daily-streak-backup.json", "application/json;charset=utf-8");
    showToast("Streak exported");
  }
  function importDailyStreak(obj){
    if(!obj || typeof obj !== "object") throw new Error("Invalid streak file");
    dailyStreakState = {
      current: Number(obj.current)||0,
      best: Number(obj.best)||0,
      lastVisit: typeof obj.lastVisit === "string" ? obj.lastVisit : null
    };
    saveDailyStreak(dailyStreakState);
    updateDailyStreakUI("Streak restored from file.");
    showToast("Streak restored");
  }

  function useStreakFreeze(targetDate=new Date()){
    if((streakFreeze.charges||0) <= 0) return false;
    const key = formatHabitDate(targetDate);
    if(streakFreeze.used && streakFreeze.used.includes(key)) return false;
    streakFreeze.charges = Math.max(0, (streakFreeze.charges||0) - 1);
    streakFreeze.used = Array.from(new Set([...(streakFreeze.used||[]), key]));
    streakFreeze.lastUsed = key;
    saveStreakFreeze();
    updateStreakFreezeBar();
    updateHabitStreakPanel();
    return true;
  }
  function getHabitStreakInfo(habitId){
    const set = getHabitHistorySet(habitId);
    return {
      current: calculateConsecutiveDays(set),
      best: calculateBestStreak(set)
    };
  }
  function renderHabitHistoryDots(habitId){
    const container = document.createElement("div");
    container.className = "habit-history";
    const set = getHabitHistorySet(habitId);
    const today = new Date();
    today.setHours(0,0,0,0);
    for(let offset=6; offset>=0; offset--){
      const day = new Date(today);
      day.setDate(day.getDate() - offset);
      const key = formatHabitDate(day);
      const span = document.createElement("span");
      span.className = `habit-history-day${set.has(key) ? " on" : ""}`;
      span.title = `${key}`;
      container.append(span);
    }
    return container;
  }
  function importScheduleFrom(payload){
    if(!payload || typeof payload !== "object") return false;
    const source = (payload.schedule && typeof payload.schedule === "object") ? payload.schedule : payload;
    let changed = false;
    const next = deepCopy(sample);
    dayOrder.forEach(day=>{
      if(Array.isArray(source[day])){
        next[day] = source[day].map(entry => typeof entry === "string" ? entry : String(entry ?? ""));
        changed = true;
      }
    });
    if(!changed) return false;
    data = next;
    saveData(data);
    render();
    return true;
  }

  let data = loadData();
  const { cleaned, garbled } = sanitizePlannerData(data);
  if(garbled){
    data = cleaned;
    saveData(data);
  }
  let mood = loadMood();
  let editMode = hasStorage ? (localStorage.getItem(E_KEY) === "1") : true;
  let moodEntries = loadJournal();
  let notesData = loadNotes();
  let habitsState = loadHabits();
  let roadmapState = loadRoadmap();
  let skillProgressState = loadSkillProgress();
  let coachState = loadCoachState();
  let streakFreeze = loadStreakFreeze();
  let integrationPrefs = loadIntegrationPrefs();
  let reflectionState = loadReflectionState();
  let currentReflectionPrompt = typeof reflectionState.promptIndex === "number" ? reflectionState.promptIndex : 0;
  let habitHistory = loadHabitHistory();
  let dailyStreakState = loadDailyStreak();
  let studyNagTimer = null;
  let workloadExtras = [];
  let celebrationTimer = null;

  function isWorkloadEntry(text=""){
    return /^\s*\[(P|D|Q|L)\]/i.test(text || "");
  }

  function extractDue(line){
    const m = /due\s+([0-9/\\-]+(?:\\s+\\d{1,2}:\\d{2}\\s*(?:AM|PM))?)/i.exec(line || "");
    if(m){
      const d = new Date(m[1]);
      if(!isNaN(d)) return d;
    }
    return null;
  }
  let rpgState = loadRPG();
  let moodEnergyState = loadMoodEnergy();
  try{
    buildClassData();
  }catch(e){
    console.error("buildClassData failed", e);
    classCourses = [];
  }
  if(!Array.isArray(habitsState)){
    habitsState = defaultHabits.map(normalizeHabit);
  } else {
    habitsState = habitsState.map(normalizeHabit);
    let hadGarbled = false;
    habitsState.forEach((h, idx)=>{
      if(isGarbled(h.name)){
        habitsState[idx].name = "Habit";
        hadGarbled = true;
      }
    });
    if(hadGarbled) saveHabits(habitsState);
  }
  if(moodEntries.length){
    let synced = false;
    moodEntries.forEach(entry=>{
      if(!notesData.some(n=>n && n.linkedId===entry.id)){
        notesData.unshift({
          id: entry.id,
          linkedId: entry.id,
          title: entry.title || entry.mood || "Mood entry",
          body: entry.text || "",
          tag: "Mood journal",
          created: entry.created || new Date().toISOString()
        });
        synced = true;
      }
    });
    if(synced) saveNotes(notesData);
  }

  const storageNote = document.getElementById("storage-note");
  storageNote.textContent = hasStorage ? "" : "Browser storage is blocked - changes last until you close this tab.";
  const toast = document.getElementById("toast");
  function showToast(msg, cls){ toast.textContent = msg; toast.className = "toast " + (cls||""); requestAnimationFrame(()=>{ toast.classList.add("show"); }); setTimeout(()=>{ toast.classList.remove("show"); }, 1200); }
  function downloadBlob(content, filename, type){
    const blob = new Blob([content],{type});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  const chk = document.getElementById("chk-edit");
  chk.checked = !!editMode;
  chk.addEventListener("change",()=>{ editMode = chk.checked; if(hasStorage) localStorage.setItem(E_KEY, editMode ? "1":"0"); render(); });

  // Pixel the PUP snarky motivator (every 30 minutes)
  (function initPixelSnark(){
    const lines = [
      "You opened me. Now open your work tab, champ.",
      "That assignment won’t write itself. Unless it’s sentient. It isn’t.",
      "Hydrate, posture check, then ship one thing.",
      "Scrolling is not a deliverable. Do one messy draft.",
      "If procrastination paid bills, you'd be CEO. Until then, work time.",
      "Future you left a note: stop stalling.",
      "You’re cute. Your inbox isn’t. Clear one email.",
      "Tiny ask: 10 minutes of real effort. Then flex.",
      "Deadlines are closer than they appear in your mirror.",
      "If you’re reading this, you could be typing that doc."
    ];
    let timer = null;

    const requestNotifyPermission = ()=>{
      if(typeof Notification === "undefined") return;
      if(Notification.permission === "default"){
        try{ Notification.requestPermission(); }catch(e){}
      }
    };

    const pushNotify = (msg)=>{
      if(typeof Notification === "function" && Notification.permission === "granted"){
        try{ new Notification("Pixel the PUP", { body: msg }); return true; }catch(e){}
      }
      return false;
    };

    const fire = ()=>{
      const pick = lines[Math.floor(Math.random()*lines.length)];
      const body = `Hey this is Pixel your adorbs motivator: ${pick}`;
      if(!pushNotify(body) && typeof showToast === "function"){
        showToast(body, "warn");
      } else if(!pushNotify(body)){
        console.log(body);
      }
    };

    if(!timer){
      requestNotifyPermission();
      fire();
      timer = setInterval(fire, 30 * 60 * 1000);
    }
  })();

  const btnSave = document.getElementById("btn-save");
  btnSave.addEventListener("click",()=>{ if(!hasStorage){ showToast("Storage blocked — not saved", "warn"); return; } saveData(data); saveMood(mood); localStorage.setItem(E_KEY, editMode ? "1":"0"); showToast("Saved to browser"); });
  const plannerImportInput = document.getElementById("planner-import-file");
  const plannerImportCSV = document.getElementById("planner-import-csv");
  const plannerExportJSON = document.getElementById("planner-export-json");
  const plannerExportCSV = document.getElementById("planner-export-csv");
  const habitStreakPanel = document.getElementById("habit-streak-hub");
  const storyModeCard = document.getElementById("story-mode-card");
  const storyModeHome = storyModeCard?.parentElement || null;
  const storyModeStage = document.getElementById("story-mode-stage");
  const storyModeText = document.getElementById("story-mode-text");
  const storyModeList = document.getElementById("story-mode-list");
  const storyModeFooter = document.getElementById("story-mode-footer");
  const integrationCard = document.getElementById("integration-card");
  const integrationNudgeBtn = document.getElementById("integration-nudge");
  const integrationNudgeText = document.getElementById("integration-nudge-text");
  const integrationToggles = integrationCard ? Array.from(document.querySelectorAll("[data-integration]")) : [];
  const reflectionCard = document.getElementById("reflection-card");
  const reflectionPromptEl = document.getElementById("reflection-prompt");
  const reflectionInput = document.getElementById("reflection-input");
  const reflectionMeta = document.getElementById("reflection-meta");
  const reflectionSaveBtn = document.getElementById("reflection-save");
  const reflectionNewBtn = document.getElementById("reflection-new");
  integrationNudgeBtn?.addEventListener("click",()=>{
    updateIntegrationSuggestion(true);
    showToast("Smart suggestion refreshed");
  });
  reflectionNewBtn?.addEventListener("click",()=>{
    updateReflectionPrompt(true);
    updateReflectionMeta();
  });
  reflectionSaveBtn?.addEventListener("click",()=>{
    if(!reflectionInput) return;
    reflectionState.text = reflectionInput.value.trim();
    reflectionState.savedAt = new Date().toISOString();
    reflectionState.promptIndex = currentReflectionPrompt;
    saveReflectionState();
    updateReflectionMeta();
    showToast("Reflection logged");
    updateIntegrationSuggestion(true);
  });
  const streakFreezeBar = document.getElementById("streak-freeze-bar");
  const freezeCountEl = document.getElementById("freeze-count");
  const freezeNoteEl = document.getElementById("freeze-note");
  const freezeBuyBtn = document.getElementById("freeze-buy");
  const freezeUseBtn = document.getElementById("freeze-use");
  if(plannerImportInput){
    plannerImportInput.addEventListener("change",e=>{
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = ()=>{
        try{
          const parsed = JSON.parse(String(reader.result || ""));
          if(importScheduleFrom(parsed)){
            showToast("Planner JSON imported!");
          }else{
            showToast("That file did not contain planner data.", "warn");
          }
        }catch(err){
          showToast("Invalid JSON file.", "warn");
        }
        plannerImportInput.value = "";
      };
      reader.readAsText(file);
    });
  }

  const panel = document.getElementById("panel-planner");
  const focusTodayBtn = document.getElementById("focus-today");
  const toggleDaysBtn = document.getElementById("toggle-days");
  const assignmentsBtn = null;
  const weekViewToggle = document.getElementById("planner-week-view");
  const classViewToggle = document.getElementById("planner-class-view");
  const workloadCard = null;
  const workloadList = null;
  const workloadBtn = null;
  const workloadClose = null;
  const rpgHud = document.getElementById("rpg-hud");
  const dailyStreakCard = document.getElementById("daily-streak");
  const dailyStreakCountEl = document.getElementById("daily-streak-count");
  const dailyStreakBestEl = document.getElementById("daily-streak-best");
  const dailyStreakNoteEl = document.getElementById("daily-streak-note");
  const dailyStreakExportBtn = document.getElementById("daily-streak-export");
  const dailyStreakImportInput = document.getElementById("daily-streak-import-input");
  const moodSelect = document.getElementById("mood-select");
  const energySelect = document.getElementById("energy-select");
  if(dailyStreakExportBtn){
    dailyStreakExportBtn.addEventListener("click", exportDailyStreak);
  }
  if(dailyStreakImportInput){
    dailyStreakImportInput.addEventListener("change",(e)=>{
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (ev)=>{
        try{
          const obj = JSON.parse(ev.target.result);
          importDailyStreak(obj);
        }catch(err){
          console.error(err);
          showToast("Invalid streak file", "err");
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    });
  }
  function hideMoodEnergyControls(){
    const box = document.querySelector(".mood-energy");
    if(box) box.style.display = "none";
  }
  const plannerPanel = document.getElementById("panel-planner");
  function setPlannerWeekView(){
    plannerViewMode = "week";
    updatePlannerViewButtons();
    render();
  }
  function setPlannerClassView(){
    plannerViewMode = "class";
    updatePlannerViewButtons();
    render();
  }
  window.setPlannerWeekView = setPlannerWeekView;
  window.setPlannerClassView = setPlannerClassView;
  function renderRitualCardFallback(){
    const anchor = document.querySelector(".view-controls");
    if(!anchor) return;
    let card = document.getElementById("ritual-card");
    if(card) card.remove();
    card = document.createElement("div");
    card.id = "ritual-card";
    card.className = "ritual-card";
    const rituals = [
      "Stack your books neatly.",
      "Close all tabs except this one & your LMS.",
      "Take 3 slow breaths and think of one reason you care about this class.",
      "Phone goes face-down in another room.",
      "Fill your water bottle before you start."
    ];
    const pick = rituals[Math.floor(Math.random()*rituals.length)];
    card.innerHTML = `<div class="smart-chip">Ritual</div><strong>${pick}</strong>`;
    anchor.parentElement.insertBefore(card, anchor.nextSibling);
  }
  // Study Plan fallback (in case module listener misses)
  function openStudyPlanFallback(){
    if(typeof openStudyPlanModal === "function"){
      openStudyPlanModal();
      return;
    }
    if(document.getElementById("study-plan-modal")) return;
    const overlay = document.createElement("div");
    overlay.id = "study-plan-modal";
    Object.assign(overlay.style, {
      position:"fixed", inset:"0", background:"rgba(0,0,0,.45)", zIndex:"230",
      display:"flex", alignItems:"center", justifyContent:"center"
    });
    const card = document.createElement("div");
    Object.assign(card.style, {
      background:"#fff", padding:"14px", borderRadius:"14px", maxWidth:"520px", width:"90%"
    });
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
        <strong>Generate study plan</strong>
        <button class="btn" id="study-plan-close" type="button">Close</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:8px;margin-top:8px;">
        <input id="plan-exam" type="text" placeholder="Exam/Project name">
        <input id="plan-days" type="number" min="1" max="30" placeholder="Days until exam">
        <input id="plan-chapters" type="number" min="1" max="30" placeholder="Chapters/Topics">
        <input id="plan-hours" type="number" min="1" max="12" placeholder="Hours per day">
      </div>
      <button class="btn" id="plan-generate" type="button" style="margin-top:8px;">Create plan</button>
    `;
    overlay.append(card);
    document.body.append(overlay);
    card.querySelector("#study-plan-close")?.addEventListener("click", ()=> overlay.remove());
    card.querySelector("#plan-generate")?.addEventListener("click", ()=>{
      const name = card.querySelector("#plan-exam")?.value.trim() || "Exam";
      const days = Math.max(1, Math.min(30, Number(card.querySelector("#plan-days")?.value || 1)));
      const chapters = Math.max(1, Math.min(30, Number(card.querySelector("#plan-chapters")?.value || 1)));
      const hours = Math.max(1, Math.min(12, Number(card.querySelector("#plan-hours")?.value || 1)));
      if(typeof createStudyPlan === "function"){
        createStudyPlan(name, days, chapters, hours, false);
      } else {
        showToast("Study plan added (basic)", "success");
      }
      overlay.remove();
    });
  }
  // PACER fallback overlay (in case module hook misses)
  function openPacerOverlayFallback(){
    if(document.getElementById("pacer-overlay")) return;
    const overlay = document.createElement("div");
    overlay.id = "pacer-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,.45)";
    overlay.style.zIndex = "220";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "flex-end";
    const panel = document.createElement("div");
    panel.style.width = "360px";
    panel.style.maxWidth = "90%";
    panel.style.background = "#fff";
    panel.style.padding = "12px";
    panel.style.borderRadius = "12px 0 0 12px";
    panel.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
        <strong>PACER Mode</strong>
        <button class="btn" id="pacer-close" type="button">Close</button>
      </div>
      <div class="note" style="margin:6px 0;">Capture a quick C-P-A-E-R note to review later.</div>
      <input id="pacer-quick-topic" type="text" placeholder="Topic/Reading" style="width:100%;padding:8px 10px;border-radius:10px;border:1px solid #e2e8f0;margin-top:6px;">
      <textarea id="pacer-quick-c" placeholder="What did you just learn? (C)" style="width:100%;min-height:50px;border-radius:10px;border:1px solid #e2e8f0;padding:8px 10px;margin-top:6px;"></textarea>
      <textarea id="pacer-quick-p" placeholder="How would you do it? (P)" style="width:100%;min-height:50px;border-radius:10px;border:1px solid #e2e8f0;padding:8px 10px;margin-top:6px;"></textarea>
      <textarea id="pacer-quick-a" placeholder="Analogy or silly example (A)" style="width:100%;min-height:50px;border-radius:10px;border:1px solid #e2e8f0;padding:8px 10px;margin-top:6px;"></textarea>
      <textarea id="pacer-quick-e" placeholder="Evidence / example (E)" style="width:100%;min-height:50px;border-radius:10px;border:1px solid #e2e8f0;padding:8px 10px;margin-top:6px;"></textarea>
      <input id="pacer-quick-r" type="text" placeholder="Reference (R)" style="width:100%;padding:8px 10px;border-radius:10px;border:1px solid #e2e8f0;margin-top:6px;">
      <button class="btn" id="pacer-quick-save" type="button" style="margin-top:8px;">Save PACER chunk</button>
    `;
    overlay.append(panel);
    document.body.append(overlay);
    panel.querySelector("#pacer-close")?.addEventListener("click", ()=> overlay.remove());
    panel.querySelector("#pacer-quick-save")?.addEventListener("click", ()=>{
      const topic = panel.querySelector("#pacer-quick-topic")?.value.trim() || "";
      if(!topic){ showToast("Need a topic", "warn"); return; }
      const entry = {
        id:`pacer-${Date.now()}`,
        topic,
        c: panel.querySelector("#pacer-quick-c")?.value.trim() || "",
        p: panel.querySelector("#pacer-quick-p")?.value.trim() || "",
        a: panel.querySelector("#pacer-quick-a")?.value.trim() || "",
        e: panel.querySelector("#pacer-quick-e")?.value.trim() || "",
        r: panel.querySelector("#pacer-quick-r")?.value.trim() || "",
        status:"new",
        created: Date.now(),
        nextReview: Date.now()
      };
      const pacerList = loadPacer?.() || [];
      pacerList.unshift(entry);
      if(typeof savePacer === "function") savePacer(pacerList);
      overlay.remove();
      showToast("PACER chunk saved");
    });
  }
  document.getElementById("btn-pacer-mode")?.addEventListener("click", openPacerOverlayFallback);
  document.getElementById("btn-study-plan")?.addEventListener("click", openStudyPlanFallback);
  document.getElementById("btn-rituals")?.addEventListener("click", renderRitualCardFallback);
  function placeReflectionInPlanner(){
    if(!plannerPanel || !reflectionCard) return;
    if(reflectionCard.parentElement !== plannerPanel){
      plannerPanel.append(reflectionCard);
    }
    reflectionCard.style.display = "";
  }
  updateHabitStreakPanel();
  updateStreakFreezeBar();
  renderIntegrationToggles();
  renderReflectionCard();
  placeReflectionInPlanner();
  if(moodSelect) moodSelect.value = moodEnergyState.mood || "neutral";
  if(energySelect) energySelect.value = moodEnergyState.energy || "medium";
  hideMoodEnergyControls();
  recordDailyCheckIn();

  const getPlannerDayCards = () => Array.from(panel ? panel.querySelectorAll(".card[data-day]") : []);
  const collapseAllDayCards = () => { getPlannerDayCards().forEach(card=>{ card.classList.add("collapsed"); }); };
  const expandAllDayCards = () => { getPlannerDayCards().forEach(card=>{ card.classList.remove("collapsed"); }); };
  const updateDayToggleButton = () => {
    if(!toggleDaysBtn) return;
    const cards = getPlannerDayCards();
    const allCollapsed = cards.length ? cards.every(card=>card.classList.contains("collapsed")) : false;
    toggleDaysBtn.textContent = allCollapsed ? "Expand all" : "Collapse all";
    toggleDaysBtn.setAttribute("aria-pressed", allCollapsed ? "true" : "false");
  };
  const toggleAllDayCards = () => {
    const cards = getPlannerDayCards();
    const allCollapsed = cards.length ? cards.every(card=>card.classList.contains("collapsed")) : false;
    if(allCollapsed){
      expandAllDayCards();
    }else{
      collapseAllDayCards();
    }
    updateDayToggleButton();
  };
  const focusTodayCard = () => {
    const today = new Date();
    const index = (today.getDay() + 6) % 7;
    const dayName = dayOrder[index] || dayOrder[0];
    collapseAllDayCards();
    const target = panel?.querySelector(`.card[data-day="${dayName}"]`);
    if(target){
      target.classList.remove("collapsed");
      target.scrollIntoView({behavior:"smooth", block:"center"});
    }
  };
  const addWeeklyAssignmentDeadlines = () => {
    const sundayDate = getUpcomingSunday();
    const dueDay = dayOrder[6];
    if(!dueDay) return;
    const dueLabel = `${sundayDate.toLocaleDateString()} 11:59 PM`;
    const targets = data[dueDay] || (data[dueDay]=[]);
   const templates = [
  { icon: "[P]", label: "Paper",           count: 3 },
  { icon: "[D]", label: "Discussion post", count: 4 },
  { icon: "[Q]", label: "Quiz",            count: 4 }
    ];
    let added = 0;
    templates.forEach(item=>{
      for(let i=0;i<item.count;i++){
        const entry = `${item.icon} ${item.label} ${i+1} — due ${dueLabel}`;
        if(!targets.includes(entry)){
          targets.push(entry);
          added++;
        }
      }
    });
    const labs = getStoredCalendarEvents().filter(ev=>/lab/i.test(ev.title || ""));
    labs.forEach(ev=>{
    const entry = `Ã°Å¸Â§Âª Lab: ${ev.title || "Lab"} - due ${dueLabel}`;
      if(!targets.includes(entry)){
        targets.push(entry);
        added++;
      }
    });
    if(added){
      saveData(data);
      render();
      showToast(`Added ${added} deadlines for Sunday ${sundayDate.toLocaleDateString()}.`);
    } else {
      showToast("Weekly assignment deadlines already exist.", "warn");
    }
  };

    function renderClassDashboard(){
    const iconForAssignment = (item={}, idx=0, total=0)=>{
      const title = String(item.title||item.rawTitle||"").toLowerCase();
      if(title.includes("quiz") || title.includes("exam")) return "\uD83E\uDDE0"; // brain
      if(title.includes("lab") || title.includes("sim") || title.includes("project")) return "\uD83E\uDDEA"; // dna flask
      if(title.includes("discussion") || title.includes("post")) return "\uD83D\uDCAC"; // speech bubble
      if(idx === total-1) return "\uD83C\uDFC6"; // trophy
      if(idx === Math.max(1, Math.floor(total/2))) return "\uD83C\uDF81"; // gift
      return "\u2705"; // checkmark
    };
    const formatDateLabel = (item={})=>{
      const due = new Date(item.due || Date.now());
      const dateLabel = due.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
      return `${dateLabel}${item.description ? " - " + item.description : ""}`;
    };
    const wrapper = el("div",{class:"class-dashboard"});
    const filterRow = el("div",{class:"class-filter"});
    const filters = [
      {id:"all", label:"All terms"},
      {id:"fall", label:"Fall (Aug‚Dec)"},
      {id:"spring", label:"Spring (Jan‚May)"},
      {id:"summer", label:"Summer (Jun‚Aug)"}
    ];
    filters.forEach(f=>{
      const btn = el("button",{class:`btn${classTermFilter===f.id?" tab":""}`, type:"button", "aria-pressed":String(classTermFilter===f.id)}, f.label);
      btn.addEventListener("click",()=>{
        classTermFilter = f.id;
        render();
      });
      filterRow.append(btn);
    });
    wrapper.append(filterRow);

    const availableCourses = classCourses.filter(c=> classTermFilter==="all" || c.term===classTermFilter);
    if(selectedCourseId && !availableCourses.some(c=>c.id===selectedCourseId)){
      selectedCourseId = availableCourses[0]?.id || null;
    }

    if(!availableCourses.length){
      wrapper.append(el("div",{class:"note"},"No class data yet. Import your .ics file in the Calendar tab or reset after importing."));
      return wrapper;
    }

    const tabs = el("div",{class:"class-tabs"});
    availableCourses.forEach(course=>{
      const tabBtn = el("button",{
        class:`class-tab${course.id===selectedCourseId?" on":""}`,
        type:"button",
        "aria-pressed":String(course.id===selectedCourseId)
      }, course.id);
      tabBtn.addEventListener("click",()=>{
        selectedCourseId = course.id;
        render();
      });
      tabs.append(tabBtn);
    });
    wrapper.append(tabs);

    const selected = availableCourses.find(c=>c.id===selectedCourseId) || availableCourses[0];
    selectedCourseId = selected?.id || selectedCourseId;
    if(selected){
      const card = el("div",{class:"class-card"});
      const termLabel = selected.term ? selected.term.toUpperCase() : "TERM";
      card.append(
        el("div",{class:"class-card-head"},
          el("div",null,
            el("h3",null, selected.id),
            el("p",{class:"note"}, selected.code || "")
          ),
          el("div",{class:"class-term-pill"}, termLabel)
        )
      );
      const list = el("div",{class:"class-assignments"});
      const now = Date.now() - 86400000;
      const upcoming = (selected.entries||[]).filter(item=> new Date(item.due || Date.now()).getTime() >= now);
      const rows = (upcoming.length ? upcoming : selected.entries).slice(0,12);
      rows.forEach(item=>{
        const row = el("div",{class:"class-assignment"});
        const due = new Date(item.due || Date.now());
        row.append(
          el("div",{class:"class-assignment-title"}, item.title || item.rawTitle || "Assignment"),
          el("div",{class:"class-assignment-meta"}, `${due.toLocaleDateString()}${item.description ? " - " + item.description : ""}`)
        );
        list.append(row);
      });
      if(!rows.length){
        list.append(el("div",{class:"note"},"No assignments found for this class."));
      }
      card.append(list);
      const pathCard = el("div",{class:"class-path-card"});
      pathCard.append(
        el("div",{class:"class-path-head"},
          el("div",{class:"class-path-title"},"Weekly journey"),
          el("div",{class:"note"},"Built from your .ics import — finish the path to reveal the next week.")
        )
      );
      const path = el("div",{class:"class-path"});
      const mapItems = rows.slice(0,7);
      mapItems.forEach((item, idx)=>{
        const due = new Date(item.due || Date.now());
        const isDone = due.getTime() < Date.now();
        const isNext = !isDone && idx===0;
        const step = el("div",{class:`path-step${idx%2?" alt":""}`});
        step.append(
          el("div",{class:`path-node${isDone?" done":""}${isNext?" next":""}`}, iconForAssignment(item, idx, mapItems.length)),
          el("div",{class:"path-label"},
            el("strong",null, (item.title || item.rawTitle || "Assignment").slice(0,60)),
            el("small",null, `${formatDateLabel(item)}${isNext ? " • start this one first" : ""}`)
          )
        );
        if(idx < mapItems.length-1){
          step.append(el("span",{class:"path-connector"}));
        }
        path.append(step);
      });
      if(!mapItems.length){
        path.append(el("div",{class:"note"},"No timeline yet. Import your .ics and the path will appear here."));
      }
      pathCard.append(path);
      card.append(pathCard);
      wrapper.append(card);
    }
    return wrapper;
  }

  function updatePlannerViewButtons(){
    if(plannerViewMode==="week"){
      weekViewToggle?.setAttribute("aria-pressed","true");
      classViewToggle?.setAttribute("aria-pressed","false");
    } else {
      classViewToggle?.setAttribute("aria-pressed","true");
      weekViewToggle?.setAttribute("aria-pressed","false");
    }
  }
  function renderRpgHUD(){
    if(!rpgHud) return;
    const needed = xpForLevel(rpgState.level);
    const pct = Math.min(100, Math.round((rpgState.xp/needed)*100));
    rpgHud.innerHTML = `
      <div class="rpg-title">${getRpgTitle(rpgState.level)}</div>
      <div class="rpg-level">Level ${rpgState.level}</div>
      <div class="rpg-progress">
        <div class="rpg-bar"><span style="width:${pct}%"></span></div>
        <div class="rpg-xp">${rpgState.xp} XP / ${needed} XP</div>
      </div>
    `;
  }

  function renderDangerZone(){
  const zone = document.getElementById("danger-zone");
  if(!zone) return;
  zone.innerHTML = "";
  const items = getUpcomingAssignments(500);
  const bossDone = loadDangerBossDone();
  const resourceCard = el("div",{class:"danger-resource-card"},
    el("div",{class:"resource-head"},
      el("div",{class:"resource-title"},"Study boosters"),
      el("div",{class:"resource-sub"},"Free textbooks + quick citation helpers")
    ),
    el("div",{class:"resource-grid"},
      el("div",{class:"resource-pill"},
        el("div",{class:"resource-label"},"My textbooks"),
        el("p",{class:"resource-note"},"Direct links to your vitalsource + cengage shelves (login required)."),
        el("div",{class:"resource-links"},
          el("a",{class:"resource-link",href:"https://bookshelf.vitalsource.com/reader/books/9783662690079/pageid/99?context_token=bb735620-afa2-013e-1178-3e8ecb35ba3c",target:"_blank",rel:"noopener noreferrer"},"Vitalsource reader"),
          el("a",{class:"resource-link",href:"https://www.cengage.com/dashboard/home",target:"_blank",rel:"noopener noreferrer"},"Cengage dashboard")
        )
      ),
      el("div",{class:"resource-pill"},
        el("div",{class:"resource-label"},"Essay citations"),
        el("p",{class:"resource-note"},"Drop a URL/title, export MLA/APA/BibTeX."),
        el("div",{class:"resource-links"},
          el("a",{class:"resource-link",href:"https://zbib.org",target:"_blank",rel:"noopener noreferrer"},"Zbib (Zotero)"),
          el("a",{class:"resource-link",href:"https://www.citethisforme.com",target:"_blank",rel:"noopener noreferrer"},"Cite This For Me"),
          el("a",{class:"resource-link",href:"https://www.mybib.com",target:"_blank",rel:"noopener noreferrer"},"MyBib")
        )
      ),
      el("div",{class:"resource-pill"},
        el("div",{class:"resource-label"},"Essay research tasks"),
        el("p",{class:"resource-note"},"Treat this like an assignment: check sources + lock citations."),
        el("ul",{class:"resource-tasks"},
          el("li",null,"1) Skim your Vitalsource/Cengage chapter for the essay topic."),
          el("li",null,"2) Pull 2 citation-ready sources (Zbib/MyBib)."),
          el("li",null,"3) Capture one quote + page number per source.")
        ),
        el("div",{class:"resource-links"},
          el("a",{class:"resource-link",href:"https://bookshelf.vitalsource.com/reader/books/9783662690079/pageid/99?context_token=bb735620-afa2-013e-1178-3e8ecb35ba3c",target:"_blank",rel:"noopener noreferrer"},"Open Vitalsource"),
          el("a",{class:"resource-link",href:"https://www.cengage.com/dashboard/home",target:"_blank",rel:"noopener noreferrer"},"Open Cengage"),
          el("a",{class:"resource-link",href:"https://zbib.org",target:"_blank",rel:"noopener noreferrer"},"Make citations"),
          el("a",{class:"resource-link",href:"https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_style_introduction.html",target:"_blank",rel:"noopener noreferrer"},"APA guide")
        )
      )
    )
  );
  if(!items.length){
    zone.append(
      el("div",{class:"danger-label"},"Danger Zone"),
      el("div",{class:"danger-empty"},"No looming deadlines detected. Keep grinding!"),
      resourceCard
    );
    return;
  }
  const list = el("div",{class:"danger-list"});
  items.forEach(item=>{
    const days = item.daysLeft;
    const totalWindow = DEFAULT_ASSIGNMENT_WINDOW_DAYS;
    const pct = Math.max(0, Math.min(100, Math.round((days/totalWindow)*100)));
    const bar = el("div",{class:"danger-bar"}, el("span",{style:`width:${pct}%`}));
    const status = days > 0 ? `${days} day${days===1?"":"s"} left` : "FINAL FORM: TURN IT IN TODAY.";
    const title = normalizeTitle(item.title || "");
    if(!title) return;
    const key = makeDangerKey(item);
    const done = bossDone.has(key);
    const doneBtn = el("button",{class:"danger-done-btn", type:"button"}, done ? "Defeated" : "Strike");
    doneBtn.addEventListener("click",()=>{
      if(done){
        bossDone.delete(key);
      } else {
        bossDone.add(key);
        recordStabilitySuccess();
        addXP?.(5);
      }
      saveDangerBossDone(bossDone);
      renderDangerZone();
    });
    const row = el("div",{class:`danger-item${days<=0?" boss":""}`},
      el("div",{class:"danger-head"},
        el("div",{class:"danger-title"}, title),
        el("div",{class:"danger-status"}, status),
        doneBtn
      ),
      bar
    );
    list.append(row);
  });
  const threatScore = (()=>{
    let score = 0;
    let overdue = 0;
    let soon = 0;
    const replies = loadRepliesState();
    const now = Date.now();
    items.forEach(it=>{
      const d = it.daysLeft;
      if(d < 0){ overdue += 1; score += 70 + Math.min(60, Math.abs(d)*8); }
      else if(d <= 1){ soon += 1; score += 50; }
      else if(d <= 2){ soon += 1; score += 35; }
      else if(d <= 3){ score += 25; }
      else if(d <= 6){ score += 10; }
    });
    const weekEnd = new Date(startOfWeek(currentWeek||new Date()));
    weekEnd.setDate(weekEnd.getDate()+6);
    const daysLeftWeek = Math.max(0, Math.ceil((weekEnd.getTime() - now)/86400000));
    const remainingReplies = Math.max(0, (replies.needed||15) - (replies.done||0));
    if(remainingReplies>0){
      if(daysLeftWeek <=1) score += 50;
      else if(daysLeftWeek <=2) score += 35;
      else score += 20;
    }
    const level = score >= 120 || (overdue>0 && soon>0) ? "red" : score >= 70 ? "orange" : score >= 30 ? "yellow" : "green";
    const bunker = document.body.classList.contains("theme-bunker");
    const detail = (()=>{
      if(level==="red") return bunker ? "Critical: hostiles at the gate. Overdue or imminent missions detected." : "Critical: overdue or due-now items need action.";
      if(level==="orange") return bunker ? "High alert: multiple missions due soon." : "High: several deadlines within a few days.";
      if(level==="yellow") return bunker ? "Elevated: keep eyes on approaching missions." : "Caution: some deadlines approaching.";
      return bunker ? "All clear: no hostile deadlines this week." : "Low: no urgent deadlines.";
    })();
    return { score: Math.min(100, score), level, detail, overdue, soon };
  })();
  const total = items.length;
  const defeated = Array.from(bossDone).filter(k=> items.some(it=> makeDangerKey(it)===k)).length;
  const remaining = Math.max(0, total - defeated);
  const hpPct = total ? Math.round((remaining/total)*100) : 0;
  if(total>0 && remaining===0){
    const weekKey = startOfWeek(currentWeek || new Date()).toISOString();
    if(loadBossRewardWeek() !== weekKey){
      addXP(500);
      saveBossRewardWeek(weekKey);
      showToast("+500 XP for defeating the boss!");
    }
  }
  const threatCard = el("div",{class:`threat-card level-${threatScore.level}`},
    el("div",{class:"threat-head"},
      el("div",{class:"threat-title"},"Threat Level"),
      el("div",{class:"threat-badge"}, threatScore.level.toUpperCase())
    ),
    el("div",{class:"threat-gauge"}, el("span",{style:`width:${threatScore.score}%`}))
  );
  const bossCard = el("div",{class:"boss-card"},
    el("div",{class:"boss-head"},
      el("div",{class:"boss-title"},"Boss Fight: Pixel Wyrm"),
      el("div",{class:"boss-meta"}, `${remaining} / ${total} HP left`)
    ),
    el("div",{class:"boss-visual"},
      el("div",{class:"boss-monster"}),
      el("div",{class:"boss-bar"}, el("span",{style:`width:${hpPct}%`}))
    ),
    el("div",{class:"boss-note"}, "Strike each task as you finish it. Clear the week to defeat the boss and earn XP.")
  );
  const replies = loadRepliesState();
  const remainingReplies = Math.max(0, (replies.needed||15) - (replies.done||0));
  const replyPct = Math.min(100, Math.round((replies.done||0) * 100 / (replies.needed||15)));
  const replyCard = el("div",{class:"reply-card"},
    el("div",{class:"reply-head"},
      el("div",null,"Discussion replies"),
      el("div",{class:"reply-meta"}, `${replies.done||0} / ${replies.needed||15}`)
    ),
    el("div",{class:"reply-bar"}, el("span",{style:`width:${replyPct}%`})),
    el("div",{class:"reply-actions"},
      el("button",{class:"btn",type:"button",onclick:()=>{
        const before = replies.done||0;
        replies.done = Math.max(0, Math.min((replies.needed||15), (replies.done||0)+1));
        if(replies.done > before){
          addXP?.(1);
        }
        saveRepliesState(replies);
        renderDangerZone();
      }},"+1 done"),
      el("button",{class:"btn",type:"button",onclick:()=>{
        replies.done = 0;
        saveRepliesState(replies);
        renderDangerZone();
      }},"Reset week")
    ),
    el("div",{class:"reply-note"}, remainingReplies>0 ? `${remainingReplies} replies left this week.` : "All replies logged for this week."),
    el("div",{class:"reply-note", style:"display:flex;align-items:center;gap:8px;margin-top:6px;"},
      el("span",{style: replies.citations ? "text-decoration:line-through;opacity:0.7;" : ""},"Double-check citations on current discussion post."),
      el("button",{
        class:`btn ${replies.citations ? "ghost" : ""}`,
        type:"button",
        onclick:()=>{
          replies.citations = !replies.citations;
          saveRepliesState(replies);
          if(replies.citations) addXP?.(30);
          renderDangerZone();
        }
      }, replies.citations ? "Struck" : "Strike it")
    )
  );
  const citationCard = el("div",{class:"reply-card"},
    el("div",{class:"reply-head"},
      el("div",null,"Essay citations double-check"),
      el("div",{class:"reply-meta"}, replies.citations ? "Done" : "Pending")
    ),
    el("div",{class:"reply-note"}, "Verify quotes, page numbers, and bibliography before you submit."),
    el("div",{class:"reply-actions"},
      el("button",{class:`btn ${replies.citations ? "ghost" : ""}`,type:"button",onclick:()=>{
        replies.citations = !replies.citations;
        saveRepliesState(replies);
        if(replies.citations) addXP?.(30);
        renderDangerZone();
      }}, replies.citations ? "Unstrike" : "Strike")
    )
  );
  const strip = renderBriefingStrip(threatScore, items);
  zone.append(
    el("div",{class:"danger-label"},"Danger Zone"),
    threatCard,
    replyCard,
    citationCard,
    strip || document.createElement("div"),
    resourceCard,
    list,
    bossCard
  );
  renderBriefLog();
}function updateStoryModeCard(){
    if(!storyModeCard) return;
    const habitPct = calcHabitProgress();
    const stageIdx = Math.min(storyStages.length-1, Math.floor(Math.max(0, (rpgState.level-1))/3));
    const stage = storyStages[stageIdx] || storyStages[0];
    const missions = getUpcomingAssignments(3);
    const primary = missions[0];
    const backup = missions[1];
    const formatDue = (item)=>{
      if(!item || !item.due) return "No due date";
      const d = new Date(item.due);
      const label = d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
      const delta = item.daysLeft;
      const suffix = delta===0 ? "due today" : (delta>0 ? `${delta}d left` : `${Math.abs(delta)}d late`);
      return `${label} • ${suffix}`;
    };
    if(storyModeStage) storyModeStage.textContent = stage.name;
    if(storyModeText){
      const intelLine = primary
        ? `Next case: ${primary.title} hits ${new Date(primary.due).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}.`
        : "Bring in your .ics feed to load the next briefing.";
      storyModeText.textContent = `${stage.desc} ${intelLine}`;
    }
    if(storyModeList){
      storyModeList.innerHTML = "";
      const bullets = [];
      bullets.push(primary
        ? `Evidence queue: ${primary.title} (${formatDue(primary)})`
        : "Evidence queue: Waiting on imported deadlines.");
      if(backup){
        bullets.push(`Shadow lead: ${backup.title} (${formatDue(backup)})`);
      }
      const freezeCount = streakFreeze.charges || 0;
      bullets.push(`Field readiness: Habits ${habitPct}% • ${freezeCount} Freeze${freezeCount===1?"":"s"} stocked`);
      bullets.push(`Rank: ${getRpgTitle(rpgState.level)} (${rpgState.xp}/${xpForLevel(rpgState.level)} XP)`);
      bullets.forEach(line=>{
        const li = document.createElement("li");
        li.textContent = line;
        storyModeList.append(li);
      });
    }
    if(storyModeFooter){
      const xpNeeded = Math.max(0, xpForLevel(rpgState.level) - rpgState.xp);
      const habitGap = Math.max(0, 100 - habitPct);
      storyModeFooter.textContent = xpNeeded
        ? `${xpNeeded} XP to your next promotion • ${habitGap}% habit power to max out.`
        : `Promotion pending. Keep habits green for another ${habitGap}% to seal the chapter.`;
    }
  }
  // Trigger celebratory UI when streak milestones are hit.
  function maybeCelebrateStreak(beforeCurrent, afterCurrent, beforeBest, afterBest){
    if(afterCurrent <= beforeCurrent && afterBest <= beforeBest) return;
    if(afterCurrent < 3 && afterBest <= beforeBest) return;
    let title = "Streak Extended!";
    let text = `You're on a ${afterCurrent}-day streak. Keep the intel flowing.`;
    if(afterCurrent > 0 && afterCurrent % 7 === 0){
      title = "Perfect Week!";
      text = `Seven-day run secured. HQ upgraded your narrative path.`;
    } else if(afterBest > beforeBest){
      title = "New Record!";
      text = `Longest streak yet: ${afterBest} days.`;
    }
    showCelebration(title, text);
  }
  // Render and wire integration toggle switches.
  function renderIntegrationToggles(){
    if(!integrationCard || !integrationToggles.length) return;
    integrationToggles.forEach(toggle=>{
      const id = toggle.dataset.integration;
      if(!(id in integrationPrefs)) integrationPrefs[id] = false;
      toggle.checked = !!integrationPrefs[id];
      toggle.addEventListener("change",()=>{
        integrationPrefs[id] = toggle.checked;
        saveIntegrationPrefs();
        showToast("Integration cue updated");
        updateIntegrationSuggestion(true);
      });
    });
    updateIntegrationSuggestion();
  }
  // Rotate contextual integration suggestions based on active toggles and schedule.
  function updateIntegrationSuggestion(forceActive=false){
    if(!integrationCard || !integrationNudgeText) return;
    const active = Object.keys(integrationPrefs).filter(key=>integrationPrefs[key]);
    let pool = Object.keys(integrationScripts);
    if(forceActive && active.length){
      pool = active;
    } else if(active.length){
      pool = active;
    }
    const choice = pool.length ? pool[Math.floor(Math.random()*pool.length)] : "newTab";
    const base = integrationScripts[choice] || integrationScripts.newTab;
    const habitPct = calcHabitProgress();
    const upcoming = getUpcomingAssignments(1)[0];
    const extra = upcoming ? ` Next up: ${upcoming.title} (${new Date(upcoming.due).toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})}).` : " Keep the calendar hook alive to stay ahead.";
    integrationNudgeText.textContent = `${base} Habit progress is ${habitPct}% this week.${extra}`;
  }
  // Pick and display a reflection prompt.
  function updateReflectionPrompt(forceNew=false){
    if(!reflectionPromptEl || !reflectionPrompts.length) return;
    if(forceNew || currentReflectionPrompt >= reflectionPrompts.length){
      let next = Math.floor(Math.random()*reflectionPrompts.length);
      if(reflectionPrompts.length > 1){
        while(next === currentReflectionPrompt){
          next = Math.floor(Math.random()*reflectionPrompts.length);
        }
      }
      currentReflectionPrompt = next;
      reflectionState.promptIndex = next;
      saveReflectionState();
    }
    reflectionPromptEl.textContent = reflectionPrompts[currentReflectionPrompt] || reflectionPrompts[0];
  }
  // Update reflection metadata label.
  function updateReflectionMeta(){
    if(!reflectionMeta) return;
    if(reflectionState.savedAt){
      const stamp = new Date(reflectionState.savedAt);
      reflectionMeta.textContent = `Last logged ${stamp.toLocaleString()}`;
    } else {
      reflectionMeta.textContent = "No reflection logged yet.";
    }
  }
  // Render reflection UI with prompt and saved text.
  function renderReflectionCard(){
    if(!reflectionCard) return;
    updateReflectionPrompt(false);
    if(reflectionInput) reflectionInput.value = reflectionState.text || "";
    updateReflectionMeta();
  }

  function startStudyNag(promptIfNeeded=true){
    if(studyNagTimer || !("Notification" in window)) return;
    const baseLines = [
      "Are you studying or should I file an official complaint?",
      "Study check: are you working or do I need to start humming elevator music?",
      "Quick poke: back to the books or should I get upset?",
      "Friendly reminder: the notes won't read themselves.",
      "Status: waiting for you to study. Please don't make me pout.",
      "Alert: You have not even started, do you even care?",
      "Your coffee is getting cold and so is your grade.",
      "I just saw your to-do list cry.",
      "Paging scholar: the tasks are staging a protest.",
      "This is your conscience. Go study.",
      "Stop scrolling. Start doing.",
      "Imagine finishing now. Feels good, right? So move.",
      "Another tab? Really? Back to the assignment.",
      "Your pillow says: earn me. Study, then sleep."
    ];
    const duckLines = [
      "Duck says: quack your way back to the timer.",
      "The duck put on sunglasses but took them off—finish a session to earn them back.",
      "Duck tilts its head: that was a short break… too short.",
      "Disappointing the duck? Bold move. Get back to the block.",
      "The duck is tapping its foot. That’s not a good sign."
    ];
    const mascotLines = [
      "Pixel pup rolled its eyes. Start a Pomodoro to redeem yourself.",
      "Mascot hype: finish one task and I’ll drop a victory sticker.",
      "Mascot growl: deadlines are prowling—move!",
      "Mascot flex: one focus block and I’ll chill.",
      "Pixel pup brings water. Now you bring focus."
    ];
    const allLines = baseLines.concat(duckLines, mascotLines);
    const send = ()=>{
      let msg = "";
      const missions = getUpcomingAssignments(3);
      if(missions && missions.length){
        const target = missions.find(m=>m.daysLeft<=2) || missions[0];
        if(target){
          const cleanTitle = target.title.replace(/\[.*?\]\s*/,"").trim() || target.title;
          let when = "soon";
          if(target.daysLeft===0) when = "today";
          else if(target.daysLeft===1) when = "tomorrow";
          else if(target.daysLeft<0) when = `${Math.abs(target.daysLeft)} day${Math.abs(target.daysLeft)===1?"":"s"} late`;
          else when = `in ${target.daysLeft} day${target.daysLeft===1?"":"s"}`;
          msg = `Hey, your ${cleanTitle} boss fight is ${when}. Gear up!`;
        }
      }
      if(!msg){
        const pool = allLines;
        msg = pool[Math.floor(Math.random()*pool.length)];
      }
      try{
        new Notification("Study check", { body: msg });
      }catch(e){}
    };
    const schedule = ()=>{
      if(studyNagTimer) return;
      studyNagTimer = setInterval(()=>{
        if(Notification.permission !== "granted") return;
        send();
      }, 60*60*1000);
      setTimeout(()=>{ if(Notification.permission==="granted") send(); }, 60*1000);
    };
    const handlePermission = (value)=>{
      updateNotificationStatus();
      if(value === "granted") schedule();
    };
    const state = Notification.permission;
    if(state === "granted"){
      handlePermission("granted");
      return;
    }
    if(state === "denied"){
      handlePermission("denied");
      return;
    }
    if(!promptIfNeeded) return;
    try{
      const result = Notification.requestPermission();
      if(result && typeof result.then === "function"){
        result.then(handlePermission);
      } else {
        handlePermission(Notification.permission);
      }
    }catch(err){
      console.warn("Notification permission request failed", err);
    }
  }

  function renderWorkload(){ return; }

  render();
  // workload UI removed
  weekViewToggle?.addEventListener("click", setPlannerWeekView);
  classViewToggle?.addEventListener("click", setPlannerClassView);
  // workload UI removed
  moodSelect?.addEventListener("change",e=>{
    moodEnergyState.mood = e.target.value;
    saveMoodEnergy(moodEnergyState);
    render();
  });
  energySelect?.addEventListener("change",e=>{
    moodEnergyState.energy = e.target.value;
    saveMoodEnergy(moodEnergyState);
    render();
  });

  const habitListEl = document.getElementById("habits-list");
  const habitProgressEl = document.getElementById("habits-progress");
  const habitAddBtn = document.getElementById("habit-add");
  const habitResetWeekBtn = document.getElementById("habit-reset-week");
  const habitSaveBtn = document.getElementById("habit-save");
  const habitExportBtn = document.getElementById("habit-export");
  const habitExportCsvBtn = document.getElementById("habit-export-csv");
  const habitImportInput = document.getElementById("habit-import");
  const habitImportCsvInput = document.getElementById("habit-import-csv");
  function calcHabitProgress(){
    const total = habitsState.length * 7;
    const done = habitsState.reduce((acc,h)=>acc + h.days.filter(Boolean).length, 0);
    return total ? Math.round(done * 100 / total) : 0;
  }
  function renderHabits(){
    if(!habitListEl) return;
    habitListEl.innerHTML = "";
    const pct = calcHabitProgress();
    if(habitProgressEl) habitProgressEl.textContent = `Week progress: ${pct}%`;
    if(!habitsState.length){
      habitListEl.append(el("div",{class:"habit-empty"},"No habits yet. Click \"Add habit\" to begin."));
      return;
    }
    habitsState.forEach((habit, idx)=>{
      const cat = habitCatById(habit.cat);
      const row = el("div",{class:"habit-row"});
      const info = el("div",{class:"habit-info"});
      const chip = el("span",{class:"chip"},cat.emoji || "Ã¢â‚¬Â¢");
      const nameInput = el("input",{type:"text",value:habit.name});
      nameInput.addEventListener("input",e=>{ habitsState[idx].name = e.target.value; });
      const select = el("select");
      HABIT_CATEGORIES.forEach(c=>{
        const opt = el("option",{value:c.id},c.label);
        if(c.id===habit.cat) opt.selected = true;
        select.append(opt);
      });
      select.addEventListener("change",e=>{ habitsState[idx].cat = e.target.value; renderHabits(); });
      info.append(chip,nameInput,select);
      row.append(info);
      const daysWrap = el("div",{class:"habit-days"});
      dayOrder.forEach((dayLabel, dayIdx)=>{

        const btn = el("button",{type:"button",class:`habit-day ${habit.days[dayIdx]?"on":""}`,title:dayLabel}, dayLabel[0]);

        btn.addEventListener("click",()=>{
          const next = !habit.days[dayIdx];
          habitsState[idx].days[dayIdx] = next;
          recordHabitCompletion(habit.id, getHabitDateForDay(dayIdx), next);
          if(next) addXP(3);
          renderHabits();
        });

        daysWrap.append(btn);

      });

      row.append(daysWrap);

      const historyPreview = renderHabitHistoryDots(habit.id);

      row.append(historyPreview);

      const actions = el("div",{style:"display:flex;gap:8px;flex-wrap:wrap;align-items:center;"});

      const streakInfo = getHabitStreakInfo(habit.id);

      const streakBadge = el("div",{class:"habit-streak"});

      streakBadge.textContent = `Streak: ${streakInfo.current}d`;

      if(streakInfo.best > streakInfo.current){

        const best = el("small",{class:"habit-streak-best"},`Best ${streakInfo.best}d`);

        streakBadge.append(best);

      }

      const removeBtn = el("button",{class:"btn",type:"button"},"Day` Remove");

      removeBtn.addEventListener("click",()=>{

        habitsState.splice(idx,1);

        delete habitHistory[habit.id];

        saveHabitHistory();

        renderHabits();

      });

      actions.append(streakBadge, removeBtn);

      row.append(actions);

      habitListEl.append(row);

    });
    renderHabitGraph();
    updateStoryModeCard();
  }
  function renderHabitGraph(){
    if(!document.getElementById("habit-graph-styles")){
      const style = document.createElement("style");
      style.id = "habit-graph-styles";
      style.textContent = `
        #habit-graph{margin-top:10px;padding:12px;border:1px solid var(--border,#1f2937);border-radius:12px;background:linear-gradient(180deg,#0b1220,#0f172a);color:inherit;}
        .habit-graph-head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:flex-start;margin-bottom:10px;}
        .habit-graph-title{font-weight:700;font-size:15px;}
        .habit-graph-note{font-size:12px;opacity:0.8;margin:2px 0 0 0;}
        .habit-graph-legend{display:flex;gap:8px;flex-wrap:wrap;align-items:center;font-size:12px;}
        .habit-legend-item{display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;background:rgba(255,255,255,0.04);}
        .habit-legend-dot{width:10px;height:10px;border-radius:999px;display:inline-block;box-shadow:0 0 0 1px rgba(0,0,0,0.25);}
        .habit-graph-grid{display:flex;flex-direction:column;gap:6px;}
        .habit-graph-row{display:grid;grid-template-columns:140px repeat(7,minmax(0,1fr));gap:6px;align-items:center;padding:4px 6px;border-radius:8px;}
        .habit-graph-row:nth-child(odd){background:rgba(255,255,255,0.02);}
        .habit-name{font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
        .habit-dot{width:14px;height:14px;border-radius:50%;margin:0 auto;opacity:0.28;background:var(--dot,#3b82f6);box-shadow:0 0 0 1px rgba(0,0,0,0.35);}
        .habit-dot.on{opacity:1;box-shadow:0 0 0 2px rgba(255,255,255,0.1),0 0 0 1px rgba(0,0,0,0.3);}
        .habit-total{font-size:12px;text-align:center;font-weight:600;opacity:0.85;}
        .habit-graph-row.labels{background:transparent;border-top:1px solid var(--border,#1f2937);padding-top:8px;}
        .habit-day{font-size:12px;text-align:center;opacity:0.8;}
      `;
      document.head.append(style);
    }
    let graph = document.getElementById("habit-graph");
    if(!graph){
      graph = el("div",{id:"habit-graph"});
      habitListEl.parentElement?.insertBefore(graph, habitListEl);
    }
    const catColors = {
      study:"#60a5fa",
      exercise:"#34d399",
      meals:"#fbbf24",
      admin:"#a78bfa",
      free:"#f97316",
      night:"#22d3ee",
      none:"#94a3b8"
    };
    const totals = dayOrder.map((_, idx)=> habitsState.reduce((sum,h)=> sum + (h.days[idx]?1:0), 0));
    const catsUsed = Array.from(new Set(habitsState.map(h=>h.cat)));
    const dayInitials = dayOrder.map(d=>d[0]);
    graph.innerHTML = `
      <div class="habit-graph-head">
        <div>
          <div class="habit-graph-title">Weekly habit hits</div>
          <p class="habit-graph-note">Dots brighten when you hit that habit day.</p>
        </div>
        <div class="habit-graph-legend">
          ${catsUsed.map(cat=>{
            const color = catColors[cat] || "#3b82f6";
            const label = (habitCatById(cat)?.label || cat).replace(/^[^A-Za-z0-9]+/,"");
            return `<span class="habit-legend-item"><span class="habit-legend-dot" style="background:${color}"></span><span>${label}</span></span>`;
          }).join("")}
        </div>
      </div>
      <div class="habit-graph-grid">
        ${habitsState.map(habit=>{
          const color = catColors[habit.cat] || "#3b82f6";
          return `<div class="habit-graph-row">
            <div class="habit-name">${habit.name || "Habit"}</div>
            ${dayOrder.map((day, idx)=>{
              const hit = !!habit.days[idx];
              return `<div class="habit-dot ${hit?"on":""}" title="${day}: ${hit?"Hit":"Miss"}" style="--dot:${color};"></div>`;
            }).join("")}
          </div>`;
        }).join("")}
        <div class="habit-graph-row totals">
          <div class="habit-name">Totals</div>
          ${totals.map((count, idx)=>`<div class="habit-total" title="${dayOrder[idx]}: ${count} hit${count===1?"":"s"}">${count}</div>`).join("")}
        </div>
        <div class="habit-graph-row labels">
          <div></div>
          ${dayInitials.map(d=>`<div class="habit-day">${d}</div>`).join("")}
        </div>
      </div>
    `;
  }
  function saveHabitsNow(message=true){
    saveHabits(habitsState);
    if(message) showToast("Habits saved!");
  }
  freezeBuyBtn?.addEventListener("click",()=>{
    if(rpgState.xp < STREAK_FREEZE_COST){
      showToast(`Need ${STREAK_FREEZE_COST} XP to buy a Streak Freeze.`, "warn");
      return;
    }
    streakFreeze.charges = (streakFreeze.charges||0) + 1;
    saveStreakFreeze();
    addXP(-STREAK_FREEZE_COST);
    updateStreakFreezeBar();
    showToast("Streak Freeze stocked! Use it before a busy day.");
  });
  freezeUseBtn?.addEventListener("click",()=>{
    const target = new Date();
    target.setDate(target.getDate()-1);
    if(useStreakFreeze(target)){
      showToast(`Protected your streak for ${target.toLocaleDateString()}.`);
    } else {
      showToast("No Streak Freeze ready or already used for yesterday.", "warn");
    }
  });
  habitAddBtn?.addEventListener("click",()=>{
    habitsState.push(normalizeHabit({name:"New habit", cat:"none"}));
    renderHabits();
  });
  habitResetWeekBtn?.addEventListener("click",()=>{
    habitsState = habitsState.map(h=>({...h, days: blankWeek()}));
    renderHabits();
  });
  habitSaveBtn?.addEventListener("click",()=>saveHabitsNow());
  habitExportBtn?.addEventListener("click",()=>{
    const blob = new Blob([JSON.stringify({habits:habitsState},null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "habits.json";
    a.click();
    URL.revokeObjectURL(url);
  });
  habitExportCsvBtn?.addEventListener("click",()=>{
    const header = ["Habit","Category",...dayOrder];
    const lines = [header.join(",")];
    habitsState.forEach(h=>{
      const row = [h.name.replace(/"/g,'""'), habitCatById(h.cat).label, ...h.days.map(v=>v?"1":"0")];
      lines.push(row.map(cell=>`"${cell}"`).join(","));
    });
    downloadBlob(lines.join("\n"),"habits.csv","text/csv");
    showToast("Habit CSV exported");
  });
  habitImportInput?.addEventListener("change",e=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      try{
        const data = JSON.parse(String(reader.result));
        const list = Array.isArray(data?.habits) ? data.habits : (Array.isArray(data) ? data : null);
        if(list){
          habitsState = list.map(normalizeHabit);
          renderHabits();
          saveHabitsNow(false);
          showToast("Habits imported!");
        }else{
          showToast("Invalid habits file","warn");
        }
      }catch(err){
        showToast("Invalid habits file","warn");
      }
      habitImportInput.value = "";
    };
    reader.readAsText(file);
  });
  renderHabits();
  function normalizePhase(phase={}){
    return {
      id: phase.id || `phase-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      title: phase.title || "New phase",
      range: phase.range || "",
      focus: Array.isArray(phase.focus) ? phase.focus.filter(Boolean) : [],
      checkpoints: Array.isArray(phase.checkpoints) ? phase.checkpoints.filter(Boolean) : []
    };
  }
  function loadRoadmap(){
    if(hasStorage){
      try{
        const raw = JSON.parse(localStorage.getItem(ROADMAP_KEY));
        if(Array.isArray(raw)) return raw.map(normalizePhase);
      }catch(e){}
    }
    return deepCopy(defaultRoadmap);
  }
  function saveRoadmap(){
    if(hasStorage) localStorage.setItem(ROADMAP_KEY, JSON.stringify(roadmapState));
  }
    function renderRoadmapEditor(){
    const container = document.getElementById("roadmap-editor");
    if(!container) return;
    container.innerHTML = "";
    roadmapState.forEach((phase, idx)=>{
      const card = document.createElement("div");
      card.className = "roadmap-card";
      const title = document.createElement("input");
      title.value = phase.title;
      title.placeholder = "Phase title";
      title.addEventListener("input",e=>{ roadmapState[idx].title = e.target.value; saveRoadmap(); });
      const range = document.createElement("input");
      range.value = phase.range;
      range.placeholder = "Timeline";
      range.addEventListener("input",e=>{ roadmapState[idx].range = e.target.value; saveRoadmap(); });
      const focus = document.createElement("textarea");
      focus.value = (phase.focus||[]).join("\n");
      focus.placeholder = "Focus (one per line)";
      focus.addEventListener("input",e=>{
        roadmapState[idx].focus = e.target.value.split(/\n+/).map(line=>line.trim()).filter(Boolean);
        saveRoadmap();
      });
      const checkpoints = document.createElement("textarea");
      checkpoints.value = (phase.checkpoints||[]).join("\n");
      checkpoints.placeholder = "Checkpoints (one per line)";
      checkpoints.addEventListener("input",e=>{
        roadmapState[idx].checkpoints = e.target.value.split(/\n+/).map(line=>line.trim()).filter(Boolean);
        saveRoadmap();
      });
      const actions = document.createElement("div");
      actions.className = "roadmap-actions";
      const remove = document.createElement("button");
      remove.className = "btn";
      remove.type = "button";
      remove.textContent = "Remove phase";
      remove.addEventListener("click",()=>{
        roadmapState.splice(idx,1);
        saveRoadmap();
        renderRoadmapEditor();
      });
      actions.append(remove);
      card.append(title, range, focus, checkpoints, actions);
      container.append(card);
    });
    const addBtn = document.createElement("button");
    addBtn.className = "btn";
    addBtn.type = "button";
    addBtn.textContent = "Add phase";
    addBtn.addEventListener("click",()=>{
      roadmapState.push(normalizePhase());
      saveRoadmap();
      renderRoadmapEditor();
    });
    container.append(addBtn);
  }

  function normalizeSkillProgress(skill={}){
    const template = defaultSkills.find(s=>s.id===skill.id);
    const stages = Array.isArray(skill.stages) && skill.stages.length ? skill.stages : (template ? template.stages.slice() : ["Stage"]);
    const id = skill.id || template?.id || `skill-${Date.now()}`;
    const title = skill.title || template?.title || "Skill";
    const level = Math.max(0, Math.min(skill.level || 0, stages.length-1));
    return { id, title, stages, level };
  }
  function loadSkillProgress(){
    if(hasStorage){
      try{
        const raw = JSON.parse(localStorage.getItem(SKILL_KEY));
        if(Array.isArray(raw)) return raw.map(normalizeSkillProgress);
      }catch(e){}
    }
    return deepCopy(defaultSkills);
  }
  function saveSkillProgress(){
    if(hasStorage) localStorage.setItem(SKILL_KEY, JSON.stringify(skillProgressState));
  }
  function updateSkillLevel(id, level){
    const skill = skillProgressState.find(s=>s.id===id);
    if(!skill) return;
    skill.level = Math.max(0, Math.min(level, skill.stages.length-1));
    saveSkillProgress();
    renderSkillVisualizer();
  }
  function renderSkillVisualizer(){
    const container = document.getElementById("skill-visualizer");
    if(!container) return;
    container.innerHTML = "";
    skillProgressState.forEach(skill=>{
      const card = document.createElement("div");
      card.className = "skill-card";
      const title = document.createElement("h4");
      title.textContent = skill.title;
      card.append(title);
      const steps = document.createElement("div");
      steps.className = "skill-steps";
      skill.stages.forEach((stage, idx)=>{
        const row = document.createElement("div");
        row.className = "skill-step" + (idx<=skill.level ? " done":"");
        const label = document.createElement("span");
        label.textContent = stage;
        row.append(label);
        if(idx !== skill.level){
          const btn = document.createElement("button");
          btn.type = "button";
          btn.textContent = "Set here";
          btn.addEventListener("click",()=>updateSkillLevel(skill.id, idx));
          row.append(btn);
        }else{
          const badge = document.createElement("span");
          badge.style.marginLeft = "auto";
          badge.style.fontSize = "12px";
          badge.textContent = "Current";
          row.append(badge);
        }
        steps.append(row);
      });
      card.append(steps);
      container.append(card);
    });
  }
  (function initBreakChecks(){
    const BREAK_STATS_KEY = "planner_break_counts";
    const defaultStats = { abs:0, push:0, stretch:0 };
    const loadStats = ()=>{
      if(!hasStorage) return { ...defaultStats };
      try{
        const raw = JSON.parse(localStorage.getItem(BREAK_STATS_KEY));
        return { ...defaultStats, ...(raw && typeof raw === "object" ? raw : {}) };
      }catch(e){
        return { ...defaultStats };
      }
    };
    const saveStats = (stats)=>{
      if(!hasStorage) return;
      try{ localStorage.setItem(BREAK_STATS_KEY, JSON.stringify(stats)); }catch(e){}
    };
    const stats = loadStats();

    function ensureStatsBar(){
      const card = document.querySelector("#panel-pomodoro .pomo-side-card");
      if(!card) return null;
      let bar = document.getElementById("pomo-break-stats");
      if(bar) return bar;
      bar = document.createElement("div");
      bar.id = "pomo-break-stats";
      bar.style.display = "grid";
      bar.style.gridTemplateColumns = "repeat(3,minmax(0,1fr))";
      bar.style.gap = "6px";
      bar.style.fontSize = "12px";
      bar.style.margin = "6px 0 10px";
      bar.innerHTML = `
        <div class="pomo-break-stat"><div>Abs</div><strong data-break-count="abs">0</strong></div>
        <div class="pomo-break-stat"><div>Pushups</div><strong data-break-count="push">0</strong></div>
        <div class="pomo-break-stat"><div>Stretch</div><strong data-break-count="stretch">0</strong></div>
      `;
      const header = card.querySelector("h3");
      if(header) header.insertAdjacentElement("afterend", bar);
      else card.prepend(bar);
      return bar;
    }

    function renderStats(){
      const bar = ensureStatsBar();
      if(!bar) return;
      ["abs","push","stretch"].forEach(key=>{
        const node = bar.querySelector(`[data-break-count="${key}"]`);
        if(node) node.textContent = stats[key] || 0;
      });
    }

    const increment = (key)=>{
      if(!key || !(key in stats)) return;
      stats[key] = (stats[key] || 0) + 1;
      saveStats(stats);
      renderStats();
    };

    const updatePill = (pill)=>{
      const checkboxes = Array.from(pill.querySelectorAll("input[type='checkbox']"));
      const weekdays = Array.from(pill.querySelectorAll(".pomo-weekday"));
      if(checkboxes.length){
        pill.classList.toggle("done", checkboxes.every(cb=>cb.checked));
      } else if(weekdays.length){
        pill.classList.toggle("done", weekdays.every(btn=>btn.classList.contains("on")));
      }
    };
    document.querySelectorAll(".pomo-pill input[type='checkbox']").forEach(box=>{
      const pill = box.closest(".pomo-pill");
      if(!pill) return;
      updatePill(pill);
      box.addEventListener("change",()=>{
        const breakType = box.dataset.break;
        if(box.checked && breakType === "abs") increment("abs");
        if(box.checked && breakType === "push") increment("push");
        updatePill(pill);
      });
    });
    document.querySelectorAll(".pomo-weekday").forEach(btn=>{
      const pill = btn.closest(".pomo-pill");
      btn.addEventListener("click",()=>{
        const wasOn = btn.classList.contains("on");
        btn.classList.toggle("on");
        if(!wasOn){
          const wrap = btn.closest("[data-break]");
          if(wrap && wrap.dataset.break === "split-week") increment("stretch");
        }
        updatePill(pill);
      });
    });
    renderStats();
  })();

  (function initPomodoro(){
  const durationLabel = document.getElementById("pomo-durations");
  const timeEl = document.getElementById("pomo-time");
  if(!durationLabel || !timeEl) return;

  let FOCUS_MIN = 52;
  let SHORT_BREAK_MIN = 17;
  let LONG_BREAK_MIN = 30;
  const TOTAL_CYCLES = 4;
  const tasks = [
    "30-minute ab workout - hollow holds, leg raises, bicycle crunches, planks",
    "100 Push Plan - break it into four rounds of 25 with strict form",
    "Front split stretches - lunge pulses, quad openers",
    "Recovery walk - light stroll and deep breathing between rounds"
  ];
  const autoStartEnabled = true;
  let cycle = 1;
  let cyclesCompleted = 0;
  let mode = "focus";
  let secondsLeft = FOCUS_MIN * 60;
  let running = false;
  const MINI_BREAK_INTERVAL = 10 * 60; // every 10 minutes
  const MINI_BREAK_DURATION = 60; // 1 minute mini break
  let nextMiniBreakAt = MINI_BREAK_INTERVAL;
  let miniBreakActive = false;
  let miniBreakRemaining = 0;
  let miniBreakStartedAt = null;
  let timerId = null;
  let startedAt = null;
  let beepCtx = null;
  let lastBreakChime = null;
  let breakWarned = false;
  let oneMinuteWarned = false;
  const BREAK_CHIME_KEY = "planner_pomo_break_chime";
  let breakChimeOn = true;

  const circleEl = document.getElementById("pomo-circle");
  const modeLabel = document.getElementById("pomo-mode");
  const modeHint = document.getElementById("pomo-mode-hint");
  const cycleEl = document.getElementById("pomo-cycle");
  const completedEl = document.getElementById("pomo-complete");
  const startBtn = document.getElementById("pomo-start");
  const skipBtn = document.getElementById("pomo-skip");
  const resetBtn = document.getElementById("pomo-reset");
  const dots = [1,2,3,4].map(n=>document.getElementById("pomo-dot"+n));
  const taskText = document.getElementById("pomo-task");
  const shuffleBtn = document.getElementById("pomo-shuffle");
  const focusInput = document.getElementById("pomo-focus-input");
  const shortInput = document.getElementById("pomo-short-input");
  const longInput = document.getElementById("pomo-long-input");
  const breakChimeToggle = document.getElementById("pomo-break-chime-toggle");
  const isTypingTarget = el => el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

  function updateDurationLabel(){
    durationLabel.textContent = `${FOCUS_MIN}-min focus • ${SHORT_BREAK_MIN}-min short breaks • ${LONG_BREAK_MIN}-min final break`;
  }

  function loadBreakChime(){
    try{
      const raw = localStorage.getItem("planner_pomo_break_chime");
      if(raw === "false") return false;
    }catch(e){}
    return true;
  }
  function saveBreakChime(val){
    try{ localStorage.setItem("planner_pomo_break_chime", val ? "true" : "false"); }catch(e){}
  }

  function playBeep(type="default"){
    try{
      if(!beepCtx){
        beepCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      const now = beepCtx.currentTime;
      const addTone = (freq, duration=0.3, offset=0)=>{
        const osc = beepCtx.createOscillator();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + offset);
        osc.connect(beepCtx.destination);
        osc.start(now + offset);
        osc.stop(now + offset + duration);
      };
      if(type === "focus-long"){
        addTone(1400, 0.25, 0);
        addTone(720, 0.2, 0.18);
        addTone(1400, 0.25, 0.38);
        return;
      }
      if(type === "focus-short"){
        addTone(1200, 0.25, 0);
        addTone(1200, 0.25, 0.2);
        return;
      }
      const freq = type === "focus" ? 1200 : type === "long" ? 520 : type === "break" ? 660 : 880;
      addTone(freq, 0.35, 0);
    }catch(e){
      console.warn("Audio beep failed", e);
    }
  }

  function notifyStage(prevMode){
    const tone = mode === "focus"
      ? (prevMode === "long" ? "focus-long" : prevMode === "short" ? "focus-short" : "focus")
      : (mode === "long" ? "long" : "break");
    playBeep(tone);
    if(!("Notification" in window)) return;
    const title = "Pomodoro Timer";
    const body = mode === "focus"
      ? `Focus session started for ${FOCUS_MIN} minutes.`
      : mode === "short"
        ? `Short break for ${SHORT_BREAK_MIN} minutes.`
        : `Long break for ${LONG_BREAK_MIN} minutes.`;
    const fire = ()=>{ try{ new Notification(title,{body}); }catch(e){ console.warn("Notification failed", e); } };
    if(Notification.permission === "granted"){
      fire();
    } else if(Notification.permission !== "denied"){
      Notification.requestPermission().then(p=>{ if(p==="granted") fire(); });
    }
  }

  function pad(n){ return String(n).padStart(2,"0"); }
  function fmt(sec){ const m = Math.floor(sec/60); const s = sec%60; return `${pad(m)}:${pad(s)}`; }
  function totalFor(which){
    if(which==="focus") return FOCUS_MIN*60;
    if(which==="short") return SHORT_BREAK_MIN*60;
    if(which==="long") return LONG_BREAK_MIN*60;
    return 0;
  }

  function updateRender(){
    if(miniBreakActive){
      const total = MINI_BREAK_DURATION;
      const pct = total ? ((total - miniBreakRemaining) / total) * 100 : 0;
      const limited = Math.min(100, Math.max(0, pct));
      if(circleEl){
        const degrees = (limited / 100) * 360;
        circleEl.style.setProperty("--deg", `${degrees}deg`);
      }
      timeEl.textContent = fmt(miniBreakRemaining);
      document.title = `${timeEl.textContent}  Mini break - Pomodoro`;
      return;
    }
    const total = totalFor(mode);
    const pct = total ? ((total - secondsLeft) / total) * 100 : 0;
    const limited = Math.min(100, Math.max(0, pct));
    if(circleEl){
      const degrees = (limited / 100) * 360;
      circleEl.style.setProperty("--deg", `${degrees}deg`);
    }
    timeEl.textContent = fmt(secondsLeft);
    document.title = `${timeEl.textContent} • ${modeLabel.textContent} — Pomodoro`;
  }

  function updateCycleUI(){
    cycleEl.textContent = cycle;
    completedEl.textContent = cyclesCompleted;
    dots.forEach((dot, idx)=>{ if(dot) dot.classList.toggle("on", idx < cycle); });
  }
  function resetMiniBreakSchedule(){
    miniBreakActive = false;
    miniBreakRemaining = 0;
    miniBreakStartedAt = null;
    nextMiniBreakAt = (mode === "focus" && FOCUS_MIN * 60 >= MINI_BREAK_INTERVAL) ? MINI_BREAK_INTERVAL : 0;
  }
  function enterMiniBreak(){
    miniBreakActive = true;
    miniBreakStartedAt = Date.now();
    miniBreakRemaining = MINI_BREAK_DURATION;
    nextMiniBreakAt += MINI_BREAK_INTERVAL;
    modeLabel.textContent = "Mini break";
    modeHint.textContent = "Jumping jacks for 60s — move and breathe.";
    showToast("Mini break: 60s of jumping jacks!");
    playBeep("break");
  }
  function exitMiniBreak(){
    if(miniBreakActive && miniBreakStartedAt){
      const pausedMs = Date.now() - miniBreakStartedAt;
      // Shift start so focus time doesn't shrink while the mini break runs.
      startedAt += pausedMs;
    }
    miniBreakActive = false;
    miniBreakRemaining = 0;
    miniBreakStartedAt = null;
    modeLabel.textContent = "Focus";
    modeHint.textContent = `Focus for ${FOCUS_MIN} minutes. Mini break every 10 minutes.`;
    updateRender();
  }

  function setMode(newMode){
    mode = newMode;
    breakWarned = false;
    oneMinuteWarned = false;
    lastBreakChime = null;
    resetMiniBreakSchedule();
    secondsLeft = totalFor(mode);
    startedAt = null;
    modeLabel.textContent = mode === "focus" ? "Focus" : (mode === "short" ? "Short break" : "Long break");
    modeHint.textContent = mode === "focus"
      ? `Focus for ${FOCUS_MIN} minutes. Mini break every 10 minutes.`
      : mode === "short"
        ? `Short break for ${SHORT_BREAK_MIN} minutes.`
        : `Long break for ${LONG_BREAK_MIN} minutes.`;
    updateRender();
  }

  function tick(){
    if(!running) return;
    const now = Date.now();
    if(!startedAt) startedAt = now;
    if(mode === "focus" && miniBreakActive){
      if(!miniBreakStartedAt){
        miniBreakStartedAt = now - (MINI_BREAK_DURATION - miniBreakRemaining) * 1000;
      }
      const elapsedMini = Math.floor((now - miniBreakStartedAt)/1000);
      miniBreakRemaining = Math.max(0, MINI_BREAK_DURATION - elapsedMini);
      updateRender();
      if(miniBreakRemaining > 0) return;
      exitMiniBreak();
    }
    const elapsed = Math.floor((now - startedAt)/1000);
    const total = totalFor(mode);
    secondsLeft = Math.max(0, total - elapsed);
    if(mode === "focus" && !miniBreakActive && nextMiniBreakAt > 0 && elapsed >= nextMiniBreakAt){
      enterMiniBreak();
      updateRender();
      return;
    }
    if((mode==="short" || mode==="long") && !breakWarned && secondsLeft <= 600){
      speakBreakWarning();
      breakWarned = true;
    }
    if((mode==="short" || mode==="long") && !oneMinuteWarned && secondsLeft <= 60){
      speakOneMinuteReminder();
      oneMinuteWarned = true;
    }
    updateRender();
    if(running && (mode==="short" || mode==="long") && breakChimeOn){
      const elapsedBucket = Math.floor((total - secondsLeft) / 30);
      if(elapsedBucket > 0 && elapsedBucket !== lastBreakChime){
        playBeep();
        lastBreakChime = elapsedBucket;
      }
    }
    if(secondsLeft <= 0){
      nextStage();
    }
  }

  function start(){
    const subjectInput = document.getElementById("pomo-subject-input");
    const subjectMsg = document.getElementById("pomo-subject-msg");
    if(mode === "focus" && subjectInput && !subjectInput.value.trim()){
      if(subjectMsg) subjectMsg.textContent = "Tag your class/project before starting.";
      subjectInput.focus();
      return;
    }
    if(running) return;
    if(mode === "focus" && miniBreakActive){
      miniBreakStartedAt = Date.now() - (MINI_BREAK_DURATION - miniBreakRemaining) * 1000;
    } else {
      startedAt = Date.now() - (totalFor(mode) - secondsLeft) * 1000;
    }
    running = true;
    timerId = setInterval(tick, 1000);
    startBtn.textContent = "Pause";
    breakChimeOn = loadBreakChime();
    if(breakChimeToggle){
      breakChimeToggle.checked = breakChimeOn;
    }
  }

  function pause(){
    running = false;
    clearInterval(timerId);
    timerId = null;
    startBtn.textContent = "Start";
  }

  function nextStage(){
    const prevMode = mode;
    pause();
    if(mode === "focus"){
      cyclesCompleted += 1;
      cycle = cyclesCompleted + 1;
      if(cyclesCompleted % TOTAL_CYCLES === 0){
        setMode("long");
      } else {
        setMode("short");
      }
    } else {
      setMode("focus");
      if(cycle > TOTAL_CYCLES) cycle = 1;
    }
    updateCycleUI();
    notifyStage(prevMode);
    if(autoStartEnabled) start();
  }
  function pickFemaleVoice(){
    try{
      const list = (typeof speechSynthesis !== "undefined") ? speechSynthesis.getVoices() : [];
      if(!list || !list.length) return null;
      const match = list.find(v=>/female|woman|girl|Google UK English Female|Google US English Female/i.test((v.name||"") + " " + (v.voiceURI||"")));
      if(match) return match;
      const en = list.find(v=>/^en/i.test(v.lang||""));
      return en || list[0] || null;
    }catch(e){
      return null;
    }
  }

  function speakBreakWarning(){
    const mins = Math.max(1, Math.round(secondsLeft/60));
    const line = mode === "focus"
      ? `About ${mins} minutes left to study. Prepare for break.`
      : `About ${mins} minutes left on your ${mode === "long" ? "long break" : "break"}. Get ready to focus.`;
    try{
      if("speechSynthesis" in window){
        const u = new SpeechSynthesisUtterance(line);
        const voice = pickFemaleVoice();
        if(voice) u.voice = voice;
        speechSynthesis.speak(u);
        return;
      }
    }catch(e){}
    if(typeof Notification === "function" && Notification.permission === "granted"){
      try{ new Notification("Break ending soon", { body: line }); }catch(e){}
    }
  }

  function speakOneMinuteReminder(){
    const line = "One minute left in your break. Get ready to study.";
    try{
      if("speechSynthesis" in window){
        const u = new SpeechSynthesisUtterance(line);
        const voice = pickFemaleVoice();
        if(voice) u.voice = voice;
        speechSynthesis.speak(u);
        return;
      }
    }catch(e){}
  }

  function resetAll(){
    pause();
    cycle = 1;
    cyclesCompleted = 0;
    lastBreakChime = null;
    setMode("focus");
    updateCycleUI();
    addXP(5);
  }

  function skip(){
    pause();
    nextStage();
  }

  function suggestTask(force){
    if(!taskText) return;
    if(!force && mode === "focus") return;
    const pick = tasks[Math.floor(Math.random() * tasks.length)];
    const [title, detail=""] = pick.split(" - ");
    taskText.innerHTML = `<strong>${title}</strong> - ${detail}`;
  }

  startBtn.addEventListener("click", ()=>{ running ? pause() : start(); });
  skipBtn.addEventListener("click", skip);
  resetBtn.addEventListener("click", resetAll);
  shuffleBtn.addEventListener("click", ()=>suggestTask(true));
  const clampMinutes = (val)=> Math.max(1, Math.min(80, val||0));
  focusInput?.addEventListener("input", e=>{
    const val = clampMinutes(parseInt(e.target.value, 10));
    FOCUS_MIN = val;
    focusInput.value = val;
    updateDurationLabel();
    if(mode === "focus"){
      secondsLeft = FOCUS_MIN * 60;
      startedAt = null;
      updateRender();
      modeHint.textContent = `Focus for ${FOCUS_MIN} minutes. Mini break every 10 minutes.`;
      resetMiniBreakSchedule();
    }
  });
  shortInput?.addEventListener("input", e=>{
    const val = clampMinutes(parseInt(e.target.value, 10));
    SHORT_BREAK_MIN = val;
    shortInput.value = val;
    updateDurationLabel();
    if(mode === "short"){
      secondsLeft = SHORT_BREAK_MIN * 60;
      startedAt = null;
      updateRender();
      modeHint.textContent = `Short break for ${SHORT_BREAK_MIN} minutes.`;
    }
  });
  longInput?.addEventListener("input", e=>{
    const val = clampMinutes(parseInt(e.target.value, 10));
    LONG_BREAK_MIN = val;
    longInput.value = val;
    updateDurationLabel();
    if(mode === "long"){
      secondsLeft = LONG_BREAK_MIN * 60;
      startedAt = null;
      updateRender();
      modeHint.textContent = `Long break for ${LONG_BREAK_MIN} minutes.`;
    }
  });
  if(breakChimeToggle){
    breakChimeOn = loadBreakChime();
    breakChimeToggle.checked = breakChimeOn;
    breakChimeToggle.addEventListener("change", ()=>{
      breakChimeOn = !!breakChimeToggle.checked;
      saveBreakChime(breakChimeOn);
    });
  } else {
    breakChimeOn = loadBreakChime();
  }

  document.addEventListener("keydown", e=>{
    if(isTypingTarget(e.target)) return;
    if(e.code === "Space"){
      e.preventDefault();
      running ? pause() : start();
    }
    if(e.key && e.key.toLowerCase() === "r") resetAll();
    if(e.key && e.key.toLowerCase() === "n") skip();
    if(e.key && e.key.toLowerCase() === "s") suggestTask(true);
  });

  updateDurationLabel();
  updateCycleUI();
  setMode("focus");
  suggestTask(true);
  if(autoStartEnabled){
    start();
  } else {
    updateRender();
  }
})();

  let renderCalendarPanel = ()=>{};
  (function initCalendar(){
    const rangeEl = document.getElementById("cal-range");
    const gridEl = document.getElementById("cal-grid");
    const allRow = document.getElementById("cal-all-row");
    const prevBtn = document.getElementById("cal-prev");
    const nextBtn = document.getElementById("cal-next");
    const dateInput = document.getElementById("cal-date");
    const showAllChk = document.getElementById("cal-show-all");
    const compactChk = document.getElementById("cal-compact");
    const importInput = document.getElementById("cal-import");
    const clearBtn = document.getElementById("cal-clear");
    const exportBtn = document.getElementById("cal-export-ics");
    const exportChoresBtn = document.getElementById("cal-export-chores");
    const icsStatus = document.getElementById("cal-ics-status");
    const dayOffsets = { Sunday:0, Monday:1, Tuesday:2, Wednesday:3, Thursday:4, Friday:5, Saturday:6 };
    if(!rangeEl || !gridEl) return;

    let week = currentWeek;
    const pad = n => String(n).padStart(2,"0");
    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

    function parseICS(text){
      function unfold(str){ return str.replace(/\r\n[ \t]/g,"").replace(/\n[ \t]/g,""); }
      function parseDate(val){
        let s = String(val||"").trim();
        // remove timezone prefix if present: DTSTART;TZID=America/...:value
        s = s.split(";").pop().split("=").pop();
        s = s.replace(/[^0-9TzZ]/g,"").replace(/T/,"").replace(/Z/,"");
        // accept formats like 20241123 or 20241123T235900
        if(s.length < 8) return null;
        const y = parseInt(s.slice(0,4),10);
        const m = parseInt(s.slice(4,6),10) - 1;
        const d = parseInt(s.slice(6,8),10);
        if(s.length <= 8){
          return { date: new Date(y,m,d,0,0,0), allDay: true };
        }
        const hh = parseInt(s.slice(8,10)||"0",10);
        const mm = parseInt(s.slice(10,12)||"0",10);
        const ss = parseInt(s.slice(12,14)||"0",10);
        return { date: new Date(y,m,d,hh,mm,ss), allDay: false };
      }
      const clean = unfold(text);
      const blocks = clean.split(/BEGIN:VEVENT/).slice(1).map(b=>"BEGIN:VEVENT"+b.split(/END:VEVENT/)[0]+"END:VEVENT");
      const events = [];
      blocks.forEach(block=>{
        const lines = block.split(/\r?\n/);
        let dtstart = null;
        let dtend = null;
        let allDay = false;
        let summary = "";
        let description = "";
        let url = "";
        lines.forEach(line=>{
          if(!line) return;
          if(line.startsWith("DTSTART")){
            const val = line.split(":").slice(1).join(":").trim();
            const parsed = parseDate(val);
            dtstart = parsed.date;
            if(parsed.allDay) allDay = true;
          } else if(line.startsWith("DTEND")){
            const val = line.split(":").slice(1).join(":").trim();
            const parsed = parseDate(val);
            dtend = parsed.date;
          } else if(line.startsWith("SUMMARY")){
            summary = line.split(":").slice(1).join(":").trim().replace(/[<>]/g,"");
          } else if(line.startsWith("DESCRIPTION")){
            description = line.split(":").slice(1).join(":").trim().replace(/[<>]/g,"");
          } else if(line.startsWith("URL")){
            url = line.split(":").slice(1).join(":").trim();
          }
        });
        if(dtstart){
          events.push({
            start: dtstart.toISOString(),
            end: (dtend || dtstart).toISOString(),
            allDay,
            title: summary || "(No title)",
            description: description || "",
            url
          });
        }
      });
      return events;
    }

    function overlapsDay(ev, day){
      const start = new Date(ev.start);
      const end = new Date(ev.end);
      const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 0,0,0,0);
      const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23,59,59,999);
      return start <= dayEnd && end >= dayStart;
    }

    function escapeICSValue(value){
      return (value || "").replace(/\r?\n/g,"\\n").replace(/,/g,"\\,").replace(/;/g,"\\;");
    }

    function formatDateForICS(date){
      return `${date.getFullYear()}${pad(date.getMonth()+1)}${pad(date.getDate())}`;
    }

    function formatTimestampForICS(date){
      return date.toISOString().replace(/[-:]/g,"").replace(/\.\d+Z$/,"Z");
    }

    function buildChoreICS(baseWeek){
      const weekStart = new Date(baseWeek);
      weekStart.setHours(0,0,0,0);
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "CALSCALE:GREGORIAN",
        "PRODID:-//Failsafe Planner//Chores//EN"
      ];
      const pad = n => String(n).padStart(2,"0");
      const formatDate = d => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`;

      const chores = [
        { title:"Bathroom reset", dayOffset:1 },
        { title:"Laundry run", dayOffset:2 },
        { title:"Grocery/Walmart necessities (with a list)", dayOffset:3 },
        { title:"Social time with friends", dayOffset:4 },
        { title:"Full-body shave", dayOffset:5 },
        { title:"Credit freeze/SSN lock check (3 bureaus)", dayOffset:6 },
        { title:"Creative reps: video editing or pyrography", dayOffset:0 },
        { title:"Fridge clear + wipe (biweekly)", dayOffset:2 },
        { title:"Dye hair (one-time)", dayOffset:6 }
      ];

      chores.forEach((chore, idx)=>{
        const start = new Date(weekStart);
        start.setDate(weekStart.getDate() + (chore.dayOffset || 0));
        const end = new Date(start);
        end.setDate(start.getDate() + 1);
        lines.push(
          "BEGIN:VEVENT",
          `UID:chore-${idx}-${Date.now()}`,
          `DTSTAMP:${formatTimestampForICS(new Date())}`,
          `SUMMARY:${chore.title}`,
          `DESCRIPTION:${chore.title}`,
          `DTSTART;VALUE=DATE:${formatDate(start)}`,
          `DTEND;VALUE=DATE:${formatDate(end)}`,
          "END:VEVENT"
        );
      });

      lines.push("END:VCALENDAR");
      return lines.join("\r\n");
    }

    function buildPlannerICS(){
      const weekStart = new Date(week);
      weekStart.setHours(0,0,0,0);
      const lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "CALSCALE:GREGORIAN",
        "PRODID:-//Failsafe Planner//EN"
      ];
      let count = 0;
      dayOrder.forEach(dayName=>{
        const entries = data[dayName] || [];
        if(!entries.length) return;
        const offset = dayOffsets[dayName] ?? 0;
        const dayDate = new Date(weekStart);
        dayDate.setDate(weekStart.getDate() + offset);
        const nextDay = new Date(dayDate);
        nextDay.setDate(dayDate.getDate() + 1);
        entries.forEach((entry, idx)=>{
          const trimmed = (entry || "").trim();
          if(!trimmed) return;
          const summary = escapeICSValue(trimmed);
          lines.push(
            "BEGIN:VEVENT",
            `UID:planner-${dayName}-${offset}-${idx}-${Date.now()}`,
            `DTSTAMP:${formatTimestampForICS(new Date())}`,
            `SUMMARY:${summary}`,
            `DESCRIPTION:${summary}`,
            `DTSTART;VALUE=DATE:${formatDateForICS(dayDate)}`,
            `DTEND;VALUE=DATE:${formatDateForICS(nextDay)}`,
            "END:VEVENT"
          );
          count += 1;
        });
      });
      lines.push("END:VCALENDAR");
      return { content: lines.join("\r\n"), count };
    }

    function updateICSStatus(message, tone){
      if(!icsStatus) return;
      icsStatus.textContent = message;
      icsStatus.classList.toggle("warn", tone === "warn");
      icsStatus.classList.toggle("success", tone === "success");
    }

    renderCalendarPanel = function(){
      week = currentWeek;
      const events = loadEvents();
      if(dateInput){
        dateInput.value = `${week.getFullYear()}-${pad(week.getMonth()+1)}-${pad(week.getDate())}`;
      }
      const end = new Date(week);
      end.setDate(week.getDate()+6);
rangeEl.textContent = `${week.toLocaleDateString(undefined,{month:"short",day:"numeric"})} - ${end.toLocaleDateString(undefined,{month:"short",day:"numeric"})}`;
      const showAll = showAllChk ? showAllChk.checked : true;
      const compact = compactChk ? compactChk.checked : false;
      const formatHourLabel = (h)=>{
        const ampm = h >= 12 ? "PM" : "AM";
        const hour12 = ((h + 11) % 12) + 1;
        return `${hour12}:00 ${ampm}`;
      };
      if(allRow){
        allRow.innerHTML = "";
        const showRow = showAll && !compact;
        allRow.classList.toggle("hidden", !showRow);
        if(showRow){
          const label = document.createElement("div");
          label.textContent = "All-day";
          allRow.append(label);
          for(let i=0;i<7;i++){
            const day = new Date(week);
            day.setDate(week.getDate()+i);
            const cell = document.createElement("div");
            const allDayItems = events.filter(ev => ev.allDay && overlapsDay(ev, day));
            if(!allDayItems.length){
              cell.textContent = "";
            } else {
              allDayItems.forEach(ev=>{
                const tag = document.createElement("span");
                tag.className = "cal-tag";
                tag.textContent = ev.title;
                cell.append(tag);
              });
            }
            allRow.append(cell);
          }
        }
      }
      gridEl.innerHTML = "";
      const headTime = document.createElement("div");
      headTime.className = "cal-h";
      headTime.textContent = "Time";
      gridEl.append(headTime);

      for(let i=0;i<7;i++){
        const day = new Date(week);
        day.setDate(week.getDate()+i);
        const header = document.createElement("div");
        header.className = "cal-h";
        header.textContent = `${days[day.getDay()]} ${day.getMonth()+1}/${day.getDate()}`;
        gridEl.append(header);
      }

      const timeCol = document.createElement("div");
      timeCol.className = "cal-col cal-time-col";
      for(let h=0; h<24; h++){
        const hour = document.createElement("div");
        hour.className = "cal-hour cal-time-hour";
        hour.textContent = formatHourLabel(h);
        timeCol.append(hour);
      }
      gridEl.append(timeCol);

      for(let i=0;i<7;i++){
        const col = document.createElement("div");
        col.className = "cal-col";
        for(let h=0; h<24; h++){
          const hour = document.createElement("div");
          hour.className = "cal-hour";
          col.append(hour);
        }
        const day = new Date(week);
        day.setDate(week.getDate()+i);
        const timedEvents = events.filter(ev => !ev.allDay && overlapsDay(ev, day));
        timedEvents.forEach(ev=>{
          const s = new Date(ev.start);
          const e = new Date(ev.end);
          const top = s.getHours()*60 + s.getMinutes();
          const bottom = e.getHours()*60 + e.getMinutes();
          const eventEl = document.createElement("div");
          eventEl.className = "event";
          eventEl.style.top = `${top}px`;
          eventEl.style.height = `${Math.max(20, bottom - top)}px`;
          eventEl.textContent = ev.title;
          if(ev.description) eventEl.title = ev.description;
          col.append(eventEl);
        });
        gridEl.append(col);
      }
      currentWeek = week;
    };

    prevBtn && prevBtn.addEventListener("click", ()=>{ week.setDate(week.getDate()-7); currentWeek = week; renderCalendarPanel(); });
    nextBtn && nextBtn.addEventListener("click", ()=>{ week.setDate(week.getDate()+7); currentWeek = week; renderCalendarPanel(); });
    dateInput && dateInput.addEventListener("change", e=>{
      const val = e.target.value;
      if(!val) return;
      const next = new Date(val);
      if(!isNaN(next)) week = startOfWeek(next);
      currentWeek = week;
      renderCalendarPanel();
    });
    showAllChk && showAllChk.addEventListener("change", renderCalendarPanel);
    compactChk && compactChk.addEventListener("change", renderCalendarPanel);
    clearBtn && clearBtn.addEventListener("click", ()=>{
      if(confirm("Clear all imported events?")){
        localStorage.removeItem(CAL_KEY);
        renderCalendarPanel();
        updateICSStatus("Imported events cleared.", "success");
      }
    });
    importInput && importInput.addEventListener("change", e=>{
      const file = e.target.files && e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try{
          const imported = parseICS(String(reader.result));
          if(imported.length){
            const existing = loadEvents();
            saveEvents(existing.concat(imported));
            updateICSStatus(`Imported ${imported.length} events from ${file.name}.`, "success");
            renderCalendarPanel();
          } else {
            updateICSStatus("No events found in that file.", "warn");
          }
        }catch(err){
          updateICSStatus("Could not read calendar file.", "warn");
        }
        importInput.value = "";
      };
      reader.readAsText(file);
    });

    exportBtn && exportBtn.addEventListener("click", ()=>{
      const { content, count } = buildPlannerICS();
      if(!count){
        updateICSStatus("No planner entries found for this week.", "warn");
        return;
      }
      const startLabel = `${week.getFullYear()}-${pad(week.getMonth()+1)}-${pad(week.getDate())}`;
      const endDate = new Date(week);
      endDate.setDate(week.getDate()+6);
      const endLabel = `${endDate.getFullYear()}-${pad(endDate.getMonth()+1)}-${pad(endDate.getDate())}`;
      const fileName = `planner-${startLabel}-${endLabel}.ics`;
      downloadBlob(content, fileName, "text/calendar;charset=utf-8");
    const rangeLabel = rangeEl ? rangeEl.textContent : `${startLabel} - ${endLabel}`;
    updateICSStatus(`Exported ${count} planner entries for ${rangeLabel}.`, "success");
  });

    exportChoresBtn && exportChoresBtn.addEventListener("click", ()=>{
      const weekStart = currentWeek || startOfWeek(new Date());
      const content = buildChoreICS(weekStart);
      const startLabel = `${weekStart.getFullYear()}-${String(weekStart.getMonth()+1).padStart(2,"0")}-${String(weekStart.getDate()).padStart(2,"0")}`;
      const fileName = `chores-${startLabel}.ics`;
      downloadBlob(content, fileName, "text/calendar;charset=utf-8");
      updateICSStatus("Chores.ics downloaded for this week.", "success");
    });

    renderCalendarPanel();
      updateICSStatus("Import or export .ics files in this tab.");
    })();

  function parseCourseMeta(title){
    const match = /\[(.+?)\]/.exec(title || "");
    const code = match ? match[1].trim() : "General";
    const courseTitle = (title || "").replace(match ? match[0] : "", "").trim() || title || "";
    const parts = code.split(/\s+/);
    const termKey = (parts[0] || "").toUpperCase();
    let term = "";
    if(termKey.includes("FA")) term = "fall";
    else if(termKey.includes("SP")) term = "spring";
    else if(termKey.includes("SU")) term = "summer";
    const courseId = parts.slice(1).join(" ").trim() || code;
    return { code, courseId, courseTitle, term };
  }

  function buildClassCoursesFromEvents(events){
    const list = [];
    const map = new Map();
    events.forEach(ev=>{
      if(!ev || !ev.title) return;
      const meta = parseCourseMeta(ev.title);
      if(!map.has(meta.courseId)){
        map.set(meta.courseId,{
          id: meta.courseId,
          code: meta.code,
          term: meta.term || "all",
          entries: []
        });
      }
      map.get(meta.courseId).entries.push({
        title: meta.courseTitle || ev.title,
        rawTitle: ev.title,
        due: ev.start,
        description: ev.description || "",
        url: ev.url || ""
      });
    });
    map.forEach(course=>{
      course.entries.sort((a,b)=> new Date(a.due).getTime() - new Date(b.due).getTime());
      list.push(course);
    });
    list.sort((a,b)=> a.id.localeCompare(b.id));
    return list;
  }

  function buildClassData(){
    try{
      let events = loadEvents();
      if(!Array.isArray(events) || !events.length){
        // try ICS-IMPORT feed if available
        if(typeof RAW_ICS !== "undefined"){
          const parsed = parseICSFeed(RAW_ICS);
          if(parsed.length){
            events = parsed;
            saveEvents(events);
          }
        }
        if(!events || !events.length){
          events = fallbackClassEvents;
        }
      }
      const now = Date.now();
      const futureWindow = 365*24*60*60*1000; // 12 months ahead to keep future terms
      const pastWindow = 180*24*60*60*1000;   // 6 months back
      events = events.filter(ev=>{
        const start = new Date(ev.start || ev.due || ev.date || "").getTime();
        if(!start || isNaN(start)) return false;
        // keep within a sensible window to avoid huge DOM/render cost
        return start >= now - pastWindow && start <= now + futureWindow;
      });
      // cap total to avoid freezes on very large .ics imports
      if(events.length > 1200){
        events.sort((a,b)=> new Date(a.start||0) - new Date(b.start||0));
        events = events.slice(-1200);
      }
      classCourses = buildClassCoursesFromEvents(events);
      if(!selectedCourseId && classCourses.length){
        selectedCourseId = classCourses[0].id;
      }
      if(!classCourses.length){
        console.warn("Class view: no courses found after parsing events", { eventsCount: events.length });
      }
    }catch(err){
      console.error("buildClassData error", err);
      classCourses = [];
    }
  }

  function getUpcomingAssignments(limit=4){
    const MIN_DUE = new Date("2024-11-24T00:00:00").getTime();
    let events = loadEvents();
    events = (Array.isArray(events) ? events : []).filter(ev=>{
      const title = normalizeTitle(ev?.title || "");
      if(!title || /\[object\s/i.test(title)) return false;
      return ev && ev.start;
    });
    const hasRealEvents = Array.isArray(events) && events.length;
    if(!hasRealEvents){
      events = fallbackClassEvents;
    }
    const now = Date.now();
    const rangeStart = startOfWeek(currentWeek || new Date());
    rangeStart.setHours(0,0,0,0);
    const rangeEnd = new Date(rangeStart);
    rangeEnd.setDate(rangeStart.getDate()+6); // only the current week (Mon-Sun)
    rangeEnd.setHours(12,59,0,0); // treat Sunday 12:59pm as end-of-window
    const upcoming = [];
    const seen = new Set();
    events.forEach(ev=>{
      if(!ev || !ev.title || !ev.start) return;
      const title = normalizeTitle(ev.title);
      if(!title || /\[object\s/i.test(title)) return;
      const due = new Date(ev.start).getTime();
      if(isNaN(due)) return;
      if(due < MIN_DUE) return;
      const inWindow = due >= rangeStart.getTime() && due <= rangeEnd.getTime();
      if(!inWindow) return;
      const daysLeft = Math.ceil((due - now)/86400000);
      const key = `${title.toLowerCase()}-${due}`;
      if(seen.has(key)) return;
      seen.add(key);
      upcoming.push({
        title,
        due,
        description: normalizeTitle(ev.description || ""),
        daysLeft,
        inWindow
      });
    });
    const prioritized = upcoming.sort((a,b)=> a.due - b.due);
    return prioritized.slice(0, limit);
  }

  function makeDangerKey(item){
    return `${normalizeTitle(item.title||"").toLowerCase()}|${item.due||""}`;
  }
  function loadDangerBossDone(){
    try{
      const raw = JSON.parse(localStorage.getItem(DANGER_BOSS_KEY)||"[]");
      return new Set(Array.isArray(raw)?raw:[]);
    }catch(e){
      return new Set();
    }
  }
  function saveDangerBossDone(set){
    try{
      localStorage.setItem(DANGER_BOSS_KEY, JSON.stringify(Array.from(set||[])));
    }catch(e){}
  }
  function loadBossRewardWeek(){
    try{ return localStorage.getItem(BOSS_REWARD_KEY) || ""; }catch(e){ return ""; }
  }
  function saveBossRewardWeek(key){
    try{ localStorage.setItem(BOSS_REWARD_KEY, key); }catch(e){}
  }
  function loadBriefPrefs(){
    try{
      const raw = JSON.parse(localStorage.getItem(BRIEF_PREF_KEY)||"{}");
      return { enabled: raw.enabled!==false, tone: raw.tone || "heroic" };
    }catch(e){ return { enabled:true, tone:"heroic" }; }
  }
  function saveBriefPrefs(prefs){
    try{ localStorage.setItem(BRIEF_PREF_KEY, JSON.stringify(prefs||{})); }catch(e){}
  }
  function loadBriefLog(){
    try{
      const raw = JSON.parse(localStorage.getItem(BRIEF_KEY)||"[]");
      return Array.isArray(raw) ? raw : [];
    }catch(e){ return []; }
  }
  function saveBriefLog(list){
    try{ localStorage.setItem(BRIEF_KEY, JSON.stringify(list||[])); }catch(e){}
  }
  function loadBriefPrefs(){
    try{
      const raw = JSON.parse(localStorage.getItem(BRIEF_PREF_KEY)||"{}");
      return { enabled: raw.enabled!==false, tone: raw.tone || "heroic" };
    }catch(e){ return { enabled:true, tone:"heroic" }; }
  }
  function saveBriefPrefs(prefs){
    try{ localStorage.setItem(BRIEF_PREF_KEY, JSON.stringify(prefs||{})); }catch(e){}
  }
  function loadStabilityPrefs(){
    try{
      const raw = JSON.parse(localStorage.getItem(STABILITY_PREF_KEY)||"{}");
      return { enabled: raw.enabled!==false };
    }catch(e){ return { enabled:true }; }
  }
  function saveStabilityPrefs(prefs){
    try{ localStorage.setItem(STABILITY_PREF_KEY, JSON.stringify(prefs||{})); }catch(e){}
  }
  function loadStabilityState(){
    const today = startOfWeek(new Date()).toISOString(); // week-scoped
    try{
      const raw = JSON.parse(localStorage.getItem(STABILITY_KEY)||"{}");
      if(raw.week !== today){
        return { week: today, current:0, best: raw.best||0, lastDay:null };
      }
      return { week: today, current: raw.current||0, best: raw.best||0, lastDay: raw.lastDay||null };
    }catch(e){
      return { week: today, current:0, best:0, lastDay:null };
    }
  }
  function saveStabilityState(state){
    try{ localStorage.setItem(STABILITY_KEY, JSON.stringify(state||{})); }catch(e){}
  }
  function loadRepliesState(){
    const wk = startOfWeek(new Date()).toISOString();
    try{
      const raw = JSON.parse(localStorage.getItem(REPLIES_KEY)||"{}");
      if(raw.week !== wk){
        return { week:wk, needed:15, done:0, citations:false };
      }
      return {
        week:wk,
        needed: raw.needed || 15,
        done: Math.max(0, raw.done||0),
        citations: !!raw.citations
      };
    }catch(e){
      return { week:wk, needed:15, done:0, citations:false };
    }
  }
  function saveRepliesState(state){
    try{ localStorage.setItem(REPLIES_KEY, JSON.stringify(state||{})); }catch(e){}
  }
  function generateBriefEntry(threatScore, items){
    const prefs = loadBriefPrefs();
    if(!prefs.enabled) return null;
    const today = new Date().toDateString();
    const log = loadBriefLog();
    if(log[0]?.date === today) return log[0];
    const tone = prefs.tone || "heroic";
    const countSoon = threatScore.soon || 0;
    const countOver = threatScore.overdue || 0;
    const total = items.length;
    const streak = loadStabilityState().current || 0;
    const best = loadStabilityState().best || 0;
    const pick = (arr)=> arr[Math.floor(Math.random()*arr.length)];
    let text = "";
    if(countOver > 0 || threatScore.level === "red"){
      const critical = tone==="snarky"
        ? [
          "Critical breach risk! Overdue intel and ticking clocks. Move or get overrun.",
          "HQ screaming in the radio: missions overdue, power flickering. Fix it now.",
          "Walls rattling—missed ops let hostiles in. Patch the hole today."
        ]
        : [
          `Critical: ${countOver} overdue, ${countSoon} imminent. Base running on emergency power—engage all units.`,
          "Red alert: Overdue dispatches triggered alarms. Crews on emergency rotation.",
          "Command log: Breach reported due to missed missions. Mobilize counter-attack."
        ];
      text = pick(critical);
    } else if(threatScore.level === "orange"){
      const high = tone==="snarky"
        ? [
          "High alert. Multiple hostiles inbound. Stop polishing gear and deploy.",
          "Radar hot with pings. Missions due soon—move it.",
          "Pressure rising: ops stack up. Time to clear the queue."
        ]
        : [
          `High alert: ${countSoon} mission${countSoon===1?"":"s"} due soon. Teams prepping defenses.`,
          "Status: High. Multiple deadlines in range. Secure them before nightfall.",
          "Ops room: Several missions inbound. Dispatch teams now."
        ];
      text = pick(high);
    } else if(threatScore.level === "yellow"){
      const mid = tone==="snarky"
        ? [
          "Sensors ping mild chatter. A couple missions creeping closer—stay frosty.",
          "Elevated threat: not panic, but no nap either.",
          "Ops whispers: deadlines on the horizon. Line up your drills."
        ]
        : [
          `Elevated alert: ${countSoon} mission${countSoon===1?"":"s"} approaching. Crew running drills.`,
          "Threat: Caution. Deadlines in sight; keep teams ready.",
          "Status: Elevated. Prep a 45/15 sortie to stay ahead."
        ];
      text = pick(mid);
    } else {
      const good = tone==="snarky"
        ? [
          "All quiet. Crew is napping with one eye open—no hostiles in sight.",
          "Calm day. Scavenged snacks and ran light patrols.",
          "Nothing on radar. Enjoy the lull, but keep your boots on."
        ]
        : [
          "Day report: All clear. Missions wrapped; crew morale high and supplies intact.",
          "All quiet on the wasteland front. Systems humming; enjoy the reprieve.",
          "Ops log: No hostiles today. Crew rotated rest and light drills."
        ];
      text = pick(good);
    }
    if(streak >= 7){
      const milestone = tone==="snarky"
        ? "Streak intact—base upgrades rolling in."
        : "Streak strong; defenses reinforced.";
      text += ` ${milestone}`;
    }
    const entry = { date: today, text, level: threatScore.level, total, streak, best };
    log.unshift(entry);
    saveBriefLog(log.slice(0,50));
    return entry;
  }
  function renderBriefingStrip(threatScore, items){
    const strip = document.getElementById("daily-briefing");
    const logBtn = document.getElementById("briefing-view-log");
    const prefs = loadBriefPrefs();
    const entry = generateBriefEntry(threatScore, items||[]);
    if(!strip) return null;
    if(!prefs.enabled || !entry){
      strip.classList.add("hidden");
      return null;
    }
    strip.querySelector(".briefing-text").textContent = `Daily Briefing: ${entry.text}`;
    strip.classList.remove("hidden");
    logBtn?.addEventListener("click", renderBriefLog);
    return strip;
  }
  function renderBriefLog(){
    const container = document.getElementById("briefing-log");
    if(!container) return;
    const prefs = loadBriefPrefs();
    if(!prefs.enabled){
      container.classList.add("hidden");
      container.innerHTML = "";
      return;
    }
    const log = loadBriefLog();
    container.innerHTML = "";
    if(!log.length){
      container.classList.add("hidden");
      return;
    }
    const list = document.createElement("div");
    list.className = "briefing-log-list";
    log.forEach(entry=>{
      const row = document.createElement("div");
      row.className = `briefing-row level-${entry.level}`;
      row.textContent = `${entry.date}: ${entry.text}`;
      list.append(row);
    });
    const close = document.createElement("button");
    close.className = "btn briefing-close";
    close.type = "button";
    close.textContent = "Close log";
    close.addEventListener("click", ()=> container.classList.add("hidden"));
    container.append(list, close);
    container.classList.toggle("hidden", false);
  }

  function recordStabilitySuccess(){
    const prefs = loadStabilityPrefs();
    if(!prefs.enabled) return;
    const todayStr = new Date().toDateString();
    const state = loadStabilityState();
    if(state.lastDay === todayStr) return;
    let current = state.current || 0;
    let best = state.best || 0;
    if(state.lastDay){
      const gap = Math.floor((new Date(todayStr).getTime() - new Date(state.lastDay).getTime())/86400000);
      if(gap === 1){
        current += 1;
      } else {
        current = 1;
      }
    } else {
      current = 1;
    }
    best = Math.max(best, current);
    saveStabilityState({ week: state.week, current, best, lastDay: todayStr });
  }

  function renderStabilityStrip(){
    const strip = document.getElementById("stability-strip");
    if(!strip) return null;
    const prefs = loadStabilityPrefs();
    if(!prefs.enabled){
      strip.classList.add("hidden");
      strip.innerHTML = "";
      return null;
    }
    const state = loadStabilityState();
    const day = state.current || 0;
    const best = state.best || 0;
    const milestones = [
      {day:1,label:"Base secured"},
      {day:3,label:"Power grid restored"},
      {day:5,label:"Perimeter fence rebuilt"},
      {day:7,label:"Watchtower operational"},
      {day:10,label:"Armory stocked"},
      {day:14,label:"Reinforced walls"},
      {day:21,label:"Automated turrets online"},
      {day:30,label:"Bunker unbreachable"}
    ];
    const next = milestones.find(m=> m.day>day) || milestones[milestones.length-1];
    const pct = Math.min(100, Math.round((day / (next.day||1))*100));
    strip.innerHTML = `
      <div class="stability-head">
        <div>Base Stability</div>
        <div class="stability-meta">${day} day streak · Best ${best}</div>
      </div>
      <div class="stability-bar"><span style="width:${pct}%;"></span></div>
      <div class="stability-note">${day>=next.day ? next.label : `Next: ${next.label} at day ${next.day}`}</div>
    `;
    strip.classList.remove("hidden");
    return strip;
  }
  function loadBriefPrefs(){
    try{
      const raw = JSON.parse(localStorage.getItem(BRIEF_PREF_KEY)||"{}");
      return { enabled: raw.enabled!==false, tone: raw.tone||"heroic" };
    }catch(e){ return { enabled:true, tone:"heroic" }; }
  }
  function saveBriefPrefs(prefs){
    try{ localStorage.setItem(BRIEF_PREF_KEY, JSON.stringify(prefs||{})); }catch(e){}
  }
  function loadBriefLog(){
    try{
      const raw = JSON.parse(localStorage.getItem(BRIEF_KEY)||"[]");
      return Array.isArray(raw) ? raw : [];
    }catch(e){ return []; }
  }
  function saveBriefLog(list){
    try{ localStorage.setItem(BRIEF_KEY, JSON.stringify(list||[])); }catch(e){}
  }

  function render(){
    if(isRenderingPlanner) return;
    isRenderingPlanner = true;
    try{
    panel.innerHTML = "";
    workloadExtras = [];
    updatePlannerViewButtons();
  renderDangerZone();
  updateStoryModeCard();
  renderRpgHUD();
  if(plannerViewMode === "class"){
      try{
        buildClassData();
        const dash = typeof renderClassDashboard === "function" ? renderClassDashboard() : null;
        if(dash){
          if(storyModeCard){
            storyModeCard.style.display = "";
            storyModeCard.remove();
            panel.append(storyModeCard);
          }
          panel.append(dash);
          return;
        }
      }catch(err){
        console.error("Class view failed", err);
      }
      // fallback UI if no dashboard rendered
      const msg = document.createElement("div");
      msg.className = "note";
      msg.textContent = "No class data to display. Try importing your .ics again or switch back to Week view.";
      panel.append(msg);
      return;
  }
  if(storyModeCard){
    storyModeCard.style.display = "none";
    if(storyModeHome && storyModeCard.parentElement !== storyModeHome){
      storyModeHome.append(storyModeCard);
    }
  }
    const grid = el("div",{class:"grid"});
    dayOrder.forEach(day=>{
      const card = el("div",{class:"card","data-day":day});
      const dayBadge = el("div",{class:"day"},day);
      const toggleBtn = el("button",{class:"day-toggle",type:"button","aria-label":`Toggle ${day}`},"Ã¢â€¡â€¦");
      const toggle = (evt)=>{
        if(evt) evt.stopPropagation();
        card.classList.toggle("collapsed");
      };
      toggleBtn.addEventListener("click", toggle);
      dayBadge.addEventListener("click", toggle);
      card.append(
        dayBadge,
        toggleBtn,
        buildDay(day)
      );
      grid.append(card);
    });
    panel.append(grid, buildJournalCard());
    updateDayToggleButton();
    placeReflectionInPlanner();
    } finally {
      isRenderingPlanner = false;
    }
  }

  focusTodayBtn?.addEventListener("click", focusTodayCard);
  toggleDaysBtn?.addEventListener("click", toggleAllDayCards);
  // assignments UI removed
  weekViewToggle?.addEventListener("click",()=>{
    plannerViewMode = "week";
    updatePlannerViewButtons();
    render();
  });
  classViewToggle?.addEventListener("click",()=>{
    plannerViewMode = "class";
    updatePlannerViewButtons();
    render();
  });

  function handleDropEvent(e, targetDay){
    if(!editMode) return;
    e.preventDefault();
    const payload = dragPayload || safeParse(e.dataTransfer.getData("text/plain"));
    if(!payload || payload.day==null || payload.idx==null) return;
    const rows = Array.from(e.currentTarget.querySelectorAll(".row"));
    let targetIdx = rows.length;
    const hover = e.target.closest(".row");
    if(hover){
      targetIdx = parseInt(hover.getAttribute("data-idx") || "0",10);
      const rect = hover.getBoundingClientRect();
      const after = e.clientY > rect.top + rect.height/2;
      if(after) targetIdx += 1;
    }
    moveEntry(payload.day, payload.idx, targetDay, targetIdx);
    dragPayload = null;
  }

  function moveEntry(fromDay, fromIdx, toDay, toIdx){
    if(!Array.isArray(data[fromDay])) data[fromDay] = [];
    if(!Array.isArray(data[toDay])) data[toDay] = [];
    if(fromIdx < 0 || fromIdx >= data[fromDay].length) return;
    if(toIdx == null || isNaN(toIdx)) toIdx = data[toDay].length;
    const [item] = data[fromDay].splice(fromIdx,1);
    if(item===undefined) return;
    if(fromDay === toDay && fromIdx < toIdx) toIdx -= 1;
    toIdx = Math.max(0, Math.min(toIdx, data[toDay].length));
    data[toDay].splice(toIdx,0,item);
    saveData(data);
    render();
  }

  function buildDay(day){
  const wrap = el("div",{class:"content"});
  wrap.append(el("div",{class:"title"},"Activities"));
  const listWrap = el("div",{class:"planner-day","data-day":day});
  listWrap.addEventListener("dragover",e=>{ if(!editMode) return; e.preventDefault(); });
  listWrap.addEventListener("drop",e=>handleDropEvent(e, day));
  (data[day]||[]).forEach((line,idx)=>{
    if(day==="Sunday" && isWorkloadEntry(line)){
      const due = extractDue(line);
      const daysLeft = due ? Math.ceil((due.getTime() - Date.now())/86400000) : 0;
      workloadExtras.push({ title: line, due: due ? due.getTime() : null, daysLeft, inWindow:true });
      return;
    }
    listWrap.append(row(day, idx, line));
  });
  const add = el("button",{ class:"addrow", disabled: !editMode, onclick:()=>{ (data[day]=data[day]||[]).push("• Add a new item…"); saveData(data); render(); } },"➕ Add item");
  wrap.append(listWrap, add);
  wrap.append(el("div",{style:"margin-top:12px;font-weight:600;color:#6b21a8"},"Today's Mood"));
  const m = el("div",{class:"mood","aria-label":"Today's mood selector","role":"group"});
  moodOptions.forEach((option,i)=>{
    const selected = mood[day]===i;
    const s = el("span",{ role:"button", tabindex:"0", "aria-pressed": selected ? "true" : "false", "aria-label": `${option.label} mood`, class: selected ? "sel" : "" },option.emoji);
    s.addEventListener("click",()=>{
      mood[day]=i;
      saveMood(mood);
      render();
    });
    s.addEventListener("keydown",e=>{
      if(e.key==="Enter" || e.key===" " ){
        e.preventDefault();
        s.click();
      }
    });
    m.append(s);
  });
  wrap.append(m);
  return wrap;
}


  function buildJournalCard(){
    const card = el("div",{class:"journal-card"});
    card.append(el("h3",null,"Mood journal"), el("p",{class:"help"},"Capture how you're feeling and we'll keep it synced with the Notes tab."));
    const form = el("form",{class:"journal-form"});
    const rowWrap = el("div",{class:"journal-row"});
    const moodSelect = el("select",{id:"journal-mood"});
    ["Grateful","Motivated","Calm","Tired","Overwhelmed","Focused"].forEach(m=>{ moodSelect.append(el("option",{value:m},m)); });
    const titleInput = el("input",{type:"text",id:"journal-title",placeholder:"Optional title or tag"});
    rowWrap.append(moodSelect,titleInput);
    const textArea = el("textarea",{id:"journal-text",rows:"4",placeholder:"Write a few sentences about your mood..."});
    const submit = el("button",{type:"submit"},"Save entry");
    form.append(rowWrap,textArea,submit);
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const moodValue = moodSelect.value;
      const titleValue = titleInput.value.trim() || moodValue;
      const textValue = textArea.value.trim();
      if(!textValue){
        showToast("Please write a short entry first.","warn");
        return;
      }
      const entry = { id: Date.now(), mood: moodValue, title: titleValue, text: textValue, created: new Date().toISOString() };
      moodEntries.unshift(entry);
      saveJournal(moodEntries);
      addNoteFromMood(entry);
      titleInput.value = "";
      textArea.value = "";
      showToast("Mood saved!");
      render();
    });
    card.append(form);
    const feed = el("div",{class:"journal-feed"});
    if(!moodEntries.length){
      feed.append(el("div",{class:"journal-empty"},"No entries yet. Write your first reflection above."));
    } else {
      moodEntries.slice(0,5).forEach(entry=>{
        const item = el("div",{class:"journal-entry"});
        item.append(
          el("h4",null,entry.title || entry.mood),
          el("div",{class:"meta"}, `${new Date(entry.created || Date.now()).toLocaleString()} - ${entry.mood}`),
          el("p",null,entry.text)
        );
        feed.append(item);
      });
      if(moodEntries.length>5){
        feed.append(el("div",{class:"journal-empty"},`Showing latest 5 of ${moodEntries.length} entries.`));
      }
    }
    card.append(feed);
    return card;
  }

  function getSuggestionTag(){
    if(moodEnergyState.energy==="low" || moodEnergyState.mood==="tired") return "read";
    if(moodEnergyState.energy==="high" || moodEnergyState.mood==="energized") return "push";
    return "neutral";
  }

  function row(day, idx, text){
    const safeText = (typeof text === "string") ? text : (text && text.title) ? String(text.title) : "";
    const tag = tagFrom(safeText);
    const attrs = {class:"row","data-tag":tag,"data-idx":idx};
    if(editMode) attrs.draggable = "true";
    const r = el("div",attrs);
    if(editMode){
      r.addEventListener("dragstart",e=>{ dragPayload = {day, idx}; r.classList.add("dragging"); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", JSON.stringify(dragPayload)); });
      r.addEventListener("dragend",()=>{ dragPayload = null; r.classList.remove("dragging"); });
      const ta = el("textarea",{value:safeText});
      ta.addEventListener("input",e=>{ data[day][idx]=ta.value; saveData(data); r.setAttribute("data-tag",tagFrom(ta.value)); });
      const rm = el("button",{class:"remove",title:"Remove",onclick:()=>{ data[day].splice(idx,1); saveData(data); addXP(5); render(); }},"✖");
      r.append(ta,rm);
    } else {
      const suggestion = getSuggestionTag();
      const read = el("div",{class:`read ${suggestion}`},safeText);
      const rm = el("button",{class:"remove",title:"Remove",disabled:true},"✖");
      r.append(read,rm);
    }
    return r;
  }

  function tagFrom(t){
  // Emoji-based tags
  if (t.includes("📚")) return "blue";      // Study/Work
  if (t.includes("🏋️")) return "green";    // Exercise
  if (t.includes("🍽")) return "red";      // Meals
  if (t.includes("🎉")) return "amber";    // Free/Break
  if (t.includes("🌅") || t.includes("🌙")) return "violet"; // Morning/Night

  // Text-based fallback based on your energy
  if (moodEnergyState.energy === "low" &&
      /read|review|organize|notes/i.test(t)) return "read";

  if (moodEnergyState.energy === "high" &&
      /essay|lab|study|exam|quiz|project/i.test(t)) return "push";

  // Time or hash-based fallback to keep rows colorful
  const palette = ["blue","green","red","amber","violet"];
  const timeMatch = t.match(/(\d{1,2})\s*[:.]?\s*(\d{0,2})?\s*(am|pm)?/i);
  if(timeMatch){
    const hour = parseInt(timeMatch[1],10) || 0;
    return palette[hour % palette.length];
  }
  let hash = 0;
  for(let i=0;i<t.length;i++){ hash = (hash + t.charCodeAt(i)) % palette.length; }
  return palette[hash];
}



  function addNoteFromMood(entry){
    if(notesData.some(n=>n && n.linkedId===entry.id)) return;
    notesData.unshift({
      id: entry.id,
      linkedId: entry.id,
      title: entry.title || entry.mood || "Mood entry",
      body: entry.text || "",
      tag: "Mood journal",
      created: entry.created || new Date().toISOString()
    });
    saveNotes(notesData);
    renderNotesFeed();
  }

  function renderNotesFeed(){
    const feed = document.getElementById("notes-feed");
    if(!feed) return;
    feed.innerHTML = "";
    if(!notesData.length){
      feed.append(el("div",{class:"notes-empty"},"No notes yet. Mood entries and ChatGPT imports will appear here."));
      return;
    }
    notesData.forEach(note=>{
      const card = el("div",{class:"note-entry"});
      card.append(
        el("h4",null,note.title || "Untitled"),
        el("div",{class:"note-meta"}, `${new Date(note.created || Date.now()).toLocaleString()}${note.tag ? "•" + note.tag : "•"}`),
        el("p",null,note.body || "")
      );
      feed.append(card);
    });
  }

  function el(tag, attrs, ...children){
    const n = document.createElement(tag);
    const isAttrObject = attrs && typeof attrs === "object" && !Array.isArray(attrs) && !(attrs instanceof Node);
    const kids = isAttrObject ? children : [attrs, ...children];
    if(isAttrObject){
      for(const k in attrs){
        if(k==="class") n.className = attrs[k];
        else if(k==="value") n.value = attrs[k];
        else if(k==="disabled"){ if(attrs[k]) n.setAttribute("disabled",""); }
        else if(k==="onclick") n.addEventListener("click", attrs[k]);
        else n.setAttribute(k, attrs[k]);
      }
    }
    const append = (child)=>{
      if(child==null || child===false) return;
      if(Array.isArray(child)){
        child.forEach(append);
      } else if(child instanceof Node){
        n.append(child);
      } else {
        n.append(document.createTextNode(String(child)));
      }
    };
    kids.forEach(append);
    return n;
  }

  function safeParse(raw){ try{ return raw ? JSON.parse(raw) : null; }catch(e){ return null; } }
  function splitCSVLine(line){
    const result = [];
    let current = "";
    let inQuotes = false;
    for(let i=0;i<line.length;i++){
      const ch = line[i];
      if(ch === '"' && line[i+1] === '"'){ current += '"'; i++; continue; }
      if(ch === '"'){ inQuotes = !inQuotes; continue; }
      if(ch === "," && !inQuotes){ result.push(current); current = ""; continue; }
      current += ch;
    }
    result.push(current);
    return result;
  }

  function parseChatGPTJSON(text){
    try{
      const parsed = JSON.parse(text);
      return normalizeChatGPTPayload(parsed);
    }catch(e){
      return [];
    }
  }

  function normalizeChatGPTPayload(payload){
    let raw = [];
    if(Array.isArray(payload)) raw = payload;
    else if(Array.isArray(payload.messages)) raw = payload.messages;
    else if(Array.isArray(payload.items)) raw = payload.items;
    else if(payload.data && Array.isArray(payload.data)) raw = payload.data;
    else if(payload.mapping && typeof payload.mapping === "object"){
      raw = Object.values(payload.mapping).map(node=>node && node.message).filter(Boolean);
    }
    const cleaned = [];
    raw.forEach(item=>{
      const msg = item.message || item;
      if(!msg) return;
      const role = msg.role || msg.author?.role || msg.sender || "assistant";
      let content = "";
      if(typeof msg.content === "string") content = msg.content;
      else if(Array.isArray(msg.content)) content = msg.content.map(part=>typeof part==="string"?part:(part.text||part.value||"")).join("\n");
      else if(msg.content && Array.isArray(msg.content.parts)) content = msg.content.parts.map(part=>typeof part==="string"?part:(part.text||part.value||"")).join("\n");
      else if(msg.body) content = msg.body;
      if(content){
        cleaned.push({role, content});
      }
    });
    return cleaned;
  }

  function addChatGPTMessages(messages){
    if(!messages.length) return false;
    const stamp = Date.now();
    messages.forEach((msg,idx)=>{
      const body = (msg.content || "").trim();
      if(!body) return;
      notesData.unshift({
        id: `chatgpt-${stamp}-${idx}`,
        title: `ChatGPT (${msg.role})`,
        body,
        tag: "ChatGPT import",
        created: new Date().toISOString()
      });
    });
    saveNotes(notesData);
    renderNotesFeed();
    return true;
  }

  const viewControls = document.querySelector(".view-controls");
  const editToggleWrap = document.getElementById("chk-edit")?.parentElement;
  const setPlannerSkin = (on)=>{
    document.body.classList.toggle("planner-active", !!on);
  };
  const setViewControlsVisible = (visible)=>{
    if(!viewControls) return;
    viewControls.style.display = visible ? "" : "none";
  };
  const setEditToggleVisible = (visible)=>{
    if(!editToggleWrap) return;
    editToggleWrap.style.display = visible ? "" : "none";
  };
  const map = { "tab-planner":"panel-planner", "tab-pomodoro":"panel-pomodoro", "tab-habits":"panel-habits", "tab-notes":"panel-notes", "tab-workout":"panel-workout", "tab-settings":"panel-settings", "tab-calendar":"panel-calendar", "tab-danger":"panel-danger" };
  Object.keys(map).forEach(id=>{
    const btn = document.getElementById(id);
    if(!btn) return;
    btn.addEventListener("click",()=>{
      Object.keys(map).forEach(k=>{
        const tabBtn = document.getElementById(k);
        const pn = document.getElementById(map[k]);
        if(tabBtn) tabBtn.setAttribute("aria-selected", k===id ? "true" : "false");
        if(pn) pn.classList.toggle("hidden", k!==id);
      });
      setViewControlsVisible(id==="tab-planner");
      setEditToggleVisible(id==="tab-planner");
      setPlannerSkin(id==="tab-planner");
      if(id==="tab-calendar") renderCalendarPanel();
      if(id==="tab-notes") renderNotesFeed();
      if(id==="tab-habits") renderHabits();
      if(id==="tab-danger"){
        renderDangerZone();
        if(typeof renderGhosts==="function") renderGhosts();
      }
    });
  });
  // Ensure initial state matches the default visible tab (planner)
  setViewControlsVisible(true);
  setEditToggleVisible(true);
  setPlannerSkin(true);

  renderNotesFeed();
  renderRoadmapEditor();
  renderSkillVisualizer();
  const notesExportBtn = document.getElementById("notes-export");
  if(notesExportBtn) notesExportBtn.addEventListener("click",()=>{
    if(!notesData.length){ showToast("No notes to export.","warn"); return; }
    const blob = new Blob([JSON.stringify(notesData,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "notes.json";
    a.click();
    URL.revokeObjectURL(url);
  });
  const notesClearBtn = document.getElementById("notes-clear");
  if(notesClearBtn) notesClearBtn.addEventListener("click",()=>{
    if(!notesData.length) return;
    if(confirm("Clear all saved notes?")){
      notesData = [];
      saveNotes(notesData);
      renderNotesFeed();
    }
  });
  const notesImportFile = document.getElementById("notes-import-file");
  if(notesImportFile) notesImportFile.addEventListener("change",e=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      const messages = parseChatGPTJSON(String(reader.result||""));
      if(messages.length){
        addChatGPTMessages(messages);
        showToast(`Imported ${messages.length} messages.`);
      } else {
        showToast("No ChatGPT messages found.","warn");
      }
      notesImportFile.value = "";
    };
    reader.readAsText(file);
  });
  const notesChatBtn = document.getElementById("notes-chatgpt-btn");
  if(notesChatBtn) notesChatBtn.addEventListener("click",()=>{
    const input = document.getElementById("notes-chatgpt-text");
    if(!input) return;
    const raw = input.value.trim();
    if(!raw){ showToast("Paste ChatGPT JSON first.","warn"); return; }
    const messages = parseChatGPTJSON(raw);
    if(messages.length){
      addChatGPTMessages(messages);
      showToast(`Imported ${messages.length} messages.`);
      input.value = "";
    }else{
      showToast("No ChatGPT messages found.","warn");
    }
  });

  function initWorkoutTab(){
    const container = document.querySelector(".workout-tab");
    if(!container) return null;
    const cells = Array.from(document.querySelectorAll(".workout-editable"));
    if(!cells.length) return null;
    const defaults = cells.map(cell => cell.innerHTML);
    const toggle = document.getElementById("workout-edit-toggle");
    const saveBtn = document.getElementById("workout-save");
    const resetBtn = document.getElementById("workout-reset");
    const note = document.getElementById("workout-storage-note");
    if(note) note.textContent = hasStorage ? "" : "Browser storage is blocked - workout edits last until you close this tab.";
    const setEditMode = (on)=>{
      cells.forEach(cell => cell.setAttribute("contenteditable", on ? "true" : "false"));
      container.classList.toggle("workout-edit-on", !!on);
      if(toggle) toggle.checked = !!on;
    };
    const load = ()=>{
      if(!hasStorage) return;
      try{
        const raw = localStorage.getItem(WORKOUT_KEY);
        if(!raw) return;
        const data = JSON.parse(raw);
        if(Array.isArray(data) && data.length === cells.length){
          data.forEach((html, idx)=>{ cells[idx].innerHTML = html; });
        }
      }catch(e){}
    };
    const save = ()=>{
      if(!hasStorage){ showToast("Storage blocked — not saved","warn"); return; }
      const payload = cells.map(cell => cell.innerHTML);
      localStorage.setItem(WORKOUT_KEY, JSON.stringify(payload));
      showToast("Workout tab saved");
    };
    const reset = (silent)=>{
      if(hasStorage) localStorage.removeItem(WORKOUT_KEY);
      defaults.forEach((html, idx)=>{ cells[idx].innerHTML = html; });
      if(!silent) showToast("Workout tab reset");
    };
    toggle && toggle.addEventListener("change",e=>setEditMode(e.target.checked));
    saveBtn && saveBtn.addEventListener("click",save);
    resetBtn && resetBtn.addEventListener("click",()=>{
      if(confirm("Reset workout section to the default text?")){
        reset();
        setEditMode(false);
      }
    });
    load();
    setEditMode(false);
    return { resetToDefault: reset, setEditMode };
  }

const workoutController = initWorkoutTab();
  function initWorkoutDragAndDrop(){
    const cells = Array.from(document.querySelectorAll(".workout-editable"));
    if(!cells.length) return;
    let source = null;
    cells.forEach(cell=>{
      cell.setAttribute("draggable","true");
      cell.addEventListener("dragstart",e=>{
        source = cell;
        cell.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });
      cell.addEventListener("dragend",()=>{
        cell.classList.remove("dragging");
        source = null;
      });
      cell.addEventListener("dragover",e=>e.preventDefault());
      cell.addEventListener("drop",e=>{
        e.preventDefault();
        if(!source || source===cell) return;
        const temp = source.innerHTML;
        source.innerHTML = cell.innerHTML;
        cell.innerHTML = temp;
        if(hasStorage){
          const payload = Array.from(document.querySelectorAll(".workout-editable")).map(c=>c.innerHTML);
          localStorage.setItem(WORKOUT_KEY, JSON.stringify(payload));
        }
      });
    });
  }
  initWorkoutDragAndDrop();
  initChatbot();
  const notifyBtn = document.getElementById("btn-notify");
  const notifyStatus = document.getElementById("notify-status");
  const persistBtn = document.getElementById("btn-persist");
  const persistStatus = document.getElementById("persist-status");
  const setPersistStatus = (msg)=>{ if(persistStatus) persistStatus.textContent = msg; };
  function updateNotificationStatus(){
    if(!notifyStatus) return;
    if(!("Notification" in window)){
      notifyStatus.textContent = "This browser does not support push notifications.";
      notifyBtn?.setAttribute("disabled","true");
      return;
    }
    notifyBtn?.removeAttribute("disabled");
    const state = Notification.permission;
    if(state === "granted"){
      notifyStatus.textContent = "Push reminders are on. We'll ping you gently when you drift.";
    } else if(state === "denied"){
      notifyStatus.textContent = "Notifications are blocked. Re-enable them in your browser settings.";
    } else {
      notifyStatus.textContent = "Click the button to enable planner push reminders.";
    }
  }
  async function updatePersistStatus(){
    if(!persistStatus || !navigator.storage || !navigator.storage.persisted){
      setPersistStatus("Your browser may clear data if storage gets low.");
      return;
    }
    try{
      const granted = await navigator.storage.persisted();
      setPersistStatus(granted ? "Persistent storage is already enabled on this browser." : "Persistent storage hasn't been enabled yet.");
    }catch(e){
      setPersistStatus("Unable to check persistent storage status.");
    }
  }
  if(persistBtn){
    persistBtn.addEventListener("click",async ()=>{
      if(!navigator.storage || !navigator.storage.persist){
        setPersistStatus("Persistent storage is not supported in this browser.");
        showToast("Persistent storage isn't supported here.","warn");
        return;
      }
      try{
        const granted = await navigator.storage.persist();
        setPersistStatus(granted ? "Persistent storage granted. Your data is safer now." : "Request was denied by the browser.");
        showToast(granted ? "Persistent storage enabled!" : "Browser denied the request.", granted ? undefined : "warn");
      }catch(err){
        setPersistStatus("Could not enable persistent storage.");
        showToast("Persistent storage request failed.","warn");
      }
    });
  }
  notifyBtn?.addEventListener("click",()=>{
    if(!("Notification" in window)){
      showToast("Notifications not supported in this browser.","warn");
      updateNotificationStatus();
      return;
    }
    notifyBtn.disabled = true;
    const finalize = (result)=>{
      notifyBtn.disabled = false;
      updateNotificationStatus();
      if(result === "granted"){
        startStudyNag(false);
        showToast("Push reminders enabled!");
      } else if(result === "denied"){
        showToast("Notifications blocked by the browser.","warn");
      } else {
        showToast("Notification permission unchanged.","warn");
      }
    };
    try{
      const request = Notification.requestPermission();
      if(request && typeof request.then === "function"){
        request.then(finalize).catch(()=>{ notifyBtn.disabled = false; showToast("Notification request failed.","warn"); });
      } else {
        finalize(Notification.permission);
      }
    }catch(err){
      notifyBtn.disabled = false;
      showToast("Notification request failed.","warn");
    }
  });
  plannerExportJSON?.addEventListener("click",()=>{
    downloadBlob(JSON.stringify(data,null,2),"planner.json","application/json");
    showToast("Planner exported");
  });
  plannerExportCSV?.addEventListener("click",()=>{
    const lines = ["Day,Entry"];
    dayOrder.forEach(day=>{
      (data[day]||[""]).forEach(entry=>{
        lines.push(`"${day.replace(/"/g,'""')}","${String(entry||"").replace(/"/g,'""')}"`);
      });
    });
    downloadBlob(lines.join("\n"),"planner.csv","text/csv");
    showToast("Planner CSV exported");
  });
  plannerImportCSV?.addEventListener("change",e=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = ()=>{
      const text = String(reader.result||"").trim();
      if(!text){ showToast("CSV file was empty","warn"); return; }
      const rows = text.split(/\r?\n/).slice(1);
      if(!rows.length){ showToast("CSV missing rows","warn"); return; }
      const next = deepCopy(sample);
      let imported = 0;
      rows.forEach(line=>{
        if(!line) return;
        const [dayCell="", entryCell=""] = splitCSVLine(line).map(s=>s.trim());
        if(dayOrder.includes(dayCell)){
          next[dayCell].push(entryCell);
          imported++;
        }
      });
      if(!imported){ showToast("No valid rows in CSV","warn"); return; }
      data = next;
      saveData(data);
      render();
      showToast(`Imported ${imported} entries`);
      plannerImportCSV.value = "";
    };
    reader.readAsText(file);
  });
  updatePersistStatus();
  updateNotificationStatus();
  startStudyNag(false);

  // Stability toggle hookup
  (function initStabilityPrefs(){
    const toggle = document.getElementById("stability-toggle");
    if(toggle){
      const prefs = loadStabilityPrefs();
      toggle.checked = prefs.enabled;
      toggle.addEventListener("change", ()=>{
        prefs.enabled = toggle.checked;
        saveStabilityPrefs(prefs);
        renderStabilityStrip();
        renderDangerZone();
      });
    }
  })();

  // Daily briefing prefs
  (function initBriefPrefsUI(){
    const toggle = document.getElementById("bunker-log-toggle");
    const toneSel = document.getElementById("bunker-log-tone");
    const prefs = loadBriefPrefs();
    if(toggle){
      toggle.checked = prefs.enabled;
      toggle.addEventListener("change", ()=>{
        prefs.enabled = toggle.checked;
        saveBriefPrefs(prefs);
        renderBriefingStrip({level:"green", detail:""}, []);
        renderBriefLog();
        renderDangerZone();
      });
    }
    if(toneSel){
      toneSel.value = prefs.tone || "heroic";
      toneSel.addEventListener("change", ()=>{
        prefs.tone = toneSel.value;
        saveBriefPrefs(prefs);
        renderDangerZone();
      });
    }
  })();

  function initChatbot(){
    const toggle = document.getElementById("chatbot-toggle");
    const panel = document.getElementById("chatbot-panel");
    const form = document.getElementById("chatbot-form");
    const input = document.getElementById("chatbot-input");
    const log = document.getElementById("chatbot-messages");
    const suggestBtn = document.getElementById("chatbot-suggest");
    if(!toggle || !panel || !form || !input || !log || !suggestBtn) return;
    const replies = [
      { keywords:["plan","schedule","routine"], response:"Build your week around two anchor days and keep heavy strength away from the recovery day so energy stays high." },
      { keywords:["motivation","burnout","tired","lazy"], response:"Aim for five focused minutes. Once you move, momentum wakes up the motivation you were waiting for." },
      { keywords:["workout","training","exercise","lifting"], response:"Alternate push, pull, and skill practice. Leave a rep in reserve so tomorrow still feels inviting." },
      { keywords:["habit","streak","consistency"], response:"Stack the habit on top of an existing ritual and track it visibly. Checkmarks wire in the win." },
      { keywords:["focus","study","pomodoro","distraction"], response:"Try a 45/15 focus block, jot distractions instantly, and review them after each break so your brain trusts you." }
    ];
    appendMessage("bot","Hey! I'm your AI training buddy. Ask about workouts, focus, or staying consistent.");
    const dayTip = generateDailySuggestion();
    if(dayTip) appendMessage("bot", dayTip);
    toggle.addEventListener("click",()=>{
      panel.classList.toggle("hidden");
      if(!panel.classList.contains("hidden")) input.focus();
    });
    form.addEventListener("submit",e=>{
      e.preventDefault();
      const message = input.value.trim();
      if(!message) return;
      appendMessage("user", message);
      input.value = "";
      setTimeout(()=>appendMessage("bot", buildReply(message)), 350);
    });
    function appendMessage(role, text){
      const bubble = document.createElement("div");
      bubble.className = `chatbot-message ${role}`;
      bubble.textContent = text;
      log.appendChild(bubble);
      log.scrollTop = log.scrollHeight;
    }
        function buildReply(message){
      const lower = message.toLowerCase();
      const formatDue = (item)=>{
        const d = new Date(item.due);
        const dateLabel = d.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"});
        const delta = item.daysLeft;
        const suffix = delta >= 0 ? `${delta} day${delta===1?"":"s"} left` : `${Math.abs(delta)} day${Math.abs(delta)===1?"":"s"} late`;
        return `${item.title} - ${dateLabel} (${suffix})`;
      };
      const upcoming = getUpcomingAssignments(3);
      const nextDeadline = upcoming[0];
      const freezeLine = (streakFreeze.charges||0) > 0
        ? `You have ${streakFreeze.charges} Streak Freeze${streakFreeze.charges===1?"":"s"} stocked - tap it if you miss a day.`
        : "Buy a Streak Freeze (50 XP) before your busiest day so one miss won't break your streak.";
      const actionPlan = ()=>{
        const pieces = [];
        if(nextDeadline){
          pieces.push(`1) Start ${formatDue(nextDeadline)} with a 10-minute outline + rubric check.`);
          pieces.push("2) Block 45 minutes for the hardest part, then 10 minutes to polish.");
        } else {
          pieces.push("1) Pick the toughest task and outline 3 bullets.");
        }
        const pct = Math.round(calcHabitProgress());
        pieces.push(`3) Habits ${pct}% done. ${streakFreeze.charges ? "Freeze is ready if you slip." : "Mark one now so you don't need a freeze."}`);
        return pieces.join(" ");
      };

      if(["freeze","shield","skip day"].some(k=>lower.includes(k))) return freezeLine;
      if(["deadline","due","assignment","danger","class","calendar"].some(k=>lower.includes(k))){
        if(!upcoming.length) return "I don't see any imported deadlines in this window. Try importing your .ics and pick the right week.";
        return `Next up: ${upcoming.map(formatDue).join(" | ")}. Take the earliest one and do a 10-minute starter task right now.`;
      }
      if(["plan","schedule","routine","next","what now"].some(k=>lower.includes(k))){
        return actionPlan();
      }
      if(["motivation","burnout","tired","lazy"].some(k=>lower.includes(k))){
        const energy = moodEnergyState.energy || "medium";
        const quickFix = energy==="low" ? "Do 90s of deep breathing + water, then 5-minute tidy to warm up." : "Walk for 3 minutes, then start the smallest step (open doc, title it, jot 3 bullets).";
        return `${quickFix} ${freezeLine}`;
      }
      if(["pomodoro","timer","break"].some(k=>lower.includes(k))){
        return "Run a 45/15 block. During breaks: posture reset, water, one stretch. Your timer beeps every 30s on breaks to keep you honest.";
      }
      if(["habit","streak","consistency","routine"].some(k=>lower.includes(k))){
        const pct = Math.round(calcHabitProgress());
        return `Habits are ${pct}% complete. Check one thing off now, then bank the Streak Freeze before a hectic day. ${freezeLine}`;
      }
      if(["workout","training","lifting","exercise"].some(k=>lower.includes(k))){
        const energy = moodEnergyState.energy || "medium";
        return energy==="low"
          ? "Energy's low: do a 10-minute mobility/reset and one 'win' set (pushups or hangs). Save heavy work for tomorrow."
          : "Stack skills first, then strength. Stop 1 rep before failure so you can train again tomorrow.";
      }
      if(["mood","energy","tired","sleep"].some(k=>lower.includes(k))){
        return "Micro-fix: water + 90s box-breathing + 5-minute tidy/errand. If still foggy, take a brisk 5-minute walk before the next task.";
      }

      const rule = replies.find(entry => entry.keywords.some(key=>lower.includes(key)));
      if(rule) return rule.response;
      if(["hi","hello","hey"].some(greet=>lower.includes(greet))) return "Hey there! What's one win you can chase today?";
      return generateDailySuggestion(true);
    }
    suggestBtn.addEventListener("click",()=>{
      appendMessage("bot", generateDailySuggestion(true));
    });
  }

  function loadCoachState(){
    if(hasStorage){
      try{
        const raw = JSON.parse(localStorage.getItem(COACH_KEY));
        if(raw && typeof raw === "object") return raw;
      }catch(e){}
    }
    return { last:null,lastMsg:"" };
  }
    function generateDailySuggestion(forceFresh=false){
    const today = new Date().toDateString();
    if(!forceFresh && coachState.last === today && coachState.lastMsg) return coachState.lastMsg;
    let suggestion = "";
    const habitPct = calcHabitProgress();
    const nextDeadline = getUpcomingAssignments(1)[0];
    if(nextDeadline){
      const due = new Date(nextDeadline.due);
      const days = Math.max(0, Math.ceil((due.getTime() - Date.now())/86400000));
      const freezeMsg = (streakFreeze.charges||0) > 0 ? "Freeze stocked if you miss a habit today." : "Stock a Streak Freeze (50 XP) if you expect a messy day.";
      suggestion = `Next due: ${nextDeadline.title} on ${due.toLocaleDateString(undefined,{weekday:"short",month:"short",day:"numeric"})} (${days===0?"today":days+"d"}). Do a 15-minute outline + rubric check, then block 45 minutes tomorrow. ${freezeMsg}`;
    } else if(habitPct < 40){
      suggestion = `Habit completion is at ${habitPct}%. Pick one anchor habit and celebrate a single win today.`;
    } else {
      const laggingSkill = skillProgressState.find(skill => (skill.level||0) < skill.stages.length-1);
      if(laggingSkill){
        const currentStage = laggingSkill.stages[laggingSkill.level] || laggingSkill.stages[0];
        const nextStage = laggingSkill.stages[Math.min(laggingSkill.level+1, laggingSkill.stages.length-1)];
        suggestion = `For ${laggingSkill.title}, you're on ${currentStage}. Spend 10 minutes drilling toward ${nextStage} today.`;
      } else {
        const latestMood = moodEntries[0];
        if(latestMood){
          const days = Math.floor((Date.now() - new Date(latestMood.created || Date.now()).getTime())/86400000);
          if(days >= 2){
            suggestion = `It's been ${days} days since your last mood log. Drop a quick entry before you train.`;
          }
        }
        if(!suggestion){
          const phase = roadmapState[0];
          if(phase && phase.focus && phase.focus.length){
            suggestion = `Roadmap reminder: "${phase.focus[0]}". Lock that in before moving on.`;
          } else {
            suggestion = "Schedule looks balanced. Use one long break to film handstand form and review checkpoints.";
          }
        }
      }
    }
    coachState = { last: today, lastMsg: suggestion };
    if(hasStorage) localStorage.setItem(COACH_KEY, JSON.stringify(coachState));
    return suggestion;
  }
  document.getElementById("btn-reset").addEventListener("click",()=>{
    if(hasStorage){
      localStorage.removeItem(S_KEY);
      localStorage.removeItem(M_KEY);
      localStorage.removeItem(E_KEY);
      localStorage.removeItem(J_KEY);
      localStorage.removeItem(NOTES_KEY);
      localStorage.removeItem("habits-data");
      localStorage.removeItem(HABIT_HISTORY_KEY);
      localStorage.removeItem(STREAK_FREEZE_KEY);
    }
    data = deepCopy(sample);
    mood = {};
    moodEntries = [];
    notesData = [];
    habitsState = defaultHabits.map(normalizeHabit);
    editMode = true;
    document.getElementById("chk-edit").checked = true;
    saveData(data);
    saveMood(mood);
    saveJournal(moodEntries);
    saveNotes(notesData);
    saveHabits(habitsState);
    if(workoutController){
      workoutController.resetToDefault(true);
      workoutController.setEditMode(false);
    }
    roadmapState = loadRoadmap();
    skillProgressState = loadSkillProgress();
    coachState = loadCoachState();
    streakFreeze = loadStreakFreeze();
    habitHistory = {};
    renderRoadmapEditor();
    renderSkillVisualizer();
    render();
    renderNotesFeed();
    renderHabits();
    updateHabitStreakPanel();
    updateStreakFreezeBar();
    showToast("Reset complete");
  });
})();

(function initEditableChores(){
  const KEY = "planner_chores_text";
  const defaults = {
    weekly: [
      "Bathroom reset",
      "Laundry run",
      "Grocery/Walmart necessities (with a list)",
      "Social time with friends",
      "Full-body shave",
      "Credit freeze/SSN lock check (3 bureaus)",
      "Creative reps: video editing or pyrography"
    ].join("\n"),
    biweekly: "Fridge clear + wipe",
    once: "Dye hair"
  };
  const weeklyEl = document.getElementById("chores-weekly");
  const biweeklyEl = document.getElementById("chores-biweekly");
  const onceEl = document.getElementById("chores-once");
  const saveBtn = document.getElementById("chores-save");
  const status = document.getElementById("chores-status");
  if(!weeklyEl || !biweeklyEl || !onceEl) return;

  const load = ()=>{
    try{
      const raw = JSON.parse(localStorage.getItem(KEY));
      if(raw && typeof raw === "object"){
        return { ...defaults, ...raw };
      }
    }catch(e){}
    return { ...defaults };
  };
  const save = (state)=>{
    try{ localStorage.setItem(KEY, JSON.stringify(state||defaults)); }catch(e){}
  };
  const render = (state)=>{
    weeklyEl.value = state.weekly || "";
    biweeklyEl.value = state.biweekly || "";
    onceEl.value = state.once || "";
  };
  const flashSaved = (msg="Saved")=>{
    if(!status) return;
    status.textContent = msg;
    setTimeout(()=>{ status.textContent = ""; }, 1200);
  };
  const persist = ()=>{
    const next = {
      weekly: (weeklyEl.value||"").trim(),
      biweekly: (biweeklyEl.value||"").trim(),
      once: (onceEl.value||"").trim()
    };
    save(next);
    flashSaved();
  };

  const state = load();
  render(state);
  saveBtn?.addEventListener("click", persist);
  weeklyEl.addEventListener("blur", persist);
  biweeklyEl.addEventListener("blur", persist);
  onceEl.addEventListener("blur", persist);
})();





































