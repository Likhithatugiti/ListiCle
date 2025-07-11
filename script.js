document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const taskCount = document.getElementById('taskCount');
    const clearCompletedBtn = document.getElementById('clearCompletedBtn');
    
    // State
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    
    // Initialize the app
    init();
    
    function init() {
        renderTasks();
        setupEventListeners();
    }
    
    function setupEventListeners() {
        // Add task
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addTask();
        });
        
        // Filter tasks
        filterBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                filterBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                currentFilter = this.dataset.filter;
                renderTasks();
            });
        });
        
        // Clear completed tasks
        clearCompletedBtn.addEventListener('click', clearCompletedTasks);
    }
    
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === '') {
            showAlert('Please enter a task');
            return;
        }
        
        const newTask = {
            id: Date.now(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        taskInput.value = '';
        taskInput.focus();


    }
    
    function renderTasks() {
        // Filter tasks based on current filter
        let filteredTasks = tasks;
        if (currentFilter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }
        
        // Render tasks
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>No ${currentFilter} tasks found</p>
                </div>
            `;
        } else {
            taskList.innerHTML = '';
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.className = 'task-item';
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="task-text ${task.completed ? 'completed' : ''}">${task.text}</span>
                    <div class="task-actions">
                        <button class="task-btn edit" data-id="${task.id}"><i class="fas fa-edit"></i></button>
                        <button class="task-btn delete" data-id="${task.id}"><i class="fas fa-trash-alt"></i></button>
                    </div>
                `;
                taskList.appendChild(taskItem);
            });
        }
        
        // Update task count
        updateTaskCount();
        
        // Add event listeners to dynamic elements
        addTaskEventListeners();
    }
    
    function addTaskEventListeners() {
        // Checkbox event
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const taskId = parseInt(this.dataset.id);
                toggleTaskComplete(taskId);
            });
        });
        
        // Edit button event
        document.querySelectorAll('.task-btn.edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = parseInt(this.dataset.id);
                editTask(taskId);
            });
        });
        
        // Delete button event
        document.querySelectorAll('.task-btn.delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const taskId = parseInt(this.dataset.id);
                deleteTask(taskId);
            });
        });
    }
    
    function toggleTaskComplete(taskId) {
        tasks = tasks.map(task => {
            if (task.id === taskId) {
                return {...task, completed: !task.completed};
            }
            return task;
        });
        saveTasks();
        renderTasks();
    }
    
    function editTask(taskId) {
        const task = tasks.find(task => task.id === taskId);
        if (!task) return;
        
        const taskTextElement = document.querySelector(`.task-text[data-id="${taskId}"]`);
        if (!taskTextElement) return;
        
        const currentText = task.text;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.className = 'edit-input';
        
        taskTextElement.replaceWith(input);
        input.focus();
        
        function saveEdit() {
            const newText = input.value.trim();
            if (newText && newText !== currentText) {
                tasks = tasks.map(t => 
                    t.id === taskId ? {...t, text: newText} : t
                );
                saveTasks();
            }
            renderTasks();
        }
        
        input.addEventListener('blur', saveEdit);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') saveEdit();
        });
    }
    
    function deleteTask(taskId) {
        tasks = tasks.filter(task => task.id !== taskId);
        saveTasks();
        renderTasks();
    }
    
    function clearCompletedTasks() {
        tasks = tasks.filter(task => !task.completed);
        saveTasks();
        renderTasks();
    }
    
    function updateTaskCount() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        taskCount.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} remaining`;
    }
    
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    function showAlert(message) {
        // In a real app, you might use a more sophisticated alert system
        alert(message);
    }
});
