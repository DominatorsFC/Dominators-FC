document.addEventListener('DOMContentLoaded', () => {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navMenu = document.getElementById('nav-menu');
  const navItems = document.querySelectorAll('.nav-item');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileMenuBtn.querySelector('i');
      if (icon) {
        if (navMenu.classList.contains('active')) {
          icon.classList.remove('fa-bars');
          icon.classList.add('fa-xmark');
        } else {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      }
    });

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const icon = mobileMenuBtn.querySelector('i');
        if (icon) {
          icon.classList.remove('fa-xmark');
          icon.classList.add('fa-bars');
        }
      });
    });
  }

  const galleryItems = document.querySelectorAll('.gallery-item');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (galleryItems.length && lightbox && lightboxImg) {
    galleryItems.forEach(item => {
      const img = item.querySelector('img');
      if (img) {
        item.addEventListener('click', () => {
          lightbox.classList.add('active');
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt;
        });
      }
    });

    const closeLightbox = () => {
      lightbox.classList.remove('active');
      lightboxImg.src = '';
    };

    if (lightboxClose) {
      lightboxClose.addEventListener('click', closeLightbox);
    }

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // ক্লাউড ডেটাবেস থেকে সেভ করা টেক্সট এবং ছবি লোড করার ফাংশন
  async function loadCloudData() {
    if (!window.db) return;
    const { doc, getDoc } = window.firebaseFirestoreModules;

    // টেক্সট এলিমেন্ট লোড করা
    const textEls = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, label');
    for (let i = 0; i < textEls.length; i++) {
      const el = textEls[i];
      if (!el.id) el.id = `editable-text-${i}`;
      try {
        const docRef = doc(window.db, "websiteContent", el.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          el.innerHTML = docSnap.data().value;
        }
      } catch (err) {
        console.error("Error loading text:", err);
      }
    }

    // ইমেজ লোড করা
    const images = document.querySelectorAll('img');
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      if (!img.id) img.id = `editable-img-${i}`;
      try {
        const docRef = doc(window.db, "websiteContent", img.id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          img.src = docSnap.data().value;
        }
      } catch (err) {
        console.error("Error loading image:", err);
      }
    }
  }

  // পেজ লোড হওয়ার সাথে সাথে ক্লাউড থেকে ডেটা ফেচ করা
  setTimeout(loadCloudData, 500);

  // Admin Login and Editing Setup
  const adminBtn = document.getElementById('admin-login-btn');
  const adminModal = document.getElementById('admin-modal');
  const submitLogin = document.getElementById('submit-login');
  const adminPass = document.getElementById('admin-pass');
  const loginError = document.getElementById('login-error');

  const ADMIN_PASSWORD = 'admin123'; 

  if (sessionStorage.getItem('isAdmin') === 'true') {
    enableEditingMode();
  }

  if (adminBtn) {
    adminBtn.addEventListener('click', () => {
      if (sessionStorage.getItem('isAdmin') === 'true') {
        if (confirm('Do you want to logout from Admin mode?')) {
          sessionStorage.removeItem('isAdmin');
          location.reload();
        }
      } else {
        if (adminModal) {
          adminModal.style.display = 'flex';
        } else {
          alert('Error: #admin-modal element is missing from your HTML!');
        }
      }
    });
  }

  if (submitLogin) {
    submitLogin.addEventListener('click', () => {
      if (adminPass && adminPass.value === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdmin', 'true');
        if (adminModal) adminModal.style.display = 'none';
        enableEditingMode();
      } else {
        if (loginError) loginError.style.display = 'block';
      }
    });
  }

  function enableEditingMode() {
    if (adminBtn) adminBtn.textContent = 'Logout Admin';
    
    // 1. Target text elements for cloud saving
    const editableElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span, a, label');
    editableElements.forEach((el, index) => {
      if (!el.id) el.id = `editable-text-${index}`;
      
      el.setAttribute('contenteditable', 'true');
      el.style.outline = '1px dashed var(--accent-gold)';
      el.style.padding = '2px 4px';
      
      el.addEventListener('input', async () => {
        if (window.db) {
          try {
            const { doc, setDoc } = window.firebaseFirestoreModules;
            await setDoc(doc(window.db, "websiteContent", el.id), { value: el.innerHTML });
          } catch (e) {
            console.error("Error saving to cloud:", e);
          }
        }
      });
    });

    // 2. Enable Image Changing via Double-Click Prompt (Cloud Sync)
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.id) img.id = `editable-img-${index}`;
      
      img.style.border = '2px dashed var(--accent-gold)';
      img.style.cursor = 'pointer';

      img.addEventListener('dblclick', async () => {
        const newUrl = prompt('Enter new image URL (e.g., image link or asset path):', img.src);
        if (newUrl) {
          img.src = newUrl;
          if (window.db) {
            try {
              const { doc, setDoc } = window.firebaseFirestoreModules;
              await setDoc(doc(window.db, "websiteContent", img.id), { value: newUrl });
              alert('Image updated and saved to Cloud Database!');
            } catch (e) {
              console.error("Error saving image to cloud:", e);
            }
          }
        }
      });
    });

    alert('Cloud Admin Mode Activated!\n- Changes will now sync globally via Firebase.');
  }
});
