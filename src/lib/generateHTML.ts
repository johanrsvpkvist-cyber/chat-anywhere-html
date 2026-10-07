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
:root{color-scheme:dark;--bg:#050507;--panel:rgba(16,16,22,.86);--accent:#7ef9ff;--accent-2:#ff6fec;--accent-3:#7cff6b;--text:#f4f7ff;--muted:rgba(238,247,255,.58);--danger:#ff4b64;--warning:#ffb52e;--success:#4ade80}
body{font-family:Inter,system-ui,sans-serif;background:linear-gradient(rgba(126,249,255,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(126,249,255,.025) 1px,transparent 1px),radial-gradient(circle at 15% 0,rgba(126,249,255,.13),transparent 38%),radial-gradient(circle at 90% 100%,rgba(255,111,236,.11),transparent 35%),var(--bg);background-size:32px 32px,32px 32px,auto,auto,auto;color:var(--text);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:28px 16px}
.app{display:grid;gap:24px;width:min(1080px,100%);height:min(95vh,980px)}
.hero{display:flex;align-items:center;justify-content:space-between;gap:16px}
.hero h1{font-size:clamp(1.7rem,4vw,2.8rem);text-transform:uppercase;color:var(--accent);text-shadow:0 0 12px rgba(126,249,255,.45);font-style:italic}
.tab-switcher{margin-top:12px;display:inline-flex;gap:8px;padding:4px;border-radius:999px;background:rgba(16,28,54,.6);border:1px solid rgba(126,249,255,.2)}
.tab-sw-btn{padding:6px 16px;border-radius:999px;font-size:.7rem;font-weight:600;text-transform:uppercase;letter-spacing:.18em;border:none;cursor:pointer;background:transparent;color:var(--muted)}
.tab-sw-btn.active{background:var(--accent);color:var(--bg);box-shadow:0 0 14px rgba(126,249,255,.3)}
.panel{position:relative;display:flex;flex-direction:column;min-height:0;background:linear-gradient(145deg,var(--panel),rgba(5,5,7,.78));border:1px solid rgba(126,249,255,.18);border-radius:14px;padding:24px;box-shadow:0 16px 40px rgba(0,0,0,.68);backdrop-filter:blur(22px);overflow:hidden}
.panel:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(110deg,transparent 25%,rgba(126,249,255,.07) 45%,transparent 65%);background-size:240% 100%;animation:cyber-scan 8s linear infinite}
#chatView,#videoView{position:relative;z-index:1}
.topbar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:18px}
.badge{display:inline-flex;align-items:center;gap:10px;padding:6px 14px;border-radius:999px;font-size:.75rem;letter-spacing:.2em;text-transform:uppercase;background:rgba(126,249,255,.1);border:1px solid rgba(126,249,255,.3)}
.badge::before{content:"";width:10px;height:10px;border-radius:50%;background:radial-gradient(circle,var(--accent) 0%,rgba(126,249,255,.2) 70%);box-shadow:0 0 12px rgba(126,249,255,.6)}
.header-right{margin-left:auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.name-btn,.tab-btn{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:6px 16px;border-radius:999px;text-transform:uppercase;letter-spacing:.2em;font-size:.7rem;color:var(--text);background:linear-gradient(145deg,rgba(16,28,54,.95),rgba(10,16,32,.9));box-shadow:inset 0 0 0 1px rgba(126,249,255,.2),0 6px 14px rgba(0,0,0,.35);border:none;cursor:pointer}
.name-btn:hover,.tab-btn:hover{box-shadow:inset 0 0 0 1px rgba(126,249,255,.35),0 10px 20px rgba(0,0,0,.45);transform:translateY(-2px);filter:brightness(1.15)}
.name-btn,.tab-btn,.input-bar button,.admin-btn,.prelink-vote-btn{transition:transform .16s ease,filter .16s ease,box-shadow .16s ease}
.name-btn:active,.tab-btn:active,.input-bar button:active,.admin-btn:active,.prelink-vote-btn:active{transform:translateY(1px) scale(.95)}
.admin-badge{background:var(--danger);color:#fff;font-size:10px;padding:2px 8px;border-radius:999px;font-weight:700;text-transform:uppercase;letter-spacing:.16em}
.tag{color:var(--accent);font-family:monospace;font-size:12px}
#messages{flex:1;overflow-y:auto;background:rgba(0,0,0,.3);border-radius:12px;padding:15px;margin-bottom:15px;border:1px solid rgba(126,249,255,.1);display:flex;flex-direction:column;gap:12px}
#messages::-webkit-scrollbar{width:6px}
#messages::-webkit-scrollbar-thumb{background:rgba(126,249,255,.22);border-radius:3px}
.msg{display:flex;flex-direction:column;max-width:75%;animation:message-pop .32s cubic-bezier(.2,.9,.2,1) both}
.msg.self{align-self:flex-end;align-items:flex-end}
.msg.other{align-self:flex-start;align-items:flex-start}
.msg.system{align-self:center;max-width:100%;align-items:center}
.meta{font-size:13px;font-weight:700;color:rgba(238,247,255,.9);margin-bottom:4px;padding:0 4px;display:flex;align-items:center;gap:6px}
.del-btn{background:none;border:none;color:var(--danger);cursor:pointer;font-size:12px;padding:0 2px}
.bubble{padding:10px 16px;border-radius:16px;font-size:14px;word-break:break-word;line-height:1.5}
.self .bubble{background:var(--accent);color:var(--bg);border-bottom-right-radius:6px;font-weight:500}
.other .bubble{background:rgba(27,38,72,.95);color:var(--text);border-bottom-left-radius:6px}
.system-pill{padding:7px 16px;border-radius:7px;background:rgba(255,155,255,.12);border:1px solid rgba(255,155,255,.28);font-size:11px;letter-spacing:.12em;text-transform:uppercase;animation:status-scan .48s ease-out both}
.bubble img{max-width:100%;max-height:280px;border-radius:8px;margin-top:6px}
.input-bar{padding:12px;border:1px solid rgba(126,249,255,.18);border-radius:12px;background:rgba(255,255,255,.05)}
.cmd-hint{font-size:11px;color:var(--muted);margin-bottom:8px;font-family:monospace;display:none;text-transform:uppercase;letter-spacing:.15em}
.input-row{display:flex;gap:10px;align-items:center;border:1px solid rgba(126,249,255,.28);background:rgba(0,0,0,.2);padding:8px;border-radius:12px}
.input-bar input[type=text]{flex:1;background:none;border:none;color:var(--text);padding:12px 10px;font-size:14px;outline:none}
.input-bar button{background:var(--accent);color:var(--bg);border:none;width:42px;height:42px;border-radius:999px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(126,249,255,.32)}
.img-btn{background:linear-gradient(145deg,rgba(16,28,54,.95),rgba(10,16,32,.9))!important;color:var(--text)!important;box-shadow:inset 0 0 0 1px rgba(126,249,255,.2)!important}
.img-btn svg{width:20px;height:20px}
.settings-overlay{position:fixed;inset:0;background:rgba(0,0,0,.65);display:none;align-items:center;justify-content:center;z-index:100;backdrop-filter:blur(6px)}
.settings-overlay.open{display:flex;animation:overlay-in .18s ease-out}
.settings-panel{background:rgba(14,14,20,.96);border:1px solid rgba(126,249,255,.25);border-radius:12px;padding:24px;width:420px;max-width:90vw;box-shadow:0 16px 40px rgba(0,0,0,.8);animation:panel-snap .28s cubic-bezier(.2,.9,.2,1)}
.settings-panel h2{font-size:16px;font-weight:700;color:var(--accent);margin-bottom:16px;letter-spacing:1px;text-transform:uppercase}
.settings-panel label{display:block;font-size:11px;color:var(--muted);margin-bottom:4px;margin-top:12px;letter-spacing:.14em;text-transform:uppercase}
.settings-panel select,.settings-panel input[type=text]{width:100%;background:rgba(27,38,72,.95);border:1px solid rgba(126,249,255,.18);color:var(--text);padding:10px 12px;border-radius:8px;font-size:14px;outline:none}
.settings-btns{display:flex;gap:8px;margin-top:20px}
.settings-btns button{flex:1;padding:10px;border-radius:8px;font-size:13px;cursor:pointer;border:none;font-weight:600;letter-spacing:1px;text-transform:uppercase}
.btn-save{background:var(--accent);color:var(--bg)}
.btn-cancel{background:rgba(27,38,72,.95);color:var(--muted)}
.toast-stack{position:fixed;top:18px;right:18px;display:flex;flex-direction:column;gap:10px;z-index:200;pointer-events:none}
.toast{min-width:220px;max-width:360px;padding:12px 16px;border-radius:8px;border:1px solid rgba(126,249,255,.42);background:rgba(14,14,20,.94);color:var(--text);box-shadow:0 0 24px rgba(126,249,255,.16),0 18px 42px rgba(0,0,0,.55);font-size:12px;letter-spacing:.12em;text-transform:uppercase;animation:toast-in .3s cubic-bezier(.2,.9,.2,1)}
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
.roulette-terminal{width:min(680px,94vw)!important;max-height:94vh;overflow:auto;text-align:center!important;position:relative;padding:26px!important;background:linear-gradient(145deg,rgba(13,17,23,.98),rgba(5,7,10,.99))!important;border-color:rgba(0,243,255,.22)!important;box-shadow:0 0 0 1px rgba(255,46,136,.08),0 0 90px rgba(0,0,0,.9)!important}
.roulette-terminal:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(rgba(0,243,255,.022) 1px,transparent 1px),linear-gradient(90deg,rgba(0,243,255,.022) 1px,transparent 1px);background-size:20px 20px;mask-image:linear-gradient(to bottom,#000,transparent 85%)}
.roulette-header{position:relative;display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px;padding-bottom:14px;border-bottom:1px solid rgba(0,243,255,.16)}
.roulette-header h2{margin:0!important;font-family:'Courier New',monospace;letter-spacing:.28em;font-size:13px!important}
.hud-node{width:7px;height:7px;background:#00f3ff;box-shadow:0 0 12px #00f3ff;animation:hud-blink 1.1s ease-in-out infinite alternate}
.roulette-close{position:absolute;top:0;right:0;background:transparent;border:1px solid rgba(255,255,255,.1);color:var(--muted);width:28px;height:28px;cursor:pointer;font-size:16px}
.phase-mode-centered{margin:0 auto 14px;padding:16px 20px;background:linear-gradient(135deg,rgba(255,46,136,.05),rgba(0,243,255,.04));border:1px solid rgba(255,255,255,.08);border-radius:10px;box-shadow:inset 0 0 40px rgba(0,0,0,.35),0 0 30px rgba(255,46,136,.05)}
.phase-mode-top{margin:0 auto 10px;padding:7px 14px;background:rgba(0,243,255,.06);border:1px solid rgba(0,243,255,.22);border-radius:7px}
.big-phase-banner{font-size:13px;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:var(--accent)}
.big-countdown-timer{font-size:4.6rem;font-weight:900;font-family:'Courier New',monospace;color:#ff2e88;text-shadow:0 0 8px rgba(255,46,136,.9),0 0 32px rgba(255,46,136,.35);line-height:1;margin-top:10px}
.phase-mode-top .big-countdown-timer{font-size:1.4rem}
.phase-urgent{animation:urgent-pulse .5s ease-in-out infinite alternate}
.roulette-shake .roulette-terminal{animation:roulette-rumble .14s linear infinite}
.winner-flash{animation:winner-flash .9s ease-out both}
.reactor-stage{position:relative;width:350px;height:350px;margin:0 auto 14px;display:grid;place-items:center;filter:drop-shadow(0 0 24px rgba(0,243,255,.12))}
.reactor-ring{position:absolute;border-radius:50%;pointer-events:none}
.reactor-ring.outer{inset:4px;border:2px dashed rgba(0,243,255,.28);animation:reactor-orbit 18s linear infinite}
.reactor-ring.mid{inset:21px;border:1px solid rgba(0,243,255,.42);box-shadow:inset 0 0 25px rgba(0,243,255,.06)}
.reactor-ring.inner{inset:43px;border:1px dashed rgba(255,46,136,.32);animation:reactor-orbit 12s linear infinite reverse}
.reactor-ring.outer:before,.reactor-ring.outer:after{content:"";position:absolute;width:9px;height:9px;background:#00f3ff;box-shadow:0 0 12px #00f3ff;transform:rotate(45deg)}
.reactor-ring.outer:before{top:14%;left:13%}.reactor-ring.outer:after{bottom:14%;right:13%;background:#ff2e88;box-shadow:0 0 12px #ff2e88}
.target-reticle{position:absolute;top:-1px;left:50%;z-index:4;transform:translateX(-50%);width:0;height:0;border-left:13px solid transparent;border-right:13px solid transparent;border-top:22px solid #ff2e88;filter:drop-shadow(0 0 8px #ff2e88)}
.reactor-core{position:absolute;inset:116px;border-radius:50%;z-index:3;display:grid;place-items:center;background:radial-gradient(circle,rgba(0,243,255,.18),rgba(0,243,255,.025) 55%,transparent 72%);border:1px solid rgba(0,243,255,.25);box-shadow:0 0 30px rgba(0,243,255,.14),inset 0 0 24px rgba(0,243,255,.1);pointer-events:none}
.reactor-core span{font-family:'Courier New',monospace;font-size:9px;letter-spacing:.18em;color:#00f3ff;text-transform:uppercase;animation:hud-blink .9s ease-in-out infinite alternate}
.reactor-beam{position:absolute;z-index:2;width:2px;height:155px;top:20px;left:50%;transform-origin:50% 155px;background:linear-gradient(#ff2e88,transparent);filter:drop-shadow(0 0 5px #ff2e88);opacity:.8;animation:beam-scan 4s linear infinite}
.reactor-stage canvas{position:relative;z-index:1;border-radius:50%;filter:drop-shadow(0 0 18px rgba(0,243,255,.18))}
.wheel-container-hidden{opacity:.55;transform:scale(.88);pointer-events:none;height:350px!important;transition:opacity .4s ease,transform .4s ease}
.wheel-container-active{opacity:1;transform:scale(1);pointer-events:auto;height:350px!important;transition:opacity .4s ease,transform .4s ease}
.roulette-pool{position:relative;background:rgba(13,17,23,.82);padding:14px;border-radius:10px;border:1px solid rgba(255,255,255,.07);text-align:left;overflow:hidden}
.roulette-pool:before{content:"";position:absolute;inset:0 0 auto;height:1px;background:linear-gradient(90deg,transparent,#00f3ff,transparent);opacity:.5}
.roulette-pool-head{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:10px;font-size:10px;text-transform:uppercase;letter-spacing:.15em;color:#fff}
.roulette-status{color:#00f3ff;font-family:monospace;font-size:9px}.roulette-input-row{display:flex;gap:7px}
.roulette-input-row input{flex:1!important;background:rgba(0,0,0,.35)!important;border-color:rgba(255,255,255,.1)!important}.roulette-input-row button{background:#00f3ff!important;color:#05070a!important;text-transform:uppercase;letter-spacing:.12em;border-radius:7px!important;box-shadow:0 0 18px rgba(0,243,255,.2)}
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
@keyframes cyber-scan{to{background-position:-240% 0}}
@keyframes message-pop{from{opacity:0;transform:translateY(10px) scale(.97)}65%{transform:translateY(-2px) scale(1.01)}to{opacity:1;transform:none}}
@keyframes status-scan{from{opacity:0;transform:scaleX(.7);filter:brightness(2)}to{opacity:1;transform:scaleX(1);filter:none}}
@keyframes overlay-in{from{opacity:0}to{opacity:1}}
@keyframes panel-snap{from{opacity:0;transform:translateY(18px) scale(.94)}70%{transform:translateY(-2px) scale(1.01)}to{opacity:1;transform:none}}
@keyframes urgent-pulse{to{transform:scale(1.04);filter:brightness(1.35)}}
@keyframes roulette-rumble{25%{transform:translateX(1px)}75%{transform:translateX(-1px)}}
@keyframes winner-flash{0%{transform:scale(.75);filter:brightness(3)}45%{transform:scale(1.1)}100%{transform:none;filter:none}}
@keyframes reactor-orbit{to{transform:rotate(360deg)}}
@keyframes beam-scan{to{transform:rotate(360deg)}}
@keyframes hud-blink{to{opacity:.32;filter:brightness(1.8)}}
@media(max-width:700px){body{padding:10px}.app{height:calc(100vh - 20px);gap:12px}.hero{align-items:flex-start}.hero h1{font-size:1.45rem}.tab-switcher{margin-top:0}.panel{padding:12px}.topbar{gap:7px}.header-right{margin-left:0}.msg{max-width:90%}.roulette-terminal{padding:16px 12px!important}.reactor-stage{width:280px;height:280px}.reactor-stage canvas{width:270px;height:270px}.reactor-core{inset:94px}.reactor-beam{height:122px;top:18px;transform-origin:50% 122px}.wheel-container-hidden,.wheel-container-active{height:280px!important}.big-countdown-timer{font-size:3.6rem}}
@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;animation-iteration-count:1!important;scroll-behavior:auto!important;transition-duration:.01ms!important}}
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
    <button class="tab-sw-btn" id="soundToggle" onclick="toggleSound()" title="Toggle sound effects">🔇</button>
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
  <div class="settings-panel roulette-terminal">
    <div class="roulette-header"><span class="hud-node"></span><h2>Cyber Node Roulette</h2><span class="hud-node"></span><button class="roulette-close" onclick="closeRoulette()">✕</button></div>
    <div id="roulettePhaseContainer" class="phase-mode-centered">
      <div class="big-phase-banner"><span id="phaseTitle">⏳ NEXT ROUND IN</span></div>
      <div class="big-countdown-timer" id="bigCountdownDisplay">2:00</div>
    </div>
    <div id="wheelContainer" class="reactor-stage wheel-container-hidden">
      <span class="reactor-ring outer"></span><span class="reactor-ring mid"></span><span class="reactor-ring inner"></span><span class="reactor-beam"></span><span class="target-reticle"></span>
      <canvas id="rouletteCanvas" width="340" height="340"></canvas>
      <div class="reactor-core"><span id="reactorLabel">Scanning pool</span></div>
    </div>
    <div id="rouletteWinnerDisplay" style="min-height:28px;font-weight:bold;color:var(--accent);margin-bottom:12px;text-shadow:0 0 10px var(--accent)"></div>
    <div id="winnerPowerPanel" style="display:none;background:rgba(255,155,255,.08);border:1px solid rgba(255,155,255,.35);padding:12px;border-radius:12px;margin-bottom:12px;text-align:left">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:.15em;color:var(--accent-2);margin-bottom:8px">🏆 You won! Pick a target — they will be sent to your link 3 times.</div>
      <div id="winnerTargetList" style="max-height:160px;overflow-y:auto;display:flex;flex-direction:column;gap:6px"></div>
    </div>
    <div class="roulette-pool">
      <div class="roulette-pool-head"><span>Link Pool <span style="color:var(--accent-2)">(1 link + 1 vote per user)</span></span><span class="roulette-status">ACTIVE_NODE</span></div>
      <div id="preLinkList" style="max-height:160px;overflow-y:auto;margin-bottom:10px"></div>
      <div class="roulette-input-row">
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

let soundEnabled = localStorage.getItem("openchat-sound") === "on";
let audioCtx = null;
function getAudio(){
  if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}
function tone(freq,dur,vol,type,delay){
  if (!soundEnabled) return;
  const ctx=getAudio(), osc=ctx.createOscillator(), gain=ctx.createGain(), at=ctx.currentTime+(delay||0);
  osc.type=type||"sine"; osc.frequency.setValueAtTime(freq,at); gain.gain.setValueAtTime(.0001,at); gain.gain.exponentialRampToValueAtTime(vol,at+.01); gain.gain.exponentialRampToValueAtTime(.0001,at+dur); osc.connect(gain).connect(ctx.destination); osc.start(at); osc.stop(at+dur+.02);
}
function sfx(name){
  const p={send:[[520,.08,.025,"sine",0],[780,.1,.02,"sine",.05]],receive:[[680,.12,.018,"sine",0],[900,.12,.014,"sine",.07]],switch:[[240,.07,.018,"square",0],[360,.07,.014,"square",.04]],success:[[440,.09,.02,"triangle",0],[660,.13,.018,"triangle",.07]],warning:[[160,.14,.025,"sawtooth",0],[120,.18,.02,"sawtooth",.11]],submit:[[420,.08,.02,"square",0],[840,.12,.018,"triangle",.06]],vote:[[760,.07,.018,"square",0]],tick:[[980,.035,.012,"square",0]],winner:[[392,.13,.024,"triangle",0],[523,.14,.022,"triangle",.1],[784,.28,.02,"triangle",.22]],blast:[[110,.16,.03,"sawtooth",0],[880,.2,.018,"square",.08]]};
  (p[name]||[]).forEach(x=>tone(...x));
}
function syncSoundButton(){ const b=document.getElementById("soundToggle"); if(b){b.textContent=soundEnabled?"🔊":"🔇";b.classList.toggle("active",soundEnabled);} }
function toggleSound(){soundEnabled=!soundEnabled;localStorage.setItem("openchat-sound",soundEnabled?"on":"off");syncSoundButton();if(soundEnabled)sfx("success");}

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
  sfx(type==="error"?"warning":"success");
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
  sfx("switch");
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
  if (!isSelf && !isSystem) sfx("receive");
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
  sfx("send");
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
    // one link per user: replace prior submission by same submitter
    preLinks = preLinks.filter(p=>p.submitter!==payload.submitter);
    preLinks.push({...payload, votes:{}});
    renderPreLinks();
  }).on("broadcast",{event:"vote"}, ({payload})=>{
    // one vote per user: clear voter from all other links
    preLinks.forEach(p=>{ if (p.votes) delete p.votes[payload.voter]; });
    const p = preLinks.find(x=>x.id===payload.id);
    if (p){ p.votes = p.votes||{}; p.votes[payload.voter] = 1; renderPreLinks(); }
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
const IDLE_SEC = 30;      // 0:30 countdown before each round
const SUBMIT_SEC = 10;     // link submission window
const VOTE_SEC = 3;        // voting window
const CYCLE_TOTAL_SEC = IDLE_SEC + SUBMIT_SEC + VOTE_SEC; // 43
const SUBMIT_START_SEC = IDLE_SEC;          // 30
const VOTE_START_SEC = IDLE_SEC + SUBMIT_SEC; // 40

function isRouletteLocked(){ return roulettePhase === "SUBMIT" || roulettePhase === "VOTE" || rSpinning || (winnerPower && winnerPower.usesLeft > 0); }
function openRoulette(){ document.getElementById("rouletteOverlay").classList.add("open"); renderPreLinks(); }
function closeRoulette(){
  if (isRouletteLocked()){ showToast("🔒 Locked until round ends","error"); return; }
  document.getElementById("rouletteOverlay").classList.remove("open");
}

async function submitPreLink(){
  const inp = document.getElementById("preLinkInput");
  const url = inp.value.trim();
  if (!url) return;
  if (roulettePhase !== "SUBMIT"){ showToast("Submissions closed","error"); return; }
  // one link per user — replace their prior entry
  preLinks = preLinks.filter(p=>p.submitter!==userTag);
  const item = { id: userTag+"-"+Date.now(), url, submitter: userTag, submitterName: username, votes: {} };
  preLinks.push(item);
  renderPreLinks();
  inp.value = "";
  if (rouletteChannel) await rouletteChannel.send({ type:"broadcast", event:"submit", payload:item });
  showToast("Link submitted");
}

async function votePreLink(id){
  const p = preLinks.find(x=>x.id===id); if (!p) return;
  if (roulettePhase !== "VOTE"){ showToast("Voting closed","error"); return; }
  preLinks.forEach(x=>{ if (x.votes) delete x.votes[userTag]; });
  p.votes = p.votes||{}; p.votes[userTag] = 1;
  renderPreLinks();
  if (rouletteChannel) await rouletteChannel.send({ type:"broadcast", event:"vote", payload:{ id, voter:userTag }});
}

function renderPreLinks(){
  const list = document.getElementById("preLinkList");
  if (!list) return;
  const maxVotes = Math.max(0, ...preLinks.map(p=>Object.keys(p.votes||{}).length));
  list.innerHTML = "";
  if (preLinks.length === 0){ list.innerHTML = '<div style="color:rgba(255,255,255,.28);font-size:10px;text-align:center;padding:18px;border:1px dashed rgba(255,255,255,.08);border-radius:7px;font-style:italic">System waiting for node broadcast...</div>'; drawRouletteWheel(0); return; }
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
  drawRouletteWheel(0);
}

function drawRouletteWheel(angle){
  const canvas=document.getElementById("rouletteCanvas"); if(!canvas)return;
  const ctx=canvas.getContext("2d"), count=Math.max(preLinks.length,12), arc=Math.PI*2/count;
  ctx.clearRect(0,0,340,340);ctx.save();ctx.translate(170,170);ctx.rotate(angle||0);
  for(let i=0;i<count;i++){
    const active=i<preLinks.length, hue=i%2===0?"0,243,255":"255,46,136";
    ctx.beginPath();ctx.arc(0,0,132,i*arc+.018,(i+1)*arc-.018);ctx.arc(0,0,63,(i+1)*arc-.018,i*arc+.018,true);ctx.closePath();
    ctx.fillStyle=active?"rgba("+hue+",.32)":"rgba(255,255,255,.025)";ctx.fill();ctx.strokeStyle=active?"rgba("+hue+",.75)":"rgba(255,255,255,.08)";ctx.lineWidth=active?2:1;ctx.stroke();
    ctx.save();ctx.rotate(i*arc+arc/2);ctx.fillStyle=active?"#eafcff":"rgba(255,255,255,.16)";ctx.font="bold 9px monospace";ctx.textAlign="right";
    const label=active?(preLinks[i].url||"").replace("https://","").replace("http://","").slice(0,15):String(i+1).padStart(2,"0");ctx.fillText(label,122,3);ctx.restore();
  }
  ctx.beginPath();ctx.arc(0,0,52,0,Math.PI*2);ctx.fillStyle="rgba(0,8,12,.95)";ctx.fill();ctx.strokeStyle="rgba(0,243,255,.55)";ctx.lineWidth=2;ctx.stroke();ctx.restore();
}

function syncRouletteClock(){
  const updateClock = ()=>{
    const nowSec = Math.floor(Date.now()/1000);
    const cycleSec = nowSec % CYCLE_TOTAL_SEC;
    const badge = document.getElementById("rouletteTimerBadge");
    const big = document.getElementById("bigCountdownDisplay");
    let remaining, phase, banner, canSubmit;
    if (cycleSec < SUBMIT_START_SEC){ remaining = SUBMIT_START_SEC - cycleSec; phase="IDLE"; banner="⏳ NEXT ROUND IN"; canSubmit=false; }
    else if (cycleSec < VOTE_START_SEC){ remaining = VOTE_START_SEC - cycleSec; phase="SUBMIT"; banner="🔗 SUBMIT LINK (10s)"; canSubmit=true; }
    else { remaining = CYCLE_TOTAL_SEC - cycleSec; phase="VOTE"; banner="👍 VOTE (3s)"; canSubmit=false; }
    const m = Math.floor(remaining/60), s = String(remaining%60).padStart(2,"0");
    const t = m+":"+s;
    badge.textContent = t; big.textContent = t;

    if (phase !== roulettePhase){
      if (phase === "SUBMIT"){
        sfx("submit");
        showToast("🔗 Submit your link! (10s)");
        document.getElementById("rouletteOverlay").classList.add("open");
      } else if (phase === "VOTE"){
        sfx("vote");
        showToast("👍 Vote now! (3s)");
        document.getElementById("rouletteOverlay").classList.add("open");
      } else if (phase === "IDLE" && lastCyclePhase === "VOTE"){
        document.getElementById("rouletteOverlay").classList.add("open");
        triggerSpin();
      }
      roulettePhase = phase;
    }
    if ((phase === "SUBMIT" || phase === "VOTE") && !rSpinning) {
      document.getElementById("rouletteOverlay").classList.add("open");
    }
    document.getElementById("phaseTitle").textContent = banner;
    const reactorLabel=document.getElementById("reactorLabel");
    if(reactorLabel) reactorLabel.textContent=phase==="IDLE"?"Scanning pool":phase==="SUBMIT"?"Receiving links":"Votes locked";
    big.classList.toggle("phase-urgent", phase !== "IDLE" && remaining <= 3);
    if (phase !== "IDLE" && remaining <= 3 && remaining !== syncRouletteClock.lastTick){ sfx("tick"); syncRouletteClock.lastTick=remaining; }
    document.getElementById("preLinkInput").disabled = !canSubmit;
    document.getElementById("preLinkSubmitBtn").disabled = !canSubmit;
    lastCyclePhase = phase;
  };
  updateClock();
  setInterval(updateClock, 500);
}

async function triggerSpin(){
  if (rSpinning) return;
  if (preLinks.length === 0) return;
  rSpinning = true;
  document.getElementById("reactorLabel").textContent="Target acquired";
  document.getElementById("rouletteOverlay").classList.add("roulette-shake");
  document.getElementById("roulettePhaseContainer").className = "phase-mode-top";
  document.getElementById("wheelContainer").className = "wheel-container-active";

  // Winner = most votes, tie-break: random deterministic via cycle number
  const maxV = Math.max(...preLinks.map(p=>Object.keys(p.votes||{}).length));
  const tops = preLinks.filter(p=>Object.keys(p.votes||{}).length===maxV);
  const seed = Math.floor(Date.now()/1000/CYCLE_TOTAL_SEC);
  const winner = tops[seed % tops.length];

  await spinWheelAnim(winner);
  document.getElementById("rouletteOverlay").classList.remove("roulette-shake");
  handleWinner(winner);

  setTimeout(()=>{
    rSpinning = false;
    preLinks = [];
    renderPreLinks();
    document.getElementById("roulettePhaseContainer").className = "phase-mode-centered";
    document.getElementById("wheelContainer").className = "wheel-container-hidden";
    document.getElementById("rouletteOverlay").classList.remove("open");
    winnerPower = null;
    renderWinnerPanel();
  }, 6000);

}

let winnerPower = null; // { url, usesLeft } — held only by the chosen shooter
function handleWinner(winner){
  const name = winner.submitterName || "User";
  const tag = winner.submitter;
  document.getElementById("rouletteWinnerDisplay").innerHTML = "🏆 <b>"+escapeHtml(name)+"</b> (#"+tag+") won with <span style='color:var(--accent-2)'>"+escapeHtml(winner.url)+"</span>";
  document.getElementById("rouletteWinnerDisplay").classList.remove("winner-flash");
  void document.getElementById("rouletteWinnerDisplay").offsetWidth;
  document.getElementById("rouletteWinnerDisplay").classList.add("winner-flash");
  document.getElementById("reactorLabel").textContent="Winner locked";
  sfx("winner");
  showToast("🏆 Winner: "+name+" (#"+tag+")");
  postSystemMessage("🏆 "+name+" (#"+tag+") won the roulette with "+winner.url).catch(()=>{});

  // Second roulette: deterministically pick ONE online user as the "shooter"
  const tags = Object.values(onlineUsers).map(u=>u.tag).filter(Boolean).sort();
  if (tags.length === 0) return;
  const seed = Math.floor(Date.now()/1000/CYCLE_TOTAL_SEC);
  const shooterTag = tags[seed % tags.length];
  const shooter = Object.values(onlineUsers).find(u=>u.tag===shooterTag);
  const shooterName = shooter ? (shooter.username||"User") : "User";
  document.getElementById("rouletteWinnerDisplay").innerHTML +=
    "<br><br>🎯 <b>"+escapeHtml(shooterName)+"</b> (#"+shooterTag+") was chosen to pick ONE target to receive the link 3x!";
  postSystemMessage("🎯 "+shooterName+" (#"+shooterTag+") was chosen to pick the target!").catch(()=>{});
  if (shooterTag === userTag){
    winnerPower = { url: winner.url, usesLeft: 1 };
    renderWinnerPanel();
    showToast("🎯 You were chosen! Pick a target.","success");
  }
}


function renderWinnerPanel(){
  const panel = document.getElementById("winnerPowerPanel");
  const list = document.getElementById("winnerTargetList");
  if (!winnerPower || winnerPower.usesLeft <= 0){ panel.style.display="none"; return; }
  panel.style.display = "block";
  list.innerHTML = "";
  Object.values(onlineUsers).forEach(u=>{
    if (u.tag === userTag) return;
    const b = document.createElement("button");
    b.style.cssText = "background:linear-gradient(145deg,rgba(255,155,255,.2),rgba(126,249,255,.15));border:1px solid rgba(255,155,255,.35);color:var(--text);padding:8px 12px;border-radius:8px;cursor:pointer;font-size:12px;text-align:left";
    b.textContent = "🎯 Blast "+(u.username||"User")+" (#"+u.tag+")";
    b.onclick = ()=>blastTarget(u.tag, u.username);
    list.appendChild(b);
  });
  if (list.children.length === 0) list.innerHTML = '<div style="color:var(--muted);font-size:11px">No other users online.</div>';
}

async function blastTarget(tag, name){
  if (!winnerPower || winnerPower.usesLeft <= 0) return;
  const url = winnerPower.url;
  sfx("blast");
  winnerPower.usesLeft = 0;
  for (let i=0;i<3;i++){
    await sb.from("messages").insert({username:"System",content:"__SEND__:#"+tag+":"+url,user_tag:"0000"});
    await new Promise(r=>setTimeout(r,400));
  }
  await postSystemMessage("🎯 "+username+" blasted "+name+" (#"+tag+") 3x with roulette link.");
  showToast("Blasted #"+tag+" 3x");
  renderWinnerPanel();
}

function spinWheelAnim(winner){
  return new Promise(res=>{
    const N = preLinks.length;
    const winIdx = preLinks.indexOf(winner);
    const arc = (Math.PI*2)/N;
    const targetAngle = (Math.PI*2*6) + (Math.PI*1.5 - (winIdx*arc + arc/2));
    const dur = 2400;
    const start = performance.now();
    let lastTickSegment = -1;
    function frame(now){
      const t = Math.min(1, (now-start)/dur);
      const eased = 1 - Math.pow(1-t, 4);
      const angle = eased * targetAngle;
      const tickSegment = Math.floor(angle/arc);
      if (tickSegment !== lastTickSegment){ lastTickSegment=tickSegment; sfx("tick"); }
      drawRouletteWheel(angle);
      if (t<1) requestAnimationFrame(frame); else res();
    }
    requestAnimationFrame(frame);
  });
}

// Bootstrap
window.addEventListener("DOMContentLoaded", async ()=>{
  syncSoundButton();
  syncRouletteClock();
  updateOnlineListUI();
  await loadMessages();
  initRealtime();
});
<\/script>
</body>
</html>`;
}
