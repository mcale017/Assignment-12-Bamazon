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

// It'll run the askManager function once it connects to the database
connection.connect(function (error) {
    if (error) throw error;
    askManager();
});

// Function that will list 4 options for the manager to choose from
function askManager() {
    console.log("\n");

    inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
            name: "action"
        }
    ]).then(function (response) {
        switch (response.action) {
            case "View Products for Sale":
                viewProducts();
                break;

            case "View Low Inventory":
                lowInventory();
                break;

            case "Add to Inventory":
                addInventory();
                break;

            case "Add New Product":
                newProduct();
                break;

            // No default needed here as it's not possible for the action to be anything but the 4 listed above
        }
    });
}

// Function that will ask the manager if they would like to perform another action
function afterAction() {
    console.log("\n");

    inquirer.prompt([
        {
            type: "list",
            message: "Would you like to perform another action?",
            choices: ["Yes", "No"],
            name: "action"
        }
    ]).then(function (response) {
        switch (response.action) {
            case "Yes":
                askManager();
                break;

            case "No":
                return;
                break;

            // No default needed here as it's not possible for the action to be anything but the 4 listed above
        }
    });
}

// Function that will display every item in the database with details
function viewProducts() {
    var query = connection.query("SELECT * FROM products", function (error, result) {
        if (error) throw error;

        console.log("\n");

        console.table(result);

        afterAction();
    })
}

// Function that will display all items with an inventory count of lower than 5
function lowInventory() {
    var query = connection.query("SELECT * FROM products WHERE stock_quantity < 5", function (error, result) {
        if (error) throw error;

        console.log("\n");

        if (result.length > 0) {
            console.table(result);
        } else {
            console.log("There are no items in the store that are low on inventory.");
        }

        afterAction();
    })
}

// Function that will allow the manager to add stock quantity to existing items in the database
function addInventory() {
    console.log("\n");

    // Get the item's ID & the quantity that they would like to add by
    inquirer.prompt([
        {
            type: "input",
            message: "What is the ID number of the item you would like to add inventory to?",
            name: "item_id_number"
        },
        {
            type: "input",
            message: "How many of those would you like to add?",
            name: "item_quantity"
        }
    ]).then(function (response) {
        // Update the products table in the database
        var query = connection.query(
            "UPDATE products SET stock_quantity = stock_quantity + " + response.item_quantity + " WHERE ?",
            {
                item_id: response.item_id_number
            },
            function (error, response) {
                if (error) throw error;

                viewProducts();
            }
        )
    })
}

// Function that will allow the manager to add a completely new item into the database
function newProduct() {
    console.log("\n");

    inquirer.prompt([
        {
            type: "input",
            message: "What is the name of the item you would like to add to the store?",
            name: "item_name"
        },
        {
            type: "input",
            message: "Which department would this item fall under?",
            name: "item_department"
        },
        {
            type: "input",
            message: "What is this item's price?",
            name: "item_price"
        },
        {
            type: "input",
            message: "How many of this item would you like to add to the store?",
            name: "item_quantity"
        }
    ]).then(function (response) {
        var query = connection.query(
            "INSERT INTO products SET ?",
            {
                product_name: response.item_name,
                department_name: response.item_department,
                price: response.item_price,
                stock_quantity: response.item_quantity
            },
            function (error, response) {
                if (error) throw error;

                viewProducts();
            }
        )
    })
}