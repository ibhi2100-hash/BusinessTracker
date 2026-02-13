import type { Request, Response, NextFunction } from "express";

export function isAdminMiddleware(req: Request, res: Response, next: NextFunction) {
    const user = req.user; // Assuming req.user is populated by previous authentication middleware

    if(!user) return res.status(401).json({ message: "Unauthorized"});
    if(user.role !== 'ADMIN') {
        return res.status(403).json({ message: "Forbidden: Admins only"});
    }
    next(); // Proceed to the next middleware or route handler
}