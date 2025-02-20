import type { Request, Response } from "express";
import { z } from "zod";
import contentModel from "../models/contentModel";
import mongoose from "mongoose";

export interface AuthRequest extends Request {
      userId?: string;
}

const uploadContent = async (req: AuthRequest, res: Response): Promise<any> => {
    const requiredBody = z.object({
        link: z.string().url({ message: 'Invalid url' }),
        type: z.enum(['images', 'video', 'article', 'audio']),
        title: z.string().min(1, { message: 'Title is required' }),
        tags: z.array(z.string()).optional(),
    });

    const parseDataWithSuccess = requiredBody.safeParse(req.body);
    console.log(parseDataWithSuccess);

    if (!parseDataWithSuccess.success) {
        return res.status(400).json({
            message: 'Incorrect format',
            errors: parseDataWithSuccess.error.errors
        });
    }

    const { link, type, title, tags } = parseDataWithSuccess.data;
    try {
        
       
        const content = new contentModel({
            link,
            type,
            title,
            tags: [], // Convert tags to ObjectId
            userId: req.userId
        });

        await content.save();
        return res.status(200).json({ message: 'Content saved successfully' });
    } catch (error : any) {
        return res.status(500).json({ message: error.message || 'An error occurred' });
    }
};

const getContent = async(req :AuthRequest , res : Response) : Promise<any>=> {
     const userId = req.userId;
     try {
           const content = contentModel.find({
               userId : userId
           }).populate( "userId","email")

           res.json({content})
     }
     catch(error){
          return res.status(400).json({message : "Some error occured"})
     }
};

const deleteContent = async(req:AuthRequest,res:Response) : Promise<any>=> {
     const contentId = req.body.contentId;
     
     await contentModel.deleteOne({
           contentId,
           userId : req.userId
     })

     res.json({
           message : 'Deleted'
     })
};

export { uploadContent, getContent, deleteContent };

