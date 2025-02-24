import type { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

interface AuthRequest extends Request {
    userId?: string;
}

const userAuth = async(req: AuthRequest, res: Response, next: NextFunction) : Promise<void>=> {
    try {
        const token = req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
             res.status(401).json({ message: "Token not found" });
            return ;
        }

        const JWT_SECRET = process.env.JWT_SECRET as Secret;
        if (!JWT_SECRET) {
            res.status(500).json({ message: "Server error: JWT_SECRET is not defined" });
            return;
        }

        const decoded =await jwt.verify(token as string, JWT_SECRET) ;

        if (typeof decoded === "string") {
            res.status(401).json({ message: "Invalid token" });
            return;
        }
        req.userId = (decoded as JwtPayload).userId;

        next();
    } catch (error: any) {
        console.error("JWT verification failed:", error);
        res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
        return;
    }
};

export default userAuth;
