var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "bamazon"
});

function viewDepartmentSales() {
    connection.query(
        "SELECT p.department_id, d.name AS department_name, d.over_head_costs, "
        + "SUM(p.product_sales) product_sales, SUM(p.product_sales)-d.over_head_costs "
        + "AS total_profit FROM products p LEFT JOIN departments d "
        + "ON p.department_id = d.id GROUP BY p.department_id;", function (error, data) {
            if (error) {
                console.error(error);
            } else {
                console.log("department_id | department_name | over_head_costs | product_sales | total_profit");
                data.forEach(function (department) {
                    console.log(department.department_id + " | " + department.department_name + " | " + department.over_head_costs + " | " + department.product_sales + " | " + department.total_profit);
                });
            }
            connection.end();
        });
}

function createNewDepartment() {
    inquirer.prompt([
        {
            type: "input",
            name: 'departmentName',
            message: 'What is the name of the new department?'
        },
        {
            type: "input",
            name: 'overHeadCosts',
            message: 'What is the over head cost for this department?',
            validate: function (value) {
                if (isNaN(value) == false) {
                    return true;
                } else {
                    return "Please provide a number."
                }
            }
        }
    ]).then(function (departmentInfo) {
        connection.query(
            "INSERT INTO departments (name, over_head_costs) "
            + "VALUES (?, ?)", [departmentInfo.departmentName, departmentInfo.overHeadCosts], function (error) {
                if (error) {
                    console.error(error);
                } else {
                    console.log(departmentInfo.departmentName + " department successfully added!");
                }
                connection.end();
            });
    })
}


function initialize() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'option',
            message: 'Choose an option',
            choices: [
                {
                    name: "View Sales by Department",
                    value: "viewDepartmentSales"
                },
                {
                    name: "Create New Department",
                    value: "createNewDepartment"
                }
            ]
        }
    ]).then(function (choice) {
        switch (choice.option) {
            case "viewDepartmentSales":
                viewDepartmentSales();
                break;
            case "createNewDepartment":
                createNewDepartment();
                break;
            default:
                console.log("Unrecognized argument");
        }
    });
}
initialize();