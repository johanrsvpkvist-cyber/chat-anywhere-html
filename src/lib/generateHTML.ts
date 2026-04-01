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
body{font-family:'Inter',system-ui,sans-serif;background:#12161d;color:#e2e6ed;height:100vh;display:flex;justify-content:center;align-items:stretch}
.app{display:flex;flex-direction:column;width:100%;max-width:900px;height:100vh;margin:0 auto;border-left:1px solid #252a33;border-right:1px solid #252a33}
header{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid #252a33;background:#181c24}
header h1{font-size:20px;font-weight:700;color:#34d399}
.header-right{display:flex;align-items:center;gap:12px}
.name-btn{background:none;border:none;color:#7a8294;cursor:pointer;font-size:14px;display:flex;align-items:center;gap:4px}
.name-btn:hover{color:#e2e6ed}
.admin-badge{background:#ef4444;color:#fff;font-size:10px;padding:2px 6px;border-radius:4px;font-weight:700;text-transform:uppercase}
.tag{color:#34d399;font-family:monospace;font-size:12px}
#messages{flex:1;overflow-y:auto;padding:20px 24px;display:flex;flex-direction:column;gap:12px}
#messages::-webkit-scrollbar{width:6px}
#messages::-webkit-scrollbar-track{background:transparent}
#messages::-webkit-scrollbar-thumb{background:#252a33;border-radius:3px}
.msg{display:flex;flex-direction:column;max-width:65%}
.msg.self{align-self:flex-end;align-items:flex-end}
.msg.other{align-self:flex-start;align-items:flex-start}
.meta{font-size:12px;color:#7a8294;margin-bottom:4px;padding:0 4px;display:flex;align-items:center;gap:4px}
.del-btn{background:none;border:none;color:#ef4444;cursor:pointer;font-size:12px;padding:0 2px;display:none}
.del-btn:hover{color:#f87171}
.bubble{padding:10px 16px;border-radius:16px;font-size:14px;word-break:break-word;line-height:1.5}
.self .bubble{background:#34d399;color:#12161d;border-bottom-right-radius:6px}
.other .bubble{background:#252a33;color:#e2e6ed;border-bottom-left-radius:6px}
.bubble img{max-width:100%;border-radius:8px;margin-top:4px}
.input-bar{padding:12px 24px;border-top:1px solid #252a33;background:#181c24}
.cmd-hint{font-size:11px;color:#7a8294;margin-bottom:8px;font-family:monospace;display:none}
.input-row{display:flex;gap:10px;align-items:center}
.input-bar input[type=text]{flex:1;background:#252a33;border:none;color:#e2e6ed;padding:12px 16px;border-radius:12px;font-size:14px;outline:none}
.input-bar button{background:#34d399;color:#12161d;border:none;width:42px;height:42px;border-radius:10px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center}
.input-bar button:disabled{opacity:.4;cursor:default}
.img-btn{background:none!important;color:#7a8294!important;font-size:20px!important}
.img-btn:hover{color:#e2e6ed!important}
.empty{display:flex;align-items:center;justify-content:center;flex:1;color:#7a8294;font-size:14px}
/* Settings panel */
.settings-overlay{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:center;justify-content:center;z-index:100}
.settings-overlay.open{display:flex}
.settings-panel{background:#181c24;border:1px solid #252a33;border-radius:14px;padding:24px;width:360px;max-width:90vw}
.settings-panel h2{font-size:16px;font-weight:700;color:#34d399;margin-bottom:16px}
.settings-panel label{display:block;font-size:12px;color:#7a8294;margin-bottom:4px;margin-top:12px}
.settings-panel select,.settings-panel input[type=text]{width:100%;background:#252a33;border:1px solid #333;color:#e2e6ed;padding:10px 12px;border-radius:8px;font-size:14px;outline:none}
.settings-panel select:focus,.settings-panel input[type=text]:focus{border-color:#34d399}
.settings-btns{display:flex;gap:8px;margin-top:20px}
.settings-btns button{flex:1;padding:10px;border-radius:8px;font-size:14px;cursor:pointer;border:none}
.btn-save{background:#34d399;color:#12161d;font-weight:600}
.btn-cancel{background:#252a33;color:#7a8294}
</style>
</head>
<body>
<div class="app">
<header>
<div style="display:flex;align-items:center;gap:8px">
<h1>💬 OpenChat</h1>
<span class="admin-badge" id="adminBadge" style="display:none">Admin</span>
</div>
<div class="header-right">
<button class="name-btn" onclick="changeName()">⚙ <span id="nameDisplay">Anonymous</span> <span class="tag" id="myTagDisplay" style="display:none"></span></button>
<button style="background:none;border:none;color:#7a8294;cursor:pointer;font-size:18px" onclick="openSettings()" title="Tab Disguise">🎭</button>
</div>
</header>
<div id="messages"></div>
<div class="input-bar">
<div class="cmd-hint" id="cmdHint">Commands: /wipe · /timeout #tag mins · /mute #tag mins</div>
<div class="input-row">
<input type="file" id="fileInput" accept="image/*" style="display:none" onchange="uploadImage(this)">
<button class="img-btn" onclick="document.getElementById('fileInput').click()">🖼</button>
<input type="text" id="msgInput" placeholder="Type a message..." onkeydown="if(event.key==='Enter')sendMsg()">
<button onclick="sendMsg()">➤</button>
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

<script>
const sb=window.supabase.createClient("${SUPABASE_URL}","${SUPABASE_KEY}");
let username=localStorage.getItem("chat-username")||"Anonymous";
let userTag=localStorage.getItem("chat-user-tag");
if(!userTag){userTag=String(Math.floor(1000+Math.random()*9000));localStorage.setItem("chat-user-tag",userTag);}
let isAdmin=false;
const ADMIN_PASS="ratracekareem";

document.getElementById("nameDisplay").textContent=username;
const msgDiv=document.getElementById("messages");

// Restore saved disguise
(function(){
  const saved=localStorage.getItem("chat-disguise");
  if(saved){
    try{
      const d=JSON.parse(saved);
      if(d.title)document.title=d.title;
      if(d.favicon)document.getElementById("favicon").href=d.favicon;
    }catch(e){}
  }
})();

function openSettings(){document.getElementById("settingsOverlay").classList.add("open");}
function closeSettings(){document.getElementById("settingsOverlay").classList.remove("open");}

function onPresetChange(){
  const sel=document.getElementById("presetSelect");
  const opt=sel.options[sel.selectedIndex];
  if(sel.value!=="custom"){
    document.getElementById("tabTitleInput").value=opt.dataset.title;
    document.getElementById("faviconInput").value=opt.dataset.icon;
  }
}

function applySettings(){
  const title=document.getElementById("tabTitleInput").value.trim();
  const favicon=document.getElementById("faviconInput").value.trim();
  if(title)document.title=title;
  if(favicon)document.getElementById("favicon").href=favicon;
  localStorage.setItem("chat-disguise",JSON.stringify({title:title||document.title,favicon}));
  closeSettings();
}

async function load(){
const{data}=await sb.from("messages").select("*").order("created_at",{ascending:true}).limit(200);
if(data)data.forEach(m=>addMsg(m));
sb.channel("public:messages")
.on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},p=>{addMsg(p.new)})
.on("postgres_changes",{event:"DELETE",schema:"public",table:"messages"},p=>{
  const el=document.getElementById("msg-"+p.old.id);
  if(el)el.remove();
})
.subscribe();
}

function addMsg(m){
if(document.getElementById("msg-"+m.id))return;
const d=document.createElement("div");
d.className="msg "+(m.user_tag===userTag?"self":"other");
d.id="msg-"+m.id;
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
if(data&&data.length>0){alert("You are muted until "+new Date(data[0].muted_until).toLocaleTimeString());return true;}
return false;
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
alert("Admin mode activated 🔓");
return;
}

if(isAdmin&&v==="/wipe"){
await sb.from("messages").delete().neq("id","00000000-0000-0000-0000-000000000000");
msgDiv.innerHTML="";
inp.value="";
return;
}

const cmdMatch=v.match(/^\\/(timeout|mute)\\s+#(\\d{4})\\s+(\\d+)$/);
if(isAdmin&&cmdMatch){
const tag=cmdMatch[2];const mins=parseInt(cmdMatch[3]);
const until=new Date(Date.now()+mins*60000).toISOString();
await sb.from("muted_users").insert({user_tag:tag,muted_until:until});
alert("User #"+tag+" muted for "+mins+" minute(s)");
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

load();
<\/script>
</body>
</html>`;
}
