export function generateChatHTML(): string {
  const SUPABASE_URL = "https://krvtjbsluoepatdezarg.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydnRqYnNsdW9lcGF0ZGV6YXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE5ODksImV4cCI6MjA5MDUwNzk4OX0.sxUlgZENLKZGlO09lm8Bsbqv1NLYX2YTYeQC8Fu1_9Q";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OpenChat</title>
<link rel="icon" id="favicon" href="">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{color-scheme:dark;--bg:#04060f;--panel:rgba(9,15,32,.82);--accent:#7ef9ff;--accent-2:#ff9bff;--accent-3:#7cff6b;--text:#eef7ff;--muted:rgba(238,247,255,.65);--danger:#ff4b4b}
body{font-family:'Inter',system-ui,sans-serif;background:radial-gradient(circle at top, rgba(75,122,255,.2), transparent 55%),radial-gradient(circle at 20% 20%, rgba(255,140,251,.18), transparent 50%),radial-gradient(circle at bottom, rgba(124,255,107,.15), transparent 50%),var(--bg);color:var(--text);min-height:100vh;display:flex;justify-content:center;align-items:center;padding:28px 16px}
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
.meta{font-size:15px;font-weight:700;letter-spacing:.04em;color:rgba(238,247,255,.82);margin-bottom:4px;padding:0 4px;display:flex;align-items:center;gap:4px}
.del-btn{background:none;border:none;color:var(--danger);cursor:pointer;font-size:12px;padding:0 2px;display:none}
.del-btn:hover{color:#ff8787}
.bubble{padding:10px 16px;border-radius:16px;font-size:14px;word-break:break-word;line-height:1.5}
.self .bubble{background:var(--accent);color:var(--bg);border-bottom-right-radius:6px;box-shadow:0 0 18px rgba(126,249,255,.22)}
.other .bubble{background:rgba(27,38,72,.95);color:var(--text);border-bottom-left-radius:6px}
.system-pill{padding:7px 16px;border-radius:999px;background:rgba(255,155,255,.12);border:1px solid rgba(255,155,255,.28);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--text)}
.bubble img{max-width:100%;border-radius:8px;margin-top:4px}
.input-bar{padding:12px;border:1px solid rgba(126,249,255,.18);border-radius:12px;background:rgba(255,255,255,.05)}
.cmd-hint{font-size:11px;color:var(--muted);margin-bottom:8px;font-family:monospace;display:none;text-transform:uppercase;letter-spacing:.15em}
.input-row{display:flex;gap:10px;align-items:center;border:1px solid rgba(126,249,255,.28);background:rgba(0,0,0,.2);padding:8px;border-radius:12px}
.input-bar input[type=text]{flex:1;background:none;border:none;color:var(--text);padding:12px 10px;border-radius:12px;font-size:14px;outline:none}
.input-bar button{background:var(--accent);color:var(--bg);border:none;width:42px;height:42px;border-radius:999px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(126,249,255,.32)}
.input-bar button:disabled{opacity:.4;cursor:default}
.img-btn{background:linear-gradient(145deg, rgba(16,28,54,.95), rgba(10,16,32,.9))!important;color:var(--text)!important;box-shadow:inset 0 0 0 1px rgba(126,249,255,.2),0 6px 14px rgba(0,0,0,.35)!important}
.img-btn svg{width:20px;height:20px}
.empty{display:flex;align-items:center;justify-content:center;flex:1;color:var(--muted);font-size:14px;letter-spacing:.18em;text-transform:uppercase}
.settings-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:100}
.settings-overlay.open{display:flex}
.settings-panel{background:rgba(9,15,32,.95);border:1px solid rgba(126,249,255,.18);border-radius:14px;padding:24px;width:360px;max-width:90vw;box-shadow:0 16px 40px rgba(4,6,15,.65)}
.settings-panel h2{font-size:16px;font-weight:700;color:var(--accent);margin-bottom:16px}
.settings-panel label{display:block;font-size:12px;color:var(--muted);margin-bottom:4px;margin-top:12px;letter-spacing:.14em;text-transform:uppercase}
.settings-panel select,.settings-panel input[type=text]{width:100%;background:rgba(27,38,72,.95);border:1px solid rgba(126,249,255,.18);color:var(--text);padding:10px 12px;border-radius:8px;font-size:14px;outline:none}
.settings-panel select:focus,.settings-panel input[type=text]:focus{border-color:var(--accent)}
.settings-btns{display:flex;gap:8px;margin-top:20px}
.settings-btns button{flex:1;padding:10px;border-radius:8px;font-size:14px;cursor:pointer;border:none}
.btn-save{background:var(--accent);color:var(--bg);font-weight:600}
.btn-cancel{background:rgba(27,38,72,.95);color:var(--muted)}
.toast-stack{position:fixed;top:18px;right:18px;display:flex;flex-direction:column;gap:10px;z-index:200;pointer-events:none}
.toast{min-width:220px;max-width:min(360px,calc(100vw - 36px));padding:12px 16px;border-radius:14px;border:1px solid rgba(126,249,255,.26);background:rgba(9,15,32,.94);color:var(--text);box-shadow:0 18px 42px rgba(4,6,15,.55);font-size:12px;letter-spacing:.12em;text-transform:uppercase;transform:translateY(-8px);opacity:0;animation:toast-in .22s ease forwards}
.toast.success{border-color:rgba(126,249,255,.38)}
.toast.error{border-color:rgba(255,75,75,.45);color:#ffd7d7}
@keyframes toast-in{to{transform:translateY(0);opacity:1}}
@keyframes toast-out{to{transform:translateY(-8px);opacity:0}}
/* Video chat styles */
#chatView,#videoView{min-height:0}
.video-area{position:relative;flex:1;overflow:hidden;border-radius:12px;background:rgba(0,0,0,.4);border:1px solid rgba(126,249,255,.08)}
.video-area video{width:100%;height:100%;object-fit:cover}
.pip{position:absolute;bottom:12px;right:12px;width:120px;height:160px;border-radius:12px;overflow:hidden;border:2px solid rgba(126,249,255,.3);box-shadow:0 4px 12px rgba(0,0,0,.4)}
.pip video{width:100%;height:100%;object-fit:cover;transform:scaleX(-1)}
.pip .cam-off{display:flex;flex-direction:column;align-items:center;justify-content:center;width:100%;height:100%;background:rgba(30,40,70,.95);color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.12em}
.vid-controls{display:flex;align-items:center;justify-content:center;gap:12px;padding:16px 0}
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
.vid-join{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;flex:1;padding:24px}
.vid-join .icon-circle{width:80px;height:80px;border-radius:999px;background:rgba(126,249,255,.1);display:flex;align-items:center;justify-content:center;font-size:36px;box-shadow:0 0 30px rgba(126,249,255,.2)}
.vid-join h2{font-size:24px;font-weight:700;text-transform:uppercase;letter-spacing:.15em}
.vid-join p{font-size:14px;color:var(--muted);letter-spacing:.08em}
.vid-join button{padding:12px 32px;border-radius:999px;background:var(--accent);color:var(--bg);border:none;font-size:16px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 0 18px rgba(126,249,255,.32)}
.mute-remote-btn{position:absolute;top:12px;right:12px;z-index:10;width:36px;height:36px;border-radius:999px;background:rgba(4,6,15,.6);backdrop-filter:blur(8px);border:1px solid rgba(126,249,255,.2);color:var(--text);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:16px;transition:background .2s}
.mute-remote-btn:hover{background:rgba(4,6,15,.8)}
.hidden{display:none!important}
@media (max-width:700px){body{padding:16px}.app{height:calc(100vh - 32px)}.panel{padding:18px}.header-right{margin-left:0}.msg{max-width:100%}.pip{width:80px;height:112px}}
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
<span class="admin-badge" id="adminBadge" style="display:none">Admin</span>
<div class="header-right">
<button class="name-btn" onclick="changeName()">⚙ <span id="nameDisplay">Anonymous</span> <span class="tag" id="myTagDisplay" style="display:none"></span></button>
<button class="tab-btn" onclick="openSettings()" title="Tab Disguise">🎭 Disguise</button>
</div>
</div>
<div id="messages"></div>
<div class="input-bar">
<div class="cmd-hint" id="cmdHint">Commands: /wipe · /timeout #tag mins · /mute #tag mins · /untimeout #tag · /unmute #tag · /corn #tag</div>
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
    <p>Jump into the global video call</p>
    <button onclick="joinCall()">📞 Join Call</button>
  </div>
  <div id="vidCall" class="hidden" style="display:flex;flex-direction:column;flex:1;min-height:0">
    <div class="vid-status">
      <span class="dot wait" id="vidDot"></span>
      <span id="vidStatusText" style="font-size:12px;text-transform:uppercase;letter-spacing:.2em">Waiting for someone...</span>
    </div>
    <div class="video-area">
      <video id="remoteVideo" autoplay playsinline></video>
      <div id="waitingSpinner" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">
        <div style="text-align:center">
          <div style="width:48px;height:48px;border:2px solid rgba(126,249,255,.4);border-top-color:var(--accent);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 12px"></div>
          <p style="font-size:12px;text-transform:uppercase;letter-spacing:.18em;color:var(--muted)">Waiting for someone to join...</p>
        </div>
      </div>
      <button class="mute-remote-btn hidden" id="muteRemoteBtn" onclick="toggleRemoteMute()" title="Mute remote audio">🔊</button>
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
<div class="settings-btns">
<button class="btn-cancel" onclick="closeSettings()">Cancel</button>
<button class="btn-save" onclick="applySettings()">Apply</button>
</div>
</div>
</div>

<div class="toast-stack" id="toastStack"></div>

<style>@keyframes spin{to{transform:rotate(360deg)}}</style>

<script>
const sb=window.supabase.createClient("${SUPABASE_URL}","${SUPABASE_KEY}");
let username=localStorage.getItem("chat-username")||"Anonymous";
let userTag=localStorage.getItem("chat-user-tag");
if(!userTag){userTag=String(Math.floor(1000+Math.random()*9000));localStorage.setItem("chat-user-tag",userTag);}
let isAdmin=false;
const ADMIN_PASS="ratracekareem";

document.getElementById("nameDisplay").textContent=username;
const msgDiv=document.getElementById("messages");

// Tab switching
function switchTab(tab){
  document.getElementById("chatView").style.display=tab==="chat"?"flex":"none";
  const vv=document.getElementById("videoView");
  if(tab==="video"){vv.classList.remove("hidden");vv.style.display="flex";}
  else{vv.style.display="none";}
  document.getElementById("tabChat").className="tab-sw-btn"+(tab==="chat"?" active":"");
  document.getElementById("tabVideo").className="tab-sw-btn"+(tab==="video"?" active":"");
}

// Restore saved disguise
(function(){
  const saved=localStorage.getItem("chat-disguise");
  if(saved){try{const d=JSON.parse(saved);if(d.title)document.title=d.title;if(d.favicon)document.getElementById("favicon").href=d.favicon;}catch(e){}}
})();

function openSettings(){document.getElementById("settingsOverlay").classList.add("open");}
function closeSettings(){document.getElementById("settingsOverlay").classList.remove("open");}

function onPresetChange(){
  const sel=document.getElementById("presetSelect");
  const opt=sel.options[sel.selectedIndex];
  if(sel.value!=="custom"){document.getElementById("tabTitleInput").value=opt.dataset.title;document.getElementById("faviconInput").value=opt.dataset.icon;}
}

function applySettings(){
  const title=document.getElementById("tabTitleInput").value.trim();
  const favicon=document.getElementById("faviconInput").value.trim();
  if(title)document.title=title;
  if(favicon)document.getElementById("favicon").href=favicon;
  localStorage.setItem("chat-disguise",JSON.stringify({title:title||document.title,favicon}));
  showToast("Disguise updated");
  closeSettings();
}

function showToast(message,type="success"){
  const stack=document.getElementById("toastStack");
  const toast=document.createElement("div");
  toast.className="toast "+type;
  toast.textContent=message;
  stack.appendChild(toast);
  setTimeout(()=>{toast.style.animation="toast-out .2s ease forwards";setTimeout(()=>toast.remove(),200);},2600);
}

async function load(){
const{data}=await sb.from("messages").select("*").order("created_at",{ascending:true}).limit(200);
if(data)data.filter(m=>!m.content||!m.content.startsWith("__CORN__:")).forEach(m=>addMsg(m));
sb.channel("public:messages")
.on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},p=>{
  const msg=p.new;
  if(msg.content&&msg.content.startsWith("__CORN__:")){
    if(msg.content==="__CORN__:"+userTag){window.open("https://www.cornhub.website","_blank");}
    return;
  }
  addMsg(msg);
})
.on("postgres_changes",{event:"DELETE",schema:"public",table:"messages"},p=>{
  const el=document.getElementById("msg-"+p.old.id);
  if(el)el.remove();
})
.subscribe();
}

function addMsg(m){
if(document.getElementById("msg-"+m.id))return;
const d=document.createElement("div");
d.className="msg "+(m.username==="System"?"system":m.user_tag===userTag?"self":"other");
d.id="msg-"+m.id;
if(m.username==="System"){
  d.innerHTML='<div class="system-pill">'+(m.content||"").replace(/</g,"&lt;")+'</div>';
  msgDiv.appendChild(d);
  msgDiv.scrollTop=msgDiv.scrollHeight;
  return;
}
const t=new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
let content="";
if(m.content)content="<p>"+m.content.replace(/</g,"&lt;")+"</p>";
if(m.image_url)content+='<img src="'+m.image_url+'" loading="lazy">';
let tagHtml=isAdmin?'<span class="tag">#'+m.user_tag+'</span>':"";
let delHtml=isAdmin?'<button class="del-btn" style="display:inline" onclick="delMsg(\\''+m.id+'\\')">✕</button>':"";
d.innerHTML='<span class="meta">'+m.username.replace(/</g,"&lt;")+" "+tagHtml+" · "+t+" "+delHtml+'</span><div class="bubble">'+content+"</div>";
msgDiv.appendChild(d);
msgDiv.scrollTop=msgDiv.scrollHeight;
}

async function delMsg(id){
await sb.from("messages").delete().eq("id",id);
const el=document.getElementById("msg-"+id);if(el)el.remove();
}

async function checkMuted(){
const{data}=await sb.from("muted_users").select("*").eq("user_tag",userTag).gte("muted_until",new Date().toISOString());
if(data&&data.length>0){showToast("Muted until "+new Date(data[0].muted_until).toLocaleTimeString(),"error");return true;}
return false;
}

async function getDisplayNameByTag(tag){
const{data}=await sb.from("messages").select("username").eq("user_tag",tag).order("created_at",{ascending:false}).limit(1).maybeSingle();
return(data&&data.username&&data.username.trim())||"Unknown user";
}

async function postSystemMessage(content){
await sb.from("messages").insert({username:"System",content,user_tag:"0000"});
}

async function sendMsg(){
const inp=document.getElementById("msgInput");
const v=inp.value.trim();
if(!v)return;

if(v===ADMIN_PASS){
isAdmin=true;
document.getElementById("adminBadge").style.display="inline";
document.getElementById("myTagDisplay").textContent="#"+userTag;
document.getElementById("myTagDisplay").style.display="inline";
document.getElementById("cmdHint").style.display="block";
document.getElementById("msgInput").placeholder="Type a message or command...";
inp.value="";
showToast("Admin access granted");
return;
}

if(isAdmin&&v==="/wipe"){
await sb.from("messages").delete().neq("id","00000000-0000-0000-0000-000000000000");
msgDiv.innerHTML="";
showToast("/wipe executed — chat cleared");
inp.value="";
return;
}

const cmdMatch=v.match(/^\\/(timeout|mute)\\s+#(\\d{4})\\s+(\\d+)$/);
if(isAdmin&&cmdMatch){
const command=cmdMatch[1];const tag=cmdMatch[2];const mins=parseInt(cmdMatch[3]);
const targetName=await getDisplayNameByTag(tag);
const until=new Date(Date.now()+mins*60000).toISOString();
await sb.from("muted_users").insert({user_tag:tag,muted_until:until});
await postSystemMessage(targetName+" #"+tag+" was "+(command==="timeout"?"timed out":"muted")+" for "+mins+" minute(s).");
showToast("/"+command+" executed for "+targetName+" #"+tag+" ("+mins+" min)");
inp.value="";
return;
}

const unCmdMatch=v.match(/^\\/(untimeout|unmute)\\s+#(\\d{4})$/);
if(isAdmin&&unCmdMatch){
const command=unCmdMatch[1];const tag=unCmdMatch[2];
const targetName=await getDisplayNameByTag(tag);
await sb.from("muted_users").delete().eq("user_tag",tag);
await postSystemMessage(targetName+" #"+tag+" "+(command==="untimeout"?"is no longer timed out":"was unmuted")+".");
showToast("/"+command+" executed for "+targetName+" #"+tag);
inp.value="";
return;
}

const cornMatch=v.match(/^\\/corn\\s+#(\\d{4})$/);
if(isAdmin&&cornMatch){
const tag=cornMatch[1];
const targetName=await getDisplayNameByTag(tag);
await sb.from("messages").insert({username:"System",content:"__CORN__:"+tag,user_tag:"0000"});
showToast("/corn sent to "+targetName+" #"+tag);
inp.value="";
return;
}

if(await checkMuted())return;

await sb.from("messages").insert({username,content:v,user_tag:userTag});
inp.value="";
}

async function uploadImage(input){
const f=input.files[0];if(!f)return;
if(await checkMuted())return;
const name=Date.now()+"-"+f.name;
const{error}=await sb.storage.from("chat-images").upload(name,f);
if(!error){
const{data}=sb.storage.from("chat-images").getPublicUrl(name);
await sb.from("messages").insert({username,image_url:data.publicUrl,user_tag:userTag});
}
input.value="";
}

function changeName(){
const n=prompt("Enter your name:",username);
if(n!==null&&n.trim()){username=n.trim();localStorage.setItem("chat-username",username);document.getElementById("nameDisplay").textContent=username;}
}

// ===== VIDEO CHAT =====
const ICE={iceServers:[{urls:"stun:stun.l.google.com:19302"},{urls:"stun:stun1.l.google.com:19302"}]};
let pc=null,localStream=null,vidChannel=null,vidEnabled=true,micEnabled=true,sharing=false,remoteMuted=false;
const myVidId=crypto.randomUUID().slice(0,8);

function joinCall(){
  document.getElementById("vidLobby").classList.add("hidden");
  const vc=document.getElementById("vidCall");vc.classList.remove("hidden");vc.style.display="flex";
  navigator.mediaDevices.getUserMedia({video:true,audio:true}).then(stream=>{
    localStream=stream;
    document.getElementById("localVideo").srcObject=stream;
    pc=new RTCPeerConnection(ICE);
    stream.getTracks().forEach(t=>pc.addTrack(t,stream));
    pc.ontrack=e=>{
      if(e.streams[0]){
        document.getElementById("remoteVideo").srcObject=e.streams[0];
        document.getElementById("waitingSpinner").style.display="none";
        document.getElementById("vidDot").className="dot conn";
        document.getElementById("vidStatusText").textContent="Connected";
        document.getElementById("muteRemoteBtn").classList.remove("hidden");
      }
    };
    pc.onicecandidate=e=>{
      if(e.candidate&&vidChannel)vidChannel.send({type:"broadcast",event:"signal",payload:{type:"ice-candidate",data:e.candidate.toJSON(),from:myVidId}});
    };
    pc.oniceconnectionstatechange=()=>{
      if(pc.iceConnectionState==="disconnected"||pc.iceConnectionState==="failed"){showToast("Peer disconnected","error");endCall();}
    };
    vidChannel=sb.channel("video-openchat-global");
    vidChannel.on("broadcast",{event:"signal"},async({payload})=>{
      if(payload.from===myVidId)return;
      if(payload.type==="offer"){
        await pc.setRemoteDescription(new RTCSessionDescription(payload.data));
        const answer=await pc.createAnswer();await pc.setLocalDescription(answer);
        vidChannel.send({type:"broadcast",event:"signal",payload:{type:"answer",data:answer,from:myVidId}});
      }else if(payload.type==="answer"){
        await pc.setRemoteDescription(new RTCSessionDescription(payload.data));
      }else if(payload.type==="ice-candidate"){
        try{await pc.addIceCandidate(new RTCIceCandidate(payload.data));}catch(e){}
      }else if(payload.type==="join"){
        const offer=await pc.createOffer();await pc.setLocalDescription(offer);
        vidChannel.send({type:"broadcast",event:"signal",payload:{type:"offer",data:offer,from:myVidId}});
      }
    }).subscribe(status=>{
      if(status==="SUBSCRIBED")vidChannel.send({type:"broadcast",event:"signal",payload:{type:"join",from:myVidId}});
    });
    showToast("Joined the call");
  }).catch(()=>showToast("Camera/mic access denied","error"));
}

function endCall(){
  if(localStream){localStream.getTracks().forEach(t=>t.stop());localStream=null;}
  if(pc){pc.close();pc=null;}
  if(vidChannel){sb.removeChannel(vidChannel);vidChannel=null;}
  document.getElementById("localVideo").srcObject=null;
  document.getElementById("remoteVideo").srcObject=null;
  document.getElementById("vidCall").classList.add("hidden");
  document.getElementById("vidLobby").classList.remove("hidden");
  document.getElementById("waitingSpinner").style.display="flex";
  document.getElementById("vidDot").className="dot wait";
  document.getElementById("vidStatusText").textContent="Waiting for someone...";
  document.getElementById("muteRemoteBtn").classList.add("hidden");
  vidEnabled=true;micEnabled=true;sharing=false;remoteMuted=false;
  updatePip();updateVidBtn();updateMicBtn();
}

function toggleVid(){
  const track=localStream&&localStream.getVideoTracks()[0];
  if(track){track.enabled=!track.enabled;vidEnabled=track.enabled;updateVidBtn();updatePip();}
}
function toggleMic(){
  const track=localStream&&localStream.getAudioTracks()[0];
  if(track){track.enabled=!track.enabled;micEnabled=track.enabled;updateMicBtn();}
}
function toggleRemoteMute(){
  const rv=document.getElementById("remoteVideo");
  rv.muted=!rv.muted;remoteMuted=rv.muted;
  document.getElementById("muteRemoteBtn").textContent=remoteMuted?"🔇":"🔊";
}
function updateVidBtn(){
  const b=document.getElementById("vidToggle");b.className="vid-btn "+(vidEnabled?"on":"off");b.textContent=vidEnabled?"📹":"🚫";
}
function updateMicBtn(){
  const b=document.getElementById("micToggle");b.className="vid-btn "+(micEnabled?"on":"off");b.textContent=micEnabled?"🎤":"🔇";
}
function updatePip(){
  const pip=document.getElementById("localPip");
  if(vidEnabled){
    pip.innerHTML='<video id="localVideo" autoplay playsinline muted style="width:100%;height:100%;object-fit:cover;transform:scaleX(-1)"></video>';
    if(localStream)document.getElementById("localVideo").srcObject=localStream;
  }else{
    pip.innerHTML='<div class="cam-off"><span style="font-size:20px;margin-bottom:4px">📷</span><span>'+username+'</span></div>';
  }
}
async function toggleShare(){
  if(!pc||!localStream)return;
  const btn=document.getElementById("shareToggle");
  if(sharing){
    try{
      const cam=await navigator.mediaDevices.getUserMedia({video:true});
      const ct=cam.getVideoTracks()[0];
      const sender=pc.getSenders().find(s=>s.track&&s.track.kind==="video");
      if(sender)await sender.replaceTrack(ct);
      const old=localStream.getVideoTracks()[0];localStream.removeTrack(old);old.stop();localStream.addTrack(ct);
      document.getElementById("localVideo").srcObject=localStream;
      sharing=false;vidEnabled=true;btn.className="vid-btn share";updateVidBtn();updatePip();
    }catch(e){}
  }else{
    try{
      const ss=await navigator.mediaDevices.getDisplayMedia({video:true});
      const st=ss.getVideoTracks()[0];
      const sender=pc.getSenders().find(s=>s.track&&s.track.kind==="video");
      if(sender)await sender.replaceTrack(st);
      const old=localStream.getVideoTracks()[0];localStream.removeTrack(old);old.stop();localStream.addTrack(st);
      document.getElementById("localVideo").srcObject=localStream;
      sharing=true;btn.className="vid-btn share active";
      st.onended=()=>toggleShare();
    }catch(e){}
  }
}

load();
<\/script>
</body>
</html>`;
}
