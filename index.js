// TASK: import helper functions from utils
// TASK: import initialData
import { getTasks, createNewTask, patchTask, putTask, deleteTask } from './utils/taskFunctions.js'; 
import { initialData } from './initialData.js';


/*************************************************************************************************************************************************
 * FIX BUGS!!!
 * **********************************************************************************************************************************************/

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem('tasks')) {
    localStorage.setItem('tasks', JSON.stringify(initialData)); 
    localStorage.setItem('showSideBar', 'true');
  } else {
    console.log('Data already exists in localStorage');
  }
  
}

// TASK: Get elements from the DOM
const elements = {
  header: document.getElementById('header'),
  dropDownBtn: document.getElementById('dropdownBtn'),
  headerBoardName: document.getElementById('header-board-name'),
  sideBar: document.getElementById('side-bar-div'),
  sideBarBtn: document.getElementById('show-side-bar-btn'),
  filterDiv: document.getElementById('filterDiv'),
  columnDivs: document.querySelectorAll('.column-div'),
  editTaskModal: document.getElementById('edit-task-form'),
  hideSideBarBtn: document.getElementById('hide-side-bar-btn'),
  showSideBarBtn: document.getElementById('show-side-bar-btn'),
  addNewTaskBtn: document.getElementById('add-new-task-btn'),
  modalWindow: document.getElementById('new-task-modal-window'),
  themeSwitch: document.getElementById('switch'),
  saveChangesBtn: document.getElementById('save-task-changes-btn'),
  deleteTaskBtn: document.getElementById('delete-task-btn'),
  cancelTaskBtn: document.getElementById('cancel-edit-btn'),
  createTaskBtn: document.getElementById('create-task-btn'),
  editBoardBtn: document.getElementById('edit-board-btn'),
  editBoardDiv: document.getElementById('editBoardDiv'),
  boardsnavLinkDiv: document.getElementById('boards-nav-links-div'),
  sideBarBottomDiv: document.querySelector('side-bar-bottom'),
  
};

let activeBoard = ""

// Extracts unique board names from tasks
// TASK: FIX BUGS
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map(task => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard :  boards[0]; 
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
// TASK: Fix Bugs
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ''; // Clears the container
  boards.forEach(board => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => { 
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard))
      styleActiveBoard(activeBoard)
    });
    boardsContainer.appendChild(boardElement);
  });

}

// Filters tasks corresponding to the board name and displays them on the DOM.
// TASK: Fix Bugs
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter(task => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach(column => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    column.appendChild(tasksContainer);

    filteredTasks.filter(task => task.status === status).forEach(task => { 
      const taskElement = document.createElement("div");
      taskElement.classList.add("task-div");
      taskElement.textContent = task.title;
      taskElement.setAttribute('data-task-id', task.id);

      // Listen for a click event on each task and open a modal
      taskElement.addEventListener("click", () => { 
        openEditTaskModal(task);
      });

      tasksContainer.appendChild(taskElement);
    });
  });
}


function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class
// TASK: Fix Bugs
function styleActiveBoard(boardName) {
  document.querySelectorAll('.board-btn').forEach(btn => { 
    
    if(btn.textContent === boardName) {
      btn.classList.add('active') 
    }
    else {
      btn.classList.remove('active'); 
    }
  });
}


function addTaskToUI(task) {
  const column = document.querySelector(`.column-div[data-status="${task.status}"]`); 
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector('.tasks-container');
  if (!tasksContainer) {
    console.warn(`Tasks container not found for status: ${task.status}, creating one.`);
    tasksContainer = document.createElement('div');
    tasksContainer.className = 'tasks-container';
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement('div');
  taskElement.className = 'task-div';
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute('data-task-id', task.id);
  
  taskElement.addEventListener("click", () => {
    openEditTaskModal(task);
  });
  
  tasksContainer.appendChild(taskElement); 
}



function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  cancelEditBtn.addEventListener("click",() => {
    toggleModal(false, elements.editTaskModal)
  });

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById('cancel-add-task-btn');
  cancelAddTaskBtn.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener('click', () => {
    toggleModal(false);
    elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // Theme switch event listener
  elements.themeSwitch.addEventListener('change', toggleTheme);

  // Show Add New Task Modal event listener
  elements.addNewTaskBtn.addEventListener('click', () => {
    toggleModal(true);
    elements.filterDiv.style.display = 'block'; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.createTaskBtn.addEventListener('click',  (event) => {
    addTask(event);
  });
}

// Toggles tasks modal
// Task: Fix bugs
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? 'block' : 'none'; 
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault(); 

  //Assign user input to the task object
    const task = {
      title: document.getElementById('title-input').value.trim(),
      description: document.getElementById('desc-input').value.trim(),
      status: document.getElementById('select-status').value,
      board: activeBoard
    };

    //Validation before creating task
    if (task.title.trim() === '') {
      alert('Please enter a title for your TASK! 🤔');
      return;
    }

    if (task.description.trim() === '') {
      alert('Please describe your TASK! 🤔');
      return;
    }
/*
    //Check if task already exist in the storage
    let existingTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let isTitleDuplicate = existingTasks.some(existingTask => existingTask.title === task.title);
    let isDescriptionDuplicate = existingTasks.some(existingTask => existingTask.description === task.description);

    if (isTitleDuplicate) {
      alert('This title already exists! Please enter a new title. 🤔');
      return;
    }

    if (isDescriptionDuplicate) {
      alert('There is a task with this description, Please check or enter a new task. 🤔');
      return;
    }
*/
    
 // Check if task already exists in the list
let existingTasks = JSON.parse(localStorage.getItem('tasks')) || [];

let isTitleDuplicate = existingTasks.some(existingTask => 
  (existingTask.title || '').toLowerCase() === task.title.toLowerCase() // Add fallback for missing titles
);
let isDescriptionDuplicate = existingTasks.some(existingTask => 
  (existingTask.description || '').toLowerCase() === task.description.toLowerCase() // Add fallback for missing descriptions
);

if (isTitleDuplicate) {
  alert('This title already exists! Please enter a new title. 🤔');
  return;
}

if (isDescriptionDuplicate) {
  alert('There is a task with this description. Please check or enter a new task. 🤔');
  return;
}


    const newTask = createNewTask(task);
    if (newTask) {

    //Add task to UI
      addTaskToUI(task);
      toggleModal(false);
      elements.filterDiv.style.display = 'none'; // Also hide the filter overlay
      document.getElementById('title-input').value = '';
      document.getElementById('desc-input').value = '';
      refreshTasksUI();
    }
}


function toggleSidebar(show) {
  if (show) {
    elements.sideBar.style.display = 'block';
    elements.showSideBarBtn.style.display = 'none';
  } else {
    elements.sideBar.style.display = 'none';
    elements.showSideBarBtn.style.display = 'block';
  }
  localStorage.setItem('showSideBar', show.toString());
}

function toggleTheme() {
  const isLightTheme = document.body.classList.toggle('light-theme');
  localStorage.setItem('light-theme', isLightTheme ? 'enabled' : 'disabled');
}



function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById('edit-task-title-input').value = task.title;
  document.getElementById('edit-task-desc-input').value = task.description;
  document.getElementById('edit-select-status').value = task.status;

  // Get button elements from the task modal
  /*
  const saveChangesBtn = document.getElementById('save-task-changes-btn');
  const deleteTaskBtn = document.getElementById('delete-task-btn');
  const cancelTaskBtn = document.getElementById('cancel-edit-btn');
  */

  // Call saveTaskChanges upon click of Save Changes button
  elements.saveChangesBtn.addEventListener('click', () => {
    saveTaskChanges(task.id);
  });

  // Delete task using a helper function and close the task modal
  elements.deleteTaskBtn.addEventListener('click', () => {
    deleteTask(task.id);
    toggleModal(false, elements.editTaskModal);
    refreshTasksUI();
  });
  console.log('Opening modal for task:', task);

  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const updateTaskTitle = document.getElementById('edit-task-title-input').value;
  const updateTaskDesc = document.getElementById('edit-task-desc-input').value;
  const updateSelectedStatus = document.getElementById('edit-select-status').value;

  // Create an object with the updated task details
  const updatedTask = {
    title: updateTaskTitle,
    description: updateTaskDesc,
    status: updateSelectedStatus,
  }

  //Validation before creating task
  if (updatedTask.title.trim() === '') {
    alert('Please enter a title for your TASK! 🤔');
    return;
  }

  if (updatedTask.description.trim() === '') {
    alert('Please describe your TASK! 🤔');
    return;
  }

  // Update task using a hlper functoin
  patchTask(taskId, updatedTask);

  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener('DOMContentLoaded', function() {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem('showSideBar') === 'true';
  toggleSidebar(showSidebar);
  const isLightTheme = localStorage.getItem('light-theme') === 'enabled';
  document.body.classList.toggle('light-theme', isLightTheme);
  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}




//display button for deleting boards
   elements.editBoardBtn.addEventListener('click', () => {
    
      if (elements.editBoardDiv.style.display === 'none') {
        elements.editBoardDiv.style.display = 'block';
      } else {
        elements.editBoardDiv.style.display = 'none';
      }
      // Check if the screen size is small and dropdown side bar
      if (window.matchMedia('(max-width: 480px)').matches) { 
      dropdownSideBar();
    };
    
  });


// Helper function to update the display of the sidebar based on screen size
const updateSideBarDisplay = (isMobile) => {
  if (!elements || !elements.sideBar) {
    console.error('elements.sideBar is undefined');
    return;
  }
  elements.sideBar.style.display = isMobile ? 'none' : 'flex';
};

// Handle screen size change (mobile vs desktop)
const handleScreenSizeChange = (event) => {
  updateSideBarDisplay(event.matches);
};

// Set up media query listener
const mediaQuery = window.matchMedia('(max-width: 480px)');
mediaQuery.addEventListener('change', handleScreenSizeChange);
handleScreenSizeChange(mediaQuery); // Initial check for screen size

// Toggle sidebar visibility on button click
let isSideBarVisible = true;

const dropdownSideBar = () => {
  isSideBarVisible = !isSideBarVisible;
  elements.sideBar.style.display = isSideBarVisible ? 'flex' : 'none';

};

elements.dropDownBtn.addEventListener('click', dropdownSideBar);
