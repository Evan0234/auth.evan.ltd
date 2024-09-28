// main.js

// Your API keys
const apiKey = 'k1916f-191133-25902g-1703e0'; 
const publicApiKey = 'public-9x6w48-069817-042v72';

// Function to get user's IP address
async function getUserIP() {
    const response = await fetch('https://api64.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
}

// Function to check VPN/Proxy status
async function checkProxyStatus(ip) {
    const url = `https://proxycheck.io/v2/${ip}?key=${publicApiKey}&vpn=1&asn=1&risk=1`;
    const response = await fetch(url);
    const data = await response.json();
    return data[ip];
}

// Function to handle VPN/Proxy check
async function handleVPNCheck() {
    try {
        const ip = await getUserIP();
        const result = await checkProxyStatus(ip);

        if (result.proxy === 'yes' || result.vpn === 'yes') {
            // Show VPN warning
            document.getElementById('vpn-warning').classList.remove('hidden');
            document.getElementById('content').classList.add('hidden');
        } 
        // else do nothing, allow normal browsing
    } catch (error) {
        console.error('Error during VPN check:', error);
    }
}

// Run the VPN check when the page loads
window.onload = handleVPNCheck;
