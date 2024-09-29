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
const db = firebase.firestore();

// ProxyCheck.io API key
const publicApiKey = 'public-9x6w48-069817-042v72';

// Function to get user's IP address
async function getUserIP() {
    try {
        const response = await fetch('https://api64.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        alert('Error fetching IP');
        console.error('Error fetching user IP:', error);
        return null;
    }
}

// Function to check VPN/Proxy status using proxycheck.io API
async function checkProxyStatus(ip) {
    const url = `https://proxycheck.io/v2/${ip}?key=${publicApiKey}&vpn=1&asn=1&risk=1`;
    try {
        const response = await fetch(url);
        const data = await response.json();
        const ipData = data[ip];
        return ipData || {};
    } catch (error) {
        alert('Error during VPN check');
        console.error('Error during proxy check:', error);
        return {};
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
    try {
        await db.collection('verify_tokens').doc(token).set({
            token: token,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('Token stored in Firestore');
    } catch (error) {
        alert('Error storing token in Firestore');
        console.error('Firestore storage error:', error);
    }
}

// Main function for verification
async function handleVerification() {
    try {
        // Check for an existing cookie first
        const existingToken = getCookie('verify_cookie');
        if (existingToken) {
            alert(`Token found in cookie: ${existingToken}. No further verification.`);
            return;
        }
        
        // If no cookie, proceed with verification
        alert('No existing cookie, starting verification...');
        
        const ip = await getUserIP();
        if (!ip) {
            alert('Could not fetch user IP. Verification aborted.');
            return;
        }
        
        const result = await checkProxyStatus(ip);
        if (result.proxy === 'yes' || result.vpn === 'yes') {
            alert('VPN detected, redirecting...');
            window.location.href = 'https://auth.evan.ltd';
            return;
        }

        // Generate and set token
        const token = generateRandomToken();
        setCookie('verify_cookie', token, 1);  // Set cookie for 1 day

        // Store token in Firestore
        await storeTokenInFirestore(token);

        alert('Verification successful. Redirecting to evan.ltd...');
        window.location.href = 'https://evan.ltd';

    } catch (error) {
        alert('An error occurred during the verification process.');
        console.error('Verification error:', error);
    }
}

// Trigger verification on page load
window.onload = handleVerification;
