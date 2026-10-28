import { signIn } from "./auth.js";
import { getAllData } from "../db/db.js";

document.getElementById("signInBtn").addEventListener("click", async function () {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
 
    if (email === "" || password === "") {
        alert("Please fill in all empty fields.");
        return;
    }

    try {
        // 1. Log them in
        await signIn(email, password);
        
        // 2. Get all users
        const allUsers = await getAllData("users");
        
        // 3. Find the name
        let foundName = "User"; 
        for (let i = 0; i < allUsers.length; i++) {
            // Check if the email matches (ignoring uppercase/lowercase)
            if (allUsers[i].Email && allUsers[i].Email.toLowerCase() === email.toLowerCase()) {
                foundName = allUsers[i].Full_Name;
            }
        }

        // 4. Save the name
        localStorage.setItem("userName", foundName); 
        localStorage.setItem("userEmail", email);

        // 5. Go to Home
        window.location.href = "home.html";

    } catch (error) {
        // If it fails, this will pop up and tell us exactly what went wrong
        console.error("Sign-In failed:", error.message);
        alert("Sign-In Error: " + error.message);
    }
});