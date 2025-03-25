import type { Request, Response } from "express";
import linkModel from "../models/linkModel";
// import type { AuthRequest } from "./contentController";
import { random } from "../utils/random";
import contentModel from "../models/contentModel";
import userModel from "../models/userModel";

export interface AuthRequest extends Request {
    userId?: string;
}

const share = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { share } = req.body;

        if (share) {
            let existingLink = await linkModel.findOne({ userId: req.userId });

            if (existingLink) {
                res.json({ hash: existingLink.hash });
                return;
            }

            const hash = random(10);
            await linkModel.create({ userId: req.userId, hash });

            res.json({ message: `/share/${hash}` });
            return;
        }

        await linkModel.deleteOne({ userId: req.userId });
        res.json({ message: "Link removed successfully" });
        return;

    } catch (error) {
        console.error("Error in share:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

const shareLink = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const hash  = req.params.shareLink;
        const link = await linkModel.findOne({ hash });

        if (!link) {
            res.status(404).json({ message: "Invalid share link" });
            return;
        }

        const [content, user] = await Promise.all([
            contentModel.find({ userId: link.userId }),
            userModel.findById(link.userId, "email")
        ]);

        if (!user) {
            res.status(404).json({ message: "User not found (unexpected error)" });
            return;
        }

        res.json({ username: user.email, content });

    } catch (error) {
        console.error("Error in shareLink:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export { share, shareLink };
