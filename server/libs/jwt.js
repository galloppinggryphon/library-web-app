import jwt from 'jsonwebtoken';
import config from "../config/config.js";

export function createAccessToken(payload) {
   return new Promise((resolve, reject) => {
    jwt.sign(
        payload,
        config.secretToken,
        {
            expiresIn: "1d",
        },
        (err, token) => {
            if(err) reject(err);
            resolve(token);
        });
    });
}