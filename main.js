// main.js

// Your API keys for proxycheck.io
const publicApiKey = 'public-9x6w48-069817-042v72';

// Firebase configuration
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

// Function to get user's IP address
async function getUserIP() {
    const response = await fetch('https://api64.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}

// Function to check VPN/Proxy status using proxycheck.io API
async function checkProxyStatus(ip) {
    const url = `https://proxycheck.io/v2/${ip}?key=${publicApiKey}&vpn=1&asn=1&risk=1`;
    const response = await fetch(url);
    
    if (!response.ok) {
        console.error('Response error:', response);
        throw new Error('Failed to fetch proxy status');
    }
    
    const data = await response.json();
    const ipData = data[ip];

    if (!ipData) {
        throw new Error(`Invalid response structure or IP not found in response: ${JSON.stringify(data)}`);
    }
    
    return ipData;
}

// Function to generate a random token
function generateRandomToken(length = 50) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to get a cookie
function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Function to store token in Firebase
async function storeTokenInFirebase(token) {
    try {
        await db.collection('verify_tokens').doc(token).set({
            token: token,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("Error storing token in Firebase: ", error);
    }
}

// Function to verify the token
async function verifyToken(token) {
    const doc = await db.collection('verify_tokens').doc(token).get();
    return doc.exists;
}

// Function to handle the authentication and redirection flow
async function handleAuthCheck() {
    try {
        const ip = await getUserIP();
        const result = await checkProxyStatus(ip);

        if (result.proxy === 'yes' || result.vpn === 'yes') {
            // Redirect back to auth if VPN is detected
            window.location.href = '/auth.evan.ltd';
        } else {
            // Check if the user already has a verification cookie
            const verifyCookie = getCookie('verify_cookie');

            if (verifyCookie) {
                const isValid = await verifyToken(verifyCookie);
                if (isValid) {
                    window.location.href = 'https://evan.ltd'; // Valid token, redirect to main site
                } else {
                    // Invalid token, redirect to auth
                    window.location.href = '/auth.evan.ltd';
                }
            } else {
                // No cookie, generate a new token and set it
                const token = generateRandomToken();
                setCookie('verify_cookie', token, 1); // Cookie lasts for 1 day
                await storeTokenInFirebase(token);
                window.location.href = 'https://evan.ltd'; // Redirect to main site
            }
        }
    } catch (error) {
        console.error('Error during auth check:', error);
    }
}

// Run the auth check when the page loads
window.onload = handleAuthCheck;
