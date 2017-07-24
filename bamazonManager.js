var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

function viewProducts() {
    connection.query(
        "SELECT * FROM products;", function (error, data) {
            if (error) {
                console.error(error);
            } else {
                data.forEach(function (product) {
                    console.log(product.id + ") " + product.name + " | Price: $" + product.price + " | Quantity: " + product.stock_quantity);
                });
            }
            connection.end();
        });
}

function viewLowInventory() {
    connection.query(
        "SELECT * FROM products WHERE stock_quantity < 5;", function (error, data) {
            if (error) {
                console.error(error);
            } else {
                data.forEach(function (product) {
                    console.log("ID: " + product.id + " | " + product.name + " | Price: $" + product.price + " | Quantity: " + product.stock_quantity);
                });
            }
            connection.end();
        });
}

function addToInventory() {
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
                        message: 'Please select the item to add inventory',
                        choices: productChoices
                    },
                    {
                        type: 'input',
                        name: 'amount',
                        message: 'How many items would you like to add?'
                    }
                ]).then(function (choice) {
                    connection.query(
                        "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?;", [choice.amount, choice.option], function (error) {
                            if (error) {
                                console.error(error);
                            } else {
                                connection.query(
                                    "SELECT stock_quantity FROM products WHERE id = ?;", choice.option, function (error, productReturned) {
                                        if (error) {
                                            console.error(error);
                                        } else {
                                            console.log("Updated quantity: " + productReturned[0].stock_quantity);
                                        }
                                        connection.end();
                                    });
                            }

                        });
                });
            }
        });
}

function addNewProduct() {
    var departments = [];
    connection.query(
        "SELECT * FROM departments;", function (error, data) {
            if (error) {
                console.error(error);
            } else {
                data.forEach(function (department) {
                    var departmentDetails = {
                        name: department.name,
                        value: department.id
                    }
                    departments.push(departmentDetails);
                });

                inquirer.prompt([
                    {
                        type: "input",
                        name: 'productName',
                        message: 'What is the name of the new product?'
                    },
                    {
                        type: "list",
                        name: 'departmentId',
                        message: 'What department does this product belong?',
                        choices: departments
                    },
                    {
                        type: "input",
                        name: 'stockQuantity',
                        message: 'How many of these are you adding?',
                        validate: function (value) {
                            if (isNaN(value) == false && value % 1 === 0) {
                                return true;
                            } else {
                                return "Please provide a whole number."
                            }
                        }
                    },
                    {
                        type: "input",
                        name: "price",
                        message: 'How much do they cost?',
                        validate: function (value) {
                            if (isNaN(value) == false) {
                                return true;
                            } else {
                                return "Please provide a number."
                            }
                        }
                    }
                ]).then(function (productInfo) {
                    connection.query(
                        "INSERT INTO products (name, department_id, price, stock_quantity, product_sales) "
                        + "VALUES (?, ?, ?, ?, 0)", [productInfo.productName, productInfo.departmentId, productInfo.price, productInfo.stockQuantity], function (error) {
                            if (error) {
                                console.error(error);
                            } else {
                                console.log(productInfo.productName + " successfully added!");
                            }
                            connection.end();
                        });
                })
            }
        });
}

function initialize() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'option',
            message: 'Choose an option',
            choices: [
                {
                    name: "View Products for Sale",
                    value: "viewProducts"
                },
                {
                    name: "View Low Inventory",
                    value: "viewLowInventory"
                },
                {
                    name: "Add to Inventory",
                    value: "addToInventory"
                },
                {
                    name: "Add New Product",
                    value: "addNewProduct"
                }
            ]
        }
    ]).then(function (choice) {
        switch (choice.option) {
            case "viewProducts":
                viewProducts();
                break;
            case "viewLowInventory":
                viewLowInventory();
                break;
            case "addToInventory":
                addToInventory();
                break;
            case "addNewProduct":
                addNewProduct();
                break;
            default:
                console.log("Unrecognized argument");
        }
    });
}
initialize();