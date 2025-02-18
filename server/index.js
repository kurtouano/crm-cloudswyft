import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const app = express();

mongoose
  .connect(process.env.MONGO)
  .then(() =>{
    console.log('Connected to MongoDB');
})
  .catch((err) => {
    console.log('Error connecting to MongoDB', err);
});

app.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});

app.get('/', (req, res) => {
  res.send('DASHBOARD');
});