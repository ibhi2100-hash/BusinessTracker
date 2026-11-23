
// src/app/server.ts

// Load environment variables before application modules initialize.
import "dotenv/config";

import express, {
    type Request,
    type Response,
} from "express";

import http from "node:http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

// ------------------------------------------
// BUSINESS ROUTES
// ------------------------------------------

import employeeInvitationRouter from
    "../routes/employee-invitation.route.js";

import authRoutes from
    "../routes/auth.route.js";

// ------------------------------------------
// BUSINESS COMPOSITION
// ------------------------------------------

import {
    BusinessComposer,
} from "../Composer/BusinessComposer.js";

// ------------------------------------------
// PLATFORM COMPOSITION
// ------------------------------------------

import {
    PlatformComposer,
} from "../Composer/PlatformComposer.js";

import {
    PlatformJwtService,
} from "../modules/platform/identity/services/platform-jwt.service.js";

// ------------------------------------------
// WORKERS
// ------------------------------------------

import {
    InvitationDeliveryWorker,
} from "../modules/employeeInvitations/worker/InvitationDeliveryWorker.js";

// ------------------------------------------
// DATABASE
// ------------------------------------------

import {
    prisma,
} from "../infrastructure/postgresql/prismaClient.js";

// ------------------------------------------
// CONFIGURATION
// ------------------------------------------

const PORT = Number(process.env.PORT ?? 2100);

const FRONTEND_URL =
    process.env.FRONTEND_URL ?? "http://localhost:3000";

const WORKER_SHUTDOWN_TIMEOUT = 15_000;

// ------------------------------------------
// SERVER
// ------------------------------------------

async function startServer(): Promise<void> {

    // ------------------------------------------
    // EXPRESS APPLICATION
    // ------------------------------------------

    const app = express();

    const server = http.createServer(app);

    // ------------------------------------------
    // RUNTIME STATE
    // ------------------------------------------

    let shuttingDown = false;

    let projectionRunning = false;

    let invitationDeliveryRunning = false;

    let projectionInterval:
        ReturnType<typeof setInterval> | undefined;

    let invitationDeliveryInterval:
        ReturnType<typeof setInterval> | undefined;

    // ------------------------------------------
    // GLOBAL MIDDLEWARE
    // ------------------------------------------

    app.use(
        cors({
            origin: FRONTEND_URL,
            credentials: true,
        })
    );

    app.use(
        express.json({
            limit: "1mb",
        })
    );

    app.use(cookieParser());

    // ------------------------------------------
    // HEALTH CHECKS
    // ------------------------------------------

    app.get(
        "/",
        (_req: Request, res: Response) => {
            res.status(200).json({
                success: true,
                service: "BizTru Backend",
                status: "running",
                timestamp: new Date().toISOString(),
            });
        }
    );

    app.get(
        "/health",
        (_req: Request, res: Response) => {
            res.status(200).json({
                success: true,
                status: "healthy",
                timestamp: new Date().toISOString(),
            });
        }
    );

    // ------------------------------------------
    // SOCKET.IO
    // ------------------------------------------

    const io = new Server(server, {
        cors: {
            origin: FRONTEND_URL,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    // Preserve compatibility with existing modules.
    (
        globalThis as typeof globalThis & {
            io?: Server;
        }
    ).io = io;

    io.on("connection", (socket) => {

        console.log(
            "[SOCKET] Client connected:",
            socket.id
        );

        socket.on(
            "joinBranch",
            (branchId: string) => {

                if (
                    typeof branchId !== "string" ||
                    branchId.trim().length === 0
                ) {
                    return;
                }

                socket.join(branchId);

                console.log(
                    `[SOCKET] Client ${socket.id} joined branch ${branchId}`
                );
            }
        );

        socket.on("disconnect", (reason) => {

            console.log(
                `[SOCKET] Client ${socket.id} disconnected: ${reason}`
            );
        });
    });

    // ------------------------------------------
    // BUSINESS COMPOSITION
    // ------------------------------------------

    console.log("[BOOT] Initializing Business Module...");

    const businessComposer = new BusinessComposer();

    const businessModule =
        await businessComposer.boot();

    console.log("[BOOT] Business Module initialized");

    // ------------------------------------------
    // PLATFORM COMPOSITION
    // ------------------------------------------

    console.log("[BOOT] Initializing Platform Control Plane...");

    // One JWT service instance for both issuance and verification.
    const platformJwtService = new PlatformJwtService();

    const platformComposer = new PlatformComposer({
        jwtService: platformJwtService,
    });

    const platformModule =
        await platformComposer.boot();

    console.log("[BOOT] Platform Control Plane initialized");

    // ------------------------------------------
    // WORKERS
    // ------------------------------------------

    const invitationDeliveryWorker =
        new InvitationDeliveryWorker();

    // ------------------------------------------
    // BUSINESS ROUTES
    // ------------------------------------------

    app.use(
        "/auth",
        authRoutes
    );

    app.use(
        "/sync",
        businessModule.router
    );

    app.use(
        "/employee-invitations",
        employeeInvitationRouter
    );

    // ------------------------------------------
    // PLATFORM CONTROL PLANE ROUTES
    // ------------------------------------------

    app.use(
        "/platform/identity",
        platformModule.router.identity
    );

    app.use(
        "/platform/audit",
        platformModule.router.audit
    );

    app.use(
        "/platform/tenants",
        platformModule.router.tenant
    );

    app.use(
        "/platform/analytics",
        platformModule.router.analytics
    );
    //--------------------------------------------
    // BILLING SYSTEMS
    //--------------------------------------------

    app.use(
        "/platform/billing",
        platformModule.router.plans
    );

    // ------------------------------------------
    // NOT FOUND
    // ------------------------------------------

    app.use(
        (_req: Request, res: Response) => {
            res.status(404).json({
                success: false,
                message: "Route not found",
            });
        }
    );

    // ------------------------------------------
    // BACKGROUND WORKER: PROJECTIONS
    // ------------------------------------------

    async function runProjectionWorker(): Promise<void> {

        if (shuttingDown || projectionRunning) {
            return;
        }

        projectionRunning = true;

        try {

            await businessModule.projectionWorker.processPending();

        } catch (error) {

            console.error(
                "[PROJECTION WORKER] Processing failed:",
                error
            );

        } finally {

            projectionRunning = false;
        }
    }

    // ------------------------------------------
    // BACKGROUND WORKER: INVITATION DELIVERY
    // ------------------------------------------

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
                error
            );

        } finally {

            invitationDeliveryRunning = false;
        }
    }

    // ------------------------------------------
    // GRACEFUL SHUTDOWN
    // ------------------------------------------

    async function shutdown(signal: string): Promise<void> {

        if (shuttingDown) {
            return;
        }

        shuttingDown = true;

        console.log(
            `[SERVER] Received ${signal}. Starting graceful shutdown...`
        );

        // Stop scheduling new background jobs.
        if (projectionInterval) {
            clearInterval(projectionInterval);
        }

        if (invitationDeliveryInterval) {
            clearInterval(invitationDeliveryInterval);
        }

        // Force exit if shutdown takes too long.
        const forceExitTimer = setTimeout(() => {

            console.error(
                "[SERVER] Graceful shutdown timed out"
            );

            process.exit(1);

        }, WORKER_SHUTDOWN_TIMEOUT);

        forceExitTimer.unref();

        try {

            // Close Socket.IO and its attached HTTP server.
            await new Promise<void>((resolve, reject) => {

                io.close((error?: Error) => {

                    if (error) {
                        reject(error);
                    } else {
                        resolve();
                    }
                });
            });

            console.log("[SERVER] HTTP and Socket.IO closed");

        } catch (error) {

            console.error(
                "[SERVER] Socket.IO shutdown failed:",
                error
            );

            process.exitCode = 1;
        }

        try {

            // Wait for currently running workers to finish.
            while (
                projectionRunning ||
                invitationDeliveryRunning
            ) {
                await new Promise<void>((resolve) => {
                    setTimeout(resolve, 100);
                });
            }

            console.log("[SERVER] Background workers stopped");

        } catch (error) {

            console.error(
                "[SERVER] Worker shutdown failed:",
                error
            );

            process.exitCode = 1;
        }

        try {

            await prisma.$disconnect();

            console.log("[SERVER] Database disconnected");

        } catch (error) {

            console.error(
                "[SERVER] Database disconnect failed:",
                error
            );

            process.exitCode = 1;

        } finally {

            clearTimeout(forceExitTimer);
        }
    }

    // ------------------------------------------
    // PROCESS SIGNALS
    // ------------------------------------------

    process.once("SIGINT", () => {
        void shutdown("SIGINT");
    });

    process.once("SIGTERM", () => {
        void shutdown("SIGTERM");
    });

    // ------------------------------------------
    // START HTTP SERVER
    // ------------------------------------------

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

        server.listen(
            PORT,
            "0.0.0.0"
        );
    });

    console.log("------------------------------------------");

    console.log("[SERVER] BizTru Backend Started");

    console.log(`[SERVER] Port: ${PORT}`);

    console.log(`[SERVER] Frontend: ${FRONTEND_URL}`);

    console.log("[SERVER] Business Module: Ready");

    console.log("[SERVER] Platform Control Plane: Ready");

    console.log("------------------------------------------");

    // ------------------------------------------
    // START BACKGROUND WORKERS
    // ------------------------------------------

    projectionInterval = setInterval(() => {
        void runProjectionWorker();
    }, 10_000);

    invitationDeliveryInterval = setInterval(() => {
        void runInvitationDeliveryWorker();
    }, 5_000);

    // Process persisted work immediately.
    void runProjectionWorker();

    void runInvitationDeliveryWorker();

    console.log("[SERVER] Background workers scheduled");
}

// ------------------------------------------
// APPLICATION ENTRY POINT
// ------------------------------------------

startServer().catch(async (error: unknown) => {

    console.error(
        "[SERVER] Startup failed:",
        error
    );

    try {

        await prisma.$disconnect();

    } catch (disconnectError) {

        console.error(
            "[SERVER] Database cleanup failed:",
            disconnectError
        );
    }

    process.exitCode = 1;
});
