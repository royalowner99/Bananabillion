// Quick test script to verify server setup
require('dotenv').config();

console.log('🔍 Testing Server Configuration...\n');

// Check environment variables
const requiredVars = [
  'MONGODB_URI',
  'BOT_TOKEN',
  'BOT_USERNAME',
  'WEBAPP_URL',
  'JWT_SECRET'
];

let allGood = true;

console.log('📋 Environment Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (!value) {
    console.log(`❌ ${varName}: MISSING`);
    allGood = false;
  } else if (value.includes('your-app') || value.includes('change_this')) {
    console.log(`⚠️  ${varName}: NEEDS UPDATE (${value.substring(0, 30)}...)`);
    allGood = false;
  } else {
    console.log(`✅ ${varName}: Set (${value.substring(0, 30)}...)`);
  }
});

console.log('\n🔗 Testing MongoDB Connection...');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected Successfully');
    console.log(`   Database: ${mongoose.connection.name}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    
    // Test creating a simple query
    return mongoose.connection.db.admin().ping();
  })
  .then(() => {
    console.log('✅ MongoDB Ping Successful');
    
    if (allGood) {
      console.log('\n🎉 All checks passed! Server is ready to deploy.');
    } else {
      console.log('\n⚠️  Some configuration needs attention. Check above.');
    }
    
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ MongoDB Connection Failed:', error.message);
    console.log('\n💡 Tips:');
    console.log('   - Check if MONGODB_URI is correct');
    console.log('   - Verify MongoDB Atlas allows connections from your IP');
    console.log('   - Make sure password is URL encoded (@ becomes %40)');
    process.exit(1);
  });
