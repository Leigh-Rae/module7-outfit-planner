// ==========================================================
// SIGN UP HANDLER 
// This file handles the registration button on the Sign Up page.
// It validates passwords, creates the user in Firebase Auth, 
// and redirects them to the login page.
// ==========================================================

// Import the signUp function from our authentication file.
import { signUp } from "./auth.js";

// Add a click event listener to the Sign Up button.
document.getElementById("signUp").addEventListener("click", async function () {
  
  // Get the values from the input fields on the form.
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;
  const fullname = document.getElementById("fullname").value;

  try {
    // Check if the password and confirm password fields match.
    if (password === confirmPassword) {
      
      // 1. Create the user in Firebase Authentication AND the Firestore database.
      // (auth.js handles the database saving for us).
      await signUp(email, password, fullname);
      
      // 2. Clear any old user data from the browser memory.
      // This stops the new user from seeing the previous user's name.
      localStorage.clear();

      // 3. Log a success message and alert the user.
      console.log("Sign-up successful!");
      alert("Account created successfully! Please log in.");
      
      // 4. Redirect the user to the Login page.
      // They must log in so the app can save their new name and ID to the browser.
      window.location.href = "login.html";
      
    } else {
      // If passwords do not match, show an alert and stop the process.
      alert("Password does not match. Please re-enter!");
    }
  } catch (error) {
    // If sign-up fails (e.g., email already exists), print the error to the console.
    console.error("Sign-up failed:", error.message);
    // Show an alert to the user with the specific error message.
    alert("Sign-up failed: " + error.message);
  }
});