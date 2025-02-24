import mongoose, { Types } from "mongoose"
import { string } from "zod";
const contentTypes  = ['images','video','article','audio']

const contentSchema = new mongoose.Schema({
    link: {
        type: String,
       required: true
     },
    type: { 
        type: String, 
        enum: contentTypes, 
        required: true 
     },
   title: { 
         type: String, 
         required: true 
     },
   tags: [{ 
         type: mongoose.Types.ObjectId, 
         ref: 'Tag' 
         }],
   userId: { 
         type: mongoose.Types.ObjectId, 
         ref: 'User', 
         required: true 
          },
})

const contentModel = mongoose.model("content",contentSchema);
export default contentModel;