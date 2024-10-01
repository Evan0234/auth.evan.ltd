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
console.log("Initializing Firebase...");
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Initialize Firestore
console.log("Firebase initialized successfully.");

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Cookie expiration in days
    const expires = "expires=" + date.toUTCString();
    const domain = "domain=.evan.ltd"; // Set cookie for all subdomains
    document.cookie = `${name}=${value};${expires};${domain};path=/`;
    console.log(`Cookie set: ${name}=${value}; Expires in ${days} days`);
}

// Function to get the value of a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    console.log(`No cookie found with name: ${name}`);
    return null;
}

// Function to generate a random token (50 characters)
function generateRandomToken(length = 50) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    console.log(`Generated random token: ${result}`);
    return result;
}

// Function to store the generated token in Firestore
async function storeTokenInFirestore(token) {
    console.log(`Attempting to store token in Firestore: ${token}`);
    try {
        await db.collection('verify_tokens').doc(token).set({
            token: token,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Token stored in Firestore successfully.');
    } catch (error) {
        console.error('Error storing token in Firestore:', error);
    }
}

// Function to check if a token exists in Firestore
async function validateToken(token) {
    console.log(`Validating token in Firestore: ${token}`);
    try {
        const doc = await db.collection('verify_tokens').doc(token).get();
        if (doc.exists) {
            console.log('Token is valid in Firestore.');
            return true;
        } else {
            console.log('Token not found in Firestore.');
            return false;
        }
    } catch (error) {
        console.error('Error checking token in Firestore:', error);
        return false;
    }
}

// Main function to handle token generation and verification
async function handleTokenGeneration() {
    console.log("Starting token generation and verification process...");

    // Check for existing token
    const existingToken = getCookie('verify_token');
    console.log(`Checking for existing token: ${existingToken}`);

    if (existingToken) {
        console.log(`Existing token found: ${existingToken}`);

        // Validate the existing token
        const isValid = await validateToken(existingToken);
        if (isValid) {
            console.log('Existing token is valid. Redirecting to evan.ltd...');
            // Keep the existing token in Firestore
            await storeTokenInFirestore(existingToken);
            window.location.href = 'https://evan.ltd';  // Redirect to evan.ltd
            return;  // Exit the function
        } else {
            console.log('Existing token is invalid. Generating a new token...');
        }
    } else {
        console.log('No existing token found. Generating a new token...');
    }

    // Generate new token
    const newToken = generateRandomToken();
    console.log(`Generated new token: ${newToken}`);

    // Set the cookie for the token
    setCookie('verify_token', newToken, 1);

    // Store the new token in Firestore
    await storeTokenInFirestore(newToken);

    console.log(`New token generated and stored: ${newToken}`);

    // Redirect to evan.ltd after storing the token
    window.location.href = 'https://evan.ltd';  // Redirect to evan.ltd
}

// Trigger the token generation process when the page loads
window.onload = () => {
    console.log("Window loaded. Starting token generation process...");
    handleTokenGeneration(); // Proceed with token generation
};
