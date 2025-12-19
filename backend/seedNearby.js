const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

// Center: User's Location (Palakollu/Regional)
// Lat: 16.5117952, Lng: 80.642048
const CENTER_LAT = 16.5117952;
const CENTER_LNG = 80.642048;

// Helper to get random coord within ~2-15km
const getRandomLocation = () => {
    const angle = Math.random() * Math.PI * 2;
    // 0.02 deg ~ 2.2km, 0.13 deg ~ 14km
    const distanceDeg = 0.02 + (Math.random() * 0.11); 
    return {
        latitude: CENTER_LAT + (Math.cos(angle) * distanceDeg),
        longitude: CENTER_LNG + (Math.sin(angle) * distanceDeg)
    };
};

const users = [
  {
    name: "Chandra Sekhar",
    email: "chandra.s@gmail.com",
    role: "donor",
    phone: "9000022211",
    city: "Vijayawada",
    age: 29,
    gender: "male",
    bloodGroup: "A+",
    height: 172,
    weight: 75,
    address: { street: "Benz Circle", state: "Andhra Pradesh", pincode: "520010", zip: "520010" },
    latitude: CENTER_LAT + 0.01, longitude: CENTER_LNG + 0.01, // Very close (~1.5km)
    isVerified: true, totalDonations: 4
  },
  {
    name: "Nikhil Siddhartha",
    email: "nikhil.s@gmail.com",
    role: "donor",
    phone: "9000022212",
    city: "Gannavaram",
    age: 25,
    gender: "male",
    bloodGroup: "O+",
    height: 178,
    weight: 70,
    address: { street: "Airport Road", state: "Andhra Pradesh", pincode: "521101", zip: "521101" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 2
  },
  {
    name: "Anusha Shetty",
    email: "anusha.shetty@gmail.com",
    role: "donor",
    phone: "9000022213",
    city: "Vijayawada",
    age: 24,
    gender: "female",
    bloodGroup: "B+",
    height: 160,
    weight: 55,
    address: { street: "Moghalrajpuram", state: "Andhra Pradesh", pincode: "520010", zip: "520010" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 0
  },
  {
    name: "Sai Kumar",
    email: "sai.kumar@gmail.com",
    role: "donor",
    phone: "9000022214",
    city: "Mangalagiri",
    age: 30,
    gender: "male",
    bloodGroup: "AB+",
    height: 168,
    weight: 72,
    address: { street: "Near AIIMS", state: "Andhra Pradesh", pincode: "522503", zip: "522503" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 8
  },
  {
    name: "Deepa Reddy",
    email: "deepa.r@gmail.com",
    role: "donor",
    phone: "9000022215",
    city: "Vijayawada",
    age: 27,
    gender: "female",
    bloodGroup: "A-",
    height: 165,
    weight: 62,
    address: { street: "Patamata", state: "Andhra Pradesh", pincode: "520010", zip: "520010" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 1
  },
  {
    name: "Karthik Raju",
    email: "karthik.r@gmail.com",
    role: "donor",
    phone: "9000022216",
    city: "Vijayawada",
    age: 22,
    gender: "male",
    bloodGroup: "O-",
    height: 180,
    weight: 80,
    address: { street: "One Town", state: "Andhra Pradesh", pincode: "520001", zip: "520001" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 0
  },
  {
    name: "Manasa Vani",
    email: "manasa.v@gmail.com",
    role: "person",
    phone: "9000022217",
    city: "Vijayawada",
    age: 34,
    gender: "female",
    bloodGroup: "B-",
    height: 156,
    weight: 68,
    address: { street: "Gunadala", state: "Andhra Pradesh", pincode: "520004", zip: "520004" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 0, unitsNeeded: 1
  },
  {
    name: "Pavan Kalyan",
    email: "pavan.k@gmail.com",
    role: "donor",
    phone: "9000022218",
    city: "Tadepalli",
    age: 28,
    gender: "male",
    bloodGroup: "AB-",
    height: 175,
    weight: 74,
    address: { street: "Bypass Road", state: "Andhra Pradesh", pincode: "522501", zip: "522501" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 5
  },
  {
    name: "City General Hospital",
    email: "city.gen@gmail.com",
    role: "hospital",
    phone: "08662472345",
    city: "Vijayawada",
    age: 50,
    gender: "male",
    bloodGroup: "O+",
    address: { street: "Governorpet", state: "Andhra Pradesh", pincode: "520002", zip: "520002" },
    latitude: CENTER_LAT + 0.02, longitude: CENTER_LNG - 0.01,
    isVerified: true
  },
  {
    name: "Latha Sri",
    email: "latha.sri@gmail.com",
    role: "donor",
    phone: "9000022220",
    city: "Bhavanipuram",
    age: 23,
    gender: "female",
    bloodGroup: "A+",
    height: 162,
    weight: 56,
    address: { street: "Library Road", state: "Andhra Pradesh", pincode: "520012", zip: "520012" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 1
  },
  {
    name: "Raju Bhai",
    email: "raju.bhai@gmail.com",
    role: "donor",
    phone: "9000022221",
    city: "Ibrahimpatnam",
    age: 35,
    gender: "male",
    bloodGroup: "B+",
    height: 170,
    weight: 78,
    address: { street: "Ferry Road", state: "Andhra Pradesh", pincode: "521456", zip: "521456" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 15
  },
  {
    name: "Sandhya Rani",
    email: "sandhya.r@gmail.com",
    role: "person",
    phone: "9000022222",
    city: "Kankipadu",
    age: 40,
    gender: "female",
    bloodGroup: "O+",
    height: 158,
    weight: 72,
    address: { street: "Main Bazaar", state: "Andhra Pradesh", pincode: "521151", zip: "521151" },
    ...getRandomLocation(),
    isVerified: true, totalDonations: 0, unitsNeeded: 2
  }
];

const seedDB = async () => {
  try {
    const dbURI = process.env.MONGO_URI || process.env.MONGODB_URI || "mongodb://localhost:27017/blood-bridge";
    console.log("🔌 Seeding Target:", dbURI.split('@')[1] || dbURI); // Security mask
    await mongoose.connect(dbURI);
    console.log("Connected to DB...");

    // Remove users with these emails if they exist to avoid dupes
    const emails = users.map(u => u.email);
    await User.deleteMany({ email: { $in: emails } });
    
    // Also remove the old Tanuku users to clear the map for clarity
    await User.deleteMany({ city: "Tanuku" });
    await User.deleteMany({ city: "Attili" });
    console.log("Cleaned old/conflicting users...");

    for (let u of users) {
      const user = new User({
         ...u,
         password: "password123"
      });
      await user.save();
      console.log(`Created user: ${u.name} (${u.role}) at ${u.latitude.toFixed(4)}, ${u.longitude.toFixed(4)}`);
    }

    console.log("Seeding Complete! 12 Nearby Users Live.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
