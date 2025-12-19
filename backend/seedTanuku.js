const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

// Center: Attili/Tanuku (16.6204, 80.7032)
const CENTER_LAT = 16.6204;
const CENTER_LNG = 80.7032;

// Helper to get random coord within ~5-20km
// 1 deg ~ 111km. 0.1 deg ~ 11km.
// We want offset between 0.05 (5km) and 0.2 (22km) roughly
const getRandomLocation = () => {
    const angle = Math.random() * Math.PI * 2;
    const distanceDeg = 0.04 + (Math.random() * 0.15); // 0.04deg(~4.5km) to 0.19deg(~21km)
    return {
        latitude: CENTER_LAT + (Math.cos(angle) * distanceDeg),
        longitude: CENTER_LNG + (Math.sin(angle) * distanceDeg)
    };
};

const users = [
  {
    name: "Ramesh Naidu",
    email: "ramesh@gmail.com",
    role: "donor",
    phone: "9000011111",
    city: "Tanuku",
    age: 28,
    gender: "male",
    bloodGroup: "A+",
    height: 175,
    weight: 72,
    address: { street: "3-112, near bus stand, Attili", state: "Andhra Pradesh", pincode: "534134", zip: "534134" },
    latitude: 16.6204, longitude: 80.7032, // Exact center
    isVerified: true, totalDonations: 2
  },
  {
    name: "Suresh Reddy",
    email: "suresh.reddy@gmail.com",
    role: "donor",
    phone: "9000011112",
    city: "Tanuku",
    age: 32,
    gender: "male",
    bloodGroup: "O+",
    height: 180,
    weight: 78,
    address: { street: "Main Road, Velpur", state: "Andhra Pradesh", pincode: "534222", zip: "534222" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 5
  },
  {
    name: "Lakshmi Devi",
    email: "lakshmi.d@gmail.com",
    role: "donor",
    phone: "9000011113",
    city: "Attili",
    age: 26,
    gender: "female",
    bloodGroup: "B+",
    height: 165,
    weight: 60,
    address: { street: "Temple Street, Attili", state: "Andhra Pradesh", pincode: "534134", zip: "534134" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 1
  },
  {
    name: "Venkatesh Rao",
    email: "venky.rao@gmail.com",
    role: "donor",
    phone: "9000011114",
    city: "Tanuku",
    age: 45,
    gender: "male",
    bloodGroup: "AB+",
    height: 172,
    weight: 80,
    address: { street: "RP Road, Tanuku", state: "Andhra Pradesh", pincode: "534211", zip: "534211" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 10
  },
  {
    name: "Priya Varma",
    email: "priya.varma@gmail.com",
    role: "donor",
    phone: "9000011115",
    city: "Undrajavaram",
    age: 24,
    gender: "female",
    bloodGroup: "A-",
    height: 160,
    weight: 55,
    address: { street: "Near School, Undrajavaram", state: "Andhra Pradesh", pincode: "534216", zip: "534216" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 0
  },
  {
    name: "Kiran Kumar",
    email: "kiran.k@gmail.com",
    role: "donor",
    phone: "9000011116",
    city: "Tanuku",
    age: 29,
    gender: "male",
    bloodGroup: "O-",
    height: 176,
    weight: 75,
    address: { street: "Housing Board, Tanuku", state: "Andhra Pradesh", pincode: "534211", zip: "534211" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 3
  },
  {
    name: "Anita Paul",
    email: "anita.paul@gmail.com",
    role: "person", // Receiver
    phone: "9000011117",
    city: "Peravali",
    age: 35,
    gender: "female",
    bloodGroup: "B-",
    height: 158,
    weight: 65,
    address: { street: "Market Road, Peravali", state: "Andhra Pradesh", pincode: "534330", zip: "534330" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 0, unitsNeeded: 2
  },
  {
    name: "Ravi Teja",
    email: "ravi.teja@gmail.com",
    role: "donor",
    phone: "9000011118",
    city: "Tanuku",
    age: 27,
    gender: "male",
    bloodGroup: "AB-",
    height: 170,
    weight: 68,
    address: { street: "Sajja Puram, Tanuku", state: "Andhra Pradesh", pincode: "534211", zip: "534211" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 1
  },
  {
    name: "Manoj Krishna",
    email: "manoj.k@gmail.com",
    role: "hospital",
    phone: "08819223344",
    city: "Tanuku",
    age: 40, // Hospital rep age
    gender: "male",
    bloodGroup: "O+", // Placeholder
    address: { street: "Government Hospital, Tanuku", state: "Andhra Pradesh", pincode: "534211", zip: "534211" },
    latitude: 16.75, longitude: 80.68, // Fixed nearby
    isVerified: true,
  },
  {
    name: "Swathi Chowdhary",
    email: "swathi.c@gmail.com",
    role: "donor",
    phone: "9000011120",
    city: "Penugonda",
    age: 23,
    gender: "female",
    bloodGroup: "A+",
    height: 162,
    weight: 58,
    address: { street: "Main Bazaar, Penugonda", state: "Andhra Pradesh", pincode: "534320", zip: "534320" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 0
  },
  {
    name: "Naveen Babu",
    email: "naveen.b@gmail.com",
    role: "donor",
    phone: "9000011121",
    city: "Tanuku",
    age: 31,
    gender: "male",
    bloodGroup: "B+",
    height: 174,
    weight: 76,
    address: { street: "Narendra Center, Tanuku", state: "Andhra Pradesh", pincode: "534211", zip: "534211" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 4
  },
  {
    name: "Divya Sri",
    email: "divya.sri@gmail.com",
    role: "person",
    phone: "9000011122",
    city: "Attili",
    age: 50,
    gender: "female",
    bloodGroup: "O+",
    height: 155,
    weight: 70,
    address: { street: "Near Railway Station, Attili", state: "Andhra Pradesh", pincode: "534134", zip: "534134" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 0, unitsNeeded: 1
  }
];

const seedDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/blood-bridge";
    await mongoose.connect(dbURI);
    console.log("Connected to DB...");

    // Remove users with these emails if they exist to avoid dupes, or clear all? 
    // User said "i want 12 data", implies replacing or adding.
    // Safest is to remove collision emails
    const emails = users.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });
    console.log("Cleaned conflicting users...");

    for (let u of users) {
      // Must set password manually since it's not in the object above but User model requires it
      // User provided hashed password in example: "$2a$10$hashedpassword"
      // BUT our User model 'pre save' hook might hash it AGAIN if we just set u.password to that string.
      // If we provide a plain text password, it gets hashed.
      // If we provide an already hashed one, we need to bypass the hook or just set password field directly?
      // Actually, usually we seed with PLAIN TEXT "password123" and let the hook hash it.
      // The user provided example JSON has "password": "$2a$10$hashedpassword".
      // If I want to match the requirement exactly, I should set it.
      // BUT if the system logs in by hashing input and comparing, I need to know the PLAINTEXT of that hash to login.
      // I don't know the plaintext of "$2a$10$hashedpassword".
      // So I will use "password123" for all users so they can actually login, 
      // but I will respect the structure.
      
      const user = new User({
         ...u,
         password: "password123"
      });
      await user.save();
      console.log(`Created user: ${u.name} (${u.role}) at ${u.latitude.toFixed(4)}, ${u.longitude.toFixed(4)}`);
    }

    console.log("Seeding Complete! 12 Tanuku Users Live.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
