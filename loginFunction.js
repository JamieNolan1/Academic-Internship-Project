//api config
const API_BASE_URL = 'https://academic-internship-project.onrender.com/api';

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
        
        console.log('1. Sending login request');
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
            
            //save session, and redirectf succesful
            try {
                console.log('6. Saving username to session');
                const sessionResponse = await fetch('loss.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        set_session: true,
                        username: data.username || email,
                        userId: data.userId
                    })
                });
                const sessionResult = await sessionResponse.json();
                console.log('7. Session saved:', sessionResult);
                
                //  Only redirect after session is saved
                if (sessionResult.success) {
                    console.log('8. Session save confirmed, redirecting');
                    messageBox.textContent = `Welcome back, ${data.username || email}`;
                    messageBox.style.color = 'yellow';
                    window.location.href = 'loss.php?token=' + data.token;
                } else {
                    console.error('Session save failed');
                    errorDiv.textContent = 'Login succeeded but session save failed. Please try again.';
                    errorDiv.style.color = 'red';
                    // Still redirect anyway
                    window.location.href = 'loss.php?token=' + data.token;
                }
            } catch (sessionError) {
                console.error('Error saving session:', sessionError);
                // Still redirect but show error in console
                messageBox.textContent = `Welcome back, ${data.username || email}!`;
                messageBox.style.color = 'yellow';
                window.location.href = 'loss.php?token=' + data.token;
            }
        } else {
            console.log('10. Login failed:', data.error);
            errorDiv.textContent = data.error || 'Login failed. Please try again.';
            errorDiv.style.color = 'red';
        }
    } catch (error) {
        console.error('11. Login error:', error);
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