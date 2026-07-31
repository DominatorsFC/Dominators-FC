document.addEventListener("DOMContentLoaded", () => {
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const navMenu = document.getElementById("nav-menu");
  const navbar = document.getElementById("navbar");
  const backToTopBtn = document.getElementById("back-to-top");
  const sections = document.querySelectorAll("section[id]");
  const navItems = document.querySelectorAll(".nav-item");

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      navMenu.classList.toggle("active");
      const icon = mobileMenuBtn.querySelector("i");
      if (icon) {
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-xmark");
      }
    });
  }

  const navLinks = document.querySelectorAll('a[href^="#"]');

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      e.preventDefault();

      if (navMenu && navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        const icon = mobileMenuBtn ? mobileMenuBtn.querySelector("i") : null;
        if (icon) {
          icon.classList.add("fa-bars");
          icon.classList.remove("fa-xmark");
        }
      }

      const targetElement = document.querySelector(targetId);

      if (targetElement) {
        const headerOffset = 70;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });
      }
    });
  });

  window.addEventListener("scroll", () => {
    const scrollY = window.pageYOffset;

    if (scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    if (scrollY > 400) {
      backToTopBtn.classList.add("visible");
    } else {
      backToTopBtn.classList.remove("visible");
    }

    sections.forEach((current) => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute("id");

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navItems.forEach((item) => {
          item.classList.remove("active");
          if (item.getAttribute("href") === `#${sectionId}`) {
            item.classList.add("active");
          }
        });
      }
    });
  });

  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");
  const galleryItems = document.querySelectorAll(".gallery-item");

  galleryItems.forEach((item) => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      if (img && lightbox && lightboxImg) {
        lightbox.style.display = "flex";
        lightboxImg.src = img.src;
      }
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener("click", () => {
      lightbox.style.display = "none";
    });
  }

  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target !== lightboxImg) {
        lightbox.style.display = "none";
      }
    });
  }
});
