import express, { Request, Response } from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";

import authRoutes from "../routes/auth.route.js";
import subscriptionRoute from "../routes/subscription.route.js";
import { BusinessComposer } from "../Composer/BusinessComposer.js";

dotenv.config();

async function startServer() {

    const app = express();

    const server =
        http.createServer(app);

    const PORT =
        process.env.PORT || 2100;

    // --------------------
    // Middleware
    // --------------------

    app.use(
        cors({
            origin:
                process.env.FRONTEND_URL ||
                "http://localhost:3000",
            credentials: true,
        })
    );

    app.use(express.json());

    app.use(cookieParser());

    // --------------------
    // Test route
    // --------------------

    app.get(
        "/",
        (req: Request, res: Response) => {
            res.send(
                "Shop Backend is running"
            );
        }
    );

    // --------------------
    // Socket.IO
    // --------------------

    const io =
        new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"],
            },
        });

    (global as any).io = io;

    io.on("connection", (socket) => {

        console.log(
            "Client connected:",
            socket.id
        );

        socket.on(
            "joinBranch",
            (branchId: string) => {

                socket.join(branchId);

                console.log(
                    `Socket ${socket.id} joined branch ${branchId}`
                );
            }
        );

        socket.on(
            "disconnect",
            () => {
                console.log(
                    "Client disconnected:",
                    socket.id
                );
            }
        );
    });

    // --------------------
    // Application Composition
    // --------------------

    const businessComposer =
        new BusinessComposer();

    const sync =
        await businessComposer.boot();

    // --------------------
    // Routes
    // --------------------

    app.use(
        "/auth",
        authRoutes
    );

    app.use(
        "/subscription",
        subscriptionRoute
    );

    app.use(
        "/sync",
        sync.router
    );

        setInterval(
            async () => {

                try {

                    console.log(
                        "[PROJECTION WORKER] Processing pending events..."
                    );

                    await sync
                        .projectionWorker
                        .processPending();

                    console.log(
                        "[PROJECTION WORKER] Done processing pending events."
                    );
                    

                } catch (error) {

                    console.error(
                        "[PROJECTION WORKER]",
                        error
                    );
                }

            },
            10000
        );
    // --------------------
    // Start server
    // --------------------

    server.listen(
        PORT,
        () => {
            console.log(
                `Server running at http://localhost:${PORT}`
            );
        }
    );
}

startServer().catch((error) => {

    console.error(
        "Failed to start server:",
        error
    );

    process.exit(1);
});