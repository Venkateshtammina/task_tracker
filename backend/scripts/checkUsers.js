require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const users = await User.find({});
    console.log('\nUsers in database:');
    users.forEach(user => {
      console.log({
        email: user.email,
        emailType: typeof user.email,
        name: user.name,
        country: user.country,
        id: user._id
      });
    });

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkUsers(); 