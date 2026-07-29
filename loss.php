<?php
// Get token 
// Start session
session_start();

//Login handler
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if ($data && isset($data['set_session'])) {
        $_SESSION['username'] = $data['username'] ?? null;
        $_SESSION['user_id'] = $data['userId'] ?? null;
        echo json_encode(['success' => true]);
        exit;
    }
}

//logout handler
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: Login.html');
    exit;
}

//get username as json to display on pages
if (isset($_GET['get_user'])) {
    header('Content-Type: application/json');
    if (isset($_SESSION['username'])) {
        echo json_encode([
            'logged_in' => true,
            'username' => $_SESSION['username']
        ]);
    } else {
        echo json_encode([
            'logged_in' => false,
            'username' => null
        ]);
    }
    exit;
}
// prevent caching of old entries for table
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

// Check for chart data in session (from a POST submission)
$chartLabels = $_SESSION['chartLabels'] ?? [];
$chartValues = $_SESSION['chartValues'] ?? [];
$show_chart = $_SESSION['show_chart'] ?? false;

// Clear session data after retrieving
unset($_SESSION['chartLabels']);
unset($_SESSION['chartValues']);
unset($_SESSION['show_chart']);

// If token is in URL (from login redirect), store it in session
$token_from_url = $_GET['token'] ?? null;
if ($token_from_url) {
    $_SESSION['token'] = $token_from_url;
    // Redirect to remove token from URL for safety
    header('Location: loss.php');
    exit;
}

// get token from session
$token = $_SESSION['token'] ?? null;

// If no token in session, redirect to login
if (!$token) {
    header('Location: Login.html');
    exit;
}

//get the username from the session
$username = $_SESSION['username'] ?? null;

//connect to node.js API
$api_url = 'http://localhost:3000/api/loss';
$profit_loss = 0;
$total_revenue = 0;
$total_cost = 0;
$chartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];
$api_error = null;
$api_success = false;

//fetch all user entries
$entries = [];
$entries_error = null;

function fetchEntries($token) {
    // Add timestamp to prevent caching
    $api_url = 'http://localhost:3000/api/loss/entries?_=' . time();
    
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Cache-Control: no-cache'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code == 200) {
        return json_decode($response, true);
    } else {
        return ['error' => 'Failed to fetch entries (HTTP ' . $http_code . ')'];
    }
}

$entries_result = fetchEntries($token);
if (isset($entries_result['error'])) {
    $entries_error = $entries_result['error'];
} else {
    $entries = $entries_result;
}

// Only runs when delete_action is set
if ($_SERVER["REQUEST_METHOD"] == "POST" && isset($_POST['delete_id']) && isset($_POST['delete_action'])) {
    $delete_id = intval($_POST['delete_id']);
    $delete_token = $token;
    
    $delete_url = 'http://localhost:3000/api/loss/' . $delete_id;
    
    $ch = curl_init($delete_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $delete_token
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code == 200) {
        echo "<p style='color:green; text-align:center'> Entry deleted successfully</p>";
        // Force refresh with cache busting
        echo "<script>window.location.href = 'loss.php?_=' + Date.now();</script>";
        exit;
    } else {
        echo "<p style='color:red; text-align:center'> Failed to delete entry. HTTP " . $http_code . "</p>";
        echo "<pre style='color:red;'>" . htmlspecialchars($response) . "</pre>";
    }
}

// Only runs when delete_action is NOT set 
if ($_SERVER["REQUEST_METHOD"] == "POST" && !isset($_POST['delete_action']) && isset($_POST['cost_per_unit'])) {
    
    $cost_per_unit = floatval($_POST['cost_per_unit'] ?? 0);
    $price = floatval($_POST['price'] ?? 0);
    $sold = floatval($_POST['sold'] ?? 0);
    $theft = floatval($_POST['theft'] ?? 0);
    $stock = floatval($_POST['stock'] ?? 0);
    
    // Calculations
    $total_stocked = $stock + $sold + $theft;
    $total_revenue = $price * $sold;
    $total_cost = $cost_per_unit * $total_stocked;
    $initial_investment = $cost_per_unit * $total_stocked;
    $cost_of_goods_sold = $cost_per_unit * $sold;
    $gross_profit = $total_revenue - $cost_of_goods_sold;
    $gross_profit_percentage = $total_revenue > 0 ? ($gross_profit / $total_revenue) * 100 : 0;
    $profit_loss = $total_revenue - $initial_investment;
    
    // Prepare data for pie chart
    $chartLabels = [];
    $chartValues = [];
    
    if ($total_revenue > 0) {
        $chartLabels[] = 'Revenue from Sales';
        $chartValues[] = $total_revenue;
    }
    if ($price * $theft > 0) {
        $chartLabels[] = 'Lost Revenue (Theft)';
        $chartValues[] = $price * $theft;
    }
    if ($initial_investment > 0) {
        $chartLabels[] = 'Initial Investment';
        $chartValues[] = $initial_investment;
    }
    if ($price * $stock > 0) {
        $chartLabels[] = 'Unsold Stock Value';
        $chartValues[] = $price * $stock;
    }
    
    // Store chart data in session for display after reload
    $_SESSION['chartLabels'] = $chartLabels;
    $_SESSION['chartValues'] = $chartValues;
    $_SESSION['show_chart'] = true;
    
    // Prepare data for API
    $api_data = [
        'productName' => $_POST['product_name'] ?? 'Product',
        'price' => $price,
        'costPerUnit' => $cost_per_unit,
        'amountStocked' => $total_stocked,
        'amountSold' => $sold,
        'amountStolen' => $theft
    ];
    
    // Initialize cURL with token authentication
    $ch = curl_init($api_url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $token
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($api_data));
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curl_error = curl_error($ch);
    curl_close($ch);
    
    // Check response
    if ($curl_error) {
        $api_error = "API Connection Error: " . $curl_error;
    } elseif ($http_code == 201 || $http_code == 200) {
        $api_success = true;
        $api_result = json_decode($response, true);
        echo "<p style='color:green; text-align:center'> Data saved to database</p>";
        // Force refresh with cache busting
        echo "<script>setTimeout(function() { window.location.href = 'loss.php?_=' + Date.now(); }, 500);</script>";
    } elseif ($http_code == 401) {
        $api_error = "Authentication required. Please log in first.";
    } elseif ($http_code == 403) {
        $api_error = "Access denied. Invalid token.";
    } else {
        $api_error = "API Error (HTTP $http_code): " . $response;
    }
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Business Profit/Loss Calculator</title>
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <script>
    // Calculator link handler
    document.addEventListener('DOMContentLoaded', function() {
        var link = document.getElementById('calculatorLink');
        if (link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'loss.php';
            });
        }
    });
    </script>
</head>
<body>

<div class="netnav">
    <h1>ProfitPros</h1>
    <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; width: 100%;">
        <div>
            <a href="index.html">HomePage</a>
            <a href="Stock.html">Stocks</a>
            <a href="loss.php">Calculator</a>
            <a href="Contact.html">Contact Us</a>
            <a href="FAQ.html">FAQ</a>
            <a href="Login.html">Login</a>
            <a href="signup.html">Create New Account</a>
        </div>
        
        <!-- User Info (PHP version - shows username from session) -->
        <div id="userInfo" style="display: <?php echo $username ? 'block' : 'none'; ?>; color: #fff; padding: 5px 15px; background: rgba(0,0,0,0.2); border-radius: 5px;">
            <span id="usernameDisplay"> <?php echo htmlspecialchars($username ?? ''); ?></span>
            <a href="loss.php?logout=1" style="
                background: #e74c3c;
                color: white;
                border: none;
                padding: 5px 15px;
                border-radius: 5px;
                cursor: pointer;
                margin-left: 10px;
                text-decoration: none;
                display: inline-block;
            ">Logout</a>
        </div>
    </div>
</div>

<div class="middle">
    <h1>Business Profit/Loss Calculator</h1>
</div>

<div class="west">
    <?php if ($api_error): ?>
        <div style="background:#ffebee; padding:15px; border-radius:5px; margin-bottom:20px; border-left:4px solid #e74c3c;">
            <p style="color:#c0392b; margin:0;"><strong>Error:</strong> <?php echo htmlspecialchars($api_error); ?></p>
            <?php if (strpos($api_error, 'Authentication') !== false): ?>
                <p style="color:#666; margin-top:5px; font-size:14px;">
                    Please <a href="Login.html" style="color:#3498db;">login</a> first to save data.
                </p>
            <?php endif; ?>
        </div>
    <?php endif; ?>
    
    <form method="POST" action="" id="calculatorForm">
        
        <label for="product_name">Product Name</label>
        <input type="text" id="product_name" name="product_name" placeholder="Enter product name" value="Product" required><br>
        
        <label for="cost_per_unit">Cost per unit (what you paid for each unit) €</label>
        <input type="number" id="cost_per_unit" name="cost_per_unit" step="0.01" value="0" required><br>
        
        <label for="price">The selling price of the product €</label>
        <input type="number" id="price" name="price" step="0.01" value="0" required><br>
        
        <label for="sold">How many units of the product were sold?</label>
        <input type="number" id="sold" name="sold" step="1" value="0" required><br>
        
        <label for="theft">How many units were lost to theft?</label>
        <input type="number" id="theft" name="theft" step="1" value="0" required><br>
        
        <label for="stock">How many units went unsold?</label>
        <input type="number" id="stock" name="stock" step="1" value="0" required><br>
        
        <button type="submit" class="button Lbutton">Calculate & Save</button>
    </form>
    
    <?php if ($_SERVER["REQUEST_METHOD"] == "POST" && !isset($_POST['delete_action'])): ?>
    <div class="result-box">
        <h3>Calculation Results:</h3>
        <p>Total Revenue: <strong>€<?php echo number_format($total_revenue, 2); ?></strong></p>
        <p>Total Cost (Cost per unit × Stocked): <strong>€<?php echo number_format($total_cost, 2); ?></strong></p>
        <p class="result-amount <?php echo $profit_loss >= 0 ? 'profit-positive' : 'profit-negative'; ?>">
            <?php echo $profit_loss >= 0 ? 'PROFIT: ' : 'LOSS: '; ?>
            €<?php echo number_format(abs($profit_loss), 2); ?>
        </p>
        <p>Initial Investment: <strong>€<?php echo number_format($initial_investment ?? 0, 2); ?></strong></p>
        <p>Cost of Goods Sold: <strong>€<?php echo number_format($cost_of_goods_sold ?? 0, 2); ?></strong></p>
        <p>Gross Profit: <strong>€<?php echo number_format($gross_profit ?? 0, 2); ?></strong></p>
        <p>Gross Profit %: <strong><?php echo number_format($gross_profit_percentage ?? 0, 1); ?>%</strong></p>
        <?php if ($api_success): ?>
            <p style="color:green; font-size:14px;"> Data saved to database</p>
        <?php else: ?>
            <p style="color:orange; font-size:14px;"> Data not saved. <?php echo htmlspecialchars($api_error ?? 'Please try again.'); ?></p>
        <?php endif; ?>
    </div>
    <?php endif; ?>
</div>

<div class="entries-section">
    <h2> Your Entries</h2>
    
    <?php if ($entries_error): ?>
        <p style="color:red;">Error loading entries: <?php echo htmlspecialchars($entries_error); ?></p>
    <?php elseif (empty($entries)): ?>
        <p style="color:#666; padding: 20px 0;">No entries yet. Calculate your first product above</p>
    <?php else: ?>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Cost/Unit</th>
                        <th>Stocked</th>
                        <th>Sold</th>
                        <th>Stolen</th>
                        <th>Revenue</th>
                        <th>Loss</th>
                        <th>Loss %</th>
                        <th>Initial Investment</th>
                        <th>Gross Profit</th>
                        <th>Gross %</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($entries as $index => $entry): ?>
                    <tr>
                        <td><?php echo $index + 1; ?></td>
                        <td><strong><?php echo htmlspecialchars($entry['product_name']); ?></strong></td>
                        <td>€<?php echo number_format($entry['price'], 2); ?></td>
                        <td>€<?php echo number_format($entry['cost_per_unit'] ?? 0, 2); ?></td>
                        <td><?php echo $entry['amount_stocked']; ?></td>
                        <td><?php echo $entry['amount_sold']; ?></td>
                        <td><?php echo $entry['amount_stolen']; ?></td>
                        <td>€<?php echo number_format($entry['total_sales'], 2); ?></td>
                        <td>€<?php echo number_format($entry['total_loss'], 2); ?></td>
                        <td style="color: <?php echo $entry['loss_percentage'] > 30 ? '#e74c3c' : ($entry['loss_percentage'] > 15 ? '#f39c12' : '#27ae60'); ?>;">
                            <?php echo number_format($entry['loss_percentage'], 1); ?>%
                        </td>
                        <td>€<?php echo number_format($entry['initial_investment'] ?? 0, 2); ?></td>
                        <td>€<?php echo number_format($entry['gross_profit'] ?? 0, 2); ?></td>
                        <td style="color: <?php echo ($entry['gross_profit_percentage'] ?? 0) >= 0 ? '#27ae60' : '#e74c3c'; ?>;">
                            <?php echo number_format($entry['gross_profit_percentage'] ?? 0, 1); ?>%
                        </td>
                        <td>
                            <form method="POST" action="" style="display:inline;" onsubmit="return confirm('Delete this entry?');">
                                <input type="hidden" name="delete_id" value="<?php echo $entry['id']; ?>">
                                <input type="hidden" name="delete_action" value="1">
                                <button type="submit" class="delete-btn">Delete</button>
                            </form>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

        <div class="entries-summary">
            <?php 
            $total_revenue_all = array_sum(array_column($entries, 'total_sales'));
            $total_loss_all = array_sum(array_column($entries, 'total_loss'));
            $avg_loss = count($entries) > 0 ? array_sum(array_column($entries, 'loss_percentage')) / count($entries) : 0;
            $total_initial_investment = array_sum(array_column($entries, 'initial_investment'));
            $total_gross_profit = array_sum(array_column($entries, 'gross_profit'));
            $avg_gross_profit_percentage = count($entries) > 0 ? array_sum(array_column($entries, 'gross_profit_percentage')) / count($entries) : 0;
            ?>
            <p> Total Products: <strong><?php echo count($entries); ?></strong></p>
            <p> Total Revenue: <strong>€<?php echo number_format($total_revenue_all, 2); ?></strong></p>
            <p> Total Loss: <strong>€<?php echo number_format($total_loss_all, 2); ?></strong></p>
            <p> Avg Loss: <strong><?php echo number_format($avg_loss, 1); ?>%</strong></p>
            <p> Total Initial Investment: <strong>€<?php echo number_format($total_initial_investment, 2); ?></strong></p>
            <p> Total Gross Profit: <strong>€<?php echo number_format($total_gross_profit, 2); ?></strong></p>
            <p> Avg Gross Profit %: <strong><?php echo number_format($avg_gross_profit_percentage, 1); ?>%</strong></p>
        </div>
    <?php endif; ?>
</div>

<?php if ($show_chart && !empty($chartLabels)): ?>
<div class="chart-container">
    <h3>Financial Breakdown</h3>
    <canvas id="pieChart" width="400" height="400"></canvas>
</div>

<script>
(function() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    const labels = <?php echo json_encode($chartLabels); ?>;
    const values = <?php echo json_encode($chartValues); ?>;
    const colors = <?php echo json_encode($chartColors); ?>;
    
    if (labels.length > 0) {
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: values,
                    backgroundColor: colors.slice(0, labels.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            font: { size: 12 }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.raw;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `€${value.toFixed(2)} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }
})();
</script>
<?php endif; ?>

<script>
document.getElementById('calculatorForm').addEventListener('submit', function(e) {
    const inputs = this.querySelectorAll('input[type="number"]');
    let allZero = true;
    for(let i = 0; i < inputs.length; i++) {
        if (parseFloat(inputs[i].value) !== 0) {
            allZero = false;
            break;
        }
    }
    if (allZero) {
        e.preventDefault();
        alert('Please enter some values before calculating');
    }
});
</script>

</body>
</html>