// src/app/server.ts

import express, { Request, Response } from "express";
import http from "node:http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import employeeInvitationRouter from "../routes/employee-invitation.route.js";
import authRoutes from "../routes/auth.route.js";
import subscriptionRoute from "../routes/subscription.route.js";

import { BusinessComposer } from "../Composer/BusinessComposer.js";

import { InvitationDeliveryWorker } from
  "../modules/employeeInvitations/worker/InvitationDeliveryWorker.js";

import { prisma } from
  "../infrastructure/postgresql/prismaClient.js";

// Load environment variables before starting the application.
dotenv.config();

const PORT = Number(process.env.PORT ?? 2100);
const FRONTEND_URL =
  process.env.FRONTEND_URL ?? "http://localhost:3000";

async function startServer(): Promise<void> {
  console.log("[SERVER] Starting BizTru backend...");

  const app = express();
  const server = http.createServer(app);

  let shuttingDown = false;
  let projectionRunning = false;
  let invitationDeliveryRunning = false;

  let projectionInterval:
    ReturnType<typeof setInterval> | undefined;

  let invitationDeliveryInterval:
    ReturnType<typeof setInterval> | undefined;

  // --------------------------------------------------
  // Middleware
  // --------------------------------------------------

  app.use(
    cors({
      origin: FRONTEND_URL,
      credentials: true,
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  // --------------------------------------------------
  // Health check
  // --------------------------------------------------

  app.get("/", (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      service: "BizTru Backend",
      status: "running",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  // --------------------------------------------------
  // Socket.IO
  // --------------------------------------------------

  const io = new Server(server, {
    cors: {
      origin: FRONTEND_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Keep compatibility with existing modules using global.io.
  (globalThis as typeof globalThis & { io?: Server }).io = io;

  io.on("connection", (socket) => {
    console.log("[SOCKET] Client connected:", socket.id);

    socket.on("joinBranch", (branchId: string) => {
      if (
        typeof branchId !== "string" ||
        branchId.trim().length === 0
      ) {
        return;
      }

      socket.join(branchId);
      console.log(
        `[SOCKET] Client ${socket.id} joined branch ${branchId}`,
      );
    });

    socket.on("disconnect", (reason) => {
      console.log(
        `[SOCKET] Client ${socket.id} disconnected: ${reason}`,
      );
    });
  });

  // --------------------------------------------------
  // Application composition
  // --------------------------------------------------

  console.log("[SERVER] Booting BusinessComposer...");

  const businessComposer = new BusinessComposer();
  const sync = await businessComposer.boot();

  console.log("[SERVER] BusinessComposer booted successfully");

  const invitationDeliveryWorker =
    new InvitationDeliveryWorker();

  // --------------------------------------------------
  // Routes
  // --------------------------------------------------

  app.use("/auth", authRoutes);
  app.use("/subscription", subscriptionRoute);
  app.use("/sync", sync.router);

  app.use(
    "/employee-invitations",
    employeeInvitationRouter,
  );

  // --------------------------------------------------
  // Background worker runners
  // --------------------------------------------------

  async function runProjectionWorker(): Promise<void> {
    if (shuttingDown || projectionRunning) {
      return;
    }

    projectionRunning = true;

    try {
      await sync.projectionWorker.processPending();
    } catch (error) {
      console.error(
        "[PROJECTION WORKER] Processing failed:",
        error,
      );
    } finally {
      projectionRunning = false;
    }
  }

  async function runInvitationDeliveryWorker(): Promise<void> {
    if (shuttingDown || invitationDeliveryRunning) {
      return;
    }

    invitationDeliveryRunning = true;

    try {
      await invitationDeliveryWorker.processPending();
    } catch (error) {
      console.error(
        "[INVITATION DELIVERY WORKER] Processing failed:",
        error,
      );
    } finally {
      invitationDeliveryRunning = false;
    }
  }

  // --------------------------------------------------
  // Graceful shutdown
  // --------------------------------------------------

  async function shutdown(signal: string): Promise<void> {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;

    console.log(
      `[SERVER] Received ${signal}; shutting down...`,
    );

    if (projectionInterval) {
      clearInterval(projectionInterval);
    }

    if (invitationDeliveryInterval) {
      clearInterval(invitationDeliveryInterval);
    }

    const forceExitTimer = setTimeout(() => {
      console.error(
        "[SERVER] Graceful shutdown timed out; forcing exit",
      );
      process.exit(1);
    }, 15_000);

    forceExitTimer.unref();

    try {
      // Socket.IO closes its attached HTTP server as well.
      await new Promise<void>((resolve, reject) => {
        io.close((error?: Error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });

      console.log("[SERVER] Socket.IO and HTTP server closed");
    } catch (error) {
      console.error("[SERVER] Error closing HTTP server:", error);
    }

    try {
      await prisma.$disconnect();
      console.log("[SERVER] Database disconnected");
    } catch (error) {
      console.error("[SERVER] Database disconnect failed:", error);
      process.exitCode = 1;
    } finally {
      clearTimeout(forceExitTimer);
    }
  }

  process.once("SIGINT", () => {
    void shutdown("SIGINT");
  });

  process.once("SIGTERM", () => {
    void shutdown("SIGTERM");
  });

  // --------------------------------------------------
  // Start HTTP server
  // --------------------------------------------------

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off("listening", onListening);
      reject(error);
    };

    const onListening = () => {
      server.off("error", onError);
      resolve();
    };

    server.once("error", onError);
    server.once("listening", onListening);

    server.listen(PORT);
  });

  console.log(
    `[SERVER] BizTru backend listening at http://localhost:${PORT}`,
  );

  console.log(
    `[SERVER] Frontend origin configured as ${FRONTEND_URL}`,
  );

  // --------------------------------------------------
  // Start background processing
  // --------------------------------------------------

  // Start polling after HTTP is listening so that a worker
  // failure does not prevent the API from becoming available.
  projectionInterval = setInterval(() => {
    void runProjectionWorker();
  }, 10_000);

  invitationDeliveryInterval = setInterval(() => {
    void runInvitationDeliveryWorker();
  }, 5_000);

  // Process already-persisted work immediately.
  void runProjectionWorker();
  void runInvitationDeliveryWorker();

  console.log("[SERVER] Background workers scheduled");
}

// --------------------------------------------------
// Application entry point
// --------------------------------------------------

startServer().catch(async (error: unknown) => {
  console.error("[SERVER] Startup failed:", error);

  try {
    await prisma.$disconnect();
  } catch (disconnectError) {
    console.error(
      "[SERVER] Database cleanup failed:",
      disconnectError,
    );
  }

  process.exitCode = 1;
});