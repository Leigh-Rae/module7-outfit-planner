// ==========================================================
// SIGN UP HANDLER 
// This file handles the registration button on the Sign Up page.
// It validates passwords, creates the user in Firebase Auth, 
// and saves their details to the Firestore database.
// ==========================================================

// Import the signUp function from our authentication file.
import { signUp } from "./auth.js";
// Import the saveData function so we can add the new user to Firestore.
import { saveData } from "../db/db.js"; 

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
      
      // 1. Create the user in Firebase Authentication using the imported function.
      await signUp(email, password, fullname);
      
      // 2. Prepare the user object to save in the Firestore "users" collection.
      // We use Capital E and Capital F to match the database structure.
      const newUser = {
          Email: email,        
          Full_Name: fullname  
      };
      
      // Save the new user document to the "users" collection in the database.
      await saveData("users", newUser);

      // Log a success message to the console.
      console.log("Sign-up successful!");
      
      // Redirect the user to the Home page after successful sign-up.
      window.location.href = "home.html";
      
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