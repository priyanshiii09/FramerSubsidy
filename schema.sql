--> the schemas to create postgregsql or mysqlworkbench before running the application

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    farmer_name VARCHAR(255) NOT NULL,
    contact_info VARCHAR(100),
    subsidy_type VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(50) DEFAULT 'Pending',
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from applications;