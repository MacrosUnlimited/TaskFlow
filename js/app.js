/* ============================================================
   TASKFLOW — app.js
   Gestor de Tareas: CRUD + Filtros y Persistencia localStorage
   ============================================================ */

'use strict';

// ── State ─────────────────────────────────────────────────────
let tasks   = [];
let filter  = 'all';
let editId  = null;

// ── DOM Refs ──────────────────────────────────────────────────
const taskList      = document.getElementById('task-list');
const emptyState    = document.getElementById('empty-state');
const addForm       = document.getElementById('add-task-form');
const taskInput     = document.getElementById('task-input');
const taskCategory  = document.getElementById('task-category');
const pageTitle     = document.getElementById('page-title');
const pageDate      = document.getElementById('page-date');
const editModal     = document.getElementById('edit-modal');
const editInput     = document.getElementById('edit-input');
const editCatSelect = document.getElementById('edit-category');
const btnCloseEdit  = document.getElementById('btn-close-edit');
const btnSaveEdit   = document.getElementById('btn-save-edit');
const btnClearDone  = document.getElementById('btn-clear-done');

const FILTER_TITLES = {
  all:      'Todas las tareas',
  pending:  'Pendientes',
  done:     'Completadas',
  trabajo:  'Trabajo',
  personal: 'Personal',
  urgente:  'Urgente',
};

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  setDate();
  renderAll();
  bindNav();
  bindAddForm();
  bindModalClose();
});

// ── LocalStorage ──────────────────────────────────────────────
function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem('tf_tasks')) || [];
  } catch { tasks = []; }
}

function saveTasks() {
  localStorage.setItem('tf_tasks', JSON.stringify(tasks));
}

// ── Utilities ─────────────────────────────────────────────────
function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function setDate() {
  const now = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  pageDate.textContent = now.toLocaleDateString('es-ES', opts);
}

function formatTime(ms) {
  const d = new Date(ms);
  return d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

function showToast(msg) {
  let t = document.querySelector('.notification-toast');
  if (!t) {
    t = document.createElement('div');
    t.className = 'notification-toast';
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timeout);
  t._timeout = setTimeout(() => t.classList.remove('show'), 2200);
}

// ── Filter logic ──────────────────────────────────────────────
function getFiltered() {
  switch (filter) {
    case 'all':     return [...tasks];
    case 'pending': return tasks.filter(t => !t.done);
    case 'done':    return tasks.filter(t =>  t.done);
    default:        return tasks.filter(t => t.category === filter);
  }
}

// ── Counters ──────────────────────────────────────────────────
function updateCounts() {
  const cats = ['trabajo', 'personal', 'urgente'];
  document.getElementById('count-all').textContent     = tasks.length;
  document.getElementById('count-pending').textContent = tasks.filter(t => !t.done).length;
  document.getElementById('count-done').textContent    = tasks.filter(t =>  t.done).length;
  cats.forEach(c => {
    document.getElementById(`count-${c}`).textContent = tasks.filter(t => t.category === c).length;
  });
}

// ── Render ────────────────────────────────────────────────────
function renderAll() {
  updateCounts();
  pageTitle.textContent = FILTER_TITLES[filter] || 'Tareas';
  const filtered = getFiltered();
  taskList.innerHTML = '';

  if (filtered.length === 0) {
    emptyState.style.display = 'block';
    return;
  }
  emptyState.style.display = 'none';

  filtered.forEach((task, i) => {
    const el = buildTaskEl(task, i);
    taskList.appendChild(el);
  });
}

function buildTaskEl(task, i) {
  const li = document.createElement('div');
  li.className = `task-item${task.done ? ' done' : ''}`;
  li.dataset.id  = task.id;
  li.dataset.cat = task.category;
  li.style.animationDelay = `${i * 0.04}s`;

  li.innerHTML = `
    <button class="task-check" title="Marcar completada" aria-label="Toggle completada">
      <svg class="check-mark" width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2 6 5 9 10 3"/></svg>
    </button>
    <div class="task-content">
      <div class="task-text">${escapeHTML(task.text)}</div>
      <div class="task-meta">
        <span class="task-badge badge-${task.category}">${task.category}</span>
        <span class="task-date">${formatTime(task.createdAt)}</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="action-btn edit" title="Editar" aria-label="Editar tarea">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </button>
      <button class="action-btn delete" title="Eliminar" aria-label="Eliminar tarea">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </button>
    </div>
  `;

  // Events on this item
  li.querySelector('.task-check').addEventListener('click', () => toggleDone(task.id));
  li.querySelector('.action-btn.edit').addEventListener('click', () => openEditModal(task.id));
  li.querySelector('.action-btn.delete').addEventListener('click', () => deleteTask(task.id, li));

  return li;
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
}

// ── CRUD ──────────────────────────────────────────────────────
function addTask(text, category) {
  if (!text.trim()) return;
  const task = {
    id:        genId(),
    text:      text.trim(),
    category,
    done:      false,
    createdAt: Date.now(),
  };
  tasks.unshift(task);
  saveTasks();
  renderAll();
  showToast('✓ Tarea añadida');
}

function toggleDone(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.done = !t.done;
  saveTasks();
  renderAll();
}

function deleteTask(id, el) {
  el.style.opacity    = '0';
  el.style.transform  = 'translateX(20px)';
  el.style.transition = 'opacity 0.2s, transform 0.2s';
  setTimeout(() => {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderAll();
    showToast('Tarea eliminada');
  }, 200);
}

function updateTask(id, newText, newCat) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  t.text     = newText.trim();
  t.category = newCat;
  saveTasks();
  renderAll();
  showToast('✓ Tarea actualizada');
}

// ── Edit Modal ────────────────────────────────────────────────
function openEditModal(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  editId               = id;
  editInput.value      = t.text;
  editCatSelect.value  = t.category;
  editModal.classList.add('open');
  editInput.focus();
}

function closeEditModal() {
  editModal.classList.remove('open');
  editId = null;
}

btnSaveEdit.addEventListener('click', () => {
  if (!editInput.value.trim()) return;
  updateTask(editId, editInput.value, editCatSelect.value);
  closeEditModal();
});

editInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') btnSaveEdit.click();
  if (e.key === 'Escape') closeEditModal();
});

btnCloseEdit.addEventListener('click', closeEditModal);
editModal.addEventListener('click', e => { if (e.target === editModal) closeEditModal(); });

// ── Clear Completed ───────────────────────────────────────────
btnClearDone.addEventListener('click', () => {
  const count = tasks.filter(t => t.done).length;
  if (!count) return;
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderAll();
  showToast(`${count} tarea${count > 1 ? 's' : ''} eliminada${count > 1 ? 's' : ''}`);
});

// ── Nav / Filter Binding ──────────────────────────────────────
function bindNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      renderAll();
    });
  });
}

// ── Add Form ──────────────────────────────────────────────────
function bindAddForm() {
  addForm.addEventListener('submit', e => {
    e.preventDefault();
    addTask(taskInput.value, taskCategory.value);
    taskInput.value = '';
    taskInput.focus();
  });
}

// ── Modal Close (Pomodoro) ─────────────────────────────────────
function bindModalClose() {
  const pomOverlay = document.getElementById('pomodoro-modal');
  pomOverlay.addEventListener('click', e => {
    if (e.target === pomOverlay) closePomodoroModal();
  });
}

// Expose for pomodoro.js
window.TaskApp = { showToast };
