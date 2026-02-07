/**
 * API Configuration
 * 
 * SETUP INSTRUCTIONS:
 * 
 * 1. For Android Emulator:
 *    - Set USE_PHYSICAL_DEVICE = false
 *    - Backend will automatically use http://10.0.2.2:5000/api
 * 
 * 2. For iOS Simulator:
 *    - Set USE_PHYSICAL_DEVICE = false
 *    - Backend will automatically use http://localhost:5000/api
 * 
 * 3. For Physical Device (Phone/Tablet):
 *    - Set USE_PHYSICAL_DEVICE = true
 *    - Find your computer's IP address:
 *      Windows: Open CMD and run 'ipconfig'
 *      Mac/Linux: Open Terminal and run 'ifconfig'
 *    - Replace PHYSICAL_DEVICE_IP with your computer's IP
 *    - Example: 'http://192.168.1.100:5000/api'
 * 
 * 4. Make sure your backend server is running on port 5000
 *    - Run: cd backend && npm start
 */

// SET THIS TO TRUE IF TESTING ON A PHYSICAL DEVICE
export const USE_PHYSICAL_DEVICE = true;

// REPLACE WITH YOUR COMPUTER'S IP ADDRESS (only used if USE_PHYSICAL_DEVICE = true)
// Your available IPs: 10.211.18.24, 192.168.56.1, 192.168.42.1, 192.168.157.1
// Use the IP from the same WiFi network as your phone
export const PHYSICAL_DEVICE_IP = 'http://10.211.18.24:5000/api';

// Backend port
export const BACKEND_PORT = 5000;

// API timeout (milliseconds)
export const API_TIMEOUT = 5000;
