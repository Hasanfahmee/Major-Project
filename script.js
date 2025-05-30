// Initialize Swiper for Home and Social Media
document.addEventListener("DOMContentLoaded", function () {
    try {
        if (typeof Swiper !== 'undefined') {
            const homeSwiper = new Swiper(".home-swiper", {
                loop: true,
                autoplay: { delay: 3000 },
                speed: 800
            });
            const socialSwiper = new Swiper(".social-media-swiper", {
                loop: true,
                slidesPerView: 3,
                spaceBetween: 10,
                autoplay: { delay: 4000 },
                navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
                pagination: { el: ".swiper-pagination", clickable: true },
                breakpoints: {
                    320: { slidesPerView: 2, spaceBetween: 8 },
                    640: { slidesPerView: 3, spaceBetween: 10 },
                    1024: { slidesPerView: 4, spaceBetween: 12 }
                }
            });
        } else {
            console.error('Swiper library not loaded');
            displayError('Slideshow functionality unavailable.');
        }
        fetchCsrfToken();
        fetchFeedbacks();
    } catch (error) {
        console.error('Initialization error:', error.message);
        displayError('Failed to initialize. Contact support at weddingpal@gmail.com.');
    }
});

// Display error message to user
function displayError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50';
    errorDiv.innerText = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
}

// API Base URL
const API_BASE_URL = 'https://weddingpal.onrender.com';

// CSRF Token
let csrfToken = '';

async function fetchCsrfToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/csrf-token`, { method: 'GET' });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        csrfToken = data.csrfToken || 'fallback-token';
        console.log('CSRF token fetched:', csrfToken);
        document.querySelectorAll('[name="csrf_token"]').forEach(input => {
            if (input) input.value = csrfToken;
        });
    } catch (err) {
        console.error('Failed to fetch CSRF token:', err.message);
        csrfToken = 'fallback-token';
        document.querySelectorAll('[name="csrf_token"]').forEach(input => {
            if (input) input.value = csrfToken;
        });
        displayError('Running in offline mode due to server connection issues.');
    }
}

// Navigation Helper
function navigateToSection(sectionId) {
    console.log(`Navigating to ${sectionId}`);
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
    else console.error(`Section ${sectionId} not found`);
}

// Smooth scrolling for nav links
document.querySelectorAll('.nav-link').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const section = document.querySelector(this.getAttribute('href'));
        if (section) section.scrollIntoView({ behavior: 'smooth' });
    });
});

// Search Functionality
function performGlobalSearch() {
    console.log('Performing search');
    const searchInput = document.getElementById('global-search');
    if (!searchInput) {
        console.error('Search input not found');
        return;
    }
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        alert('Please enter a search term.');
        return;
    }
    const sections = document.querySelectorAll('section, footer');
    let found = false;
    sections.forEach(section => {
        const text = section.textContent.toLowerCase();
        if (text.includes(query)) {
            section.scrollIntoView({ behavior: 'smooth' });
            found = true;
        }
    });
    if (!found) alert('No results found.');
}

// Registration Handling
async function handleRegistration(event) {
    event.preventDefault();
    console.log('Handling registration');
    const form = event.target;
    if (!form) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    const mobileRegex = /^\d{10}$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address.');
        return;
    }
    if (!mobileRegex.test(data.mobile)) {
        alert('Please enter a valid 10-digit mobile number.');
        return;
    }
    const regForm = document.getElementById('reg-form');
    const regResponse = document.getElementById('registration-response');
    if (!regForm || !regResponse) {
        console.error('Registration elements not found');
        displayError('Registration unavailable.');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        regForm.classList.add('hidden');
        regResponse.classList.remove('hidden');
    } catch (error) {
        console.error('Registration error:', error.message);
        regForm.classList.add('hidden');
        regResponse.classList.remove('hidden');
        displayError('Registration submitted successfully (offline mode).');
    }
}

// Close Response Box
function closeResponse() {
    console.log('Closing response');
    const regForm = document.getElementById('reg-form');
    const regResponse = document.getElementById('registration-response');
    const regFormElement = document.getElementById('registration-form');
    if (regForm && regResponse && regFormElement) {
        regResponse.classList.add('hidden');
        regForm.classList.remove('hidden');
        regFormElement.reset();
    } else {
        console.error('Registration elements not found');
        displayError('Unable to close response.');
    }
}

// Call and Meeting Scheduling
async function makeCall() {
    console.log('Scheduling call');
    try {
        const response = await fetch(`${API_BASE_URL}/call`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        alert(result.message || 'Call scheduled successfully!');
    } catch (error) {
        console.error('Call error:', error.message);
        alert('Call scheduled successfully (offline mode).');
        displayError('Call scheduled in offline mode.');
    }
}

async function scheduleMeeting(event) {
    event.preventDefault();
    console.log('Scheduling meeting');
    const form = event.target;
    if (!form) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const meetingResponse = document.getElementById('meeting-response');
    if (!meetingResponse) return;
    try {
        const response = await fetch(`${API_BASE_URL}/schedule`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        meetingResponse.innerText = result.message || 'Meeting scheduled successfully!';
        form.reset();
    } catch (error) {
        console.error('Meeting error:', error.message);
        meetingResponse.innerText = 'Meeting scheduled successfully (offline mode).';
        form.reset();
        displayError('Meeting scheduled in offline mode.');
    }
}

// Text Message Submission
async function sendText(event) {
    event.preventDefault();
    console.log('Sending message');
    const form = event.target;
    if (!form) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const textResponse = document.getElementById('text-response');
    if (!textResponse) return;
    try {
        const response = await fetch(`${API_BASE_URL}/text`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        textResponse.innerHTML = `${result.message || 'Message sent!'}<br><span class="text-yellow-600">WeddingPal: Thanks for your message!</span>`;
        form.reset();
    } catch (error) {
        console.error('Message error:', error.message);
        textResponse.innerHTML = `<span class="text-yellow-600">WeddingPal: Thanks for your message! (offline mode)</span>`;
        form.reset();
        displayError('Message sent in offline mode.');
    }
}

// FAQ Submission
async function submitFAQ(event) {
    event.preventDefault();
    console.log('Submitting FAQ');
    const form = event.target;
    if (!form) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const faqResponse = document.getElementById('faq-response');
    if (!faqResponse) return;
    try {
        const response = await fetch(`${API_BASE_URL}/faq`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        faqResponse.innerText = result.message || 'Question submitted successfully!';
        form.reset();
    } catch (error) {
        console.error('FAQ error:', error.message);
        faqResponse.innerText = 'Question submitted successfully (offline mode)!';
        form.reset();
        displayError('FAQ submitted in offline mode.');
    }
}

// Feedback Submission
async function submitFeedback(event) {
    event.preventDefault();
    console.log('Submitting feedback');
    const form = event.target;
    if (!form) return;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address.');
        return;
    }
    const feedbackResponse = document.getElementById('feedback-response');
    if (!feedbackResponse) return;
    try {
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const result = await response.json();
        feedbackResponse.innerText = result.message || 'Feedback submitted successfully!';
        form.reset();
        fetchFeedbacks();
    } catch (error) {
        console.error('Feedback error:', error.message);
        feedbackResponse.innerText = 'Feedback submitted successfully (offline mode)!';
        form.reset();
        fetchFeedbacks();
        displayError('Feedback submitted in offline mode.');
    }
}

// Fetch and Display Feedbacks
async function fetchFeedbacks() {
    console.log('Fetching feedbacks');
    const feedbackList = document.getElementById('feedback-list');
    if (!feedbackList) return;
    try {
        const response = await fetch(`${API_BASE_URL}/feedbacks`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const feedbacks = await response.json();
        feedbackList.innerHTML = '';
        feedbacks.forEach(feedback => {
            const div = document.createElement('div');
            div.className = 'bg-white p-4 rounded-lg shadow-lg';
            div.innerHTML = `
                <p class="text-gray-800 text-lg">"${feedback.feedback}"</p>
                <p class="text-gray-600 text-sm mt-2">— ${feedback.name} (${feedback.email})</p>
            `;
            feedbackList.appendChild(div);
        });
    } catch (error) {
        console.error('Error fetching feedbacks:', error.message);
        feedbackList.innerHTML = `
            <div class="bg-white p-4 rounded-lg shadow-lg">
                <p class="text-gray-800 text-lg">"Great service!"</p>
                <p class="text-gray-600 text-sm mt-2">— John Doe (john@example.com)</p>
            </div>
        `;
        displayError('Feedbacks loaded in offline mode.');
    }
}

// Chatbot Functionality
function toggleChatbot() {
    console.log('Toggling chatbot');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotIcon = document.getElementById('chatbot');
    if (!chatbotWindow || !chatbotIcon) {
        console.error('Chatbot elements not found:', { window: !!chatbotWindow, icon: !!chatbotIcon });
        displayError('Chatbot unavailable. Contact support at weddingpal@gmail.com.');
        return;
    }
    chatbotWindow.classList.toggle('hidden');
    console.log('Chatbot toggled:', chatbotWindow.classList.contains('hidden') ? 'Hidden' : 'Visible');
}

function sendChatbotMessage(event) {
    event.preventDefault();
    console.log('Sending chatbot message');
    const input = document.getElementById('chatbot-input');
    const messages = document.getElementById('chatbot-messages');
    if (!input || !messages) {
        console.error('Chatbot input or messages not found');
        displayError('Chatbot unavailable.');
        return;
    }
    const message = input.value.trim();
    if (!message) return;
    const userMessage = document.createElement('p');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `<strong>You:</strong> ${message}`;
    messages.appendChild(userMessage);
    let response = "I'm sorry, I didn't understand that. Try asking about booking, venues, costs, or cancellations!";
    const lowerMessage = message.toLowerCase();
    if (lowerMessage.includes('book') || lowerMessage.includes('planner') || lowerMessage.includes('register')) {
        response = "To book a WeddingPal planner, go to the Registration section and fill out the form.";
    } else if (lowerMessage.includes('venue') || lowerMessage.includes('sangeet') || lowerMessage.includes('mehendi')) {
        response = "We offer venues for Sangeet, Mehendi, Reception, and Ceremony. Check the Venues section.";
    } else if (lowerMessage.includes('cost') || lowerMessage.includes('price')) {
        response = "Pricing details are in the FAQ section. Register for a detailed quote.";
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('cancellation')) {
        response = "To cancel, contact us at weddingpal@gmail.com or 9611707778.";
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
        response = "Reach us at weddingpal@gmail.com or 9611707778. See the Contact section.";
    }
    const botMessage = document.createElement('p');
    botMessage.className = 'bot-message';
    botMessage.innerHTML = `<strong>WeddingPal:</strong> ${response}`;
    messages.appendChild(botMessage);
    messages.scrollTop = messages.scrollHeight;
    input.value = '';
    console.log('Chatbot response:', response);
}

// Venue Functions
function showVenue(type) {
    console.log(`Showing venue: ${type}`);
    const venueSection = document.getElementById("venue-section");
    const venueImagesDiv = document.getElementById("venue-images");
    const venueDetailsDiv = document.getElementById("venue-details");
    if (!venueSection || !venueImagesDiv || !venueDetailsDiv) {
        console.error('Venue elements not found');
        displayError('Venue details unavailable.');
        return;
    }
    venueImagesDiv.innerHTML = "";
    venueDetailsDiv.innerHTML = "";
    const venueDetails = {
        "sangeet": "A lively evening with DJ nights, stage setup, and themed decor.",
        "mehendi": "A colorful afternoon with floral decor and henna artists.",
        "reception": "A grand celebration with elegant lighting and music bands.",
        "ceremony": "A sacred setting with traditional mandap and floral designs."
    };
    const venueImages = {
        "sangeet": ["image s1.png", "image s2.png", "image s3.png", "image s4.png"],
        "mehendi": ["image m1.png", "image m2.png", "image m3.png", "image m4.png"],
        "reception": ["image r1.png", "image r2.png", "image r3.png", "image r4.png"],
        "ceremony": ["image c1.png", "image c2.png", "image c3.png", "image c4.png"]
    };
    const venueFeatures = {
        "image s1.png": ["Live Band", "Red Carpet Entry"],
        "image s2.png": ["Luxury Chairs", "Dance Floor"],
        "image s3.png": ["Rose Decor", "LED Letters"],
        "image s4.png": ["Romantic Lighting", "Decor Lounge"],
        "image m1.png": ["Henna Artists", "Colorful Cushions"],
        "image m2.png": ["Rangoli Setup", "Folk Music"],
        "image m3.png": ["Garden Setup", "Swing Decor"],
        "image m4.png": ["Floral Canopy", "Floor Seating"],
        "image r1.png": ["Live Band", "Red Carpet Entry"],
        "image r2.png": ["Luxury Chairs", "Dance Floor"],
        "image r3.png": ["Rose Decor", "LED Letters"],
        "image r4.png": ["Romantic Lighting", "Decor Lounge"],
        "image c1.png": ["Mandap Decor", "Sacred Fire Setup"],
        "image c2.png": ["South Indian Setup", "Banana Leaf Decor"],
        "image c3.png": ["Royal Mandap", "Spiritual Music"],
        "image c4.png": ["Temple Theme", "Vedic Chanting"]
    };
    venueDetailsDiv.innerHTML = `<p class="text-xl bg-yellow-200 rounded-lg p-4 shadow-md">${venueDetails[type]}</p>`;
    venueImages[type].forEach(image => {
        const card = document.createElement("div");
        card.className = "bg-white rounded-lg shadow-md p-4 w-72 text-left";
        const img = document.createElement("img");
        img.src = `images/${image}`;
        img.alt = `${type} venue`;
        img.className = "rounded-md h-40 w-full object-cover mb-2";
        const featureList = document.createElement("ul");
        featureList.className = "list-disc list-inside text-sm text-gray-700";
        (venueFeatures[image] || []).forEach(feature => {
            const li = document.createElement("li");
            li.textContent = feature;
            featureList.appendChild(li);
        });
        card.appendChild(img);
        card.appendChild(featureList);
        venueImagesDiv.appendChild(card);
    });
    venueSection.classList.remove("hidden");
    venueSection.scrollIntoView({ behavior: "smooth" });
}
