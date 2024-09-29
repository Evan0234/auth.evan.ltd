// main.js

// Your API keys
const publicApiKey = 'public-9x6w48-069817-042v72';
const apiKey = 'k1916f-191133-25902g-1703e0'; // Use this key in server-side calls

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

// Function to generate a random string for verify_cookie
function generateRandomToken(length = 50) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Function to set a cookie
function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000)); // Cookie expires in 'days'
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

// Function to handle VPN/Proxy check
async function handleVPNCheck() {
    try {
        const ip = await getUserIP();
        const result = await checkProxyStatus(ip);

        // If VPN or Proxy is detected, block access
        if (result.proxy === 'yes' || result.vpn === 'yes') {
            document.body.innerHTML = '<h1 style="color: red; text-align: center; margin-top: 20%;">Access Denied: Please turn off your VPN/Proxy.</h1>';
        } else {
            // No VPN/Proxy detected, generate and set verify_cookie
            const verifyToken = generateRandomToken();
            setCookie('verify_cookie', verifyToken, 1); // Expires in 1 day

            // Redirect to main website (evan.ltd) after setting the cookie
            window.location.href = 'https://evan.ltd';
        }
    } catch (error) {
        console.error('Error during VPN check:', error);
    }
}

// Run the VPN check when the page loads
window.onload = handleVPNCheck;
