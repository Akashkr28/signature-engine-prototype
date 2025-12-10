import express from 'express';
import cors from 'cors';
import signRoute from './routes/sign.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Use the route
app.get('/', (req, res) => {
  res.send("SignStream Backend is Running!");
});

app.use('/', signRoute);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});