-- Farmer Table
CREATE TABLE farmer (
    farmer_id INT PRIMARY KEY,
    name CHAR(10),
    contact_number BIGINT,
    bank_account VARCHAR(20),
    aadhar_number BIGINT
);

INSERT INTO farmer VALUES
(101, 'Ravi     ', 9876543210, 'AC98765432', 123456789012345),
(102, 'Meena    ', 9123456789, 'AC12345678', 987654321098765);

-- Application Table
CREATE TABLE application (
    application_id INT PRIMARY KEY,
    farmer_id INT,
    submission_date DATE,
    status CHAR(10),
    FOREIGN KEY (farmer_id) REFERENCES farmer(farmer_id)
);

INSERT INTO application VALUES
(1001, 101, '2025-04-20', 'Pending'),
(1002, 102, '2025-04-22', 'Approved');

-- Subsidy Table
CREATE TABLE subsidy (
    subsidy_id INT PRIMARY KEY,
    name CHAR(15),
    eligibility_criteria INT,
    amount NUMERIC(7,2),  -- Changed from (5,2) to (7,2)
    application_deadline DATE
);


INSERT INTO subsidy VALUES
(1, 'Fertilizer     ', 18, 1500.00, '2025-05-31'),
(2, 'Irrigation     ', 21, 2000.00, '2025-06-15');

-- Administrator Table
CREATE TABLE administrator (
    admin_id INT PRIMARY KEY,
    admin_name CHAR(15),
    email VARCHAR(30),
    role INT,
    contact_number BIGINT
);

INSERT INTO administrator VALUES
(1, 'AdminOne       ', 'admin1@example.com', 1, 9988776655),
(2, 'AdminTwo       ', 'admin2@example.com', 2, 8877665544);

-- Payments Table
CREATE TABLE payments (
    payment_id INT PRIMARY KEY,
    amount_paid NUMERIC(7,2),  -- Changed from (5,2) to (7,2)
    farmer_id INT,
    payment_date DATE,
    payment_status CHAR(10),
    FOREIGN KEY (farmer_id) REFERENCES farmer(farmer_id)
);

INSERT INTO payments VALUES
(501, 1500.00, 101, '2025-04-23', 'Paid'),
(502, 2000.00, 102, '2025-04-24', 'Pending');

-- Document Table
CREATE TABLE document (
    document_id VARCHAR(5) PRIMARY KEY,
    document_type CHAR(10),
    application_type CHAR(10)
);

INSERT INTO document VALUES
('D001', 'Aadhar    ', 'Subsidy'),
('D002', 'BankStmt  ', 'Subsidy');
