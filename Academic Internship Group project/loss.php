<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name ="viewport" content="width=device-width, initial-scale=1.0">
<title>Loss</title>
<link rel="stylesheet" href="style.css">
</head>
<body>

<?php
// connection to postgre server
$conn = pg_connect("host=localhost port=5432 dbname=business_calculator user=postgres password=");

if (!$conn) {
    echo "<p style='color:red; text-align:center'>Database connection failed: " . pg_last_error() . "</p>";
}

// Handle form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    
    $product_cost = $_POST['product'];
    $price = $_POST['price'];
    $sold = $_POST['sold'];
    $theft = $_POST['theft'];
    $stock = $_POST['stock'];
    
    
    $a = $price;
    $b = $sold;
    $d = $theft;
    $e = $stock;
    $f = $product_cost;
    $c = (($a*$b-$a*$d)-$a*$e)-$f;  
    $profit_loss = $c;
    
    if ($conn) {
        $query = "INSERT INTO business_calculations (
            product_cost, 
            price, 
            units_sold, 
            units_theft, 
            units_unsold, 
            profit_loss,
            calculation_date
        ) VALUES (
            $product_cost, 
            $price, 
            $sold, 
            $theft, 
            $stock, 
            $profit_loss,
            NOW()
        )";
        
        $result = pg_query($conn, $query);
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
    <h1>Business profit calculator</h1>
</div>

<div class="west">
    
    <form method="POST" action="">
        
        <label for="product">How much did you spend getting/making the product? €</label>
        <input type="number" id="product" name="product" value="0"><br>
        
        <label for="price">The price of the product €</label>
        <input type="number" id="price" name="price" value="0"><br>
        
        <label for="sold">How many units of the product were sold? </label>
        <input type="number" id="sold" name="sold" value="0"><br>
        
        <label for="theft">How many units of the product were lost in the theft? </label>
        <input type="number" id="theft" name="theft" value="0"><br>
        
        <label for="stock">How many units of the product went unsold? </label>
        <input type="number" id="stock" name="stock" value="0"><br>
        
        <p></p>
        
        <button type="submit" class="button Lbutton" id="lossButton">Calculate & Save</button>
        
        <label for="loss">€</label>
        <output id="loss">
            <?php
            // Display the saved result if form was submitted
            if (isset($profit_loss)) {
                echo $profit_loss;
            } else {
                echo "0";
            }
            ?>
        </output><br>
    </form>
</div>

<script>

var price = document.getElementById("price");
var sold = document.getElementById("sold");
var theft = document.getElementById("theft");
var loss = document.getElementById("loss");
var stock = document.getElementById("stock");
var product = document.getElementById("product");
var lossButton = document.getElementById("lossButton");

function calculateLoss(){
    var a = Number(price.value);
    var b = Number(sold.value);
    var d = Number(theft.value);
    var e = Number(stock.value);
    var f = Number(product.value);
    var c = ((a*b-a*d)-a*e)-f;
    loss.value = c;
}


lossButton.addEventListener("click", calculateLoss);
</script>

<?php
// Close database connection
if ($conn) {
    pg_close($conn);
}
?>

</body>
</html>