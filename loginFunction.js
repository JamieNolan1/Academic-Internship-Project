<<<<<<< HEAD
//api config
const API_BASE_URL = 'http://localhost:3000/api';

//login functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('errorMessage');
    const messageBox = document.getElementById('loginMessage');
    
    if (form) {
        form.addEventListener('submit', function(event) {
            loginFunction(event, errorDiv, messageBox);
        });
    }
});

// Helper function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Main login function
async function loginFunction(event, errorDiv, messageBox) {
    event.preventDefault();
    
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    
    errorDiv.textContent = '';
    messageBox.textContent = '';
    
    if (!email || !password) {
        errorDiv.textContent = 'Please fill in both fields.';
        errorDiv.style.color = 'red';
        return;
    }
    
    if (!isValidEmail(email)) {
        errorDiv.textContent = 'Please enter a valid email address.';
        errorDiv.style.color = 'red';
        return;
    }
    
    try {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in';
        }
        
        console.log('1. Sending login request...');
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: email,
                password: password
            })
        });
        
        console.log('2. Response status:', response.status);
        const data = await response.json();
        console.log('3. Response data:', data);
        
        if (response.ok) {
            console.log('4. Login successful');
            console.log('5. Token received:', data.token);
            
            // Show success message
            messageBox.textContent = `Welcome back, ${data.username || email}!`;
            messageBox.style.color = 'yellow';
            
            // Build the redirect URL
            const redirectUrl = 'loss.php?token=' + data.token;
            console.log('6. Redirecting to:', redirectUrl);
            
            // Redirect immediately
            window.location.href = redirectUrl;
            console.log('7. Redirect executed!');
        } else {
            console.log('8. Login failed:', data.error);
            errorDiv.textContent = data.error || 'Login failed. Please try again.';
            errorDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('9. Login error:', error);
        errorDiv.textContent = 'Network error. Make sure the backend is running.';
        errorDiv.style.color = 'red';
    } finally {
        const submitBtn = document.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Login';
        }
    }
}
=======
    //DELETE THIS LATER - Fake database to test login functionality
    const users = [
        { email: "demo@profitpros.com", password: "Password123" },
        { email: "test@profitpros.com", password: "test123" },
        { email: "user@profitpros.com", password: "pass" },
        { email: "alice@profitpros.com", password: "alice2026" }
    ];

//Code to handle login functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    //Get the Form
    const form = document.getElementById('loginForm');
    const errorDiv = document.getElementById('errorMessage');
    const messageBox = document.getElementById('loginMessage');
    
    if (form) {
        form.addEventListener('submit', function(event) {
            loginFunction(event, errorDiv, messageBox);
        });
    }
});

//Main login function
function loginFunction(event, errorDiv, messageBox) {
    event.preventDefault();
    
    const email = document.getElementById('emailInput').value.trim();
    const password = document.getElementById('passwordInput').value;
    
    //Clear previous messages
    errorDiv.textContent = '';
    messageBox.textContent = '';
    
    if (!email || !password) {
        errorDiv.textContent = 'Please fill in both fields.';
        errorDiv.style.color = 'red';
        return;
    }
	
	//Helper function to validate email
    function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
    
    if (!isValidEmail(email)) {
        errorDiv.textContent = 'Please enter a valid email address.';
        errorDiv.style.color = 'red';
        return;
    }
    
    //Find user in database
    const matchedUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    //User exists
    if (!matchedUser) {
        errorDiv.textContent = 'No account exists with the email entered.';
        errorDiv.style.color = 'red';
        return;
    }
    
    //Password check
    if (matchedUser.password !== password) {
        errorDiv.textContent = 'Incorrect password. Try again.';
        errorDiv.style.color = 'red';
        return;
    }
    
    //In the event of a successful login
    console.log('All validations passed!');
    
    //Show success message
    messageBox.textContent = `Welcome back, ${matchedUser.email}!`;
    messageBox.style.color = 'yellow';
    
    // Redirect after 1.5 seconds
    setTimeout(function() {
        window.location.href = 'index.html';
    }, 1500);
}


>>>>>>> 492785e60e75ccb9e1211a0125911f1eee984570
