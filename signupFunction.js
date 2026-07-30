// signupFunction.js

// connect to api 
const API_BASE_URL = 'https://academic-internship-project.onrender.com/api';

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    // Get the Form
    const form = document.getElementById('signupForm');
    if (form) {
        form.addEventListener('submit', signupFunction);
        console.log('Form submit handler attached');
    }
    
    // Password validation method
    passwordValidation();
	
	//Password strength check function
	const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strength = getPasswordStrength(this.value);
            updateStrengthMeter(strength);
        });
    }
});

//Password strength meter
function getPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]+/)) strength++;
    if (password.match(/[A-Z]+/)) strength++;
    if (password.match(/[0-9]+/)) strength++;
    if (password.match(/[!@#$%&]+/)) strength++;
    return strength;
}

//Updating the strength meter
function updateStrengthMeter(strength) {
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');
    
    const messages = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#27ae60'];
    const widths = ['20%', '40%', '60%', '80%', '100%'];
    
    if (strength === 0) {
        fill.style.width = '0%';
        fill.style.background = '#e0e0e0';
        text.textContent = '';
        text.style.color = '#666';
        return;
    }
    
    fill.style.width = widths[strength - 1];
    fill.style.background = colors[strength - 1];
    text.textContent = messages[strength - 1];
    text.style.color = colors[strength - 1];
}

// Password validation function
function passwordValidation() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const errorDiv = document.getElementById('errorMessage');
    
    if (password && confirmPassword) {
        confirmPassword.addEventListener('input', function() {
            if (password.value !== confirmPassword.value) {
                errorDiv.textContent = 'Passwords do not match!';
                errorDiv.style.color = 'red';
            } else if (password.value == confirmPassword.value) {
                errorDiv.textContent = 'Passwords match';
                errorDiv.style.color = 'yellow';
            } else {
                errorDiv.textContent = '';
            }
        });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Function to validate email with specific domains
function isValidBusinessEmail(email) {
    const allowedDomains = [
        'gmail.com',
        'hotmail.com',
        'outlook.com',
        'profitpros.com'
    ];
    
    if (!isValidEmail(email)) {
        return false;
    }
    
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
        return false;
    }
    
    const domain = emailParts[1].toLowerCase();
    return allowedDomains.includes(domain);
}

// Main sign up function
async function signupFunction(event) {
    event.preventDefault();
    console.log('Signup function called');
    
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorDiv = document.getElementById('errorMessage');
    
    errorDiv.textContent = '';
    
    if (!isValidBusinessEmail(email)) {
        errorDiv.textContent = 'Please enter a valid email address (Gmail, Hotmail, Outlook, or ProfitPros)';
        errorDiv.style.color = 'red';
        return;
    }
    
    if (password.length < 8) {
        errorDiv.textContent = 'Password must be a minimum of 8 characters long';
        errorDiv.style.color = 'red';
        return;
    }
    
    if (!password.includes('!') && 
        !password.includes('@') && 
        !password.includes('#') && 
        !password.includes('$') && 
        !password.includes('%') && 
        !password.includes('&')) {
        errorDiv.textContent = 'Password must include a symbol (! @ # $ % &)';
        errorDiv.style.color = 'red';
        return;
    }
    
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match!';
        errorDiv.style.color = 'red';
        return;
    }
    
    try {
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering';
        
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: email,
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            errorDiv.style.color = 'yellow';
            errorDiv.textContent = 'Registration successful! Redirecting to login';
            
            setTimeout(function() {
                window.location.href = 'Login.html';
            }, 1500);
        } else {
            errorDiv.textContent = data.error || 'Registration failed. Please try again.';
            errorDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorDiv.textContent = 'Network error. Make sure the backend is running.';
        errorDiv.style.color = 'red';
    } finally {
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
}