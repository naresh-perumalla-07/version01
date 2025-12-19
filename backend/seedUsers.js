const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const users = [
  // DONORS
  {
    name: "Aarav Sharma",
    email: "aarav@example.com",
    password: "password123",
    role: "donor",
    phone: "9876543210",
    city: "Hyderabad",
    age: 28,
    gender: "Male",
    bloodGroup: "O+",
    height: 175,
    weight: 70,
    address: { street: "Road No 1, Jubilee Hills", state: "Telangana", pincode: "500033" },
    latitude: 17.4326, longitude: 78.4071 // Jubilee Hills
  },
  {
    name: "Sneha Reddy",
    email: "sneha@example.com",
    password: "password123",
    role: "donor",
    phone: "9876543211",
    city: "Hyderabad",
    age: 24,
    gender: "Female",
    bloodGroup: "A+",
    height: 165,
    weight: 60,
    address: { street: "Madhapur Main Rd", state: "Telangana", pincode: "500081" },
    latitude: 17.4486, longitude: 78.3908 // Madhapur
  },
  {
    name: "Rohan Kumar",
    email: "rohan@example.com",
    password: "password123",
    role: "donor",
    phone: "9876543212",
    city: "Hyderabad",
    age: 30,
    gender: "Male",
    bloodGroup: "B-",
    height: 180,
    weight: 85,
    address: { street: "Gachibowli DLF", state: "Telangana", pincode: "500032" },
    latitude: 17.4401, longitude: 78.3489 // Gachibowli
  },
  {
    name: "Priya Singh",
    email: "priya@example.com",
    password: "password123",
    role: "donor",
    phone: "9876543213",
    city: "Hyderabad",
    age: 26,
    gender: "Female",
    bloodGroup: "AB+",
    height: 160,
    weight: 55,
    address: { street: "Kondapur X Roads", state: "Telangana", pincode: "500084" },
    latitude: 17.4622, longitude: 78.3568 // Kondapur
  },
  {
    name: "Vikram Raju",
    email: "vikram@example.com",
    password: "password123",
    role: "donor",
    phone: "9876543214",
    city: "Hyderabad",
    age: 35,
    gender: "Male",
    bloodGroup: "O-",
    height: 178,
    weight: 78,
    address: { street: "Kukatpally Housing Board", state: "Telangana", pincode: "500072" },
    latitude: 17.4933, longitude: 78.4017 // Kukatpally
  },

  // RECEIVERS / PERSONS
  {
    name: "Anjali Gupta",
    email: "anjali@example.com",
    password: "password123",
    role: "person",
    phone: "9876543220",
    city: "Hyderabad",
    age: 45,
    gender: "Female",
    bloodGroup: "B+",
    height: 162,
    weight: 68,
    address: { street: "Begumpet", state: "Telangana", pincode: "500016" },
    latitude: 17.4447, longitude: 78.4664 // Begumpet
  },
  {
    name: "Karan Mehta",
    email: "karan@example.com",
    password: "password123",
    role: "person",
    phone: "9876543221",
    city: "Hyderabad",
    age: 50,
    gender: "Male",
    bloodGroup: "A-",
    height: 170,
    weight: 75,
    address: { street: "Secunderabad Station Rd", state: "Telangana", pincode: "500003" },
    latitude: 17.4399, longitude: 78.4983 // Secunderabad
  },

  // HOSPITALS
  {
    name: "Apollo Jubilee",
    email: "apollo@example.com",
    password: "password123",
    role: "hospital",
    phone: "04023607777",
    city: "Hyderabad",
    address: { street: "Film Nagar", state: "Telangana", pincode: "500096" },
    latitude: 17.4156, longitude: 78.4124 // Film Nagar
  },
  {
    name: "Yashoda Hospital",
    email: "yashoda@example.com",
    password: "password123",
    role: "hospital",
    phone: "0404567890",
    city: "Hyderabad",
    address: { street: "Somajiguda", state: "Telangana", pincode: "500082" },
    latitude: 17.4228, longitude: 78.4629 // Somajiguda
  },
  {
    name: "Care Hospital",
    email: "care@example.com",
    password: "password123",
    role: "hospital",
    phone: "0401234567",
    city: "Hyderabad",
    address: { street: "Banjara Hills", state: "Telangana", pincode: "500034" },
    latitude: 17.4137, longitude: 78.4423 // Banjara Hills
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/blood-bridge");
    console.log("Connected to DB...");

    // Clear existing users but maybe keep admin if needed (skipping clear for safety in hackathon mode, or just create if not exists)
    // For "100% functional site" better to have clean data.
    await User.deleteMany({ email: { $in: users.map(u => u.email) } }); 
    console.log("Cleaned old seed users...");

    for (let u of users) {
      const user = new User(u);
      await user.save();
      console.log(`Created user: ${u.name} (${u.role})`);
    }

    console.log("Seeding Complete! 10 Demo Users Live.");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
