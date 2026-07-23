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


