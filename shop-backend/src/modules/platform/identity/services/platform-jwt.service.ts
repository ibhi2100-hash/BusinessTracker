
import jwt, {
    type SignOptions,
} from "jsonwebtoken";

import type {
    PlatformAccessTokenIssuer,
} from "./platform-indentity.service.js";

export interface PlatformTokenVerifier {
    verify(token: string): Promise<{
        sub: string;
        sessionId: string;
    }>;
}

interface PlatformAccessTokenPayload {
    sub: string;
    sessionId: string;
}

export class PlatformJwtService
    implements PlatformAccessTokenIssuer, PlatformTokenVerifier {

    private readonly secret: string;

    private readonly issuer = "biztru-platform";

    private readonly audience = "biztru-platform-control-plane";

    constructor() {
        const secret =
            process.env.PLATFORM_ACCESS_TOKEN_SECRET;

        if (!secret || Buffer.byteLength(secret) < 32) {
            throw new Error(
                "PLATFORM_ACCESS_TOKEN_SECRET must contain at least 32 bytes"
            );
        }

        this.secret = secret;
    }

    // ------------------------------------------
    // ISSUE ACCESS TOKEN
    // ------------------------------------------

    async issue(
        payload: PlatformAccessTokenPayload
    ): Promise<string> {

        const options: SignOptions = {
            algorithm: "HS256",
            expiresIn: "15m",
            issuer: this.issuer,
            audience: this.audience,
        };

        return jwt.sign(
            {
                sessionId: payload.sessionId,
            },
            this.secret,
            {
                ...options,
                subject: payload.sub,
            }
        );
    }

    // ------------------------------------------
    // VERIFY ACCESS TOKEN
    // ------------------------------------------

    async verify(
        token: string
    ): Promise<{
        sub: string;
        sessionId: string;
    }> {

        const decoded = jwt.verify(
            token,
            this.secret,
            {
                algorithms: ["HS256"],
                issuer: this.issuer,
                audience: this.audience,
            }
        );

        if (
            typeof decoded === "string" ||
            typeof decoded.sub !== "string" ||
            typeof decoded.sessionId !== "string"
        ) {
            throw new Error(
                "Invalid platform access token payload"
            );
        }

        return {
            sub: decoded.sub,
            sessionId: decoded.sessionId,
        };
    }
}
