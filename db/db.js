
// ==========================================================
// DATABASE HELPERS 
// This file contains all the reusable functions we use to 
// read and write data to the Firebase Firestore database.
// ==========================================================

// Import the Firestore database instance from the config file.
import { db } from '../config.js';

// Import all the necessary Firestore functions from the CDN.
import { 
    collection, 
    doc, 
    addDoc, 
    getDoc, 
    getDocs, 
    deleteDoc, 
    updateDoc, 
    setDoc 
} from 'https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js';


// ==========================================================
// 1. GET ALL DATA
// Fetches every document from a specific collection.
// ==========================================================
export async function getAllData(collectionName){
    // Get a snapshot of all documents in the collection.
    const snapshot = await getDocs(collection(db, collectionName))

    // Map through the results and combine the document ID with its data.
    return snapshot.docs.map((document)=>({
        id: document.id, 
        ...document.data()
    }))
}


// ==========================================================
// 2. SAVE NEW DATA (Auto ID)
// Adds a new document with a randomly generated ID.
// ==========================================================
export async function saveData(collectionName, data){
      // Add the data to the collection.
      const docRef = await addDoc(
        collection(db, collectionName),
        data
      );

      // Return the new document's ID.
      return docRef.id;
}


// ==========================================================
// 3. SAVE DATA WITH SPECIFIC ID
// Adds or overwrites a document using an ID we provide.
// ==========================================================
// save data using a specific document ID
export async function saveDataWithId(collectionName, id, data) {
      // Set the data at the specific document reference.
      await setDoc(doc(db, collectionName, id), data);
      return id;
}


// ==========================================================
// 4. GET ONE DOCUMENT BY ID
// Retrieves a single document using its ID.
// ==========================================================
// retrieve one document by ID
export async function getDatabyId(collectionName, id) {
    // Get the specific document.
    const snapshot = await getDoc(doc(db, collectionName, id));
    
    // Check if the document actually exists.
    if (!snapshot.exists()) {
        return null;
    }
    
    // Return the document ID and its data.
    return {
        id: snapshot.id,
        ...snapshot.data()
    };
}


// ==========================================================
// 5. UPDATE EXISTING DATA
// Updates specific fields in an existing document.
// ==========================================================
//Update an existing document
export async function updateData(collectionName, id, data) {
      // Update the document with the new data.
      await updateDoc(
        doc(db, collectionName, id),
        data
      );
}


// ==========================================================
// 6. DELETE DATA
// Permanently removes a document from the database.
// ==========================================================
// delete a document
export async function deleteData(collectionName, id) {
      // Delete the document by its ID.
      await deleteDoc(
        doc(db, collectionName, id)
      );
}