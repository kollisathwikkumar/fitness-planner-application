/* ─── Three.js particle + scroll animation engine ─── */
'use strict';

// ── THREE.JS BACKGROUND ──────────────────────────────
(function initThree() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  // ── Particle field ─────────────────────────────────
  const COUNT = 1800;
  const geo   = new THREE.BufferGeometry();
  const pos   = new Float32Array(COUNT * 3);
  const col   = new Float32Array(COUNT * 3);

  // Colour palette: violet / blue / cyan
  const palette = [
    [0.49, 0.23, 0.93], // violet
    [0.15, 0.39, 0.92], // blue
    [0.02, 0.71, 0.84], // cyan
  ];

  for (let i = 0; i < COUNT; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 30;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 20;
    const c = palette[Math.floor(Math.random() * palette.length)];
    col[i * 3]     = c[0];
    col[i * 3 + 1] = c[1];
    col[i * 3 + 2] = c[2];
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color',    new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.055,
    vertexColors: true,
    transparent: true,
    opacity: 0.7,
    sizeAttenuation: true,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // ── Subtle grid of lines ───────────────────────────
  const gridMat = new THREE.LineBasicMaterial({ color: 0x1a1a3a, transparent: true, opacity: 0.5 });
  const gridGeo = new THREE.BufferGeometry();
  const gridVerts = [];
  for (let x = -15; x <= 15; x += 3) {
    gridVerts.push(x, -15, -8,  x, 15, -8);
  }
  for (let y = -15; y <= 15; y += 3) {
    gridVerts.push(-15, y, -8,  15, y, -8);
  }
  gridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridVerts), 3));
  scene.add(new THREE.LineSegments(gridGeo, gridMat));

  // ── Floating rings ─────────────────────────────────
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const rGeo = new THREE.TorusGeometry(3 + i * 2, 0.01, 8, 80);
    const rMat = new THREE.MeshBasicMaterial({
      color: [0x7c3aed, 0x2563eb, 0x06b6d4][i],
      transparent: true,
      opacity: 0.12,
    });
    const ring = new THREE.Mesh(rGeo, rMat);
    ring.rotation.x = Math.PI / (3 + i);
    ring.rotation.y = i * 0.8;
    ring.position.z = -5 - i * 2;
    scene.add(ring);
    rings.push(ring);
  }

  // ── Scroll-driven camera parallax ─────────────────
  let scrollY = 0;
  let mouseX = 0, mouseY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // resize
  window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  // ── Render loop ────────────────────────────────────
  let t = 0;
  (function animate() {
    requestAnimationFrame(animate);
    t += 0.003;

    points.rotation.y = t * 0.06 + mouseX * 0.08;
    points.rotation.x = mouseY * 0.05;

    // scroll parallax
    camera.position.y = -scrollY * 0.002;
    camera.position.x = mouseX * 0.4;

    rings.forEach((r, i) => {
      r.rotation.x += 0.002 + i * 0.001;
      r.rotation.z += 0.001;
    });

    renderer.render(scene, camera);
  })();
})();

// ── NAVBAR SCROLL STATE ──────────────────────────────
(function initNav() {
  const nav = document.getElementById('navbar');
  const ham = document.getElementById('hamburger');
  const links = document.getElementById('nav-links');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });

  if (ham && links) {
    ham.addEventListener('click', () => {
      links.classList.toggle('open');
      const spans = ham.querySelectorAll('span');
      links.classList.contains('open')
        ? (spans[0].style.transform = 'rotate(45deg) translate(5px,5px)',
           spans[1].style.opacity = '0',
           spans[2].style.transform = 'rotate(-45deg) translate(5px,-5px)')
        : (spans[0].style.transform = '',
           spans[1].style.opacity = '',
           spans[2].style.transform = '');
    });
    // close on link click
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        links.classList.remove('open');
        ham.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
      });
    });
  }
})();

// ── SCROLL REVEAL ────────────────────────────────────
(function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();

// ── DIET TABS ────────────────────────────────────────
(function initDietTabs() {
  const tabs   = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.day-panel');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const day = tab.dataset.day;
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById('day-' + day);
      if (panel) {
        panel.classList.add('active');
        // re-trigger reveal animations inside panel
        panel.querySelectorAll('.reveal').forEach(el => {
          el.classList.remove('visible');
          setTimeout(() => el.classList.add('visible'), 30);
        });
      }
    });
  });
})();

// ── VIDEO PLAYLIST ───────────────────────────────────
(function initPlaylist() {
  const items    = document.querySelectorAll('.playlist-item');
  const mainVid  = document.getElementById('main-video');
  const mainTitle = document.getElementById('main-vid-title');
  if (!items.length || !mainVid) return;

  items.forEach(item => {
    item.addEventListener('click', () => {
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const src   = item.dataset.src;
      const title = item.dataset.title;
      mainVid.src = src;
      mainVid.play().catch(() => {});
      if (mainTitle) mainTitle.textContent = title;
    });
  });
})();

// ── NOTES / FITNESS SELF SHEET ───────────────────────
(function initNotes() {
  const STORAGE_KEY = 'fitflow_notes_v2';

  // DOM refs – all optional (only exist on notes.html)
  const titleInput  = document.getElementById('note-title');
  const bodyInput   = document.getElementById('note-body');
  const catSelect   = document.getElementById('note-cat');
  const tagsInput   = document.getElementById('note-tags');
  const charCount   = document.getElementById('char-count');
  const draftsList  = document.getElementById('drafts-list');
  const draftsCount = document.getElementById('drafts-count');
  const searchInput = document.getElementById('drafts-search');
  const editorHeader = document.querySelector('.note-editor-header h3');
  const btnSave     = document.querySelector('.btn-save');
  const btnClear    = document.querySelector('.btn-clear');
  const btnExport   = document.getElementById('btn-export');
  const toast       = document.getElementById('toast');
  const catBtns     = document.querySelectorAll('.cat-btn');

  // If none of the notes UI exists, bail out
  if (!titleInput || !draftsList) return;

  let notes = [];
  let editingId = null;
  let activeCat = 'all';
  let searchQuery = '';

  // ── Helpers ──────────────────────────────────────
  function load() {
    try { notes = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
    catch { notes = []; }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }

  function timeAgo(ts) {
    const diff = Date.now() - ts;
    const m = Math.floor(diff / 60000);
    if (m < 1)  return 'Just now';
    if (m < 60) return m + 'm ago';
    const h = Math.floor(m / 60);
    if (h < 24) return h + 'h ago';
    const d = Math.floor(h / 24);
    return d + 'd ago';
  }

  function catLabel(cat) {
    const map = { goals:'🎯 Goals', workout:'💪 Workout Log', diet:'🥗 Diet Notes', stats:'📊 Body Stats', general:'📝 General' };
    return map[cat] || cat;
  }

  // ── Render ───────────────────────────────────────
  function render() {
    load();
    updateCatCounts();

    let filtered = notes;
    if (activeCat !== 'all') filtered = filtered.filter(n => n.category === activeCat);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        (n.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort newest first
    filtered = [...filtered].sort((a, b) => b.updatedAt - a.updatedAt);

    if (draftsCount) draftsCount.textContent = filtered.length + ' entr' + (filtered.length === 1 ? 'y' : 'ies');

    if (!filtered.length) {
      draftsList.innerHTML = `
        <div class="empty-drafts">
          <span>📋</span>
          <p>${searchQuery ? 'No notes match your search.' : 'No entries yet. Write your first note above!'}</p>
        </div>`;
      return;
    }

    draftsList.innerHTML = filtered.map(n => `
      <div class="draft-card" data-id="${n.id}">
        <div>
          <div class="draft-title">${escHtml(n.title || 'Untitled')}</div>
          <div class="draft-preview">${escHtml(n.body)}</div>
          <div class="draft-meta">
            <span class="draft-cat">${catLabel(n.category)}</span>
            <span class="draft-date">${timeAgo(n.updatedAt)}</span>
          </div>
          ${n.tags && n.tags.length ? `<div class="draft-tags-row">${n.tags.map(t => `<span class="draft-tag">#${escHtml(t)}</span>`).join('')}</div>` : ''}
          <div class="draft-full-content">${escHtml(n.body)}</div>
        </div>
        <div class="draft-actions">
          <button class="draft-btn edit" data-id="${n.id}">Edit</button>
          <button class="draft-btn delete" data-id="${n.id}">Delete</button>
        </div>
      </div>`).join('');

    // Card click = expand
    draftsList.querySelectorAll('.draft-card').forEach(card => {
      card.addEventListener('click', e => {
        if (e.target.classList.contains('draft-btn')) return;
        card.classList.toggle('expanded');
      });
    });

    // Edit buttons
    draftsList.querySelectorAll('.draft-btn.edit').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.id;
        const note = notes.find(n => n.id === id);
        if (!note) return;
        titleInput.value = note.title;
        bodyInput.value  = note.body;
        catSelect.value  = note.category;
        tagsInput.value  = (note.tags || []).join(', ');
        editingId = id;
        if (editorHeader) editorHeader.textContent = '// Editing Entry';
        updateCharCount();
        titleInput.focus();
        titleInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
    });

    // Delete buttons
    draftsList.querySelectorAll('.draft-btn.delete').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        if (!confirm('Delete this entry permanently?')) return;
        notes = notes.filter(n => n.id !== btn.dataset.id);
        save();
        if (editingId === btn.dataset.id) clearEditor();
        render();
        showToast('Entry deleted.');
      });
    });
  }

  function updateCatCounts() {
    catBtns.forEach(btn => {
      const cat = btn.dataset.cat;
      const count = cat === 'all' ? notes.length : notes.filter(n => n.category === cat).length;
      const countEl = btn.querySelector('.cat-count');
      if (countEl) countEl.textContent = count;
    });
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function updateCharCount() {
    if (charCount) charCount.textContent = (bodyInput.value.length) + ' chars';
  }

  function clearEditor() {
    titleInput.value = '';
    bodyInput.value  = '';
    catSelect.value  = 'general';
    tagsInput.value  = '';
    editingId = null;
    if (editorHeader) editorHeader.textContent = '// New Entry';
    updateCharCount();
  }

  // ── Save ─────────────────────────────────────────
  function saveNote() {
    const title = titleInput.value.trim();
    const body  = bodyInput.value.trim();
    if (!title && !body) { showToast('⚠ Write something first!'); return; }

    const tags = tagsInput.value
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(Boolean);

    const now = Date.now();

    if (editingId) {
      notes = notes.map(n => n.id === editingId
        ? { ...n, title, body, category: catSelect.value, tags, updatedAt: now }
        : n
      );
      showToast('✓ Entry updated!');
    } else {
      notes.unshift({ id: uid(), title, body, category: catSelect.value, tags, createdAt: now, updatedAt: now });
      showToast('✓ Entry saved!');
    }

    save();
    clearEditor();
    render();
  }

  // ── Event Listeners ───────────────────────────────
  if (btnSave)   btnSave.addEventListener('click', saveNote);
  if (btnClear)  btnClear.addEventListener('click', () => { clearEditor(); showToast('Editor cleared.'); });
  if (bodyInput) bodyInput.addEventListener('input', updateCharCount);

  // Ctrl+S / Cmd+S
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      const onNotesPage = !!document.getElementById('note-title');
      if (onNotesPage) { e.preventDefault(); saveNote(); }
    }
  });

  // Search
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = searchInput.value.trim();
      render();
    });
  }

  // Category filter
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.dataset.cat;
      render();
    });
  });

  // Export all notes as .txt
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      load();
      if (!notes.length) { showToast('⚠ No notes to export.'); return; }
      const lines = notes
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map(n => [
          '═'.repeat(60),
          `TITLE:    ${n.title || 'Untitled'}`,
          `CATEGORY: ${catLabel(n.category)}`,
          `TAGS:     ${(n.tags || []).map(t => '#' + t).join(' ') || '—'}`,
          `DATE:     ${new Date(n.updatedAt).toLocaleString()}`,
          '',
          n.body,
          '',
        ].join('\n'));
      const blob = new Blob(['FITFLOW – FITNESS SELF SHEET\nExported: ' + new Date().toLocaleString() + '\n\n' + lines.join('\n')], { type: 'text/plain' });
      const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'fitflow-notes.txt' });
      a.click();
      URL.revokeObjectURL(a.href);
      showToast('✓ Notes exported!');
    });
  }

  // Init
  load();
  render();
  updateCharCount();
})();
