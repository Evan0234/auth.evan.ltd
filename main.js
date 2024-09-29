// main.js

// Your API keys
const apiKey = 'k1916f-191133-25902g-1703e0'; // Use this key in server-side calls
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

        const result = await checkProxyStatus(ip);

        // Log result to see its structure
        console.log('Result from ProxyCheck:', result);

        // Ensure result contains expected properties
        if (result.proxy === 'yes' || result.vpn === 'yes') {
            showVPNWarning();
        }
    } catch (error) {
        console.error('Error during VPN check:', error);
    }
}

// Run the VPN check when the page loads
window.onload = handleVPNCheck;
