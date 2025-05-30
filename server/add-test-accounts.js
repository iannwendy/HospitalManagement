/**
 * Script to add test accounts to the database
 * Run with: node add-test-accounts.js
 */

const Database = require('better-sqlite3');
const db = new Database('hospital.db', { verbose: console.log });

// Helper function to generate random data
function generateRandomData() {
  const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Linda',
    'William', 'Maria', 'Richard', 'Susan', 'Thomas', 'Elizabeth', 'James',
    'Jennifer', 'Charles', 'Margaret', 'Joseph', 'Emily', 'Daniel', 'Olivia'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia',
    'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez',
    'Moore', 'Martin', 'Jackson', 'Thompson', 'White', 'Lopez', 'Lee', 'Nguyen'
  ];
  
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  
  return {
    firstName,
    lastName,
    email,
    password: 'password123' // Standard password for all test accounts
  };
}

// Create doctors
function addDoctors(count) {
  console.log(`Adding ${count} doctor accounts...`);
  
  const specialties = [
    'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology',
    'Ophthalmology', 'Oncology', 'Gastroenterology', 'Urology', 'Psychiatry'
  ];
  
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, password, role, firstName, lastName, specialty)
    VALUES (@email, @password, 'doctor', @firstName, @lastName, @specialty)
  `);
  
  for (let i = 0; i < count; i++) {
    const userData = generateRandomData();
    userData.specialty = specialties[Math.floor(Math.random() * specialties.length)];
    
    try {
      const result = insertUser.run(userData);
      if (result.changes > 0) {
        console.log(`Added doctor: ${userData.firstName} ${userData.lastName} (${userData.email})`);
      } else {
        console.log(`Skipped duplicate doctor: ${userData.email}`);
      }
    } catch (error) {
      console.error(`Error adding doctor ${userData.email}:`, error.message);
    }
  }
}

// Create nurses
function addNurses(count) {
  console.log(`Adding ${count} nurse accounts...`);
  
  const departments = [
    'Emergency', 'ICU', 'Surgery', 'Pediatrics', 'Maternity',
    'Oncology', 'Cardiology', 'Neurology', 'Geriatrics', 'Outpatient'
  ];
  
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, password, role, firstName, lastName, department)
    VALUES (@email, @password, 'nurse', @firstName, @lastName, @department)
  `);
  
  for (let i = 0; i < count; i++) {
    const userData = generateRandomData();
    userData.department = departments[Math.floor(Math.random() * departments.length)];
    
    try {
      const result = insertUser.run(userData);
      if (result.changes > 0) {
        console.log(`Added nurse: ${userData.firstName} ${userData.lastName} (${userData.email})`);
      } else {
        console.log(`Skipped duplicate nurse: ${userData.email}`);
      }
    } catch (error) {
      console.error(`Error adding nurse ${userData.email}:`, error.message);
    }
  }
}

// Create admins
function addAdmins(count) {
  console.log(`Adding ${count} admin accounts...`);
  
  const positions = [
    'Hospital Director', 'IT Administrator', 'HR Manager', 'Operations Manager',
    'Financial Manager', 'Security Manager', 'Compliance Officer'
  ];
  
  const insertUser = db.prepare(`
    INSERT OR IGNORE INTO users (email, password, role, firstName, lastName, position)
    VALUES (@email, @password, 'admin', @firstName, @lastName, @position)
  `);
  
  for (let i = 0; i < count; i++) {
    const userData = generateRandomData();
    userData.position = positions[Math.floor(Math.random() * positions.length)];
    
    try {
      const result = insertUser.run(userData);
      if (result.changes > 0) {
        console.log(`Added admin: ${userData.firstName} ${userData.lastName} (${userData.email})`);
      } else {
        console.log(`Skipped duplicate admin: ${userData.email}`);
      }
    } catch (error) {
      console.error(`Error adding admin ${userData.email}:`, error.message);
    }
  }
}

// Make sure the database schema has the necessary columns
function updateDatabaseSchema() {
  // Add specialty column for doctors if it doesn't exist
  try {
    db.exec(`ALTER TABLE users ADD COLUMN specialty TEXT`);
    console.log('Added specialty column');
  } catch (error) {
    // Column likely already exists
  }
  
  // Add department column for nurses if it doesn't exist
  try {
    db.exec(`ALTER TABLE users ADD COLUMN department TEXT`);
    console.log('Added department column');
  } catch (error) {
    // Column likely already exists
  }
  
  // Add position column for admins if it doesn't exist
  try {
    db.exec(`ALTER TABLE users ADD COLUMN position TEXT`);
    console.log('Added position column');
  } catch (error) {
    // Column likely already exists
  }
}

// Main execution
try {
  console.log('Updating database schema...');
  updateDatabaseSchema();
  
  // Add accounts for each role
  addDoctors(8); // 8 doctor accounts
  addNurses(8);  // 8 nurse accounts
  addAdmins(4);  // 4 admin accounts (fewer admins needed typically)
  
  console.log('Successfully added test accounts to the database!');
} catch (error) {
  console.error('Error adding test accounts:', error);
} finally {
  // Close the database connection
  db.close();
} 