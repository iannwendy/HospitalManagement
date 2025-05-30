const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

class DatabaseManager {
  constructor() {
    if (DatabaseManager.instance) {
      return DatabaseManager.instance;
    }
    
    this.initializeConnection();
    DatabaseManager.instance = this;
  }
  
  async initializeConnection() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'hospital_db',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
      
      // Test connection
      const connection = await this.pool.getConnection();
      console.log('Connected to MySQL database');
      connection.release();
      
      // Initialize tables
      await this.initializeTables();
      await this.addTestUsers();
      await this.addSamplePrescriptions();
      
    } catch (error) {
      console.error('Failed to connect to MySQL:', error);
      process.exit(1);
    }
  }
  
  async getConnection() {
    return await this.pool.getConnection();
  }
  
  async query(sql, params = []) {
    try {
      console.log('Executing SQL:', sql);
      console.log('With parameters:', params);
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (err) {
      console.error('Error executing query:', err);
      
      // Enhanced error logging for connectivity issues
      if (err.code === 'ECONNREFUSED') {
        console.error('Cannot connect to MySQL server. Please check if MySQL is running.');
      } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
        console.error('Access denied to MySQL. Check username and password.');
      } else if (err.code === 'ER_BAD_DB_ERROR') {
        console.error('Database does not exist. Check database name.');
      }
      
      throw err;
    }
  }
  
  async initializeTables() {
    try {
      // Users table
      await this.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) NOT NULL,
          first_name VARCHAR(50),
          last_name VARCHAR(50),
          date_of_birth DATE,
          gender VARCHAR(10),
          phone VARCHAR(20),
          address TEXT,
          insurance VARCHAR(100),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Prescriptions table
      await this.query(`
        CREATE TABLE IF NOT EXISTS prescriptions (
          id INT AUTO_INCREMENT PRIMARY KEY,
          patient_id INT NOT NULL,
          doctor_id INT NOT NULL,
          prescription_date DATE NOT NULL,
          instructions TEXT,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (patient_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (doctor_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);

      // Medications table
      await this.query(`
        CREATE TABLE IF NOT EXISTS medications (
          id INT AUTO_INCREMENT PRIMARY KEY,
          prescription_id INT NOT NULL,
          name VARCHAR(100) NOT NULL,
          dosage VARCHAR(50) NOT NULL,
          frequency VARCHAR(50) NOT NULL,
          duration VARCHAR(50) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE
        )
      `);

      // Pharmacies table
      await this.query(`
        CREATE TABLE IF NOT EXISTS pharmacies (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(100) NOT NULL,
          address TEXT NOT NULL,
          phone VARCHAR(20) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Prescription_pharmacy table
      await this.query(`
        CREATE TABLE IF NOT EXISTS prescription_pharmacy (
          id INT AUTO_INCREMENT PRIMARY KEY,
          prescription_id INT NOT NULL,
          pharmacy_id INT NOT NULL,
          sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          status VARCHAR(20) DEFAULT 'sent',
          FOREIGN KEY (prescription_id) REFERENCES prescriptions(id) ON DELETE CASCADE,
          FOREIGN KEY (pharmacy_id) REFERENCES pharmacies(id) ON DELETE CASCADE
        )
      `);
      
      // Add any necessary indexes
      try {
        await this.query(`CREATE INDEX idx_prescriptions_patient_id ON prescriptions(patient_id)`);
      } catch (error) {
        if (error.code !== 'ER_DUP_KEYNAME') throw error;
      }
      
      try {
        await this.query(`CREATE INDEX idx_prescriptions_doctor_id ON prescriptions(doctor_id)`);
      } catch (error) {
        if (error.code !== 'ER_DUP_KEYNAME') throw error;
      }
      
      try {
        await this.query(`CREATE INDEX idx_medications_prescription_id ON medications(prescription_id)`);
      } catch (error) {
        if (error.code !== 'ER_DUP_KEYNAME') throw error;
      }
      
      // Add sample pharmacies
      await this.addSamplePharmacies();
      
      console.log('Database tables initialized');
    } catch (error) {
      console.error('Error initializing tables:', error);
      throw error;
    }
  }
  
  async addSamplePharmacies() {
    try {
      const count = await this.query('SELECT COUNT(*) as count FROM pharmacies');
      
      if (count[0].count === 0) {
        const pharmacies = [
          { name: 'City Pharmacy', address: '123 Main St, City, State 12345', phone: '555-123-4567' },
          { name: 'HealthPlus Pharmacy', address: '456 Oak Ave, Town, State 67890', phone: '555-987-6543' },
          { name: 'MediCare Pharmacy', address: '789 Pine Blvd, Village, State 45678', phone: '555-456-7890' }
        ];
        
        for (const pharmacy of pharmacies) {
          await this.query(
            'INSERT INTO pharmacies (name, address, phone) VALUES (?, ?, ?)',
            [pharmacy.name, pharmacy.address, pharmacy.phone]
          );
        }
        
        console.log('Sample pharmacies added');
      }
    } catch (error) {
      console.error('Error adding sample pharmacies:', error);
    }
  }
  
  async addTestUsers() {
    try {
      // Basic test accounts
      const testAccounts = [
        { 
          email: 'patient@test.com', 
          password: 'password123', 
          role: 'patient', 
          firstName: 'Test', 
          lastName: 'Patient',
          phone: '(123) 456-7890',
          dateOfBirth: '1990-01-01',
          gender: 'Male',
          address: '123 Main St, New York, NY',
          insurance: 'ABC Insurance #12345'
        },
        { 
          email: 'doctor@test.com', 
          password: 'password123', 
          role: 'doctor', 
          firstName: 'Test', 
          lastName: 'Doctor',
          phone: '(555) 123-4567',
          dateOfBirth: '1975-06-20',
          gender: 'Female',
          address: '789 Medical Center Blvd, New York, NY',
          insurance: 'N/A'
        },
        { 
          email: 'nurse@test.com', 
          password: 'password123', 
          role: 'nurse', 
          firstName: 'Test', 
          lastName: 'Nurse',
          phone: '(555) 987-6543',
          dateOfBirth: '1980-03-15',
          gender: 'Female', 
          address: '789 Medical Center Blvd, New York, NY',
          insurance: 'N/A'
        },
        { 
          email: 'admin@test.com', 
          password: 'password123', 
          role: 'admin', 
          firstName: 'Test', 
          lastName: 'Admin',
          phone: '(555) 789-0123',
          dateOfBirth: '1982-11-30',
          gender: 'Male',
          address: '789 Medical Center Blvd, New York, NY',
          insurance: 'N/A'
        },
        { 
          email: 'john@example.com', 
          password: 'password123', 
          role: 'patient', 
          firstName: 'John', 
          lastName: 'Doe',
          phone: '(987) 654-3210',
          dateOfBirth: '1985-05-15',
          gender: 'Male',
          address: '456 Oak Street, Boston, MA',
          insurance: 'XYZ Healthcare #67890'
        }
      ];
      
      for (const user of testAccounts) {
        // Check if user exists
        const existing = await this.query('SELECT id FROM users WHERE email = ?', [user.email]);
        
        if (existing.length === 0) {
          await this.query(`
            INSERT INTO users 
            (email, password, role, first_name, last_name, phone, date_of_birth, gender, address, insurance)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              user.email, 
              user.password, 
              user.role, 
              user.firstName, 
              user.lastName, 
              user.phone, 
              user.dateOfBirth, 
              user.gender, 
              user.address, 
              user.insurance
            ]
          );
        }
      }
      
      console.log('Test users initialized');
    } catch (error) {
      console.error('Error adding test users:', error);
    }
  }
  
  async addSamplePrescriptions() {
    try {
      const count = await this.query('SELECT COUNT(*) as count FROM prescriptions');
      
      if (count[0].count === 0) {
        console.log('Adding sample prescriptions...');
        
        // Get a patient and doctor user for the prescription
        const patients = await this.query("SELECT id FROM users WHERE role = 'patient' LIMIT 1");
        const doctors = await this.query("SELECT id FROM users WHERE role = 'doctor' LIMIT 1");
        
        if (patients.length === 0 || doctors.length === 0) {
          console.log('Cannot add sample prescriptions: no patients or doctors found');
          return;
        }
        
        const patientId = patients[0].id;
        const doctorId = doctors[0].id;
        const today = new Date().toISOString().split('T')[0];
        
        // Insert sample prescription
        const result = await this.query(`
          INSERT INTO prescriptions (
            patient_id, doctor_id, prescription_date, instructions, status
          ) VALUES (?, ?, ?, ?, ?)`,
          [patientId, doctorId, today, 'Take with food', 'active']
        );
        
        const prescriptionId = result.insertId;
        
        // Insert medications
        const medications = [
          { name: 'Amoxicillin', dosage: '500mg', frequency: 'Three times daily', duration: '10 days' },
          { name: 'Ibuprofen', dosage: '200mg', frequency: 'As needed for pain', duration: '5 days' }
        ];
        
        for (const med of medications) {
          await this.query(`
            INSERT INTO medications (prescription_id, name, dosage, frequency, duration)
            VALUES (?, ?, ?, ?, ?)`,
            [prescriptionId, med.name, med.dosage, med.frequency, med.duration]
          );
        }
        
        console.log('Sample prescriptions added');
      }
    } catch (error) {
      console.error('Error adding sample prescriptions:', error);
    }
  }
  
  // Close database connection
  async close() {
    if (this.pool) {
      await this.pool.end();
      console.log('Database connection closed');
    }
  }
}

module.exports = new DatabaseManager(); 