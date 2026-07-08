<!DOCTYPE html>
<html lang="en">
<head>
    <title>Business Profit/Loss Calculator with Pie Chart</title>
    <link rel="stylesheet" href="style.css">
    <!-- Chart.js - simple and reliable -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
</head>
<body>

<?php
$conn = pg_connect("host=localhost port=5432 dbname=business_calculator user=postgres password=ProfitPros240426!");

if (!$conn) {
    echo "<p style='color:red; text-align:center'>Database connection failed: " . pg_last_error() . "</p>";
}

$profit_loss = 0;
$total_revenue = 0;
$total_cost = 0;
$show_chart = false;
$chartLabels = [];
$chartValues = [];
$chartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $product_cost = floatval($_POST['product']);
    $price = floatval($_POST['price']);
    $sold = floatval($_POST['sold']);
    $theft = floatval($_POST['theft']);
    $stock = floatval($_POST['stock']);
    
    //calculation
    $total_revenue = $price * $sold;
    $total_cost = $product_cost;
    $profit_loss = $total_revenue - $total_cost;
    
    // Prepare data for pie chart
    if ($total_revenue > 0) {
        $chartLabels[] = 'Revenue from Sales';
        $chartValues[] = $total_revenue;
    }
    if ($price * $theft > 0) {
        $chartLabels[] = 'Lost Revenue (Theft)';
        $chartValues[] = $price * $theft;
    }
    if ($product_cost > 0) {
        $chartLabels[] = 'Initial Investment';
        $chartValues[] = $product_cost;
    }
    if ($price * $stock > 0) {
        $chartLabels[] = 'Unsold Stock Value';
        $chartValues[] = $price * $stock;
    }
    
    $show_chart = true;
    
    if ($conn) {
        $query = "INSERT INTO business_calculations (
            product_cost, price, units_sold, units_theft, units_unsold, 
            profit_loss, total_revenue, total_cost, calculation_date
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())";
        
        $result = pg_query_params($conn, $query, array(
            $product_cost, $price, $sold, $theft, $stock, 
            $profit_loss, $total_revenue, $total_cost
        ));
        
        if ($result) {
            echo "<p style='color:green; text-align:center'>✓ Calculation saved to database!</p>";
        } else {
            echo "<p style='color:red; text-align:center'>Error saving: " . pg_last_error($conn) . "</p>";
        }
    }
}
?>

<div class="netnav">
    <a href="index.html">HomePage</a>
    <a href="Stock.html">Stocks</a>
    <a href="loss.php">Calculator</a>  
    <a href="Contact.html">Contact Us</a>
    <a href="FAQ.html">FAQ</a>
</div>

<div class="middle">
    <h1>Business Profit/Loss Calculator</h1>
</div>

<div class="west">
    <form method="POST" action="" id="calculatorForm">
        <label for="product">How much did you spend getting/making the product? €</label>
        <input type="number" id="product" name="product" step="0.01" value="0" required><br>
        
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
    
    <?php if ($_SERVER["REQUEST_METHOD"] == "POST"): ?>
    <div class="result-box">
        <h3>Calculation Results:</h3>
        <p>Total Revenue: <strong>€<?php echo number_format($total_revenue, 2); ?></strong></p>
        <p>Total Cost: <strong>€<?php echo number_format($total_cost, 2); ?></strong></p>
        <p class="result-amount <?php echo $profit_loss >= 0 ? 'profit-positive' : 'profit-negative'; ?>">
            <?php echo $profit_loss >= 0 ? 'PROFIT: ' : 'LOSS: '; ?>
            €<?php echo number_format(abs($profit_loss), 2); ?>
        </p>
    </div>
    
    <?php if (!empty($chartLabels)): ?>
    <div class="chart-container">
        <h3>Financial Breakdown</h3>
        <canvas id="pieChart" width="400" height="400"></canvas>
    </div>
    
    <script>
    // Create pie chart after page loads
    (function() {
        const ctx = document.getElementById('pieChart').getContext('2d');
        const labels = <?php echo json_encode($chartLabels); ?>;
        const values = <?php echo json_encode($chartValues); ?>;
        const colors = <?php echo json_encode($chartColors); ?>;
        
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
    })();
    </script>
    <?php else: ?>
        <p style="text-align:center; color:#666;">Enter values greater than 0 to see the pie chart</p>
    <?php endif; ?>
    <?php endif; ?>
</div>

<?php
if ($conn) {
    pg_close($conn);
}
?>

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