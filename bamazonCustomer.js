var mysql = require("mysql");
var inquirer = require("inquirer");
var table = require("console.table");

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "123abc",
    database: "bamazon"
})

connection.connect(function (err) {
    if (err) throw err;
    displayProducts();
});

function displayProducts() {
    var query = connection.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;

        console.table(result);

        askCustomer();
    })
}

// Function to ask the customer the item id and the quantity of that item that they would like to buy
function askCustomer() {
    inquirer.prompt([
        {
            type: "input",
            message: "What is the ID number of the item you would like to buy?",
            name: "item_id_number"
        },
        {
            type: "input",
            message: "How many of those would you like to buy?",
            name: "item_quantity"
        }
    ]).then(function (response) {
        // Plug in the response into the checkAvailability function
        checkAvailability(response.item_id_number, response.item_quantity);
    })
}

// Function to check the availability of an item
function checkAvailability(item_id_number, item_quantity) {
    console.log("Searching for " + item_quantity + " of item ID of " + item_id_number + ".");

    // Query to the database using item_id_number & item_quantity variables
    var query = connection.query(
        // Select from the whole products table where item_id equals what the customer wants
        "SELECT * FROM products WHERE ?",
        {
            item_id: item_id_number
        },
        function (error, response) {
            if (error) throw error;

            // If there is enough quantity in stock
            if (response[0].stock_quantity > item_quantity || response[0].stock_quantity == item_quantity) {
                // Run purchaseItem function to complete the transaction
                purchaseItem(response[0], item_quantity);
            } else {
                // Let the customer know that there isn't enough stock available
                console.log("Sorry, we only have " + response[0].stock_quantity + " of " + response[0].product_name + ".");
            }
        }
    )
}

// Function to complete the transaction for the customer
function purchaseItem(result, item_quantity) {
    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: result.stock_quantity - item_quantity
            },
            {
                item_id: result.item_id
            }
        ],
        function (error, response) {
            if (error) throw error;

            console.log("You purchased " + item_quantity + " of " + result.product_name + " for a total of $" + (parseInt(item_quantity) * parseFloat(result.price)).toFixed(2) + ".");
        }
    )
}