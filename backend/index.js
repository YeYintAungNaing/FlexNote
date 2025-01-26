/* eslint-disable prettier/prettier */
import express from "express"
import sqlite3 from 'better-sqlite3'
import bcrypt from 'bcrypt'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from "cookie-parser"


const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}))

const dbPath = 'C:/Users/yeyin/AppData/Roaming/flexnote/online_db/flexNote.db';  // temp path

const db = new sqlite3(dbPath);

app.post('/auth/register', (req, res) => {
    try{
        const {userName, password, mode} = req.body
        const row = db.prepare("SELECT * FROM users where userName = ?").get(userName);
        
        if (row) {
            res.status(409).json({ message: "Username is already taken" });
            return
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        db.prepare("INSERT INTO users (userName, password, mode) VALUES (?, ?, ?)").run(userName, hashedPassword, mode)

        res.status(200).json({message : "Successfully registered"})

    }
    catch(e) {
        res.status(500).json({ message: "Internal Server Error" })
        //console.log(e)
    }
})


app.get('/auth/verifyToken' , (req, res) => {
    try{
        const token = req.cookies?.jwt_token;

        if (!token){
            res.status(401).json({ message: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", (err, decoded) => {
            if (err) return res.status(403).json({ message: "Invalid token" });
            console.log(decoded.id)
        
            const userData = db.prepare("SELECT * FROM users where userId = ?").get(decoded.id);  //  userId when the token is first created 
            console.log("row", userData)
            if(!userData) {
                res.status(404).json({ message: "no valid user data" });
                return
            }
            // eslint-disable-next-line no-unused-vars
            const {password, ...other} = userData
            res.status(200).json(other)
            return
        });
    }
    catch(e) {
        res.status(500).json({ message: "Internal Server Error" })
        console.log(e)
    }
})


app.post("/auth/login", (req, res) => {
    try{
        
        const userData = db.prepare("SELECT * FROM users where userName = ?").get(req.body.userName);  // .get returns undefined if no matching row is found and returns a single obj if found (.all returns empty list)
        
        if (!userData) {
            res.status(404).json({ message: "User does not exist" });
            return
        }
        const isCorrect = bcrypt.compareSync(req.body.password, userData.password);

        if(!isCorrect) {
            res.status(401).json({ message: "Incorrect password" });
            return
        }

        const token = jwt.sign({id : userData.userId}, "jwtkey", { expiresIn: '5h' })
        // eslint-disable-next-line no-unused-vars
        const {password, ...other} = userData  
        res.cookie('jwt_token', token, {    // can be found inside cookie session
            httpOnly:true,
            maxAge: 18000000 
        }).status(200).json(other)     
    }
    catch(e) {
        res.status(500).json({ message: "Internal Server Error" })
        console.log(e)
    }
    
})


app.listen(7000, () => {
    console.log('connected to backend')
})
