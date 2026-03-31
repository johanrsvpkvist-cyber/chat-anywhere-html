export function generateChatHTML(): string {
  const SUPABASE_URL = "https://krvtjbsluoepatdezarg.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtydnRqYnNsdW9lcGF0ZGV6YXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ5MzE5ODksImV4cCI6MjA5MDUwNzk4OX0.sxUlgZENLKZGlO09lm8Bsbqv1NLYX2YTYeQC8Fu1_9Q";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>OpenChat</title>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',system-ui,sans-serif;background:#12161d;color:#e2e6ed;height:100vh;display:flex;flex-direction:column;max-width:700px;margin:0 auto}
header{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid #252a33;background:#181c24}
header h1{font-size:18px;font-weight:700;color:#34d399}
.name-btn{background:none;border:none;color:#7a8294;cursor:pointer;font-size:13px}
.name-btn:hover{color:#e2e6ed}
#messages{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
.msg{display:flex;flex-direction:column;max-width:75%}
.msg.self{align-self:flex-end;align-items:flex-end}
.msg.other{align-self:flex-start;align-items:flex-start}
.meta{font-size:11px;color:#7a8294;margin-bottom:3px;padding:0 4px}
.bubble{padding:8px 14px;border-radius:16px;font-size:14px;word-break:break-word;line-height:1.4}
.self .bubble{background:#34d399;color:#12161d;border-bottom-right-radius:6px}
.other .bubble{background:#252a33;color:#e2e6ed;border-bottom-left-radius:6px}
.bubble img{max-width:100%;border-radius:8px;margin-top:4px}
.input-bar{padding:10px;border-top:1px solid #252a33;background:#181c24;display:flex;gap:8px;align-items:center}
.input-bar input[type=text]{flex:1;background:#252a33;border:none;color:#e2e6ed;padding:10px 14px;border-radius:12px;font-size:14px;outline:none}
.input-bar button{background:#34d399;color:#12161d;border:none;width:40px;height:40px;border-radius:10px;cursor:pointer;font-size:18px;display:flex;align-items:center;justify-content:center}
.input-bar button:disabled{opacity:.4;cursor:default}
.img-btn{background:none!important;color:#7a8294!important;font-size:20px!important}
.img-btn:hover{color:#e2e6ed!important}
.empty{display:flex;align-items:center;justify-content:center;flex:1;color:#7a8294;font-size:14px}
.modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:10}
.modal{background:#181c24;border:1px solid #252a33;border-radius:12px;padding:20px;width:300px}
.modal input{width:100%;background:#252a33;border:none;color:#e2e6ed;padding:10px;border-radius:8px;margin:10px 0;font-size:14px;outline:none}
.modal button{background:#34d399;color:#12161d;border:none;padding:8px 16px;border-radius:8px;cursor:pointer;font-size:14px}
</style>
</head>
<body>
<header>
<h1>💬 OpenChat</h1>
<button class="name-btn" onclick="changeName()">⚙ <span id="nameDisplay">Anonymous</span></button>
</header>
<div id="messages"></div>
<div class="input-bar">
<input type="file" id="fileInput" accept="image/*" style="display:none" onchange="uploadImage(this)">
<button class="img-btn" onclick="document.getElementById('fileInput').click()">🖼</button>
<input type="text" id="msgInput" placeholder="Type a message..." onkeydown="if(event.key==='Enter')sendMsg()">
<button onclick="sendMsg()">➤</button>
</div>

<script>
const sb=window.supabase.createClient("${SUPABASE_URL}","${SUPABASE_KEY}");
let username=localStorage.getItem("chat-username")||"Anonymous";
document.getElementById("nameDisplay").textContent=username;
const msgDiv=document.getElementById("messages");

async function load(){
const{data}=await sb.from("messages").select("*").order("created_at",{ascending:true}).limit(200);
if(data)data.forEach(m=>addMsg(m));
sb.channel("public:messages").on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},p=>{addMsg(p.new)}).subscribe();
}

function addMsg(m){
const d=document.createElement("div");
d.className="msg "+(m.username===username?"self":"other");
const t=new Date(m.created_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
let content="";
if(m.content)content="<p>"+m.content.replace(/</g,"&lt;")+"</p>";
if(m.image_url)content+='<img src="'+m.image_url+'" loading="lazy">';
d.innerHTML='<span class="meta">'+m.username.replace(/</g,"&lt;")+" · "+t+'</span><div class="bubble">'+content+"</div>";
msgDiv.appendChild(d);
msgDiv.scrollTop=msgDiv.scrollHeight;
}

async function sendMsg(){
const inp=document.getElementById("msgInput");
const v=inp.value.trim();
if(!v)return;
await sb.from("messages").insert({username,content:v});
inp.value="";
}

async function uploadImage(input){
const f=input.files[0];if(!f)return;
const name=Date.now()+"-"+f.name;
const{error}=await sb.storage.from("chat-images").upload(name,f);
if(!error){
const{data}=sb.storage.from("chat-images").getPublicUrl(name);
await sb.from("messages").insert({username,image_url:data.publicUrl});
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
