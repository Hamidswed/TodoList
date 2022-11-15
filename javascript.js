function deleteTodoItem (todoText){
  const todoElement = document.getElementById(todoText)
  todoElement.remove()
}

function addTodoList(inputText, inputDate, inputStatus) {
  const todoList = document.getElementById("todoList");
  const todoWrapper = document.createElement("div");
  todoWrapper.id = inputText.value
  const todoItem = `<div class=${inputStatus.value}>
  <p>Name: ${inputText.value} Date: ${inputDate.value}</p>
  <button class='del-btn' onclick='deleteTodoItem("${todoWrapper.id}")'>Delete</button></div>`;
  todoWrapper.innerHTML = todoItem;
  todoList.appendChild(todoWrapper);
  nameArray.push(inputText.value);
  
}

function validation(inputText, inputDate) {
  if (!inputText.value) {
    alert("Please enter task name!");
    return false;
  }
  if (!inputDate.value) {
    alert("Please enter task date!");
    return false;
  }
  if (nameArray.some((item) => item === inputText.value)) {
    alert("Task name should be unique!");
    return false;
  }
  return true;
}

function resetForm(inputText, inputDate, inputStatus) {
  inputText.value = "";
  inputDate.value = "";
  inputStatus.value = "";
}

const submitBtn = document.getElementById("btn");
const nameArray = [];
submitBtn.addEventListener("click", (event) => {
  event.preventDefault();

  const inputText = document.getElementById("input-text");
  const inputDate = document.getElementById("input-date");
  const inputStatus = document.getElementById("input-status");

  const isValid = validation(inputText, inputDate);
  if (!isValid) return;

  addTodoList(inputText, inputDate, inputStatus);
  resetForm(inputText, inputDate, inputStatus);
});
