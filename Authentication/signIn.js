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
document.getElementById("signInBtn").addEventListener("click", async function () {
    
    // Get the email and password the user typed into the input fields.
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
 
    // Check if the user left any fields empty.
    if (email === "" || password === "") {
        alert("Please fill in all empty fields.");
        return; 
    }

    try {
        // 1. Attempt to log the user in using Firebase Authentication.
        // If the password is wrong, this line will jump straight to the catch block.
        await signIn(email, password);
        
        // 2. Setup a default name
        let foundName = "User"; 
        
        // 3. Try to find their real name in the database
        try {
            const allUsers = await getAllData("users");
            
            for (let i = 0; i < allUsers.length; i++) {
                // FIX: Check for both Capital E/F and lowercase e/f
                const dbEmail = allUsers[i].Email || allUsers[i].email;
                const dbName = allUsers[i].Full_Name || allUsers[i].fullname;
                
                if (dbEmail && dbEmail.toLowerCase() === email.toLowerCase()) {
                    foundName = dbName;
                }
            }
        } catch (dbError) {
            // If the database fails, we still let them log in, they just show as "User"
            console.log("Could not fetch name, but login succeeded.");
        }

        // 4. Save to browser memory
        localStorage.setItem("userId", email); 
        localStorage.setItem("userName", foundName); 

        // 5. Redirect to Home
        window.location.href = "home.html";

    } catch (error) {
        // If the ACTUAL Firebase login fails (e.g., wrong password)
        console.error("Sign-In failed:", error.message);
        alert("Sign-in failed. Please check your email and password.");
    }
});