// main.js

// Your API keys
const publicApiKey = 'public-9x6w48-069817-042v72';

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
    
    // Ensure the response is successful and in JSON format
    if (!response.ok) {
        console.error('Response error:', response);
        throw new Error('Failed to fetch proxy status');
    }
    
    const data = await response.json();
    
    // Dynamically access the IP object
    const ipData = data[ip];

    if (!ipData) {
        throw new Error(`Invalid response structure or IP not found in response: ${JSON.stringify(data)}`);
    }
    
    return ipData;
}

// Function to redirect to evan.ltd and set verification cookie
async function redirectToMainSite() {
    try {
        // Fetch the user's IP
        const ip = await getUserIP();

        // Check for VPN
        const result = await checkProxyStatus(ip);

        // If no VPN or proxy is detected, redirect to evan.ltd and set the verify_cookie
        if (result.proxy === 'no' && result.vpn === 'no') {
            // Make a request to your server-side logic that generates and sets the verify_cookie
            window.location.href = 'https://auth.evan.ltd/verify'; // Server will handle the cookie setting and redirect
        } else {
            // If VPN is detected, block access
            document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 20%;">Access Denied: Please turn off your VPN/Proxy.</h1>';
        }
    } catch (error) {
        console.error('Error during VPN check:', error);
    }
}

// Run the VPN check when the page loads
window.onload = redirectToMainSite;
