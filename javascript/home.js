import { getAllData, saveData } from "../db/db.js";

// --- 1. SHOW USER NAME ---
const savedName = localStorage.getItem("userName");
if (savedName && savedName !== "User") {
    document.getElementById("greeting-name").innerHTML = `Hi, ${savedName}! <i class="fa-regular fa-heart fa-beat" style="color: rgb(241, 171, 196);"></i>`;
}

// --- 2. SHOW TODAY'S REAL DATE ---
const today = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
document.getElementById("today-date").innerHTML = `<img width="21" height="21" src="https://img.icons8.com/ios/50/sun--v1.png" /> ${today.toLocaleDateString('en-US', options)}`;

// --- 3. LOAD EVERYTHING FROM FIREBASE ---
async function loadHomePage() {
    try {
        // Get all data from Firebase
        const clothes = await getAllData("clothing_items");
        const outfits = await getAllData("outfits");
        const planned = await getAllData("planned_outfits");

        // UPDATE THE STAT BOXES
        document.getElementById("wardrobe-count").innerText = clothes.length;
        document.getElementById("outfit-count").innerText = outfits.length;
        document.getElementById("planned-count").innerText = planned.length;
        document.getElementById("favourites-count").innerText = outfits.filter(o => o.is_favourite).length;

        // --- 4. SHOW TODAY'S OUTFIT ---
        const todayContainer = document.getElementById("today-outfit-container");
        todayContainer.innerHTML = "";

        // Format today's date to match what is saved in Firebase (YYYY-MM-DD)
        const dateString = new Date().toISOString().split("T")[0]; 
        
        // Find if there is an outfit planned for today
        let todayPlan = null;
        for (let i = 0; i < planned.length; i++) {
            if (planned[i].planned_date === dateString) {
                todayPlan = planned[i];
            }
        }

        if (todayPlan) {
            // Find the images for the planned outfit
            const outfitObj = outfits.find(o => o.name === todayPlan.outfit_name);
            
            if (outfitObj) {
                const topPic = clothes.find(c => c.name === outfitObj.top)?.image_url || "placeholder.png";
                const bottomPic = clothes.find(c => c.name === outfitObj.bottom)?.image_url || "placeholder.png";
                const shoesPic = clothes.find(c => c.name === outfitObj.shoes)?.image_url || "placeholder.png";

                todayContainer.innerHTML = `
                    <div class="clothing-boxes"><div class="inside-box"><img src="${topPic}"></div><br><p>Top</p><h4>${outfitObj.top}</h4></div>
                    <div class="clothing-boxes"><div class="inside-box"><img src="${bottomPic}"></div><br><p>Bottom</p><h4>${outfitObj.bottom}</h4></div>
                    <div class="clothing-boxes"><div class="inside-box"><img src="${shoesPic}"></div><br><p>Shoes</p><h4>${outfitObj.shoes}</h4></div>
                `;
            }
        } else {
            todayContainer.innerHTML = "<p>No outfit planned for today.</p>";
        }

        // --- 5. SHOW SAVED OUTFITS AT THE BOTTOM ---
        const savedContainer = document.getElementById("saved-outfits-container");
        savedContainer.innerHTML = "";

        for (let i = 0; i < outfits.length; i++) {
            let outfit = outfits[i];

            let topPic = clothes.find(c => c.name === outfit.top)?.image_url || "placeholder.png";
            let bottomPic = clothes.find(c => c.name === outfit.bottom)?.image_url || "placeholder.png";
            let shoesPic = clothes.find(c => c.name === outfit.shoes)?.image_url || "placeholder.png";

            savedContainer.innerHTML += `
                <div class="suggestion-card">
                    <div class="card-top"><span class="tag tag-pink">${outfit.occasion}</span></div>
                    <div class="card-info"><h3>${outfit.name}</h3><p>${outfit.top} • ${outfit.bottom} • ${outfit.shoes}</p></div>
                    <div class="card-images">
                        <div class="img-placeholder"><img src="${topPic}"></div>
                        <div class="img-placeholder"><img src="${bottomPic}"></div>
                        <div class="img-placeholder"><img src="${shoesPic}"></div>
                    </div>
                    <div class="card-actions">
                        <button class="btn-primary wear-btn" data-outfit="${outfit.name}">Wear This</button>
                    </div>
                </div>
            `;
        }

        // --- 6. ATTACH CLICK EVENTS TO WEAR THIS BUTTONS ---
        const wearButtons = document.querySelectorAll('.wear-btn');
        for (let i = 0; i < wearButtons.length; i++) {
            wearButtons[i].onclick = () => {
                const outfitName = wearButtons[i].getAttribute('data-outfit');
                wearThis(outfitName);
            };
        }

    } catch (error) {
        console.error("Error loading home page data:", error);
    }
}

// --- 7. WEAR THIS FUNCTION ---
async function wearThis(outfitName) {
    // 1. Get today's date (e.g., "2026-10-28")
    const todayDate = new Date().toISOString().split("T")[0]; 

    // 2. Create the plan object
    const newPlan = {
        user_id: "user_1",
        outfit_name: outfitName,
        planned_date: todayDate,
        is_worn: true
    };

    try {
        // 3. Save it to the 'planned_outfits' collection in Firebase
        await saveData("planned_outfits", newPlan);
        
        // 4. Tell the user it worked and refresh the page
        alert("Outfit planned for today!");
        location.reload(); 
    } catch (error) {
        console.error("Error saving plan:", error);
        alert("Failed to plan outfit.");
    }
}

// --- 8. ADD CLOTHING POPUP ---
const popup = document.getElementById("popup");
document.querySelector(".add-clothing-button").onclick = () => popup.style.display = "flex";
document.querySelector(".add-item-button").onclick = () => popup.style.display = "flex";
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
            image_url: event.target.result
        };
        await saveData("clothing_items", item);
        popup.style.display = "none";
        location.reload(); 
    };
    reader.readAsDataURL(file);
};

// Run the page loader
loadHomePage();