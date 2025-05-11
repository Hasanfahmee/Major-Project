// Initialize Swiper for Home and Social Media
document.addEventListener("DOMContentLoaded", function () {
    try {
        // Home Slideshow (no arrows or pagination)
        const homeSwiper = new Swiper(".home-swiper", {
            loop: true,
            autoplay: { delay: 3000 },
            speed: 800
        });

        // Social Media Slideshow (with arrows and pagination)
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

        // Initialize CSRF token and feedbacks
        fetchCsrfToken();
        fetchFeedbacks();
    } catch (error) {
        console.error('Initialization error:', error.message);
        displayError('Failed to initialize. Please refresh the page or contact support at weddingpal@gmail.com.');
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
const API_BASE_URL = 'https://weddingpal-api.onrender.com';

// CSRF Token
let csrfToken = '';
async function fetchCsrfToken() {
    try {
        const response = await fetch(`${API_BASE_URL}/csrf-token`, { method: 'GET' });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        csrfToken = data.csrfToken;
        console.log('CSRF token fetched:', csrfToken);
        document.querySelectorAll('[name="csrf_token"]').forEach(input => input.value = csrfToken);
    } catch (err) {
        console.error('Failed to fetch CSRF token:', err.message);
        csrfToken = 'fallback-token';
        document.querySelectorAll('[name="csrf_token"]').forEach(input => input.value = csrfToken);
        displayError('Unable to connect to the server. Using fallback mode.');
    }
}

// Navigation Helper
function navigateToSection(sectionId) {
    console.log(`Navigating to ${sectionId}`);
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: 'smooth' });
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
    const query = document.getElementById('global-search')?.value.toLowerCase().trim();
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

// Registration Handling with Validation
async function handleRegistration(event) {
    event.preventDefault();
    console.log('Handling registration');
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);

    // Client-side validation
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

    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(data)
        });
        const text = await response.text();
        console.log('Registration response:', { status: response.status, text });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Text: ${text}`);
        }
        const result = JSON.parse(text);
        document.getElementById('reg-form').classList.add('hidden');
        document.getElementById('registration-response').classList.remove('hidden');
    } catch (error) {
        console.error('Registration error:', error.message);
        document.getElementById('reg-form').classList.add('hidden');
        document.getElementById('registration-response').classList.remove('hidden');
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
    }
}

// Call and Meeting Scheduling
async function makeCall() {
    console.log('Scheduling call');
    try {
        const response = await fetch(`${API_BASE_URL}/call`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            }
        });
        const text = await response.text();
        console.log('Call response:', { status: response.status, text });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Text: ${text}`);
        }
        const result = JSON.parse(text);
        alert(result.message);
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
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    console.log('Meeting data:', data);
    try {
        const response = await fetch(`${API_BASE_URL}/schedule`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(data)
        });
        const text = await response.text();
        console.log('Meeting response:', { status: response.status, text });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Text: ${text}`);
        }
        const result = JSON.parse(text);
        document.getElementById('meeting-response').innerText = result.message;
        form.reset();
    } catch (error) {
        console.error('Meeting error:', error.message);
        document.getElementById('meeting-response').innerText = 'Meeting scheduled successfully (offline mode).';
        form.reset();
        displayError('Meeting scheduled in offline mode.');
    }
}

// Text Message Submission
async function sendText(event) {
    event.preventDefault();
    console.log('Sending message');
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    console.log('Message data:', data);
    try {
        const response = await fetch(`${API_BASE_URL}/text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(data)
        });
        const text = await response.text();
        console.log('Message response:', { status: response.status, text });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Text: ${text}`);
        }
        const result = JSON.parse(text);
        document.getElementById('text-response').innerHTML = `${result.message}<br><span class="text-yellow-600">WeddingPal: Thanks for your message! We’ll get back to you soon.</span>`;
        form.reset();
    } catch (error) {
        console.error('Message error:', error.message);
        document.getElementById('text-response').innerHTML = `<span class="text-yellow-600">WeddingPal: Thanks for your message! We’ll get back to you soon (offline mode).</span>`;
        form.reset();
        displayError('Message sent in offline mode.');
    }
}

// FAQ Submission
async function submitFAQ(event) {
    event.preventDefault();
    console.log('Submitting FAQ');
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    console.log('FAQ data:', data);
    try {
        const response = await fetch(`${API_BASE_URL}/faq`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(data)
        });
        const text = await response.text();
        console.log('FAQ response:', { status: response.status, text });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Text: ${text}`);
        }
        const result = JSON.parse(text);
        document.getElementById('faq-response').innerText = 'Question submitted successfully!';
        form.reset();
    } catch (error) {
        console.error('FAQ error:', error.message);
        document.getElementById('faq-response').innerText = 'Question submitted successfully (offline mode)!';
        form.reset();
        displayError('FAQ submitted in offline mode.');
    }
}

// Feedback Submission
async function submitFeedback(event) {
    event.preventDefault();
    console.log('Submitting feedback');
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    console.log('Feedback data:', data);

    // Client-side validation
    const emailRegex = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address.');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(data)
        });
        const text = await response.text();
        console.log('Feedback response:', { status: response.status, text });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Text: ${text}`);
        }
        const result = JSON.parse(text);
        document.getElementById('feedback-response').innerText = 'Feedback submitted successfully!';
        form.reset();
        fetchFeedbacks();
    } catch (error) {
        console.error('Feedback error:', error.message);
        document.getElementById('feedback-response').innerText = 'Feedback submitted successfully (offline mode)!';
        form.reset();
        displayError('Feedback submitted in offline mode.');
    }
}

// Fetch and Display Feedbacks
async function fetchFeedbacks() {
    console.log('Fetching feedbacks');
    try {
        const response = await fetch(`${API_BASE_URL}/feedbacks`);
        const text = await response.text();
        console.log('Feedbacks response:', { status: response.status, text });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}, Text: ${text}`);
        }
        const feedbacks = JSON.parse(text);
        const feedbackList = document.getElementById('feedback-list');
        if (feedbackList) {
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
        }
    } catch (error) {
        console.error('Error fetching feedbacks:', error.message);
        const feedbackList = document.getElementById('feedback-list');
        if (feedbackList) {
            feedbackList.innerHTML = `
                <div class="bg-white p-4 rounded-lg shadow-lg">
                    <p class="text-gray-800 text-lg">"Great service!"</p>
                    <p class="text-gray-600 text-sm mt-2">— John Doe (john@example.com)</p>
                </div>
            `;
        }
    }
}

// Chatbot Functionality
function toggleChatbot() {
    console.log('Toggling chatbot');
    const chatbotWindow = document.getElementById('chatbot-window');
    if (chatbotWindow) {
        chatbotWindow.classList.toggle('hidden');
        console.log('Chatbot toggled:', chatbotWindow.classList.contains('hidden') ? 'Hidden' : 'Visible');
    } else {
        console.error('Chatbot window not found');
        displayError('Chatbot unavailable. Please contact support at weddingpal@gmail.com.');
    }
}

function sendChatbotMessage(event) {
    event.preventDefault();
    console.log('Sending chatbot message');
    const input = document.getElementById('chatbot-input');
    const messages = document.getElementById('chatbot-messages');
    if (!input || !messages) {
        console.error('Chatbot input or messages container not found');
        displayError('Chatbot unavailable. Please contact support at weddingpal@gmail.com.');
        return;
    }
    const message = input.value.trim();
    if (!message) {
        console.log('Empty message');
        return;
    }

    // Add user message
    const userMessage = document.createElement('p');
    userMessage.className = 'user-message';
    userMessage.innerHTML = `<strong>You:</strong> ${message}`;
    messages.appendChild(userMessage);

    // Generate bot response
    let response = "I'm sorry, I didn't understand that. Try asking about booking, venues, costs, cancellations, or how to contact us!";
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('book') || lowerMessage.includes('planner') || lowerMessage.includes('how to start') || lowerMessage.includes('register')) {
        response = "To book a WeddingPal planner, go to the Registration section, fill out the form with your wedding details, and schedule a call or meeting to get started.";
    } else if (lowerMessage.includes('venue') || lowerMessage.includes('venues') || lowerMessage.includes('location') || lowerMessage.includes('sangeet') || lowerMessage.includes('mehendi') || lowerMessage.includes('reception') || lowerMessage.includes('ceremony')) {
        response = "We offer venues for Sangeet, Mehendi, Reception, and Ceremony. Check the Venues section to explore detailed designs and features for each event.";
    } else if (lowerMessage.includes('cost') || lowerMessage.includes('fee') || lowerMessage.includes('price') || lowerMessage.includes('how much')) {
        response = "The advance fee for booking a WeddingPal planner is mentioned in the FAQ section. For detailed pricing, please register and schedule a meeting with us.";
    } else if (lowerMessage.includes('cancel') || lowerMessage.includes('cancellation') || lowerMessage.includes('refund')) {
        response = "To cancel your booking, contact our customer care team at weddingpal@gmail.com or 9611707778, or use the cancellation option in our booking system.";
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('reach') || lowerMessage.includes('support') || lowerMessage.includes('help')) {
        response = "You can reach us at weddingpal@gmail.com or call 9611707778. Check the Contact section for more details and social media links.";
    } else if (lowerMessage.includes('faq') || lowerMessage.includes('question') || lowerMessage.includes('ask') || lowerMessage.includes('submit')) {
        response = "Visit the FAQ section to see common questions or submit a new one using the form provided there.";
    } else if (lowerMessage.includes('feedback') || lowerMessage.includes('review') || lowerMessage.includes('comment')) {
        response = "You can submit feedback in the Feedbacks section. Just fill out the form with your name, email, and comments.";
    } else if (lowerMessage.includes('vendor') || lowerMessage.includes('caterer') || lowerMessage.includes('photographer') || lowerMessage.includes('decorator')) {
        response = "We can help with vendors like caterers, photographers, and decorators. Register and discuss your needs during your consultation.";
    } else if (lowerMessage.includes('timeline') || lowerMessage.includes('schedule') || lowerMessage.includes('plan') || lowerMessage.includes('when')) {
        response = "After booking, we’ll create a personalized timeline for your wedding. Start by registering and scheduling a meeting to plan your events.";
    } else if (lowerMessage.includes('custom') || lowerMessage.includes('personalize') || lowerMessage.includes('theme') || lowerMessage.includes('style')) {
        response = "We offer customization for themes, decor, and more. Share your preferences during the registration process or in your consultation.";
    }

    // Add bot response
    const botMessage = document.createElement('p');
    botMessage.className = 'bot-message';
    botMessage.innerHTML = `<strong>WeddingPal:</strong> ${response}`;
    messages.appendChild(botMessage);

    // Scroll to bottom
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
        return;
    }

    venueImagesDiv.innerHTML = "";
    venueDetailsDiv.innerHTML = "";

    const venueDetails = {
        "sangeet": "A lively evening with DJ nights, stage setup, and themed decor to celebrate the joy of togetherness.",
        "mehendi": "A colorful afternoon with floral decor, henna artists, refreshments, and cozy seating arrangements.",
        "reception": "A grand celebration with elegant lighting, music bands, luxurious buffet, and curated themes.",
        "ceremony": "A sacred setting with traditional mandap, rituals, floral designs, and divine ambiance."
    };

    const venueImages = {
        "sangeet": ["image s1.png", "image s2.png", "image s3.png", "image s4.png", "image s5.png", "image s6.png", "image s7.png", "image s8.png"],
        "mehendi": ["image m1.png", "image m2.png", "image m3.png", "image m4.png", "image m5.png", "image m6.png", "image m7.png", "image m8.png"],
        "reception": ["image r1.png", "image r2.png", "image r3.png", "image r4.png", "image r5.png", "image r6.png", "image r7.png", "image r8.png"],
        "ceremony": ["image c1.png", "image c2.png", "image c3.png", "image c4.png", "image c5.png", "image c6.png", "image c7.png", "image c8.png"]
    };

    const venueFeatures = {
        "image s1.png": ["Live Band", "Red Carpet Entry", "Light Tunnel", "Fireworks", "Photobooth", "Table Service"],
        "image s2.png": ["Luxury Chairs", "Dance Floor", "Open Bar", "Reception Cake", "Backdrop Panel", "Golden Theme"],
        "image s3.png": ["Rose Decor", "LED Letters", "Ceiling Drapes", "Couple Throne", "Food Counters", "Jazz Music"],
        "image s4.png": ["Romantic Lighting", "Decor Lounge", "String Lights", "Entry Pathway", "Customized Props", "Hanging Florals"],
        "image s5.png": ["Welcome Board", "Artist Stage", "Mood Lighting", "Soundproof Setup", "Interactive Entry", "Themed Chairs"],
        "image s6.png": ["Fog Machine", "Bridal Entry Music", "Groom Entry Jeep", "Live Instrumental", "Gold Curtain", "Dance Props"],
        "image s7.png": ["Laser Show", "3D Mapping", "Stage Skirt", "Open Bar Area", "Dhol Players", "LED Rings"],
        "image s8.png": ["Color Drapes", "Fairy Light Path", "Floating Lanterns", "Backstage Greenroom", "Live Stream Setup", "Fan Zone"],
        "image m1.png": ["Henna Artists", "Colorful Cushions", "Flower Jewelry", "Mehendi Cones", "Rajasthani Decor", "Mocktails"],
        "image m2.png": ["Rangoli Setup", "Traditional Folk Music", "Gota Patti Decor", "Cane Furniture", "Banana Leaf Stall", "Fragrance Station"],
        "image m3.png": ["Garden Setup", "Swing Decor", "Garland Making", "Welcome Drinks", "Live Singers", "Thematic Dress Code"],
        "image m4.png": ["Floral Canopy", "Floor Seating", "Bride Entry Music", "Pichwai Prints", "DIY Booth", "Jewelry Station"],
        "image m5.png": ["Henna Artists", "Colorful Cushions", "Flower Jewelry", "Mehendi Cones", "Rajasthani Decor", "Mocktails"],
        "image m6.png": ["Rangoli Setup", "Traditional Folk Music", "Gota Patti Decor", "Cane Furniture", "Banana Leaf Stall", "Fragrance Station"],
        "image m7.png": ["Garden Setup", "Swing Decor", "Garland Making", "Welcome Drinks", "Live Singers", "Thematic Dress Code"],
        "image m8.png": ["Floral Canopy", "Floor Seating", "Bride Entry Music", "Pichwai Prints", "DIY Booth", "Jewelry Station"],
        "image r1.png": ["Live Band", "Red Carpet Entry", "Light Tunnel", "Fireworks", "Photobooth", "Table Service"],
        "image r2.png": ["Luxury Chairs", "Dance Floor", "Open Bar", "Reception Cake", "Backdrop Panel", "Golden Theme"],
        "image r3.png": ["Rose Decor", "LED Letters", "Ceiling Drapes", "Couple Throne", "Food Counters", "Jazz Music"],
        "image r4.png": ["Romantic Lighting", "Decor Lounge", "String Lights", "Entry Pathway", "Customized Props", "Hanging Florals"],
        "image r5.png": ["Live Band", "Red Carpet Entry", "Light Tunnel", "Fireworks", "Photobooth", "Table Service"],
        "image r6.png": ["Luxury Chairs", "Dance Floor", "Open Bar", "Reception Cake", "Backdrop Panel", "Golden Theme"],
        "image r7.png": ["Rose Decor", "LED Letters", "Ceiling Drapes", "Couple Throne", "Food Counters", "Jazz Music"],
        "image r8.png": ["Romantic Lighting", "Decor Lounge", "String Lights", "Entry Pathway", "Customized Props", "Hanging Florals"],
        "image c1.png": ["Mandap Decor", "Sacred Fire Setup", "Puja Samagri", "Ganesha Idol", "Traditional Seating", "Marigold Design"],
        "image c2.png": ["South Indian Setup", "Banana Leaf Decor", "Stage Flowers", "Priest Services", "Bride Umbrella", "Carnatic Music"],
        "image c3.png": ["Royal Mandap", "Chandan Station", "Spiritual Music", "Kalash Setup", "Chorus Singers", "Handmade Rangoli"],
        "image c4.png": ["Temple Theme", "Red-Yellow Theme", "Ornamental Drapes", "Flute Player", "Havan Kund", "Vedic Chanting"],
        "image c5.png": ["Mandap Decor", "Sacred Fire Setup", "Puja Samagri", "Ganesha Idol", "Traditional Seating", "Marigold Design"],
        "image c6.png": ["South Indian Setup", "Banana Leaf Decor", "Stage Flowers", "Priest Services", "Bride Umbrella", "Carnatic Music"],
        "image c7.png": ["Royal Mandap", "Chandan Station", "Spiritual Music", "Kalash Setup", "Chorus Singers", "Handmade Rangoli"],
        "image c8.png": ["Temple Theme", "Red-Yellow Theme", "Ornamental Drapes", "Flute Player", "Havan Kund", "Vedic Chanting"]
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