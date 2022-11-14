const submitBtn = document.getElementById("btn");
submitBtn.addEventListener("click", (event) => {
  const inputText = document.getElementById("input-text").value;
  const inputDate = document.getElementById("input-date").value;
  const inputStatuse = document.getElementById("input-option").value;
  const result = `Name: ${inputText} Date: ${inputDate} `;
  const deleteBtn1 = `<button class="del-btn" onClick='document.getElementById("not-start").innerHTML = "Not started"'>Delete</button>`;
  const deleteBtn2 = `<button class="del-btn" onClick='document.getElementById("in-prog").innerHTML = "In progress"'>Delete</button>`;
  const deleteBtn3 = `<button class="del-btn" onClick='document.getElementById("done").innerHTML = "Done"'>Delete</button>`;
  // const parStart = document.createElement("p");
  // parStart.setAttribute("id", "new-start");
  const divStart = document.getElementById("box1");
  {
    if (inputText.length==0) alert("Please enter the task name");
    else if (inputDate.length==0) alert("Please enter the task date");
    else {
      {
        inputStatuse === "Not started"
          ? (document.getElementById("not-start").innerHTML = result + deleteBtn1)
          : null;
      }
      {
        inputStatuse === "In progress"
          ? (document.getElementById("in-prog").innerHTML = result + deleteBtn2)
          : null;
      }
      {
        inputStatuse === "Done"
          ? (document.getElementById("done").innerHTML = result + deleteBtn3)
          : null;
      }
    }
  }
  event.preventDefault();
});
document.getElementById("input-text").value = "";
document.getElementById("input-date").value = "";
// deleteBtn.addEventListener("click", (e) => {
//     document.getElementById("not-start").innerHTML = "Not started";
//     e.preventDefault();
//   });
