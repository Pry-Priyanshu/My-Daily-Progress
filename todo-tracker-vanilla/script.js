// Initialize Lucide Icons
lucide.createIcons();

// Check URL for shared data
const urlParams = new URLSearchParams(window.location.search);
const sharedData = urlParams.get('data');

let tasks;
if (sharedData) {
    try {
        tasks = JSON.parse(atob(sharedData));
        // Save imported data to local storage so it persists
        localStorage.setItem('todoTrackerVanilla', JSON.stringify(tasks));
        // Clean up URL without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
    } catch (e) {
        console.error("Failed to parse shared data", e);
        tasks = JSON.parse(localStorage.getItem('todoTrackerVanilla')) || getDefaultTasks();
    }
} else {
    tasks = JSON.parse(localStorage.getItem('todoTrackerVanilla')) || getDefaultTasks();
}

function getDefaultTasks() {
    return [
        { id: 1, time: '00:00 - 01:00', task: 'Deep Sleep', subject: 'Health', status: 'Done', priority: 'Low' },
        { id: 2, time: '01:00 - 02:00', task: 'Sleep Cycle', subject: 'Health', status: 'Done', priority: 'Low' },
        { id: 3, time: '06:00 - 07:00', task: 'Workout + Meditation', subject: 'Fitness', status: 'Pending', priority: 'High' },
        { id: 4, time: '08:00 - 09:00', task: 'Deep Work', subject: 'Study', status: 'In Progress', priority: 'High' },
    ];
}

let alarmEnabled = false;
let alarmInterval = null;
let progressChartInstance = null;

// DOM Elements
const tasksList = document.getElementById('tasksList');
const taskForm = document.getElementById('taskForm');
const alarmBtn = document.getElementById('alarmBtn');
const alarmText = document.getElementById('alarmText');
const alarmSound = document.getElementById('alarmSound');

// Stats Elements
const totalTasksCount = document.getElementById('totalTasksCount');
const completedTasksCount = document.getElementById('completedTasksCount');
const pendingTasksCount = document.getElementById('pendingTasksCount');
const completionPercent = document.getElementById('completionPercent');

const mainProgressBar = document.getElementById('mainProgressBar');
const mainProgressText = document.getElementById('mainProgressText');
const fireBadge = document.getElementById('fireBadge');

const completedBar = document.getElementById('completedBar');
const inProgressBar = document.getElementById('inProgressBar');
const pendingBar = document.getElementById('pendingBar');

const completedPercentText = document.getElementById('completedPercentText');
const inProgressPercentText = document.getElementById('inProgressPercentText');
const pendingPercentText = document.getElementById('pendingPercentText');

// Render Tasks
function renderTasks() {
    tasksList.innerHTML = '';
    
    // Sort tasks by time string (basic sorting)
    const sortedTasks = [...tasks].sort((a, b) => a.time.localeCompare(b.time));

    if (sortedTasks.length === 0) {
        tasksList.innerHTML = `
            <div style="text-align: center; padding: 2.5rem; color: var(--text-muted);">
                <p>No tasks yet. Add one above to get started!</p>
            </div>
        `;
    } else {
        sortedTasks.forEach(task => {
            const isDone = task.status === 'Done';
            
            const taskEl = document.createElement('div');
            taskEl.className = 'task-item';
            taskEl.innerHTML = `
                <div class="task-info">
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <span class="task-time">🕒 ${task.time}</span>
                        <h3 class="task-title ${isDone ? 'done' : ''}">${task.task}</h3>
                    </div>
                    <p class="task-subject">${task.subject}</p>
                </div>
                <div class="task-actions">
                    <select class="status-select status-${task.status.replace(' ', '-')}" onchange="updateStatus(${task.id}, this.value)">
                        <option value="Pending" ${task.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="In Progress" ${task.status === 'In Progress' ? 'selected' : ''}>In Progress</option>
                        <option value="Done" ${task.status === 'Done' ? 'selected' : ''}>Done</option>
                    </select>
                    
                    <span class="priority-badge priority-${task.priority}">
                        ⚡ ${task.priority}
                    </span>
                    
                    <button class="btn-icon" onclick="editTask(${task.id})" title="Edit Task">
                        <i data-lucide="edit-2" style="width: 18px; height: 18px;"></i>
                    </button>
                    
                    <button class="btn-icon" onclick="deleteTask(${task.id})" title="Delete Task">
                        <i data-lucide="trash-2" style="width: 18px; height: 18px;"></i>
                    </button>
                </div>
            `;
            tasksList.appendChild(taskEl);
        });
    }
    
    // Re-initialize lucide icons for newly added elements
    lucide.createIcons();
    
    updateStats();
    saveData();
}

// Update Stats and Progress
function updateStats() {
    const total = tasks.length || 1; // prevent divide by zero
    const completed = tasks.filter(t => t.status === 'Done').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    
    const percentCompleted = Math.round((completed / total) * 100);
    const percentInProgress = Math.round((inProgress / total) * 100);
    const percentPending = Math.round((pending / total) * 100);

    // Update Quick Stats
    totalTasksCount.textContent = tasks.length;
    completedTasksCount.textContent = completed;
    pendingTasksCount.textContent = pending;
    completionPercent.textContent = `${percentCompleted}%`;

    // Update Progress Bars
    mainProgressBar.style.width = `${percentCompleted}%`;
    mainProgressText.textContent = percentCompleted;
    
    if (percentCompleted >= 80) {
        fireBadge.classList.remove('hidden');
    } else {
        fireBadge.classList.add('hidden');
    }

    completedBar.style.width = `${percentCompleted}%`;
    completedPercentText.textContent = `${percentCompleted}%`;
    
    inProgressBar.style.width = `${percentInProgress}%`;
    inProgressPercentText.textContent = `${percentInProgress}%`;
    
    pendingBar.style.width = `${percentPending}%`;
    pendingPercentText.textContent = `${percentPending}%`;
    
    updateChart(percentCompleted, percentInProgress, percentPending);
}

// Chart.js Graph
function updateChart(completed, inProgress, pending) {
    const ctx = document.getElementById('progressChart').getContext('2d');
    
    if (progressChartInstance) {
        progressChartInstance.data.datasets[0].data = [completed, inProgress, pending];
        progressChartInstance.update();
    } else {
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.font.family = "'Inter', sans-serif";
        
        progressChartInstance = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Completed', 'In Progress', 'Pending'],
                datasets: [{
                    data: [completed, inProgress, pending],
                    backgroundColor: [
                        '#22c55e', // green
                        '#eab308', // yellow
                        '#ef4444'  // red
                    ],
                    borderWidth: 0,
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#f8fafc',
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                }
            }
        });
    }
}

// Add Task
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const timeInput = document.getElementById('taskTime').value;
    const nameInput = document.getElementById('taskName').value;
    const subjectInput = document.getElementById('taskSubject').value;
    const priorityInput = document.getElementById('taskPriority').value;

    if (!timeInput || !nameInput || !subjectInput) return;

    const newTask = {
        id: Date.now(),
        time: timeInput,
        task: nameInput,
        subject: subjectInput,
        priority: priorityInput,
        status: 'Pending'
    };

    tasks.push(newTask);
    renderTasks();
    
    // Reset Form
    taskForm.reset();
});

// Delete Task
function deleteTask(id) {
    if (confirm('Are you sure you want to delete this task?')) {
        tasks = tasks.filter(t => t.id !== id);
        renderTasks();
    }
}

// Edit Task
function editTask(id) {
    const taskToEdit = tasks.find(t => t.id === id);
    if (!taskToEdit) return;
    
    // Fill form
    document.getElementById('taskTime').value = taskToEdit.time;
    document.getElementById('taskName').value = taskToEdit.task;
    document.getElementById('taskSubject').value = taskToEdit.subject;
    document.getElementById('taskPriority').value = taskToEdit.priority;
    
    // Remove the old task (so user 'saves' it as a new task when submitting form)
    tasks = tasks.filter(t => t.id !== id);
    renderTasks();
    
    // Focus the first input field for convenience
    document.getElementById('taskTime').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Reset Day
function resetDay() {
    if (confirm('Are you sure you want to reset all tasks to Pending for a new day?')) {
        tasks = tasks.map(t => ({ ...t, status: 'Pending' }));
        renderTasks();
    }
}

// Share Schedule
function shareSchedule() {
    try {
        const dataString = btoa(JSON.stringify(tasks));
        const shareUrl = window.location.origin + window.location.pathname + '?data=' + dataString;
        
        navigator.clipboard.writeText(shareUrl).then(() => {
            const shareBtn = document.getElementById('shareBtn');
            const originalHtml = shareBtn.innerHTML;
            
            shareBtn.innerHTML = '<i data-lucide="check" style="color: #4ade80;"></i><span style="color: #4ade80;">Copied!</span>';
            lucide.createIcons();
            
            setTimeout(() => {
                shareBtn.innerHTML = originalHtml;
                lucide.createIcons();
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Failed to copy link to clipboard.');
        });
    } catch (e) {
        console.error('Failed to generate share link', e);
        alert('Could not generate share link.');
    }
}

// Update Status
function updateStatus(id, newStatus) {
    tasks = tasks.map(t => t.id === id ? { ...t, status: newStatus } : t);
    renderTasks();
}

// Save to LocalStorage
function saveData() {
    localStorage.setItem('todoTrackerVanilla', JSON.stringify(tasks));
}

// Alarm & Notification System
function toggleAlarm() {
    if (!alarmEnabled) {
        // Enable
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
        
        alarmEnabled = true;
        alarmBtn.classList.add('active');
        alarmBtn.innerHTML = '<i data-lucide="bell"></i><span id="alarmText">Alarm Active</span>';
        lucide.createIcons();
        
        startAlarmCheck();
    } else {
        // Disable
        alarmEnabled = false;
        alarmBtn.classList.remove('active');
        alarmBtn.innerHTML = '<i data-lucide="bell-off"></i><span id="alarmText">Enable Alarm</span>';
        lucide.createIcons();
        
        if (alarmInterval) clearInterval(alarmInterval);
    }
}

function startAlarmCheck() {
    if (alarmInterval) clearInterval(alarmInterval);
    
    // Check every second
    alarmInterval = setInterval(() => {
        const now = new Date();
        const currentHour = now.getHours();
        
        // Find if there's a task that starts at the current hour
        const currentTask = tasks.find(t => {
            const start = t.time.split('-')[0].trim();
            if (!start) return false;
            const taskHour = parseInt(start.split(':')[0]);
            return taskHour === currentHour && t.status === 'Pending';
        });

        // Trigger alarm exactly at the top of the hour (00 minutes, 00 seconds)
        if (currentTask && now.getMinutes() === 0 && now.getSeconds() === 0) {
            triggerAlarm(currentTask);
        }
    }, 1000);
}

function triggerAlarm(task) {
    // Play Sound
    alarmSound.play().catch(e => console.log('Audio play failed:', e));
    
    // Browser Notification
    if (Notification.permission === 'granted') {
        new Notification('Todo Tracker Reminder', {
            body: `It's time for: ${task.task} (${task.subject})`,
            icon: 'https://cdn-icons-png.flaticon.com/512/3239/3239045.png'
        });
    }
    
    // Alert Fallback
    setTimeout(() => {
        alert(`🚨 Reminder: It's time for "${task.task}"`);
    }, 500);
}

// Initial Render
renderTasks();
