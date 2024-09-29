// main.js

// Your API keys
const apiKey = 'k1916f-191133-25902g-1703e0'; // Use this key in server-side calls
const publicApiKey = 'public-9x6w48-069817-042v72';

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
    
    // Log the entire response to debug
    console.log('ProxyCheck API response:', data);
    
    // Dynamically access the IP object
    const ipData = data[ip];

    if (!ipData) {
        throw new Error(`Invalid response structure or IP not found in response: ${JSON.stringify(data)}`);
    }
    
    return ipData;
}

// Function to show VPN/Proxy warning
function showVPNWarning() {
    document.getElementById('vpn-warning').classList.remove('hidden');
    document.getElementById('content').classList.add('hidden');
}

// Function to handle VPN/Proxy check
async function handleVPNCheck() {
    try {
        const ip = await getUserIP();
        const storedIP = getCookie('lastIP');
        const vpnDetected = getCookie('vpnDetected');

        // Check if user refreshed the page with the same IP and was previously flagged
        if (storedIP === ip && vpnDetected === 'true') {
            showVPNWarning();
            return; // Skip further checks
        }

        const result = await checkProxyStatus(ip);

        // Log result to see its structure
        console.log('Result from ProxyCheck:', result);

        // Ensure result contains expected properties
        if (result.proxy === 'yes' || result.vpn === 'yes') {
            // Save the IP in a cookie and flag the VPN/Proxy detection
            setCookie('lastIP', ip, 1); // Cookie lasts for 1 day
            setCookie('vpnDetected', 'true', 1); // Cookie lasts for 1 day
            showVPNWarning();
        } else {
            // Clear any previous VPN/Proxy detection if no VPN is detected now
            setCookie('vpnDetected', 'false', 1); // Cookie lasts for 1 day
        }
    } catch (error) {
        console.error('Error during VPN check:', error);
    }
}

// Run the VPN check when the page loads
window.onload = handleVPNCheck;
