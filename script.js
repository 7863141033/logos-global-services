/* ===========================
   LOGOS GLOBAL SERVICES LLC
   Main JavaScript File
   =========================== */

// Shopping Cart Management
let cart = [];
const STORAGE_KEY = 'logos_cart';

// Initialize cart from localStorage
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    updateCartCount();
    setupEventListeners();
    setupMobileMenu();
});

// Load cart from localStorage
function loadCart() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            cart = [];
        }
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

// Add item to cart
function addToCart(productName, price) {
    const item = {
        id: Date.now(),
        name: productName,
        price: parseFloat(price),
        quantity: 1
    };

    // Check if item already exists
    const existingItem = cart.find(i => i.name === productName);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(item);
    }

    saveCart();
    updateCartCount();
    showNotification(`${productName} added to cart!`);
}

// Remove item from cart
function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    saveCart();
    updateCartCount();
    renderCartItems();
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cart-count');
    cartCountElements.forEach(el => {
        el.textContent = count;
    });
}

// Render cart items
function renderCartItems() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCart = document.getElementById('cart-empty');
    
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '';
        if (emptyCart) emptyCart.style.display = 'block';
        updateCartTotal();
        return;
    }

    if (emptyCart) emptyCart.style.display = 'none';

    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <div class="cart-item-price">
                    Qty: <input type="number" value="${item.quantity}" min="1" 
                        onchange="updateQuantity(${item.id}, this.value)" style="width: 50px;">
                    × $${item.price.toFixed(2)}
                </div>
                <div style="font-weight: bold; color: #0066cc; margin-top: 5px;">
                    $${(item.price * item.quantity).toFixed(2)}
                </div>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');

    updateCartTotal();
}

// Update item quantity
function updateQuantity(itemId, newQuantity) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity = parseInt(newQuantity) || 1;
        if (item.quantity < 1) item.quantity = 1;
        saveCart();
        renderCartItems();
    }
}

// Update cart total
function updateCartTotal() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalElement = document.getElementById('cart-total');
    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }
}

// Open cart modal
function openCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.add('show');
        renderCartItems();
    }
}

// Close cart modal
function closeCart() {
    const modal = document.getElementById('cart-modal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Checkout
function checkout() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Here you would integrate Stripe or PayPal
    // For now, show a simple confirmation
    const cartSummary = cart.map(item => 
        `${item.name} (x${item.quantity}): $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    alert(`Order Summary:\n\n${cartSummary}\n\nTotal: $${total.toFixed(2)}\n\nProcessing payment...`);
    
    // Clear cart after checkout
    cart = [];
    saveCart();
    updateCartCount();
    closeCart();
    showNotification('Order placed successfully!');
}

// Contact for Service
function contactForService(serviceName) {
    const message = `I'm interested in: ${serviceName}`;
    const contactForm = document.getElementById('contact-form-page');
    
    if (contactForm) {
        const subjectInput = contactForm.querySelector('#subject');
        if (subjectInput) {
            subjectInput.value = message;
        }
        contactForm.scrollIntoView({ behavior: 'smooth' });
    } else {
        // If on homepage, go to contact page
        window.location.href = `contact.html?service=${encodeURIComponent(serviceName)}`;
    }
}

// Form Handling
function setupEventListeners() {
    // Contact form on contact page
    const contactFormPage = document.getElementById('contact-form-page');
    if (contactFormPage) {
        contactFormPage.addEventListener('submit', handleContactFormSubmit);
    }

    // Contact form on homepage
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactFormSubmit);
    }

    // Service form in admin
    const serviceForm = document.getElementById('service-form');
    if (serviceForm) {
        serviceForm.addEventListener('submit', handleServiceFormSubmit);
    }

    // Pricing form in admin
    const pricingForm = document.getElementById('pricing-form');
    if (pricingForm) {
        pricingForm.addEventListener('submit', handlePricingFormSubmit);
    }

    // Image form in admin
    const imageForm = document.getElementById('image-form');
    if (imageForm) {
        imageForm.addEventListener('submit', handleImageFormSubmit);
    }

    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('cart-modal');
        if (event.target === modal) {
            closeCart();
        }
    });
}

// Handle contact form submission
function handleContactFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Here you would send the form data to a server
    console.log('Form submitted:', data);
    
    showNotification('Thank you! We\'ll get back to you soon.');
    e.target.reset();
}

// Handle service form submission (admin)
function handleServiceFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('service-name').value;
    const price = document.getElementById('service-price').value;
    
    // Create service item
    const serviceList = document.getElementById('services');
    if (serviceList) {
        const li = document.createElement('li');
        li.innerHTML = `
            <strong>${name}</strong> - $${price}
            <button onclick="this.parentElement.remove()" style="margin-left: 10px;">Remove</button>
        `;
        serviceList.appendChild(li);
    }
    
    showNotification('Service added successfully!');
    e.target.reset();
}

// Handle pricing form submission (admin)
function handlePricingFormSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('pricing-name').value;
    const value = document.getElementById('pricing-value').value;
    
    console.log('Pricing updated:', { name, value });
    showNotification(`Pricing updated: ${name} - $${value}`);
    e.target.reset();
}

// Handle image form submission (admin)
function handleImageFormSubmit(e) {
    e.preventDefault();
    
    const fileInput = document.getElementById('image-file');
    const nameInput = document.getElementById('image-name');
    const file = fileInput.files[0];
    const name = nameInput.value;
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const imageList = document.getElementById('images');
            if (imageList) {
                const li = document.createElement('li');
                li.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                        <img src="${event.target.result}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
                        <div>
                            <strong>${name}</strong>
                            <button onclick="this.parentElement.parentElement.remove()" style="margin-left: 10px;">Remove</button>
                        </div>
                    </div>
                `;
                imageList.appendChild(li);
            }
        };
        reader.readAsDataURL(file);
    }
    
    showNotification('Image uploaded successfully!');
    e.target.reset();
}

// Mobile Menu Toggle
function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });

        // Close menu when a link is clicked
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navMenu.classList.remove('active');
            });
        });
    }
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background-color: #0066cc;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// FAQ Toggle
function toggleFAQ(button) {
    const faqItem = button.parentElement;
    faqItem.classList.toggle('open');
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '#cart-modal') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// Lazy Loading for Images (if you add images)
if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Get URL parameters
function getURLParameter(name) {
    return new URLSearchParams(window.location.search).get(name);
}

// Handle service parameter from URL
document.addEventListener('DOMContentLoaded', function() {
    const service = getURLParameter('service');
    if (service && document.getElementById('subject')) {
        document.getElementById('subject').value = `Interested in: ${decodeURIComponent(service)}`;
    }
});

// Analytics Helper (optional)
function trackEvent(category, action, label) {
    console.log(`Event: ${category} - ${action} - ${label}`);
    // You can integrate with Google Analytics or other tracking service here
}

// Payment Integration Placeholder
// You would integrate Stripe here
function initiateStripePayment() {
    // Placeholder for Stripe integration
    console.log('Initiating Stripe payment...');
    // const stripe = Stripe('YOUR_STRIPE_PUBLIC_KEY');
    // stripe.redirectToCheckout({ sessionId: 'YOUR_SESSION_ID' });
}

// PayPal Integration Placeholder
function initiatePayPalPayment() {
    // Placeholder for PayPal integration
    console.log('Initiating PayPal payment...');
    // window.location.href = 'https://www.paypal.com/...';
}

// Export functions for use in HTML
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.openCart = openCart;
window.closeCart = closeCart;
window.checkout = checkout;
window.contactForService = contactForService;
window.toggleFAQ = toggleFAQ;
window.updateQuantity = updateQuantity;
window.initiateStripePayment = initiateStripePayment;
window.initiatePayPalPayment = initiatePayPalPayment;
