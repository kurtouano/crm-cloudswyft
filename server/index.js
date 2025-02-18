import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import AuthRoute from './routes/AuthRoute.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json()); 

// restrict to specific origins
app.use(
  cors({
    origin: "http://localhost:3000", // Allow only this frontend
    methods: ["GET", "POST"], // Allow only specific HTTP methods
    credentials: true, // Allow cookies/session authentication
  })
);

app.use("/server/auth", AuthRoute);

mongoose
  .connect(process.env.MONGO)
  .then(() =>{
    console.log('Connected to MongoDB');
})
  .catch((err) => {
    console.log('Error connecting to MongoDB', err);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => 
  console.log(`Server running on http://localhost:${PORT}/`)
);

app.get('/', (req, res) => {
  res.send('BACKEND IS WORKING');
});