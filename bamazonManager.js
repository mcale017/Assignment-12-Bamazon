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
connection.connect(function (err) {
    if (err) throw err;
    askManager();
});

// Function that will list 4 options for the manager to choose from
function askManager() {
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

// Function that will display every product in database with details
function viewProducts() {
    var query = connection.query("SELECT * FROM products", function (err, result) {
        if (err) throw err;

        console.table(result);

        afterAction();
    })
}