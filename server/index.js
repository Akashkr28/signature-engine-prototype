import express from 'express';
import cors from 'cors';
import signRoutes from './routes/sign.js';

const app = express();
app.use(cors());
app.use(express.json());

// Use the route
app.use(signRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});