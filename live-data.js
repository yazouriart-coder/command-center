
// ═══════════════════════════════════════════════
// LIVE DATA FETCH - Henter fra JSON filer
// ═══════════════════════════════════════════════

let liveData = {};

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

function updateUIWithLiveData() {
  if (!liveData.projects) return;
  
  // Update MLflyt stats
  if (liveData.projects.mlflyt) {
    const mlflyt = liveData.projects.mlflyt;
    console.log('🚛 MLflyt:', mlflyt.geo_sider.faerdige, '/', mlflyt.geo_sider.total);
  }
  
  // Update Sacred Pet stats  
  if (liveData.projects.sacred) {
    const sacred = liveData.projects.sacred;
    console.log('🌿 Sacred:', sacred.status);
  }
  
  // Update Trading stats (READ-ONLY!)
  if (liveData.projects.trading) {
    const trading = liveData.projects.trading;
    console.log('📈 Trading:', trading.aabne_positioner, 'positioner');
    console.log('🔒', trading.warning);
    
    // Update trading panel with real data
    const statPnl = document.getElementById('statPnl');
    if (statPnl) statPnl.textContent = trading.dagens_pnl;
    
    const statWin = document.getElementById('statWin');
    if (statWin) statWin.textContent = trading.win_rate;
    
    const statPos = document.getElementById('statPos');
    if (statPos) statPos.textContent = trading.aabne_positioner;
  }
}

// Fetch data on load
fetchLiveData();

// Refresh every 30 seconds
setInterval(fetchLiveData, 30000);

// ═══════════════════════════════════════════════
// CHAT RESPONSES - Med live data
// ═══════════════════════════════════════════════

const originalProcessCommand = processCommand;
processCommand = function(cmd) {
  const lower = cmd.toLowerCase();
  
  // Override med live data
  if (lower.includes('@mlflyt') && liveData.projects?.mlflyt) {
    const m = liveData.projects.mlflyt;
    return `🚛 <strong>MLflyt Status (LIVE)</strong><br><br>
    📊 GEO Sider: ${m.geo_sider.faerdige}/${m.geo_sider.total} (${m.geo_sider.procent}%)<br>
    📈 SEO Ranking: "flyttefirma aarhus" #${m.seo_ranking.flyttefirma_aarhus}<br>
    💼 Nye leads: ${m.nye_leads}<br>
    ✅ Status: ${m.status}<br><br>
    <em>Sidst opdateret: ${new Date(m.last_updated).toLocaleTimeString()}</em>`;
  }
  
  if (lower.includes('@sacred') && liveData.projects?.sacred) {
    const s = liveData.projects.sacred;
    return `🌿 <strong>Sacred Pet Status (LIVE)</strong><br><br>
    📦 Filer: ${s.filer.length} filer (${s.storrelse_kb} KB)<br>
    ✅ Status: ${s.status}<br>
    📋 Mangler:<br>
    ${s.mangler.map(m => `• ${m}`).join('<br>')}<br><br>
    <em>Sidst opdateret: ${new Date(s.last_updated).toLocaleTimeString()}</em>`;
  }
  
  if (lower.includes('@trading') && liveData.projects?.trading) {
    const t = liveData.projects.trading;
    return `📈 <strong>Trading Bot Status (LIVE)</strong><br><br>
    🔒 ${t.warning}<br><br>
    💰 Kapital: $${t.kapital}<br>
    📊 Dagens P&L: ${t.dagens_pnl}<br>
    🎯 Win Rate: ${t.win_rate}<br>
    🔄 Åbne positioner: ${t.aabne_positioner}<br><br>
    <strong>Positioner:</strong><br>
    ${t.positioner.map(p => `• ${p.symbol} ${p.direction} @ ${p.entry}`).join('<br>')}<br><br>
    <em>Sidst opdateret: ${new Date(t.last_updated).toLocaleTimeString()}</em>`;
  }
  
  // Fallback til original
  return originalProcessCommand(cmd);
};

console.log('🔌 Live data connector loaded!');
