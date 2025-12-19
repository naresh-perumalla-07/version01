const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

// Tanuku Coordinates
const CENTER_LAT = 16.7517;
const CENTER_LNG = 81.6766;

// Helper to get random coord within ~2-5km
const getRandomLocation = () => {
    const angle = Math.random() * Math.PI * 2;
    const distanceDeg = 0.01 + (Math.random() * 0.04); 
    return {
        latitude: CENTER_LAT + (Math.cos(angle) * distanceDeg),
        longitude: CENTER_LNG + (Math.sin(angle) * distanceDeg)
    };
};

const users = [
  {
    name: "Ramesh Naidu",
    email: "ramesh.n@gmail.com",
    role: "donor",
    phone: "9000088801",
    city: "Tanuku",
    age: 32,
    gender: "male",
    bloodGroup: "A+",
    height: 170,
    weight: 75,
    address: { street: "RP Road", state: "Andhra Pradesh", pincode: "534211", zip: "534211" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 4
  },
  {
    name: "Suresh Kumar",
    email: "suresh.k@gmail.com",
    role: "donor",
    phone: "9000088802",
    city: "Tanuku",
    age: 29,
    gender: "male",
    bloodGroup: "O+",
    height: 175,
    weight: 80,
    address: { street: "Velpur Road", state: "Andhra Pradesh", pincode: "534211", zip: "534211" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 2
  },
  {
    name: "Priya Darshini",
    email: "priya.d@gmail.com",
    role: "donor",
    phone: "9000088803",
    city: "Tanuku",
    age: 26,
    gender: "female",
    bloodGroup: "B+",
    height: 160,
    weight: 58,
    address: { street: "Narendra Center", state: "Andhra Pradesh", pincode: "534211", zip: "534211" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 0
  },
  {
    name: "Venkatesh",
    email: "venky@gmail.com",
    role: "donor",
    phone: "9000088804",
    city: "Tanuku",
    age: 35,
    gender: "male",
    bloodGroup: "AB+",
    height: 168,
    weight: 70,
    address: { street: "Sajjapuram", state: "Andhra Pradesh", pincode: "534211", zip: "534211" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 8
  },
  {
    name: "Kumari",
    email: "kumari@gmail.com",
    role: "donor",
    phone: "9000088805",
    city: "Tanuku",
    age: 24,
    gender: "female",
    bloodGroup: "A+",
    height: 155,
    weight: 50,
    address: { street: "Tetali", state: "Andhra Pradesh", pincode: "534211", zip: "534211" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 1
  }
];

const seedDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/blood-bridge";
    console.log("🔌 Seeding Target:", dbURI.split('@')[1] || dbURI);
    await mongoose.connect(dbURI);
    console.log("Connected to DB...");

    const emails = users.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });
    await User.deleteMany({ city: "Tanuku" }); // Clear old Tanuku
    console.log("Cleaned old users...");

    for (let u of users) {
      const user = new User({ ...u, password: "password123" });
      await user.save();
      console.log(`Created user: ${u.name} (${u.role}) in ${u.city}`);
    }

    console.log("Seeding Complete! 5 Tanuku Users Live.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
