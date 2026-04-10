// script.js - maneja tareas: añadir, borrar, marcar completadas y persistencia en localStorage
const TASKS_KEY = 'tasks_v1';

const taskInput = document.getElementById('taskinput');
const addTaskBtn = document.getElementById('addtaskbtn');
const sortAzBtn = document.getElementById('sort-az-btn');
const sortZaBtn = document.getElementById('sort-za-btn');
const pendingList = document.getElementById('pending-list');
const completedList = document.getElementById('completed-list');
const totalEl = document.getElementById('totaltaks');
const completedEl = document.getElementById('completedtasks');
const pendingEl = document.getElementById('pendingtasks');

let tasks = loadTasks();

function loadTasks() {
	try {
		const raw = localStorage.getItem(TASKS_KEY);
		let tasks = raw ? JSON.parse(raw) : [];
		// Ensure all tasks have completed and pinned property
		tasks = tasks.map(task => ({
			id: task.id,
			text: task.text,
			completed: task.completed || false,
			pinned: task.pinned || false
		}));
		return tasks;
	} catch (e) {
		console.error('Error leyendo tareas desde localStorage', e);
		return [];
	}
}

function saveTasks() {
	try {
		localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
	} catch (e) {
		console.error('Error guardando tareas en localStorage', e);
	}
}

function renderTasks() {
	// Vaciar listas antes de renderizar
	pendingList.innerHTML = '';
	completedList.innerHTML = '';

	const pendingTasks = tasks.filter(t => !t.completed);
	const completedTasks = tasks.filter(t => t.completed);

	// Separar tareas fijadas de no fijadas
	const pinnedPending = pendingTasks.filter(t => t.pinned);
	const unpinnedPending = pendingTasks.filter(t => !t.pinned);

	// Render pending (fijadas primero)
	if (pendingTasks.length === 0) {
		const empty = document.createElement('p');
		empty.textContent = 'No hay tareas pendientes.';
		empty.style.opacity = '0.8';
		pendingList.appendChild(empty);
	} else {
		pinnedPending.forEach(task => renderTaskItem(task, pendingList));
		unpinnedPending.forEach(task => renderTaskItem(task, pendingList));
	}

	// Render completed
	if (completedTasks.length === 0) {
		const empty = document.createElement('p');
		empty.textContent = 'No hay tareas completadas.';
		empty.style.opacity = '0.8';
		completedList.appendChild(empty);
	} else {
		completedTasks.forEach(task => renderTaskItem(task, completedList));
	}

	updateStats();
}

function renderTaskItem(task, listEl) {
	const item = document.createElement('div');
	item.className = 'task-item';
	if (task.pinned) item.classList.add('pinned-task');

	const left = document.createElement('div');
	left.className = 'task-left';

	const text = document.createElement('span');
	text.textContent = task.text;

	left.appendChild(text);

	const buttons = document.createElement('div');
	buttons.className = 'task-buttons';

	const completeBtn = document.createElement('button');
	completeBtn.textContent = task.completed ? 'Desmarcar' : 'Completar';
	completeBtn.className = 'complete-btn';
	completeBtn.dataset.id = task.id;

	const pinBtn = document.createElement('button');
	pinBtn.textContent = task.pinned ? '📌 Fijado' : '📌 Fijar';
	pinBtn.className = 'pin-btn';
	pinBtn.dataset.id = task.id;
	if (task.pinned) pinBtn.classList.add('pinned');

	const deleteBtn = document.createElement('button');
	deleteBtn.textContent = 'Borrar';
	deleteBtn.className = 'delete-btn';
	deleteBtn.dataset.id = task.id;

	buttons.appendChild(completeBtn);
	buttons.appendChild(pinBtn);
	buttons.appendChild(deleteBtn);

	item.appendChild(left);
	item.appendChild(buttons);

	listEl.appendChild(item);
}

function updateStats() {
	const total = tasks.length;
	const completed = tasks.filter(t => t.completed).length;
	const pending = total - completed;

	if (totalEl) totalEl.textContent = total;
	if (completedEl) completedEl.textContent = completed;
	if (pendingEl) pendingEl.textContent = pending;
}

function addTask() {
	const text = taskInput.value.trim();
	if (!text) return;

	const task = {
		id: Date.now().toString(),
		text,
		completed: false
	};

	tasks.unshift(task);
	saveTasks();
	renderTasks();
	taskInput.value = '';
	taskInput.focus();
}

function sortTasks(direction) {
	if (direction === 'az') {
		tasks.sort((a, b) => a.text.localeCompare(b.text, 'es', { sensitivity: 'base' }));
	} else if (direction === 'za') {
		tasks.sort((a, b) => b.text.localeCompare(a.text, 'es', { sensitivity: 'base' }));
	}
	// Guardar y volver a renderizar después de ordenar
	saveTasks();
	renderTasks();
}

// Delegación para completar y borrar
function handleTaskAction(e) {
	const btn = e.target;
	const id = btn.dataset.id;
	if (!id) return;

	if (btn.classList.contains('complete-btn')) {
		const task = tasks.find(t => t.id === id);
		if (task) {
			task.completed = !task.completed;
			saveTasks();
			renderTasks();
		}
	} else if (btn.classList.contains('pin-btn')) {
		const task = tasks.find(t => t.id === id);
		if (task) {
			task.pinned = !task.pinned;
			saveTasks();
			renderTasks();
		}
	} else if (btn.classList.contains('delete-btn')) {
		tasks = tasks.filter(t => t.id !== id);
		saveTasks();
		renderTasks();
	}
}

pendingList.addEventListener('click', handleTaskAction);
completedList.addEventListener('click', handleTaskAction);

addTaskBtn.addEventListener('click', addTask);
if (sortAzBtn) sortAzBtn.addEventListener('click', () => sortTasks('az'));
if (sortZaBtn) sortZaBtn.addEventListener('click', () => sortTasks('za'));

taskInput.addEventListener('keydown', (e) => {
	// Soporta 'Enter' estándar y keyCode 13 por compatibilidad
	if (e.key === 'Enter' || e.keyCode === 13) {
		e.preventDefault();
		addTask();
	}
});

// Render inicial
renderTasks();

