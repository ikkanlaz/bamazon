var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

function getProducts() {
    var query = connection.query(
        "SELECT * FROM products;", function (error, data) {
            if (error) {
                console.error(error);
            } else {
                return data;
            }
        }
    );
    connection.end();
}

function initialize() {
    var productChoices = [];
    var price;
    connection.query(
        "SELECT * FROM products;", function (error, data) {
            if (error) {
                console.error(error);
            } else {
                data.forEach(function (product) {
                    var productDetails = {
                        name: product.id + ": " + product.name,
                        value: product.id
                    }
                    productChoices.push(productDetails);
                });
                inquirer.prompt([
                    {
                        type: 'list',
                        name: 'option',
                        message: 'Please select the item you\'d like to purchase',
                        choices: productChoices
                    },
                    {
                        type: 'input',
                        name: 'amount',
                        message: 'How many would you like?'
                    }
                ]).then(function (choice) {
                    connection.query(
                        "SELECT * FROM products WHERE id = ?;", choice.option, function (error, productReturned) {
                            if (error) {
                                console.error(error);
                            } else if (productReturned[0].stock_quantity < choice.amount) {
                                console.log("Insufficient Quantity. Select another item.")
                                connection.end();
                            } else {
                                var cost = productReturned[0].price * choice.amount;
                                connection.query(
                                    "UPDATE products SET stock_quantity = stock_quantity - ?, " 
                                    + "product_sales = product_sales + ?  WHERE id = ?;", [choice.amount, cost, choice.option], function (error) {
                                        if (error) {
                                            console.error(error);
                                        } else {
                                            console.log("Cost of purchase: $" + cost);
                                        }
                                        connection.end();
                                    });
                            }

                        });
                });
            }
        });


}

initialize();