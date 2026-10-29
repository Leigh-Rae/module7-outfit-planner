// ==========================================================
// PROFILE PAGE 
// This file loads user stats, handles the edit profile popup,
// and displays the user's avatar.
// ==========================================================

import { getAllData, saveData } from "../db/db.js";

// --- 1. USER PROFILE & DYNAMIC NAMES ---
const savedName = localStorage.getItem("userName");
const savedEmail = localStorage.getItem("userEmail") || "user@campus.edu"; 

// If a user name is found in the browser memory, update the UI.
if (savedName && savedName !== "User") {
    document.getElementById("nav-profile-pic").src = `https://ui-avatars.com/api/?name=${savedName}&background=f7a8bc&color=fff`;
    document.getElementById("profile-full-name").innerText = savedName;
    document.getElementById("profile-username").innerText = `@${savedName.toLowerCase().replace(/\s/g, '')}`;
    document.getElementById("info-name").innerText = savedName;
    document.getElementById("info-email").innerText = savedEmail;
    document.getElementById("profile-avatar").src = `https://ui-avatars.com/api/?name=${savedName}&background=f7a8bc&color=fff&size=200`;
}

// --- 2. ADD ITEM POPUP ---
const popup = document.getElementById("popup");
document.getElementById("add-btn-header").onclick = () => popup.style.display = "flex";
document.getElementById("closeBtn").onclick = () => popup.style.display = "none";

document.getElementById("myForm").onsubmit = async (e) => {
    e.preventDefault();
    const file = document.getElementById("image-file").files[0];
    if (!file) return;
    if (file.size > 1000000) { alert("Image too big! Pick under 1MB."); return; }

    const reader = new FileReader();
    reader.onload = async function(event) {
        const item = {
            user_id: localStorage.getItem("userId"), 
            name: document.getElementById("name").value,
            category: document.getElementById("category").value,
            colour: document.getElementById("colour").value,
            occasion: document.getElementById("occasion").value,
            season: document.getElementById("season").value,
            image_url: event.target.result,
            wear_count: 0,
            is_favourite: false
        };
        await saveData("clothing_items", item);
        popup.style.display = "none";
        alert("Item added!");
        location.reload(); 
    };
    reader.readAsDataURL(file);
};

// --- 3. LOAD LIVE STATS FROM FIREBASE ---
async function loadStats() {
    try {
        const currentUserId = localStorage.getItem("userId"); 

        // Fetch all data from the database.
        const allClothes = await getAllData("clothing_items");
        const allOutfits = await getAllData("outfits");
        const allPlans = await getAllData("planned_outfits");

        // Filter to only show this user's data.
        const clothes = allClothes.filter(item => item.user_id === currentUserId);
        const outfits = allOutfits.filter(item => item.user_id === currentUserId);
        const plans = allPlans.filter(item => item.user_id === currentUserId);

        const favClothes = clothes.filter(c => c.is_favourite === true).length;
        const favOutfits = outfits.filter(o => o.is_favourite === true).length;

        // Update the stat boxes.
        document.getElementById("stat-wardrobe").innerText = clothes.length;
        document.getElementById("stat-outfits").innerText = outfits.length;
        document.getElementById("stat-planned").innerText = plans.length;
        document.getElementById("stat-favourites").innerText = favClothes + favOutfits;

        // Calculate the progress bar percentage.
        const maxCapacity = 75;
        let percentage = Math.round((clothes.length / maxCapacity) * 100);
        if (percentage > 100) percentage = 100; 

        document.getElementById("wardrobe-meta").innerText = `${clothes.length} of ${maxCapacity} items used`;
        document.getElementById("wardrobe-percent").innerText = `${percentage}%`;
        document.getElementById("wardrobe-fill").style.width = `${percentage}%`;
    } catch (error) {
        console.error("Error loading stats:", error);
    }
}
loadStats();

// --- 4. EDIT PROFILE POPUP LOGIC ---
const editPopup = document.getElementById("edit-profile-popup");
const editBtn = document.getElementById("edit-profile-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const editForm = document.getElementById("editProfileForm");

// Open popup and fill with current data.
editBtn.onclick = () => {
    document.getElementById("edit-name").value = document.getElementById("info-name").innerText;
    document.getElementById("edit-email").value = document.getElementById("info-email").innerText;
    document.getElementById("edit-phone").value = document.getElementById("info-phone").innerText;
    document.getElementById("edit-dob").value = document.getElementById("info-dob").innerText;
    document.getElementById("edit-location").value = document.getElementById("info-location").innerText;
    document.getElementById("edit-height").value = document.getElementById("info-height").innerText;
    document.getElementById("edit-weight").value = document.getElementById("info-weight").innerText;
    document.getElementById("edit-topsize").value = document.getElementById("info-topsize").innerText;
    document.getElementById("edit-bottomsize").value = document.getElementById("info-bottomsize").innerText;
    document.getElementById("edit-shoesize").value = document.getElementById("info-shoesize").innerText;
    document.getElementById("edit-bodytype").value = document.getElementById("info-bodytype").innerText;
    
    editPopup.style.display = "flex";
};

// Close popup.
cancelEditBtn.onclick = () => editPopup.style.display = "none";

// Save the new data when the form is submitted.
editForm.onsubmit = (e) => {
    e.preventDefault();
    
    // Get the new values from the form.
    const newName = document.getElementById("edit-name").value;
    const newEmail = document.getElementById("edit-email").value; 
    const newPhone = document.getElementById("edit-phone").value;
    const newDob = document.getElementById("edit-dob").value;
    const newLocation = document.getElementById("edit-location").value;
    const newHeight = document.getElementById("edit-height").value;
    const newWeight = document.getElementById("edit-weight").value;
    const newTopSize = document.getElementById("edit-topsize").value;
    const newBottomSize = document.getElementById("edit-bottomsize").value;
    const newShoeSize = document.getElementById("edit-shoesize").value;
    const newBodyType = document.getElementById("edit-bodytype").value;

    // Update the page with the new values.
    document.getElementById("info-name").innerText = newName;
    document.getElementById("profile-full-name").innerText = newName;
    document.getElementById("profile-username").innerText = `@${newName.toLowerCase().replace(/\s/g, '')}`;
    document.getElementById("info-email").innerText = newEmail; 
    document.getElementById("info-phone").innerText = newPhone;
    document.getElementById("info-dob").innerText = newDob;
    document.getElementById("info-location").innerText = newLocation;
    document.getElementById("info-height").innerText = newHeight;
    document.getElementById("info-weight").innerText = newWeight;
    document.getElementById("info-topsize").innerText = newTopSize;
    document.getElementById("info-bottomsize").innerText = newBottomSize;
    document.getElementById("info-shoesize").innerText = newShoeSize;
    document.getElementById("info-bodytype").innerText = newBodyType;

    // Save to browser memory so the Home page updates.
    localStorage.setItem("userName", newName);
    localStorage.setItem("userEmail", newEmail); 

    // Close popup.
    editPopup.style.display = "none";
    alert("Profile updated successfully!");
};