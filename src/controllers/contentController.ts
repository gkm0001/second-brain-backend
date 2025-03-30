import type { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import contentModel, { contentTypes } from "../models/contentModel";
import { addTodo, getChatGptResponse, searchSimilarTodos } from "../utils/vectorEmbedding";


export interface AuthRequest extends Request {
      userId?: string;
}

const uploadContent = async (req: AuthRequest, res: Response): Promise<void> => {

    console.log(req.body);

    const requiredBody = z.object({
        link: z.string().optional(),
        type: z.enum(contentTypes).optional(),
        text : z.string().optional(),
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

    const { link, type, title, tags ,text} = parseDataWithSuccess.data;
    // console.log({link , type , title});
    try {
        
        const content = new contentModel({
            link,
            type,
            title,
            tags: [], // Convert tags to ObjectId
            text,
            userId: req.userId
        });

        await content.save();
        if (text) {
             // Corrected the syntax: now userId is passed inside an options object.
            await addTodo(text,  req.userId as string);  
        }
        
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

const searchAndQueryText = async(req : AuthRequest , res: Response) : Promise<void> => {
     const content = req.body.text;
     const userId = req.userId;
     try{
        const data=  await getChatGptResponse(content , userId as string);
         res.status(200).json({message : data})
         return ;

     }catch(error){
        res.status(401).json({message : error})
        return ;
     }
}

const deleteContent = async(req:AuthRequest,res:Response) : Promise<void>=> {
     const contentId = req.body.contentId;
     console.log("hi",contentId);

     try {
        await contentModel.deleteOne({
            _id : contentId,
            userId : req.userId
      })
        res.json({
                message : 'Deleted'
        })
        return ;

     }catch(error){
        console.error("Error while deleting the content")
     }
     
};

export { uploadContent, getContent, deleteContent , searchAndQueryText };

