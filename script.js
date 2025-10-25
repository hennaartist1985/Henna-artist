// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handling for Formspree
document.getElementById('bookingForm').addEventListener('submit', function(e) {
    // Let the form submit naturally to Formspree
    // Show loading state
    const form = this;
    const submitBtn = form.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    
    form.classList.add('loading');
    submitBtn.textContent = 'Sending...';
    
    // The form will submit to Formspree and redirect
    // If there's an error, we'll handle it
    setTimeout(() => {
        form.classList.remove('loading');
        submitBtn.textContent = originalText;
    }, 3000);
});

// Set minimum date for booking form
const today = new Date().toISOString().split('T')[0];
const dateInput = document.getElementById('date');
if (dateInput) {
    dateInput.setAttribute('min', today);
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .contact-item, .stat-item, .gallery-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = 'none';
    }
});

// Clickable contact functions
function openLocation() {
    const address = "2 Clover Ct, Algonquin, IL 60102";
    const encodedAddress = encodeURIComponent(address);
    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    window.open(googleMapsUrl, '_blank');
}

function openInstagram() {
    const instagramUrl = "https://www.instagram.com/henna.artist1985";
    window.open(instagramUrl, '_blank');
}

// Gallery filtering functionality
document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const currentCount = document.getElementById('currentCount');
    const galleryGrid = document.getElementById('galleryGrid');

    let visibleItems = 12;
    let currentFilter = 'all';
    let galleryItems = [];

    // Load gallery from JSON
    async function loadGallery() {
        try {
            const response = await fetch('_content/gallery.json');
            const data = await response.json();

            // Clear existing gallery
            if (galleryGrid) {
                galleryGrid.innerHTML = '';
            }

            // Create gallery items from JSON
            data.items.forEach((item, index) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.setAttribute('data-category', item.category);
                galleryItem.style.opacity = '0';
                galleryItem.style.transform = 'translateY(30px)';
                galleryItem.style.transition = 'all 0.6s ease';

                const img = document.createElement('img');
                img.src = item.image;
                img.alt = item.alt || item.title;

                galleryItem.appendChild(img);
                galleryGrid.appendChild(galleryItem);

                // Observe for animation
                observer.observe(galleryItem);
            });

            // Update galleryItems reference
            galleryItems = document.querySelectorAll('.gallery-item');

            // Initialize gallery after loading
            filterGallery('all');

        } catch (error) {
            console.error('Error loading gallery:', error);
            // Fallback: keep existing hardcoded gallery if JSON fails to load
        }
    }

    // Filter functionality - set up event listeners
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(btn => btn.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');

                const filter = this.getAttribute('data-filter');
                currentFilter = filter;

                filterGallery(filter);
                resetLoadMore();
            });
        });
    }

    function filterGallery(filter) {
        galleryItems = document.querySelectorAll('.gallery-item');
            galleryItems.forEach((item, index) => {
                if (filter === 'all' || item.getAttribute('data-category') === filter) {
                    item.classList.remove('hidden');
                    
                    // Show/hide based on current visible count
                    if (index >= visibleItems) {
                        item.style.display = 'none';
                    } else {
                        item.style.display = 'block';
                    }
                } else {
                    item.classList.add('hidden');
                    item.style.display = 'none';
                }
            });
            
            updateCounter();
        }
        
        // Load more functionality
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', function() {
                visibleItems += 12; // Changed from 24 to 12
                showMoreItems();
                updateCounter();
                
                // Hide load more button if all items are visible
                const totalFilteredItems = getTotalFilteredItems();
                if (visibleItems >= totalFilteredItems) {
                    loadMoreBtn.style.display = 'none';
                }
            });
        }
        
    function showMoreItems() {
        galleryItems = document.querySelectorAll('.gallery-item');
        let count = 0;
        galleryItems.forEach((item, index) => {
            if (!item.classList.contains('hidden')) {
                if (count < visibleItems) {
                    item.style.display = 'block';
                    count++;
                } else {
                    item.style.display = 'none';
                }
            }
        });
    }

    function resetLoadMore() {
        visibleItems = 12;
        if (loadMoreBtn) {
            loadMoreBtn.style.display = 'block';
        }
        showMoreItems();
    }

    function getTotalFilteredItems() {
        galleryItems = document.querySelectorAll('.gallery-item');
        if (currentFilter === 'all') {
            return galleryItems.length;
        } else {
            return document.querySelectorAll(`[data-category="${currentFilter}"]`).length;
        }
    }

    function updateCounter() {
        if (currentCount) {
            const totalFiltered = getTotalFilteredItems();
            const showing = Math.min(visibleItems, totalFiltered);
            currentCount.textContent = showing;
            const totalCountElement = document.getElementById('totalCount');
            if (totalCountElement) {
                totalCountElement.textContent = totalFiltered;
            }
        }
    }

    // Load gallery on page load
    loadGallery();
});