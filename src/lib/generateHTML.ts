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
body{font-family:'Inter',system-ui,-apple-system,BlinkMacSystemFont,sans-serif;background:radial-gradient(circle at top, rgba(75,122,255,.2), transparent 55%),radial-gradient(circle at 20% 20%, rgba(255,140,251,.18), transparent 50%),radial-gradient(circle at bottom, rgba(124,255,107,.15), transparent 50%),var(--bg);color:var(--text);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:28px 16px}
.app{display:grid;gap:24px;width:min(1080px,100%);height:min(95vh,980px)}
.hero{text-align:center}
.hero h1{font-size:clamp(2rem,4vw,3rem);letter-spacing:.25em;text-transform:uppercase;color:var(--accent);text-shadow:0 0 12px rgba(126,249,255,.45)}
.tab-switcher{margin-top:12px;display:inline-flex;gap:8px;padding:4px;border-radius:999px;background:rgba(16,28,54,.6);border:1px solid rgba(126,249,255,.2)}
.tab-sw-btn{display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:999px;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.18em;border:none;cursor:pointer;transition:all .2s;background:transparent;color:var(--muted)}
.tab-sw-btn.active{background:var(--accent);color:var(--bg);box-shadow:0 0 14px rgba(126,249,255,.3)}
.tab-sw-btn:not(.active):hover{color:var(--text)}
.panel{display:flex;flex-direction:column;min-height:0;background:var(--panel);border:1px solid rgba(126,249,255,.18);border-radius:20px;padding:24px;box-shadow:0 16px 40px rgba(4,6,15,.65);backdrop-filter:blur(18px)}

.topbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}
.badge{display:inline-flex;align-items:center;gap:10px;padding:6px 14px;border-radius:999px;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;background:rgba(126,249,255,.1);border:1px solid rgba(126,249,255,.3)}
.badge::before{content:"";width:10px;height:10px;border-radius:50%;background:radial-gradient(circle,var(--accent) 0%,rgba(126,249,255,.2) 70%);box-shadow:0 0 12px rgba(126,249,255,.6)}
.header-right{margin-left:auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.name-btn,.tab-btn{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:6px 16px;border-radius:999px;text-decoration:none;text-transform:uppercase;letter-spacing:.2em;font-size:.7rem;color:var(--text);background:linear-gradient(145deg, rgba(16,28,54,.95), rgba(10,16,32,.9));box-shadow:inset 0 0 0 1px rgba(126,249,255,.2),0 6px 14px rgba(0,0,0,.35);border:none;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease}
.name-btn:hover,.tab-btn:hover{transform:translateY(-2px);box-shadow:inset 0 0 0 1px rgba(126,249,255,.35),0 10px 20px rgba(0,0,0,.45)}
.admin-badge{background:var(--danger);color:#fff;font-size:10px;padding:2px 8px;border-radius:999px;font-weight:700;text-transform:uppercase;letter-spacing:.16em}
.tag{color:var(--accent);font-family:monospace;font-size:12px}

#messages{flex:1;overflow-y:auto;background:rgba(0,0,0,.3);border-radius:12px;padding:15px;margin-bottom:15px;border:1px solid rgba(126,249,255,.1);display:flex;flex-direction:column;gap:12px}
#messages::-webkit-scrollbar{width:6px}
#messages::-webkit-scrollbar-track{background:transparent}
#messages::-webkit-scrollbar-thumb{background:rgba(126,249,255,.22);border-radius:3px}
.msg{display:flex;flex-direction:column;max-width:75%}
.msg.self{align-self:flex-end;align-items:flex-end}
.msg.other{align-self:flex-start;align-items:flex-start}
.msg.system{align-self:center;max-width:100%;align-items:center}
.meta{font-size:12px;font-weight:700;letter-spacing:.04em;color:rgba(238,247,255,.82);margin-bottom:4px;padding:0 4px;display:flex;align-items:center;gap:6px}
.del-btn{background:none;border:none;color:var(--danger);cursor:pointer;font-size:12px;padding:0 2px;display:none}
.del-btn:hover{color:#ff8787}
.bubble{padding:10px 16px;border-radius:16px;font-size:14px;word-break:break-word;line-height:1.5}
.self .bubble{background:var(--accent);color:var(--bg);border-bottom-right-radius:6px;box-shadow:0 0 18px rgba(126,249,255,.22);font-weight:500}
.other .bubble{background:rgba(27,38,72,.95);color:var(--text);border-bottom-left-radius:6px}
.system-pill{padding:7px 16px;border-radius:999px;background:rgba(255,155,255,.12);border:1px solid rgba(255,155,255,.28);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--text)}
.bubble img{max-width:100%;max-height:280px;border-radius:8px;margin-top:6px;object-fit:cover}

.input-bar{padding:12px;border:1px solid rgba(126,249,255,.18);border-radius:12px;background:rgba(255,255,255,.05)}
.cmd-hint{font-size:11px;color:var(--muted);margin-bottom:8px;font-family:monospace;display:none;text-transform:uppercase;letter-spacing:.15em}
.input-row{display:flex;gap:10px;align-items:center;border:1px solid rgba(126,249,255,.28);background:rgba(0,0,0,.2);padding:8px;border-radius:12px}
.input-bar input[type=text]{flex:1;background:none;border:none;color:var(--text);padding:12px 10px;border-radius:12px;font-size:14px;outline:none}
.input-bar button{background:var(--accent);color:var(--bg);border:none;width:42px;height:42px;border-radius:999px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(126,249,255,.32);transition:transform 0.15s ease}
.input-bar button:active{transform:scale(0.95)}
.input-bar button:disabled{opacity:.4;cursor:default}
.img-btn{background:linear-gradient(145deg, rgba(16,28,54,.95), rgba(10,16,32,.9))!important;color:var(--text)!important;box-shadow:inset 0 0 0 1px rgba(126,249,255,.2),0 6px 14px rgba(0,0,0,.35)!important}
.img-btn svg{width:20px;height:20px}
.empty{display:flex;align-items:center;justify-content:center;flex:1;color:var(--muted);font-size:14px;letter-spacing:.18em;text-transform:uppercase}
.settings-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:none;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(6px)}
.settings-overlay.open{display:flex}
.settings-panel{background:rgba(9,15,32,.96);border:1px solid rgba(126,249,255,.25);border-radius:16px;padding:24px;width:380px;max-width:90vw;box-shadow:0 16px 40px rgba(4,6,15,.8)}
.settings-panel h2{font-size:16px;font-weight:700;color:var(--accent);margin-bottom:16px;letter-spacing:1px;text-transform:uppercase}
.settings-panel label{display:block;font-size:11px;color:var(--muted);margin-bottom:4px;margin-top:12px;letter-spacing:.14em;text-transform:uppercase}
.settings-panel select,.settings-panel input[type=text]{width:100%;background:rgba(27,38,72,.95);border:1px solid rgba(126,249,255,.18);color:var(--text);padding:10px 12px;border-radius:8px;font-size:14px;outline:none}
.settings-panel select:focus,.settings-panel input[type=text]:focus{border-color:var(--accent)}
.settings-btns{display:flex;gap:8px;margin-top:20px}
.settings-btns button{flex:1;padding:10px;border-radius:8px;font-size:13px;cursor:pointer;border:none;font-weight:600;letter-spacing:1px;text-transform:uppercase}
.btn-save{background:var(--accent);color:var(--bg)}
.btn-cancel{background:rgba(27,38,72,.95);color:var(--muted)}

.toast-stack{position:fixed;top:18px;right:18px;display:flex;flex-direction:column;gap:10px;z-index:200;pointer-events:none}
.toast{min-width:220px;max-width:min(360px,calc(100vw - 36px));padding:12px 16px;border-radius:14px;border:1px solid rgba(126,249,255,.26);background:rgba(9,15,32,.94);color:var(--text);box-shadow:0 18px 42px rgba(4,6,15,.55);font-size:12px;letter-spacing:.12em;text-transform:uppercase;transform:translateY(-8px);opacity:0;animation:toast-in .22s ease forwards}
.toast.success{border-color:rgba(126,249,255,.38)}
.toast.error{border-color:rgba(255,75,75,.45);color:#ffd7d7}
@keyframes toast-in{to{transform:translateY(0);opacity:1}}

/* Custom Admin Panel User Row Styling */
.admin-user-row{display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,.25);padding:12px;border-radius:10px;border:1px solid rgba(126,249,255,.15)}
.admin-user-info{display:flex;flex-direction:column;gap:2px}
.admin-user-name{font-weight:700;font-size:14px;color:var(--text)}
.admin-user-tag{font-family:monospace;font-size:11px;color:var(--accent)}
.admin-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}
.admin-btn{border:none;padding:6px 12px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;text-transform:uppercase;letter-spacing:.1em;transition:all .2s;display:flex;align-items:center;justify-content:center}
.admin-btn.mute{background:rgba(255,165,0,.15);color:var(--warning);border:1px solid rgba(255,165,0,.3)}
.admin-btn.mute:hover{background:rgba(255,165,0,.25);transform:translateY(-1px)}
.admin-btn.unmute{background:rgba(74,222,128,.15);color:var(--success);border:1px solid rgba(74,222,128,.3)}
.admin-btn.unmute:hover{background:rgba(74,222,128,.25);transform:translateY(-1px)}
.admin-btn.corn{background:rgba(255,215,0,.15);color:gold;border:1px solid rgba(255,215,0,.3);font-size:13px;padding:4px 10px}
.admin-btn.corn:hover{background:rgba(255,215,0,.25);transform:translateY(-1px)}
.admin-panel-btn-top{background:var(--danger)!important;color:#fff!important;box-shadow:inset 0 0 0 1px rgba(255,75,75,.4),0 6px 14px rgba(0,0,0,.35)!important}

#chatView,#videoView{min-height:0}
.video-area{position:relative;flex:1;overflow:hidden;border-radius:12px;background:rgba(0,0,0,.4);border:1px solid rgba(126,249,255,.08);display:flex;align-items:center;justify-content:center}
.video-area video{width:100%;height:100%;object-fit:cover;border-radius:12px}
.pip{position:absolute;bottom:12px;right:12px;width:130px;height:160px;border-radius:12px;overflow:hidden;border:2px solid rgba(126,249,255,.3);box-shadow:0 4px 12px rgba(0,0,0,.4);background:#000;z-index:10}
.pip video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
.pip .cam-off{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:rgba(30,40,70,.95);color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.12em}
.vid-controls{display:flex;align-items:center;justify-content:center;gap:12px;padding:16px 0}

/* Pre-Link & Voting Styles */
.prelink-item{display:flex;align-items:center;justify-content:space-between;background:rgba(0,0,0,0.3);padding:6px 10px;border-radius:8px;border:1px solid rgba(126,249,255,0.15);font-size:11px}
.prelink-item.top-voted{border-color:var(--accent-3);background:rgba(124,255,107,0.1)}
.prelink-url{color:var(--accent);text-decoration:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px}
.prelink-vote-btn{background:rgba(126,249,255,0.15);border:1px solid rgba(126,249,255,0.3);color:var(--text);padding:2px 8px;border-radius:6px;cursor:pointer;font-size:10px;display:flex;align-items:center;gap:4px;transition:all 0.2s}
.prelink-vote-btn.voted{background:var(--accent);color:var(--bg);font-weight:bold}
.prelink-vote-btn:hover{transform:scale(1.04)}

/* Big Centered Countdown & Phase Banner Dynamic Styles */
.phase-mode-centered {
  margin: 16px auto;
  padding: 24px 20px;
  background: radial-gradient(circle, rgba(16,28,54,0.95) 0%, rgba(9,15,32,0.98) 100%);
  border: 2px solid rgba(126,249,255,0.4);
  border-radius: 20px;
  box-shadow: 0 0 35px rgba(126,249,255,0.25), inset 0 0 20px rgba(126,249,255,0.1);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.phase-mode-top {
  margin: 4px auto 12px auto;
  padding: 8px 14px;
  background: rgba(126,249,255,0.12);
  border: 1px solid rgba(126,249,255,0.3);
  border-radius: 12px;
  box-shadow: none;
  transition: all 0.4s ease;
}
.big-phase-banner {
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--accent);
}
.big-countdown-timer {
  font-size: 3.8rem;
  font-weight: 900;
  font-family: 'Courier New', Courier, monospace;
  color: var(--accent-2);
  text-shadow: 0 0 20px rgba(255,155,255,0.8), 0 0 35px rgba(126,249,255,0.6);
  line-height: 1.1;
  margin-top: 6px;
}
.phase-mode-top .big-countdown-timer {
  font-size: 1.6rem;
  margin-top: 2px;
}
.wheel-container-hidden {
  opacity: 0.15;
  transform: scale(0.75);
  pointer-events: none;
  height: 60px !important;
  overflow: hidden;
  transition: all 0.4s ease;
}
.wheel-container-active {
  opacity: 1;
  transform: scale(1);
  pointer-events: auto;
  height: 340px !important;
  transition: all 0.4s ease;
}

.vid-btn{width:48px;height:48px;border-radius:999px;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:20px;transition:all .2s}
.vid-btn.on{background:rgba(27,38,72,.95);color:var(--text)}
.vid-btn.off{background:var(--danger);color:#fff}
.vid-btn.end{width:56px;height:56px;background:var(--danger);color:#fff;box-shadow:0 0 20px rgba(255,75,75,.4)}
.vid-btn.share{background:rgba(27,38,72,.95);color:var(--text)}
.vid-btn.share.active{background:var(--accent);color:var(--bg)}
.vid-status{display:flex;align-items:center;justify-content:center;gap:8px;padding:8px}
.vid-status .dot{width:10px;height:10px;border-radius:50%}
.vid-status .dot.wait{background:var(--accent);box-shadow:0 0 14px rgba(126,249,255,.65);animation:pulse 2s infinite}
.vid-status .dot.conn{background:var(--accent-3);box-shadow:0 0 14px rgba(124,255,107,.65)}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.vid-join{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;flex:1;padding:24px;text-align:center}
.vid-join .icon-circle{width:80px;height:80px;border-radius:999px;background:rgba(126,249,255,.1);display:flex;align-items:center;justify-content:center;font-size:36px;box-shadow:0 0 30px rgba(126,249,255,.2)}
.vid-join h2{font-size:24px;font-weight:700;text-transform:uppercase;letter-spacing:.15em}
.vid-join p{font-size:14px;color:var(--muted);letter-spacing:.08em}
.vid-join button{padding:12px 32px;border-radius:999px;background:var(--accent);color:var(--bg);border:none;font-size:16px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 0 18px rgba(126,249,255,.32)}
.hidden{display:none!important}
@media (max-width:700px){body{padding:16px}.app{height:calc(100vh - 32px)}.panel{padding:18px}.header-right{margin-left:0}.msg{max-width:100%}.pip{width:90px;height:120px}}
</style>
</head>
<body>
<div class="app">
<div class="hero">
  <h1>OpenChat</h1>
  <div class="tab-switcher">
    <button class="tab-sw-btn active" id="tabChat" onclick="switchTab('chat')">💬 Live Chat</button>
    <button class="tab-sw-btn" id="tabVideo" onclick="switchTab('video')">📹 FaceTime</button>
  </div>
</div>
<div class="panel">
<!-- CHAT VIEW -->
<div id="chatView" style="display:flex;flex-direction:column;flex:1;min-height:0">
<div class="topbar">
<div class="badge">Live Chat</div>
<button class="name-btn" id="onlineBtn" onclick="toggleOnlineList()" style="gap:6px;font-size:11px">👥 <span id="onlineCount">1</span> Online</button>
<button class="name-btn" id="rouletteBtn" onclick="openRoulette()" style="gap:6px;font-size:11px;background:linear-gradient(135deg,rgba(126,249,255,.2),rgba(255,155,255,.2));border:1px solid rgba(126,249,255,.4);cursor:pointer;position:relative;z-index:5">🎯 Roulette (<span id="rouletteTimerBadge" style="pointer-events:none">2:00</span>)</button>
<span class="admin-badge" id="adminBadge" style="display:none">Admin</span>
<button class="name-btn admin-panel-btn-top" id="adminPanelTopBtn" style="display:none;" onclick="openAdminPanel()">🛡️ Panel</button>
<div class="header-right">
<button class="name-btn" onclick="changeName()">⚙ <span id="nameDisplay">Anonymous</span> <span class="tag" id="myTagDisplay"></span></button>
<button class="tab-btn" onclick="openSettings()" title="Tab Disguise">🎭 Disguise</button>
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
<button class="img-btn" onclick="document.getElementById('fileInput').click()"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></button>
<input type="text" id="msgInput" placeholder="Type a message..." onkeydown="if(event.key==='Enter')sendMsg()">
<button onclick="sendMsg()">➤</button>
</div>
</div>
</div>

<!-- VIDEO VIEW -->
<div id="videoView" class="hidden" style="flex-direction:column;flex:1;min-height:0">
  <div id="vidLobby" class="vid-join">
    <div class="icon-circle">📹</div>
    <h2>FaceTime</h2>
    <p>Jump into the video call room</p>
    <button onclick="joinCall()">📞 Join Call</button>
  </div>
  <div id="vidCall" class="hidden" style="display:flex;flex-direction:column;flex:1;min-height:0">
    <div class="vid-status">
      <span class="dot wait" id="vidDot"></span>
      <span id="vidStatusText" style="font-size:12px;text-transform:uppercase;letter-spacing:.2em">Connecting camera...</span>
    </div>
    <div class="video-area">
      <video id="remoteVideo" autoplay playsinline style="display:none"></video>
      <div id="waitingSpinner" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
        <div style="text-align:center">
          <div style="width:48px;height:48px;border:2px solid rgba(126,249,255,.4);border-top-color:var(--accent);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px"></div>
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:var(--muted)">Waiting for peer connection...</p>
        </div>
      </div>
      <div class="pip" id="localPip">
        <video id="localVideo" autoplay playsinline muted></video>
      </div>
    </div>
    <div class="vid-controls">
      <button class="vid-btn on" id="vidToggle" onclick="toggleVid()">📹</button>
      <button class="vid-btn on" id="micToggle" onclick="toggleMic()">🎤</button>
      <button class="vid-btn share" id="shareToggle" onclick="toggleShare()">🖥</button>
      <button class="vid-btn end" onclick="endCall()">📵</button>
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
<option value="wikipedia" data-icon="https://en.wikipedia.org/static/favicon/wikipedia.ico" data-title="Wikipedia, the free encyclopedia">Wikipedia</option>
<option value="custom" data-icon="" data-title="">Custom</option>
</select>
<label>Tab Title</label>
<input type="text" id="tabTitleInput" placeholder="Custom tab title...">
<label>Favicon URL (optional)</label>
<input type="text" id="faviconInput" placeholder="https://example.com/favicon.ico">

<label style="margin-top:16px; border-top:1px solid rgba(126,249,255,0.1); padding-top:10px;">Supabase Config (Optional)</label>
<input type="text" id="sbUrlInput" placeholder="https://xyz.supabase.co" style="margin-bottom:6px">
<input type="text" id="sbKeyInput" placeholder="Anon API Key">

<div class="settings-btns">
<button class="btn-cancel" onclick="closeSettings()">Cancel</button>
<button class="btn-save" onclick="applySettings()">Apply</button>
</div>
</div>
</div>

<!-- Admin Panel Overlay -->
<div class="settings-overlay" id="adminOverlay" onclick="if(event.target===this)closeAdminPanel()">
  <div class="settings-panel" style="width: 540px; max-width: 95vw;">
    <h2>🛡️ Admin Panel</h2>
    <p style="font-size:12px; color:var(--muted); letter-spacing:0.1em; text-transform:uppercase;">Manage online users</p>
    
    <div id="adminUserList" style="display:flex; flex-direction:column; gap:10px; max-height:50vh; overflow-y:auto; margin-top:16px; padding-right:4px;">
      <!-- Populated via JS -->
    </div>
    
    <div class="settings-btns">
      <button class="btn-cancel" style="width: 100%" onclick="closeAdminPanel()">Close Panel</button>
    </div>
  </div>
</div>

<!-- Roulette Overlay -->
<div class="settings-overlay" id="rouletteOverlay" onclick="if(event.target===this)closeRoulette()">
  <div class="settings-panel" style="width: 520px; max-width: 95vw; text-align: center; position:relative; overflow:hidden; background:rgba(6,10,24,0.96); border:1px solid rgba(126,249,255,0.3); box-shadow:0 0 35px rgba(126,249,255,0.15)">
    <button onclick="closeRoulette()" style="position:absolute; top:12px; right:16px; background:none; border:none; color:var(--muted); font-size:20px; font-weight:bold; cursor:pointer; z-index:10; transition:color 0.2s;" onmouseover="this.style.color='var(--accent)'" onmouseout="this.style.color='var(--muted)'" title="Close">✕</button>
    <h2 style="font-size:18px; text-transform:uppercase; letter-spacing:2px; text-shadow:0 0 10px rgba(126,249,255,0.6)">🎯 Cyber Node Roulette</h2>
    
    <!-- BIG CENTERED PHASE & COUNTDOWN BOX (Centered during Idle/Submit/Vote, moves Top during Spin) -->
    <div id="roulettePhaseContainer" class="phase-mode-centered">
      <div id="roulettePhaseBanner" class="big-phase-banner">
        <span id="phaseTitle">⏳ NEXT ROUND IN</span>
      </div>
      <div id="bigCountdownDisplay" class="big-countdown-timer">2:00</div>
    </div>
    
    <!-- WHEEL CANVAS CONTAINER (Compact/subdued during countdown, expanding to center when spinning) -->
    <div id="wheelContainer" class="wheel-container-hidden" style="position:relative; width: 340px; height: 340px; margin: 0 auto 12px auto;">
      <canvas id="rouletteCanvas" width="340" height="340" style="width:340px; height:340px; border-radius:50%; box-shadow:0 0 30px rgba(126,249,255,0.2), inset 0 0 30px rgba(126,249,255,0.1);"></canvas>
    </div>

    <div id="rouletteWinnerDisplay" style="min-height: 28px; font-weight: bold; color: var(--accent); margin-bottom: 12px; font-size:14px; text-shadow:0 0 10px var(--accent);"></div>

    <!-- PRE-LINK SUBMISSION & VOTING POOL -->
    <div style="background: rgba(16,28,54,0.7); padding: 12px; border-radius: 12px; border: 1px solid rgba(126,249,255,0.25); text-align:left; margin-bottom:12px;">
<script type="module">
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, deleteDoc, onSnapshot, collection, addDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global Environment setup for Cloud Sync
const appId = typeof __app_id !== 'undefined' ? __app_id : 'openchat-global';
let firebaseConfig = null;
try {
  firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : null;
} catch(e) {}

let db = null;
let auth = null;

async function initFirestoreCloud() {
  if (!firebaseConfig) return;
  try {
    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);

    if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
      await signInWithCustomToken(auth, __initial_auth_token);
    } else {
      await signInAnonymously(auth);
    }

    const currentUid = auth.currentUser?.uid || userTag;

    // 1. Cloud Chat Realtime Synchronization
    const msgCol = collection(db, 'artifacts', appId, 'public', 'data', 'messages');
    onSnapshot(msgCol, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = { id: change.doc.id, ...change.doc.data() };
          handleIncomingMessage(data);
        } else if (change.type === "removed") {
          const el = document.getElementById("msg-" + change.doc.id);
          if (el) el.remove();
        }
      });
    }, (err) => console.warn("Chat sync warning:", err));

    // 2. Cloud Pre-Links & Votes Synchronization
    const prelinkCol = collection(db, 'artifacts', appId, 'public', 'data', 'prelinks');
    onSnapshot(prelinkCol, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" || change.type === "modified") {
          const data = { id: change.doc.id, ...change.doc.data() };
          const idx = preLinks.findIndex(p => p.id === data.id);
          if (idx >= 0) preLinks[idx] = data;
          else preLinks.push(data);
          renderPreLinks();
        }
      });
    }, (err) => console.warn("Prelinks sync warning:", err));

    // 3. Cloud Presence Synchronization
    const presenceCol = collection(db, 'artifacts', appId, 'public', 'data', 'presence');
    const myDoc = doc(db, 'artifacts', appId, 'public', 'data', 'presence', currentUid);
    await setDoc(myDoc, { username, tag: userTag, updatedAt: Date.now() }, { merge: true });

    onSnapshot(presenceCol, (snapshot) => {
      const active = {};
      const now = Date.now();
      snapshot.forEach(docSnap => {
        const p = docSnap.data();
        if (p.tag && (now - (p.updatedAt || 0) < 60000)) {
          active[p.tag] = { username: p.username, tag: p.tag };
        }
      });
      onlineUsers = active;
      updateOnlineListUI();
    }, (err) => console.warn("Presence sync warning:", err));

    // Heartbeat for presence
    setInterval(async () => {
      if (auth.currentUser) {
        await setDoc(myDoc, { username, tag: userTag, updatedAt: Date.now() }, { merge: true });
      }
    }, 15000);

  } catch(e) {
    console.warn("Firestore Cloud disabled, fallback active:", e);
  }
}

window.initFirestoreCloud = initFirestoreCloud;
<\/script>

<script>
// --- GLOBAL STATE INITIALIZATION ---
let username = localStorage.getItem("chat-username") || "CyberUser_" + Math.floor(100 + Math.random() * 900);
let userTag = localStorage.getItem("chat-usertag") || String(Math.floor(1000 + Math.random() * 9000));
localStorage.setItem("chat-usertag", userTag);

// Secret Admin trigger or storage check
let isAdmin = localStorage.getItem("chat-isadmin") === "true";

const msgDiv = document.getElementById("messages");
const nameDisplay = document.getElementById("nameDisplay");
const myTagDisplay = document.getElementById("myTagDisplay");
const adminBadge = document.getElementById("adminBadge");
const adminPanelTopBtn = document.getElementById("adminPanelTopBtn");
const cmdHint = document.getElementById("cmdHint");

if (nameDisplay) nameDisplay.textContent = username;
if (myTagDisplay) myTagDisplay.textContent = "#" + userTag;

function syncAdminUI() {
  if (isAdmin) {
    if (adminBadge) adminBadge.style.display = "inline-flex";
    if (adminPanelTopBtn) adminPanelTopBtn.style.display = "inline-flex";
    if (cmdHint) cmdHint.style.display = "block";
  } else {
    if (adminBadge) adminBadge.style.display = "none";
    if (adminPanelTopBtn) adminPanelTopBtn.style.display = "none";
    if (cmdHint) cmdHint.style.display = "none";
  }
}
syncAdminUI();

// --- FAILSAFE SUPABASE & LOCAL BROADCAST CLIENT ---
let sb = null;
let presenceChannel = null;
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('openchat_fallback') : null;

const DEFAULT_SB_URL = "https://krvtjbsluoepatdezarg.supabase.co";
const DEFAULT_SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydnRqYnNsdW9lcGF0ZGV6YXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE5ODksImV4cCI6MjA5MDUwNzk4OX0.sxUlgZENLKZGlO09lm8Bsbqv1NLYX2YTYeQC8Fu1_9Q";

function initSupabase() {
  const customUrl = localStorage.getItem("sb_url") || DEFAULT_SB_URL;
  const customKey = localStorage.getItem("sb_key") || DEFAULT_SB_KEY;

  if (window.supabase && customUrl && customKey) {
    try {
      sb = window.supabase.createClient(customUrl, customKey);
      return;
    } catch(e) {
      console.warn("Supabase init failed, using offline mode:", e);
    }
  }


  // Smart Mock Engine for offline preview & zero-crash fallback
  sb = {
    from: function(table) {
      return {
        select: function() {
          return {
            order: function() {
              return {
                limit: async function() { return { data: [], error: null }; },
                maybeSingle: async function() { return { data: null, error: null }; }
              };
            },
            eq: function() {
              return {
                order: function() {
                  return {
                    limit: function() {
                      return { maybeSingle: async function() { return { data: null }; } };
                    }
                  };
                },
                gte: async function() { return { data: [] }; }
              };
            }
          };
        },
        insert: async function(payloads) {
          const arr = Array.isArray(payloads) ? payloads : [payloads];
          arr.forEach(msg => {
            msg.id = msg.id || 'msg-' + Date.now() + '-' + Math.random();
            msg.created_at = msg.created_at || new Date().toISOString();
            if (broadcastChannel) broadcastChannel.postMessage({ type: 'INSERT', table, data: msg });
            handleIncomingMessage(msg);
          });
          return { error: null };
        },
        delete: function() {
          return {
            eq: async function(field, val) {
              if (broadcastChannel) broadcastChannel.postMessage({ type: 'DELETE', table, id: val });
              const el = document.getElementById("msg-" + val);
              if (el) el.remove();
              return { error: null };
            },
            neq: async function() {
              if (msgDiv) msgDiv.innerHTML = "";
              return { error: null };
            }
          };
        }
      };
    },
    storage: {
      from: function() {
        return {
          upload: async function() { return { error: null }; },
          getPublicUrl: function(name) { return { data: { publicUrl: name } }; }
        };
      }
    },
    channel: function(name, config) {
      const channelObj = {
        on: function(type, opts, cb) { return channelObj; },
        subscribe: function(cb) {
          if (cb) cb("SUBSCRIBED");
          return channelObj;
        },
        track: async function(state) {
          onlineUsers[userTag] = state;
          updateOnlineListUI();
          if (broadcastChannel) broadcastChannel.postMessage({ type: 'PRESENCE', state: { [userTag]: state } });
        },
        presenceState: function() { return { [userTag]: [{ username, tag: userTag }] }; }
      };
      return channelObj;
    }
  };
}
initSupabase();

if (broadcastChannel) {
  broadcastChannel.onmessage = (event) => {
    const { type, data, id, state } = event.data;
    if (type === 'INSERT') handleIncomingMessage(data);
    if (type === 'DELETE') {
      const el = document.getElementById("msg-" + id);
      if (el) el.remove();
    }
    if (type === 'PRESENCE') {
      Object.assign(onlineUsers, state);
      updateOnlineListUI();
    }
  };
}

function showToast(msg, type = "success") {
  const stack = document.getElementById("toastStack");
  if (!stack) return;
  const t = document.createElement("div");
  t.className = \`toast \${type}\`;
  t.textContent = msg;
  stack.appendChild(t);
  setTimeout(() => {
    t.style.animation = "toast-in 0.22s reverse forwards";
    setTimeout(() => t.remove(), 250);
  }, 3200);
}

function switchTab(tab) {
  const chatView = document.getElementById("chatView");
  const videoView = document.getElementById("videoView");
  const tabChat = document.getElementById("tabChat");
  const tabVideo = document.getElementById("tabVideo");

  if (tab === "chat") {
    chatView.style.display = "flex";
    videoView.classList.add("hidden");
    tabChat.classList.add("active");
    tabVideo.classList.remove("active");
  } else {
    chatView.style.display = "none";
    videoView.classList.remove("hidden");
    videoView.style.display = "flex";
    tabVideo.classList.add("active");
    tabChat.classList.remove("active");
  }
}

// FaceTime Video Logic
let localStream = null;
let isCamOn = true;
let isMicOn = true;

async function joinCall() {
  document.getElementById("vidLobby").classList.add("hidden");
  document.getElementById("vidCall").classList.remove("hidden");
  document.getElementById("vidStatusText").textContent = "Camera connected";
  document.getElementById("vidDot").className = "dot conn";

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    const localVideo = document.getElementById("localVideo");
    if (localVideo) localVideo.srcObject = localStream;
  } catch (e) {
    showToast("Camera/Mic access denied or unavailable", "error");
    document.getElementById("vidStatusText").textContent = "Camera unavailable";
  }
}

function toggleVid() {
  if (!localStream) return;
  const track = localStream.getVideoTracks()[0];
  if (track) {
    track.enabled = !track.enabled;
    isCamOn = track.enabled;
    const btn = document.getElementById("vidToggle");
    btn.className = \`vid-btn \${isCamOn ? 'on' : 'off'}\`;
    showToast(\`Camera \${isCamOn ? 'Enabled' : 'Disabled'}\`);
  }
}

function toggleMic() {
  if (!localStream) return;
  const track = localStream.getAudioTracks()[0];
  if (track) {
    track.enabled = !track.enabled;
    isMicOn = track.enabled;
    const btn = document.getElementById("micToggle");
    btn.className = \`vid-btn \${isMicOn ? 'on' : 'off'}\`;
    showToast(\`Microphone \${isMicOn ? 'Muted' : 'Unmuted'}\`);
  }
}

async function toggleShare() {
  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
    const localVideo = document.getElementById("localVideo");
    if (localVideo) localVideo.srcObject = screenStream;
    document.getElementById("shareToggle").classList.add("active");
    showToast("Screen sharing started");
  } catch (e) {
    showToast("Screen share canceled or not supported", "error");
  }
}

function endCall() {
  if (localStream) {
    localStream.getTracks().forEach(t => t.stop());
    localStream = null;
  }
  document.getElementById("vidLobby").classList.remove("hidden");
  document.getElementById("vidCall").classList.add("hidden");
  showToast("Call ended");
}

// Tab Disguise Settings
function openSettings() {
  document.getElementById("settingsOverlay").classList.add("open");
  const sbU = localStorage.getItem("sb_url") || "";
  const sbK = localStorage.getItem("sb_key") || "";
  document.getElementById("sbUrlInput").value = sbU;
  document.getElementById("sbKeyInput").value = sbK;
}

function closeSettings() {
  document.getElementById("settingsOverlay").classList.remove("open");
}

function onPresetChange() {
  const sel = document.getElementById("presetSelect");
  const opt = sel.options[sel.selectedIndex];
  if (opt.value !== "custom") {
    document.getElementById("tabTitleInput").value = opt.getAttribute("data-title") || "";
    document.getElementById("faviconInput").value = opt.getAttribute("data-icon") || "";
  }
}

function applySettings() {
  const t = document.getElementById("tabTitleInput").value.trim();
  const f = document.getElementById("faviconInput").value.trim();
  const sbU = document.getElementById("sbUrlInput").value.trim();
  const sbK = document.getElementById("sbKeyInput").value.trim();

  if (t) document.title = t;
  if (f) {
    let link = document.getElementById("favicon");
    if (link) link.href = f;
  }

  if (sbU && sbK) {
    localStorage.setItem("sb_url", sbU);
    localStorage.setItem("sb_key", sbK);
    showToast("Supabase credentials saved!");
    initSupabase();
  }

  closeSettings();
  showToast("Disguise applied!");
}

// Admin Panel Handlers
function openAdminPanel() {
  if (!isAdmin) return;
  const overlay = document.getElementById("adminOverlay");
  const list = document.getElementById("adminUserList");
  if (!overlay || !list) return;

  list.innerHTML = "";
  const users = Object.values(onlineUsers);
  if (users.length === 0) users.push({ username, tag: userTag });

  users.forEach(u => {
    const row = document.createElement("div");
    row.className = "admin-user-row";
    row.innerHTML = \`
      <div class="admin-user-info">
        <span class="admin-user-name">\${u.username || 'User'}</span>
        <span class="admin-user-tag">#\${u.tag || '0000'}</span>
      </div>
      <div class="admin-actions">
        <button class="admin-btn mute" onclick="executeAdminAction('mute', '\${u.tag}')">Mute</button>
        <button class="admin-btn unmute" onclick="executeAdminAction('unmute', '\${u.tag}')">Unmute</button>
        <button class="admin-btn corn" title="Corn surprise" onclick="executeAdminAction('corn', '\${u.tag}')">🌽</button>
      </div>
    \`;
    list.appendChild(row);
  });

  overlay.classList.add("open");
}

function closeAdminPanel() {
  const overlay = document.getElementById("adminOverlay");
  if (overlay) overlay.classList.remove("open");
}

async function executeAdminAction(type, tag) {
  if (!isAdmin) return;
  if (type === "mute") {
    await postSystemMessage(\`User #\${tag} was muted by admin.\`);
    showToast(\`Muted #\${tag}\`);
  } else if (type === "unmute") {
    await postSystemMessage(\`User #\${tag} was unmuted.\`);
    showToast(\`Unmuted #\${tag}\`);
  } else if (type === "corn") {
    await sb.from("messages").insert({ username: "System", content: "__CORN__:" + tag, user_tag: "0000" });
    showToast(\`🌽 Sent to #\${tag}\`);
  }
}

// --- ROULETTE & PRESENCE ENGINE ---
let rUsers = [];
let scanAngle = 0;
let scanSpeed = 0;
let rSpinning = false;
let rAF = null;
let rColors = ['#7ef9ff','#ff9bff','#7cff6b','#ffb700','#ff3b5c','#9d00ff','#00f0ff','#ff00eb'];
let rParticles = [];
let selectedUserIndex = -1;

// Pre-link pool state
let preLinks = [];

let onlineUsers = {};
onlineUsers[userTag] = { username, tag: userTag };

// 145-Second Total Cycle: 120s Idle/Countdown + 15s Submit + 10s Vote
const CYCLE_TOTAL_SEC = 145;
const SUBMIT_START_SEC = 120;
const VOTE_START_SEC = 135;

let rouletteInterval = null;
let roulettePhase = "IDLE"; // "IDLE", "SUBMIT", "VOTE", "SPIN"
let lastCyclePhase = "IDLE";

function syncRouletteClock() {
  if (rouletteInterval) clearInterval(rouletteInterval);

  rouletteInterval = setInterval(() => {
    const nowSec = Math.floor(Date.now() / 1000);
    const cycleSec = nowSec % CYCLE_TOTAL_SEC;

    const timerBadge = document.getElementById("rouletteTimerBadge");
    const bigCountdown = document.getElementById("bigCountdownDisplay");

    // PHASE 0: IDLE COUNTDOWN (120 seconds)
    if (cycleSec < SUBMIT_START_SEC) {
      const idleRemaining = SUBMIT_START_SEC - cycleSec;
      const mins = Math.floor(idleRemaining / 60);
      const secs = String(idleRemaining % 60).padStart(2, '0');
      const timeFormatted = \`\${mins}:\${secs}\`;

      if (timerBadge) timerBadge.textContent = timeFormatted;
      if (bigCountdown) bigCountdown.textContent = timeFormatted;

      if (roulettePhase !== "IDLE") {
        roulettePhase = "IDLE";
        preLinks = []; // Clear prelinks pool for next round
      }

      updatePhaseUI(\`⏳ NEXT ROUND IN\`, true, "IDLE");
    } 
    // PHASE 1: SUBMIT LINKS (15 seconds)
    else if (cycleSec >= SUBMIT_START_SEC && cycleSec < VOTE_START_SEC) {
      const submitRemaining = VOTE_START_SEC - cycleSec;
      if (roulettePhase !== "SUBMIT") {
        roulettePhase = "SUBMIT";
        openRouletteOverlay();
      }
      const timeStr = \`0:\${String(submitRemaining).padStart(2, '0')}\`;
      if (timerBadge) timerBadge.textContent = timeStr;
      if (bigCountdown) bigCountdown.textContent = timeStr;
      updatePhaseUI(\`🔗 PHASE 1: SUBMIT LINKS\`, true, "SUBMIT");
    } 
    // PHASE 2: VOTE FOR LINKS (10 seconds)
    else if (cycleSec >= VOTE_START_SEC && cycleSec < CYCLE_TOTAL_SEC) {
      const voteRemaining = CYCLE_TOTAL_SEC - cycleSec;
      if (roulettePhase !== "VOTE") {
        roulettePhase = "VOTE";
        openRouletteOverlay();
      }
      const timeStr = \`0:\${String(voteRemaining).padStart(2, '0')}\`;
      if (timerBadge) timerBadge.textContent = timeStr;
      if (bigCountdown) bigCountdown.textContent = timeStr;
      updatePhaseUI(\`👍 PHASE 2: VOTE FOR LINKS\`, false, "VOTE");
    }

    // Trigger Spin precisely when transitioning to 0s
    if (cycleSec === 0 && (lastCyclePhase === "VOTE" || roulettePhase === "VOTE") && !rSpinning) {
      startAutoSpinPhase();
    }
    lastCyclePhase = roulettePhase;
  }, 400);
}

function startAutoSpinPhase() {
  roulettePhase = "SPIN";
  updatePhaseUI("🌀 PHASE 3: SPINNING WHEEL...", false, "SPIN");
  spinRoulette();
}

function updatePhaseUI(bannerText, allowInput, phase) {
  const titleEl = document.getElementById("phaseTitle");
  if (titleEl) titleEl.textContent = bannerText;

  const inp = document.getElementById("preLinkInput");
  const btn = document.getElementById("preLinkSubmitBtn");
  if (inp) inp.disabled = !allowInput;
  if (btn) btn.disabled = !allowInput;

  const container = document.getElementById("roulettePhaseContainer");
  const wheelBox = document.getElementById("wheelContainer");

  if (phase === "SPIN") {
    // Move Countdown & Banner to TOP when Wheel is spinning
    if (container) {
      container.className = "phase-mode-top";
    }
    if (wheelBox) {
      wheelBox.className = "wheel-container-active";
    }
  } else {
    // Keep Countdown & Banner BIG and CENTERED during Idle/Submit/Vote
    if (container) {
      container.className = "phase-mode-centered";
    }
    if (wheelBox) {
      wheelBox.className = "wheel-container-hidden";
    }
  }
}

function updateOnlineListUI() {
  const count = Object.keys(onlineUsers).length;
  const countEl1 = document.getElementById("onlineCount");
  const countEl2 = document.getElementById("onlineCount2");
  if (countEl1) countEl1.textContent = count;
  if (countEl2) countEl2.textContent = count;
  
  const container = document.getElementById("onlineUsers");
  if (container) {
    container.innerHTML = "";
    Object.values(onlineUsers).forEach(u => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.style.cssText = "background:rgba(126,249,255,0.1);padding:4px 8px;border-radius:6px;font-size:11px;border:1px solid rgba(126,249,255,0.2)";
      chip.textContent = \`\${u.username || 'User'} (#\${u.tag || '0000'})\`;
      container.appendChild(chip);
    });
  }
}

function toggleOnlineList() {
  const el = document.getElementById("onlineList");
  if (el) el.style.display = el.style.display === "none" ? "block" : "none";
}

// Start Application
window.addEventListener("DOMContentLoaded", () => {
  load();
  if (window.initFirestoreCloud) {
    window.initFirestoreCloud();
  }
  syncRouletteClock();
  updateOnlineListUI();
});
<\/script>`;
}
