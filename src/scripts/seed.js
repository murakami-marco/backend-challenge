require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');

const dummyUsers = [
  {
    email: 'admin@example.com',
    password: 'password123', // Will be hashed by model pre-save hook
  },
  {
    email: 'user@test.io',
    password: 'securePassword789',
  },
];

const dummyOrganizations = [
  {
    name: 'TechFlow Solutions',
    addresses: [
      {
        street: '101 Innovation Blvd',
        city: 'Palo Alto',
        state: 'CA',
        zip: '94301',
        country: 'USA',
      },
      {
        street: '42 Cloud Dr',
        city: 'Austin',
        state: 'TX',
        zip: '73301',
        country: 'USA',
      },
    ],
  },
  {
    name: 'GreenLeaf Organic',
    addresses: [
      {
        street: '55 Garden Way',
        city: 'Portland',
        state: 'OR',
        zip: '97201',
        country: 'USA',
      },
    ],
  },
  {
    name: 'Global Finance Corp',
    addresses: [
      {
        street: '88 Wall St',
        city: 'New York',
        state: 'NY',
        zip: '10005',
        country: 'USA',
      },
      {
        street: '12 Canary Wharf',
        city: 'London',
        state: 'Greater London',
        zip: 'E14 5AB',
        country: 'UK',
      },
    ],
  },
];

const seedData = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully.');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Organization.deleteMany({});
    console.log('Database cleared.');

    // Insert dummy users
    console.log('Inserting dummy users...');
    await User.create(dummyUsers);
    console.log(`Inserted ${dummyUsers.length} users.`);

    // Insert dummy organizations
    console.log('Inserting dummy organizations...');
    await Organization.create(dummyOrganizations);
    console.log(`Inserted ${dummyOrganizations.length} organizations.`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
