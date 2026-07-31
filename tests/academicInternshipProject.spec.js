// tests/academicInternshipProject.spec.js
import { test, expect } from '@playwright/test';

const BASE_URL = 'https://academic-internship-project-php.onrender.com';

test.describe('/Academic Internship Application Tests', () => {

  //navigation testing

  // Test 1: Homepage loads
  test('homepage should load', async ({ page }) => {
    await page.goto(`${BASE_URL}/index.html`);
    await expect(page).toHaveTitle(/academic internship project/i);
  });

  // Test 2: Login page loads
  test('login page should load', async ({ page }) => {
    await page.goto(`${BASE_URL}/Login.html`);
    await expect(page.locator('h2')).toHaveText('Login');
  });

  // Test 3: Sign up page loads
  test('sign up page should load', async ({ page }) => {
    await page.goto(`${BASE_URL}/signUp.html`);
    await expect(page.locator('h2')).toHaveText('Sign Up');
  });

  // Test 4: Calculator redirects to login if not logged in
  test('calculator should redirect to login if not logged in', async ({ page }) => {
    await page.goto(`${BASE_URL}/loss.php`);
    await expect(page).toHaveURL(/Login.html/);
  });

  //signup and login pages testing

  // Test 5: User can sign up
  test('user can sign up', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@gmail.com`;
    
    await page.goto(`${BASE_URL}/signUp.html`);
    
    await page.fill('#email', email);
    await page.fill('#password', 'TestPassword123!');
    await page.fill('#confirmPassword', 'TestPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Should redirect to login
    await expect(page).toHaveURL(/Login.html/);
  });

  // Test 6: User can log in
  test('user can log in', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@gmail.com`;
    
    // First, sign up
    await page.goto(`${BASE_URL}/signUp.html`);
    await page.fill('#email', email);
    await page.fill('#password', 'TestPassword123!');
    await page.fill('#confirmPassword', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/Login.html/);
    
    // Then, log in
    await page.fill('#emailInput', email);
    await page.fill('#passwordInput', 'TestPassword123!');
    await page.click('#loginBtn');
    
    // Should redirect to calculator
    await expect(page).toHaveURL(/loss.php/);
  });

  //loss.php/calculator testing

  // Test 7: User can add a product
  test('user can add a product', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@gmail.com`;
    const productName = `Test Product ${timestamp}`;
    
    // Sign up and login
    await page.goto(`${BASE_URL}/signUp.html`);
    await page.fill('#email', email);
    await page.fill('#password', 'TestPassword123!');
    await page.fill('#confirmPassword', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/Login.html/);
    
    await page.fill('#emailInput', email);
    await page.fill('#passwordInput', 'TestPassword123!');
    await page.click('#loginBtn');
    await page.waitForURL(/loss.php/);
    
    // Add product
    await page.fill('#product_name', productName);
    await page.fill('#cost_per_unit', '50');
    await page.fill('#price', '100');
    await page.fill('#sold', '30');
    await page.fill('#theft', '5');
    await page.fill('#stock', '10');
    
    await page.click('button[type="submit"]');
    
    // Verify result
    await expect(page.locator('.result-box')).toContainText('Data saved to database');
  });

  // Test 8: User can delete a product
  test('user can delete a product', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@gmail.com`;
    const productName = `Delete Test ${timestamp}`;
    
    // Sign up and login
    await page.goto(`${BASE_URL}/signUp.html`);
    await page.fill('#email', email);
    await page.fill('#password', 'TestPassword123!');
    await page.fill('#confirmPassword', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/Login.html/);
    
    await page.fill('#emailInput', email);
    await page.fill('#passwordInput', 'TestPassword123!');
    await page.click('#loginBtn');
    await page.waitForURL(/loss.php/);
    
    // Add product
    await page.fill('#product_name', productName);
    await page.fill('#cost_per_unit', '50');
    await page.fill('#price', '100');
    await page.fill('#sold', '30');
    await page.fill('#theft', '5');
    await page.fill('#stock', '10');
    await page.click('button[type="submit"]');
    
    // Wait for product to appear in table
    await page.waitForSelector(`tr:has-text("${productName}")`);
    
    // Delete product
    page.on('dialog', dialog => dialog.accept());
    const deleteButton = page.locator(`tr:has-text("${productName}") .delete-btn`);
    await deleteButton.click();
    
    // Verify product is gone
    await expect(page.locator(`tr:has-text("${productName}")`)).not.toBeVisible();
  });

  // validation tests for Calculator and login,signup pages

  // Test 9: Calculator won't accept empty fields
  test('calculator should not accept empty fields', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@gmail.com`;
    
    // Sign up and login
    await page.goto(`${BASE_URL}/signUp.html`);
    await page.fill('#email', email);
    await page.fill('#password', 'TestPassword123!');
    await page.fill('#confirmPassword', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/Login.html/);
    
    await page.fill('#emailInput', email);
    await page.fill('#passwordInput', 'TestPassword123!');
    await page.click('#loginBtn');
    await page.waitForURL(/loss.php/);
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Check for validation alert or error message
    const pageContent = await page.textContent('body');
    await expect(page).toHaveURL(/loss.php/);
  });

// Test 10: Calculator should reject invalid inventory
test('calculator should reject invalid inventory', async ({ page }) => {
  const timestamp = Date.now();
  const email = `testuser${timestamp}@gmail.com`;
  
  // Sign up and login
  await page.goto(`${BASE_URL}/signUp.html`);
  await page.fill('#email', email);
  await page.fill('#password', 'TestPassword123!');
  await page.fill('#confirmPassword', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/Login.html/);
  
  await page.fill('#emailInput', email);
  await page.fill('#passwordInput', 'TestPassword123!');
  await page.click('#loginBtn');
  await page.waitForURL(/loss.php/);
  
  // Test with negative sold
  await page.fill('#product_name', 'Invalid Inventory Test');
  await page.fill('#cost_per_unit', '50');
  await page.fill('#price', '100');
  await page.fill('#sold', '-5');
  await page.fill('#theft', '0');
  await page.fill('#stock', '10');
  
  await page.click('button[type="submit"]');
  
  // Check error message appears
  await expect(page.locator('div[style*="background:#ffebee"]')).toBeVisible();
  await expect(page.locator('div[style*="background:#ffebee"]')).toContainText('Invalid inventory');
  
  // Check data not saved
  await expect(page.locator('.result-box')).toContainText('Data not saved');
});

// Test 11: Calculator should reject negative numbers
test('calculator should reject negative numbers', async ({ page }) => {
  const timestamp = Date.now();
  const email = `testuser${timestamp}@gmail.com`;
  
  // Sign up and login
  await page.goto(`${BASE_URL}/signUp.html`);
  await page.fill('#email', email);
  await page.fill('#password', 'TestPassword123!');
  await page.fill('#confirmPassword', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/Login.html/);
  
  await page.fill('#emailInput', email);
  await page.fill('#passwordInput', 'TestPassword123!');
  await page.click('#loginBtn');
  await page.waitForURL(/loss.php/);
  
  // Enter negative value for sold
  await page.fill('#product_name', 'Negative Test');
  await page.fill('#cost_per_unit', '50');
  await page.fill('#price', '100');
  await page.fill('#sold', '-5');
  await page.fill('#theft', '0');
  await page.fill('#stock', '10');
  
  await page.click('button[type="submit"]');
  
  // Check error message appears
  await expect(page.locator('div[style*="background:#ffebee"]')).toBeVisible();
  await expect(page.locator('div[style*="background:#ffebee"]')).toContainText('Invalid inventory');
  
  // Check data not saved
  await expect(page.locator('.result-box')).toContainText('Data not saved');
});

  // Test 12: Signup fails with invalid email
  test('signup should fail with invalid email domain', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@invalid-domain.com`;
    
    await page.goto(`${BASE_URL}/signUp.html`);
    
    await page.fill('#email', email);
    await page.fill('#password', 'TestPassword123!');
    await page.fill('#confirmPassword', 'TestPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Should show error message (not redirect)
    await expect(page.locator('#errorMessage')).toBeVisible();
    await expect(page.locator('#errorMessage')).toContainText('valid email address');
  });

  // Test 13: Signup fails with short password
  test('signup should fail with short password', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@gmail.com`;
    
    await page.goto(`${BASE_URL}/signUp.html`);
    
    await page.fill('#email', email);
    await page.fill('#password', 'Short1!');
    await page.fill('#confirmPassword', 'Short1!');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('#errorMessage')).toBeVisible();
    await expect(page.locator('#errorMessage')).toContainText('minimum of 8 characters');
  });

  // Test 14: Signup fails with mismatched passwords
  test('signup should fail with mismatched passwords', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@gmail.com`;
    
    await page.goto(`${BASE_URL}/signUp.html`);
    
    await page.fill('#email', email);
    await page.fill('#password', 'TestPassword123!');
    await page.fill('#confirmPassword', 'Different123!');
    
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('#errorMessage')).toBeVisible();
    await expect(page.locator('#errorMessage')).toContainText('Passwords do not match');
  });

  // Test 15: Login fails with incorrect password
  test('login should fail with incorrect password', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@gmail.com`;
    
    // First, sign up
    await page.goto(`${BASE_URL}/signUp.html`);
    await page.fill('#email', email);
    await page.fill('#password', 'TestPassword123!');
    await page.fill('#confirmPassword', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/Login.html/);
    
    // Try to log in with wrong password
    await page.fill('#emailInput', email);
    await page.fill('#passwordInput', 'WrongPassword123!');
    await page.click('#loginBtn');
    
    // Should show error message
    await expect(page.locator('#errorMessage')).toBeVisible();
    await expect(page.locator('#errorMessage')).toContainText('Invalid username or password');
  });

  // Test 16: Login fails with non-existent email
  test('login should fail with non-existent email', async ({ page }) => {
    await page.goto(`${BASE_URL}/Login.html`);
    
    await page.fill('#emailInput', 'nonexistent@example.com');
    await page.fill('#passwordInput', 'TestPassword123!');
    await page.click('#loginBtn');
    
    // Should show error message
    await expect(page.locator('#errorMessage')).toBeVisible();
    await expect(page.locator('#errorMessage')).toContainText('Invalid username or password');
  });
  
  // Test 17: Signup fails with duplicate email
test('signup should fail with duplicate email', async ({ page }) => {
  const timestamp = Date.now();
  const email = `testuser${timestamp}@gmail.com`;
  
  // First, sign up with a new email
  await page.goto(`${BASE_URL}/signUp.html`);
  await page.fill('#email', email);
  await page.fill('#password', 'TestPassword123!');
  await page.fill('#confirmPassword', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/Login.html/);
  
  // Go back to signup and try to use the same email
  await page.goto(`${BASE_URL}/signUp.html`);
  await page.fill('#email', email);
  await page.fill('#password', 'AnotherPass123!');
  await page.fill('#confirmPassword', 'AnotherPass123!');
  await page.click('button[type="submit"]');
  
  // Should show error message (not redirect)
  await expect(page.locator('#errorMessage')).toBeVisible();
  await expect(page.locator('#errorMessage')).toContainText('Username or email already exists');
});

  // Test 18: Entries table updates after adding product
  test('entries table should show new product after adding', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@gmail.com`;
    const productName = `Table Test ${timestamp}`;
    
    // Sign up and login
    await page.goto(`${BASE_URL}/signUp.html`);
    await page.fill('#email', email);
    await page.fill('#password', 'TestPassword123!');
    await page.fill('#confirmPassword', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/Login.html/);
    
    await page.fill('#emailInput', email);
    await page.fill('#passwordInput', 'TestPassword123!');
    await page.click('#loginBtn');
    await page.waitForURL(/loss.php/);
    
    // Add product
    await page.fill('#product_name', productName);
    await page.fill('#cost_per_unit', '50');
    await page.fill('#price', '100');
    await page.fill('#sold', '30');
    await page.fill('#theft', '5');
    await page.fill('#stock', '10');
    await page.click('button[type="submit"]');
    
    // Check that product appears in table
    await expect(page.locator(`tr:has-text("${productName}")`)).toBeVisible();
  });

  // Test 19: Summary stats update after adding product
test('summary stats should update after adding product', async ({ page }) => {
  const timestamp = Date.now();
  const email = `testuser${timestamp}@gmail.com`;
  const productName = `Stats Test ${timestamp}`;
  
  // Sign up and login
  await page.goto(`${BASE_URL}/signUp.html`);
  await page.fill('#email', email);
  await page.fill('#password', 'TestPassword123!');
  await page.fill('#confirmPassword', 'TestPassword123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/Login.html/);
  
  await page.fill('#emailInput', email);
  await page.fill('#passwordInput', 'TestPassword123!');
  await page.click('#loginBtn');
  await page.waitForURL(/loss.php/);
  
  // Check that the entries section exists
  await expect(page.locator('.entries-section')).toBeVisible();
  
  // Check if there are any existing entries
  const hasEntries = await page.locator('.entries-section table tbody tr').count() > 0;
  
  if (hasEntries) {
    // If there are entries, we can check that the summary exists
    await expect(page.locator('.entries-summary')).toBeVisible();
  } else {
    // If no entries, the summary might not exist yet
    // Add a product first
    await page.fill('#product_name', productName);
    await page.fill('#cost_per_unit', '50');
    await page.fill('#price', '100');
    await page.fill('#sold', '30');
    await page.fill('#theft', '5');
    await page.fill('#stock', '10');
    await page.click('button[type="submit"]');
    
    // Now the summary should exist
    await expect(page.locator('.entries-summary')).toBeVisible();
    await expect(page.locator('.entries-summary')).toContainText('Total Products: 1');
  }
});

// Test 20: Password strength meter updates as user types
test('password strength meter should update as user types', async ({ page }) => {
  await page.goto(`${BASE_URL}/signUp.html`);
  
  const passwordInput = page.locator('#password');
  const strengthFill = page.locator('#strengthFill');
  const strengthText = page.locator('#strengthText');
  
  // Check initial state
  await expect(strengthFill).toHaveAttribute('style', /width: 0%;/);
  
  // Type a weak password (length + lowercase = 2/5)
  await passwordInput.fill('weakpassword');
  await page.waitForTimeout(200);
  await expect(strengthFill).toHaveAttribute('style', /width: 40%;/);
  await expect(strengthText).toHaveText('Weak');
  
  // Type a medium password (length + lowercase + uppercase + number = 4/5)
  await passwordInput.fill('Password123');
  await page.waitForTimeout(200);
  await expect(strengthFill).toHaveAttribute('style', /width: 80%;/);
  await expect(strengthText).toHaveText('Good');
  
  // Type a strong password (all 5 criteria)
  await passwordInput.fill('StrongP@ssw0rd!');
  await page.waitForTimeout(200);
  await expect(strengthFill).toHaveAttribute('style', /width: 100%;/);
  await expect(strengthText).toHaveText('Strong');
});

  //contact us page testing

  // Test 21: Contact page loads correctly
  test('contact page should load correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/Contact.html`);
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the form elements exist
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('textarea[name="message"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
    
    // Check that the page has the expected text
    await expect(page.locator('body')).toContainText('get in touch with us via email');
  });

  // Test 22: Contact form validation - empty fields
  test('contact form should prevent submission with empty fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/Contact.html`);
    
    // Try to submit without filling anything
    await page.click('button[type="submit"]');
    
    // We should still be on the contact page
    await expect(page).toHaveURL(/Contact.html/);
    
    // Check that the form still has empty fields
    const nameValue = await page.locator('input[name="name"]').inputValue();
    expect(nameValue).toBe('');
  });

  // Test 23: Contact form can be filled and submitted
  test('contact form can be filled and submitted', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `testuser${timestamp}@gmail.com`;
    
    await page.goto(`${BASE_URL}/Contact.html`);
    
    // Fill in the form
    await page.fill('input[name="name"]', 'Playwright Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('textarea[name="message"]', 'This is an automated test message from Playwright.');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Wait for submission to process
    await page.waitForTimeout(2000);
    
    // Check for success message
    const pageContent = await page.textContent('body');
    const successIndicators = ['success', 'Thank you', 'Message sent', 'Your message was sent'];
    const hasSuccess = successIndicators.some(indicator => 
      pageContent.toLowerCase().includes(indicator.toLowerCase())
    );
    
    // Also check if we were redirected to a success page
    const currentUrl = page.url();
    const isRedirected = currentUrl.includes('success') || currentUrl.includes('thank-you');
    
    expect(hasSuccess || isRedirected).toBe(true);
  });

  // Test 24: User can log out
  test('user can log out', async ({ page }) => {
    const timestamp = Date.now();
    const email = `testuser${timestamp}@gmail.com`;
    
    // First, sign up
    await page.goto(`${BASE_URL}/signUp.html`);
    await page.fill('#email', email);
    await page.fill('#password', 'TestPassword123!');
    await page.fill('#confirmPassword', 'TestPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL(/Login.html/);
    
    // Then, log in
    await page.fill('#emailInput', email);
    await page.fill('#passwordInput', 'TestPassword123!');
    await page.click('#loginBtn');
    await page.waitForURL(/loss.php/);
    
    // Click logout button
    await page.click('a:has-text("Logout")');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/Login.html/);
    
    // Try to access calculator again (should redirect to login)
    await page.goto(`${BASE_URL}/loss.php`);
    await expect(page).toHaveURL(/Login.html/);
  });

});

//testing for the api on the stock pages

// Test 25: Stock page loads correctly
test('stock page should load', async ({ page }) => {
  await page.goto(`${BASE_URL}/Stock.html`);
  
  // Check that the page has the expected title (target the specific h1)
  await expect(page.locator('h1:has-text("Stock market")')).toBeVisible();
  
  // Check that the TradingView widget containers exist (use first())
  await expect(page.locator('.tradingview-widget-container').first()).toBeVisible();
});

// Test 26: TradingView widgets are present
test('stock page should have TradingView widgets', async ({ page }) => {
  await page.goto(`${BASE_URL}/Stock.html`);
  
  // Check that there are multiple TradingView widgets
  const containers = page.locator('.tradingview-widget-container');
  const count = await containers.count();
  expect(count).toBeGreaterThan(0);
  
  // Check for the copyright text (indicates widgets are embedded)
  await expect(page.locator('.tradingview-widget-copyright').first()).toBeVisible();
});

// Test 27: TradingView attribution is displayed
test('stock page should display TradingView attribution', async ({ page }) => {
  await page.goto(`${BASE_URL}/Stock.html`);
  
  // Check for the TradingView copyright text
  await expect(page.locator('.tradingview-widget-copyright').first()).toContainText('TradingView');
});

// Test 28: Stock page has company footer
test('stock page should display company footer', async ({ page }) => {
  await page.goto(`${BASE_URL}/Stock.html`);
  
  // Check that the footer exists and contains the expected text
  await expect(page.locator('.botbar')).toBeVisible();
  await expect(page.locator('.botbar')).toContainText('profitPros created by');
});