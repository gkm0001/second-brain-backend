import 'dotenv/config'
import express from 'express';
import userRouter from './routes/user';
import userContent from './routes/content';
import brainRouter from './routes/brain';
import connectdb from './db/db';
import cors from 'cors';


const app = express();
app.use(cors());

app.use(express.json());

connectdb();

app.use('/api/v1/user', userRouter);
app.use('/api/v1/content', userContent);
app.use('/api/v1/brain', brainRouter);

// Health check endpoint
app.get('/health', (req : any, res :any) => res.sendStatus(200));



//Social Media post text and username 
// app.use('/api/v1/social-media', socialMediaRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});