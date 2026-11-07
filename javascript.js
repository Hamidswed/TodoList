// Todo List Application with CRUD Operations and localStorage
class TodoApp {
  constructor() {
    this.tasks = [];
    this.currentFilter = "all";
    this.editingTaskId = null;

    this.initializeApp();
  }

  // Initialize the application
  initializeApp() {
    this.loadTasksFromStorage();
    this.bindEvents();
    this.renderTasks();
    this.updateStats();
  }

  // Bind event listeners
  bindEvents() {
    // Form submission
    document.getElementById("todo-form").addEventListener("submit", (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Update and cancel buttons
    document
      .getElementById("btn-update")
      .addEventListener("click", () => this.updateTask());
    document
      .getElementById("btn-cancel")
      .addEventListener("click", () => this.cancelEdit());

    // Filter buttons
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.addEventListener("click", (e) =>
        this.filterTasks(e.target.dataset.filter),
      );
    });

    // Storage management buttons
    document
      .getElementById("btn-clear-all")
      .addEventListener("click", () => this.clearAllTasks());
    document
      .getElementById("btn-export")
      .addEventListener("click", () => this.exportTasks());
    document
      .getElementById("btn-import")
      .addEventListener("click", () => this.showImportModal());

    // Import modal buttons
    document
      .getElementById("btn-confirm-import")
      .addEventListener("click", () => this.importTasks());
    document
      .getElementById("btn-cancel-import")
      .addEventListener("click", () => this.hideImportModal());
    document
      .querySelector(".close")
      .addEventListener("click", () => this.hideImportModal());

    // Close modal when clicking outside
    window.addEventListener("click", (e) => {
      const modal = document.getElementById("import-modal");
      if (e.target === modal) {
        this.hideImportModal();
      }
    });

    // Set today's date as default
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("input-date").value = today;
    document.getElementById("input-date").min = today;
  }

  // Generate unique ID for tasks
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Load tasks from localStorage
  loadTasksFromStorage() {
    const savedTasks = localStorage.getItem("todoTasks");
    if (savedTasks) {
      this.tasks = JSON.parse(savedTasks);
    }
  }

  // Save tasks to localStorage
  saveTasksToStorage() {
    localStorage.setItem("todoTasks", JSON.stringify(this.tasks));
  }

  // Handle form submission (Add new task)
  handleFormSubmit() {
    const nameInput = document.getElementById("input-text");
    const dateInput = document.getElementById("input-date");
    const statusInput = document.getElementById("input-status");
    const priorityInput = document.getElementById("input-priority");

    // Validate inputs
    if (!this.validateInput(nameInput.value, dateInput.value)) {
      return;
    }

    if (this.editingTaskId) {
      // Update existing task
      this.updateTask();
      return;
    }

    // Create new task
    const newTask = {
      id: this.generateId(),
      name: nameInput.value.trim(),
      date: dateInput.value,
      status: statusInput.value,
      priority: priorityInput.value,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.tasks.push(newTask);
    this.saveTasksToStorage();
    this.renderTasks();
    this.updateStats();
    this.resetForm();

    // Show success feedback
    this.showNotification("Task added successfully!", "success");
  }

  // Validate form inputs
  validateInput(name, date) {
    if (!name.trim()) {
      this.showNotification("Please enter a task name!", "error");
      document.getElementById("input-text").focus();
      return false;
    }

    if (!date) {
      this.showNotification("Please select a due date!", "error");
      document.getElementById("input-date").focus();
      return false;
    }

    // Check for duplicate task names (case insensitive)
    const duplicate = this.tasks.find(
      (task) =>
        task.name.toLowerCase() === name.toLowerCase() &&
        task.id !== this.editingTaskId,
    );

    if (duplicate) {
      this.showNotification("Task name already exists!", "error");
      document.getElementById("input-text").focus();
      return false;
    }

    return true;
  }

  // Render tasks to the DOM
  renderTasks() {
    const todoList = document.getElementById("todoList");
    const emptyState = document.getElementById("empty-state");

    // Clear current list
    todoList.innerHTML = "";

    // Filter tasks based on current filter
    const filteredTasks = this.filterTasksByStatus(this.currentFilter);

    if (filteredTasks.length === 0) {
      emptyState.style.display = "block";
      todoList.style.display = "none";
      return;
    }

    emptyState.style.display = "none";
    todoList.style.display = "block";

    // Render each task
    filteredTasks.forEach((task) => {
      const taskElement = this.createTaskElement(task);
      todoList.appendChild(taskElement);
    });

    // Update active filter button
    this.updateActiveFilterButton();
  }

  // Create HTML element for a task
  createTaskElement(task) {
    const taskDiv = document.createElement("div");
    taskDiv.className = "task-item";
    taskDiv.dataset.id = task.id;

    // Format date for display
    const displayDate = new Date(task.date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Get status and priority class names
    const statusClass = `status-${task.status.replace("-", "-")}`;
    const priorityClass = `priority-${task.priority}`;

    taskDiv.innerHTML = `
            <div class="task-name">
                <i class="fas fa-tasks"></i>
                <span>${task.name}</span>
            </div>
            <div class="task-date">${displayDate}</div>
            <div class="task-status ${statusClass}">
                <span class="status-indicator"></span>
                ${this.formatStatus(task.status)}
            </div>
            <div class="task-priority ${priorityClass}">
                ${this.formatPriority(task.priority)}
            </div>
            <div class="task-actions">
                <button class="btn btn-sm btn-primary" onclick="todoApp.editTask('${task.id}')">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-sm ${task.status === "done" ? "btn-secondary" : "btn-success"}" 
                        onclick="todoApp.toggleTaskStatus('${task.id}')">
                    <i class="fas ${task.status === "done" ? "fa-undo" : "fa-check"}"></i> 
                    ${task.status === "done" ? "Reopen" : "Complete"}
                </button>
                <button class="btn btn-sm btn-danger" onclick="todoApp.deleteTask('${task.id}')">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;

    return taskDiv;
  }

  // Format status for display
  formatStatus(status) {
    const statusMap = {
      "not-started": "Not Started",
      "in-progress": "In Progress",
      done: "Done",
    };
    return statusMap[status] || status;
  }

  // Format priority for display
  formatPriority(priority) {
    const priorityMap = {
      low: "Low",
      medium: "Medium",
      high: "High",
    };
    return priorityMap[priority] || priority;
  }

  // Edit a task
  editTask(taskId) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) return;

    this.editingTaskId = taskId;

    // Fill form with task data
    document.getElementById("input-text").value = task.name;
    document.getElementById("input-date").value = task.date;
    document.getElementById("input-status").value = task.status;
    document.getElementById("input-priority").value = task.priority;

    // Show update and cancel buttons, hide add button
    document.getElementById("btn-add").style.display = "none";
    document.getElementById("btn-update").style.display = "inline-flex";
    document.getElementById("btn-cancel").style.display = "inline-flex";

    // Focus on the task name input
    document.getElementById("input-text").focus();

    this.showNotification("Editing task...", "info");
  }

  // Update a task
  updateTask() {
    const nameInput = document.getElementById("input-text");
    const dateInput = document.getElementById("input-date");
    const statusInput = document.getElementById("input-status");
    const priorityInput = document.getElementById("input-priority");

    // Validate inputs
    if (!this.validateInput(nameInput.value, dateInput.value)) {
      return;
    }

    // Find and update task
    const taskIndex = this.tasks.findIndex((t) => t.id === this.editingTaskId);
    if (taskIndex === -1) return;

    this.tasks[taskIndex] = {
      ...this.tasks[taskIndex],
      name: nameInput.value.trim(),
      date: dateInput.value,
      status: statusInput.value,
      priority: priorityInput.value,
      updatedAt: new Date().toISOString(),
    };

    this.saveTasksToStorage();
    this.renderTasks();
    this.updateStats();
    this.resetForm();
    this.cancelEdit();

    this.showNotification("Task updated successfully!", "success");
  }

  // Cancel editing
  cancelEdit() {
    this.editingTaskId = null;
    this.resetForm();

    // Show add button, hide update and cancel buttons
    document.getElementById("btn-add").style.display = "inline-flex";
    document.getElementById("btn-update").style.display = "none";
    document.getElementById("btn-cancel").style.display = "none";
  }

  // Delete a task
  deleteTask(taskId) {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const taskName = this.tasks[taskIndex].name;
    this.tasks.splice(taskIndex, 1);

    this.saveTasksToStorage();
    this.renderTasks();
    this.updateStats();

    this.showNotification(`Task "${taskName}" deleted!`, "warning");
  }

  // Toggle task status (complete/reopen)
  toggleTaskStatus(taskId) {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const task = this.tasks[taskIndex];
    const newStatus = task.status === "done" ? "not-started" : "done";

    this.tasks[taskIndex] = {
      ...task,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    this.saveTasksToStorage();
    this.renderTasks();
    this.updateStats();

    const action = newStatus === "done" ? "completed" : "reopened";
    this.showNotification(`Task "${task.name}" ${action}!`, "success");
  }

  // Filter tasks by status
  filterTasks(filter) {
    this.currentFilter = filter;
    this.renderTasks();
    this.updateActiveFilterButton();
  }

  // Filter tasks based on current filter
  filterTasksByStatus(filter) {
    const today = new Date().toISOString().split("T")[0];

    switch (filter) {
      case "not-started":
        return this.tasks.filter((task) => task.status === "not-started");
      case "in-progress":
        return this.tasks.filter((task) => task.status === "in-progress");
      case "done":
        return this.tasks.filter((task) => task.status === "done");
      case "high":
        return this.tasks.filter((task) => task.priority === "high");
      case "today":
        return this.tasks.filter((task) => task.date === today);
      default:
        return [...this.tasks].sort(
          (a, b) => new Date(a.date) - new Date(b.date),
        );
    }
  }

  // Update active filter button
  updateActiveFilterButton() {
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      if (btn.dataset.filter === this.currentFilter) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
  }

  // Update statistics
  updateStats() {
    const total = this.tasks.length;
    const notStarted = this.tasks.filter(
      (task) => task.status === "not-started",
    ).length;
    const inProgress = this.tasks.filter(
      (task) => task.status === "in-progress",
    ).length;
    const done = this.tasks.filter((task) => task.status === "done").length;

    document.getElementById("total-tasks").textContent = `Total: ${total}`;
    document.getElementById("not-started-count").textContent =
      `Not Started: ${notStarted}`;
    document.getElementById("in-progress-count").textContent =
      `In Progress: ${inProgress}`;
    document.getElementById("done-count").textContent = `Done: ${done}`;
  }

  // Reset form
  resetForm() {
    document.getElementById("todo-form").reset();

    // Set today's date as default
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("input-date").value = today;
    document.getElementById("input-date").min = today;

    // Reset to default values
    document.getElementById("input-status").value = "not-started";
    document.getElementById("input-priority").value = "medium";
  }

  // Clear all tasks
  clearAllTasks() {
    if (this.tasks.length === 0) {
      this.showNotification("No tasks to clear!", "info");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to clear ALL tasks? This action cannot be undone.",
      )
    ) {
      return;
    }

    this.tasks = [];
    this.saveTasksToStorage();
    this.renderTasks();
    this.updateStats();

    this.showNotification("All tasks cleared!", "warning");
  }

  // Export tasks to JSON
  exportTasks() {
    if (this.tasks.length === 0) {
      this.showNotification("No tasks to export!", "info");
      return;
    }

    const exportData = {
      exportedAt: new Date().toISOString(),
      taskCount: this.tasks.length,
      tasks: this.tasks,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `todo-tasks-${new Date().toISOString().split("T")[0]}.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();

    this.showNotification(`Exported ${this.tasks.length} tasks!`, "success");
  }

  // Show import modal
  showImportModal() {
    document.getElementById("import-modal").style.display = "flex";
    document.getElementById("import-data").value = "";
    document.getElementById("import-data").focus();
  }

  // Hide import modal
  hideImportModal() {
    document.getElementById("import-modal").style.display = "none";
  }

  // Import tasks from JSON
  importTasks() {
    const importData = document.getElementById("import-data").value.trim();

    if (!importData) {
      this.showNotification("Please paste JSON data to import!", "error");
      return;
    }

    try {
      const parsedData = JSON.parse(importData);

      // Validate import data structure
      if (!parsedData.tasks || !Array.isArray(parsedData.tasks)) {
        throw new Error('Invalid import data format. Expected "tasks" array.');
      }

      // Merge imported tasks with existing ones
      const existingIds = new Set(this.tasks.map((task) => task.id));
      const newTasks = parsedData.tasks.filter(
        (task) => !existingIds.has(task.id),
      );

      if (newTasks.length === 0) {
        this.showNotification(
          "No new tasks to import (all tasks already exist)!",
          "info",
        );
        this.hideImportModal();
        return;
      }

      // Generate new IDs for imported tasks to avoid conflicts
      newTasks.forEach((task) => {
        task.id = this.generateId();
        task.createdAt = task.createdAt || new Date().toISOString();
        task.updatedAt = new Date().toISOString();
      });

      this.tasks.push(...newTasks);
      this.saveTasksToStorage();
      this.renderTasks();
      this.updateStats();
      this.hideImportModal();

      this.showNotification(
        `Imported ${newTasks.length} new tasks!`,
        "success",
      );
    } catch (error) {
      this.showNotification(`Import failed: ${error.message}`, "error");
      console.error("Import error:", error);
    }
  }

  // Show notification
  showNotification(message, type = "info") {
    // Remove any existing notification
    const existingNotification = document.querySelector(".notification");
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
            <i class="fas ${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
        `;

    // Add styles for notification
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideIn 0.3s ease-out;
        `;

    // Set background color based on type
    const colors = {
      success: "#4caf50",
      error: "#f44336",
      warning: "#ff9800",
      info: "#2196f3",
    };
    notification.style.backgroundColor = colors[type] || colors.info;

    // Add animation
    const style = document.createElement("style");
    style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
    document.head.appendChild(style);

    // Add to DOM
    document.body.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease-out";
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Get notification icon based on type
  getNotificationIcon(type) {
    const icons = {
      success: "fa-check-circle",
      error: "fa-exclamation-circle",
      warning: "fa-exclamation-triangle",
      info: "fa-info-circle",
    };
    return icons[type] || icons.info;
  }
}

// Initialize the application
const todoApp = new TodoApp();

// Test helper functions
if (typeof window !== "undefined") {
  // Add test button for manual testing
  document.addEventListener("DOMContentLoaded", function () {
    // Add test tasks button for development
    const testBtn = document.createElement("button");
    testBtn.id = "test-btn";
    testBtn.textContent = "Add Test Tasks";
    testBtn.style.cssText =
      "position: fixed; bottom: 20px; right: 20px; z-index: 9999; padding: 10px 20px; background: #333; color: white; border: none; border-radius: 5px; cursor: pointer;";
    testBtn.onclick = function () {
      if (window.todoApp) {
        // Clear existing tasks
        window.todoApp.tasks = [];

        // Add test tasks
        const testTasks = [
          {
            name: "Complete project proposal",
            date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            status: "in-progress",
            priority: "high",
          },
          {
            name: "Buy groceries",
            date: new Date().toISOString().split("T")[0],
            status: "not-started",
            priority: "medium",
          },
          {
            name: "Call dentist",
            date: new Date(Date.now() + 259200000).toISOString().split("T")[0],
            status: "not-started",
            priority: "low",
          },
          {
            name: "Finish report",
            date: new Date(Date.now() - 86400000).toISOString().split("T")[0],
            status: "done",
            priority: "high",
          },
          {
            name: "Schedule meeting",
            date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
            status: "in-progress",
            priority: "medium",
          },
        ];

        testTasks.forEach((task, index) => {
          window.todoApp.tasks.push({
            id: window.todoApp.generateId(),
            name: task.name,
            date: task.date,
            status: task.status,
            priority: task.priority,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        });

        window.todoApp.saveTasksToStorage();
        window.todoApp.renderTasks();
        window.todoApp.updateStats();
        window.todoApp.showNotification("Added 5 test tasks!", "success");
      }
    };
    document.body.appendChild(testBtn);

    console.log("Todo App initialized successfully!");
    console.log(
      "Available methods on todoApp:",
      Object.getOwnPropertyNames(Object.getPrototypeOf(window.todoApp)),
    );
  });
}
