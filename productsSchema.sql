CREATE TABLE products(
   	id INT AUTO_INCREMENT, 
    name VARCHAR(100),
    department_id VARCHAR(100),
    price DECIMAL(10,4), 
    stock_quantity INT,
    primary key (id)
);