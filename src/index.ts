import express from 'express';
import userRouter from './routes/user';
import userContent from './routes/content';
import brainRouter from './routes/brain';
import { config } from 'dotenv';
import connectdb from './db/db';
import cors from 'cors';

config(); 
console.log("hello");

const app = express();
app.use(cors());

app.use(express.json());

connectdb();

app.use('/api/v1/user', userRouter);
app.use('/api/v1/content', userContent);
app.use('/api/v1/brain', brainRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});