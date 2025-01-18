require('dotenv').config();

const express = require('express');
const { pool , checkConnection} = require('./config/config');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const multer = require('multer');



// Initialize express app
const app = express();
const upload = multer({ dest: 'uploads/' });

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:3001',
    credentials: true,
  })
);
app.get('/favicon.ico', (req, res) => res.status(204).end()); // Ignore favicon requests


// Use routes
app.use("/api", require("./controllers/authController"));
app.use("/api", require("./controllers/contactController"));
app.use("/api", require("./controllers/groupsController"));
app.use("/api", require("./templateRoutes/templateRoutes"));
app.use("/api", require("./controllers/sendEmailController"));

// Set the server to listen on a specific port
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);

    try {
        await checkConnection();
    } catch (error) {
        console.log("Failed to initialize database", error);
    }
});
