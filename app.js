// ── CLOCK ──────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) +
    ' · ' +
    now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

updateClock();
setInterval(updateClock, 1000);


// ── TO-DO ───────────────────────────────────────────────
let todos = [
  { text: 'Photograph tool cart locking ring for Etsy listing', who: 'P2', done: false },
  { text: 'Research 3D scanner options under $400',             who: 'P1', done: false },
  { text: 'Set up GitHub repo for AMP landing page',            who: 'P1', done: false },
  { text: 'Price out PLA bulk order — white + black',           who: 'P2', done: true  },
];

function renderTodos() {
  const list = document.getElementById('todoList');
  list.innerHTML = '';

  todos.forEach((todo, i) => {
    const item = document.createElement('div');
    item.className = 'todo-item' + (todo.done ? ' done' : '');
    item.innerHTML = `
      <div class="todo-cb"  onclick="toggleTodo(${i})"></div>
      <div class="todo-text">${todo.text}</div>
      <div class="todo-who">${todo.who}</div>
      <div class="todo-del" onclick="deleteTodo(${i})">✕</div>
    `;
    list.appendChild(item);
  });
}

function toggleTodo(i) {
  todos[i].done = !todos[i].done;
  renderTodos();
}

function deleteTodo(i) {
  todos.splice(i, 1);
  renderTodos();
}

function addTodo() {
  const input = document.getElementById('todoInput');
  const text  = input.value.trim();
  if (!text) return;

  todos.unshift({ text, who: 'P1', done: false });
  renderTodos();
  input.value = '';
}

document.getElementById('todoInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTodo();
});

// Initial render
renderTodos();


// ── NAV ACTIVE STATE ────────────────────────────────────
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
  });
});
