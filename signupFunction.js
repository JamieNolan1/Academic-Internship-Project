<<<<<<< HEAD
// signupFunction.js

// connect to api (localhost for now)
const API_BASE_URL = 'http://localhost:3000/api';

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
});

// Password validation function
function passwordValidation() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const errorDiv = document.getElementById('errorMessage');
    
    // Check to see if the two entered passwords match
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
    // List of allowed domains
    const allowedDomains = [
        'gmail.com',
        'hotmail.com',
        'outlook.com',
        'profitpros.com'
    ];
    
    // First check if it's a valid email format
    if (!isValidEmail(email)) {
        return false;
    }
    
    // Extract domain from email
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
        return false;
    }
    
    const domain = emailParts[1].toLowerCase();
    
    // Check if domain is in the allowed list
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
    
    // Validate email
    if (!isValidBusinessEmail(email)) {
        errorDiv.textContent = 'Please enter a valid email address (Gmail, Hotmail, Outlook, or ProfitPros)';
        errorDiv.style.color = 'red';
        return;
    }
    
    // Password length validation
    if (password.length < 8) {
        errorDiv.textContent = 'Password must be a minimum of 8 characters long';
        errorDiv.style.color = 'red';
        return;
    }
    
    // Check if password includes at least one symbol
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
    
    // Check if passwords match
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match!';
        errorDiv.style.color = 'red';
        return;
    }
    
	
	//call api
    try {
        // Show loading state
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registering';
        
        // Call the API
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: email,  // Using email as username
                email: email,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Registration successful
            errorDiv.style.color = 'yellow';
            errorDiv.textContent = 'Registration successful! Redirecting to login';
            
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 1500);
        } else {
            // Show error from API
            errorDiv.textContent = data.error || 'Registration failed. Please try again.';
            errorDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorDiv.textContent = 'Network error. Make sure the backend is running.';
        errorDiv.style.color = 'red';
    } finally {
        // Re-enable button
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
    }
}
=======
//Functionality to handle signUp
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded');
    
    //Get the Form
    const form = document.getElementById('signupForm');
    if (form) {
        form.addEventListener('submit', signupFunction);
        console.log('Form submit handler attached');
    
    //Password validation method
    passwordValidation();
});

//Password validation function
function passwordValidation() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    const errorDiv = document.getElementById('errorMessage');
	
    //Check to see if the two entered passwords match
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

//Function to validate email with specific domains
function isValidBusinessEmail(email) {
    //List of allowed domains
    const allowedDomains = [
        'gmail.com',
        'hotmail.com',
        'outlook.com',
        'profitpros.com'
    ];
    
    //First check if it's a valid email format
    if (!isValidEmail(email)) {
        return false;
    }
    
    //Extract domain from email
    const emailParts = email.split('@');
    if (emailParts.length !== 2) {
        return false;
    }
    
    const domain = emailParts[1].toLowerCase();
    
    //Check if domain is in the allowed list
    return allowedDomains.includes(domain);
}

// Main sign up function
function signupFunction(event) {
    event.preventDefault();
    console.log('Signup function called'); // Debug
    
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
    
    // Password length validation
    if (password.length < 8) {
        errorDiv.textContent = 'Password must be a minimum of 8 characters long';
        errorDiv.style.color = 'red';
        return;
    }
    
    // Check if password includes at least one symbol
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
  
    
    // All validations passed
    console.log('All validations passed!'); // Debug
    
    // Save user data
    const userData = {
        email: email,
        password: password,
        registeredAt: new Date().toISOString()
    };
    
    localStorage.setItem('user_' + email, JSON.stringify(userData));
    
    errorDiv.style.color = 'yellow';
    errorDiv.textContent = 'Registration successful! Redirecting...';
    
    setTimeout(function() {
        window.location.href = 'login.html';
    }, 1500);
}

//CONCEPT NOT FINISHED - Password strength meter
//function getPasswordStrength(password) {
    //let strength = 0;
    //if (password.length >= 8) strength++;
    //if (password.match(/[a-z]+/)) strength++;
    //if (password.match(/[A-Z]+/)) strength++;
    //if (password.match(/[0-9]+/)) strength++;
    //if (password.match(/[!@#$%&]+/)) strength++;
    //return strength;
//}
>>>>>>> 492785e60e75ccb9e1211a0125911f1eee984570
