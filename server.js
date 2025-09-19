// Import required libraries
const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

// Define the server and port
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3000;

// Path to the file where we will store data
const DB_PATH = path.join(__dirname, 'data.json');

// --- Admin Configuration ---
const ADMIN_USER_ID = 'turko'; // The user with this ID will be the admin

// --- Initial Data and Data Management ---
let appData = {};

function loadData() {
    try {
        if (fs.existsSync(DB_PATH)) {
            const fileContent = fs.readFileSync(DB_PATH, 'utf8');
            appData = JSON.parse(fileContent);
            console.log('Data successfully loaded from data.json.');
        } else {
            // If the file doesn't exist, create initial data
            appData = {
                rooms: {
                    'buta': { name: 'BUTA - Room', bookings: [] },
                    'garabagh': { name: 'GARABAGH - Room', bookings: [] },
                    'khalcha': { name: 'KHALCHA - Room', bookings: [] },
                    'khazar': { name: 'KHAZAR - Room', bookings: [] },
                    'mugham': { name: 'MUGHAM - Room', bookings: [] }
                }
            };
            saveData();
            console.log('Initial data created and saved to data.json.');
        }
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

function saveData() {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(appData, null, 2));
    } catch (error) {
        console.error('Error saving data:', error);
    }
}

// --- Real-time Connection (WebSocket) ---
function broadcastUpdate() {
    const dataString = JSON.stringify({ type: 'update', payload: appData });
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(dataString);
        }
    });
    console.log('Update broadcasted to all clients.');
}

wss.on('connection', (ws) => {
    console.log('A new client connected.');
    // Immediately send the current data to the connecting client
    ws.send(JSON.stringify({ type: 'initial', payload: appData }));

    // When a message is received from a client...
    ws.on('message', (message) => {
        try {
            const { type, payload } = JSON.parse(message);
            console.log(`Message received from client: ${type}`);
            let room, booking, bookingIndex;

            // Perform an operation based on the message type
            switch (type) {
                case 'addBooking':
                    appData.rooms[payload.roomId].bookings.push(payload.booking);
                    break;

                case 'deleteBooking':
                    room = appData.rooms[payload.roomId];
                    booking = room.bookings.find(b => b.id === payload.bookingId);
                    // Check: If the user is an admin OR has entered the correct PIN
                    if (booking && (payload.userId === ADMIN_USER_ID || payload.pin === booking.pin)) {
                        room.bookings = room.bookings.filter(b => b.id !== payload.bookingId);
                        console.log(`Booking deleted by admin (${payload.userId}) or owner: ${payload.bookingId}`);
                    } else {
                        console.log(`Permission denied to delete booking: ${payload.bookingId}`);
                        return;
                    }
                    break;

                case 'endMeeting':
                    room = appData.rooms[payload.roomId];
                    bookingIndex = room.bookings.findIndex(b => b.id === payload.bookingId);
                    booking = room.bookings[bookingIndex];
                    // Check: If the user is an admin OR has entered the correct PIN
                    if (booking && (payload.userId === ADMIN_USER_ID || payload.pin === booking.pin)) {
                        room.bookings[bookingIndex].endTime = new Date().toISOString();
                        console.log(`Meeting ended by admin (${payload.userId}) or owner: ${payload.bookingId}`);
                    } else {
                         console.log(`Permission denied to end meeting: ${payload.bookingId}`);
                         return;
                    }
                    break;
            }
            
            saveData(); // Write the change to the file
            broadcastUpdate(); // Send the updated data to all clients
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => console.log('A client disconnected.'));
});

// --- Serving Static Files ---
// Define the directory where index.html is located
app.use(express.static(path.join(__dirname)));

// Start the server
server.listen(PORT, () => {
    loadData(); // Load data before starting the server
    console.log(`Server is running on http://localhost:${PORT}`);
});

