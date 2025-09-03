
const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config({ path: './auth-service/.env' });

// Service URLs
const services = {
  'API Gateway': 'http://localhost:3000',
  'Auth Service': 'http://localhost:3001',
  'Course Service': 'http://localhost:3003',
};

async function checkServices() {
  console.log('🔍 StudyNotion Services Health Check\n');
  
  for (const [name, url] of Object.entries(services)) {
    try {
      const response = await axios.get(`${url}/health`, { timeout: 5000 });
      console.log(`✅ ${name}: ${response.data.status} (${response.status})`);
    } catch (error) {
      console.log(`❌ ${name}: ${error.code || 'UNREACHABLE'}`);
    }
  }
}

async function testDatabase() {
  console.log('\n🗄️  Database Connection Test\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/studynotion-auth');
    console.log('✅ MongoDB: Connected successfully');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    await mongoose.disconnect();
  } catch (error) {
    console.log(`❌ MongoDB: ${error.message}`);
  }
}

async function testEmailConfig() {
  console.log('\n📧 Email Configuration Test\n');
  
  const nodemailer = require('nodemailer');
  
  try {
    const transporter = nodemailer.createTransporter({
      host: process.env.MAIL_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
    
    await transporter.verify();
    console.log('✅ Email: Configuration is working');
  } catch (error) {
    console.log(`❌ Email: ${error.message}`);
  }
}

async function testRegistrationFlow() {
  console.log('\n🔐 Registration Flow Test\n');
  
  try {
    // Test OTP generation
    const otpResponse = await axios.post('http://localhost:3000/api/v1/auth/sendotp', {
      email: 'test@example.com',
    });
    
    if (otpResponse.data.success) {
      console.log('✅ OTP Generation: Working');
      console.log(`📱 Generated OTP: ${otpResponse.data.otp}`);
    }
  } catch (error) {
    console.log(`❌ OTP Generation: ${error.response?.data?.message || error.message}`);
  }
}

async function runDiagnostics() {
  await checkServices();
  await testDatabase();
  await testEmailConfig();
  await testRegistrationFlow();
  
  console.log('\n🔧 Next Steps:');
  console.log('1. Ensure all services are running');
  console.log('2. Check .env file in auth-service/');
  console.log('3. Verify MongoDB is running');
  console.log('4. Test email credentials');
  console.log('\n📖 See auth-service-env-setup.md for detailed setup');
}

runDiagnostics().catch(console.error);
