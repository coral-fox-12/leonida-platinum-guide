// Leonida Platinum — trophy tracker UI. Plain ES module, no dependencies,
// no network: it reads data/trophies.json next to this file and keeps
// progress in the browser's own localStorage.

const DATA_URL = 'data/trophies.json';
const STORE_KEY = 'leonida-platinum-earned-v1';

const listEl = document.getElementById('trophyList');
const totalsEl = document.getElementById('totals');
const progressBarEl = document.getElementById('progressBar');
const progressTextEl = document.getElementById('progressText');
const countLineEl = document.getElementById('countLine');
const searchEl = document.getElementById('search');
const spoilerEl = document.getElementById('spoilerToggle');
const earnedOnlyEl = document.getElementById('earnedOnlyToggle');
const suggestBtn = document.getElementById('suggestBtn');
const suggestBox = document.getElementById('suggestBox');
const exportBtn = document.getElementById('exportBtn');
const importBtn = document.getElementById('importBtn');
const importFile = document.getElementById('importFile');
const resetBtn = document.getElementById('resetBtn');

let trophies = [];
let activeGrade = 'all';
let activeKind = 'all';

function loadEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) || '[]');
    return new Set(Array.isArray(raw) ? raw.filter((n) => Number.isInteger(n)) : []);
  } catch {
    return new Set();
  }
}

let earned = loadEarned();

function saveEarned() {
  localStorage.setItem(STORE_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

function isStory(t) {
  return t.category === 'story' || t.category === 'mission';
}

function trophyKinds(t) {
  const kinds = [t.category];
  if (t.missable) kinds.push('missable');
  if (t.hidden) kinds.push('story');
  return kinds;
}

function matches(t) {
  const q = searchEl.value.trim().toLowerCase();
  if (q) {
    const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (activeGrade !== 'all' && t.grade !== activeGrade) return false;
  if (activeKind === 'unearned' && earned.has(t.id)) return false;
  if (activeKind === 'missable' && !t.missable) return false;
  if (activeKind === 'collectible' && t.category !== 'collectible') return false;
  if (activeKind === 'activity' && t.category !== 'activity') return false;
  if (activeKind === 'story' && !isStory(t)) return false;
  if (earnedOnlyEl.checked && !earned.has(t.id)) return false;
  if (spoilerEl.checked && t.hidden && !earned.has(t.id)) return false;
  return true;
}

function gradeLabel(g) {
  return g.charAt(0).toUpperCase() + g.slice(1);
}

function render() {
  const visible = trophies.filter(matches);
  const earnedCount = trophies.filter((t) => earned.has(t.id)).length;
  const total = trophies.length || 55;
  const pct = total ? Math.round((earnedCount / total) * 100) : 0;

  totalsEl.innerHTML =
    '<span>' + earnedCount + ' / ' + total + ' earned</span> &middot; ' +
    '1 platinum &middot; 2 gold &middot; 6 silver &middot; 46 bronze';
  progressBarEl.style.width = pct + '%';
  progressTextEl.textContent =
    pct + '% to the platinum' + (earnedCount === total ? ' — Leonida Legend!' : '');

  countLineEl.textContent =
    visible.length === total
      ? 'Showing all ' + total + ' trophies.'
      : 'Showing ' + visible.length + ' of ' + total + ' trophies.';

  if (!visible.length) {
    listEl.innerHTML = '<li class="empty">Nothing matches those filters. Clear the search or pick another filter.</li>';
    return;
  }

  listEl.innerHTML = '';
  for (const t of visible) {
    const li = document.createElement('li');
    li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
    li.dataset.id = String(t.id);

    const head = document.createElement('div');
    head.className = 'trophy-head';
    const name = document.createElement('h3');
    name.className = 'trophy-name';
    name.textContent = t.name;
    const grade = document.createElement('span');
    grade.className = 'grade grade-' + t.grade;
    grade.textContent = gradeLabel(t.grade);
    head.append(name, grade);

    const desc = document.createElement('p');
    desc.className = 'trophy-desc';
    desc.textContent = t.description;

    const guide = document.createElement('p');
    guide.className = 'trophy-guide';
    guide.innerHTML = '<strong>How:</strong> ';
    guide.append(document.createTextNode(t.guide));

    const meta = document.createElement('div');
    meta.className = 'trophy-meta';
    const cat = document.createElement('span');
    cat.className = 'tag';
    cat.textContent = t.category;
    meta.append(cat);
    if (t.missable) {
      const m = document.createElement('span');
      m.className = 'tag missable';
      m.textContent = 'MISSABLE';
      meta.append(m);
    }
    if (t.hidden) {
      const h = document.createElement('span');
      h.className = 'tag hidden-trophy';
      h.textContent = 'story spoiler';
      meta.append(h);
    }

    const source = document.createElement('p');
    source.className = 'trophy-source';
    source.textContent = 'Source: ';
    const link = document.createElement('a');
    link.href = t.source_url;
    link.textContent = t.source;
    link.target = '_blank';
    link.rel = 'noopener';
    source.append(link);

    const foot = document.createElement('div');
    foot.className = 'trophy-foot';
    const btn = document.createElement('button');
    btn.className = 'earn-btn' + (earned.has(t.id) ? ' earned' : '');
    btn.textContent = earned.has(t.id) ? 'Earned ✓' : 'Mark earned';
    btn.addEventListener('click', () => {
      if (earned.has(t.id)) earned.delete(t.id);
      else earned.add(t.id);
      saveEarned();
      render();
    });
    foot.append(btn);

    li.append(head, desc, guide, meta, source, foot);
    listEl.append(li);
  }
}

function bindChips(containerId, attr, setter) {
  document.getElementById(containerId).addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;
    for (const b of ev.currentTarget.querySelectorAll('button')) b.classList.remove('active');
    btn.classList.add('active');
    setter(btn.dataset[attr]);
    render();
  });
}

bindChips('gradeFilters', 'grade', (v) => { activeGrade = v; });
bindChips('kindFilters', 'kind', (v) => { activeKind = v; });

searchEl.addEventListener('input', render);
spoilerEl.addEventListener('change', render);
earnedOnlyEl.addEventListener('change', render);

// Suggest next trophy: the earliest un-earned story trophy first (the
// road to the platinum runs through the story), then the cheapest
// remaining activity or collectible, so the suggestion is always
// something the player can actually go and do next.
suggestBtn.addEventListener('click', () => {
  const remaining = trophies.filter((t) => !earned.has(t.id));
  if (!remaining.length) {
    suggestBox.hidden = false;
    suggestBox.innerHTML = '<strong>Platinum earned.</strong> Every trophy is ticked — Leonida Legend!';
    return;
  }
  // The platinum itself is never a suggestion: it pops on its own once
  // everything else is done.
  const suggestable = remaining.filter((t) => t.grade !== 'platinum');
  const storyNext = suggestable.find((t) => isStory(t));
  const easyNext =
    suggestable.find((t) => t.category === 'activity') ||
    suggestable.find((t) => t.category === 'collectible') ||
    suggestable[0];
  const pick = storyNext || easyNext;
  suggestBox.hidden = false;
  suggestBox.innerHTML = '';
  const strong = document.createElement('strong');
  strong.textContent = 'Next up: ' + pick.name + ' (' + gradeLabel(pick.grade) + '). ';
  suggestBox.append(strong, document.createTextNode(pick.guide));
});

exportBtn.addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ earned: [...earned].sort((a, b) => a - b) }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-platinum-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

importBtn.addEventListener('click', () => importFile.click());
importFile.addEventListener('change', async () => {
  const file = importFile.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const ids = Array.isArray(data.earned) ? data.earned : data;
    earned = new Set(ids.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55));
    saveEarned();
    render();
  } catch {
    alert('That file is not a Leonida Platinum progress export.');
  }
  importFile.value = '';
});

resetBtn.addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveEarned();
    render();
  }
});

// Deep-linking: a URL hash like #grade=silver, #kind=story or #q=meditate
// opens the guide pre-filtered, so a link can point at one slice of it.
function applyHash() {
  const params = new URLSearchParams(location.hash.slice(1));
  const grade = params.get('grade');
  const kind = params.get('kind');
  const q = params.get('q');
  if (grade && ['platinum', 'gold', 'silver', 'bronze'].includes(grade)) {
    activeGrade = grade;
    for (const b of document.querySelectorAll('#gradeFilters button')) {
      b.classList.toggle('active', b.dataset.grade === grade);
    }
  }
  if (kind && ['story', 'missable', 'collectible', 'activity', 'unearned'].includes(kind)) {
    activeKind = kind;
    for (const b of document.querySelectorAll('#kindFilters button')) {
      b.classList.toggle('active', b.dataset.kind === kind);
    }
  }
  if (q) searchEl.value = q;
}

fetch(DATA_URL)
  .then((r) => {
    if (!r.ok) throw new Error('could not load ' + DATA_URL);
    return r.json();
  })
  .then((data) => {
    trophies = Array.isArray(data) ? data : data.trophies;
    applyHash();
    render();
  })
  .catch((err) => {
    listEl.innerHTML = '<li class="empty">Could not load the trophy list: ' + err.message + '</li>';
  });
