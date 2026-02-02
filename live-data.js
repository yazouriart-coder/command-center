// ═══════════════════════════════════════════════
// LIVE DATA FETCH - Henter fra JSON filer
// ═══════════════════════════════════════════════

let liveData = {};
let docLibrary = {};

// ── Hent projekt data ──
async function fetchLiveData() {
  try {
    const response = await fetch('data/overview.json');
    liveData = await response.json();
    updateUIWithLiveData();
    console.log('✅ Live data loaded:', liveData.last_updated);
  } catch (error) {
    console.log('⚠️ Using mock data:', error);
  }
}

// ── Hent dokumentbibliotek ──
async function fetchDocLibrary() {
  try {
    const response = await fetch('data/documents.json');
    docLibrary = await response.json();
    updateDocPanel();
    console.log('📚 Bibliotek loaded:', docLibrary.total_files, 'filer i', docLibrary.categories, 'kategorier');
  } catch (error) {
    console.log('⚠️ Dokumentbibliotek ikke tilgængeligt:', error);
  }
}

// ── Opdater UI med projekt data ──
function updateUIWithLiveData() {
  if (!liveData.projects) return;
  
  // Trading stats (READ-ONLY!)
  if (liveData.projects.trading) {
    const t = liveData.projects.trading;
    const statPnl = document.getElementById('statPnl');
    if (statPnl) statPnl.textContent = t.dagens_pnl;
    const statWin = document.getElementById('statWin');
    if (statWin) statWin.textContent = t.win_rate;
    const statPos = document.getElementById('statPos');
    if (statPos) statPos.textContent = t.aabne_positioner;
  }
}

// ── Opdater dokument-panelet med rigtige filer ──
function updateDocPanel() {
  if (!docLibrary.library) return;
  
  const list = document.getElementById('docList');
  if (!list) return;
  
  let totalCount = 0;
  let html = '';
  
  // Sortér kategorier
  const catOrder = [
    '🚛 MLflyt',
    '🌿 Sacred Pet / Sacred Shop',
    '🗑️ AK Affaldsservice',
    '📈 Trading',
    '🔍 SEO & Marketing',
    '💼 Forretning',
    '🛠️ Tools & Systemer',
    '🧠 Profil & System',
    '📅 Daglige Logs',
    '📁 Andet',
  ];
  
  const tagColors = {
    'md': 'tag-md',
    'html': 'tag-html',
    'json': 'tag-json',
    'py': 'tag-json',
    'js': 'tag-json',
    'pdf': 'tag-pdf',
  };
  
  catOrder.forEach(cat => {
    const items = docLibrary.library[cat];
    if (!items || !items.length) return;
    totalCount += items.length;
    
    html += `<div class="doc-folder">
      <div class="doc-folder-name" onclick="toggleFolder(this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        ${cat} <span style="opacity:.5;font-size:9px;margin-left:4px">(${items.length})</span>
      </div>
      <div class="doc-folder-items">
        ${items.map(doc => {
          const tagClass = tagColors[doc.tag] || 'tag-md';
          const preview = (doc.preview || '').replace(/`/g, "'").replace(/\n/g, '<br>').replace(/# /g, '<h3>').replace(/\|/g, ' ');
          return `
          <div class="doc-item" onclick="openDoc(this,'${doc.name.replace(/'/g,"\\'")}','<h2>${doc.name.replace(/'/g,"\\'")}</h2><p style=\\'color:var(--text-dim);font-size:11px\\'>📁 ${doc.path} · ${doc.size_kb} KB · ${new Date(doc.modified).toLocaleDateString("da-DK")}</p><hr style=\\'border-color:var(--border);margin:10px 0\\'><pre style=\\'white-space:pre-wrap;font-size:12px;line-height:1.6\\'>${preview}</pre>')">
            <svg class="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            ${doc.name}
            <span class="doc-tag ${tagClass}">${doc.tag.toUpperCase()}</span>
          </div>`;
        }).join('')}
      </div>
    </div>`;
  });
  
  // Også kategorier der ikke er i catOrder
  Object.keys(docLibrary.library).forEach(cat => {
    if (catOrder.includes(cat)) return;
    const items = docLibrary.library[cat];
    if (!items || !items.length) return;
    totalCount += items.length;
    
    html += `<div class="doc-folder">
      <div class="doc-folder-name" onclick="toggleFolder(this)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
        ${cat} <span style="opacity:.5;font-size:9px;margin-left:4px">(${items.length})</span>
      </div>
      <div class="doc-folder-items">
        ${items.map(doc => `
          <div class="doc-item" onclick="openDoc(this,'${doc.name.replace(/'/g,"\\'")}','<h2>${doc.name.replace(/'/g,"\\'")}</h2><p style=\\'color:var(--text-dim)\\'>📁 ${doc.path}</p>')">
            <svg class="doc-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            ${doc.name}
            <span class="doc-tag tag-md">${doc.tag.toUpperCase()}</span>
          </div>
        `).join('')}
      </div>
    </div>`;
  });
  
  list.innerHTML = html;
  
  // Opdater tæller
  const countEl = document.getElementById('docCount');
  if (countEl) countEl.textContent = totalCount;
  
  // Gør søgning aktiv på rigtige docs
  const searchInput = document.getElementById('docSearch');
  if (searchInput) {
    searchInput.oninput = function(e) {
      const q = e.target.value.toLowerCase();
      document.querySelectorAll('.doc-item').forEach(item => {
        const name = item.textContent.toLowerCase();
        item.style.display = (!q || name.includes(q)) ? '' : 'none';
      });
      document.querySelectorAll('.doc-folder').forEach(folder => {
        const visibleItems = folder.querySelectorAll('.doc-item:not([style*="display: none"])');
        folder.style.display = visibleItems.length ? '' : 'none';
      });
    };
  }
}

// ── Chat med live data ──
const originalProcessCommand = typeof processCommand === 'function' ? processCommand : null;

function processCommandLive(cmd) {
  const lower = cmd.toLowerCase();
  
  // MLflyt med live data
  if (lower.includes('@mlflyt') && liveData.projects?.mlflyt) {
    const m = liveData.projects.mlflyt;
    return `🚛 <strong>MLflyt Status (LIVE)</strong><br><br>
    📊 GEO Sider: ${m.geo_sider.faerdige}/${m.geo_sider.total} (${m.geo_sider.procent}%)<br>
    📈 SEO Ranking: "flyttefirma aarhus" #${m.seo_ranking.flyttefirma_aarhus}<br>
    💼 Nye leads: ${m.nye_leads}<br>
    ✅ Status: ${m.status}<br><br>
    <em>Sidst opdateret: ${new Date(m.last_updated).toLocaleTimeString('da-DK')}</em>`;
  }
  
  // Sacred Pet med live data
  if (lower.includes('@sacred') && liveData.projects?.sacred) {
    const s = liveData.projects.sacred;
    return `🌿 <strong>Sacred Pet Status (LIVE)</strong><br><br>
    📦 Filer: ${s.filer.length} filer (${s.storrelse_kb} KB)<br>
    ✅ Status: ${s.status}<br>
    📋 Mangler:<br>
    ${s.mangler.map(m => '• ' + m).join('<br>')}<br><br>
    <em>Sidst opdateret: ${new Date(s.last_updated).toLocaleTimeString('da-DK')}</em>`;
  }
  
  // Trading med live data (READ-ONLY!)
  if (lower.includes('@trading') && liveData.projects?.trading) {
    const t = liveData.projects.trading;
    return `📈 <strong>Trading Bot Status (LIVE)</strong><br><br>
    🔒 ${t.warning}<br><br>
    💰 Kapital: $${t.kapital}<br>
    📊 Dagens P&L: ${t.dagens_pnl}<br>
    🎯 Win Rate: ${t.win_rate}<br>
    🔄 Åbne positioner: ${t.aabne_positioner}<br><br>
    <strong>Positioner:</strong><br>
    ${t.positioner.map(p => '• ' + p.symbol + ' ' + p.direction + ' @ ' + p.entry).join('<br>')}<br><br>
    <em>Sidst opdateret: ${new Date(t.last_updated).toLocaleTimeString('da-DK')}</em>`;
  }
  
  // Dokumentbibliotek
  if (lower.includes('bibliotek') || lower.includes('docs') || lower.includes('filer')) {
    if (docLibrary.library) {
      let response = `📚 <strong>Dokumentbibliotek</strong><br><br>`;
      response += `📁 ${docLibrary.total_files} filer i ${docLibrary.categories} kategorier<br><br>`;
      Object.keys(docLibrary.library).forEach(cat => {
        response += `${cat}: ${docLibrary.library[cat].length} filer<br>`;
      });
      response += `<br><em>Brug søgefeltet til venstre for at finde filer!</em>`;
      return response;
    }
  }
  
  // Fallback
  if (originalProcessCommand) return originalProcessCommand(cmd);
  return null;
}

// Override processCommand hvis den eksisterer
if (typeof processCommand !== 'undefined') {
  processCommand = processCommandLive;
}

// ── Ghetto Status → Bot Face ──
let ghettoStatus = {};

async function fetchGhettoStatus() {
  try {
    const response = await fetch('data/ghetto-status.json');
    ghettoStatus = await response.json();
    updateBotFace();
    console.log('🤖 Ghetto status:', ghettoStatus.mood, '-', ghettoStatus.task);
  } catch (error) {
    console.log('⚠️ Ghetto status ikke tilgængeligt:', error);
  }
}

function updateBotFace() {
  if (!ghettoStatus.mood) return;
  
  // Brug setBotMood fra index.html (allerede defineret)
  if (typeof setBotMood === 'function') {
    setBotMood(ghettoStatus.mood);
  }
  
  // Opdater status tekst
  const label = document.getElementById('botStatusLabel');
  const task = document.getElementById('botStatusTask');
  if (label && ghettoStatus.status) label.textContent = ghettoStatus.status;
  if (task && ghettoStatus.task) task.textContent = ghettoStatus.task;
  
  // Opdater historik i notifikationer
  if (ghettoStatus.history && ghettoStatus.history.length) {
    const notifList = document.getElementById('notifList');
    if (notifList) {
      const moodToType = { working: 'info', thinking: 'warn', happy: 'success', idle: 'info' };
      const histHtml = ghettoStatus.history.map(h => `
        <div class="notif-item">
          <span class="notif-dot ${moodToType[h.mood] || 'info'}"></span>
          <span class="notif-text"><strong>Ghetto:</strong> ${h.action}</span>
          <span class="notif-time">${h.time}</span>
        </div>
      `).join('');
      notifList.innerHTML = histHtml;
    }
  }
}

// ── Start alt ──
fetchLiveData();
fetchDocLibrary();
fetchGhettoStatus();

// Refresh intervaller
setInterval(fetchLiveData, 30000);
setInterval(fetchDocLibrary, 60000);
setInterval(fetchGhettoStatus, 10000);  // Tjek hvert 10. sekund for hurtig reaktion

console.log('🔌 Live data + dokumentbibliotek + Ghetto face connector loaded!');
