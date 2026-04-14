const express = require('express');
const session = require('express-session');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: 'cybersecret',
    resave: false,
    saveUninitialized: true
}));

// In-memory user storage
let users = [];

// ROUTES

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', async (req, res) => {
    const user = users.find(u => u.username === req.body.username);
    if (user && await bcrypt.compare(req.body.password, user.password)) {
        req.session.user = user;
        res.redirect('/dashboard');
    } else {
        res.send("Invalid login");
    }
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', async (req, res) => {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    users.push({
        username: req.body.username,
        password: hashedPassword
    });
    res.redirect('/login');
});

app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    res.render('dashboard');
});

// SIMULATED CYBER ATTACK DATA
function randomAttack() {
    const locations = [
        { lat: 40.7128, lng: -74.0060 }, // NYC
        { lat: 51.5074, lng: -0.1278 },  // London
        { lat: 35.6895, lng: 139.6917 }, // Tokyo
        { lat: 48.8566, lng: 2.3522 },   // Paris
        { lat: 37.7749, lng: -122.4194 } // SF
    ];

    const random = locations[Math.floor(Math.random() * locations.length)];

    return {
        ...random,
        time: new Date().toLocaleTimeString()
    };
}

// SEND ATTACKS EVERY 2 SECONDS
io.on('connection', (socket) => {
    setInterval(() => {
        socket.emit('attack', randomAttack());
    }, 2000);
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
}); 
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
