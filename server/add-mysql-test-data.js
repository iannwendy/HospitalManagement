const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

// Helper function to generate random data
function generateRandomData() {
  const firstNames = [
    'John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'Robert', 'Linda',
    'William', 'Maria', 'Richard', 'Susan', 'Thomas', 'Elizabeth', 'James'
  ];
  
  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis', 'Garcia',
    'Rodriguez', 'Wilson', 'Martinez', 'Anderson', 'Taylor', 'Thomas', 'Hernandez'
  ];
  
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
  const username = `${firstName.toLowerCase()}${lastName.toLowerCase()}${Math.floor(Math.random() * 100)}`;
  
  return {
    first_name: firstName,
    last_name: lastName,
    email,
    username,
    password: 'password123' // Standard password for all test accounts
  };
}

async function addTestData() {
  // Create a connection to the database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hospital_db',
    multipleStatements: true
  });

  try {
    console.log('Connected to the database.');
    
    // Add doctors with users
    console.log('Adding test doctors...');
    const specialties = [
      'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology',
      'Ophthalmology', 'Oncology', 'Gastroenterology', 'Urology', 'Psychiatry'
    ];
    
    for (let i = 0; i < 5; i++) {
      const doctorData = generateRandomData();
      const specialty = specialties[Math.floor(Math.random() * specialties.length)];
      
      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(doctorData.password, salt);
      
      // Insert user
      const [userResult] = await connection.execute(
        `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, 'doctor')`,
        [doctorData.username, doctorData.email, hashedPassword]
      );
      
      const userId = userResult.insertId;
      
      // Generate a license number
      const licenseNumber = `MD${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Insert doctor linked to user
      await connection.execute(
        `INSERT INTO doctors (user_id, first_name, last_name, specialty, license_number, phone, address) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId, 
          doctorData.first_name, 
          doctorData.last_name, 
          specialty, 
          licenseNumber,
          '555-123-4567',
          '123 Medical Center, City, State 12345'
        ]
      );
      
      console.log(`Added doctor: ${doctorData.first_name} ${doctorData.last_name} (${doctorData.email})`);
    }
    
    // Add patients
    console.log('Adding test patients...');
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
    
    for (let i = 0; i < 10; i++) {
      const patientData = generateRandomData();
      const birthDate = new Date(1970 + Math.floor(Math.random() * 40), 
                               Math.floor(Math.random() * 12), 
                               Math.floor(Math.random() * 28) + 1);
      const bloodType = bloodTypes[Math.floor(Math.random() * bloodTypes.length)];
      
      // Insert patient
      await connection.execute(
        `INSERT INTO patients (first_name, last_name, gender, date_of_birth, blood_type, phone, address, medical_history) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          patientData.first_name, 
          patientData.last_name, 
          Math.random() > 0.5 ? 'male' : 'female',
          birthDate.toISOString().split('T')[0],
          bloodType,
          '555-987-6543',
          '123 Main St, City, State 12345',
          'No significant medical history'
        ]
      );
      
      console.log(`Added patient: ${patientData.first_name} ${patientData.last_name}`);
    }
    
    // Add pharmacies
    console.log('Adding test pharmacies...');
    const pharmacies = [
      { name: 'City Pharmacy', address: '123 Main St, City, State 12345', phone: '555-123-4567' },
      { name: 'HealthPlus Pharmacy', address: '456 Oak Ave, Town, State 67890', phone: '555-987-6543' },
      { name: 'MediCare Pharmacy', address: '789 Pine Blvd, Village, State 45678', phone: '555-456-7890' }
    ];
    
    for (const pharmacy of pharmacies) {
      await connection.execute(
        `INSERT INTO pharmacies (name, address, phone) VALUES (?, ?, ?)`,
        [pharmacy.name, pharmacy.address, pharmacy.phone]
      );
      
      console.log(`Added pharmacy: ${pharmacy.name}`);
    }
    
    console.log('Test data added successfully!');
  } catch (error) {
    console.error('Error adding test data:', error);
  } finally {
    // Close the connection
    await connection.end();
    console.log('Database connection closed.');
  }
}

// Run the function
addTestData().catch(console.error); 