 import { initializeApp } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'


    // Add Firebase products that you want to use
    import { getAuth } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js'
    import { getFirestore } from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js'

    // Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCXOLWXtvHgQjAI6vZQSWRclWrLf9XJjV8",
  authDomain: "outfit-planner-7d7f0.firebaseapp.com",
  projectId: "outfit-planner-7d7f0",
  storageBucket: "outfit-planner-7d7f0.firebasestorage.app",
  messagingSenderId: "546872311829",
  appId: "1:546872311829:web:d0b60333cbf490427ece1c",
  measurementId: "G-ZLNGY94X34"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);









































































































