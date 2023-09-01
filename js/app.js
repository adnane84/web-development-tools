import data from './data.js';

// Making a reusable function for the events
const addEventOnElements = function (elements, eventType, callback) {
  for (let i = 0, len = elements.length; i < len; i++) {
    elements[i].addEventListener(eventType, callback);
  }
};

// Navbar toggle for small screens
const navbar = document.querySelector("[data-navbar]");
const navTogglers = document.querySelectorAll("[data-nav-toggler]");
const overlay = document.querySelector("[data-overlay]");

const toggleNavbar = function () {
  navbar.classList.toggle("active");
  overlay.classList.toggle("active");
  document.body.classList.toggle("nav-active");
};

addEventOnElements(navTogglers, "click", toggleNavbar);

// Adding effect when the user scrolls down 100px
const header = document.querySelector("[data-header]");

const handleScroll = function () {
  if (window.scrollY > 100) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
};

window.addEventListener("scroll", handleScroll);

// Throttling the scroll event for Scroll Reveal
const revealElements = document.querySelectorAll("[data-reveal]");
const revealThreshold = window.innerHeight / 1.2;

const reveal = function () {
  for (let i = 0, len = revealElements.length; i < len; i++) {
    if (revealElements[i].getBoundingClientRect().top < revealThreshold) {
      revealElements[i].classList.add("revealed");
    }
  }
};

const throttledReveal = throttle(reveal, 100); // Throttle scroll event
window.addEventListener("scroll", throttledReveal);
window.addEventListener("load", throttledReveal);

// Utility function to throttle functions
function throttle(fn, delay) {
  let lastCall = 0;
  return function (...args) {
    const now = new Date().getTime();
    if (now - lastCall < delay) return;
    lastCall = now;
    fn(...args);
  };
}

// Fetching data to create a random component
const randomWebsiteCard = document.querySelector(".random-website");

// Create a variable where we will save the data
let postsData = [];
let currentFilters = {
  categories: [],
  type: [],
};
let favoritesData = [];

// Create Tags from categories and types
const categoriesContainer = document.querySelector("#post-categories");
const typeContainer = document.querySelector("#post-levels");
const noResults = document.querySelector("#no-results");
const cardContainer = document.getElementById("cardContainer");
const favoritesContainer = document.querySelector(".favorite-cards");
const sortButtonAtoZ = document.getElementById("sortButtonAtoZ");
const sortButtonZtoA = document.getElementById("sortButtonZtoA");
const API_URL = "https://node-api-v2-qteu.onrender.com/api/products";

const fetchData = async () => {
  try {
  
    postsData = data;

    const categoriesData = [
      ...new Set(postsData.flatMap((post) => post.categories)),
    ];
    const typeData = [...new Set(postsData.flatMap((post) => post.type))];

    categoriesData.map((category) =>
      createFilter("categories", category, categoriesContainer)
    );
    typeData.map((type) => createFilter("type", type, typeContainer));

    handleFilterPosts(currentFilters);
  } catch (error) {
    console.error("Error fetching data:", error);
  }
  randomCard(postsData);
};

const randomCard = (data) => {
  const randomIndex = Math.floor(Math.random() * data.length);
  const randomElement = data[randomIndex];

  const card = document.createElement("div");
  card.classList.add("card");

  const { title, image, link, type, categories, description } = randomElement;
  card.innerHTML = `
    <div class="feature-card">
      <figure class="random-banner img-holder">
        <img src="${image}" alt="card image" class="img-cover" height="480" width="327">
      </figure>
      <div class="random-content">
        <span class="cards-category">${categories[0]}</span>
        <div class="random-info">
          <h3>${title}</h3>
          <p>${description}</p>
        </div>
        <div class="random-category">
          <span class="btn btn-secondary">
            ${type[0]}
          </span>
          <a href="${link}" class="btn btn-primary">Read more</a>
        </div>
      </div>
    </div>
  `;
  randomWebsiteCard.append(card);
};

// Function to create a card
function createCard(data) {
  const { title, image, link, type, categories, description } = data;
  const cards = document.createElement("div");
  cards.className = "website_card";
  cards.innerHTML = `
  <div class="feature-card websites">
  <figure class="random-banner img-holder">
    <img src="${image}" alt="card image" class="img-cover cards-images">
  </figure>
  <div class="random-content">
  <h3>${title}</h3>
    <div class="cards-info">
    <span class="cards-category">${categories.shift()}</span>
      <span class="type-title">
            ${type.shift()}
          </span>
      <p>${description}</p>
    </div>
    <div class="random-category">
    <button class="addCart btn btn-secondary">Add to favorites</button>
      <a href="${link}" class="linksBtn btn btn-primary">Read more</a>
    </div>
  </div>
</div>
  `;

  const favoriteButton = cards.querySelector(".addCart");
  favoriteButton.addEventListener("click", () => toggleFavorite(data));

  // Set a unique identifier for each post using the title
  cards.setAttribute("data-post-title", title);
  cardContainer.append(cards);
}

const createFilter = (key, param, container) => {
  const filterButton = document.createElement("button");
  filterButton.className = "tag-btn";
  filterButton.innerHTML = param;
  filterButton.setAttribute("data-state", "inactive");
  filterButton.setAttribute("data-filter", key);
  filterButton.addEventListener("click", (e) =>
    handleButtonClick(e, key, param, container)
  );
  container.append(filterButton);
};

const handleButtonClick = (e, key, param, container) => {
  const button = e.target;
  const buttonState = button.getAttribute("data-state");
  if (buttonState === "inactive") {
    button.classList.add("is-active");
    button.setAttribute("data-state", "active");
    currentFilters[key].push(param);
  } else {
    button.classList.remove("is-active");
    button.setAttribute("data-state", "inactive");
    currentFilters[key] = currentFilters[key].filter((item) => item !== param);
  }
  handleFilterPosts(currentFilters);
};

const handleFilterPosts = (filters) => {
  let filteredPosts = [...postsData];
  for (const key in filters) {
    if (filters[key].length > 0) {
      filteredPosts = filteredPosts.filter(
        (post) =>
          filters[key].includes(post[key]) ||
          filters[key].some((filter) => post[key].includes(filter))
      );
    }
  }

  if (filteredPosts.length === 0) {
    noResults.innerText = "Sorry, we couldn't find any results.";
  } else {
    noResults.innerText = "";
  }

  cardContainer.innerHTML = "";
  filteredPosts.map((post) => createCard(post));
};

const toggleFavorite = (postData) => {
  if (favoritesData.some((favPost) => favPost.title === postData.title)) {
    removeFromFavorites(postData);
  } else {
    addToFavorites(postData);
  }
};

const addToFavorites = (postData) => {
  favoritesData.push(postData);
  updateFavorites();

  // Get the button element of the post being added to favorites in the postsContainer
  const postElement = document.querySelector(
    `[data-post-title = "${postData.title}"]`
  );
  const favoriteButton = postElement.querySelector(".addCart");
  favoriteButton.innerText = "Remove";
};

const removeFromFavorites = (postData) => {
  favoritesData = favoritesData.filter(
    (favPost) => favPost.title !== postData.title
  );
  updateFavorites();

  // Get the button element of the post being removed from favorites in the postsContainer
  const postElement = document.querySelector(
    `[data-post-title="${postData.title}"]`
  );
  const favoriteButton = postElement.querySelector(".addCart");

  // Remove the CSS class to revert back to the original style
  favoriteButton.classList.remove("gray-button");
  favoriteButton.innerText = "Add to Favorites";
};

const createFavoritePost = (postData) => {
  const { title, image, link, categories, type, description } = postData;
  const post = document.createElement("div");
  post.className = "favorite-card";
  post.innerHTML = `
  <div class="websites">
  <figure class="random-banner img-holder">
    <img src="${image}" alt="card image" class="img-cover" height="480" width="327">
  </figure>
  <div class="favorite-content">
    <span class="cards-category">${categories.shift()}</span>
    <div class="favorite-info">
      <h3>${title}</h3>
      <p>${description}</p>
    </div>
    <div class="random-category">
      <span class="type">
        ${type.shift()}
      </span>
    </div>
  </div>
  <div class="favorite-category">
      <button class="addCart btn btn-secondary">Remove</button>
      <a href="${link}" class="linksBtn btn btn-primary">Read more</a>
      </div>
  </div>
  `;

  const favoriteButton = post.querySelector(".addCart");
  favoriteButton.addEventListener("click", () => toggleFavorite(postData));

  favoritesContainer.append(post);
};

const updateFavorites = () => {
  favoritesContainer.innerHTML = "";
  favoritesData.map((post) => createFavoritePost(post));
  console.log(favoritesData);
  // Update the button text for each post in the main cart
  const mainCartPosts = cardContainer.querySelectorAll(".post");
  mainCartPosts.forEach((postElement) => {
    const title = postElement.querySelector(".post-title").innerText;
    const favoriteButton = postElement.querySelector(".addCart");

    if (favoritesData.some((favPost) => favPost.title === title)) {
      favoriteButton.classList.add("gray-button");
      favoriteButton.innerText = "Remove from favorites";
    } else {
      favoriteButton.classList.remove("gray-button");
      favoriteButton.innerText = "Add to favorites";
    }
  });
};

const sortCartsByName = () => {
  postsData.sort((a, b) => a.title.localeCompare(b.title));
  handleFilterPosts(currentFilters);
};

const sortCartsByNameB = () => {
  postsData.sort((a, b) => b.title.localeCompare(a.title));
  handleFilterPosts(currentFilters);
};

sortButtonAtoZ.addEventListener("click", () =>
  handleSortButtonClick(sortButtonAtoZ, sortCartsByName)
);
sortButtonZtoA.addEventListener("click", () =>
  handleSortButtonClick(sortButtonZtoA, sortCartsByNameB)
);

const handleSortButtonClick = (button, sortingFunction) => {
  const buttonState = button.getAttribute("data-state");
  if (buttonState === "inactive") {
    button.setAttribute("data-state", "active");
  } else {
    button.setAttribute("data-state", "inactive");
  }
  sortingFunction();
};

document.addEventListener("DOMContentLoaded", () => {
  let sortingButton = document.querySelectorAll(".tag-btn");
  sortingButton.forEach(function (btn) {
    btn.addEventListener("click", () => {
      sortingButton.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });
});

const favoriteBtn = document.getElementById("show-hide");
const favoritePage = document.querySelector(".favoritesContainer");
const closeBtn = document.querySelector(".fa-times");

favoriteBtn.addEventListener("click", function () {
  favoritePage.classList.add("show-fav");
  updateFavorites();
});
closeBtn.addEventListener("click", function () {
  favoritePage.classList.remove("show-fav");
});

fetchData(data);
