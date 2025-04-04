import { z } from "zod";
import userModel from "../models/userModel";
import type { Request, Response } from "express";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";

const signup = async (req: Request, res: Response): Promise<void> => {
    const requiredBody = z.object({
        email: z.string().email({ message: 'Invalid email address' }).max(100),
        password: z.string().min(6, { message: 'Password must be at least 6 characters long' }).max(100)
    });

    const parseDataWithSuccess = requiredBody.safeParse(req.body);

    if (!parseDataWithSuccess.success) {
         res.status(400).json({
            message: 'Incorrect format'
        });
        return;
    }

    const { email, password } = parseDataWithSuccess.data;
    console.log({email,password});
    

    try {
        // Check if the email is already in use
        const existingUser = await userModel.findOne({ email });
        console.log('User saved:', existingUser); // Add logging
        if (existingUser) {
           res.status(409).json({ message: "Email is already in use" });
           return ;
        }

        const saltRounds = 10; // Use a stronger salt round
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const user = new userModel({
            email: email,
            password: hashedPassword
        });
        await user.save();
        console.log('User saved', user); // Add logging
         res.status(201).json({ message: "User created successfully" });
         return;
    } catch (error: any) {
        console.error('Error saving user:', error); // Add logging
        if (error.code === 11000) {
            res.status(409).json({ message: "Email is already in use" });
            return 
        }
        res.status(500).json({ message: error.message || "An error occurred" });
        return 
    }
};

const login = async (req: Request, res: Response): Promise<void> => {
    const requiredBody = z.object({
        email: z.string().email({ message: 'Invalid email address' }).max(100),
        password: z.string().min(6, { message: 'Password should be at least 6 characters long' }).max(100)
    });

    const parseDataWithSuccess = requiredBody.safeParse(req.body);

    if (!parseDataWithSuccess.success) {
         res.status(400).json({
            message: 'Incorrect format'
        });
        return;
    }

    const { email, password } = parseDataWithSuccess.data;

    try {
        const User = await userModel.findOne({ email });
        if (!User) {
            res.status(404).json({ message: 'User does not exist' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(password, User.password as string);
        if (!isPasswordValid) {
            res.status(401).json({ message: 'Invalid password' });
            return;
        }

        const payload = { userId: User._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET as string);
        res.status(200).json({ token, message: 'Login successful' });
        return;
    } catch (error: any) {
         res.status(500).json({ message: error.message || 'An error occurred' });
         return
    }
};

export { signup, login };