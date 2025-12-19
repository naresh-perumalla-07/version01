const axios = require('axios');

async function testRegister() {
    try {
        console.log("Testing Registration...");
        const payload = {
            name: "Test User Auto",
            email: "testauto" + Date.now() + "@test.com",
            password: "password123",
            phone: "1234567890",
            city: "Hyderabad",
            role: "donor",
            bloodGroup: "O+",
            age: 25,
            gender: "male",
            height: 175,
            weight: 70,
            latitude: 17.385,
            longitude: 78.486,
            address: {
                street: "123 Test St",
                state: "Telangana",
                pincode: "500001",
                zip: "500001"
            }
        };

        const res = await axios.post('http://localhost:5000/api/auth/register', payload);
        console.log("✅ SUCCESS:", res.data);
    } catch (err) {
        console.error("❌ FAILED:", err.response ? err.response.data : err.message);
    }
}

testRegister();
