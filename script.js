class TodoApp {
    constructor() {
        this.todos = this.loadFromStorage() || [];
        this.currentFilter = 'all';
        this.theme = localStorage.getItem('theme') || 'light';
        
        this.initializeElements();
        this.bindEvents();
        this.applyTheme();
        this.render();
    }

    initializeElements() {
        this.todoInput = document.getElementById('todo-input');
        this.addBtn = document.getElementById('add-btn');
        this.themeToggle = document.getElementById('theme-toggle');
        this.filterBtns = document.querySelectorAll('.filter-btn');
        this.clearCompletedBtn = document.getElementById('clear-completed');
        this.clearAllBtn = document.getElementById('clear-all');
        this.todoList = document.getElementById('todo-list');
        this.emptyState = document.getElementById('empty-state');
        this.totalTasks = document.getElementById('total-tasks');
        this.completedTasks = document.getElementById('completed-tasks');
        this.pendingTasks = document.getElementById('pending-tasks');
        this.todoDate = document.getElementById('todo-date');
        this.todoTime = document.getElementById('todo-time');
    }

    bindEvents() {
        this.addBtn.addEventListener('click', () => this.addTodo());
        this.todoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTodo();
        });

        this.themeToggle.addEventListener('click', () => this.toggleTheme());

        this.filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });

        this.clearCompletedBtn.addEventListener('click', () => this.clearCompleted());
        this.clearAllBtn.addEventListener('click', () => this.clearAll());

        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.target === this.todoInput) {
                e.preventDefault();
            }
        });
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        const date = this.todoDate.value;
        const time = this.todoTime.value;
        if (!text) {
            this.showNotification('Please enter a task!', 'warning');
            return;
        }

        if (text.length > 100) {
            this.showNotification('Task is too long! Maximum 100 characters.', 'warning');
            return;
        }

        const todo = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString(),
            date: date,
            time: time
        };

        this.todos.unshift(todo);
        this.todoInput.value = '';
        this.todoDate.value = '';
        this.todoTime.value = '';
        this.saveToStorage();
        this.render();
        this.showNotification('Task added successfully!', 'success');
    }

    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id);
        this.saveToStorage();
        this.render();
        this.showNotification('Task deleted!', 'success');
    }

    toggleTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            this.saveToStorage();
            this.render();
            const message = todo.completed ? 'Task completed!' : 'Task marked as pending!';
            this.showNotification(message, 'success');
        }
    }

    editTodo(id) {
        const todo = this.todos.find(todo => todo.id === id);
        if (!todo) return;

        const newText = prompt('Edit task:', todo.text);
        if (newText === null) return;

        if (!newText.trim()) {
            this.showNotification('Task cannot be empty!', 'warning');
            return;
        }

        if (newText.trim().length > 100) {
            this.showNotification('Task is too long! Maximum 100 characters.', 'warning');
            return;
        }

        todo.text = newText.trim();
        this.saveToStorage();
        this.render();
        this.showNotification('Task updated!', 'success');
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });
        this.render();
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'completed': return this.todos.filter(todo => todo.completed);
            case 'pending': return this.todos.filter(todo => !todo.completed);
            default: return this.todos;
        }
    }

    clearCompleted() {
        const completedCount = this.todos.filter(todo => todo.completed).length;
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear!', 'warning');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(todo => !todo.completed);
            this.saveToStorage();
            this.render();
            this.showNotification(`${completedCount} completed task(s) cleared!`, 'success');
        }
    }

    clearAll() {
        if (this.todos.length === 0) {
            this.showNotification('No tasks to clear!', 'warning');
            return;
        }

        if (confirm(`Are you sure you want to delete all ${this.todos.length} task(s)?`)) {
            this.todos = [];
            this.saveToStorage();
            this.render();
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    toggleTheme() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme();
        localStorage.setItem('theme', this.theme);
    }

    applyTheme() {
        document.documentElement.setAttribute('data-theme', this.theme);
        const icon = this.themeToggle.querySelector('i');
        icon.className = this.theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
        this.themeToggle.setAttribute('aria-label', this.theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    }

    updateStats() {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const pending = total - completed;

        this.totalTasks.textContent = `Total: ${total}`;
        this.completedTasks.textContent = `Completed: ${completed}`;
        this.pendingTasks.textContent = `Pending: ${pending}`;
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        li.dataset.id = todo.id;

        let dateTimeHtml = '';
        if (todo.date || todo.time) {
            dateTimeHtml = `<div class="todo-datetime">`;
            if (todo.date) dateTimeHtml += `<span class='todo-date'><i class='fas fa-calendar-alt'></i> ${todo.date}</span>`;
            if (todo.time) dateTimeHtml += ` <span class='todo-time'><i class='fas fa-clock'></i> ${todo.time}</span>`;
            dateTimeHtml += `</div>`;
        }

        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                 onclick="app.toggleTodo(${todo.id})"
                 role="checkbox" 
                 aria-checked="${todo.completed}"
                 tabindex="0"></div>
            <span class="todo-text">${this.escapeHtml(todo.text)}</span>
            ${dateTimeHtml}
            <div class="todo-actions">
                <button class="todo-btn edit-btn" onclick="app.editTodo(${todo.id})" title="Edit task" aria-label="Edit task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="todo-btn delete-btn" onclick="app.deleteTodo(${todo.id})" title="Delete task" aria-label="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        li.querySelector('.todo-checkbox').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggleTodo(todo.id);
            }
        });

        return li;
    }

    render() {
        const filteredTodos = this.getFilteredTodos();
        this.todoList.innerHTML = '';

        if (filteredTodos.length === 0) {
            this.emptyState.classList.add('show');
            this.emptyState.querySelector('p').textContent =
                this.currentFilter === 'all'
                    ? 'No tasks yet. Add one above!'
                    : `No ${this.currentFilter} tasks.`;
        } else {
            this.emptyState.classList.remove('show');
            filteredTodos.forEach(todo => {
                this.todoList.appendChild(this.createTodoElement(todo));
            });
        }

        this.updateStats();
        this.updateActionButtons();
    }

    updateActionButtons() {
        const hasCompleted = this.todos.some(todo => todo.completed);
        const hasAny = this.todos.length > 0;

        this.clearCompletedBtn.disabled = !hasCompleted;
        this.clearAllBtn.disabled = !hasAny;

        this.clearCompletedBtn.style.opacity = hasCompleted ? '1' : '0.5';
        this.clearAllBtn.style.opacity = hasAny ? '1' : '0.5';
    }

    showNotification(message, type = 'info') {
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) existingNotification.remove();

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--card-bg);
            color: var(--text-primary);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border-left: 4px solid ${type === 'success' ? 'var(--success-color)' : 
                                   type === 'warning' ? 'var(--warning-color)' : 
                                   'var(--accent-color)'};
            box-shadow: var(--shadow-lg);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                               type === 'warning' ? 'fa-exclamation-triangle' : 
                               'fa-info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveToStorage() {
        try {
            localStorage.setItem('todos', JSON.stringify(this.todos));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            this.showNotification('Failed to save data!', 'warning');
        }
    }

    loadFromStorage() {
        try {
            const stored = localStorage.getItem('todos');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.showNotification('Failed to load saved data!', 'warning');
            return [];
        }
    }
}

// Notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Initialize the TodoApp and make it globally accessible for inline event handlers
window.app = new TodoApp();
