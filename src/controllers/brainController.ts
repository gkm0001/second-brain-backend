import type { Request, Response } from "express";
import linkModel from "../models/linkModel";
import type { AuthRequest } from "./contentController";
import { random } from "../utils/utils";
import contentModel from "../models/contentModel";
import userModel from "../models/userModel";

const share = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const { share } = req.body;

        if (share) {
            let existingLink = await linkModel.findOne({ userId: req.userId });

            if (existingLink) {
                return res.json({ hash: existingLink.hash });
            }

            const hash = random(10);
            await linkModel.create({ userId: req.userId, hash });

            return res.json({ message: `/share/${hash}` });
        }

        await linkModel.deleteOne({ userId: req.userId });
        return res.json({ message: "Link removed successfully" });

    } catch (error) {
        console.error("Error in share:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

const shareLink = async (req: AuthRequest, res: Response): Promise<Response> => {
    try {
        const hash  = req.params.shareLink;
        const link = await linkModel.findOne({ hash });

        if (!link) {
            return res.status(404).json({ message: "Invalid share link" });
        }

        const [content, user] = await Promise.all([
            contentModel.find({ userId: link.userId }),
            userModel.findById(link.userId, "email")
        ]);

        if (!user) {
            return res.status(404).json({ message: "User not found (unexpected error)" });
        }

        return res.json({ username: user.email, content });

    } catch (error) {
        console.error("Error in shareLink:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export { share, shareLink };
