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
}

const db = firebase.firestore(); // Initialize Firestore

// Function to handle user authentication (anonymous)
async function authenticateUser() {
    try {
        const userCredential = await firebase.auth().signInAnonymously();
        console.log("User authenticated successfully:", userCredential.user.uid);
        return userCredential.user; // Return the authenticated user
    } catch (error) {
        console.error("Error during authentication:", error);
        alert('Authentication failed.');
    }
}

// Function to get the value of a cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
}

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Cookie expiration in days
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
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

// Function to store the generated token in Firestore
async function storeTokenInFirestore(token) {
    try {
        await db.collection('verify_tokens').doc(token).set({
            token: token,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Token stored in Firestore successfully.');
    } catch (error) {
        console.error('Error storing token in Firestore:', error);
        throw error;  // Rethrow for higher-level handling
    }
}

// Function to validate token in Firestore
async function validateToken(token) {
    try {
        const tokenDoc = await db.collection('verify_tokens').doc(token).get();
        if (tokenDoc.exists) {
            console.log(`Token ${token} is valid.`);
            return true;  // Token is valid
        } else {
            console.log(`Token ${token} is invalid.`);
            return false; // Token is invalid
        }
    } catch (error) {
        console.error('Error checking token in Firestore:', error);
        return false; // In case of error, treat as invalid
    }
}

// Main function to handle the token generation and verification process
async function handleTokenGeneration() {
    console.log("Starting token generation and verification process...");

    // Authenticate the user first
    const user = await authenticateUser();
    if (!user) {
        console.error("User authentication failed, aborting.");
        return; // Abort if authentication fails
    }

    const existingToken = getCookie('verify_token');
    console.log(`Checking for existing token: ${existingToken}`);

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
    } else {
        console.log('No existing token found. Generating a new token...');
    }

    const newToken = generateRandomToken();
    setCookie('verify_token', newToken, 1);

    await storeTokenInFirestore(newToken);

    console.log(`New token generated and stored: ${newToken}`);

    // Redirect to evan.ltd after storing the token
    window.location.href = 'https://evan.ltd';  // Redirect to evan.ltd
}

// Trigger the token generation flow when the page loads
window.onload = handleTokenGeneration;
