const form = document.querySelector("form");
const pass = document.querySelector("#pass");
const confirmPass = document.querySelector("#confirmPass");
const message = document.querySelector("#message");
const nameInput = document.querySelector("#name");
const emailInput = document.querySelector("input[type='email']");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  message.textContent = "";

  if (!nameInput.value.trim()) {
    message.textContent = "Name can't be empty!";
    return;
  }

  if (!emailInput?.value.trim()) {
    message.textContent = "Email can't be empty!";
    return;
  }

  if (pass.value.length <= 8) {
    message.textContent = "Password should be greater than 8 characters!";
    document.body.style.backgroundColor = "rgb(235, 68, 68)";
    return;
  }

  if (pass.value !== confirmPass.value) {
    message.textContent = "Passwords do not match!";
    document.body.style.backgroundColor = "rgb(235, 68, 68)";
    return;
  }

  message.textContent = "Your form is submitted.";
  document.body.style.backgroundColor = "skyBlue";
});
