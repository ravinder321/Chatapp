const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.static(__dirname));

let activeUsers = new Set(); // Store active users
const userConnections = new Map(); // Map usernames to connections

// WebSocket connection event
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Listen for messages
    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            console.log('Received data:', data);

            if (data.type === "newUser") {
                // Store username with this connection
                ws.username = data.name;
                activeUsers.add(data.name);
                userConnections.set(data.name, ws);
                
                console.log(`New user connected: ${data.name}`);
                console.log('Current users:', Array.from(activeUsers));
                
                // Update user list for all clients
                broadcastUsers();
            } 
            else if (data.type === "message") {
                console.log(`Message from ${data.username}: ${data.content}`);
                
                // Broadcast the message to all clients
                broadcast({ 
                    type: "message", 
                    username: data.username, 
                    content: data.content 
                });
            }
        } catch (error) {
            console.error('Error processing message:', error);
        }
    });

    ws.on('close', () => {
        if (ws.username) {
            console.log(`User disconnected: ${ws.username}`);
            activeUsers.delete(ws.username);
            userConnections.delete(ws.username);
            broadcastUsers();
        } else {
            console.log('Unknown client disconnected');
        }
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });
});

// Broadcast message to all clients
function broadcast(data) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
}

// Broadcast active users list
function broadcastUsers() {
    const usersArray = Array.from(activeUsers);
    console.log('Broadcasting users list:', usersArray);
    broadcast({ type: "users", users: usersArray });
}

// Error handling for server
server.on('error', (error) => {
    console.error('Server error:', error);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running at https://chatapp-idho.onrender.com/`);
});