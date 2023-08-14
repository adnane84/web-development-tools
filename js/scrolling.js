// Your existing code...

// Scroll-to-Top Button JavaScript
const scrollToTopButton = document.getElementById("scrollToTopButton");

const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

scrollToTopButton.addEventListener("click", scrollToTop);

window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    scrollToTopButton.style.opacity = 1;
  } else {
    scrollToTopButton.style.opacity = 0;
  }
});