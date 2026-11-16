
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const loginForm = document.getElementById("loginForm");
const message = document.getElementById("message");

// Show / Hide Password
togglePassword.addEventListener("click", function () {

    if (password.type === "password") {
        password.type = "text";
        togglePassword.innerText = "Hide";
    } else {
        password.type = "password";
        togglePassword.innerText = "Show";
    }

});

// Login Form Validation
loginForm.addEventListener("submit", function (e) {

    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const pass = password.value;

    if (username === "" || pass === "") {
        message.style.color = "red";
        message.innerText = "Please fill all fields.";
        return;
    }

    message.style.color = "#0095f6";
    message.innerText = "Demo login form submitted successfully!";

    console.log("Username:", username);

});

// Forgot Password
document.getElementById("forgotPassword").addEventListener("click", function(e) {
    e.preventDefault();
    message.style.color = "#385185";
    message.innerText = "Password recovery is not connected in this demo.";
});
