import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { createAccessToken } from '../libs/jwt.js'


//TODO: ## how we are going to handle login ? username or email ? or both?
export const login = async(req, res) => {
    const { email, password } = req.body;
    try {

        const userFound = await User.findOne( {email} );
        if (!userFound) return res.status(400).json({ message: "User not found" });

        const isPasswordMatch = await bcrypt.compare(password, userFound.password);
      
        if (!isPasswordMatch) return res.status(400).json({ message: "Invalid credentials"});

        const token = await createAccessToken({ id: userFound._id});

        res.cookie("token", token);
        res.json({
            id: userFound._id,
            username: userFound.username,
            email: userFound.email,
            createdAt: userFound.createdAt,
            updatedAt: userFound.updatedAt,
        });
    } catch (error) {
        console.log(error);
    }
};

export const logout = async(req, res) => { 
    res.cookie("token", "", {
        expires: new Date(0)
    })
    return res.sendStatus(200);
};