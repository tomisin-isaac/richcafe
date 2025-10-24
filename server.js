const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); // For generating unique temporary IDs
const axios = require('axios'); // For making HTTP requests to Termii

// --- Termii API Configuration ---
// IMPORTANT: Replace with your actual Termii API Key and Sender ID
const TERMI_API_KEY = 'TLAgoBUmVifuvICyLbqaAfkIYkAKmHRdShwRZpQIFMxRrirwFYHergAsUVZTuC'; // e.g., "sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
const TERMI_SENDER_ID = 'N-ALERT'; // Or whatever your active Sender ID is

// Termii SMS API Base URL
const TERMI_SMS_URL = 'https://api.ng.termii.com/api/sms/send';
// --- End Termii Config ---


const app = express();
const PORT = process.env.PORT || 3000;

// --- Mock Database (In-memory array for demonstration) ---
const registeredUsers = []; // Stores permanently registered users
const pendingRegistrations = {}; // Stores temporary data for users awaiting OTP verification

// --- Hardcoded Admin User (FOR DEVELOPMENT ONLY) ---
const hardcodedAdmins = [
    {
        username: 'admin',
        email: 'admin@richcafe.com',
        password: 'admin_password123' // In a real app, hash this password!
    },
    // You can add more admin users here for testing different roles if needed
    // { username: 'manager', email: 'manager@richcafe.com', password: 'manager_pass' }
];
// --- End Hardcoded Admin User ---

// Middleware
app.use(cors()); // Allow requests from your frontend
app.use(bodyParser.json()); // Parse JSON request bodies

// Helper to generate a 6-digit OTP
function generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit number
}

// Authentication endpoint for both Login and Initiation of Registration
app.post('/auth', async (req, res) => {
    const { phone, email, name } = req.body;
    console.log('Backend (/auth): Received request body:', req.body);

    // Basic validation
    if (!phone || !email || !name) {
        console.error('Backend (/auth): Missing required fields.');
        return res.status(400).json({ message: 'All fields are required.' });
    }

    // --- Check if user exists (Login scenario) ---
    const existingUser = registeredUsers.find(user =>
        (user.phone === phone || user.email === email)
    );

    if (existingUser) {
        console.log(`Backend (/auth): User ${existingUser.name} (Email: ${email}) logged in.`);
        return res.status(200).json({
            status: 'login_success',
            message: 'Login successful! Welcome back.',
            user: existingUser
        });
    }

    // --- User does not exist (New Registration - Initiate OTP) ---

    // Prevent re-registration attempts if email/phone is already in pending queue
    const pendingUserByEmail = Object.values(pendingRegistrations).find(
        p => p.email === email || p.phone === phone
    );

    if (pendingUserByEmail) {
        // If a pending registration for this user already exists, just resend/re-log the OTP
        const otp = generateOtp();
        pendingUserByEmail.otp = otp; // Update OTP
        pendingUserByEmail.timestamp = Date.now(); // Reset timestamp for expiry

        try {
            // --- Termii Send SMS for Resend in /auth ---
            const termiiResponse = await axios.post(TERMI_SMS_URL, {
                api_key: TERMI_API_KEY,
                to: phone, // Phone number in E.164 format from frontend
                from: TERMI_SENDER_ID, // Your Termii Sender ID
                sms: `Your new verification code is: ${otp}`,
                type: 'plain',
                channel: 'dnd' // 'dnd' often works better for verification codes
            });

            console.log(`Backend (/auth): SMS RESENT (Termii Response: ${termiiResponse.data.message}) to ${phone}: ${otp}`);
            // --- End Termii SMS ---

            return res.status(200).json({
                status: 'otp_sent',
                message: 'A new code has been sent to your phone number.',
                tempId: pendingUserByEmail.tempId // Send back the existing tempId
            });
        } catch (error) {
            console.error(`Backend (/auth): Error sending Termii SMS for resend: ${error.message}`);
            // Log Termii's specific error response if available
            if (error.response) {
                console.error('Termii Error Details:', error.response.data);
            }
            return res.status(500).json({ message: 'Failed to resend SMS code.' });
        }
    }


    // Check if email or phone number is already registered (fully)
    const emailRegistered = registeredUsers.some(user => user.email === email);
    if (emailRegistered) {
        console.error(`Backend (/auth): Email ${email} already fully registered.`);
        return res.status(409).json({ message: 'Email already registered. Please login.' });
    }

    const phoneRegistered = registeredUsers.some(user => user.phone === phone);
    if (phoneRegistered) {
        console.error(`Backend (/auth): Phone number ${phone} already fully registered.`);
        return res.status(409).json({ message: 'Phone number already registered. Please login.' });
    }

    // Generate OTP for new user
    const otp = generateOtp();
    const tempId = uuidv4(); // Unique ID for this pending registration

    // Store pending user data and OTP
    pendingRegistrations[tempId] = {
        phone,
        email,
        name,
        otp,
        timestamp: Date.now() // For OTP expiry (e.g., valid for 5 minutes)
    };

    try {
        // --- Termii Send SMS for New Registration ---
        const termiiResponse = await axios.post(TERMI_SMS_URL, {
            api_key: TERMI_API_KEY,
            to: phone, // Phone number in E.164 format from frontend
            from: TERMI_SENDER_ID, // Your Termii Sender ID
            sms: `Your verification code for food ordering is: ${otp}`,
            type: 'plain',
            channel: 'dnd' // 'dnd' often works better for verification codes
        });

        console.log(`Backend (/auth): SMS SENT (Termii Response: ${termiiResponse.data.message}) to ${phone}: ${otp}`);
        console.log('Backend (/auth): Current Pending Registrations:', pendingRegistrations);
        // --- End Termii SMS ---

        // Respond to frontend to tell it to go to OTP verification page
        res.status(200).json({
            status: 'otp_sent',
            message: 'A 6-digit code has been sent to your phone number.',
            tempId: tempId
        });
    } catch (error) {
        console.error(`Backend (/auth): Error sending Termii SMS for new registration: ${error.message}`);
        // Log Termii's specific error response if available
        if (error.response) {
            console.error('Termii Error Details:', error.response.data);
        }
        return res.status(500).json({ message: 'Failed to send SMS code. Please try again.' });
    }
});

// Endpoint to verify OTP
app.post('/verify-otp', (req, res) => {
    console.log('Backend (/verify-otp): Received request. Body:', req.body);
    const { tempId, otp, phone } = req.body;

    if (!tempId || !otp || !phone) {
        console.error('Backend (/verify-otp): Error: Missing tempId, OTP, or phoneNumber.');
        return res.status(400).json({ message: 'Missing temporary ID, OTP, or phone number.' });
    }

    const pendingUser = pendingRegistrations[tempId];

    if (!pendingUser) {
        console.error(`Backend (/verify-otp): No pending registration found for tempId: ${tempId}.`);
        return res.status(404).json({ message: 'No pending registration found for this ID.' });
    }

    // Basic check for phone number consistency (optional but good for robustness)
    if (pendingUser.phone !== phone) {
        console.error(`Backend (/verify-otp): Phone number mismatch. Expected: ${pendingUser.phone}, Received: ${phone}`);
        return res.status(400).json({ message: 'Phone number mismatch for this verification request.' });
    }

    // Check OTP expiry (e.g., 5 minutes = 300000 milliseconds)
    const OTP_EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes
    if (Date.now() - pendingUser.timestamp > OTP_EXPIRY_TIME) {
        console.warn(`Backend (/verify-otp): OTP for tempId ${tempId} expired.`);
        delete pendingRegistrations[tempId]; // Remove expired OTP
        return res.status(400).json({ message: 'Code expired. Please request a new one.' });
    }

    console.log(`Backend (/verify-otp): Comparing received OTP '${otp}' with stored OTP '${pendingUser.otp}'`);
    if (pendingUser.otp === otp) {
        const newUser = {
            phone: pendingUser.phone,
            email: pendingUser.email,
            name: pendingUser.name,
        };
        registeredUsers.push(newUser);
        delete pendingRegistrations[tempId]; // Remove from pending
        console.log(`Backend (/verify-otp): User ${newUser.name} successfully registered and verified.`);
        console.log('Backend (/verify-otp): Current Registered Users:', registeredUsers);

        return res.status(200).json({
            status: 'registration_complete',
            message: 'Account verified and created! Welcome.',
            user: newUser
        });
    } else {
        console.error(`Backend (/verify-otp): Invalid OTP for tempId ${tempId}. Received: ${otp}, Expected: ${pendingUser.otp}`);
        return res.status(400).json({ message: 'Invalid code. Please try again.' });
    }
});

// Endpoint to resend OTP
app.post('/resend-otp', async (req, res) => {
    console.log('Backend (/resend-otp): Received request. Body:', req.body);
    const { phone, tempId } = req.body;

    if (!phone) {
        console.error('Backend (/resend-otp): Phone is required.');
        return res.status(400).json({ message: 'Phone is required to resend code.' });
    }

    let foundTempId = tempId;
    let pendingUser = pendingRegistrations[tempId];

    if (!pendingUser) {
        foundTempId = Object.keys(pendingRegistrations).find(key => pendingRegistrations[key].phone === phone);
        if (foundTempId) {
            pendingUser = pendingRegistrations[foundTempId];
        }
    }

    if (pendingUser) {
        const newOtp = generateOtp();
        pendingUser.otp = newOtp;
        pendingUser.timestamp = Date.now();

        try {
            // --- Termii Send SMS for Resend in /resend-otp ---
            const termiiResponse = await axios.post(TERMI_SMS_URL, {
                api_key: TERMI_API_KEY,
                to: phone, // Phone number in E.164 format from frontend
                from: TERMI_SENDER_ID, // Your Termii Sender ID
                sms: `Your new verification code is: ${newOtp}`,
                type: 'plain',
                channel: 'dnd' // 'dnd' often works better for verification codes
            });

            console.log(`Backend (/resend-otp): SMS RESENT (Termii Response: ${termiiResponse.data.message}) to ${phone}: ${newOtp}`);
            // --- End Termii SMS ---

            return res.status(200).json({ 
                message: 'New code sent to your phone number.', 
                tempId: foundTempId
            });
        } catch (error) {
                console.error(`Backend (/resend-otp): Error sending Termii SMS on resend: ${error.message}`);
            if (error.response) {
                console.error('Termii Error Details:', error.response.data);
            }
            return res.status(500).json({ message: 'Failed to resend SMS code.' });
        }
    } else {
        console.error(`Backend (/resend-otp): No pending registration found for phone number: ${phone}`);
        return res.status(404).json({ message: 'No pending registration found for this phone number.' });
    }
});


// --- NEW Admin Login Endpoint ---
app.post('/admin/login', (req, res) => {
    const { username, email, password } = req.body;
    console.log('Backend (/admin/login): Received admin login attempt:', { username, email });

    // Find if the provided credentials match any hardcoded admin
    const foundAdmin = hardcodedAdmins.find(admin =>
        admin.username === username &&
        admin.email === email &&
        admin.password === password
    );

    if (foundAdmin) {
        console.log(`Backend (/admin/login): Admin '${username}' logged in successfully.`);
        // For now, just send a success message. We'll add JWT/session handling later.
        res.status(200).json({ message: 'Admin login successful!', status: 'admin_login_success' });
    } else {
        console.error('Backend (/admin/login): Invalid admin credentials.');
        res.status(401).json({ message: 'Invalid username, email, or password.' });
    }
});
// --- End NEW Admin Login Endpoint ---


// --- Development-only endpoint to clear in-memory data ---
app.post('/reset-data', (req, res) => {
    registeredUsers.length = 0; // Clears the array
    for (const key in pendingRegistrations) {
        if (pendingRegistrations.hasOwnProperty(key)) {
            delete pendingRegistrations[key]; // Clears the object
        }
    }
    console.log('Backend (/reset-data): All registered users and pending registrations have been cleared.');
    res.status(200).json({ message: 'In-memory database cleared successfully.' });
});
// --- End new endpoint ---


// Basic route for the root URL
app.get('/', (req, res) => {
    res.send('Welcome to the authentication backend API with OTP!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log('User database (in-memory):', registeredUsers);
    console.log('Pending registrations (in-memory):', pendingRegistrations);
});