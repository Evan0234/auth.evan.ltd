// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyDOQKCzqkdDMlLdIpoUyd9Nnd-Z21vuZho",
    authDomain: "evanltd1.firebaseapp.com",
    projectId: "evanltd1",
    storageBucket: "evanltd1.appspot.com",
    messagingSenderId: "700870615513",
    appId: "1:700870615513:web:16d8e42ad88c1b89d7b9c8",
    measurementId: "G-P5NMF5Z2N3"
};

// Initialize Firebase
try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully.");
} catch (error) {
    console.error("Firebase initialization failed:", error);
    alert('Firebase initialization failed.');
}

// Function to generate a random token (50 characters)
function generateRandomToken(length = 50) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax;Secure`;
    console.log(`Cookie set: ${name}=${value}`);
}

// Function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Function to store the token in Firestore
async function storeTokenInFirestore(token) {
    const db = firebase.firestore();
    try {
        await db.collection('verify_tokens').doc(token).set({
            token: token,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Token stored in Firestore');
    } catch (error) {
        console.error('Error storing token in Firestore:', error);
        alert('Error storing token in Firestore');
    }
}

// Function to validate the token in Firestore
async function validateToken(token) {
    const db = firebase.firestore();
    try {
        const doc = await db.collection('verify_tokens').doc(token).get();
        return doc.exists;  // Returns true if the token exists in Firestore
    } catch (error) {
        console.error("Error checking token in Firestore:", error);
        return false;  // Return false if there's an error
    }
}

// Main function for token generation and verification
async function handleTokenGeneration() {
    const existingToken = getCookie('verify_cookie');

    // If the cookie already exists, verify it
    if (existingToken) {
        console.log(`Existing token found: ${existingToken}`);
        
        // Validate the existing token
        const isValid = await validateToken(existingToken);
        if (isValid) {
            console.log('Existing token is valid. Redirecting to evan.ltd...');
            window.location.href = 'https://evan.ltd';  // Redirect to evan.ltd
            return;  // Exit the function
        } else {
            console.log('Existing token is invalid. Generating a new token...');
        }
    }

    // If no valid token exists, generate a new one
    const newToken = generateRandomToken();
    setCookie('verify_cookie', newToken, 1); // Set cookie for 1 day

    // Store the new token in Firestore
    await storeTokenInFirestore(newToken);

    console.log(`New token generated and stored: ${newToken}`);
    window.location.href = 'https://evan.ltd';  // Redirect to evan.ltd
}

// Trigger token generation and validation on page load
window.onload = handleTokenGeneration;
