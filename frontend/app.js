const BOOKS=[
{id:'os',name:'Operating Systems',sub:'Stallings · Internals & Design Principles, 6th ed.',c:'#ff6fa5',s:26,e:762,ch:[[26,'Computer System Overview'],[69,'Operating System Overview'],[126,'Process Description & Control'],[179,'Threads, SMP & Microkernels'],[224,'Concurrency: Mutual Exclusion'],[281,'Concurrency: Deadlock & Starvation'],[330,'Memory Management'],[364,'Virtual Memory'],[424,'Uniprocessor Scheduling'],[471,'Multiprocessor & Real-Time Scheduling'],[514,'I/O Management & Disk Scheduling'],[540,'File Management'],[621,'Embedded Operating Systems'],[654,'Computer Security Threats'],[686,'Computer Security Techniques'],[729,'Distributed Processing & Client/Server']]},
{id:'dbms',name:'Database Systems',sub:'Elmasri & Navathe · Fundamentals of Database Systems',c:'#46b6ff',s:34,e:1193,ch:[[34,'Databases & Database Users'],[62,'DB System Concepts & Architecture'],[90,'Data Modeling Using ER Model'],[138,'Enhanced ER (EER) Model'],[180,'Relational Data Model & Constraints'],[208,'Basic SQL'],[238,'More SQL: Complex Queries, Triggers'],[270,'Relational Algebra & Calculus'],[320,'Relational DB Design by ER/EER Mapping'],[340,'SQL Programming Techniques'],[374,'Web DB Programming Using PHP'],[394,'Object & Object-Relational DBs'],[456,'XML'],[490,'Functional Dependencies & Normalization'],[534,'Relational Design Algorithms'],[572,'Disk Storage & File Structures'],[632,'Indexing Structures'],[686,'Query Processing Strategies'],[722,'Query Optimization'],[776,'Transaction Processing'],[812,'Concurrency Control'],[844,'Database Recovery'],[872,'Distributed Databases'],[914,'NOSQL & Big Data Storage'],[942,'Big Data: MapReduce & Hadoop'],[992,'Enhanced Data Models'],[1052,'Information Retrieval & Web Search'],[1100,'Data Mining'],[1132,'Data Warehousing & OLAP'],[1152,'Database Security']]},
{id:'nsm',name:'Numerical & Statistical Methods',sub:'USIT204 · NSM course book',c:'#ffb84a',s:7,e:240,ch:[7,14,33,54,70,83,95,106,118,146,168,194,216].map((p,i)=>[p,'Chapter '+(i+1)])}
];
BOOKS.forEach(b=>{b.n=b.e-b.s+1;b.ch.forEach((c,i)=>{c.e=i<b.ch.length-1?b.ch[i+1][0]-1:b.e})});
const AV=['🧑‍🎓','🐱','🦊','🐼','🐸','🐧'];
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

/* ---------- state ---------- */
let S={ppd:20,users:[],cur:null,theme:'',pal:''};
try{Object.assign(S,JSON.parse(localStorage.getItem('synergy-reader')||'{}'))}catch(e){}
const fixUser=u=>{['pos','at','log','ann','qs','hist','qd'].forEach(k=>u[k]=u[k]||{});u.daily=u.daily||{d:'',n:0};u.days=u.days||{};['mist','imp','books'].forEach(k=>u[k]=u[k]||[]);Object.values(u.log).forEach(L=>{for(let i=L.length-1;i>=0;i--)if(L[i].tmp)L.splice(i,1)})};
S.users.forEach(fixUser);
let _syncT;
function syncServer(){clearTimeout(_syncT);_syncT=setTimeout(()=>{fetch('/api/state',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(S)}).catch(()=>{})},800)}
const save=()=>{try{localStorage.setItem('synergy-reader',JSON.stringify(S))}catch(e){toast('Storage is full. Remove some photos.')}syncServer()};
/* on start: if this browser is empty but the server has saved data, restore it */
(async()=>{try{const r=await fetch('/api/state');if(!r.ok)return;const d=await r.json();if(d&&d.users&&d.users.length&&!S.users.length){Object.assign(S,d);S.users.forEach(fixUser);localStorage.setItem('synergy-reader',JSON.stringify(S));location.reload()}}catch(e){}})();
const U=()=>S.users.find(u=>u.id===S.cur);
const days=p=>Math.ceil(p/S.ppd),pos=b=>U().pos[b.id]||0,done=b=>Math.max(0,Math.min(b.n,pos(b)-b.s+1)),left=b=>b.n-done(b);
const stars=b=>{const p=done(b)/b.n;return p>=1?3:p>=.66?2:p>=.33?1:0},st=n=>'★'.repeat(n)+'☆'.repeat(3-n);
const fin=d=>{const t=new Date();t.setDate(t.getDate()+d);return t.toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})};
const chip=()=>{const u=U();$('#stc').textContent='★ '+(u?BOOKS.filter(b=>u.books.includes(b.id)).reduce((a,b)=>a+stars(b),0)+Object.values(u.qs).reduce((a,v)=>a+v,0):0)};
function applyTheme(){const r=document.documentElement;if(S.theme)r.dataset.theme=S.theme;else delete r.dataset.theme;if(S.pal)r.dataset.pal=S.pal;else delete r.dataset.pal}
const ROBO=(s=28)=>`<svg class="robo" width="${s}" height="${s}" viewBox="0 0 64 64" aria-hidden="true"><line x1="32" y1="6" x2="32" y2="14" stroke="#33264f" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="6" r="4" fill="#ff6fa5"/><rect x="8" y="14" width="48" height="38" rx="14" fill="#9fd8ff" stroke="#33264f" stroke-width="3"/><rect x="2" y="26" width="6" height="14" rx="3" fill="#ffd24a" stroke="#33264f" stroke-width="2"/><rect x="56" y="26" width="6" height="14" rx="3" fill="#ffd24a" stroke="#33264f" stroke-width="2"/><rect x="15" y="22" width="34" height="22" rx="10" fill="#fff" stroke="#33264f" stroke-width="2"/><g class="eyes"><ellipse cx="25" cy="32" rx="4" ry="5" fill="#33264f"/><ellipse cx="39" cy="32" rx="4" ry="5" fill="#33264f"/></g><circle cx="19" cy="39" r="3" fill="#ff9ac1" opacity=".8"/><circle cx="45" cy="39" r="3" fill="#ff9ac1" opacity=".8"/><path d="M27 40q5 5 10 0" fill="none" stroke="#33264f" stroke-width="2.5" stroke-linecap="round"/><rect x="20" y="52" width="24" height="8" rx="4" fill="#ffd24a" stroke="#33264f" stroke-width="2"/></svg>`;
function toast(m){const e=$('#toast');e.textContent=m;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,6000)}
function sure(msg,yes){const o=$('#onb');o.innerHTML=`<div class="box modal"><h2>${esc(msg)}</h2><p><button class="g" id="sn">Cancel</button><button id="sy">Yes</button></p></div>`;$('#sn').onclick=()=>o.innerHTML='';$('#sy').onclick=()=>{o.innerHTML='';yes()}}
/* ---- AI client: talks to our own Node backend (POST /api/ai) ---- */
async function callAI(prompt,onText){
  const r=await fetch('/api/ai',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d.error||('Server error '+r.status));
  if(onText)onText({text:d.text});
  return d.text;
}
let _ai=null;
async function getAI(){
  if(_ai)return _ai;
  try{const h=await (await fetch('/api/health')).json();if(!h.ai)return null}catch(e){return null}
  const sm=async(msgs,opt={})=>({text:await callAI(msgs[msgs.length-1].content,opt.onText)});
  sm.json=async prompt=>{const t=await callAI(prompt);const m=t.match(/\{[\s\S]*\}/);if(!m)throw new Error('AI did not return JSON');return JSON.parse(m[0])};
  return _ai=sm;
}
const noAI=()=>toast('AI is off. Add ANTHROPIC_API_KEY to backend/.env and restart the server.');
const aiErr=e=>'AI problem: '+((e&&(e.message||e.code))||'please try again');

/* ---------- views ---------- */
let B=null,CI=0,CH=null,pg=1,pdf=null,busy=false,want=null,tool='h',col='#ffe14d',brk;
const pdfs={},pdfName={};
function view(v){['lib','map','hub','reader'].forEach(x=>$('#'+x).hidden=x!==v);$('#drawer').classList.remove('on');$('#ctx').hidden=true;chip();if(v!=='reader')clearTimeout(brk)}
function home(){B=null;view('lib');$('#ttl').textContent='My Shelf';U()?lib():onb()}
function lib(){
  const u=U(),mine=BOOKS.filter(b=>u.books.includes(b.id)),rest=BOOKS.filter(b=>!u.books.includes(b.id));
  const ts=mine.reduce((a,b)=>a+stars(b),0),tl=mine.reduce((a,b)=>a+left(b),0);
  $('#sum').innerHTML=`<div class="stat">${u.av}<br><em>${esc(u.name)}</em></div><div class="stat">Stars<br><em>★ ${ts}</em></div><div class="stat">Days left<br><em>${days(tl)}</em></div><div class="stat">Today<br><em>${todayN()}/${S.ppd}</em> pages</div><div class="bar" style="flex-basis:100%;margin:2px 0"><i style="width:${Math.min(100,todayN()/S.ppd*100)}%"></i></div><div class="bubble" style="flex-basis:100%">${todayN()>=S.ppd?'🎉 Daily target done! Proud of you!':`${S.ppd-todayN()} more page${S.ppd-todayN()>1?'s':''} to hit today’s target. You can do it 💪`}</div>`;
  statsUI();$('#cards').innerHTML=mine.map(b=>{const p=Math.round(done(b)/b.n*100);
    return `<div class="box card" style="--c:${b.c}"><div class="row"><h2>${b.name}</h2><span class="stat"><em>${st(stars(b))}</em></span></div>`+
    (p>=100?`<div class="msg" style="margin-top:8px">★ COMPLETE!</div>`:`<div class="bar"><i style="width:${p}%"></i></div><div class="row"><span>${p}% · ${days(b.n)} days for the book</span><span><b>${days(left(b))}</b> left</span></div>`)+
    `<p><button data-o="${b.id}">${p?'Open map':'Start'}</button> <button class="g" data-h="${b.id}">Notes & quiz</button> <button class="g" data-r="${b.id}">Remove</button></p></div>`}).join('')+
    (rest.length?`<div class="box card"><h2>＋ Add a book</h2>${rest.map(b=>`<p><button class="g" data-a="${b.id}">${b.name} · ${days(b.n)} days</button></p>`).join('')}</div>`:'');
  $$('[data-o]').forEach(x=>x.onclick=()=>openMap(x.dataset.o));
  $$('[data-h]').forEach(x=>x.onclick=()=>openHub(x.dataset.h));
  $$('[data-a]').forEach(x=>x.onclick=()=>{u.books.push(x.dataset.a);save();openMap(x.dataset.a)});
  $$('[data-r]').forEach(x=>x.onclick=()=>sure('Remove this book from your shelf? Your progress is kept if you add it again.',()=>{u.books=u.books.filter(i=>i!==x.dataset.r);save();lib()}));
}

/* ---------- avatars ---------- */
function onb(){
  const o=$('#onb');
  o.innerHTML=`<div class="box modal"><h2>Name your avatar</h2><p><input id="nm" class="txt" maxlength="14" placeholder="Your name"></p><p style="display:flex;gap:8px;flex-wrap:wrap">${AV.map((a,i)=>`<span class="av${i?'':' sel'}" data-i="${i}">${a}</span>`).join('')}</p><button id="go1">Next ▶</button>${S.users.length?'<button class="g" id="cx">Cancel</button>':''}</div>`;
  let sel=0;$$('.av').forEach(a=>a.onclick=()=>{$$('.av').forEach(x=>x.classList.remove('sel'));a.classList.add('sel');sel=+a.dataset.i});
  if($('#cx'))$('#cx').onclick=()=>o.innerHTML='';
  $('#go1').onclick=()=>{const nm=$('#nm').value.trim();if(!nm){$('#nm').focus();return}
    const u={id:'u'+Date.now(),name:nm,av:AV[sel]};fixUser(u);S.users.push(u);S.cur=u.id;save();
    o.innerHTML=`<div class="box modal"><h2>Hi ${esc(nm)}! Choose a book to start</h2>${BOOKS.map(b=>`<p><button class="g" data-b="${b.id}">${b.name} · ${days(b.n)} days</button></p>`).join('')}</div>`;
    $$('#onb [data-b]').forEach(x=>x.onclick=()=>{u.books.push(x.dataset.b);save();o.innerHTML='';openMap(x.dataset.b)})};
}
function who(){
  const o=$('#onb');o.innerHTML=`<div class="box modal"><div class="row"><h2>Who’s studying?</h2><button class="g ib" id="cx" aria-label="Close">✕</button></div><p>${S.users.map(u=>`<button class="${u.id===S.cur?'':'g'}" data-u="${u.id}">${u.av} ${esc(u.name)}</button>`).join('')}</p><button class="ok ib" id="add2" title="Add avatar" aria-label="Add avatar">＋</button></div>`;
  $('#cx').onclick=()=>o.innerHTML='';$('#add2').onclick=onb;
  $$('#onb [data-u]').forEach(x=>x.onclick=()=>{S.cur=x.dataset.u;save();o.innerHTML='';home()});
}
function findBook(){
  const o=$('#onb');o.innerHTML=`<div class="box modal"><div class="row"><h2>Find a book</h2><button class="g ib" id="cx" aria-label="Close">✕</button></div><p><input id="sq" class="txt" placeholder="Search books…"></p><div id="sr"></div></div>`;
  const draw=()=>{const q=$('#sq').value.toLowerCase(),u=U();$('#sr').innerHTML=BOOKS.filter(b=>(b.name+b.sub).toLowerCase().includes(q)).map(b=>`<p><button class="${u.books.includes(b.id)?'':'g'}" data-b="${b.id}">${u.books.includes(b.id)?'Open · ':'＋ '}${b.name} · ${days(b.n)} days</button></p>`).join('')||'<p class="mut">No book found.</p>';
    $$('#sr [data-b]').forEach(x=>x.onclick=()=>{if(!u.books.includes(x.dataset.b)){u.books.push(x.dataset.b);save()}o.innerHTML='';openMap(x.dataset.b)})};
  $('#sq').oninput=draw;$('#cx').onclick=()=>o.innerHTML='';draw();$('#sq').focus();
}
function menu(){
  const u=U();$('#ppd').value=S.ppd;ppdUI();palMark();$('#mavi').textContent=u.av+' '+u.name;$('#tv').textContent=document.documentElement.dataset.theme==='dark'||(!S.theme&&matchMedia('(prefers-color-scheme:dark)').matches)?'Dark':'Light';
  $('#mbooks').innerHTML='<button class="g" data-all="1">All my books</button>'+BOOKS.filter(b=>u.books.includes(b.id)).map(b=>`<button class="g" data-b="${b.id}">📖 ${b.name}</button>`).join('');
  $$('#mbooks [data-all]').forEach(x=>x.onclick=home);$$('#mbooks [data-b]').forEach(x=>x.onclick=()=>openHub(x.dataset.b));
  $('#drawer').classList.add('on');
}

/* ---------- map ---------- */
async function openMap(id){
  B=BOOKS.find(b=>b.id===id);view('map');$('#ttl').textContent=B.name;const M=$('#map');
  const u=U(),f=pos(B)?U().pos[id]:0,n=B.ch.length,H=n*86+170,P=i=>{const y=H-85-i*86;return [180+Math.sin(i*1.25)*Math.min(105,(y-50)*.5),y]};
  const k=B.ch.findIndex(c=>f<c.e),cur=k<0?n-1:k,all=k<0,p=Math.round(done(B)/B.n*100);
  const msg=all?'🏆 You reached the summit!':p>=50?'Halfway there!! Keep going!':`Level ${cur+1} of ${n}: tap the glowing one!`;
  let d='M180 '+(H-25);for(let i=0;i<n;i++)d+='L'+P(i).join(' ');d+='L180 72';
  let tr='';for(let j=0;j<n*2;j++){const y=H-40-j*42,hw=Math.max(10,(y-50)*.6),x=180+hw*.85*(((j*37)%100)/50-1);tr+=`<polygon points="${x-9},${y} ${x},${y-22} ${x+9},${y}" fill="#3f8f5a"/>`}
  const cl=[[60,.25],[295,.45],[65,.65],[300,.85]].map(([x,r])=>`<g fill="#fff" opacity=".9"><ellipse cx="${x}" cy="${H*r}" rx="34" ry="13"/><ellipse cx="${x+18}" cy="${H*r-8}" rx="20" ry="12"/></g>`).join('');
  const nodes=B.ch.map((c,i)=>{const [x,y]=P(i),s=f>=c.e?'d':i===cur?'c':'l',r=x<180,t=esc(c[1].slice(0,16)),w=t.length*7.4+20,qs=u.qs[id+':'+i]||0;
    return `<g class="nd ${s}" data-i="${i}">${s==='d'?`<line x1="${x}" y1="${y-20}" x2="${x}" y2="${y-54}" stroke="#33264f" stroke-width="3"/><polygon points="${x},${y-54} ${x+26},${y-46} ${x},${y-38}" fill="#4fbf84"/><text x="${x}" y="${y+40}" text-anchor="middle" style="fill:#ffb400;font-size:14px">${st(qs)}</text>`:''}<circle cx="${x}" cy="${y}" r="22" class="cd"/><circle cx="${x-7}" cy="${y-8}" r="5" fill="#fff" opacity=".5"/><text x="${x}" y="${y+7}" text-anchor="middle" style="fill:#fff;font-size:20px;font-weight:700">${i+1}</text><rect x="${r?x+30:x-30-w}" y="${y-13}" width="${w}" height="26" rx="13" fill="#fff" opacity=".93"/><text x="${r?x+40:x-20-w}" y="${y+5}" style="fill:#33264f;font-size:14px">${t}</text></g>`}).join('');
  const at=u.at[id]??0,tf=([x,y])=>`translate(${x}px,${y-32}px)`;
  M.innerHTML=`<div class="box card" style="--c:${B.c}"><div class="row"><b>${p}% · ${days(left(B))} days left</b><span class="stat"><em>${st(stars(B))}</em></span></div><div class="bar"><i style="width:${p}%"></i></div><div class="bubble">${msg}</div></div>
  <svg viewBox="0 0 360 ${H}"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3ff"/><stop offset="1" stop-color="#e9f8ff"/></linearGradient><linearGradient id="mg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef4f8"/><stop offset=".2" stop-color="#9fb8cc"/><stop offset=".5" stop-color="#6fae8a"/><stop offset="1" stop-color="#4f9a6a"/></linearGradient></defs>
  <rect width="360" height="${H}" fill="url(#sk)"/>${cl}<polygon points="-40,${H} 60,${H*.38} 180,${H}" fill="#b9d8c8"/><polygon points="170,${H} 300,${H*.3} 400,${H}" fill="#a9cdbb"/>
  <polygon points="-30,${H} 180,50 390,${H}" fill="url(#mg)"/><polygon points="180,50 138,122 160,108 180,126 200,108 222,122" fill="#fff"/>${tr}
  <path d="${d}" fill="none" stroke="#f3deb0" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="2 9" stroke-linecap="round" stroke-linejoin="round"/>
  <line x1="180" y1="50" x2="180" y2="16" stroke="#33264f" stroke-width="3"/><polygon points="180,16 214,26 180,36" fill="#ffd24a"/><text x="180" y="10" text-anchor="middle" style="font-size:22px">🏆</text>
  ${nodes}<g id="avg" style="transform:${tf(P(Math.min(at,cur)))};transition:transform .8s ease-in-out"><ellipse cx="0" cy="34" rx="14" ry="5" fill="#000" opacity=".2"/><g id="avw"><text text-anchor="middle" y="0" style="font-size:34px">${u.av}</text></g></g></svg>`;
  $$('#map .nd.d,#map .nd.c').forEach(g=>g.onclick=()=>{const i=+g.dataset.i,c=B.ch[i];openBook(B.id,g.classList.contains('c')&&f>=c[0]?f:c[0],i)});
  $('#avg').scrollIntoView({block:'center'});
  if(at<cur){await sleep(600);$('#avw').classList.add('walk');for(let i=at+1;i<=cur;i++){$('#avg').style.transform=tf(P(i));await sleep(900)}$('#avw').classList.remove('walk');if(cur-at>1)toast('Nice climb! Rest a moment ☕');u.at[id]=cur;save()}
}

/* ---------- reader ---------- */
function openBook(id,p,ci){
  B=BOOKS.find(b=>b.id===id);CI=ci??Math.max(0,B.ch.findIndex(c=>(p||pos(B)||B.s)<=c.e));CH=B.ch[CI];pdf=pdfs[id]||null;
  pg=Math.max(CH[0],Math.min(CH.e,p||CH[0]));
  view('reader');$('#ttl').textContent=B.name;$('#chn').textContent=`${CI+1}: ${CH[1]}`;$('#fname').textContent=(pdfName[id]||'').slice(0,26);
  $('#sumbox').hidden=true;$('#tools').hidden=true;$('#ed').classList.remove('on');$('#reader').dataset.t='pdf';tabs();
  renderList($('#nlr'),id);go(pg);startBreak();
}
function tabs(){const t=$('#reader').dataset.t;$('#sPdf').className=t==='pdf'?'':'g';$('#sNotes').className=t==='notes'?'':'g'}
function startBreak(){clearTimeout(brk);brk=setTimeout(()=>{toast(['Take a break, dear ☕ Stretch and sip some water.','Buddy, you need a break 💧 Rest your eyes for 5 minutes.'][Math.random()*2|0]);startBreak()},25*60000)}
function go(p){
  pg=Math.max(CH[0],Math.min(CH.e,Math.round(p)||CH[0]));const u=U();
  const old=u.pos[B.id]||0;if(old<pg){u.pos[B.id]=pg;bumpDaily(old<CH[0]-1?1:Math.min(pg-old,5));save()}
  $('#cnt').textContent=`${pg}/${CH.e}`;$('#next').textContent=pg>=CH.e?'🏁':'▶';$('#next').title=pg>=CH.e?'Finish chapter':'Next page';$('#prev').disabled=pg<=CH[0];draw();chip();
}
const next=()=>pg>=CH.e?finish():go(pg+1);
const ann=()=>{const u=U(),k=B.id+':'+pg;return u.ann[k]=u.ann[k]||[]};
function paintAnn(ov,x){const c=ov.getContext('2d'),W=ov.width,H=ov.height;c.clearRect(0,0,W,H);
  ann().concat(x?[x]:[]).forEach(a=>{c.save();c.lineWidth=3*(W/700);c.lineCap=c.lineJoin='round';c.strokeStyle=c.fillStyle=a.c;
    if(a.t==='h'){c.globalCompositeOperation='multiply';c.globalAlpha=.7;c.fillRect(a.x*W,a.y*H,a.w*W,a.h*H)}
    else if(a.t==='u'){c.beginPath();c.moveTo(a.x*W,a.y*H);c.lineTo((a.x+a.w)*W,a.y*H);c.stroke()}
    else{c.beginPath();a.p.forEach(([px,py],i)=>i?c.lineTo(px*W,py*H):c.moveTo(px*W,py*H));c.stroke()}c.restore()})}
const editing=()=>!$('#tools').hidden;
function bindAnn(ov){let s=null,pts=[];ov.style.pointerEvents=editing()?'auto':'none';
  const pos2=e=>{const r=ov.getBoundingClientRect();return[(e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height]};
  const mk=q=>{const x=Math.min(s[0],q[0]),y=Math.min(s[1],q[1]),w=Math.abs(q[0]-s[0]),h=Math.abs(q[1]-s[1]);
    if(tool==='h')return w>.004&&h>.002?{t:'h',c:col,x,y,w,h}:null;
    if(tool==='u')return w>.01?{t:'u',c:col,x,y:q[1],w}:null;
    return pts.length>1?{t:'p',c:col,p:pts.map(p=>[+p[0].toFixed(4),+p[1].toFixed(4)])}:null};
  ov.onpointerdown=e=>{ov.setPointerCapture(e.pointerId);s=pos2(e);pts=[s]};
  ov.onpointermove=e=>{if(!s)return;const q=pos2(e);pts.push(q);paintAnn(ov,mk(q))};
  ov.onpointerup=e=>{if(!s)return;const a=mk(pos2(e));s=null;if(a){ann().push(a);save()}paintAnn(ov)}}
async function draw(){
  const pv=$('#pv');
  if(!pdf){pv.innerHTML=`<div class="box empty"><h2>Open your book</h2><p>Press <b>Open PDF</b> and choose <i>${B.name}</i>. It stays on your device.</p><p class="mut">Use ◀ ▶ or the arrow keys to flip pages. Flip past the last page (🏁) to finish the chapter and start the recap and quiz.</p></div>`;return}
  if(busy){want=pg;return}busy=true;
  try{
    const page=await pdf.getPage(pg),w=Math.max(200,Math.min(pv.clientWidth-24,900)),v0=page.getViewport({scale:1}),sc=w/v0.width,dpr=window.devicePixelRatio||1,v=page.getViewport({scale:sc*dpr});
    const cv=document.createElement('canvas');cv.width=v.width;cv.height=v.height;cv.style.width=v.width/dpr+'px';
    await page.render({canvasContext:cv.getContext('2d'),viewport:v}).promise;
    const wrap=document.createElement('div');wrap.className='pw';wrap.style.width=cv.style.width;
    const ov=document.createElement('canvas');ov.className='ov';ov.width=cv.width;ov.height=cv.height;ov.style.width=cv.style.width;ov.style.height=cv.style.height||(v.height/dpr+'px');
    wrap.append(cv,ov);pv.replaceChildren(wrap);paintAnn(ov);bindAnn(ov);pv.scrollTop=0;
  }catch(e){pv.innerHTML='<div class="box empty">Could not draw this page.</div>'}
  busy=false;if(want&&want!==pg){want=null;draw()}else want=null;
}
function etbInit(){const T=$('#tools'),ov=()=>$('.ov');
  $('#ed').onclick=()=>{T.hidden=!T.hidden;$('#ed').classList.toggle('on',!T.hidden);if(ov())ov().style.pointerEvents=editing()?'auto':'none'};
  $$('#tools [data-t]').forEach(b=>b.onclick=()=>{tool=b.dataset.t;$$('#tools [data-t]').forEach(x=>{x.classList.toggle('on',x===b);x.classList.toggle('g',x!==b)})});
  $$('#tools [data-c]').forEach(b=>b.onclick=()=>{col=b.dataset.c;$$('#tools [data-c]').forEach(x=>x.classList.toggle('on',x===b))});
  $('#aund').onclick=()=>{ann().pop();save();if(ov())paintAnn(ov())};
  $('#aclr').onclick=()=>sure('Clear all marks on this page?',()=>{ann().length=0;save();if(ov())paintAnn(ov())})}

/* ---------- chapter summary ---------- */
const gload=()=>{try{return JSON.parse(localStorage.getItem('synergy-guides')||'{}')}catch(e){return{}}},gsave=g=>{try{localStorage.setItem('synergy-guides',JSON.stringify(g))}catch(e){}};
async function chapText(bk,ci){const d=pdfs[bk.id],c=bk.ch[ci];
  if(!d){const g=gload()[bk.id+':'+ci];return g&&g.sum?g.sum.join(' '):''}
  let s='';for(let q=c[0];q<=c.e;q++){try{const g=await d.getPage(q),tc=await g.getTextContent();s+=tc.items.map(i=>i.str).join(' ')+' '}catch(e){}}
  if(s.length>9000){let o='';const L=s.length;for(let i=0;i<10;i++)o+=s.slice(Math.floor(i*L/10),Math.floor(i*L/10)+900)+' … ';s=o}return s}
function sumUI(){const s=$('#sumbox'),k=B.id+':'+CI,g=gload()[k];
  s.innerHTML=g&&g.sum?`<b>📌 Summary</b><ul>${g.sum.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`:`<b>📌 Chapter summary</b><p class="mut">A quick summary to read before the pages.</p><button id="gs">✨ Summarise this chapter</button>`;
  if($('#gs'))$('#gs').onclick=genSum}
async function genSum(){
  const bk=B,ci=CI,c=CH,k=bk.id+':'+ci,s=$('#sumbox'),sm=await getAI();if(!sm)return noAI();
  s.innerHTML='<b>✍️ Summarising this chapter…</b>';
  try{const tx=await chapText(bk,ci);const d=await sm.json(`Summarise chapter ${ci+1} "${c[1]}" of the textbook "${bk.name}" for an IT student to read before the chapter. ${tx?'Excerpts from the chapter:\n'+tx+'\n':''}Return ONLY JSON: {"sum":[6 short key-point strings]}`,{cache:false});
    if(!d||!Array.isArray(d.sum)||!d.sum.length)throw new Error('empty answer');const G=gload();G[k]={...(G[k]||{}),sum:d.sum.map(String)};gsave(G)}
  catch(e){toast(aiErr(e))}
  if(B===bk&&CI===ci)sumUI()}

/* ---------- notes ---------- */
const log=id=>{const u=U();if(!u.log[id])u.log[id]=[];return u.log[id]};
const noteText=id=>log(id).map(e=>e.k==='i'?'[photo]':(e.k==='q'?'Q: ':e.k==='a'?'AI: ':'')+e.x).join('\n\n');
function renderList(el,id){el.dataset.b=id;const L=log(id);
  el.innerHTML=L.length?L.map((e,i)=>`<div class="e ${e.k}${e.imp?' imp':''}" data-i="${i}"${e.k==='n'?' contenteditable="true" spellcheck="true"':''}>${e.k==='i'?`<img src="${e.x}" alt="note photo">`:e.k==='a'?`<span class="rb">${ROBO(26)}</span><span class="at">${esc(e.x)}</span>`:esc(e.x)}</div>`).join(''):`<p class="mut">${ROBO(40)}<br>Type a note below, or ask AI a question. Everything saves by itself. Tap a note to edit, press and hold or right-click for more.</p>`;
  el.scrollTop=el.scrollHeight}
function bindList(el){let lp;
  const idx=t=>{const e=t.closest&&t.closest('.e');return e?+e.dataset.i:-1};
  el.addEventListener('input',e=>{const i=idx(e.target);if(i<0)return;const L=log(el.dataset.b);if(L[i]){L[i].x=e.target.closest('.e').innerText;clearTimeout(bindList.t);bindList.t=setTimeout(save,400)}});
  el.addEventListener('contextmenu',e=>{const i=idx(e.target);if(i<0)return;e.preventDefault();ctx(e.clientX,e.clientY,el,i)});
  el.addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;const i=idx(e.target);if(i<0)return;const x=e.clientX,y=e.clientY;lp=setTimeout(()=>ctx(x,y,el,i),600)});
  ['pointerup','pointermove','pointercancel'].forEach(n=>el.addEventListener(n,()=>clearTimeout(lp)))}
function ctx(x,y,el,i){ctxT=Date.now();const L=log(el.dataset.b),m=$('#ctx');m.innerHTML=`<button class="g" id="cimp">${L[i].imp?'☆ Remove important':'★ Mark important'}</button><button class="g" id="cdel">🗑 Delete</button>`;m.hidden=false;m.style.left=Math.min(x,innerWidth-190)+'px';m.style.top=Math.min(y,innerHeight-110)+'px';
  $('#cimp').onclick=()=>{L[i].imp=!L[i].imp;save();m.hidden=true;renderList(el,el.dataset.b)};$('#cdel').onclick=()=>{L.splice(i,1);save();m.hidden=true;renderList(el,el.dataset.b)}}
let ctxT=0;document.addEventListener('click',e=>{if(Date.now()-ctxT>500&&!e.target.closest('#ctx'))$('#ctx').hidden=true});
const redraw=()=>{const el=$('#nlr');if(B&&el)renderList(el,B.id)};
function addNote(){const v=$('#nin').value.trim();if(!v||!B)return;log(B.id).push({k:'n',x:v});$('#nin').value='';save();redraw()}
async function askAI(){
  const q=$('#nin').value.trim();if(!q){toast('Type your question first, then tap AI');return}
  const sm=await getAI();if(!sm)return noAI();
  const bk=B,L=log(bk.id),a={k:'a',x:'Thinking…',tmp:1};$('#nin').value='';L.push({k:'q',x:q},a);redraw();
  const live=t=>{const e=$(`#nlr .e[data-i="${L.indexOf(a)}"]`),s=e&&e.querySelector('.at');if(s)s.textContent=t};
  try{const r=await sm([{role:'user',content:`You are a friendly study helper for an IT student reading "${bk.name}", chapter "${CH?CH[1]:''}", around page ${pg}. Answer in at most 40 words, in simple English, as plain text with no markdown and no lists.\n\nQuestion: ${q}`}],{cache:false,onText:({text})=>{a.x=text;live(text)}});a.x=r.text}
  catch(e){a.x=aiErr(e)}
  delete a.tmp;save();if(B===bk)redraw()}
function addImage(f){const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{const m=Math.min(1,700/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*m;c.height=im.height*m;c.getContext('2d').drawImage(im,0,0,c.width,c.height);log(B.id).push({k:'i',x:c.toDataURL('image/jpeg',.6)});save();redraw()};im.onerror=()=>toast('That image could not be read.');im.src=r.result};r.readAsDataURL(f)}
function addTextFile(f){const r=new FileReader();r.onload=()=>{log(B.id).push({k:'n',x:String(r.result).slice(0,20000)});save();redraw()};r.readAsText(f)}
function buildPdf(id){
  const {jsPDF}=window.jspdf,doc=new jsPDF({unit:'pt',format:'a4'}),W=doc.internal.pageSize.getWidth(),H=doc.internal.pageSize.getHeight(),m=48,cw=W-2*m;let y=m;
  const clean=s=>String(s).replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[•●]/g,'-').replace(/[–—]/g,'-').replace(/…/g,'...').replace(/[^\x09\x0A\x20-\x7E\xA0-\xFF]/g,'');
  const need=h=>{if(y+h>H-m){doc.addPage();y=m}};
  const bk=BOOKS.find(b=>b.id===id);
  doc.setFont('helvetica','bold');doc.setFontSize(20);doc.setTextColor(51,38,79);doc.text(clean(bk.name+' - Notes'),m,y);y+=20;
  doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setTextColor(130);doc.text(clean(U().name+'  |  '+new Date().toLocaleDateString()),m,y);y+=26;
  log(id).forEach(e=>{
    if(e.k==='i'){try{const p=doc.getImageProperties(e.x);let w=Math.min(cw,p.width),h=w*p.height/p.width;if(h>H-2*m){h=H-2*m;w=h*p.width/p.height}need(h+12);doc.addImage(e.x,'JPEG',m,y,w,h);y+=h+14}catch(x){}return}
    const pre=e.k==='q'?'Q: ':e.k==='a'?'AI: ':e.imp?'* ':'';
    doc.setFontSize(11);const L=doc.splitTextToSize(clean(pre+e.x),cw-20),lh=15;
    for(let i=0;i<L.length;){const room=Math.max(1,Math.floor((H-m-y-10)/lh));if(room<2&&y>m+40){doc.addPage();y=m;continue}const part=L.slice(i,i+room);
      if(e.k==='n'){doc.setFillColor(255,246,196);doc.roundedRect(m,y-12,cw,part.length*lh+10,6,6,'F')}
      doc.setFont('helvetica',e.k==='q'?'bold':'normal');if(e.k==='q')doc.setTextColor(255,111,165);else doc.setTextColor(e.k==='a'?60:51,e.k==='a'?60:38,e.k==='a'?60:79);
      doc.text(part,m+10,y);y+=part.length*lh+10;i+=part.length;if(i<L.length){doc.addPage();y=m}}
    y+=4});
  return doc}
async function shareNotes(){if(!log(B.id).length)return toast('No notes to share yet.');
  try{if(window.jspdf&&navigator.canShare){const blob=buildPdf(B.id).output('blob'),file=new File([blob],(B.name+' notes').replace(/[^\w\- ]+/g,'')+'.pdf',{type:'application/pdf'});if(navigator.canShare({files:[file]})){await navigator.share({files:[file],title:B.name+' notes'});return}}
    if(navigator.share){await navigator.share({title:B.name+' notes',text:noteText(B.id)});return}}catch(e){if(e&&e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(noteText(B.id));toast('Notes copied. Paste them anywhere to share.')}catch(e){toast('Sharing is blocked here. Use the download button.')}}
function downloadNotes(){if(!log(B.id).length)return toast('No notes to download yet.');
  const o=$('#onb'),def=(B.name+' notes').replace(/[^\w\- ]+/g,'').trim();
  o.innerHTML=`<div class="box modal"><h2>Download notes as PDF</h2><p class="mut">Choose a name for your file. Photos are included.</p><p><input id="fn" class="txt" value="${esc(def)}" maxlength="60" aria-label="File name"></p><button class="g" id="fc">Cancel</button><button id="fo">⤓ Download PDF</button></div>`;
  $('#fc').onclick=()=>o.innerHTML='';$('#fn').select();
  const run=async()=>{const nm=($('#fn').value.replace(/\.pdf$/i,'').replace(/[\\/:*?"<>|]+/g,'-').trim())||'notes';
    if(!window.jspdf)return toast('The PDF maker did not load. Check your internet and try again.');
    const d={save:async({filename,data})=>{const a=document.createElement('a');a.href=URL.createObjectURL(data);a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)}};
    try{const blob=buildPdf(B.id).output('blob');o.innerHTML='';await d.save({filename:nm+'.pdf',data:blob})}catch(e){toast('Could not make the PDF: '+((e&&e.message)||e))}};
  $('#fo').onclick=run;$('#fn').onkeydown=e=>{if(e.key==='Enter')run()}}

/* ---------- recap + quiz ---------- */
async function finish(){
  if($('#onb').firstChild)return;const u=U();u.pos[B.id]=Math.max(u.pos[B.id]||0,CH.e);save();chip();recapQuiz(B,CI)}
async function recapQuiz(bk,ci){
  const o=$('#onb'),c=bk.ch[ci];
  o.innerHTML=`<div class="box modal big"><h2>🚩 Chapter ${ci+1} done!</h2><p>Preparing your recap and quiz…</p></div>`;
  let data=null;const sm=await getAI();
  if(sm){try{const tx=await chapText(bk,ci);data=await sm.json(`You help an IT student revise. Book: "${bk.name}". Chapter ${ci+1}: "${c[1]}".\n${tx?'Excerpts from the chapter:\n'+tx+'\n':''}Return ONLY JSON: {"recap":[5 to 7 short key-point strings],"quiz":[5 objects like {"q":"question","o":["A","B","C","D"],"a":0,"why":"one short sentence"}]} where "a" is the index (0-3) of the correct option.`,{cache:false})}catch(e){toast(aiErr(e))}}
  const ok=data&&Array.isArray(data.recap)&&Array.isArray(data.quiz)&&data.quiz.length;
  const mine=ok?[]:log(bk.id).filter(e=>e.k==='n').map(e=>e.x.slice(0,200));
  o.innerHTML=`<div class="box modal big"><h2>🚩 Chapter ${ci+1} done! ${esc(c[1])}</h2><h2 style="margin-top:10px">📌 Quick recap</h2><ul>${(ok?data.recap:mine).map(x=>`<li>${esc(x)}</li>`).join('')||'<li class="mut">No recap yet. Your notes will show here.</li>'}</ul>
  ${ok?'<button class="g" id="rsv">＋ Save recap to notes</button><button id="rq">⏱ Start quiz</button>':'<p class="mut">The recap and quiz need the AI key set on the backend (see README).</p>'}<button class="g" id="rmap">🗺 Back to map</button></div>`;
  $('#rmap').onclick=()=>{o.innerHTML='';openMap(bk.id)};
  if(ok){$('#rsv').onclick=()=>{log(bk.id).push({k:'n',x:'Recap, chapter '+(ci+1)+':\n• '+data.recap.join('\n• ')});save();toast('Saved to your notes');$('#rsv').disabled=true};$('#rq').onclick=()=>runQuiz(data.quiz.slice(0,5).map(q=>({q:String(q.q),o:q.o.map(String),a:+q.a,why:String(q.why||'')})),bk,ci)}
}
function runQuiz(Q,bk,ci){
  let i=0,score=0,tm;const o=$('#onb'),u=U(),key=bk.id+':'+ci;
  const ask=()=>{if(i>=Q.length)return end();const q=Q[i];let t=20;
    o.innerHTML=`<div class="box modal big"><div class="row"><b>Question ${i+1}/${Q.length}</b><b id="tm">⏱ 20</b></div><div class="bar"><i id="tb" style="width:100%"></i></div><h2 style="margin-top:12px">${esc(q.q)}</h2>${q.o.map((x,j)=>`<button class="g opt" data-j="${j}">${esc(x)}</button>`).join('')}<div id="fb"></div></div>`;
    const lock=j=>{clearInterval(tm);$$('#onb .opt').forEach((b,k)=>{b.disabled=true;b.style.opacity=1;if(k===q.a)b.style.background='#b8f0c8';else if(k===j)b.style.background='#ffc1cf'});
      if(j===q.a)score++;else if(!u.mist.some(m=>m.q===q.q))u.mist.push({bk:bk.id,ci,...q});save();
      $('#fb').innerHTML=`<p>${j===q.a?'✅ Correct!':j<0?'⏰ Time’s up!':'❌ Not quite.'} ${esc(q.why)}</p><button class="g" id="star">${u.imp.some(m=>m.q===q.q)?'★ Important':'☆ Mark important'}</button><button id="nx">${i+1<Q.length?'Next ▶':'See result'}</button>`;
      $('#star').onclick=()=>{const k=u.imp.findIndex(m=>m.q===q.q);if(k>=0)u.imp.splice(k,1);else u.imp.push({bk:bk.id,ci,...q});save();$('#star').textContent=k>=0?'☆ Mark important':'★ Important'};$('#nx').onclick=()=>{i++;ask()}};
    $$('#onb .opt').forEach(b=>b.onclick=()=>lock(+b.dataset.j));
    tm=setInterval(()=>{t--;$('#tm').textContent='⏱ '+t;$('#tb').style.width=t/20*100+'%';if(t<=0)lock(-1)},1000)};
  const end=()=>{const s=score>=Q.length*.8?3:score>=Q.length*.6?2:1;u.qs[key]=Math.max(u.qs[key]||0,s);u.hist[key]={s:score,n:Q.length,d:Date.now()};u.qd[key]=Q;save();chip();
    o.innerHTML=`<div class="box modal big"><h2>${score}/${Q.length} correct</h2><p class="stat"><em>${st(s)}</em></p><p>${s===3?'Amazing! Chapter mastered 🎉':s===2?'Good job! Review your notes and try again for 3 stars.':'Keep going! Re-read the recap and try again.'}</p><button id="rt">↻ Try again</button><button class="ok" id="rm">🗺 Back to map</button></div>`;
    $('#rt').onclick=()=>{i=0;score=0;ask()};$('#rm').onclick=()=>{o.innerHTML='';openMap(bk.id)}};
  ask()}

/* ---------- book hub: notes / pdf / quiz ---------- */
let hubTab='notes';
function openHub(id,t){B=BOOKS.find(b=>b.id===id);hubTab=t||hubTab;view('hub');$('#ttl').textContent=B.name;renderHub()}
function renderHub(){
  const u=U(),h=$('#hub');
  h.innerHTML=`<div class="tabs">${[['notes','📝 Notes'],['pdf','📖 PDF'],['quiz','🎯 Quiz']].map(([k,l])=>`<button class="${k===hubTab?'':'g'}" data-t="${k}">${l}</button>`).join('')}<button class="g" id="hmap">🗺 Map</button></div><div id="hb"></div>`;
  $$('#hub [data-t]').forEach(b=>b.onclick=()=>{hubTab=b.dataset.t;renderHub()});$('#hmap').onclick=()=>openMap(B.id);
  const hb=$('#hb'),f=pos(B)?u.pos[B.id]:0;
  if(hubTab==='notes'){hb.innerHTML='<div class="box pad"><h2>Notes and conversations</h2><div class="nl" id="hn" style="padding:10px 0;max-height:none"></div></div>';const el=$('#hn');renderList(el,B.id);bindList(el)}
  if(hubTab==='pdf'){hb.innerHTML=B.ch.map((c,i)=>{const d=f>=c.e,cur=!d&&(i===0||f>=B.ch[i-1].e);return `<div class="box item" style="${d||cur?'':'opacity:.6'}"><span>${d?'✅':cur?'▶️':'🔒'} <b>${i+1}.</b> ${esc(c[1])}<br><span class="mut">pages ${c[0]}–${c.e} · ${(c.e-c[0]+1)/S.ppd<1?'&lt;1':Math.ceil((c.e-c[0]+1)/S.ppd)} day(s) · ${d?'attended':cur?'up next':'future'}</span></span>${d||cur?`<button data-c="${i}">${d?'Review':'Read'}</button>`:''}</div>`}).join('');
    $$('#hb [data-c]').forEach(b=>b.onclick=()=>{const i=+b.dataset.c;openBook(B.id,B.ch[i][0],i)})}
  if(hubTab==='quiz'){
    const att=B.ch.map((c,i)=>[i,c,u.hist[B.id+':'+i]]),ms=u.mist.filter(m=>m.bk===B.id),im=u.imp.filter(m=>m.bk===B.id);
    const qcard=(m,t)=>`<div class="box item"><span><b>Ch ${m.ci+1}:</b> ${esc(m.q)}<br><span class="mut">Answer: ${esc(m.o[m.a])}. ${esc(m.why)}</span></span><button class="g" data-x="${t}" data-q="${esc(m.q)}" aria-label="Remove">✕</button></div>`;
    hb.innerHTML=`<h2>✅ Attended quizzes</h2>${att.filter(x=>x[2]).map(([i,c,r])=>`<div class="box item"><span><b>${i+1}.</b> ${esc(c[1])}<br><span class="mut">${r.s}/${r.n} · ${st(u.qs[B.id+':'+i]||0)} · ${new Date(r.d).toLocaleDateString()}</span></span><button data-rq="${i}">Retake</button></div>`).join('')||'<p class="mut">None yet. Finish a chapter to take its quiz.</p>'}
    <h2 style="margin-top:18px">🔜 Future quizzes</h2>${att.filter(x=>!x[2]).map(([i,c])=>{const d=f>=c.e;return `<div class="box item"><span><b>${i+1}.</b> ${esc(c[1])}<br><span class="mut">${d?'Chapter read. Quiz not taken yet':'Unlocks when you finish this chapter'}</span></span>${d?`<button data-mq="${i}">Take quiz</button>`:'<span>🔒</span>'}</div>`}).join('')||'<p class="mut">All quizzes taken. 🎉</p>'}
    <h2 style="margin-top:18px">❌ Mistakes</h2>${ms.map(m=>qcard(m,'m')).join('')||'<p class="mut">No mistakes saved. Wrong answers will show here.</p>'}
    <h2 style="margin-top:18px">★ Important</h2>${im.map(m=>qcard(m,'i')).join('')||'<p class="mut">Tap ☆ Mark important during a quiz to keep a question here.</p>'}`;
    $$('#hb [data-rq]').forEach(b=>b.onclick=()=>{const i=+b.dataset.rq;runQuiz(u.qd[B.id+':'+i],B,i)});
    $$('#hb [data-mq]').forEach(b=>b.onclick=()=>recapQuiz(B,+b.dataset.mq));
    $$('#hb [data-x]').forEach(b=>b.onclick=()=>{const L=b.dataset.x==='m'?u.mist:u.imp,k=L.findIndex(m=>m.q===b.dataset.q);if(k>=0)L.splice(k,1);save();renderHub()})}
}

/* ---------- stats ---------- */
const ymd=(d=new Date())=>d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
function statsUI(){const u=U(),el=$('#stats');if(!el)return;
  const mine=BOOKS.filter(b=>u.books.includes(b.id)),pages=mine.reduce((a,b)=>a+done(b),0);
  let streak=0,d=new Date();if(!u.days[ymd(d)])d.setDate(d.getDate()-1);while(u.days[ymd(d)]>0){streak++;d.setDate(d.getDate()-1)}
  const qs=Object.values(u.hist),avg=qs.length?Math.round(qs.reduce((a,r)=>a+r.s/r.n,0)/qs.length*100):0,notes=Object.values(u.log).flat().filter(e=>e.k==='n').length;
  const week=[...Array(7)].map((_,i)=>{const x=new Date();x.setDate(x.getDate()-(6-i));return{n:u.days[ymd(x)]||0,l:x.toLocaleDateString(undefined,{weekday:'short'}),t:i===6}});
  const mx=Math.max(S.ppd,...week.map(w=>w.n),1);
  el.innerHTML=`<div class="row"><h2>📊 Your stats</h2><span class="mut">${streak?`🔥 ${streak}-day streak, keep it going!`:'Read a page today to start a streak 🌱'}</span></div>
  <div class="mini"><div>📖<b>${pages}</b>pages read</div><div>🔥<b>${streak}</b>day streak</div><div>🎯<b>${qs.length}</b>quizzes${qs.length?' · avg '+avg+'%':''}</div><div>📝<b>${notes}</b>notes</div></div>
  <div class="chart">${week.map(w=>`<div class="col${w.t?' t':''}" title="${w.n} pages"><div class="b" style="height:${w.n/mx*100}%"></div></div>`).join('')}<div class="tl" style="bottom:${S.ppd/mx*100}%"></div></div>
  <div class="lab">${week.map(w=>`<span>${w.l}<br><b>${w.n}</b></span>`).join('')}</div><p class="mut" style="margin:6px 0 0;font-size:14px">Dashed line = your daily target (${S.ppd} pages)</p>`}

/* ---------- daily target ---------- */
const todayN=()=>{const u=U();return u.daily.d===new Date().toDateString()?u.daily.n:0};
function bumpDaily(n){const u=U(),k=new Date().toDateString();if(u.daily.d!==k)u.daily={d:k,n:0};const b=u.daily.n;u.daily.n+=n;const dk=ymd();u.days[dk]=(u.days[dk]||0)+n;if(b<S.ppd&&u.daily.n>=S.ppd)toast('🎉 Daily target reached! You did it, I’m proud of you!')}
function cheer(n){return n<=5?`Gentle start 🌱 Add two more pages, you can do it!`:n<=10?`Nice and steady 🙂 A few more pages and you’ll be flying.`:n<=20?`Great target 💪 That’s a solid study habit.`:n<=35?`Ambitious 🔥 Love the energy! Don’t forget your breaks.`:n<=50?`Superstar pace ⭐ Be kind to your eyes and rest well.`:`Whoa, that’s a lot 😅 Slow and steady wins. Maybe start a bit lower?`}
function ppdUI(){const u=U(),tl=BOOKS.filter(b=>u.books.includes(b.id)).reduce((a,b)=>a+left(b),0);$('#ppdv').textContent=S.ppd;$('#ppdc').textContent=cheer(S.ppd);
  $('#ppdf').textContent=tl?`At ${S.ppd} pages a day you finish your books in about ${days(tl)} days (${fin(days(tl))}).`:'All your books are finished! 🏆'}

/* ---------- wiring ---------- */
$('#home').onclick=home;$('#add').onclick=()=>U()?findBook():onb();$('#menu').onclick=()=>U()?menu():onb();$('#dx').onclick=()=>$('#drawer').classList.remove('on');
$('#mshelf').onclick=()=>{const b=$('#mbooks');b.hidden=!b.hidden;$('#arr').textContent=b.hidden?'▾':'▴'};
$('#mtheme').onclick=()=>{const d=document.documentElement.dataset.theme==='dark'||(!S.theme&&matchMedia('(prefers-color-scheme:dark)').matches);S.theme=d?'light':'dark';applyTheme();save();$('#tv').textContent=d?'Light':'Dark'};
$('#mav').onclick=()=>{$('#drawer').classList.remove('on');who()};
$('#ppd').oninput=e=>{S.ppd=+e.target.value;ppdUI();save();if(!$('#lib').hidden)lib()};
$('#back').onclick=()=>openMap(B.id);
$('#prev').onclick=()=>go(pg-1);$('#next').onclick=next;
$('#sPdf').onclick=()=>{$('#reader').dataset.t='pdf';tabs();draw()};$('#sNotes').onclick=()=>{$('#reader').dataset.t='notes';tabs()};
$('#sm').onclick=()=>{const s=$('#sumbox');s.hidden=!s.hidden;if(!s.hidden)sumUI()};
$('#nin').onkeydown=e=>{if(e.key==='Enter')addNote()};$('#nai').onclick=askAI;$('#shr').onclick=shareNotes;$('#dl').onclick=downloadNotes;
$('#plus').onclick=()=>{ctxT=Date.now();const m=$('#ctx'),r=$('#plus').getBoundingClientRect();m.innerHTML='<button class="g" id="p1">🖼 Add image</button><button class="g" id="p2">📎 Add text file</button>';m.hidden=false;m.style.left=r.left+'px';m.style.top=Math.max(8,r.top-100)+'px';
  $('#p1').onclick=()=>{$('#nfile').accept='image/*';$('#nfile').click();m.hidden=true};$('#p2').onclick=()=>{$('#nfile').accept='.txt,text/plain';$('#nfile').click();m.hidden=true}};
$('#nfile').onchange=e=>{const f=e.target.files[0];e.target.value='';if(!f||!B)return;f.type.startsWith('image/')?addImage(f):addTextFile(f)};
$('#file').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f||!B)return;
  try{if(!window.pdfjsLib)throw new Error('the PDF viewer did not load, check your internet');pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const d=await pdfjsLib.getDocument({data:await f.arrayBuffer()}).promise;pdfs[B.id]=d;pdf=d;pdfName[B.id]=f.name;$('#fname').textContent=f.name.slice(0,26);go(pg)}
  catch(err){toast('Could not open that PDF: '+(err.message||err))}};
document.addEventListener('keydown',e=>{if(curViewIsReader()&&!e.target.matches('input,textarea,[contenteditable]')){if(e.key==='ArrowRight')next();if(e.key==='ArrowLeft')go(pg-1)}});
const curViewIsReader=()=>!$('#reader').hidden;
function palMark(){$$('#pals [data-p]').forEach(b=>b.classList.toggle('on',(S.pal||'')===b.dataset.p))}
$$('#pals [data-p]').forEach(b=>b.onclick=()=>{S.pal=b.dataset.p;applyTheme();save();palMark()});
$('#nai').innerHTML=ROBO(32);
bindList($('#nlr'));etbInit();applyTheme();
if(!S.cur||!U())S.cur=S.users.length?S.users[0].id:null;
if(U())home();else{view('lib');onb()}
