const form = document.querySelector("form");
const login = document.querySelector(".login-btn");
const pass = document.querySelector("#pass");
const toggleVisibility = document.querySelector("#toggleVisibility");

document.body.style.userSelect = "none";

toggleVisibility.addEventListener("change", function () {
  if (this.checked) {
    pass.type = "text";
  } else {
    pass.type = "password";
  }
});
form.addEventListener("submit", (e) => {
  e.preventDefault();
  login.style.backgroundColor = "red";
});
