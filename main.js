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

// Function to check VPN/Proxy status using proxycheck.io API with cache-busting
async function checkProxyStatus(ip) {
    const timestamp = new Date().getTime(); // Unique timestamp to prevent caching
    const url = `https://proxycheck.io/v2/${ip}?key=${publicApiKey}&vpn=1&asn=1&risk=1&cache-bust=${timestamp}`;
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

// Function to prevent the page from loading if VPN/Proxy is detected
function blockPage() {
    // You can also redirect to a custom page instead of just blocking
    document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 20%;">Access Denied: Please turn off your VPN/Proxy.</h1>';
}

// Function to handle VPN/Proxy check and block the page if detected
async function handleVPNCheck() {
    try {
        const ip = await getUserIP();

        const result = await checkProxyStatus(ip);

        // Log result to see its structure
        console.log('Result from ProxyCheck:', result);

        // Ensure result contains expected properties
        if (result.proxy === 'yes' || result.vpn === 'yes') {
            // Block the page if a VPN or proxy is detected
            blockPage();
        }
    } catch (error) {
        console.error('Error during VPN check:', error);
    }
}

// Run the VPN check before the page fully loads
window.onload = handleVPNCheck;