/* ---------------- config ---------------- */
const ADMIN_PASSCODE = "primerenders2026"; // change this before sharing the site publicly

/* ---------------- state ---------------- */
let adminMode = false;
let allProjects = [];
let activeFilter = 'all';

/* ---------------- utils ---------------- */
function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'), 2600);
}
function openModal(id){ document.getElementById(id).classList.add('open'); }
function closeModal(id){ document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('[data-close]').forEach(btn=>{
  btn.addEventListener('click', ()=>closeModal(btn.dataset.close));
});
document.querySelectorAll('.modal-overlay').forEach(ov=>{
  ov.addEventListener('click', e=>{ if(e.target===ov) ov.classList.remove('open'); });
});

/* ---------------- nav ---------------- */
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', ()=>{
  mainNav.classList.toggle('scrolled', window.scrollY > 40);
  updateScrubber();
}, {passive:true});

const burgerBtn = document.getElementById('burgerBtn');
const mobileMenu = document.getElementById('mobileMenu');
burgerBtn.addEventListener('click', ()=>mobileMenu.classList.add('open'));
document.getElementById('mobileCloseBtn').addEventListener('click', ()=>mobileMenu.classList.remove('open'));
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>mobileMenu.classList.remove('open')));

/* ---------------- reveal on scroll ---------------- */
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in-view'); io.unobserve(e.target); } });
}, {threshold:.15});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));

/* ---------------- scrubber ---------------- */
const scenes = [
  {id:'hero', label:'HERO'}, {id:'about', label:'ABOUT'}, {id:'services', label:'SERVICES'},
  {id:'skills', label:'SKILLS'}, {id:'work', label:'PORTFOLIO'}, {id:'results', label:'RESULTS'},
  {id:'different', label:'DIFFERENT'}, {id:'workflow', label:'WORKFLOW'}, {id:'clients', label:'CLIENTS'},
  {id:'packages', label:'PACKAGES'}, {id:'testimonials', label:'TESTIMONIALS'}, {id:'contact', label:'CONTACT'}
];
const TOTAL_SECONDS = 260; // fictional 04:20 runtime
function fmt(s){ const m=Math.floor(s/60), sec=Math.floor(s%60); return String(m).padStart(2,'0')+':'+String(sec).padStart(2,'0'); }
function updateScrubber(){
  const doc = document.documentElement;
  const pct = Math.min(1, window.scrollY / (doc.scrollHeight - window.innerHeight));
  document.getElementById('scrubberFill').style.width = (pct*100)+'%';
  document.getElementById('scrubberHead').style.left = (pct*100)+'%';
  document.getElementById('scrubberTime').textContent = fmt(pct*TOTAL_SECONDS)+' / '+fmt(TOTAL_SECONDS);
  let current = scenes[0].label;
  for(const s of scenes){
    const el = document.getElementById(s.id);
    if(el && el.getBoundingClientRect().top < window.innerHeight*.5) current = s.label;
  }
  document.getElementById('scrubberScene').textContent = 'SCENE: '+current;
}
updateScrubber();

/* ---------------- image resize ---------------- */
function resizeImage(file, maxW=1100, quality=0.82){
  return new Promise((resolve,reject)=>{
    const reader = new FileReader();
    reader.onload = e=>{
      const img = new Image();
      img.onload = ()=>{
        let w=img.width, h=img.height;
        if(w>maxW){ h=Math.round(h*maxW/w); w=maxW; }
        const canvas=document.createElement('canvas');
        canvas.width=w; canvas.height=h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg',quality));
      };
      img.onerror=reject;
      img.src=e.target.result;
    };
    reader.onerror=reject;
    reader.readAsDataURL(file);
  });
}

/* ---------------- storage ----------------
   Uses the browser's localStorage, so on GitHub Pages the project
   list is per-visitor (saved only on the device/browser that added it).
   Projects added by an admin on their own laptop won't appear for
   other visitors unless they're baked into DEFAULT_PROJECTS below,
   or you swap this for a real backend (Firebase, Supabase, etc). */
const STORAGE_KEY = 'primerenders_projects';

// Optional starter projects, always shown to every visitor.
// Edit this array directly in script.js to permanently add work samples.
const DEFAULT_PROJECTS = [
  {
    id: 'business-card-1',
    title: 'Modern Minimal Business Card Design',
    category: 'graphic',
    tag: '.PNG',
    desc: 'Clean, modern design with warm earth-tone colors for a professional, approachable brand identity. Organized for easy readability, includes a QR code for quick access to business info, and is fully print-ready — great for startups, freelancers, and small businesses.',
    thumb: 'Images/business card/PRO 1.png',
    videoUrl: '',
    createdAt: Date.now() - 3000
  },
  {
    id: 'business-card-2',
    title: 'Premium Corporate Business Card',
    category: 'graphic',
    tag: '.PNG',
    desc: 'A premium black and gold business card built for a modern corporate brand — elegant, readable, and luxurious while staying clean and professional. Double-sided design with QR code integration and print-ready formatting, made for businesses that want to leave a lasting first impression.',
    thumb: 'Images/business card/PRO 2.png',
    videoUrl: '',
    createdAt: Date.now() - 2000
  },
  {
    id: 'business-card-3',
    title: 'Purple Business Card',
    category: 'graphic',
    tag: '.PNG',
    desc: 'A modern business card with vibrant purple gradients and a clean, minimalist layout — designed for a fresh, professional look with excellent readability. Fully print-ready and ideal for creative agencies, tech companies, and personal brands wanting a modern visual identity.',
    thumb: 'Images/business card/PRO 3.png',
    videoUrl: '',
    createdAt: Date.now() - 1000
  }
];

async function loadProjects(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    const localProjects = raw ? JSON.parse(raw) : [];
    const merged = [...DEFAULT_PROJECTS, ...localProjects];
    merged.sort((a,b)=> (b.createdAt||0) - (a.createdAt||0));
    return merged;
  }catch(e){ console.error('loadProjects failed', e); return DEFAULT_PROJECTS.slice(); }
}
function getLocalProjects(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){ return []; }
}
async function saveProject(project){
  const projects = getLocalProjects();
  projects.push(project);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}
async function deleteProjectStorage(id){
  const projects = getLocalProjects().filter(x=>x.id!==id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

/* ---------------- render portfolio ---------------- */
const TAGS = {video:'.MP4', graphic:'.PSD', photo:'.JPG'};
function renderPortfolio(){
  const grid = document.getElementById('portfolioGrid');
  grid.innerHTML = '';
  const filtered = activeFilter==='all' ? allProjects : allProjects.filter(p=>p.category===activeFilter);

  filtered.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'project-card';
    card.innerHTML = `
      <div class="thumb-frame">
        ${p.thumb ? `<img src="${p.thumb}" alt="${escapeHtml(p.title)}">` : ''}
        <div class="badge">${p.tag || TAGS[p.category] || ''}</div>
        <div class="play-overlay">
          <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="23" r="22" stroke="#00ABB1" stroke-width="1.5"/><path d="M19 15L31 23L19 31V15Z" fill="#00ABB1"/></svg>
        </div>
        ${adminMode ? `<button class="project-del" data-id="${p.id}">×</button>` : ''}
      </div>
      <div class="project-info">
        <h3>${escapeHtml(p.title)}</h3>
        <p>${escapeHtml(p.desc||'')}</p>
      </div>`;
    card.querySelector('.thumb-frame').addEventListener('click', (e)=>{
      if(e.target.closest('.project-del')) return;
      openProjectView(p);
    });
    const delBtn = card.querySelector('.project-del');
    if(delBtn){
      delBtn.addEventListener('click', async (e)=>{
        e.stopPropagation();
        if(!confirm('Delete "'+p.title+'"? This cannot be undone.')) return;
        try{
          await deleteProjectStorage(p.id);
          allProjects = allProjects.filter(x=>x.id!==p.id);
          renderPortfolio();
          showToast('Project deleted.');
        }catch(err){ showToast('Delete failed — try again.'); }
      });
    }
    grid.appendChild(card);
  });

  if(adminMode){
    const addTile = document.createElement('div');
    addTile.className = 'empty-tile clickable';
    addTile.innerHTML = `<div class="plus">+</div><div>Add New Project</div>`;
    addTile.addEventListener('click', ()=>openAddProject());
    grid.appendChild(addTile);
  }

  if(filtered.length===0 && !adminMode){
    const msg = document.createElement('div');
    msg.className = 'work-empty-msg';
    msg.textContent = 'No cuts logged in this bin yet — check back soon.';
    grid.appendChild(msg);
  }
}
function escapeHtml(str){
  const d = document.createElement('div');
  d.textContent = str||'';
  return d.innerHTML;
}

document.getElementById('filters').addEventListener('click', (e)=>{
  const btn = e.target.closest('.filter-btn');
  if(!btn) return;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  activeFilter = btn.dataset.filter;
  renderPortfolio();
});

/* ---------------- project view modal ---------------- */
function openProjectView(p){
  document.getElementById('pvTitle').textContent = p.title;
  document.getElementById('pvDesc').textContent = p.desc||'';
  const media = document.getElementById('pvMedia');
  media.innerHTML = p.thumb ? `<img src="${p.thumb}">` : '';
  const linkWrap = document.getElementById('pvLinkWrap');
  linkWrap.innerHTML = p.videoUrl ? `<a href="${p.videoUrl}" target="_blank" rel="noopener" class="btn btn-outline">Watch / Open Link</a>` : '';
  openModal('projectViewModal');
}

/* ---------------- add project ---------------- */
function openAddProject(){
  document.getElementById('pfTitle').textContent = 'Add Project';
  document.getElementById('pfName').value = '';
  document.getElementById('pfCategory').value = 'video';
  document.getElementById('pfTag').value = '';
  document.getElementById('pfDesc').value = '';
  document.getElementById('pfThumb').value = '';
  document.getElementById('pfVideoUrl').value = '';
  openModal('projectFormModal');
}
document.getElementById('pfSave').addEventListener('click', async ()=>{
  const title = document.getElementById('pfName').value.trim();
  const category = document.getElementById('pfCategory').value;
  let tag = document.getElementById('pfTag').value.trim();
  const desc = document.getElementById('pfDesc').value.trim();
  const videoUrl = document.getElementById('pfVideoUrl').value.trim();
  const fileInput = document.getElementById('pfThumb');

  if(!title){ showToast('Please add a title.'); return; }
  if(!tag) tag = TAGS[category];

  const saveBtn = document.getElementById('pfSave');
  saveBtn.textContent = 'Saving...';
  saveBtn.disabled = true;

  try{
    let thumb = '';
    if(fileInput.files && fileInput.files[0]){
      thumb = await resizeImage(fileInput.files[0]);
    }
    const project = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,7),
      title, category, tag, desc, videoUrl, thumb,
      createdAt: Date.now()
    };
    await saveProject(project);
    allProjects.unshift(project);
    renderPortfolio();
    closeModal('projectFormModal');
    showToast('Project added.');
  }catch(err){
    console.error(err);
    showToast('Could not save — please try again.');
  }finally{
    saveBtn.textContent = 'Save Project';
    saveBtn.disabled = false;
  }
});

/* ---------------- admin ---------------- */
document.getElementById('adminLoginTrigger').addEventListener('click', (e)=>{
  e.preventDefault();
  document.getElementById('adminPass').value='';
  document.getElementById('adminError').style.display='none';
  openModal('adminModal');
});
document.getElementById('adminSubmit').addEventListener('click', tryAdminLogin);
document.getElementById('adminPass').addEventListener('keydown', (e)=>{ if(e.key==='Enter') tryAdminLogin(); });
function tryAdminLogin(){
  const val = document.getElementById('adminPass').value;
  if(val === ADMIN_PASSCODE){
    adminMode = true;
    document.getElementById('adminBanner').classList.add('show');
    closeModal('adminModal');
    renderPortfolio();
    showToast('Admin mode enabled.');
  }else{
    document.getElementById('adminError').style.display='block';
  }
}
document.getElementById('adminLogoutBtn').addEventListener('click', ()=>{
  adminMode = false;
  document.getElementById('adminBanner').classList.remove('show');
  renderPortfolio();
  showToast('Logged out.');
});

/* ---------------- init ---------------- */
(async function init(){
  allProjects = await loadProjects();
  renderPortfolio();
  updateScrubber();
})();
