// ==========================================================
// AUTHENTICATION HANDLER 
// This file handles user sign-up, login, and password resets
// using Firebase Authentication and Firebase Firestore.
// ==========================================================

// Import the Firebase Auth and Firestore database instances from our config file.
import { auth, db } from "../config.js";

// Import the Firebase functions we need for authentication from the CDN.
import {
  createUserWithEmailAndPassword, // Used to register a new user
  signInWithEmailAndPassword,     // Used to log an existing user in
  sendPasswordResetEmail,         // Used to email a password reset link
} from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

// Import the Firebase Firestore functions we need to save user data.
import {
   doc,              // Creates a reference to a specific document
   setDoc,           // Writes data to that document
   serverTimestamp   // (Unused) Would get the server's time
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';


// ==========================================================
// 1. SIGN UP FUNCTION
// Creates a new user account and saves their name to Firestore.
// ==========================================================
export async function signUp(email, password, fullname) {
  try {
    // Create the user in Firebase Authentication using their email and password.
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Extract the newly created user object.
    const user = userCredential.user;
    
    // Save extra details (Full Name, Email) into the "users" collection in Firestore.
    // We use the user.uid as the document ID so it matches Firebase Auth.
    await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        fullname: fullname,
        email: email,
    })
    
    // Return the user object to the frontend.
    return user;

  } catch (error) {
    // If there is an error (e.g., email already in use), print it to the console.
    console.log(error.message);
    throw error; // Pass the error up so the UI can show an alert.
  }
}


// ==========================================================
// 2. LOGIN FUNCTION
// Authenticates an existing user with their email and password.
// ==========================================================
export async function signIn(email, password) {
  try {
    // Attempt to log the user in using Firebase Auth.
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Extract the user object.
    const user = userCredential.user;
   
    // Return the user to the frontend (so we can get their email/uid).
    return user;

  } catch (error) {
    // If login fails (e.g., wrong password), log the error.
    console.log(error.message);
    throw error;
  }
}


// ==========================================================
// 3. FORGOT PASSWORD FUNCTION
// Sends a password reset email to the user's inbox.
// ==========================================================
export async function resetPassword(email) {
  try {
    // Tell Firebase to send a reset email to the provided address.
    await sendPasswordResetEmail(auth, email);

    // Log a success message to the console.
    console.log("Password reset email sent successfully!");
  } catch (error) {
    // If the email is invalid or not found, log the error.
    console.log(error.message);
    throw error;
  }
}