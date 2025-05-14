import express, { Request, Response } from 'express';
import cors from 'cors';
import { PORT } from './config/env';
import { connectDB } from './config/db';
import itemRoutes from './routes/itemRoutes';
import freelancerRoutes from './routes/freelancerRoutes';
import userRoutes from './routes/userRoutes';

// Initialize express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/items', itemRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/users', userRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 