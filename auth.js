// auth.js
// gets username to display on pages and allows users to logout of their account

// Get user info from loss.php
async function getUserInfo() {
    try {
        const response = await fetch('loss.php?get_user=1');
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching user info:', error);
        return { logged_in: false, username: null };
    }
}

// Update the user info display on the page
async function updateUserDisplay() {
    const userInfo = document.getElementById('userInfo');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    if (!userInfo || !usernameDisplay) return;
    
    const user = await getUserInfo();
    
    if (user.logged_in && user.username) {
        userInfo.style.display = 'block';
        usernameDisplay.textContent = ' ' + user.username;
    } else {
        userInfo.style.display = 'none';
    }
}

// Logout function
function logout() {
    window.location.href = 'loss.php?logout=1';
}

// Auto-run when page loads
document.addEventListener('DOMContentLoaded', function() {
    updateUserDisplay();
});