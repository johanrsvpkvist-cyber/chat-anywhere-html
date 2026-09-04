export function generateChatHTML(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OpenChat</title>
<link rel="icon" id="favicon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>💬</text></svg>">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{color-scheme:dark;--bg:#04060f;--panel:rgba(9,15,32,.82);--accent:#7ef9ff;--accent-2:#ff9bff;--accent-3:#7cff6b;--text:#eef7ff;--muted:rgba(238,247,255,.65);--danger:#ff4b4b;--warning:#ffa500;--success:#4ade80}
body{font-family:'Inter',system-ui,sans-serif;background:radial-gradient(circle at top,rgba(75,122,255,.2),transparent 55%),radial-gradient(circle at 20% 20%,rgba(255,140,251,.18),transparent 50%),radial-gradient(circle at bottom,rgba(124,255,107,.15),transparent 50%),var(--bg);color:var(--text);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:28px 16px}
.app{display:grid;gap:24px;width:min(1080px,100%);height:min(95vh,980px)}
.hero{text-align:center}
.hero h1{font-size:clamp(2rem,4vw,3rem);letter-spacing:.25em;text-transform:uppercase;color:var(--accent);text-shadow:0 0 12px rgba(126,249,255,.45)}
.tab-switcher{margin-top:12px;display:inline-flex;gap:8px;padding:4px;border-radius:999px;background:rgba(16,28,54,.6);border:1px solid rgba(126,249,255,.2)}
.tab-sw-btn{padding:6px 16px;border-radius:999px;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.18em;border:none;cursor:pointer;background:transparent;color:var(--muted)}
.tab-sw-btn.active{background:var(--accent);color:var(--bg);box-shadow:0 0 14px rgba(126,249,255,.3)}
.panel{display:flex;flex-direction:column;min-height:0;background:var(--panel);border:1px solid rgba(126,249,255,.18);border-radius:20px;padding:24px;box-shadow:0 16px 40px rgba(4,6,15,.65);backdrop-filter:blur(18px)}
.topbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}
.badge{display:inline-flex;align-items:center;gap:10px;padding:6px 14px;border-radius:999px;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;background:rgba(126,249,255,.1);border:1px solid rgba(126,249,255,.3)}
.badge::before{content:"";width:10px;height:10px;border-radius:50%;background:radial-gradient(circle,var(--accent) 0%,rgba(126,249,255,.2) 70%);box-shadow:0 0 12px rgba(126,249,255,.6)}
.header-right{margin-left:auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.name-btn,.tab-btn{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:6px 16px;border-radius:999px;text-transform:uppercase;letter-spacing:.2em;font-size:.7rem;color:var(--text);background:linear-gradient(145deg,rgba(16,28,54,.95),rgba(10,16,32,.9));box-shadow:inset 0 0 0 1px rgba(126,249,255,.2),0 6px 14px rgba(0,0,0,.35);border:none;cursor:pointer}
.name-btn:hover,.tab-btn:hover{box-shadow:inset 0 0 0 1px rgba(126,249,255,.35),0 10px 20px rgba(0,0,0,.45)}
.admin-badge{background:var(--danger);color:#fff;font-size:10px;padding:2px 8px;border-radius:999px;font-weight:700;text-transform:uppercase;letter-spacing:.16em}
.tag{color:var(--accent);font-family:monospace;font-size:12px}
#messages{flex:1;overflow-y:auto;background:rgba(0,0,0,.3);border-radius:12px;padding:15px;margin-bottom:15px;border:1px solid rgba(126,249,255,.1);display:flex;flex-direction:column;gap:12px}
#messages::-webkit-scrollbar{width:6px}
#messages::-webkit-scrollbar-thumb{background:rgba(126,249,255,.22);border-radius:3px}
.msg{display:flex;flex-direction:column;max-width:75%}
.msg.self{align-self:flex-end;align-items:flex-end}
.msg.other{align-self:flex-start;align-items:flex-start}
.msg.system{align-self:center;max-width:100%;align-items:center}
.meta{font-size:13px;font-weight:700;color:rgba(238,247,255,.9);margin-bottom:4px;padding:0 4px;display:flex;align-items:center;gap:6px}
.del-btn{background:none;border:none;color:var(--danger);cursor:pointer;font-size:12px;padding:0 2px}
.bubble{padding:10px 16px;border-radius:16px;font-size:14px;word-break:break-word;line-height:1.5}
.self .bubble{background:var(--accent);color:var(--bg);border-bottom-right-radius:6px;font-weight:500}
.other .bubble{background:rgba(27,38,72,.95);color:var(--text);border-bottom-left-radius:6px}
.system-pill{padding:7px 16px;border-radius:999px;background:rgba(255,155,255,.12);border:1px solid rgba(255,155,255,.28);font-size:11px;letter-spacing:.18em;text-transform:uppercase}
.bubble img{max-width:100%;max-height:280px;border-radius:8px;margin-top:6px}
.input-bar{padding:12px;border:1px solid rgba(126,249,255,.18);border-radius:12px;background:rgba(255,255,255,.05)}
.cmd-hint{font-size:11px;color:var(--muted);margin-bottom:8px;font-family:monospace;display:none;text-transform:uppercase;letter-spacing:.15em}
.input-row{display:flex;gap:10px;align-items:center;border:1px solid rgba(126,249,255,.28);background:rgba(0,0,0,.2);padding:8px;border-radius:12px}
.input-bar input[type=text]{flex:1;background:none;border:none;color:var(--text);padding:12px 10px;font-size:14px;outline:none}
.input-bar button{background:var(--accent);color:var(--bg);border:none;width:42px;height:42px;border-radius:999px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(126,249,255,.32)}
.img-btn{background:linear-gradient(145deg,rgba(16,28,54,.95),rgba(10,16,32,.9))!important;color:var(--text)!important;box-shadow:inset 0 0 0 1px rgba(126,249,255,.2)!important}
.img-btn svg{width:20px;height:20px}
.settings-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:none;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(6px)}
.settings-overlay.open{display:flex}
.settings-panel{background:rgba(9,15,32,.96);border:1px solid rgba(126,249,255,.25);border-radius:16px;padding:24px;width:420px;max-width:90vw;box-shadow:0 16px 40px rgba(4,6,15,.8)}
.settings-panel h2{font-size:16px;font-weight:700;color:var(--accent);margin-bottom:16px;letter-spacing:1px;text-transform:uppercase}
.settings-panel label{display:block;font-size:11px;color:var(--muted);margin-bottom:4px;margin-top:12px;letter-spacing:.14em;text-transform:uppercase}
.settings-panel select,.settings-panel input[type=text]{width:100%;background:rgba(27,38,72,.95);border:1px solid rgba(126,249,255,.18);color:var(--text);padding:10px 12px;border-radius:8px;font-size:14px;outline:none}
.settings-btns{display:flex;gap:8px;margin-top:20px}
.settings-btns button{flex:1;padding:10px;border-radius:8px;font-size:13px;cursor:pointer;border:none;font-weight:600;letter-spacing:1px;text-transform:uppercase}
.btn-save{background:var(--accent);color:var(--bg)}
.btn-cancel{background:rgba(27,38,72,.95);color:var(--muted)}
.toast-stack{position:fixed;top:18px;right:18px;display:flex;flex-direction:column;gap:10px;z-index:200;pointer-events:none}
.toast{min-width:220px;max-width:360px;padding:12px 16px;border-radius:14px;border:1px solid rgba(126,249,255,.26);background:rgba(9,15,32,.94);color:var(--text);box-shadow:0 18px 42px rgba(4,6,15,.55);font-size:12px;letter-spacing:.12em;text-transform:uppercase;animation:toast-in .22s ease}
.toast.error{border-color:rgba(255,75,75,.45);color:#ffd7d7}
@keyframes toast-in{from{transform:translateY(-8px);opacity:0}to{transform:translateY(0);opacity:1}}
.admin-user-row{display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,.25);padding:12px;border-radius:10px;border:1px solid rgba(126,249,255,.15)}
.admin-user-name{font-weight:700;font-size:14px}
.admin-user-tag{font-family:monospace;font-size:11px;color:var(--accent)}
.admin-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.admin-btn{border:none;padding:6px 12px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:.1em}
.admin-btn.mute{background:rgba(255,165,0,.15);color:var(--warning);border:1px solid rgba(255,165,0,.3)}
.admin-btn.unmute{background:rgba(74,222,128,.15);color:var(--success);border:1px solid rgba(74,222,128,.3)}
.admin-btn.corn{background:rgba(255,215,0,.15);color:gold;border:1px solid rgba(255,215,0,.3)}
.admin-panel-btn-top{background:var(--danger)!important;color:#fff!important}
.prelink-item{display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,.3);padding:6px 10px;border-radius:8px;border:1px solid rgba(126,249,255,.15);font-size:12px;margin-bottom:6px}
.prelink-item.top-voted{border-color:var(--accent-3);background:rgba(124,255,107,.1)}
.prelink-url{color:var(--accent);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:220px}
.prelink-vote-btn{background:rgba(126,249,255,.15);border:1px solid rgba(126,249,255,.3);color:var(--text);padding:2px 8px;border-radius:6px;cursor:pointer;font-size:11px}
.prelink-vote-btn.voted{background:var(--accent);color:var(--bg);font-weight:bold}
.phase-mode-centered{margin:16px auto;padding:24px 20px;background:radial-gradient(circle,rgba(16,28,54,.95),rgba(9,15,32,.98));border:2px solid rgba(126,249,255,.4);border-radius:20px;box-shadow:0 0 35px rgba(126,249,255,.25)}
.phase-mode-top{margin:4px auto 12px;padding:8px 14px;background:rgba(126,249,255,.12);border:1px solid rgba(126,249,255,.3);border-radius:12px}
.big-phase-banner{font-size:13px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--accent)}
.big-countdown-timer{font-size:3.4rem;font-weight:900;font-family:'Courier New',monospace;color:var(--accent-2);text-shadow:0 0 20px rgba(255,155,255,.8);line-height:1.1;margin-top:6px}
.phase-mode-top .big-countdown-timer{font-size:1.4rem}
.wheel-container-hidden{opacity:.15;transform:scale(.75);pointer-events:none;height:60px!important;overflow:hidden}
.wheel-container-active{opacity:1;transform:scale(1);pointer-events:auto;height:340px!important}
.video-area{position:relative;flex:1;overflow:hidden;border-radius:12px;background:rgba(0,0,0,.4);border:1px solid rgba(126,249,255,.08);display:flex;align-items:center;justify-content:center;min-height:300px}
.video-area video{width:100%;height:100%;object-fit:cover}
.pip{position:absolute;bottom:12px;right:12px;width:130px;height:160px;border-radius:12px;overflow:hidden;border:2px solid rgba(126,249,255,.3);background:#000}
.pip video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
.vid-controls{display:flex;align-items:center;justify-content:center;gap:12px;padding:16px 0}
.vid-btn{width:48px;height:48px;border-radius:999px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px}
.vid-btn.on{background:rgba(27,38,72,.95);color:var(--text)}
.vid-btn.off{background:var(--danger);color:#fff}
.vid-btn.end{background:var(--danger);color:#fff}
.vid-join{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;flex:1;padding:24px;text-align:center}
.vid-join .icon-circle{width:80px;height:80px;border-radius:999px;background:rgba(126,249,255,.1);display:flex;align-items:center;justify-content:center;font-size:36px}
.vid-join button{padding:12px 32px;border-radius:999px;background:var(--accent);color:var(--bg);border:none;font-size:16px;font-weight:600;cursor:pointer}
.hidden{display:none!important}
#chatView,#videoView{min-height:0;flex:1;display:flex;flex-direction:column}
</style>
</head>
<body>
<div class="toast-stack" id="toastStack"></div>
<div class="app">
<div class="hero">
  <h1>OpenChat</h1>
  <div class="tab-switcher">
    <button class="tab-sw-btn active" id="tabChat" onclick="switchTab('chat')">💬 Live Chat</button>
    <button class="tab-sw-btn" id="tabVideo" onclick="switchTab('video')">📹 FaceTime</button>
  </div>
</div>
<div class="panel">

<div id="chatView">
<div class="topbar">
  <div class="badge">Live Chat</div>
  <button class="name-btn" onclick="toggleOnlineList()" style="font-size:11px">👥 <span id="onlineCount">1</span> Online</button>
  <button class="name-btn" onclick="openRoulette()" style="font-size:11px;background:linear-gradient(135deg,rgba(126,249,255,.2),rgba(255,155,255,.2))">🎯 Roulette (<span id="rouletteTimerBadge">2:00</span>)</button>
  <span class="admin-badge" id="adminBadge" style="display:none">Admin</span>
  <button class="name-btn admin-panel-btn-top" id="adminPanelTopBtn" style="display:none" onclick="openAdminPanel()">🛡️ Panel</button>
  <div class="header-right">
    <button class="name-btn" onclick="changeName()">⚙ <span id="nameDisplay">Anonymous</span> <span class="tag" id="myTagDisplay"></span></button>
    <button class="tab-btn" onclick="openSettings()">🎭 Disguise</button>
  </div>
</div>
<div id="onlineList" style="display:none;margin-bottom:12px;padding:10px;border-radius:12px;border:1px solid rgba(126,249,255,.15);background:rgba(16,28,54,.6)">
  <div style="font-size:10px;text-transform:uppercase;letter-spacing:.2em;color:var(--muted);margin-bottom:8px">Online Users (<span id="onlineCount2">1</span>)</div>
  <div id="onlineUsers" style="display:flex;flex-wrap:wrap;gap:8px"></div>
</div>
<div id="messages"></div>
<div class="input-bar">
  <div class="cmd-hint" id="cmdHint">Commands: /wipe · /timeout #tag mins · /mute #tag mins · /untimeout #tag · /unmute #tag · /corn #tag · /send #tag url</div>
  <div class="input-row">
    <input type="file" id="fileInput" accept="image/*" style="display:none" onchange="uploadImage(this)">
    <button class="img-btn" onclick="document.getElementById('fileInput').click()"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></button>
    <input type="text" id="msgInput" placeholder="Type a message..." onkeydown="if(event.key==='Enter')sendMsg()">
    <button onclick="sendMsg()">➤</button>
  </div>
</div>
</div>

<div id="videoView" class="hidden">
  <div id="vidLobby" class="vid-join">
    <div class="icon-circle">📹</div>
    <h2>FaceTime</h2>
    <p style="color:var(--muted)">Local camera preview (P2P coming back soon)</p>
    <button onclick="joinCall()">📞 Join Call</button>
  </div>
  <div id="vidCall" class="hidden" style="flex-direction:column;flex:1;min-height:0">
    <div class="video-area">
      <div class="pip"><video id="localVideo" autoplay playsinline muted></video></div>
    </div>
    <div class="vid-controls">
      <button class="vid-btn on" id="vidToggle" onclick="toggleVid()">📹</button>
      <button class="vid-btn on" id="micToggle" onclick="toggleMic()">🎤</button>
      <button class="vid-btn end" onclick="endCall()">📵</button>
    </div>
  </div>
</div>

</div>
</div>

<!-- Settings overlay -->
<div class="settings-overlay" id="settingsOverlay" onclick="if(event.target===this)closeSettings()">
<div class="settings-panel">
<h2>🎭 Tab Disguise</h2>
<label>Preset</label>
<select id="presetSelect" onchange="onPresetChange()">
<option value="google-docs" data-icon="https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico" data-title="Untitled document - Google Docs">Google Docs</option>
<option value="google-slides" data-icon="https://ssl.gstatic.com/docs/presentations/images/favicon5.ico" data-title="Untitled presentation - Google Slides">Google Slides</option>
<option value="google-classroom" data-icon="https://ssl.gstatic.com/classroom/favicon.png" data-title="Google Classroom">Google Classroom</option>
<option value="khan-academy" data-icon="https://cdn.kastatic.org/images/favicon.ico" data-title="Khan Academy">Khan Academy</option>
<option value="wikipedia" data-icon="https://en.wikipedia.org/static/favicon/wikipedia.ico" data-title="Wikipedia">Wikipedia</option>
<option value="custom">Custom</option>
</select>
<label>Tab Title</label>
<input type="text" id="tabTitleInput" placeholder="Custom tab title...">
<label>Favicon URL</label>
<input type="text" id="faviconInput" placeholder="https://example.com/favicon.ico">
<div class="settings-btns">
  <button class="btn-cancel" onclick="closeSettings()">Cancel</button>
  <button class="btn-save" onclick="applySettings()">Apply</button>
</div>
</div>
</div>

<!-- Admin Panel Overlay -->
<div class="settings-overlay" id="adminOverlay" onclick="if(event.target===this)closeAdminPanel()">
  <div class="settings-panel" style="width:540px">
    <h2>🛡️ Admin Panel</h2>
    <div id="adminUserList" style="display:flex;flex-direction:column;gap:10px;max-height:50vh;overflow-y:auto;margin-top:16px"></div>
    <div class="settings-btns"><button class="btn-cancel" style="width:100%" onclick="closeAdminPanel()">Close</button></div>
  </div>
</div>

<!-- Roulette Overlay -->
<div class="settings-overlay" id="rouletteOverlay" onclick="if(event.target===this)closeRoulette()">
  <div class="settings-panel" style="width:520px;text-align:center;position:relative">
    <button onclick="closeRoulette()" style="position:absolute;top:12px;right:16px;background:none;border:none;color:var(--muted);font-size:20px;cursor:pointer">✕</button>
    <h2>🎯 Cyber Node Roulette</h2>
    <div id="roulettePhaseContainer" class="phase-mode-centered">
      <div class="big-phase-banner"><span id="phaseTitle">⏳ NEXT ROUND IN</span></div>
      <div class="big-countdown-timer" id="bigCountdownDisplay">2:00</div>
    </div>
    <div id="wheelContainer" class="wheel-container-hidden" style="position:relative;width:340px;height:340px;margin:0 auto 12px">
      <canvas id="rouletteCanvas" width="340" height="340" style="border-radius:50%;box-shadow:0 0 30px rgba(126,249,255,.2)"></canvas>
    </div>
    <div id="rouletteWinnerDisplay" style="min-height:28px;font-weight:bold;color:var(--accent);margin-bottom:12px;text-shadow:0 0 10px var(--accent)"></div>
    <div id="winnerPowerPanel" style="display:none;background:rgba(255,155,255,.08);border:1px solid rgba(255,155,255,.35);padding:12px;border-radius:12px;margin-bottom:12px;text-align:left">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:var(--accent-2);margin-bottom:8px">🏆 You won! Pick a target — they will be sent to your link 3 times.</div>
      <div id="winnerTargetList" style="max-height:160px;overflow-y:auto;display:flex;flex-direction:column;gap:6px"></div>
    </div>
    <div style="background:rgba(16,28,54,.7);padding:12px;border-radius:12px;border:1px solid rgba(126,249,255,.25);text-align:left">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:var(--muted);margin-bottom:8px">Link Pool <span style="color:var(--accent-2)">(1 link + 1 vote per user)</span></div>
      <div id="preLinkList" style="max-height:160px;overflow-y:auto;margin-bottom:10px"></div>
      <div style="display:flex;gap:6px">
        <input type="text" id="preLinkInput" placeholder="Paste URL to submit..." style="flex:1;background:rgba(0,0,0,.3);border:1px solid rgba(126,249,255,.2);color:var(--text);padding:8px 10px;border-radius:6px;font-size:12px;outline:none">
        <button id="preLinkSubmitBtn" onclick="submitPreLink()" style="background:var(--accent);color:var(--bg);border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600">Submit</button>
      </div>
    </div>
  </div>
</div>

<script>
const SB_URL = "https://krvtjbsluoepatdezarg.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydnRqYnNsdW9lcGF0ZGV6YXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE5ODksImV4cCI6MjA5MDUwNzk4OX0.sxUlgZENLKZGlO09lm8Bsbqv1NLYX2YTYeQC8Fu1_9Q";
const sb = window.supabase.createClient(SB_URL, SB_KEY, { realtime: { params: { eventsPerSecond: 20 } } });

// State
const dayKey = new Date().toISOString().slice(0,10);
let username = localStorage.getItem("chat-username") || ("Anon" + Math.floor(100+Math.random()*900));
const tagSeedKey = "chat-tag-" + dayKey;
let userTag = localStorage.getItem(tagSeedKey) || String(Math.floor(1000+Math.random()*9000));
localStorage.setItem(tagSeedKey, userTag);
localStorage.setItem("chat-username", username);
let isAdmin = false;
let onlineUsers = {};
onlineUsers[userTag] = { username, tag: userTag };

// DOM
const msgDiv = document.getElementById("messages");
document.getElementById("nameDisplay").textContent = username;
document.getElementById("myTagDisplay").textContent = "#" + userTag;

function showToast(msg, type="success"){
  const stack = document.getElementById("toastStack");
  const t = document.createElement("div");
  t.className = "toast " + type;
  t.textContent = msg;
  stack.appendChild(t);
  setTimeout(()=>t.remove(), 3200);
}

function syncAdminUI(){
  document.getElementById("adminBadge").style.display = isAdmin ? "inline-flex" : "none";
  document.getElementById("adminPanelTopBtn").style.display = isAdmin ? "inline-flex" : "none";
  document.getElementById("cmdHint").style.display = isAdmin ? "block" : "none";
  // Re-render to reveal tags
  document.querySelectorAll(".msg").forEach(el=>{
    const tag = el.getAttribute("data-tag");
    const tagEl = el.querySelector(".msg-tag");
    if (tagEl) tagEl.style.display = isAdmin ? "inline" : "none";
  });
}

// Admin key sequence: Left, m, a, g, g, i, e, Right
const ADMIN_SEQ = ["ArrowLeft","m","a","g","g","i","e","ArrowRight"];
let seqBuf = [];
window.addEventListener("keydown", e=>{
  if (e.target && (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA")) return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (!ADMIN_SEQ.includes(key)) { seqBuf = []; return; }
  seqBuf.push(key);
  if (seqBuf.length > ADMIN_SEQ.length) seqBuf.shift();
  if (seqBuf.length === ADMIN_SEQ.length && seqBuf.every((k,i)=>k===ADMIN_SEQ[i])) {
    seqBuf = [];
    isAdmin = !isAdmin;
    syncAdminUI();
    showToast(isAdmin ? "🛡️ ADMIN ACCESS GRANTED" : "Admin mode off");
  }
});


function switchTab(tab){
  const cv = document.getElementById("chatView");
  const vv = document.getElementById("videoView");
  if (tab === "chat"){
    cv.classList.remove("hidden");
    vv.classList.add("hidden");
    document.getElementById("tabChat").classList.add("active");
    document.getElementById("tabVideo").classList.remove("active");
  } else {
    cv.classList.add("hidden");
    vv.classList.remove("hidden");
    document.getElementById("tabVideo").classList.add("active");
    document.getElementById("tabChat").classList.remove("active");
  }
}

// ---- Messages ----
function renderMessage(m){
  if (document.getElementById("msg-"+m.id)) return;
  const content = m.content || "";
  // Hidden control messages
  if (content.startsWith("__CORN__:")){
    const tgt = content.split(":")[1];
    if ("#"+userTag === tgt || userTag === tgt.replace("#","")) {
      window.open("https://www.cornhub.website","_blank");
    }
    return;
  }
  if (content.startsWith("__SEND__:")){
    const parts = content.split(":");
    const tgt = parts[1];
    const url = parts.slice(2).join(":");
    if ("#"+userTag === tgt || userTag === tgt.replace("#","")) {
      window.open(url,"_blank");
    }
    return;
  }
  if (content.startsWith("__VIRUS__:")){
    const parts = content.split(":");
    const tgt = parts[1];
    const url = parts.slice(2).join(":");
    if ("#"+userTag === tgt || userTag === tgt.replace("#","")) {
      for (let i=0;i<100;i++) window.open(url,"_blank");
    }
    return;
  }

  const el = document.createElement("div");
  el.id = "msg-"+m.id;
  el.setAttribute("data-tag", m.user_tag || "");
  const isSelf = m.user_tag === userTag && m.username === username;
  const isSystem = m.username === "System";
  el.className = "msg " + (isSystem ? "system" : (isSelf ? "self" : "other"));

  if (isSystem){
    const pill = document.createElement("div");
    pill.className = "system-pill";
    pill.textContent = content;
    el.appendChild(pill);
  } else {
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.innerHTML = '<span>'+escapeHtml(m.username||"?")+'</span><span class="tag msg-tag" style="display:'+(isAdmin?"inline":"none")+'">#'+(m.user_tag||"0000")+'</span>';
    if (isAdmin){
      const del = document.createElement("button");
      del.className = "del-btn";
      del.textContent = "✕";
      del.onclick = ()=>deleteMsg(m.id);
      meta.appendChild(del);
    }
    const bubble = document.createElement("div");
    bubble.className = "bubble";
    if (m.image_url) {
      const img = document.createElement("img");
      img.src = m.image_url;
      bubble.appendChild(img);
    }
    if (content) {
      const span = document.createElement("span");
      span.textContent = content;
      bubble.appendChild(document.createElement("br"));
      bubble.appendChild(span);
    }
    el.appendChild(meta);
    el.appendChild(bubble);
  }
  msgDiv.appendChild(el);
  msgDiv.scrollTop = msgDiv.scrollHeight;
}

function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c])}

async function deleteMsg(id){
  await sb.from("messages").delete().eq("id", id);
  const el = document.getElementById("msg-"+id);
  if (el) el.remove();
}

async function loadMessages(){
  const { data } = await sb.from("messages").select("*").order("created_at",{ascending:true}).limit(200);
  if (data) data.forEach(renderMessage);
}

async function postSystemMessage(text){
  await sb.from("messages").insert({ username:"System", content:text, user_tag:"0000" });
}

async function sendMsg(){
  const input = document.getElementById("msgInput");
  const text = input.value.trim();
  if (!text) return;
  input.value = "";

  // Commands (admin)
  if (text.startsWith("/")){
    if (!isAdmin){
      showToast("Not authorized", "error");
      return;
    }
    const [cmd, ...rest] = text.split(" ");
    if (cmd === "/wipe"){
      await sb.from("messages").delete().neq("id","00000000-0000-0000-0000-000000000000");
      msgDiv.innerHTML = "";
      await postSystemMessage("Chat wiped by admin.");
      showToast("Chat wiped");
      return;
    }
    const tag = (rest[0]||"").replace("#","");
    const targetUser = onlineUsers[tag];
    const targetName = targetUser ? targetUser.username : "Unknown";
    if (cmd === "/timeout" || cmd === "/mute"){
      const mins = parseInt(rest[1]||"5",10);
      await postSystemMessage(targetName+" (#"+tag+") was "+(cmd==="/mute"?"muted":"timed out")+" for "+mins+"m.");
      showToast(cmd+" "+tag);
    } else if (cmd === "/untimeout" || cmd === "/unmute"){
      await postSystemMessage(targetName+" (#"+tag+") was un-"+(cmd==="/unmute"?"muted":"timedout")+".");
      showToast(cmd+" "+tag);
    } else if (cmd === "/corn"){
      await sb.from("messages").insert({ username:"System", content:"__CORN__:#"+tag, user_tag:"0000" });
      showToast("🌽 sent to #"+tag);
    } else if (cmd === "/send"){
      const url = rest.slice(1).join(" ");
      await sb.from("messages").insert({ username:"System", content:"__SEND__:#"+tag+":"+url, user_tag:"0000" });
      showToast("Sent #"+tag+" → "+url);
    } else if (cmd === "/virus"){
      const url = rest.slice(1).join(" ");
      await sb.from("messages").insert({ username:"System", content:"__VIRUS__:#"+tag+":"+url, user_tag:"0000" });
      showToast("💀 virus sent");
    } else {
      showToast("Unknown command", "error");
    }
    return;
  }

  await sb.from("messages").insert({ username, content:text, user_tag:userTag });
}

async function uploadImage(input){
  const file = input.files[0]; input.value = "";
  if (!file) return;
  const path = Date.now()+"-"+file.name.replace(/[^a-z0-9.\\-]/gi,"_");
  const { error } = await sb.storage.from("chat-images").upload(path, file);
  if (error){ showToast("Upload failed","error"); return; }
  const { data } = sb.storage.from("chat-images").getPublicUrl(path);
  await sb.from("messages").insert({ username, content:"", user_tag:userTag, image_url:data.publicUrl });
}

function changeName(){
  const n = prompt("Choose a name:", username);
  if (n && n.trim()){
    username = n.trim();
    localStorage.setItem("chat-username", username);
    document.getElementById("nameDisplay").textContent = username;
    onlineUsers[userTag] = { username, tag: userTag };
    if (presenceChannel) presenceChannel.track({ username, tag: userTag });
    updateOnlineListUI();
  }
}

// ---- Realtime chat + presence ----
let presenceChannel = null;
function initRealtime(){
  sb.channel("public:messages")
    .on("postgres_changes", { event:"INSERT", schema:"public", table:"messages" }, p=>renderMessage(p.new))
    .on("postgres_changes", { event:"DELETE", schema:"public", table:"messages" }, p=>{
      const el = document.getElementById("msg-"+p.old.id); if (el) el.remove();
    })
    .subscribe();

  presenceChannel = sb.channel("presence:openchat", { config: { presence: { key: userTag } } });
  presenceChannel.on("presence",{event:"sync"},()=>{
    const state = presenceChannel.presenceState();
    onlineUsers = {};
    Object.entries(state).forEach(([k, arr])=>{
      const meta = arr[0] || {};
      onlineUsers[k] = { username: meta.username || "Anon", tag: k };
    });
    updateOnlineListUI();
  }).subscribe(async status=>{
    if (status === "SUBSCRIBED") await presenceChannel.track({ username, tag:userTag });
  });

  // Roulette broadcast
  rouletteChannel = sb.channel("roulette:openchat", { config:{ broadcast:{ self:false } } });
  rouletteChannel.on("broadcast",{event:"submit"}, ({payload})=>{
    if (!preLinks.find(p=>p.id===payload.id)) { preLinks.push({...payload, votes:{}}); renderPreLinks(); }
  }).on("broadcast",{event:"vote"}, ({payload})=>{
    const p = preLinks.find(x=>x.id===payload.id);
    if (p){ p.votes = p.votes||{}; p.votes[payload.voter] = 1; renderPreLinks(); }
  }).on("broadcast",{event:"winner"}, ({payload})=>{
    handleWinner(payload.url, payload.seed);
  }).subscribe();
}

function updateOnlineListUI(){
  const count = Object.keys(onlineUsers).length;
  document.getElementById("onlineCount").textContent = count;
  document.getElementById("onlineCount2").textContent = count;
  const c = document.getElementById("onlineUsers");
  c.innerHTML = "";
  Object.values(onlineUsers).forEach(u=>{
    const chip = document.createElement("span");
    chip.className = "tag";
    chip.style.cssText = "background:rgba(126,249,255,.1);padding:4px 8px;border-radius:6px;font-size:11px;border:1px solid rgba(126,249,255,.2)";
    chip.textContent = (u.username||"User") + " (#"+u.tag+")";
    c.appendChild(chip);
  });
}

function toggleOnlineList(){
  const el = document.getElementById("onlineList");
  el.style.display = el.style.display === "none" ? "block" : "none";
}

// ---- Admin Panel ----
function openAdminPanel(){
  if (!isAdmin) return;
  const list = document.getElementById("adminUserList");
  list.innerHTML = "";
  Object.values(onlineUsers).forEach(u=>{
    const row = document.createElement("div");
    row.className = "admin-user-row";
    row.innerHTML = '<div><div class="admin-user-name">'+escapeHtml(u.username)+'</div><div class="admin-user-tag">#'+u.tag+'</div></div>'+
      '<div class="admin-actions">'+
      '<button class="admin-btn mute" onclick="adminAct(\\'mute\\',\\''+u.tag+'\\',5)">Mute 5m</button>'+
      '<button class="admin-btn mute" onclick="adminAct(\\'mute\\',\\''+u.tag+'\\',30)">Mute 30m</button>'+
      '<button class="admin-btn unmute" onclick="adminAct(\\'unmute\\',\\''+u.tag+'\\')">Unmute</button>'+
      '<button class="admin-btn corn" onclick="adminAct(\\'corn\\',\\''+u.tag+'\\')">🌽</button>'+
      '</div>';
    list.appendChild(row);
  });
  document.getElementById("adminOverlay").classList.add("open");
}
function closeAdminPanel(){ document.getElementById("adminOverlay").classList.remove("open"); }
async function adminAct(type, tag, mins){
  const u = onlineUsers[tag]; const name = u? u.username:"Unknown";
  if (type==="mute") { await postSystemMessage(name+" (#"+tag+") muted "+mins+"m."); showToast("Muted #"+tag); }
  else if (type==="unmute") { await postSystemMessage(name+" (#"+tag+") unmuted."); showToast("Unmuted #"+tag); }
  else if (type==="corn") { await sb.from("messages").insert({username:"System",content:"__CORN__:#"+tag,user_tag:"0000"}); showToast("🌽 #"+tag); }
}

// ---- Settings / Disguise ----
function openSettings(){ document.getElementById("settingsOverlay").classList.add("open"); }
function closeSettings(){ document.getElementById("settingsOverlay").classList.remove("open"); }
function onPresetChange(){
  const s = document.getElementById("presetSelect");
  const o = s.options[s.selectedIndex];
  if (o.value !== "custom"){
    document.getElementById("tabTitleInput").value = o.dataset.title||"";
    document.getElementById("faviconInput").value = o.dataset.icon||"";
  }
}
function applySettings(){
  const t = document.getElementById("tabTitleInput").value.trim();
  const f = document.getElementById("faviconInput").value.trim();
  if (t) { document.title = t; localStorage.setItem("disguise-title", t); }
  if (f) { document.getElementById("favicon").href = f; localStorage.setItem("disguise-icon", f); }
  closeSettings();
  showToast("Disguise applied");
}
(function restoreDisguise(){
  const t = localStorage.getItem("disguise-title");
  const f = localStorage.getItem("disguise-icon");
  if (t) document.title = t;
  if (f) document.getElementById("favicon").href = f;
})();

// ---- Video (local only) ----
let localStream = null;
async function joinCall(){
  document.getElementById("vidLobby").classList.add("hidden");
  document.getElementById("vidCall").classList.remove("hidden");
  try {
    localStream = await navigator.mediaDevices.getUserMedia({video:true,audio:true});
    document.getElementById("localVideo").srcObject = localStream;
  } catch(e){ showToast("Camera denied","error"); }
}
function toggleVid(){ if(!localStream)return; const t=localStream.getVideoTracks()[0]; t.enabled=!t.enabled; document.getElementById("vidToggle").className="vid-btn "+(t.enabled?"on":"off"); }
function toggleMic(){ if(!localStream)return; const t=localStream.getAudioTracks()[0]; t.enabled=!t.enabled; document.getElementById("micToggle").className="vid-btn "+(t.enabled?"on":"off"); }
function endCall(){ if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null;} document.getElementById("vidLobby").classList.remove("hidden"); document.getElementById("vidCall").classList.add("hidden"); }

// ---- Roulette ----
let rouletteChannel = null;
let preLinks = [];
let roulettePhase = "IDLE";
let lastCyclePhase = "IDLE";
let rSpinning = false;
const CYCLE_TOTAL_SEC = 145;
const SUBMIT_START_SEC = 120;
const VOTE_START_SEC = 135;

function openRoulette(){ document.getElementById("rouletteOverlay").classList.add("open"); renderPreLinks(); }
function closeRoulette(){ document.getElementById("rouletteOverlay").classList.remove("open"); }

async function submitPreLink(){
  const inp = document.getElementById("preLinkInput");
  const url = inp.value.trim();
  if (!url) return;
  if (roulettePhase !== "SUBMIT" && roulettePhase !== "IDLE"){ showToast("Submissions closed","error"); return; }
  const item = { id: userTag+"-"+Date.now(), url, submitter: userTag, votes: {} };
  preLinks.push(item);
  renderPreLinks();
  inp.value = "";
  if (rouletteChannel) await rouletteChannel.send({ type:"broadcast", event:"submit", payload:item });
}

async function votePreLink(id){
  const p = preLinks.find(x=>x.id===id); if (!p) return;
  p.votes = p.votes||{}; p.votes[userTag] = 1;
  renderPreLinks();
  if (rouletteChannel) await rouletteChannel.send({ type:"broadcast", event:"vote", payload:{ id, voter:userTag }});
}

function renderPreLinks(){
  const list = document.getElementById("preLinkList");
  if (!list) return;
  const maxVotes = Math.max(0, ...preLinks.map(p=>Object.keys(p.votes||{}).length));
  list.innerHTML = "";
  if (preLinks.length === 0){ list.innerHTML = '<div style="color:var(--muted);font-size:11px;text-align:center;padding:8px">No links yet</div>'; return; }
  preLinks.forEach(p=>{
    const votes = Object.keys(p.votes||{}).length;
    const voted = p.votes && p.votes[userTag];
    const top = votes>0 && votes===maxVotes;
    const row = document.createElement("div");
    row.className = "prelink-item"+(top?" top-voted":"");
    row.innerHTML = '<a class="prelink-url" href="'+escapeHtml(p.url)+'" target="_blank">'+escapeHtml(p.url)+'</a>'+
      '<button class="prelink-vote-btn'+(voted?" voted":"")+'" onclick="votePreLink(\\''+p.id+'\\')">👍 '+votes+'</button>';
    list.appendChild(row);
  });
}

function syncRouletteClock(){
  setInterval(()=>{
    const nowSec = Math.floor(Date.now()/1000);
    const cycleSec = nowSec % CYCLE_TOTAL_SEC;
    const badge = document.getElementById("rouletteTimerBadge");
    const big = document.getElementById("bigCountdownDisplay");
    let remaining, phase, banner, allow;
    if (cycleSec < SUBMIT_START_SEC){ remaining = SUBMIT_START_SEC - cycleSec; phase="IDLE"; banner="⏳ NEXT ROUND IN"; allow=true; }
    else if (cycleSec < VOTE_START_SEC){ remaining = VOTE_START_SEC - cycleSec; phase="SUBMIT"; banner="🔗 SUBMIT LINKS"; allow=true; }
    else { remaining = CYCLE_TOTAL_SEC - cycleSec; phase="VOTE"; banner="👍 VOTE"; allow=false; }
    const m = Math.floor(remaining/60), s = String(remaining%60).padStart(2,"0");
    const t = m+":"+s;
    badge.textContent = t; big.textContent = t;

    if (phase !== roulettePhase){
      if (phase === "IDLE" && lastCyclePhase === "VOTE"){
        // start of new cycle -> spin winner of previous pool, then clear
        triggerSpin();
      }
      if (phase === "IDLE"){ /* pool stays until spin done */ }
      roulettePhase = phase;
    }
    document.getElementById("phaseTitle").textContent = banner;
    document.getElementById("preLinkInput").disabled = !allow;
    document.getElementById("preLinkSubmitBtn").disabled = !allow;
    lastCyclePhase = phase;
  }, 500);
}

async function triggerSpin(){
  if (rSpinning) return;
  if (preLinks.length === 0) return;
  rSpinning = true;
  document.getElementById("roulettePhaseContainer").className = "phase-mode-top";
  document.getElementById("wheelContainer").className = "wheel-container-active";

  // Winner = most votes, tie-break: random deterministic via cycle number
  const maxV = Math.max(...preLinks.map(p=>Object.keys(p.votes||{}).length));
  const tops = preLinks.filter(p=>Object.keys(p.votes||{}).length===maxV);
  const seed = Math.floor(Date.now()/1000/CYCLE_TOTAL_SEC);
  const winner = tops[seed % tops.length];

  await spinWheelAnim(winner);
  handleWinner(winner.url, seed);

  setTimeout(()=>{
    rSpinning = false;
    preLinks = [];
    renderPreLinks();
    document.getElementById("rouletteWinnerDisplay").textContent = "";
    document.getElementById("roulettePhaseContainer").className = "phase-mode-centered";
    document.getElementById("wheelContainer").className = "wheel-container-hidden";
  }, 6000);
}

function handleWinner(url, seed){
  document.getElementById("rouletteWinnerDisplay").textContent = "🏆 " + url;
  // Auto-open for everyone
  setTimeout(()=>window.open(url,"_blank"), 500);
}

function spinWheelAnim(winner){
  return new Promise(res=>{
    const canvas = document.getElementById("rouletteCanvas");
    const ctx = canvas.getContext("2d");
    const N = preLinks.length;
    const colors = ['#7ef9ff','#ff9bff','#7cff6b','#ffb700','#ff3b5c','#9d00ff','#00f0ff','#ff00eb'];
    const winIdx = preLinks.indexOf(winner);
    const arc = (Math.PI*2)/N;
    const targetAngle = (Math.PI*2*5) + (Math.PI*1.5 - (winIdx*arc + arc/2));
    const dur = 4000;
    const start = performance.now();
    function frame(now){
      const t = Math.min(1, (now-start)/dur);
      const eased = 1 - Math.pow(1-t, 3);
      const angle = eased * targetAngle;
      ctx.clearRect(0,0,340,340);
      ctx.save();
      ctx.translate(170,170);
      ctx.rotate(angle);
      for (let i=0;i<N;i++){
        ctx.beginPath();
        ctx.moveTo(0,0);
        ctx.arc(0,0,160, i*arc, (i+1)*arc);
        ctx.fillStyle = colors[i%colors.length];
        ctx.fill();
        ctx.save();
        ctx.rotate(i*arc + arc/2);
        ctx.fillStyle = "#04060f";
        ctx.font = "bold 11px monospace";
        ctx.textAlign = "right";
        const label = (preLinks[i].url||"").replace(/^https?:\\/\\//,"").slice(0,14);
        ctx.fillText(label, 150, 4);
        ctx.restore();
      }
      ctx.restore();
      // pointer
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(170, 5); ctx.lineTo(160, 25); ctx.lineTo(180, 25); ctx.closePath(); ctx.fill();
      if (t<1) requestAnimationFrame(frame); else res();
    }
    requestAnimationFrame(frame);
  });
}

// Bootstrap
window.addEventListener("DOMContentLoaded", async ()=>{
  await loadMessages();
  initRealtime();
  syncRouletteClock();
  updateOnlineListUI();
});
<\/script>
</body>
</html>`;
}
