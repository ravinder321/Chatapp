const ws = new WebSocket('ws://localhost:3000'); // Connect to WebSocket server
let username = ""; // Store the user's name
const colors = {}; // Store user colors

// WebSocket connection success
ws.onopen = () => console.log('Connected to WebSocket server');

// Receiving messages from the server
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log("Received data:", data);

    if (data.type === "message") {
        // Generate a color for each user if not already assigned
        if (!colors[data.username]) {
            colors[data.username] = getRandomColor();
        }

        // Display messages with username on top
        const li = document.createElement('li');
        
        // Check if this is the current user's message
        if (data.username === username) {
            li.className = 'self-message';
            li.innerHTML = `${data.content}`;
        } else {
            li.innerHTML = `<span class="username" style="color:${colors[data.username]}">${data.username}</span>${data.content}`;
        }
        
        const messagesContainer = document.getElementById('messages');
        messagesContainer.appendChild(li);
        
        // Auto-scroll to the newest message
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } 
    else if (data.type === "users") {
        // Display active users
        const usersList = document.getElementById('usersList');
        usersList.innerHTML = ""; // Clear previous list
        
        data.users.forEach(user => {
            if (!colors[user]) {
                colors[user] = getRandomColor();
            }
            
            const li = document.createElement('li');
            const initials = user.charAt(0).toUpperCase();
            li.innerHTML = `
                <div class="user-icon" style="background-color: ${colors[user]}">
                    ${initials}
                </div>
                ${user}
            `;
            usersList.appendChild(li);
        });
    }
};

// Generate a random color
function getRandomColor() {
    const hue = Math.floor(Math.random() * 360);
    return `hsl(${hue}, 70%, 60%)`;
}

// WebSocket closed
ws.onclose = () => console.log('Disconnected from server');

// Set user name and notify server
function setUsername() {
    const input = document.getElementById('nameInput');
    if (input.value.trim() !== '') {
        username = input.value.trim();
        input.disabled = true;
        
        document.getElementById('messageInput').disabled = false;
        document.getElementById('sendButton').disabled = false;
        document.getElementById('welcomeMessage').innerText = `Welcome, ${username}!`;

        // Send username to server
        ws.send(JSON.stringify({ type: "newUser", name: username }));
    } else {
        alert('Please enter your name');
    }
}

// Send message with username
function sendMessage() {
    const input = document.getElementById('messageInput');
    if (input.value.trim() !== '') {
        ws.send(JSON.stringify({ 
            type: "message", 
            username: username, 
            content: input.value 
        }));
        input.value = '';
    }
}

// Send message on "Enter" key press
function handleKeyPress(event) {
    if (event.key === "Enter") {
        sendMessage();
    }
}