// Select DOM elements for Modal and Form
const taskModal = document.getElementById("taskModal");
const taskForm = document.getElementById("taskForm");
const closeModalBtn = document.getElementById("closeModalBtn");
const cancelModalBtn = document.getElementById("cancelModalBtn");

const inputTitle = document.getElementById("inputTitle");
const inputDesc = document.getElementById("inputDesc");
const inputPriority = document.getElementById("inputPriority");
const taskColumnId = document.getElementById("taskColumnId");

// Select Board buttons
const addButtons = document.querySelectorAll(".add-task-btn");
const floatingNewTaskBtn = document.querySelector(".floating-new-task-btn");

// Function to open modal and set target column
function openModal(columnType) {
    taskColumnId.value = columnType; // Store which column (todo, progress, done) is targeted
    taskModal.classList.add("active");
    inputTitle.focus();

    // Reset modal character counters
    const titleCharCount = document.getElementById("titleCharCount");
    if (titleCharCount) titleCharCount.innerText = "0/100";
    
    const descCharCount = document.getElementById("descCharCount");
    if (descCharCount) descCharCount.innerText = "0/100";
}

function closeModal() {
    taskModal.classList.remove("active");
    taskForm.reset();
    taskColumnId.value = "";

    // Reset custom dropdown state
    const priorityDropdown = document.getElementById("priorityDropdown");
    const selectedVal = document.querySelector("#dropdownTrigger .selected-val");
    const hiddenInputPriority = document.getElementById("inputPriority");
    const dropdownOptions = document.getElementById("dropdownOptions");

    if (priorityDropdown) {
        priorityDropdown.classList.remove("active");
    }
    if (selectedVal) {
        selectedVal.innerText = "Low";
        selectedVal.setAttribute("data-value", "low");
    }
    if (hiddenInputPriority) {
        hiddenInputPriority.value = "low";
    }
    if (dropdownOptions) {
        dropdownOptions.querySelectorAll(".option-item").forEach(opt => {
            if (opt.getAttribute("data-value") === "low") {
                opt.classList.add("active");
            } else {
                opt.classList.remove("active");
            }
        });
    }
}

// Attach open handlers to all column "+ Add Task" buttons
addButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
        let parentColumn = btn.closest(".board-column");
        let columnType = "todo";

        // Determine column type based on its class
        if (parentColumn.classList.contains("progress-column")) {
            columnType = "progress";
        } else if (parentColumn.classList.contains("done-column")) {
            columnType = "done";
        }

        openModal(columnType);
    });
});

// Attach open handler to the bottom-left floating "+ New Task" button (defaults to 'todo')
if (floatingNewTaskBtn) {
    floatingNewTaskBtn.addEventListener("click", () => {
        openModal("todo");
    });
}

// Attach close handlers
closeModalBtn.addEventListener("click", closeModal);
cancelModalBtn.addEventListener("click", closeModal);

// Close modal if user clicks on the backdrop blur overlay
taskModal.addEventListener("click", (e) => {
    if (e.target === taskModal) {
        closeModal();
    }
});

// Function to dynamically create a task card in the DOM
function createTaskCardDOM(title, desc, priority, date, columnId) {
    let targetColumn = document.querySelector(`.${columnId}-column`);
    if (!targetColumn) return null;
    let taskList = targetColumn.querySelector(".task-list");

    let taskCard = document.createElement("div");
    taskCard.className = "task-card";
    taskCard.setAttribute("draggable", "true");
    
    // Capitalize priority for display text
    const displayPriority = priority.charAt(0).toUpperCase() + priority.slice(1);

    taskCard.innerHTML = `
        <div class="card-drag-handle">
            <i class="fa-solid fa-grip-vertical"></i>
        </div>
        <div class="card-content">
            <h3 class="task-title">${title}</h3>
            <p class="task-desc">${desc}</p>
            <div class="card-footer">
                <span class="priority-tag ${priority}">${displayPriority}</span>
                <span class="task-date"><i class="fa-regular fa-calendar"></i> ${date}</span>
                <div class="card-actions">
                    <button class="action-btn edit-btn" title="Edit Task"><i class="fa-solid fa-pencil"></i></button>
                    <button class="action-btn delete-btn" title="Delete Task"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        </div>
    `;

    taskList.appendChild(taskCard);
    return taskCard;
}

// Handle Form Submission (Adding the new task card)
taskForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent standard browser page reload on submit

    // 1. Retrieve and trim input values
    let title = inputTitle.value.trim();
    let desc = inputDesc.value.trim() || "No description provided.";
    let priority = inputPriority.value;
    let targetColType = taskColumnId.value || "todo";

    // Validation (silent truncation fallback, inputs are capped at 100 chars max)
    if (title.length > 100) {
        title = title.substring(0, 100);
    }
    if (desc.length > 100) {
        desc = desc.substring(0, 100);
    }

    // 2. Generate today's date dynamically (e.g. "Jun 27, 2026")
    let today = new Date();
    let formattedDate = today.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    // 3. Create and append the card
    createTaskCardDOM(title, desc, priority, formattedDate, targetColType);
    
    // Save to LocalStorage
    saveTasksToLocalStorage();
    
    applyFilters();
    closeModal();
});
// Helper function to put a card in Edit Mode
function editCard(card) {
    if (!card) return;
    const title = card.querySelector(".task-title");
    const desc = card.querySelector(".task-desc");
    const span = card.querySelector(".priority-tag");
    const editBtn = card.querySelector(".edit-btn");
    const icon = editBtn.querySelector("i");

    card.classList.add("editing");
    card.setAttribute("draggable", "false");

    title.contentEditable = "true";
    desc.contentEditable = "true";
    title.focus();
    icon.className = "fa-solid fa-check";
    span.style.cursor = "pointer";

    // Show/create Title Character Counter
    let titleCounter = card.querySelector(".title-char-counter");
    if (!titleCounter) {
        titleCounter = document.createElement("span");
        titleCounter.className = "title-char-counter";
        title.parentNode.insertBefore(titleCounter, title.nextSibling);
    }
    titleCounter.innerText = `${title.innerText.length}/100`;
    titleCounter.style.display = "block";

    // Show/create Description Character Counter
    let descCounter = card.querySelector(".desc-char-counter");
    if (!descCounter) {
        descCounter = document.createElement("span");
        descCounter.className = "desc-char-counter";
        desc.parentNode.insertBefore(descCounter, desc.nextSibling);
    }
    descCounter.innerText = `${desc.innerText.length}/100`;
    descCounter.style.display = "block";
}

// Helper function to Save and Lock a card
function saveCard(card) {
    if (!card) return false;
    const title = card.querySelector(".task-title");
    const desc = card.querySelector(".task-desc");
    const span = card.querySelector(".priority-tag");
    const editBtn = card.querySelector(".edit-btn");
    const icon = editBtn.querySelector("i");

    let titleText = title.innerText.trim();
    let descText = desc.innerText.trim();

    // Silent truncation for Title (max 100 characters)
    if (titleText.length > 100) {
        titleText = titleText.substring(0, 100);
        title.innerText = titleText;
    }

    // Silent truncation for Description (max 100 characters)
    if (descText.length > 100) {
        descText = descText.substring(0, 100);
        desc.innerText = descText;
    }

    card.classList.remove("editing");
    card.setAttribute("draggable", "true");

    title.contentEditable = "false";
    desc.contentEditable = "false";
    icon.className = "fa-solid fa-pencil";
    span.style.cursor = "";

    // Hide the counters
    const titleCounter = card.querySelector(".title-char-counter");
    if (titleCounter) titleCounter.style.display = "none";

    const descCounter = card.querySelector(".desc-char-counter");
    if (descCounter) descCounter.style.display = "none";

    // Save state to LocalStorage
    saveTasksToLocalStorage();

    return true;
}

// 1. Select the entire Kanban Board container
const board = document.querySelector(".kanban-board");

// 2. Listen to clicks on the entire board (Event Delegation)
board.addEventListener("click", (e) => {
    const card = e.target.closest(".task-card");
    const deleteBtn = e.target.closest(".delete-btn");
    const editBtn = e.target.closest(".edit-btn");
    const priorityTag = e.target.closest(".priority-tag");

    // 0. Auto-save if clicking outside the card that is currently being edited
    const editingCard = document.querySelector(".task-card.editing");
    if (editingCard && !editingCard.contains(e.target)) {
        saveCard(editingCard);
    }

    // 1. Handle Delete Button Click
    if (deleteBtn) {
        if (card) {
            card.remove();
            checkEmptyColumns();
            saveTasksToLocalStorage();
        }
        return;
    }

    // 2. Handle Edit Button Click
    if (editBtn) {
        if (card) {
            const isEditing = card.classList.contains("editing");
            if (isEditing) {
                const saved = saveCard(card);
                if (!saved) return; // Stop if validation failed
            } else {
                editCard(card);
            }
        }
        return;
    }

    // 3. Handle Priority Tag Click (only when card is in edit mode)
    if (priorityTag && card && card.classList.contains("editing")) {
        const priorities = ["low", "medium", "high"];
        const currentPriority = priorities.find(p => priorityTag.classList.contains(p)) || "low";
        const nextIndex = (priorities.indexOf(currentPriority) + 1) % priorities.length;
        const nextPriority = priorities[nextIndex];

        priorityTag.className = `priority-tag ${nextPriority}`;
        priorityTag.innerText = nextPriority.charAt(0).toUpperCase() + nextPriority.slice(1);
        return;
    }

    // 4. Handle Card Toggle Click
    if (card) {
        const currentlyActive = document.querySelector(".task-card.active-card");
        if (currentlyActive && currentlyActive !== card) {
            currentlyActive.classList.remove("active-card");
        }
        card.classList.toggle("active-card");
    }
});

// 3. Listen to keyboard press for saving with "Enter"
board.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        const card = e.target.closest(".task-card");
        if (card && card.classList.contains("editing")) {
            e.preventDefault(); // Prevent standard Enter behavior (newline)
            const editBtn = card.querySelector(".edit-btn");
            if (editBtn) editBtn.click(); // Trigger the edit save logic
        }
    }
}
);

// --- DRAG AND DROP FUNCTIONALITY ---

// 2. Drag Start and Drag End events on the board (Event Delegation)
board.addEventListener("dragstart", (e) => {
    const card = e.target.closest(".task-card");
    // Make sure we aren't dragging inputs/buttons inside the card
    if (card && !card.classList.contains("editing")) {
        card.classList.add("dragging");
    }

});

board.addEventListener("dragend", (e) => {
    const card = e.target.closest(".task-card");
    if (card) {
        card.classList.remove("dragging");
        checkEmptyColumns();
        saveTasksToLocalStorage();
    }
});

// 3. Drop zones (task lists in each column)
const taskLists = document.querySelectorAll(".task-list");
taskLists.forEach(taskList => {
    taskList.addEventListener("dragover", (e) => {
        e.preventDefault(); // Crucial: Allows dropping!
        const draggingCard = document.querySelector(".task-card.dragging");
        if (draggingCard) {
            const afterElement = getDragAfterElement(taskList, e.clientY);
            if (afterElement == null) {
                taskList.appendChild(draggingCard);
            } else {
                taskList.insertBefore(draggingCard, afterElement);
            }
        }
    });
});

// Helper function to find the slot where the card should be inserted
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll(".task-card:not(.dragging)")];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}



const search = document.querySelector(".search-input");
const priorityFilter = document.querySelector("#priorityFilter");
function applyFilters() {
    const query = search.value.toLowerCase().trim();
    const selected = priorityFilter.value;
    const cards = document.querySelectorAll(".task-card");
    cards.forEach(card => {
        const titleText = card.querySelector(".task-title").innerText.toLowerCase();
        const descText = card.querySelector(".task-desc").innerText.toLowerCase();
        const tag = card.querySelector(".priority-tag");
        const searchMatch = titleText.includes(query) || descText.includes(query);
        const priorityMatch = selected === "all" || tag.classList.contains(selected);
        if (searchMatch && priorityMatch) {
            card.style.display = "";
        }
        else {
            card.style.display = "none";
        }
    });
    checkEmptyColumns();
}
search.addEventListener("input", applyFilters);
priorityFilter.addEventListener("input", applyFilters);

// --- MODAL COUNTERS AND INPUT LIMITS ---
inputTitle.addEventListener("input", () => {
    const titleCharCount = document.getElementById("titleCharCount");
    if (titleCharCount) {
        titleCharCount.innerText = `${inputTitle.value.length}/100`;
    }
});

inputDesc.addEventListener("input", () => {
    const descCharCount = document.getElementById("descCharCount");
    if (descCharCount) {
        descCharCount.innerText = `${inputDesc.value.length}/100`;
    }
});

// --- IN-PLACE CARD COUNTERS AND INPUT LIMITS (EVENT DELEGATION) ---
board.addEventListener("input", (e) => {
    const card = e.target.closest(".task-card");
    if (!card || !card.classList.contains("editing")) return;

    const titleTarget = e.target.closest(".task-title");
    const descTarget = e.target.closest(".task-desc");

    if (titleTarget) {
        const titleCounter = card.querySelector(".title-char-counter");
        if (titleCounter) {
            titleCounter.innerText = `${titleTarget.innerText.length}/100`;
        }
    } else if (descTarget) {
        const descCounter = card.querySelector(".desc-char-counter");
        if (descCounter) {
            descCounter.innerText = `${descTarget.innerText.length}/100`;
        }
    }
});

board.addEventListener("keydown", (e) => {
    const card = e.target.closest(".task-card");
    if (!card || !card.classList.contains("editing")) return;

    const titleTarget = e.target.closest(".task-title");
    const descTarget = e.target.closest(".task-desc");

    if (!titleTarget && !descTarget) return;

    const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Tab", "Escape", "Enter"];
    if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) {
        return;
    }

    if (titleTarget) {
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : "";
        if (titleTarget.innerText.length - selectedText.length >= 100) {
            e.preventDefault();
        }
    } else if (descTarget) {
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : "";
        if (descTarget.innerText.length - selectedText.length >= 100) {
            e.preventDefault();
        }
    }
});

board.addEventListener("paste", (e) => {
    const card = e.target.closest(".task-card");
    if (!card || !card.classList.contains("editing")) return;

    const titleTarget = e.target.closest(".task-title");
    const descTarget = e.target.closest(".task-desc");
    const targetElement = titleTarget || descTarget;

    if (targetElement) {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text');
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString() : "";
        const currentLength = targetElement.innerText.length - selectedText.length;
        const remaining = 100 - currentLength;
        if (remaining > 0) {
            const truncated = text.substring(0, remaining);
            document.execCommand("insertText", false, truncated);
            
            const isTitle = (targetElement === titleTarget);
            const counterSelector = isTitle ? ".title-char-counter" : ".desc-char-counter";
            const counter = card.querySelector(counterSelector);
            if (counter) {
                counter.innerText = `${targetElement.innerText.length}/100`;
            }
        }
    }
});

document.querySelectorAll(".board-column").forEach(column => {
    const taskList = column.querySelector(".task-list");

    const messageDiv = document.createElement("div");
    messageDiv.className = "no-tasks-message";
    messageDiv.innerText = "No tasks found";

    taskList.appendChild(messageDiv);
});

// Run once on load to hide placeholders in columns that already have tasks
checkEmptyColumns();

function checkEmptyColumns() {
    document.querySelectorAll(".board-column").forEach(column => {
        let cnt = 0;
        const cards = column.querySelectorAll(".task-card");
        cards.forEach(card => {
            if (card.style.display != "none") {
                cnt++;
            }
        });
        
        const emptyMessage = column.querySelector(".no-tasks-message");
        if (cnt == 0) {
            emptyMessage.style.display = "block";
        }
        else {
            emptyMessage.style.display = "none";
        }

        // Dynamically update the count badge in the column header
        const badge = column.querySelector(".task-count-badge");
        if (badge) {
            badge.innerText = cards.length;
        }
    });
}

// Theme Toggle Functionality
const themeToggleBtn = document.getElementById("themeToggleBtn");

// Check if dark theme was previously selected
const savedTheme = localStorage.getItem("theme") || "light";
if (savedTheme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
    if (themeToggleBtn) {
        const icon = themeToggleBtn.querySelector("i");
        if (icon) {
            icon.className = "fa-solid fa-sun";
        }
    }
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener("click", () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const icon = themeToggleBtn.querySelector("i");
        
        if (currentTheme === "dark") {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
            if (icon) {
                icon.className = "fa-regular fa-moon";
            }
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
            if (icon) {
                icon.className = "fa-solid fa-sun";
            }
        }
    });
}

// LocalStorage task serialization
function saveTasksToLocalStorage() {
    const tasks = [];
    document.querySelectorAll(".board-column").forEach(column => {
        let columnId = "todo";
        if (column.classList.contains("progress-column")) {
            columnId = "progress";
        } else if (column.classList.contains("done-column")) {
            columnId = "done";
        }

        column.querySelectorAll(".task-card").forEach(card => {
            const title = card.querySelector(".task-title").innerText.trim();
            const desc = card.querySelector(".task-desc").innerText.trim();
            const priorityTag = card.querySelector(".priority-tag");
            let priority = "low";
            if (priorityTag.classList.contains("high")) {
                priority = "high";
            } else if (priorityTag.classList.contains("medium")) {
                priority = "medium";
            }
            const date = card.querySelector(".task-date").innerText.trim();

            tasks.push({ title, desc, priority, date, columnId });
        });
    });
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
    const tasksData = localStorage.getItem("tasks");
    if (!tasksData) return; // Keep default template tasks if none stored
    
    // Clear initial template tasks
    document.querySelectorAll(".board-column .task-list").forEach(list => {
        list.querySelectorAll(".task-card").forEach(card => card.remove());
    });

    const tasks = JSON.parse(tasksData);
    tasks.forEach(task => {
        createTaskCardDOM(task.title, task.desc, task.priority, task.date, task.columnId);
    });

    checkEmptyColumns();
}

// Initial task load
loadTasksFromLocalStorage();

// Custom Dropdown Event Listeners
const priorityDropdown = document.getElementById("priorityDropdown");
const dropdownTrigger = document.getElementById("dropdownTrigger");
const dropdownOptions = document.getElementById("dropdownOptions");
const selectedVal = document.querySelector("#dropdownTrigger .selected-val");
const hiddenInputPriority = document.getElementById("inputPriority");

if (dropdownTrigger) {
    dropdownTrigger.addEventListener("click", (e) => {
        e.stopPropagation();
        if (priorityDropdown) {
            priorityDropdown.classList.toggle("active");
        }
    });
}

if (dropdownOptions) {
    dropdownOptions.querySelectorAll(".option-item").forEach(option => {
        option.addEventListener("click", () => {
            const val = option.getAttribute("data-value");
            const text = option.innerText;

            if (hiddenInputPriority) {
                hiddenInputPriority.value = val;
            }

            if (selectedVal) {
                selectedVal.innerText = text;
                selectedVal.setAttribute("data-value", val);
            }

            dropdownOptions.querySelectorAll(".option-item").forEach(opt => opt.classList.remove("active"));
            option.classList.add("active");

            if (priorityDropdown) {
                priorityDropdown.classList.remove("active");
            }
        });
    });
}

// Close custom dropdown on click outside
document.addEventListener("click", (e) => {
    if (priorityDropdown && !priorityDropdown.contains(e.target)) {
        priorityDropdown.classList.remove("active");
    }
});
