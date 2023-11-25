import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import { createAccessToken } from '../libs/jwt.js'

export const getUsers = async(req, res) => {
    const userName = req.query.username;
    if (userName) {
        const userByName = await User.find({ username: userName });
        res.json(userByName);
      } else {
        const users = await User.find();
        res.json(users);
      }
};

export const getUserByID = async(req, res) => {
    const user = await User.findById(req.params.userid);
    if(!user) return res.status(404).json({message: "User not found"});
    res.json(user);
};

export const createUser = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
        });
        const userCreated = await newUser.save();
        const token = await createAccessToken({ id: userCreated._id});
        res.cookie("token", token);
        res.json({
            id: userCreated._id,
            username: userCreated.username,
            email: userCreated.email,
            createdAt: userCreated.createdAt,
            updatedAt: userCreated.updatedAt,
        });
    } catch (error) {
        console.log(error);
    }
};

export const updateUser = async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await User.findByIdAndUpdate(
        req.params.userid,{
            username: username,
            email: email,
            password: hashedPassword,
        },
        {
            new: true,
        }
    );

    if(!updatedUser) return res.status(404).json({message: "User not found"});
    res.json({
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
    });
};

export const deleteUser = async(req, res) => {
    const user = await User.findByIdAndDelete(req.params.userid);
    if(!user) return res.status(404).json({message: "User not found"});
    res.json(user);
};