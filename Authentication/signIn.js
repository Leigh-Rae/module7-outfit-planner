// ==========================================================
// SIGN IN HANDLER 
// This file handles the login button on the login page.
// It authenticates the user, finds their name in the database,
// and saves their details to the browser's memory.
// ==========================================================

// Import the signIn function from our authentication file.
import { signIn } from "./auth.js";
// Import the getAllData function so we can search the database for their name.
import { getAllData } from "../db/db.js";

// Add a click event listener to the Sign In button.
// The "async" keyword allows us to use "await" inside the function.
document.getElementById("signInBtn").addEventListener("click", async function () {
    
    // Get the email and password the user typed into the input fields.
    // .trim() removes any accidental spaces before or after the email.
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
 
    // Check if the user left any fields empty.
    if (email === "" || password === "") {
        alert("Please fill in all empty fields.");
        return; // Stop the function from continuing.
    }

    try {
        // Attempt to log the user in using Firebase Authentication.
        await signIn(email, password);
        
        // Fetch all users from the "users" collection in the Firestore database.
        const allUsers = await getAllData("users");
        
        // Set a default name in case we can't find the user in the database.
        let foundName = "User"; 
        
        // Loop through all users in the database to find a matching email.
        for (let i = 0; i < allUsers.length; i++) {
            // Compare the database email to the typed email (ignoring uppercase/lowercase).
            if (allUsers[i].Email.toLowerCase() === email.toLowerCase()) {
                // If a match is found, save their actual name.
                foundName = allUsers[i].Full_Name;
            }
        }

        // Save the email as the "userId" in the browser's localStorage.
        // This is how the other pages know which user's data to display.
        localStorage.setItem("userId", email); 
        
        // Save the user's name in localStorage so the Home page can greet them.
        localStorage.setItem("userName", foundName); 

        // Redirect the user to the Home page after a successful login.
        window.location.href = "home.html";

    } catch (error) {
        // If login fails (e.g., wrong password), print the error to the console.
        console.error("Sign-In failed:", error.message);
        // Show an alert to the user telling them the login failed.
        alert("Sign-in failed. Please check your email and password.");
    }
});