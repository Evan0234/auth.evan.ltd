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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore(); // Initialize Firestore

// ProxyCheck.io API key
const publicApiKey = 'public-9x6w48-069817-042v72';

// Function to get user's IP address
async function getUserIP() {
    try {
        const response = await fetch('https://api64.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error('Error fetching user IP:', error);
        throw error;  // Rethrow for higher-level handling
    }
}

// Function to check VPN/Proxy status using proxycheck.io API
async function checkProxyStatus(ip) {
    const url = `https://proxycheck.io/v2/${ip}?key=${publicApiKey}&vpn=1&asn=1&risk=1`;
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            console.error('Error response:', response);
            throw new Error('Failed to fetch proxy status');
        }
        
        const data = await response.json();
        const ipData = data[ip];

        if (!ipData) {
            throw new Error(`Invalid response structure or IP not found: ${JSON.stringify(data)}`);
        }
        
        return ipData;
    } catch (error) {
        console.error('Error during proxy check:', error);
        throw error;  // Rethrow for higher-level handling
    }
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

// Function to set a cookie with security options
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Cookie expiration in days
    const expires = "expires=" + date.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/;Secure;SameSite=Lax`; // Ensure secure and SameSite attributes
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
    }
}

// Main function to handle the VPN check and verification flow
async function handleVerification() {
    try {
        // Step 1: Get the user's IP
        const ip = await getUserIP();
        console.log(`User IP: ${ip}`);

        // Step 2: Check for VPN or proxy
        const result = await checkProxyStatus(ip);
        console.log('VPN check result:', result);

        // Step 3: If VPN/proxy is detected, redirect back to auth.evan.ltd
        if (result.proxy === 'yes' || result.vpn === 'yes') {
            console.log('VPN detected, redirecting to auth.evan.ltd');
            window.location.href = 'https://auth.evan.ltd';  // Ensure this redirects correctly
            return;
        }

        // Step 4: Generate a 50-character random token
        const token = generateRandomToken();
        console.log(`Generated token: ${token}`);

        // Step 5: Set a cookie with the generated token (expires in 1 day)
        setCookie('verify_cookie', token, 1);
        console.log(`Cookie set: verify_cookie=${token}`);

        // Step 6: Store the token in Firestore
        await storeTokenInFirestore(token);  // Awaiting this to make sure storage completes

        // Step 7: Redirect to the main site (evan.ltd)
        console.log('Redirecting to evan.ltd');
        window.location.href = 'https://evan.ltd';

    } catch (error) {
        console.error('Error during verification process:', error);
    }
}

// Trigger the verification flow when the page loads
window.onload = handleVerification;
