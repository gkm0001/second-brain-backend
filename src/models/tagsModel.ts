import mongoose from "mongoose";

const tagsSchema = new mongoose.Schema({
     title : {
         type : String,
         required : true,
         unique : true
     }
})

const tagsModel = mongoose.model("Tag", tagsSchema);
export default tagsModel;