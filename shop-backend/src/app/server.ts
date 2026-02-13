import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import cookieParser from 'cookie-parser'


import authRoutes from '../routes/auth.route.js';
import productsRoutes from '../routes/products.route.js';
import salesRoutes from '../routes/sales.route.js';
import assetRoutes from '../routes/asset.route.js';
import liabilityRoutes from '../routes/liability.route.js';
import reportRoutes from '../routes/report.route.js';
import onboadingtRoute from '../routes/onboarding.route.js'
import businessBranchesRoute  from '../routes/business.route.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2100;

// ✅ CORS MUST COME BEFORE ROUTES
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser())

app.get('/', (req: Request, res: Response) => {
  res.send('Shop Backend is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboadingtRoute)
app.use('/api/business', businessBranchesRoute)
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/asset', assetRoutes);
app.use('/api/liability', liabilityRoutes);
app.use('/api/report', reportRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});