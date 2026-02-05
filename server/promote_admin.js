import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './src/models/User.js';

dotenv.config({ path: './.env' });

const promoteToAdmin = async (email) => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
    if (user) {
      console.log(`User ${email} promoted to admin`);
    } else {
      console.log(`User ${email} not found`);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

const email = process.argv[2];
if (!email) {
  console.log('Please provide an email');
  process.exit(1);
}

promoteToAdmin(email);
