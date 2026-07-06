const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/weekly-reports';

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('\nMongoDB connection failed.');
    console.error('Recommended fix: use MongoDB Atlas (free, no install).');
    console.error('  1. https://www.mongodb.com/cloud/atlas/register');
    console.error('  2. Create cluster → Database user → Network Access (0.0.0.0/0)');
    console.error('  3. Set MONGODB_URI in backend/.env\n');
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
