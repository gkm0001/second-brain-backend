import mongoose, { Types } from "mongoose"
export const contentTypes  = ['images','video','article','audio','youtube','twitter','linkedin'] as const

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
         type: mongoose.Schema.Types.ObjectId, 
         ref: 'Tag' 
         }],
   userId: { 
         type: mongoose.Schema.Types.ObjectId, 
         ref: 'User', 
         required: true 
          },
})

const contentModel = mongoose.model("content",contentSchema);
export default contentModel;