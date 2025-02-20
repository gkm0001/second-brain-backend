import mongoose from "mongoose";

const connectdb = async() => {
     try {
         const connectionInstance = await mongoose.connect(process.env.MONGO_URL as string);
         console.log('\nMongoDB connected');
     }catch(error){
        console.log('MongoDb connection failed',error);
        process.exit(1)
     }
}

export default connectdb;