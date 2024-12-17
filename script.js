let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let timerIntervals = {};

// Function to add or update a task
function addOrUpdateTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-desc').value.trim();
    const priority = document.getElementById('task-priority').value;
    const day = document.getElementById('task-day').value;
    const startTime = document.getElementById('task-start').value;
    const duration = parseInt(document.getElementById('task-duration').value);

    if (!title || !startTime || !duration) {
        alert("Title, start time, and duration are required.");
        return;
    }

    const task = { id: Date.now(), title, description, priority, day, startTime, duration, actualTime: 0 };

    if (resolveConflict(task)) {
        tasks.push(task);
        saveTasks();
        displayTasks();
        alert("Task added successfully with conflict resolution!");
    }
}

// Conflict Detection and Smart Scheduling
function resolveConflict(newTask) {
    const dayTasks = tasks.filter(task => task.day === newTask.day);

    for (let task of dayTasks) {
        if (isOverlapping(task, newTask)) {
            // Adjust the new task's start time
            let endTime = addMinutes(task.startTime, task.duration);
            newTask.startTime = endTime;
        }
    }
    return true;
}

function isOverlapping(task1, task2) {
    let task1End = addMinutes(task1.startTime, task1.duration);
    return task1.startTime < task2.startTime && task2.startTime < task1End;
}

function addMinutes(time, minutes) {
    let [hh, mm] = time.split(':').map(Number);
    let date = new Date();
    date.setHours(hh, mm + minutes);
    return date.toTimeString().substring(0, 5);
}

// Save to Local Storage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Display tasks
function displayTasks() {
    const viewDay = document.getElementById('view-day').value;
    const taskContainer = document.getElementById('tasks');
    taskContainer.innerHTML = '';

    const filteredTasks = viewDay ? tasks.filter(task => task.day === viewDay) : tasks;

    filteredTasks.forEach(task => {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.priority.toLowerCase()}-priority`;
        taskDiv.innerHTML = `
            <strong>${task.title}</strong> [${task.startTime} - ${addMinutes(task.startTime, task.duration)}]
            <p>${task.description}</p>
            <small>Priority: ${task.priority} | Day: ${task.day}</small>
            <div class=\"timer-btns\">
                <button onclick=\"startTimer(${task.id})\">Start</button>
                <button onclick=\"pauseTimer(${task.id})\">Pause</button>
                <button onclick=\"stopTimer(${task.id})\">Stop</button>
            </div>
        `;
        taskContainer.appendChild(taskDiv);
    });
}

// Timer Functions
function startTimer(id) {
    if (!timerIntervals[id]) {
        timerIntervals[id] = setInterval(() => {
            const task = tasks.find(t => t.id === id);
            task.actualTime++;
            saveTasks();
        }, 60000); // Count minutes
    }
}

function pauseTimer(id) {
    clearInterval(timerIntervals[id]);
    delete timerIntervals[id];
}

function stopTimer(id) {
    pauseTimer(id);
    alert("Task timer stopped!");
}

// Initialize
displayTasks();
