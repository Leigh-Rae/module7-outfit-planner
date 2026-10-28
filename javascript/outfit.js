import { getAllData, saveData } from "../db/db.js";

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
window.toggleSection = function(section) {
    const grid = document.getElementById(section + "s-grid"); 
    const dropdown = document.getElementById(section + "-dropdown");
    
    // Swap them to match your HTML
    if (dropdown.value === "closed") {
        grid.style.display = "grid";
    } else {
        grid.style.display = "none";
    }
};

// 3. LOAD ITEMS FROM FIREBASE
async function load() {
    const items = await getAllData("clothing_items");
    
    const topsGrid = document.getElementById("tops-grid");
    const bottomsGrid = document.getElementById("bottoms-grid");
    const shoesGrid = document.getElementById("shoes-grid");
    const dressesGrid = document.getElementById("dresses-grid");
    const accessoriesGrid = document.getElementById("accessories-grid");

    topsGrid.innerHTML = ""; bottomsGrid.innerHTML = "";
    shoesGrid.innerHTML = ""; dressesGrid.innerHTML = ""; accessoriesGrid.innerHTML = "";

    items.forEach(item => {
        const div = document.createElement("div");
        div.className = "clothing-item-card";
        
        // THE IMAGE FIX IS HERE: It uses the image_url from your database
        div.innerHTML = `
            <div class="clothing-item-image-placeholder">
                <img src="${item.image_url || 'placeholder.png'}" class="card-image" alt="${item.name}">
            </div>
            <div class="clothing-item-name">${item.name}</div>
        `;

        div.onclick = () => {
            if (item.category === "Accessory") {
                div.classList.toggle('selected-item-card');
                const index = selectedAccessories.findIndex(a => a.name === item.name);
                if (index > -1) {
                    selectedAccessories.splice(index, 1);
                } else {
                    selectedAccessories.push(item);
                }
            } else {
                div.parentElement.querySelectorAll('.clothing-item-card').forEach(box => {
                    box.classList.remove('selected-item-card');
                });
                div.classList.add('selected-item-card');

                if (item.category === "Top") selectedTop = item;
                if (item.category === "Bottom") selectedBottom = item;
                if (item.category === "Shoes") selectedShoes = item;
                if (item.category === "Dress") selectedDress = item;
            }
            showPreview();
        };

        // Put in the correct grid
        if (item.category === "Top") topsGrid.appendChild(div);
        if (item.category === "Bottom") bottomsGrid.appendChild(div);
        if (item.category === "Shoes") shoesGrid.appendChild(div);
        if (item.category === "Dress") dressesGrid.appendChild(div);
        if (item.category === "Accessory") accessoriesGrid.appendChild(div);
    });
}

// 4. SHOW PREVIEW & UPDATE COUNTER
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

    document.getElementById("item-count-badge").innerText = `${count} items selected`;
}

// 5. CLEAR BUTTON
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
document.getElementById("save-outfit-btn").onclick = async () => {
    if (!selectedTop && !selectedDress) {
        alert("Please select at least a Top or a Dress!");
        return;
    }

    let accString = "None";
    if (selectedAccessories.length > 0) {
        accString = selectedAccessories.map(a => a.name).join(", ");
    }

    const outfit = {
        user_id: "user_1",
        name: document.getElementById("outfit-name").value,
        occasion: document.getElementById("outfit-occasion").value,
        season: document.getElementById("outfit-season").value,
        top: selectedTop ? selectedTop.name : "None",
        bottom: selectedBottom ? selectedBottom.name : "None",
        shoes: selectedShoes ? selectedShoes.name : "None",
        dress: selectedDress ? selectedDress.name : "None",
        accessory: accString,
        // Save the images so the Home page can use them!
        top_image: selectedTop ? selectedTop.image_url : "",
        bottom_image: selectedBottom ? selectedBottom.image_url : "",
        shoes_image: selectedShoes ? selectedShoes.image_url : ""
    };

    await saveData("outfits", outfit);

    const plannedDate = document.getElementById("outfit-date").value;
    if (plannedDate !== "") {
        const newPlan = {
            user_id: "user_1",
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
            user_id: "user_1",
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

// Run the load function
load();