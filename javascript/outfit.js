// ==========================================================
// CREATE OUTFIT PAGE 
// This file loads the user's clothes into categories, 
// lets them select items, and saves the outfit.
// ==========================================================

import { getAllData, saveData } from "../db/db.js";

// Variables to store the currently selected items.
let selectedTop = null;
let selectedBottom = null;
let selectedShoes = null;
let selectedDress = null;
let selectedAccessories = []; 

// 1. SHOW USER PROFILE INITIAL
const savedName = localStorage.getItem("userName");
if (savedName && savedName !== "User") {
    document.getElementById("nav-profile-pic").src = `https://ui-avatars.com/api/?name=${savedName}&background=f7a8bc&color=fff`;
}

// 2. DROPDOWN TOGGLE LOGIC
// Shows or hides the clothing grid based on the dropdown selection.
window.toggleSection = function(section) {
    const grid = document.getElementById(section + "s-grid"); 
    const dropdown = document.getElementById(section + "-dropdown");
    
    if (dropdown.value === "closed") {
        grid.style.display = "grid";
    } else {
        grid.style.display = "none";
    }
};

// 3. LOAD ITEMS FROM FIREBASE
async function load() {
    const currentUserId = localStorage.getItem("userId");
    const allItems = await getAllData("clothing_items");
    
    // Filter to only show this user's items.
    const items = allItems.filter(item => item.user_id === currentUserId);
    
    // Get the grid containers.
    const topsGrid = document.getElementById("tops-grid");
    const bottomsGrid = document.getElementById("bottoms-grid");
    const shoesGrid = document.getElementById("shoes-grid");
    const dressesGrid = document.getElementById("dresses-grid");
    const accessoriesGrid = document.getElementById("accessories-grid");

    // Clear any existing content.
    topsGrid.innerHTML = ""; bottomsGrid.innerHTML = "";
    shoesGrid.innerHTML = ""; dressesGrid.innerHTML = ""; accessoriesGrid.innerHTML = "";

    // Loop through each item and display it in the correct category.
    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "clothing-item-card";
        
        div.innerHTML = `
            <div class="clothing-item-image-placeholder">
                <img src="${item.image_url || 'placeholder.png'}" class="card-image" alt="${item.name}">
            </div>
            <div class="clothing-item-name">${item.name}</div>
        `;

        // Handle the click event for selecting the item.
        div.onclick = () => {
            if (item.category === "Accessory") {
                // Accessories can be toggled on and off.
                div.classList.toggle('selected-item-card');
                const index = selectedAccessories.findIndex(a => a.name === item.name);
                if (index > -1) {
                    selectedAccessories.splice(index, 1);
                } else {
                    selectedAccessories.push(item);
                }
            } else {
                // All other categories can only have one selection at a time.
                div.parentElement.querySelectorAll('.clothing-item-card').forEach(box => {
                    box.classList.remove('selected-item-card');
                });
                div.classList.add('selected-item-card');

                if (item.category === "Top") selectedTop = item;
                if (item.category === "Bottom") selectedBottom = item;
                if (item.category === "Shoes") selectedShoes = item;
                if (item.category === "Dress") selectedDress = item;
            }
            showPreview(); // Update the right-side preview.
        };

        // Add the item to the correct grid based on its category.
        if (item.category === "Top") topsGrid.appendChild(div);
        if (item.category === "Bottom") bottomsGrid.appendChild(div);
        if (item.category === "Shoes") shoesGrid.appendChild(div);
        if (item.category === "Dress") dressesGrid.appendChild(div);
        if (item.category === "Accessory") accessoriesGrid.appendChild(div);
    });
}

// 4. SHOW PREVIEW & UPDATE COUNTER
// Updates the right-hand panel with the selected items.
function showPreview() {
    const preview = document.getElementById("preview-box");
    preview.innerHTML = ""; 
    let count = 0;

    if (selectedTop) {
        preview.innerHTML += `<div class="preview-item-box"><div class="preview-item-thumbnail"><img src="${selectedTop.image_url}" class="card-image2"></div><div class="preview-item-info"><div class="preview-item-name">${selectedTop.name}</div></div></div>`;
        count++;
    }
    if (selectedBottom) {
        preview.innerHTML += `<div class="preview-item-box"><div class="preview-item-thumbnail"><img src="${selectedBottom.image_url}" class="card-image2"></div><div class="preview-item-info"><div class="preview-item-name">${selectedBottom.name}</div></div></div>`;
        count++;
    }
    if (selectedShoes) {
        preview.innerHTML += `<div class="preview-item-box"><div class="preview-item-thumbnail"><img src="${selectedShoes.image_url}" class="card-image2"></div><div class="preview-item-info"><div class="preview-item-name">${selectedShoes.name}</div></div></div>`;
        count++;
    }
    if (selectedDress) {
        preview.innerHTML += `<div class="preview-item-box"><div class="preview-item-thumbnail"><img src="${selectedDress.image_url}" class="card-image2"></div><div class="preview-item-info"><div class="preview-item-name">${selectedDress.name}</div></div></div>`;
        count++;
    }

    selectedAccessories.forEach(acc => {
        preview.innerHTML += `<div class="preview-item-box"><div class="preview-item-thumbnail"><img src="${acc.image_url}" class="card-image2"></div><div class="preview-item-info"><div class="preview-item-name">${acc.name}</div></div></div>`;
        count++;
    });

    // Update the badge at the top.
    document.getElementById("item-count-badge").innerText = `${count} items selected`;
}

// 5. CLEAR BUTTON
// Resets all selections when the user clicks "Clear Selection".
document.getElementById("clear-btn").onclick = () => {
    selectedTop = null; selectedBottom = null; selectedShoes = null; selectedDress = null;
    selectedAccessories = []; 

    document.querySelectorAll('.clothing-item-card').forEach(box => {
        box.classList.remove('selected-item-card');
    });

    document.getElementById("preview-box").innerHTML = "";
    document.getElementById("item-count-badge").innerText = `0 items selected`;
};

// 6. SAVE BUTTON
// Saves the outfit to the database when clicked.
document.getElementById("save-outfit-btn").onclick = async () => {
    // Validate that at least a top or dress is selected.
    if (!selectedTop && !selectedDress) {
        alert("Please select at least a Top or a Dress!");
        return;
    }

    // Combine all selected accessories into a single string.
    let accString = "None";
    if (selectedAccessories.length > 0) {
        accString = selectedAccessories.map(a => a.name).join(", ");
    }

    // Build the outfit object.
    const outfit = {
        user_id: localStorage.getItem("userId"), 
        name: document.getElementById("outfit-name").value,
        occasion: document.getElementById("outfit-occasion").value,
        season: document.getElementById("outfit-season").value,
        top: selectedTop ? selectedTop.name : "None",
        bottom: selectedBottom ? selectedBottom.name : "None",
        shoes: selectedShoes ? selectedShoes.name : "None",
        dress: selectedDress ? selectedDress.name : "None",
        accessory: accString,
        top_image: selectedTop ? selectedTop.image_url : "",
        bottom_image: selectedBottom ? selectedBottom.image_url : "",
        shoes_image: selectedShoes ? selectedShoes.image_url : ""
    };

    // Save the outfit to the database.
    await saveData("outfits", outfit);

    // Check if a date was selected to add to the planner.
    const plannedDate = document.getElementById("outfit-date").value;
    if (plannedDate !== "") {
        const newPlan = {
            user_id: localStorage.getItem("userId"), 
            outfit_name: outfit.name,
            planned_date: plannedDate,
            is_worn: false
        };
        await saveData("planned_outfits", newPlan);
        alert("Outfit Saved and added to Planner!");
    } else {
        alert("Outfit Saved!");
    }
};

// 7. POPUP LOGIC
const popup = document.getElementById("popup");
document.querySelector(".pink-rounded-button").onclick = () => popup.style.display = "flex";
document.getElementById("closeBtn").onclick = () => popup.style.display = "none";

document.getElementById("myForm").onsubmit = async (e) => {
    e.preventDefault();
    const file = document.getElementById("image-file").files[0];
    if (!file) return;
    if (file.size > 1000000) {
        alert("Image too big! Pick an image smaller than 1MB.");
        return;
    }

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

// Run the load function.
load();