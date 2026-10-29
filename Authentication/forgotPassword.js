// ==========================================================
// FORGOT PASSWORD HANDLER 
// This file handles sending a password reset email using 
// the resetPassword function we imported from auth.js.
// ==========================================================

// Import the resetPassword function from our authentication file.
import { resetPassword } from "./auth.js";

// Define an asynchronous function to trigger the password reset.
async function forgotPassword() {
  try {
    // Call the imported resetPassword function and pass in the user's email address.
    // (Currently hardcoded to your email for testing purposes).
    await resetPassword("leighraebooysen9@gmail.com");

    // If successful, log a message to the browser's console.
    console.log("Check your email for the password reset link!");
    
  } catch (error) {
    // If the reset fails (e.g., invalid email), catch the error and log it.
    console.error("Password reset failed:", error.message);
  }
}

// Immediately call the function when the page loads or script runs.
forgotPassword();