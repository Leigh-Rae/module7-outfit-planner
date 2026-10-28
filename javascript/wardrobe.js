import { getAllData, saveData, updateData, deleteData } from "../db/db.js";

// --- 1. VARIABLES ---
let allProducts = []; // Holds all items from Firebase
let displayedCount = 8; // Show 8 at a time
let currentFilter = "All";
let searchText = "";
let filterColour = "All";
let filterSeason = "All";
let filterOccasion = "All";

// --- 2. SHOW USER PROFILE INITIAL ---
const savedName = localStorage.getItem("userName");
if (savedName && savedName !== "User") {
    // If there's no image, just put the first letter of their name
    document.getElementById("nav-profile-pic").src = `https://ui-avatars.com/api/?name=${savedName}&background=f7a8bc&color=fff`;
}

// --- 3. LOAD DATA FROM FIREBASE ---
async function loadWardrobe() {
    allProducts = await getAllData("clothing_items");
    renderGrid();
}

// --- 4. RENDER THE GRID ---
function renderGrid() {
    const grid = document.getElementById("wardrobe-grid");
    grid.innerHTML = ""; // Clear old items

    // Filter the items based on search and dropdowns
    let filtered = allProducts.filter(item => {
        let matchesSearch = item.name.toLowerCase().includes(searchText.toLowerCase());
        let matchesCategory = (currentFilter === "All" || item.category === currentFilter);
        let matchesColour = (filterColour === "All" || item.colour === filterColour);
        let matchesSeason = (filterSeason === "All" || item.season === filterSeason);
        let matchesOccasion = (filterOccasion === "All" || item.occasion === filterOccasion);
        
        return matchesSearch && matchesCategory && matchesColour && matchesSeason && matchesOccasion;
    });

    // Show only the first  items (e.g., 8)
    let itemsToShow = filtered.slice(0, displayedCount);

    // Draw the cards
    itemsToShow.forEach(item => {
        let heart = item.is_favourite ? '<i class="fa-solid fa-heart" style="color: #f7a8bc;"></i>' : '<i class="fa-regular fa-heart"></i>';
        
        grid.innerHTML += `
            <div class="card-box">
                <button class="heart-button" onclick="toggleFavourite('${item.id}', ${item.is_favourite})">${heart}</button>
                <img src="${item.image_url || 'placeholder.png'}" alt="${item.name}" class="card-image">
                <div class="card-text-area">
                    <span class="grey-tag">${item.category}</span>
                    <h3 class="item-name">${item.name}</h3>
                    <p class="item-details">${item.season} • ${item.colour}</p>
                    <div class="card-bottom-row">
                        <span class="wear-count">Worn ${item.wear_count || 0} times</span>
                        <div class="card-action-buttons">
                            <button class="small-button" onclick="deleteItem('${item.id}')">Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    // Update the "Showing X of Y items" text
    document.getElementById("item-count-text").innerText = `Showing ${itemsToShow.length} of ${filtered.length} items`;

    // Hide the "Load More" button if we've shown everything
    if (itemsToShow.length >= filtered.length) {
        document.getElementById("load-more-btn").style.display = "none";
    } else {
        document.getElementById("load-more-btn").style.display = "block";
    }
}

// --- 5. FAVOURITE SYSTEM ---
window.toggleFavourite = async function(id, currentStatus) {
    // Flip the status (true becomes false, false becomes true)
    await updateData("clothing_items", id, { is_favourite: !currentStatus });
    // Reload data
    loadWardrobe(); 
};

// --- 6. DELETE SYSTEM ---
window.deleteItem = async function(id) {
    // Show confirm box
    const confirmDelete = confirm("Are you sure you want to delete this item?");
    
    if (confirmDelete) {
        await deleteData("clothing_items", id);
        loadWardrobe(); // Reload the grid
    }
};

// --- 7. FILTER & SEARCH EVENTS ---
document.getElementById("search-bar").addEventListener("input", (e) => {
    searchText = e.target.value;
    displayedCount = 8; // Reset pagination on new search
    renderGrid();
});

document.getElementById("filter-colour").addEventListener("change", (e) => {
    filterColour = e.target.value;
    displayedCount = 8;
    renderGrid();
});

document.getElementById("filter-season").addEventListener("change", (e) => {
    filterSeason = e.target.value;
    displayedCount = 8;
    renderGrid();
});

document.getElementById("filter-occasion").addEventListener("change", (e) => {
    filterOccasion = e.target.value;
    displayedCount = 8;
    renderGrid();
});

// Category Buttons
const catBtns = document.querySelectorAll('.category-button');
catBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        // Remove active class from all buttons
        catBtns.forEach(b => b.classList.remove('active-category'));
        // Add active class to clicked button
        e.target.classList.add('active-category');
        
        currentFilter = e.target.getAttribute('data-category');
        displayedCount = 8;
        renderGrid();
    });
});

// Clear Filters
document.getElementById("clear-filters").addEventListener("click", () => {
    searchText = "";
    filterColour = "All";
    filterSeason = "All";
    filterOccasion = "All";
    currentFilter = "All";
    displayedCount = 8;
    
    // Reset HTML inputs
    document.getElementById("search-bar").value = "";
    document.getElementById("filter-colour").value = "All";
    document.getElementById("filter-season").value = "All";
    document.getElementById("filter-occasion").value = "All";
    
    // Reset category buttons
    catBtns.forEach(b => b.classList.remove('active-category'));
    document.querySelector('[data-category="All"]').classList.add('active-category');
    
    renderGrid();
});

// Load More Button
document.getElementById("load-more-btn").addEventListener("click", () => {
    displayedCount += 8; // Add 8 more items
    renderGrid();
});


// --- 8. ADD ITEM POPUP ---
const popup = document.getElementById("popup");
document.querySelector(".pink-button").onclick = () => popup.style.display = "flex"; // Header button
document.querySelector(".page-title-row .pink-button").onclick = () => popup.style.display = "flex"; // Top button
document.getElementById("closeBtn").onclick = () => popup.style.display = "none";

document.getElementById("myForm").onsubmit = async (e) => {
    e.preventDefault();
    const file = document.getElementById("image-file").files[0];
    if (!file) return;

    // Check if file is too big (1MB limit)
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
        location.reload(); // Reload to show new item
    };
    reader.readAsDataURL(file);
};

// START
loadWardrobe();