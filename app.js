const list = document.querySelector("#todoList");
const addButton = document.querySelector("#addButton");
const dialog = document.querySelector("#todoDialog");
const saveButton = document.querySelector("#saveButton");
const exportBtn = document.getElementById("exportBtn");
const importBtn = document.getElementById("importBtn");
const importFile = document.getElementById("importFile");

let todos = JSON.parse(localStorage.getItem("todos") || "[]");

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function renderTodos() {
  list.innerHTML = "";
  todos.forEach((todo, index) => {
    const li = document.createElement("li");
    li.draggable = true;
    li.dataset.index = index;

    const header = document.createElement("div");
    header.className = "todo-header";

    const title = document.createElement("h2");
    title.className = "todo-title";
    title.textContent = todo.title;

    const delBtn = document.createElement("button");
    delBtn.textContent = "❌";
    delBtn.className = "delete";
    delBtn.onclick = () => {
      todos.splice(index, 1);
      saveTodos();
      renderTodos();
    };

    header.appendChild(title);
    header.appendChild(delBtn);
    li.appendChild(header);

    if (todo.description) {
      const desc = document.createElement("div");
      desc.className = "todo-desc";
      desc.textContent = todo.description;
      li.appendChild(desc);
    }

    if (todo.date) {
      const dateRow = document.createElement("div");
      dateRow.className = "todo-date";
      dateRow.textContent = `Due: ${todo.date}`;
      li.appendChild(dateRow);
    }

    list.appendChild(li);
  });

  // Attach drag events after rendering
  addDragAndDrop();
}

addButton.onclick = () => dialog.showModal();

saveButton.onclick = (e) => {
  e.preventDefault();
  const newTodo = {
    title: document.querySelector("#titleInput").value,
    description: document.querySelector("#descInput").value,
    date: document.querySelector("#dateInput").value
  };
  todos.push(newTodo);
  saveTodos();
  renderTodos();
  dialog.close();
  document.querySelector("#todoForm").reset();
};

// Export JSON
exportBtn.addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(todos, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "todos.json";
  a.click();
  URL.revokeObjectURL(url);
});

// Import JSON
importBtn.addEventListener("click", () => importFile.click());
importFile.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        todos = imported;
        saveTodos();
        renderTodos();
        alert("Todos imported!");
      } else {
        alert("Invalid JSON file.");
      }
    } catch {
      alert("Error parsing JSON file.");
    }
  };
  reader.readAsText(file);
});

function addDragAndDrop() {
  let dragEl = null;
  let dropIndicator = document.createElement("div");
  dropIndicator.className = "drop-indicator";

  function removeDropIndicator() {
    document.querySelectorAll('.drop-indicator').forEach(ind => {
      if (ind.parentNode) ind.parentNode.removeChild(ind);
    });
  }

  list.querySelectorAll("li").forEach(li => {
    li.addEventListener("dragstart", e => {
      dragEl = li;
      li.classList.add("dragging");
      removeDropIndicator();
    });

    li.addEventListener("dragend", e => {
      li.classList.remove("dragging");
      dragEl = null;
      removeDropIndicator();
    });

    li.addEventListener("dragover", e => {
      e.preventDefault();
      const afterElement = getDragAfterElement(e.clientY);
      removeDropIndicator();
      if (afterElement == null) {
        list.appendChild(dropIndicator);
      } else {
        list.insertBefore(dropIndicator, afterElement);
      }
    });

    li.addEventListener("dragleave", () => {
      removeDropIndicator();
    });
  });

  list.addEventListener("dragover", e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(e.clientY);
    removeDropIndicator();
    if (afterElement == null) {
      list.appendChild(dropIndicator);
    } else {
      list.insertBefore(dropIndicator, afterElement);
    }
  });

  list.addEventListener("dragleave", () => {
    removeDropIndicator();
  });
}

function getDragAfterElement(y) {
  const draggableElements = [...list.querySelectorAll("li:not(.dragging)")];
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

// Save order when drop finishes
list.addEventListener("drop", () => {
  todos = [...list.querySelectorAll("li")].map(li => {
    const idx = parseInt(li.dataset.index);
    return todos[idx];
  });
  saveTodos();
  renderTodos();
});

renderTodos();
