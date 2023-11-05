#-- User table 
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL
);

-- Vehicle table
CREATE TABLE vehicles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('4Wheeler', '2Wheeler') NOT NULL,
  model VARCHAR(255) NOT NULL,
  vehicle_name VARCHAR(255) NOT NULL
);

-- Booking table to store booking information
CREATE TABLE bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  vehicle_type ENUM('4Wheeler', '2Wheeler') NOT NULL,
  vehicle_model VARCHAR(255) NOT NULL,
  vehicle_name VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  UNIQUE (user_id, start_date, end_date),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (vehicle_type, vehicle_model, vehicle_name) REFERENCES vehicles(type, model, vehicle_name)
);
