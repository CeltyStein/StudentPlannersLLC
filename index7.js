// Body heat map integration for workout tab
(function(){
  const LOG_KEY = "workout-graph-log-v1";
  const WINDOW_DAYS = 7;

  const typeToMuscles = {
    chest: ["Chest"],
    back: ["Back"],
    abs: ["Abs"],
    arms_shoulders: ["Shoulders","Arms"],
    legs_calfs: ["Legs","Calves"],
    push: ["Chest","Shoulders","Arms"],
    pull: ["Back","Arms"]
  };

  const svg = document.getElementById("workout-heat-svg");
  const refreshBtn = document.getElementById("heat-refresh");
  const resetBtn = document.getElementById("heat-reset");
  const focusNote = document.getElementById("heat-focus-note");
  const summary = document.getElementById("heat-summary");
  if(!svg) return;

  const regions = Array.from(svg.querySelectorAll(".muscle-region"));

  function lastNDates(n){
    const days = [];
    for(let i=n-1;i>=0;i--){
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0,10));
    }
    return days;
  }

  function loadLogs(){
    try{
      const raw = JSON.parse(localStorage.getItem(LOG_KEY));
      return Array.isArray(raw) ? raw : [];
    }catch(e){ return []; }
  }

  function intensityFromCount(count){
    if(count <= 0) return 0;
    if(count === 1) return 1;
    if(count === 2) return 2;
    if(count === 3) return 3;
    if(count <= 5) return 4;
    return 5;
  }

  function applyIntensity(muscle, level){
    regions.filter(r=>r.dataset.muscle === muscle).forEach(r=>{
      r.dataset.intensity = level;
      r.className = r.className.replace(/intensity-\d/g,"").trim();
      r.classList.add(`intensity-${level}`);
    });
  }

  function resetMap(){
    regions.forEach(r=>{
      r.dataset.intensity = 0;
      r.className = r.className.replace(/intensity-\d/g,"").trim();
      r.classList.add("intensity-0");
    });
    if(summary) summary.textContent = "Heat map reset. Log workouts to light it up.";
    if(focusNote) focusNote.textContent = "Focus types: -";
  }

  function refreshFromLogs(){
    const data = loadLogs();
    const windowDays = new Set(lastNDates(WINDOW_DAYS));
    const muscles = {};
    const typesSeen = new Set();
    data.forEach(entry=>{
      if(!entry?.date || !windowDays.has(entry.date)) return;
      Object.keys(typeToMuscles).forEach(type=>{
        if(entry[type]){
          typesSeen.add(type);
          typeToMuscles[type].forEach(m=>{
            muscles[m] = (muscles[m]||0) + 1;
          });
        }
      });
    });
    Object.keys(muscles).forEach(m=>{
      applyIntensity(m, intensityFromCount(muscles[m]));
    });
    if(summary){
      const totalHits = Object.values(muscles).reduce((a,b)=>a+b,0);
      summary.textContent = totalHits ? `Last ${WINDOW_DAYS} days: ${totalHits} logged hits across muscles.` : "No logged workouts in the last week.";
    }
    if(focusNote){
      const labels = Array.from(typesSeen).map(t=> t.replace(/_/g," ")).join(", ");
      focusNote.textContent = typesSeen.size ? `Focus types: ${labels}` : "Focus types: none logged yet.";
    }
  }

  refreshBtn?.addEventListener("click", refreshFromLogs);
  resetBtn?.addEventListener("click", resetMap);
  refreshFromLogs();
})();

// Quick countdown timer for Pomodoro panel
(function initCountdownTimer(){
  const shell = document.getElementById("countdown-shell");
  if(!shell) return;
  const display = document.getElementById("countdown-display");
  const statusEl = document.getElementById("countdown-status");
  const minInput = document.getElementById("countdown-min");
  const secInput = document.getElementById("countdown-sec");
  const progress = document.getElementById("countdown-progress");
  const startBtn = document.getElementById("countdown-start");
  const addBtn = document.getElementById("countdown-add");
  const resetBtn = document.getElementById("countdown-reset");
  const presets = Array.from(shell.querySelectorAll("[data-preset]"));

  const state = {
    total: 300,
    remaining: 300,
    running: false,
    timerId: null,
    endAt: null
  };

  const clampDuration = (sec)=>Math.min(60*240, Math.max(10, Math.round(sec||0)));
  const fmt = (sec)=>{
    const m = Math.floor(sec/60);
    const s = sec % 60;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };

  const applyInputs = ()=>{
    const mins = Math.max(0, Number(minInput?.value || 0));
    const secs = Math.max(0, Number(secInput?.value || 0));
    const total = clampDuration(mins*60 + secs);
    state.total = total;
    state.remaining = total;
    updateUI("Ready","idle");
  };

  const setStatus = (text, mode="active")=>{
    if(statusEl){
      statusEl.textContent = text;
      statusEl.dataset.state = mode;
    }
  };

  const updateUI = (statusText, mode="active")=>{
    if(display) display.textContent = fmt(state.remaining);
    if(progress){
      const pct = state.total ? Math.max(0, Math.min(100, (state.remaining/state.total)*100)) : 0;
      progress.style.width = `${pct}%`;
    }
    setStatus(statusText, mode);
  };

  const chime = ()=>{
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.85);
    }catch(e){}
  };

  const finish = ()=>{
    clearInterval(state.timerId);
    state.running = false;
    state.remaining = 0;
    state.timerId = null;
    startBtn.textContent = "Restart";
    updateUI("Done","done");
    chime();
    if(typeof showToast === "function") showToast("Countdown finished!");
  };

  const tick = ()=>{
    const left = Math.max(0, Math.round((state.endAt - Date.now())/1000));
    state.remaining = left;
    updateUI("Counting","active");
    if(left <= 0) finish();
  };

  const start = ()=>{
    if(state.running) return;
    if(state.remaining <= 0 || state.total <= 0){
      applyInputs();
    }
    state.running = true;
    state.endAt = Date.now() + state.remaining*1000;
    startBtn.textContent = "Pause";
    updateUI("Counting","active");
    tick();
    state.timerId = setInterval(tick, 250);
  };

  const pause = ()=>{
    if(!state.running) return;
    state.running = false;
    clearInterval(state.timerId);
    state.timerId = null;
    state.remaining = Math.max(0, Math.round((state.endAt - Date.now())/1000));
    startBtn.textContent = "Resume";
    updateUI("Paused","idle");
  };

  const reset = ()=>{
    clearInterval(state.timerId);
    state.timerId = null;
    state.running = false;
    applyInputs();
    startBtn.textContent = "Start";
    updateUI("Ready","idle");
  };

  const addMinute = ()=>{
    state.remaining = clampDuration(state.remaining + 60);
    state.total = Math.max(state.total, state.remaining);
    if(state.running){
      state.endAt = Date.now() + state.remaining*1000;
      updateUI("Counting","active");
      startBtn.textContent = "Pause";
    }else{
      updateUI("Ready","idle");
      startBtn.textContent = "Start";
    }
  };

  startBtn?.addEventListener("click", ()=> state.running ? pause() : start());
  resetBtn?.addEventListener("click", reset);
  addBtn?.addEventListener("click", addMinute);
  presets.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      const val = clampDuration(Number(btn.dataset.preset || 300));
      state.total = val;
      state.remaining = val;
      if(minInput) minInput.value = String(Math.floor(val/60));
      if(secInput) secInput.value = String(val%60);
      startBtn.textContent = "Start";
      updateUI("Ready","idle");
    });
  });
  [minInput, secInput].forEach(inp=>{
    inp?.addEventListener("change", applyInputs);
    inp?.addEventListener("input", ()=>{ if(state.running) pause(); });
  });

  applyInputs();
})();

// Laundry countdown timer (1 hour preset)
(function initLaundryTimer(){
  const shell = document.getElementById("laundry-shell");
  if(!shell) return;
  const display = document.getElementById("laundry-display");
  const statusEl = document.getElementById("laundry-status");
  const startBtn = document.getElementById("laundry-start");
  const addBtn = document.getElementById("laundry-add");
  const resetBtn = document.getElementById("laundry-reset");

  const state = { total:3600, remaining:3600, running:false, timerId:null, endAt:null };
  const clampDuration = (sec)=>Math.min(60*240, Math.max(60, Math.round(sec||0)));
  const fmt = (sec)=>{
    const m = Math.floor(sec/60);
    const s = sec % 60;
    return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
  };
  const setStatus = (text, mode="active")=>{
    if(statusEl){ statusEl.textContent = text; statusEl.dataset.state = mode; }
  };
  const updateUI = (label, mode="active")=>{
    if(display) display.textContent = fmt(state.remaining);
    setStatus(label, mode);
  };
  const chime = ()=>{
    try{
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(660, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.9);
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1);
    }catch(e){}
  };
  const finish = ()=>{
    clearInterval(state.timerId);
    state.running = false;
    state.timerId = null;
    state.remaining = 0;
    startBtn.textContent = "Restart";
    updateUI("Done","done");
    chime();
    if(typeof showToast === "function") showToast("Laundry timer finished — switch loads!", "warn");
  };
  const tick = ()=>{
    state.remaining = Math.max(0, Math.round((state.endAt - Date.now())/1000));
    updateUI("Counting","active");
    if(state.remaining <= 0) finish();
  };
  const start = ()=>{
    if(state.running) return;
    if(state.remaining <= 0) state.remaining = state.total;
    state.running = true;
    state.endAt = Date.now() + state.remaining*1000;
    startBtn.textContent = "Pause";
    updateUI("Counting","active");
    tick();
    state.timerId = setInterval(tick, 500);
  };
  const pause = ()=>{
    if(!state.running) return;
    state.running = false;
    clearInterval(state.timerId);
    state.timerId = null;
    state.remaining = Math.max(0, Math.round((state.endAt - Date.now())/1000));
    startBtn.textContent = "Resume";
    updateUI("Paused","idle");
  };
  const reset = ()=>{
    clearInterval(state.timerId);
    state.running = false;
    state.timerId = null;
    state.remaining = state.total;
    startBtn.textContent = "Start";
    updateUI("Ready","idle");
  };
  const addFive = ()=>{
    state.remaining = clampDuration(state.remaining + 300);
    state.total = Math.max(state.total, state.remaining);
    if(state.running){
      state.endAt = Date.now() + state.remaining*1000;
      updateUI("Counting","active");
      startBtn.textContent = "Pause";
    }else{
      updateUI("Ready","idle");
    }
  };

  startBtn?.addEventListener("click", ()=> state.running ? pause() : start());
  resetBtn?.addEventListener("click", reset);
  addBtn?.addEventListener("click", addFive);

  updateUI("Ready","idle");
})();
