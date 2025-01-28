/* eslint-disable prettier/prettier */
import express from "express"
import sqlite3 from 'better-sqlite3'
import bcrypt from 'bcrypt'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"


const app = express()

app.use(express.json())
app.use(cookieParser())

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}))

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max:4, 
    message: {message : 'Too many requests from this IP, please try again after 15 minutes'},
    headers: true, // Include rate limit info in response headers
});

app.use(limiter)

const dbPath = 'C:/Users/yeyin/AppData/Roaming/flexnote/online_db/flexNote.db';  // temp path

const db = new sqlite3(dbPath);

app.post('/auth/register', (req, res) => {
    try{
        const {userName, password, mode, timeStamp} = req.body
        const row = db.prepare("SELECT * FROM users where userName = ?").get(userName);
        
        if (row) {
            res.status(409).json({ message: "Username is already taken" });
            return
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        db.prepare("INSERT INTO users (userName, password, mode, createdAt) VALUES (?, ?, ?, ?)").run(userName, hashedPassword, mode, timeStamp)

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
            // 
        
            const userData = db.prepare("SELECT * FROM users where userId = ?").get(decoded.userId);  //  userId when the token is first created 
            //console.log("row", userData)
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

        const token = jwt.sign({userId : userData.userId}, "jwtkey", { expiresIn: '10h' })
        // eslint-disable-next-line no-unused-vars
        const {password, ...other} = userData  
        res.cookie('jwt_token', token, {    // can be found inside cookie session
            httpOnly:true,
            maxAge: 3600 * 10 * 1000 
        }).status(200).json(other)     
    }
    catch(e) {
        res.status(500).json({ message: "Internal Server Error" })
        console.log(e)
    }
})


app.put('/users/:id', (req, res) => {
    try{
        const token = req.cookies.jwt_token;

        jwt.verify(token, "jwtkey", (err, decoded) => {

            if (err) {
                return res.status(403).json({ message: "Invalid token" });
            }

            const {userName, email, location, gender, dName} = req.body

            db.prepare(
                'UPDATE users SET userName = ?, email = ?, location = ?, gender = ?, dName = ? WHERE userId = ?')
                .run(userName, email, location, gender, dName, decoded.userId)
            res.status(200).json({message : "Profile has been updated"})  
        })

    }catch(e){
        res.status(500).json({message : "Internal Server Error"});
    }
})

app.get('/notes', (req, res) => {

    try{
        const token = req.cookies.jwt_token;

        jwt.verify(token, "jwtkey", (err, decoded) => {

            if (err) {
                return res.status(403).json({ message: "Invalid token" });
            }

            const notes = db.prepare('SELECT * FROM notes where userId = ?').all(decoded.userId)
            res.status(200).json(notes)  
        })

    }catch(e) {
        res.status(500).json({ message: "Internal Server Error" })
        console.log(e)
    }
})


app.post('/notes', (req, res) => {
    try{
        const token = req.cookies.jwt_token;

        jwt.verify(token, "jwtkey", (err, decoded) => {
            if (err) return res.status(403).json({message: "Invalid token"})
            
            const {noteName, content} = req.body;

            const duplicate = db.prepare(
                'SELECT * FROM notes where name = ? and userId = ?').get(noteName, decoded.userId)

            if (duplicate) {
                return res.status(409).json({ message: "Note Name is already taken" });
            }

            db.prepare(
                'INSERT INTO notes (name, content, userId) VALUES (?, ?, ?)').run(noteName, content, decoded.userId)

            res.status(200).json({message : `${noteName} has been saved`})
        })

    }catch(e) {
        res.status(500).json({ message : "Internal Server Error"})
        console.log(e)
    }
})


app.put('/notes/:id', (req, res) => {
    try{
        const token = req.cookies.jwt_token;

        jwt.verify(token, "jwtkey", (err, encoded) => {
            if (err) return res.status(403).json({message : "Invalid token"})
            
            const { content, id} = req.body

            db.prepare("UPDATE notes SET content = ? WHERE userId = ? and id = ?").run(content, encoded.userId, id)

            return res.status(200).json({message : `Note with id :${id} has been updated`})
        })

    }catch(e) {
        res.status(500).json({ message : "Internal Server Error"})
    }
})


app.put('/notes/:id/name', (req, res) => {

    try{
        const token = req.cookies.jwt_token;

        jwt.verify(token, "jwtkey", (err, encoded) => {
            if (err) return res.status(403).json({message : "Invalid token"})
            
            const { noteName, id} = req.body

            db.prepare("UPDATE notes SET name = ? WHERE userId = ? and id = ?").run(noteName, encoded.userId, id)

            return res.status(200).json({message : `name of Note with id :${id} has been updated`})
        })

    }catch(e) {
        res.status(500).json({ message : "Internal Server Error"})
    }
})


app.post('/auth/logout', (req, res) => {

    try{
        res.clearCookie("jwt_token",{
            sameSite:"none",
            secure:true
          }).status(200).json({message : "User has been logged out"})
    }
    catch(e) {
        res.status(500).json({message : "Internal Server Error"})
        console.log(e)
    } 
})


app.listen(7000, () => {
    console.log('connected to backend')
})