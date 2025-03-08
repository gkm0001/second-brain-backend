import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import contentModel, { contentTypes } from "../models/contentModel";


export interface AuthRequest extends Request {
      userId?: string;
}

const uploadContent = async (req: AuthRequest, res: Response): Promise<void> => {

    console.log(req.body);

    const requiredBody = z.object({
        link: z.string().url({ message: 'Invalid url' }),
        type: z.enum(contentTypes),
        title: z.string().min(1, { message: 'Title is required' }),
        tags: z.array(z.string()).optional(),
    });

    const parseDataWithSuccess = requiredBody.safeParse(req.body);
    console.log(parseDataWithSuccess);

    if (!parseDataWithSuccess.success) {
         res.status(400).json({
            message: 'Incorrect format',
            errors: parseDataWithSuccess.error.errors
        });
        return;
    }

    const { link, type, title, tags } = parseDataWithSuccess.data;
    // console.log({link , type , title});
    try {
        
        const content = new contentModel({
            link,
            type,
            title,
            tags: [], // Convert tags to ObjectId
            userId: req.userId
        });

        await content.save();
         res.status(200).json({ message: 'Content saved successfully' });
         return;
    } catch (error : any) {
         res.status(500).json({ message: error.message || 'An error occurred' });
        return;
    }
};

const getContent = async(req :AuthRequest , res : Response) : Promise<void>=> {
     const userId = req.userId;
     console.log("ehllo");
     console.log(userId);
     
     
     try {
           const content =await contentModel.find({
               userId : userId
           }).populate("userId","email")
    
           res.json({content})
     }
     catch(error: any){
           res.status(400).json({message : error.message || "Some error occured"})
           return;
     }
};

const deleteContent = async(req:AuthRequest,res:Response) : Promise<void>=> {
     const contentId = req.body.contentId;
     
     await contentModel.deleteOne({
           contentId,
           userId : req.userId
     })

     res.json({
           message : 'Deleted'
     })
     return;
};

export { uploadContent, getContent, deleteContent };

