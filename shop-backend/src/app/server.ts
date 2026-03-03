import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';

// Routes
import authRoutes from '../routes/auth.route.js';
import productsRoutes from '../routes/products.route.js';
import salesRoutes from '../routes/sales.route.js';
import assetRoutes from '../routes/asset.route.js';
import liabilityRoutes from '../routes/liability.route.js';
import reportRoutes from '../routes/report.route.js';
import onboardingRoute from '../routes/onboarding.route.js';
import businessBranchesRoute from '../routes/business.route.js';
import alertRoute from '../routes/alerts.route.js';
import cashFlowRoute from '../routes/cashflow.route.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 2100;

// --------------------
// Middleware
// --------------------
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// --------------------
// Test route
// --------------------
app.get('/', (req: Request, res: Response) => {
  res.send('Shop Backend is running');
});

// --------------------
// Socket.IO Setup
// --------------------
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ✅ Assign globally
(global as any).io = io;

// Handle client connections
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join branch room
  socket.on("joinBranch", (branchId: string) => {
    socket.join(branchId);
    console.log(`Socket ${socket.id} joined branch ${branchId}`);
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// --------------------
// Routes
// --------------------
app.use('/api/auth', authRoutes);
app.use('/api/onboarding', onboardingRoute);
app.use('/api/business', businessBranchesRoute);
app.use('/api/products', productsRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/asset', assetRoutes);
app.use('/api/liability', liabilityRoutes);
app.use('/api/report', reportRoutes);
app.use('/api/alerts', alertRoute);
app.use('/api/cashflow', cashFlowRoute)

// --------------------
// Start server
// --------------------
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});