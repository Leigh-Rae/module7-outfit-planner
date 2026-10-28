import { signUp } from "./auth.js";

document.getElementById("signUp").addEventListener("click", async function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const fullname = document.getElementById("fullname").value;
  try {
    if (password === confirmPassword) {
      await signUp(email, password, fullname);
      console.log("Sign-up successful!");
      window.location.href = "home.html";
    } else {
      alert("Password does not match. Please re-enter!");
    }
  } catch (error) {
    console.error("Sign-up failed:", error.message);
  }
});
