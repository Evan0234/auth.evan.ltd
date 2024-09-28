// main.js

// Your API keys
const apiKey = 'k1916f-191133-25902g-1703e0'; // Use this key in the server-side calls
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
    const data = await response.json();
    return data[ip];
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
        const storedIP = localStorage.getItem('lastIP');
        const vpnDetected = localStorage.getItem('vpnDetected');

        // Check if user refreshed the page with the same IP and was previously flagged
        if (storedIP === ip && vpnDetected === 'true') {
            showVPNWarning();
            return; // Skip further checks
        }

        const result = await checkProxyStatus(ip);

        if (result.proxy === 'yes' || result.vpn === 'yes') {
            // Save the IP in localStorage and flag the VPN/Proxy detection
            localStorage.setItem('lastIP', ip);
            localStorage.setItem('vpnDetected', 'true');
            showVPNWarning();
        } else {
            // Clear any previous VPN/Proxy detection if no VPN is detected now
            localStorage.setItem('vpnDetected', 'false');
        }
    } catch (error) {
        console.error('Error during VPN check:', error);
    }
}

// Run the VPN check when the page loads
window.onload = handleVPNCheck;
