// Leonida Platinum Log — tracker, roadmap, missables and cited guides for the 55 GTA VI PS5 trophies.
// Vanilla JS, offline: the only file it fetches is its own data/trophies.json. Progress lives in localStorage.
const STORE_KEY = 'leonida-platinum-log-v1';
const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };
const GRADE_TOTAL = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
const KIND_LABEL = { story: 'Story', collectibles: 'Collectibles', activities: 'Activity', online: 'Online', completion: 'Completion' };
const MONEY_COUNTS = { 52: true, 53: true };
const STAGES = {
  1: ['Stage 1 — Opening & Chapters 1–2', 'Story first: the opening mission, Chapters 1–2 and Breakfast Run. Bank strand work as it appears.'],
  2: ['Stage 2 — Chapters 3–4, missions & strand finales', 'Named missions and strand finales, including the four strands confirmed to count toward Strangers & Freaks. Strands persist into post-story free roam [2], so this stage is about order, not deadlines — the run’s one possible missable sits in Chapter 1, not here.'],
  3: ['Stage 3 — Finale & 100% completion', 'The final mission, then the completion counter chased to 100%. Nothing optional may be left open behind you.'],
  4: ['Stage 4 — Collectibles & the whole map', 'Meditation spots, card sets, WAiNK locations, vehicles and all 52 areas of Leonida, swept region by region.'],
  5: ['Stage 5 — Activities & skill', 'Shooting Range golds, races, stunts, challenges and the one-off activity tests, taken with a full arsenal.'],
  6: ['Stage 6 — Cleanup: money, property & moments', 'Spending, laundering, garages and app registrations — plus the one-off moments, and the platinum at the end.'],
};
const FILTERS = [
  ['all', 'All'], ['story', 'Story'], ['missable', 'Possibly missable'], ['collectibles', 'Collectibles'],
  ['activities', 'Activities'], ['online', 'Online'], ['unearned', 'Not earned'],
];
const DEMO_EARNED = [2, 3, 4, 8, 9, 16, 20, 21, 29, 44];
const DEMO_COUNTS = { 25: 3, 28: 6, 35: 34, 17: 9, 42: 11, 31: 20, 15: 40 };

const params = new URLSearchParams(location.search);
let trophies = [];
let byId = {};
let state = loadState();
let view = params.get('view') || 'tracker';
let filter = 'all';
let query = '';
let openId = Number(params.get('open')) || 25;

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (raw && raw.earned) return { earned: raw.earned, counts: raw.counts || {}, spoiler: !!raw.spoiler };
  } catch (e) { /* fresh start */ }
  return { earned: {}, counts: {}, spoiler: false };
}
function saveState() { localStorage.setItem(STORE_KEY, JSON.stringify(state)); }
if (params.get('demo') === '1') {
  state = { earned: {}, counts: { ...DEMO_COUNTS }, spoiler: params.get('spoiler') === '1' };
  for (const id of DEMO_EARNED) state.earned[id] = true;
}
if (params.get('spoiler') === '1') state.spoiler = true;

function isEarned(t) { return !!state.earned[t.id]; }
function isMasked(t) { return state.spoiler && t.kind === 'story' && !isEarned(t); }
function shownName(t) { return isMasked(t) ? 'Story trophy — hidden by the spoiler shield' : t.name; }
function shownDesc(t) { return isMasked(t) ? 'Hidden by the spoiler shield until earned.' : t.description; }
function fmtCount(t, v) { return (MONEY_COUNTS[t.id] ? '$' : '') + v.toLocaleString('en-US'); }
function countOf(t) { return state.counts[t.id] || 0; }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
function roadmapOrder(a, b) { return a.stage - b.stage || a.id - b.id; }

function renderHeader() {
  const earned = trophies.filter(isEarned).length;
  document.getElementById('earned-count').textContent = earned + ' / 55 earned';
  const parts = [];
  for (const g of ['platinum', 'gold', 'silver', 'bronze']) {
    parts.push(GRADE_LETTER[g] + ' ' + trophies.filter((t) => t.grade === g && isEarned(t)).length + '/' + GRADE_TOTAL[g]);
  }
  const strands = countOf(byId[25] || { id: 25 });
  document.getElementById('grade-counts').textContent = parts.join(' · ') + ' · ' + strands + ' of 8 stranger strands banked';
  document.getElementById('progress-fill').style.width = (earned / 55 * 100).toFixed(1) + '%';
  document.getElementById('spoiler-check').checked = state.spoiler;
}

function matchesFilter(t) {
  if (filter === 'story' && t.kind !== 'story') return false;
  if (filter === 'missable' && !t.missable && !t.possiblyMissable) return false;
  if (filter === 'collectibles' && t.kind !== 'collectibles') return false;
  if (filter === 'activities' && t.kind !== 'activities') return false;
  if (filter === 'online' && t.kind !== 'online') return false;
  if (filter === 'unearned' && isEarned(t)) return false;
  if (query) {
    const hay = (t.name + ' ' + t.description + ' ' + t.kind).toLowerCase();
    if (!hay.includes(query.toLowerCase())) return false;
  }
  return true;
}
function filterCount(key) {
  if (key === 'all') return trophies.length;
  if (key === 'missable') return trophies.filter((t) => t.missable || t.possiblyMissable).length;
  if (key === 'unearned') return trophies.filter((t) => !isEarned(t)).length;
  return trophies.filter((t) => t.kind === key).length;
}
function renderChips() {
  document.getElementById('filter-chips').innerHTML = FILTERS.map(([key, label]) =>
    '<button type="button" class="chip' + (filter === key ? ' active' : '') + '" data-filter="' + key + '">' +
    label + '<span class="n">' + filterCount(key) + '</span></button>').join('');
}

function renderList() {
  const shown = trophies.filter(matchesFilter).sort(roadmapOrder);
  document.getElementById('shown-count').textContent = shown.length + ' shown';
  document.getElementById('trophy-list').innerHTML = shown.map((t) => {
    const tags = ['<span class="tag">' + KIND_LABEL[t.kind] + '</span>', '<span class="tag">Stage ' + t.stage + '</span>'];
    if (t.missable) tags.push('<span class="tag missable">MISSABLE</span>');
    if (t.possiblyMissable) tags.push('<span class="tag missable">POSSIBLY MISSABLE</span>');
    if (t.count) tags.push('<span class="tag count">' + fmtCount(t, countOf(t)) + ' / ' + fmtCount(t, t.count) + '</span>');
    return '<div class="trophy-row' + (isEarned(t) ? ' earned' : '') + (t.id === openId ? ' open' : '') + '" data-open="' + t.id + '">' +
      '<input type="checkbox" data-earn="' + t.id + '"' + (isEarned(t) ? ' checked' : '') + ' aria-label="earned">' +
      '<span class="grade-badge grade-' + t.grade + '">' + GRADE_LETTER[t.grade] + '</span>' +
      '<span class="row-main"><span class="row-name">' + esc(shownName(t)) + '</span>' +
      '<span class="row-desc"> ' + esc(shownDesc(t)) + '</span>' +
      '<span class="row-tags">' + tags.join('') + '</span></span></div>';
  }).join('') || '<div class="trophy-row">No trophies match — the official list has no online trophies.</div>';
}

function splitStep(step) {
  const i = step.lastIndexOf('[');
  if (i === -1) return [step, ''];
  return [step.slice(0, i).trim(), step.slice(i)];
}
function renderPanel() {
  const t = byId[openId] || trophies[0];
  const panel = document.getElementById('guide-panel');
  const chips = [
    '<span class="pchip"><strong>' + t.grade + '</strong></span>',
    '<span class="pchip">#' + t.id + ' of 55</span>',
    '<span class="pchip">' + KIND_LABEL[t.kind] + '</span>',
    '<span class="pchip">Roadmap <strong>' + STAGES[t.stage][0].split(' — ')[0] + '</strong></span>',
  ];
  if (t.count) chips.push('<span class="pchip">Count tracked by PlayStation: <strong>' + fmtCount(t, t.count) + '</strong></span>');
  let html = '<div class="panel-head"><span class="grade-badge grade-' + t.grade + '">' + GRADE_LETTER[t.grade] + '</span>' +
    '<h2>' + esc(shownName(t)) + '</h2>' +
    '<button type="button" id="mark-earned" class="' + (isEarned(t) ? 'is-earned' : '') + '" data-earn="' + t.id + '">' +
    (isEarned(t) ? '✓ Earned' : 'Mark earned') + '</button></div>';
  html += '<div class="official-label">OFFICIAL DESCRIPTION</div><p class="official-desc">“' + esc(shownDesc(t)) + '”</p>';
  html += '<div class="panel-chips">' + chips.join('') + '</div>';
  if (t.missable) {
    html += '<div class="missable-box"><strong>⚠ MISSABLE WINDOW — </strong>' + esc(t.missableNote || '') + '</div>';
  }
  if (t.possiblyMissable) {
    html += '<div class="missable-box"><strong>⚠ POSSIBLY MISSABLE — </strong>' + esc(t.missableNote || '') + '</div>';
  }
  if (t.caution) {
    html += '<div class="caution-box"><strong>⏱ TIMING NOTE — </strong>' + esc(t.caution) + '</div>';
  }
  if (t.dispute) {
    html += '<div class="dispute-box"><strong>⚖ SOURCES DIFFER — IS IT MISSABLE?</strong>' +
      '<p><strong>A · </strong>' + esc(t.dispute.a) + '</p>' +
      '<p><strong>B · </strong>' + esc(t.dispute.b) + '</p>' +
      '<p><strong>Our call: </strong>' + esc(t.dispute.call) + '</p></div>';
  }
  if (t.count) {
    const v = countOf(t);
    html += '<div class="count-box"><span class="count-label">YOUR COUNT</span>' +
      '<button type="button" data-count="-1" aria-label="minus">−</button>' +
      '<span class="count-value">' + fmtCount(t, v) + ' / ' + fmtCount(t, t.count) + '</span>' +
      '<button type="button" data-count="1" aria-label="plus">+</button>' +
      '<span class="count-left">' + fmtCount(t, Math.max(0, t.count - v)) + ' to go · saved in this browser</span></div>';
  }
  html += '<p class="guide-intro">' + esc(t.guide) + '</p>';
  html += '<div class="steps-label">HOW TO EARN IT — IN OUR OWN WORDS, EACH STEP WITH ITS SOURCE</div><ol class="steps">' +
    t.steps.map((s) => { const [text, tag] = splitStep(s); return '<li>' + esc(text) + (tag ? ' <span class="src-tag">' + esc(tag) + '</span>' : '') + '</li>'; }).join('') + '</ol>';
  html += '<div class="sources-block"><span class="sources-label">SOURCES FOR THIS GUIDE · </span>' + esc(t.sources) + '</div>';
  panel.innerHTML = html;
}

function renderRail() {
  const next = trophies.filter((t) => !isEarned(t)).sort(roadmapOrder).slice(0, 5);
  document.getElementById('next-up').innerHTML = next.map((t) =>
    '<div class="next-item"><span class="grade-badge grade-' + t.grade + '">' + GRADE_LETTER[t.grade] + '</span>' +
    '<span><span class="n-name">' + esc(shownName(t)) + '</span><br><span class="n-sub">' +
    STAGES[t.stage][0].split(' — ')[0] + ' · ' + KIND_LABEL[t.kind] + (t.missable ? ' · <b style="color:#a03412">MISSABLE</b>' : '') + (t.possiblyMissable ? ' · <b style="color:#a03412">POSSIBLY MISSABLE</b>' : '') +
    (t.count ? ' · ' + fmtCount(t, countOf(t)) + '/' + fmtCount(t, t.count) : '') + '</span></span></div>').join('');
  document.getElementById('stage-progress').innerHTML = Object.keys(STAGES).map((n) => {
    const inStage = trophies.filter((t) => t.stage === Number(n));
    const done = inStage.filter(isEarned).length;
    return '<div class="stage-line"><div class="s-head"><span>' + STAGES[n][0].split(' — ')[0] + '</span><span>' + done + '/' + inStage.length + '</span></div>' +
      '<div class="s-track"><div class="s-fill" style="width:' + (done / inStage.length * 100) + '%"></div></div></div>';
  }).join('');
}

function renderRoadmap() {
  document.getElementById('view-roadmap').innerHTML =
    '<div class="view-intro"><strong>The roadmap to the platinum</strong>, built from the official descriptions and cross-checked against the PowerPyx roadmap [2]: story chapters and missions first, then collectibles and counts, activities, and the money cleanup. Missable flags (⚠) follow the sourced guides, not wording guesses — the list\u2019s one possibly missable trophy is a Chapter 1 meditation, and every strand finale stays available after the story. See Missables.</div>' +
    Object.keys(STAGES).map((n) => {
      const inStage = trophies.filter((t) => t.stage === Number(n)).sort((a, b) => a.id - b.id);
      const done = inStage.filter(isEarned).length;
      return '<div class="stage-card"><h3>' + STAGES[n][0] + ' <span style="color:var(--muted);font-size:12px">· ' + done + '/' + inStage.length + ' earned</span></h3>' +
        '<p class="stage-goal">' + STAGES[n][1] + '</p><div class="stage-trophies">' +
        inStage.map((t) => '<span class="stage-trophy' + (isEarned(t) ? ' done' : '') + '" data-open="' + t.id + '">' +
          '<span class="grade-badge grade-' + t.grade + '">' + GRADE_LETTER[t.grade] + '</span>' + esc(shownName(t)) +
          (t.missable ? '<span class="m-flag">⚠ MISSABLE</span>' : '') +
          (t.possiblyMissable ? '<span class="m-flag">⚠ POSSIBLY MISSABLE</span>' : '') +
          (t.count ? '<span style="color:var(--muted)">' + fmtCount(t, countOf(t)) + '/' + fmtCount(t, t.count) + '</span>' : '') + '</span>').join('') +
        '</div></div>';
    }).join('');
}

function renderMissables() {
  const pma = byId[28];
  const d = (pma && pma.dispute) || {};
  document.getElementById('view-missables').innerHTML =
    '<div class="view-intro"><strong>One possibly missable trophy on the whole list</strong> — and even that one is disputed. The PowerPyx roadmap [2] counts “potentially 1” missable: Positive Mental Attitude, over a Chapter 1 meditation that never comes back. Everything else trophy-related is available again after the story; the only other things that can slip away are timed missions, which lock no trophy by themselves. An earlier version of this guide flagged six strand finales from description wording alone — that was wrong, and this page is the correction.</div>' +
    '<div class="miss-card"><h3><span class="grade-badge grade-' + pma.grade + '">' + GRADE_LETTER[pma.grade] + '</span>' + esc(pma.name) +
    '<span class="tag missable">POSSIBLY MISSABLE</span><span class="tag">Stage ' + pma.stage + '</span>' +
    (pma.count ? '<span class="tag count">' + fmtCount(pma, countOf(pma)) + ' / ' + fmtCount(pma, pma.count) + ' meditations</span>' : '') + '</h3>' +
    '<p class="miss-desc">Official description: “' + esc(pma.description) + '”</p>' +
    '<p class="ponr"><strong>Point of no return: </strong>the end of Chapter 1. The balcony meditation Lucia offers in Jason’s kitchen is permanently unavailable once Chapter 1 ends, and there is no mission replay.</p>' +
    '<p class="ponr"><strong>Sources differ — A: </strong>' + esc(d.a || '') + '</p>' +
    '<p class="ponr"><strong>B: </strong>' + esc(d.b || '') + '</p>' +
    '<p class="ponr"><strong>Our call: </strong>' + esc(d.call || '') + '</p></div>' +
    '<div class="miss-card"><h3>⏱ Timed missions can vanish</h3>' +
    '<p class="ponr">One race inside Yago’s stranger strand (Chapter 3, out of Salton) is a <strong>timed hourglass mission</strong>: leave it sitting and it can disappear. Make a manual save and run it the moment it appears. [3] Shirley’s Rum strand (Chapter 1, a liquor store in the Keys) may be missable <em>content</em> — but it does not count toward Strangers &amp; Freaks and locks no trophy. [3]</p></div>' +
    '<div class="miss-card"><h3>✓ Every other trophy giver comes back</h3>' +
    '<p class="ponr">Strands persist into post-story free roam, so no strand finale — Andy, Kenton, Billy, Randy, Tyrone — can lock you out, whenever you finish it. [2] Our earlier description-only inference, that “final mission” wording meant missable, is corrected here and in every affected guide.</p></div>';
}

function renderSources() {
  document.getElementById('view-sources').innerHTML =
    '<div class="src-section"><h3>The sources</h3>' +
    '<p>Every fact in this guide traces to one of these. The guides are paraphrased in our own words, and the tags in each guide — [1] to [4] — point back to this list. All read 21 Nov 2026.</p><ul>' +
    '<li><strong>[1] PowerPyx</strong> — “GTA 6 All Meditation Spot Locations”: the 10 meditation locations, the per-character counting that makes 18, and the Chapter 1 balcony session.</li>' +
    '<li><strong>[2] PowerPyx</strong> — “GTA 6 Trophy Guide &amp; Roadmap”: the platinum order, post-story availability of strands, and the missable count of “potentially 1”.</li>' +
    '<li><strong>[3] OutputLag</strong> — “GTA 6 Side Missions and Strangers &amp; Freaks List”: which strands count toward Strangers &amp; Freaks, the character locks, and the timed-mission warning.</li>' +
    '<li><strong>[4] GameTrek</strong> — “All Meditation Spot Locations”: the meditation route order, the Ascent Mountain finish, and the balcony counted as one of the 18.</li>' +
    '<li><strong>PlayStation official trophy list</strong> — the 55 names, descriptions, grades and tracked counts (42 Shooting Range challenges, 18 meditations, 52 areas…), shown verbatim, via the <strong>Exophase</strong> GTA VI trophy list. <strong>PSNProfiles</strong> carries no GTA VI guide as of this reading; its list served only as a name cross-check in the first edition.</li></ul></div>' +
    '<div class="src-section"><h3>The method</h3>' +
    '<p><strong>Roadmap:</strong> stages are ordered from the official descriptions — chapters and named missions in story order, then the collectible counts, the activities, and the money-and-property cleanup that a finished story funds — and cross-checked against the PowerPyx roadmap [2].</p>' +
    '<p><strong>Missable flags:</strong> checked against the PowerPyx roadmap [2], which counts exactly one potentially missable trophy — Positive Mental Attitude — and even that is disputed between [1] and [4]; both versions are shown in its guide and on the Missables page. Strands persist into post-story free roam [2]. Timed hourglass missions can vanish [3] but lock no trophy by themselves. The first edition of this guide inferred six missable strand finales from description wording alone; that inference was wrong, and it has been corrected everywhere it appeared.</p>' +
    '<p><strong>Counts:</strong> 19 trophies carry a count PlayStation tracks; each has a +/− tracker here, saved in your browser like the checkboxes.</p>' +
    '<p><strong>Honesty notes:</strong> the official list contains <strong>no online trophies</strong> — the Online filter is included so you can prove it. 28 of the 55 are hidden on PSN until earned; the spoiler shield hides story trophies\u2019 names and descriptions until you earn them. Where our sources disagree, the guide shows both versions instead of picking silently.</p></div>' +
    '<div class="src-section"><h3>The audit</h3>' +
    '<p>55/55 trophies carry their official name, description and grade · 1 platinum, 2 gold, 6 silver, 46 bronze · 55/55 guides written for this entry and citing their sources · 1 possibly missable trophy, disputed, both versions shown · missables per the PowerPyx roadmap [2] · strand counting per OutputLag [3] · this app runs fully offline and fetches nothing.</p></div>';
}

function renderAll() {
  renderHeader(); renderChips(); renderList(); renderPanel(); renderRail();
  renderRoadmap(); renderMissables(); renderSources();
}
function showView(name) {
  view = name;
  for (const v of ['tracker', 'roadmap', 'missables', 'sources']) {
    document.getElementById('view-' + v).hidden = v !== name;
  }
  for (const tab of document.querySelectorAll('#view-tabs .tab')) {
    tab.classList.toggle('active', tab.dataset.view === name);
  }
}

document.addEventListener('click', (e) => {
  const chip = e.target.closest('[data-filter]');
  if (chip) { filter = chip.dataset.filter; renderChips(); renderList(); return; }
  const tab = e.target.closest('#view-tabs .tab');
  if (tab) { showView(tab.dataset.view); return; }
  const earnBox = e.target.closest('[data-earn]');
  if (earnBox && earnBox.id !== 'mark-earned') {
    const id = Number(earnBox.dataset.earn);
    if (earnBox.checked) state.earned[id] = true; else delete state.earned[id];
    saveState(); renderAll(); return;
  }
  const countBtn = e.target.closest('[data-count]');
  if (countBtn) {
    const t = byId[openId];
    const delta = Number(countBtn.dataset.count) * (t.countStep || 1);
    state.counts[t.id] = Math.min(t.count, Math.max(0, countOf(t) + delta));
    if (state.counts[t.id] >= t.count) state.earned[t.id] = true;
    saveState(); renderAll(); return;
  }
  const openEl = e.target.closest('[data-open]');
  if (openEl) {
    openId = Number(openEl.dataset.open);
    if (view !== 'tracker') showView('tracker');
    renderList(); renderPanel();
  }
});
document.addEventListener('change', (e) => {
  if (e.target.id === 'spoiler-check') { state.spoiler = e.target.checked; saveState(); renderAll(); }
});
document.getElementById('guide-panel').addEventListener('click', (e) => {
  if (e.target.id === 'mark-earned') {
    const id = Number(e.target.dataset.earn);
    if (state.earned[id]) delete state.earned[id]; else state.earned[id] = true;
    saveState(); renderAll();
  }
});
document.getElementById('search-box').addEventListener('input', (e) => { query = e.target.value; renderList(); });
document.getElementById('export-btn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ earned: state.earned, counts: state.counts }, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-platinum-log-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
document.getElementById('import-btn').addEventListener('click', () => document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    if (data.earned) state.earned = data.earned;
    if (data.counts) state.counts = data.counts;
    saveState(); renderAll();
  } catch (err) { /* not a progress file: ignore */ }
});

fetch('data/trophies.json').then((r) => r.json()).then((doc) => {
  trophies = doc.trophies;
  byId = {};
  for (const t of trophies) byId[t.id] = t;
  if (!byId[openId]) openId = trophies[0].id;
  renderAll();
  showView(['tracker', 'roadmap', 'missables', 'sources'].includes(view) ? view : 'tracker');
});
