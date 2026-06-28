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
const taskCard = document.querySelectorAll(".task-card");

// Function to open modal and set target column
function openModal(columnType) {
    taskColumnId.value = columnType; // Store which column (todo, progress, done) is targeted
    taskModal.classList.add("active");
    inputTitle.focus();
}

// Function to close modal and reset form inputs
function closeModal() {
    taskModal.classList.remove("active");
    taskForm.reset();
    taskColumnId.value = "";
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

// Handle Form Submission (Adding the new task card)
taskForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Prevent standard browser page reload on submit

    // 1. Retrieve and trim input values
    let title = inputTitle.value.trim();
    let desc = inputDesc.value.trim() || "No description provided.";
    let priority = inputPriority.value;
    let targetColType = taskColumnId.value || "todo";

    // 2. Generate today's date dynamically (e.g. "Jun 27, 2026")
    let today = new Date();
    let formattedDate = today.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });

    // 3. Select target task list based on targetColType
    let targetColumn = document.querySelector(`.${targetColType}-column`);
    let taskList = targetColumn.querySelector(".task-list");

    // 4. Create the task card element
    let taskCard = document.createElement("div");
    taskCard.className = "task-card";
    taskCard.innerHTML = `
        <div class="card-drag-handle">
            <i class="fa-solid fa-grip-vertical"></i>
        </div>
        <div class="card-content">
            <h3 class="task-title">${title}</h3>
            <p class="task-desc">${desc}</p>
            <div class="card-footer">
                <span class="priority-tag ${priority}">${priority}</span>
                <span class="task-date"><i class="fa-regular fa-calendar"></i> ${formattedDate}</span>
                <div class="card-actions">
                    <button class="action-btn edit-btn" title="Edit Task"><i class="fa-solid fa-pencil"></i></button>
                    <button class="action-btn delete-btn" title="Delete Task"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
        </div>
    `;

    // 5. Append card to list and close the modal
    taskList.appendChild(taskCard);
    closeModal();
});
// 1. Select the entire Kanban Board container
const board = document.querySelector(".kanban-board");

// 2. Listen to clicks on the entire board (Event Delegation)
board.addEventListener("click", (e) => {
    const card = e.target.closest(".task-card");
    const deleteBtn = e.target.closest(".delete-btn");
    const editBtn = e.target.closest(".edit-btn");
    const priorityTag = e.target.closest(".priority-tag");

    // 1. Handle Delete Button Click
    if (deleteBtn) {
        if (card) card.remove();
        return;
    }

    // 2. Handle Edit Button Click
    if (editBtn) {
        if (card) {
            const title = card.querySelector(".task-title");
            const desc = card.querySelector(".task-desc");
            const span = card.querySelector(".priority-tag");
            const icon = editBtn.querySelector("i");

            const isEditing = card.classList.toggle("editing");

            if (isEditing) {
                // Enter edit mode
                title.contentEditable = "true";
                desc.contentEditable = "true";
                title.focus();
                icon.className = "fa-solid fa-check";
                span.style.cursor = "pointer";
            } else {
                // Save and exit edit mode
                title.contentEditable = "false";
                desc.contentEditable = "false";
                icon.className = "fa-solid fa-pencil";
                span.style.cursor = "";
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
});



