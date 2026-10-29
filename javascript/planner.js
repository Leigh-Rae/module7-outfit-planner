// ==========================================================
// PLANNER PAGE 
// This file builds the calendar, loads the user's planned 
// outfits, and handles the "Quick Assign" feature.
// ==========================================================

import { getAllData, saveData } from "../db/db.js";

// Variables for the calendar and stored data.
let currentDate = new Date();
let selectedDate = new Date().toISOString().split("T")[0]; 
let allOutfits = [];
let allPlans = [];
let allClothes = [];

// 1. USER PROFILE & POPUP
const savedName = localStorage.getItem("userName");
if (savedName && savedName !== "User") {
    document.getElementById("nav-profile-pic").src = `https://ui-avatars.com/api/?name=${savedName}&background=f7a8bc&color=fff`;
}

const popup = document.getElementById("popup");
document.querySelector(".header-right-side-buttons .pink-rounded-button").onclick = () => popup.style.display = "flex";
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

// 2. LOAD DATA & BUILD CALENDAR
async function initPlanner() {
    const currentUserId = localStorage.getItem("userId");

    // Fetch data from the database.
    const fetchedOutfits = await getAllData("outfits");
    const fetchedPlans = await getAllData("planned_outfits");
    const fetchedClothes = await getAllData("clothing_items");
    
    // Filter to only keep this user's data.
    allOutfits = fetchedOutfits.filter(item => item.user_id === currentUserId);
    allPlans = fetchedPlans.filter(item => item.user_id === currentUserId);
    allClothes = fetchedClothes.filter(item => item.user_id === currentUserId);
    
    renderCalendar();
    renderQuickAssign();
    renderSelectedDay();
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    document.getElementById("month-year-display").innerHTML = `<i class="fa-regular fa-calendar-days"></i> ${monthNames[month]} ${year}`;

    const daysContainer = document.getElementById("calendar-days-container");
    daysContainer.innerHTML = "";

    // Calculate how many empty boxes we need for the start of the month.
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    let emptyStartBoxes = (firstDay === 0) ? 6 : firstDay - 1;

    for (let i = 0; i < emptyStartBoxes; i++) {
        daysContainer.innerHTML += `<div class="calendar-day-cell empty-day-cell"></div>`;
    }

    // Loop through each day and create a cell.
    for (let day = 1; day <= daysInMonth; day++) {
        const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const todayStr = new Date().toISOString().split("T")[0];
        let planForDay = allPlans.find(p => p.planned_date === formattedDate);
        
        let isTodayClass = (formattedDate === todayStr) ? "highlighted-today-cell" : "";
        let eventHTML = "";

        // If there is a plan for this day, show it in the cell.
        if (planForDay) {
            eventHTML = `
                <div class="calendar-event-box ${formattedDate === todayStr ? 'event-highlighted' : ''}">
                    <span class="event-icon-text">👗 ${planForDay.outfit_name}</span>
                </div>
            `;
        }

        daysContainer.innerHTML += `
            <div class="calendar-day-cell ${isTodayClass}" onclick="selectDay('${formattedDate}', '${monthNames[month]}', ${day})">
                <div class="day-number-header">
                    <span class="day-number">${day}</span>
                    ${formattedDate === todayStr ? '<span class="today-label">Today</span>' : ''}
                </div>
                ${eventHTML}
            </div>
        `;
    }
}

// 3. SELECTED DAY PANEL
// Updates the side panel when a day is clicked.
window.selectDay = function(dateStr, monthName, dayNum) {
    selectedDate = dateStr;
    document.getElementById("selected-date-text").innerText = `${monthName} ${dayNum}`;
    renderSelectedDay();
};

function renderSelectedDay() {
    const content = document.getElementById("selected-day-content");
    content.innerHTML = "";

    let plan = allPlans.find(p => p.planned_date === selectedDate);

    // If there is an outfit planned for this date, show it.
    if (plan) {
        let outfit = allOutfits.find(o => o.name === plan.outfit_name);
        
        if (outfit) {
            let topPic = allClothes.find(c => c.name === outfit.top)?.image_url || "placeholder.png";
            let bottomPic = allClothes.find(c => c.name === outfit.bottom)?.image_url || "placeholder.png";
            let shoesPic = allClothes.find(c => c.name === outfit.shoes)?.image_url || "placeholder.png";

            content.innerHTML = `
                <div class="preview-outfit-title-row">
                    <h4>${outfit.name}</h4>
                </div>
                <p class="preview-outfit-meta">${outfit.occasion} · ${outfit.season}</p>

                <div class="preview-thumbnails-row">
                    <div class="preview-thumbnail-box">
                        <div class="preview-thumbnail-image"><img src="${topPic}" style="width: 100%; height: 100%; object-fit: cover;"></div>
                        <span class="preview-thumbnail-label">${outfit.top}</span>
                    </div>
                    <div class="preview-thumbnail-box">
                        <div class="preview-thumbnail-image"><img src="${bottomPic}" style="width: 100%; height: 100%; object-fit: cover;"></div>
                        <span class="preview-thumbnail-label">${outfit.bottom}</span>
                    </div>
                    <div class="preview-thumbnail-box">
                        <div class="preview-thumbnail-image"><img src="${shoesPic}" style="width: 100%; height: 100%; object-fit: cover;"></div>
                        <span class="preview-thumbnail-label">${outfit.shoes}</span>
                    </div>
                </div>

                <div class="outfit-action-buttons-row">
                    <button class="change-outfit-button" onclick="window.location.href='outfit.html'">Change Outfit</button>
                </div>
                <div class="secondary-actions-row">
                    <button class="secondary-action-button save-plan-button" style="width: 100%;"><i class="fa-regular fa-bookmark"></i> Outfit Planned</button>
                </div>
            `;
        }
    } else {
        // If no outfit is planned, show a button to create one.
        content.innerHTML = `
            <p class="grey-page-subtitle" style="margin-bottom: 20px;">No outfit planned for this day.</p>
            <button class="change-outfit-button" style="width: 100%;" onclick="window.location.href='outfit.html'">+ Plan New Outfit</button>
        `;
    }
}

// 4. QUICK ASSIGN
// Shows the 3 most recent outfits in the side panel.
function renderQuickAssign() {
    const list = document.getElementById("quick-assign-list");
    list.innerHTML = "";

    let recentOutfits = allOutfits.slice(-3).reverse();

    recentOutfits.forEach(outfit => {
        list.innerHTML += `
            <div class="quick-assign-item">
                <div class="quick-assign-info">
                    <div class="quick-assign-text">
                        <div class="item-name">${outfit.name}</div>
                        <div class="item-meta">${outfit.occasion} · ${outfit.season}</div>
                    </div>
                </div>
                <button class="add-quick-assign-button" onclick="quickAssign('${outfit.name}')">+</button>
            </div>
        `;
    });
}

// Assigns a saved outfit to the currently selected date.
window.quickAssign = async function(outfitName) {
    const newPlan = {
        user_id: localStorage.getItem("userId"), 
        outfit_name: outfitName,
        planned_date: selectedDate,
        is_worn: false
    };

    await saveData("planned_outfits", newPlan);
    alert("Outfit assigned to " + selectedDate);
    initPlanner(); 
};

// --- 5. ATTACH BUTTON CLICKS ---
// Calendar navigation buttons.
document.getElementById("prev-btn").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
};

document.getElementById("next-btn").onclick = () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
};

document.getElementById("today-btn").onclick = () => {
    currentDate = new Date();
    renderCalendar();
};

// Start everything.
initPlanner();