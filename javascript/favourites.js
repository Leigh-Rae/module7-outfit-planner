import { getAllData, saveData, updateData } from "../db/db.js";

let favOutfits = [];
let favClothes = [];
let allClothes = []; // Need this to find images for outfits

// --- 1. USER PROFILE & POPUP ---
const savedName = localStorage.getItem("userName");
if (savedName && savedName !== "User") {
    document.getElementById("nav-profile-pic").src = `https://ui-avatars.com/api/?name=${savedName}&background=f7a8bc&color=fff`;
}

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
            user_id: "user_1",
            name: document.getElementById("name").value,
            category: document.getElementById("category").value,
            colour: document.getElementById("colour").value,
            occasion: document.getElementById("occasion").value,
            season: document.getElementById("season").value,
            image_url: event.target.result,
            wear_count: 0,
            is_favourite: true // Automatically favourite since they added it here!
        };
        await saveData("clothing_items", item);
        popup.style.display = "none";
        alert("Item added to favourites!");
        location.reload(); 
    };
    reader.readAsDataURL(file);
};

// --- 2. LOAD DATA FROM FIREBASE ---
async function loadFavourites() {
    const allOutfits = await getAllData("outfits");
    allClothes = await getAllData("clothing_items");

    // Filter only the ones marked as favourite
    favOutfits = allOutfits.filter(o => o.is_favourite === true);
    favClothes = allClothes.filter(c => c.is_favourite === true);

    renderOutfits();
    renderClothes();
    updateCounts();
}

// --- 3. RENDER FAVOURITE OUTFITS ---
function renderOutfits() {
    const grid = document.getElementById("favourite-outfits-grid");
    grid.innerHTML = "";

    if (favOutfits.length === 0) {
        grid.innerHTML = "<p class='grey-page-subtitle'>No favourite outfits yet.</p>";
        return;
    }

    favOutfits.forEach(outfit => {
        // Find the 3 images from the wardrobe
        let topPic = allClothes.find(c => c.name === outfit.top)?.image_url || "placeholder.png";
        let bottomPic = allClothes.find(c => c.name === outfit.bottom)?.image_url || "placeholder.png";
        let shoesPic = allClothes.find(c => c.name === outfit.shoes)?.image_url || "placeholder.png";

        grid.innerHTML += `
            <div class="outfit-card">
                <div class="outfit-card-tag-row">
                    <span class="outfit-card-tag">${outfit.occasion}</span>
                    <span class="outfit-heart-icon" onclick="removeFavOutfit('${outfit.id}')" style="cursor: pointer;"><i class="fa-solid fa-heart" style="color: rgb(245, 186, 228);"></i></span>
                </div>
                <h3 class="outfit-card-title">${outfit.name}</h3>
                <div class="outfit-preview-thumbnails">
                    <div class="outfit-thumbnail-box"><img src="${topPic}" style="object-fit:cover;" width="80%" height="60px"></div>
                    <div class="outfit-thumbnail-box"><img src="${bottomPic}" style="object-fit:cover;" width="80%" height="60px"></div>
                    <div class="outfit-thumbnail-box"><img src="${shoesPic}" style="object-fit:cover;" width="80%" height="60px"></div>
                </div>
                <p class="outfit-item-labels">${outfit.top} · ${outfit.bottom} · ${outfit.shoes}</p>
                <div class="outfit-card-footer">
                    <div class="outfit-card-buttons-group">
                        <button class="outfit-card-button" onclick="window.location.href='planner.html'"><i class="fa-regular fa-calendar-days"></i> Plan Today</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// --- 4. RENDER FAVOURITE CLOTHES ---
function renderClothes() {
    const grid = document.getElementById("favourite-clothes-grid");
    grid.innerHTML = "";

    if (favClothes.length === 0) {
        grid.innerHTML = "<p class='grey-page-subtitle'>No favourite clothing items yet.</p>";
        return;
    }

    favClothes.forEach(item => {
        grid.innerHTML += `
            <div class="item-card">
                <button class="favourite-heart-button" onclick="removeFavClothes('${item.id}')"><i class="fa-solid fa-heart" style="color: rgb(245, 186, 228);"></i></button>
                <div class="item-image"><img src="${item.image_url}" style="object-fit:contain;" width="80%" height="150px"></div>
                <div class="item-text-area">
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-details">${item.season} · ${item.colour}</p>
                    <div class="item-card-footer">
                        <span class="item-wear-count">Worn ${item.wear_count || 0} times</span>
                        <button class="add-to-outfit-button" onclick="window.location.href='outfit.html'">+ Add to Outfit</button>
                    </div>
                </div>
            </div>
        `;
    });
}

// --- 5. REMOVE FROM FAVOURITES ---
window.removeFavOutfit = async function(id) {
    await updateData("outfits", id, { is_favourite: false });
    loadFavourites();
};

window.removeFavClothes = async function(id) {
    await updateData("clothing_items", id, { is_favourite: false });
    loadFavourites();
};

// --- 6. UPDATE COUNTS ---
function updateCounts() {
    document.getElementById("outfit-count").innerText = `${favOutfits.length} outfits`;
    document.getElementById("clothes-count").innerText = `${favClothes.length} items`;
    
    document.getElementById("filter-all").innerText = `All Favourites (${favOutfits.length + favClothes.length})`;
    document.getElementById("filter-outfits").innerText = `Favourite Outfits (${favOutfits.length})`;
    document.getElementById("filter-clothes").innerText = `Favourite Clothes (${favClothes.length})`;
}

// --- 7. FILTERING LOGIC ---
document.getElementById("filter-all").onclick = (e) => {
    setActiveButton(e.target);
    document.getElementById("outfits-header").style.display = "flex";
    document.getElementById("favourite-outfits-grid").style.display = "grid";
    document.getElementById("clothes-header").style.display = "flex";
    document.getElementById("favourite-clothes-grid").style.display = "grid";
};

document.getElementById("filter-outfits").onclick = (e) => {
    setActiveButton(e.target);
    document.getElementById("outfits-header").style.display = "flex";
    document.getElementById("favourite-outfits-grid").style.display = "grid";
    document.getElementById("clothes-header").style.display = "none";
    document.getElementById("favourite-clothes-grid").style.display = "none";
};

document.getElementById("filter-clothes").onclick = (e) => {
    setActiveButton(e.target);
    document.getElementById("outfits-header").style.display = "none";
    document.getElementById("favourite-outfits-grid").style.display = "none";
    document.getElementById("clothes-header").style.display = "flex";
    document.getElementById("favourite-clothes-grid").style.display = "grid";
};

function setActiveButton(clickedBtn) {
    document.querySelectorAll(".filter-button").forEach(btn => btn.classList.remove("active-filter-button"));
    clickedBtn.classList.add("active-filter-button");
}

// Start
loadFavourites();