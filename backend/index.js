/* eslint-disable prettier/prettier */
import express from "express"
import sqlite3 from 'better-sqlite3'
import bcrypt from 'bcrypt'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';
import { Resend } from "resend";
import crypto from 'crypto'


const app = express()
app.use(express.json({ limit: "5mb" }))
app.use(cookieParser())

app.use(cors({
    origin: ["http://localhost:5173"],
    credentials: true
}))

const limiter = rateLimit({
    windowMs: 10 * 60 * 1000, 
    max:100, 
    message: {message : 'Too many requests from this IP, please try again after 15 minutes'},
    headers: true, // Include rate limit info in response headers
});

app.use(limiter)


const dbPath = 'C:/Users/yeyin/AppData/Roaming/flexnote/online_db/flexNote.db';  // temp path

const db = new sqlite3(dbPath);

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const RESEND_API_SECRET = process.env.RESEND_API_SECRET;
const RESEND_EMAIL = process.env.RESEND_EMAIL;


cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET
});

const resend = new Resend(RESEND_API_SECRET);


app.post('/auth/register', (req, res) => {
    try{
        const {userName, password, mode, timeStamp} = req.body
        const duplicate = db.prepare("SELECT * FROM users where userName = ? ").get(userName);
        
        if (duplicate) {
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
            //console.log(typeof(decoded.userId))
        
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
            res.status(404).json({ ServerErrorMsg: "User does not exist" });
            return
        }
        const isCorrect = bcrypt.compareSync(req.body.password, userData.password);

        if(!isCorrect) {
            res.status(401).json({ ServerErrorMsg: "Incorrect password" });
            return
        }

        const token = jwt.sign({userId : userData.userId}, "jwtkey", { expiresIn: '10h' })
        // eslint-disable-next-line no-unused-vars
        const {password, ...other} = userData  
        res.cookie('jwt_token', token, {    // can be found inside cookie session in browser
            httpOnly:true,
            maxAge: 3600 * 10 * 1000 
        }).status(200).json(other)     
    }
    catch(e) {
        res.status(500).json({ ServerErrorMsg: "Internal Server Error" })
        console.log(e)
    }
})


// update user profile
app.put('/users/:id', (req, res) => {
    try{
        const token = req.cookies.jwt_token;

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", (err, decoded) => {

            if (err) {
                return res.status(403).json({ ServerErrorMsg: "Invalid token" });
            }

            const {userName, email, location, gender, dName} = req.body

            const duplicate = db.prepare("SELECT * FROM users where userName = ? AND userId != ?").get(userName, decoded.userId );
        
            if (duplicate) {
                res.status(409).json({ ServerErrorMsg: "Username is already taken" });
                return
            }

            db.prepare(
                'UPDATE users SET userName = ?, email = ?, location = ?, gender = ?, dName = ? WHERE userId = ?')
                .run(userName, email, location, gender, dName, decoded.userId)
            res.status(200).json({message : "Profile has been updated"})  
        })

    }catch(e){
        res.status(500).json({ServerErrorMsge : "Internal Server Error"});
    }
})

// generating signature for cloudinary
app.get('/generateSignature', (req, res) => {
    try{
        const token = req.cookies.jwt_token;

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", (err) => {

            if (err) {
                return res.status(403).json({ServerErrorMsg: "Invalid token" });
            }
            const timestamp = Math.round(new Date().getTime() / 1000); 
            const params = {
                timestamp,
                folder: "profile_images" 
            };
            const signature = cloudinary.utils.api_sign_request(params, API_SECRET);
  
            res.status(200).json({ signature, timestamp, cloud_name: CLOUD_NAME, api_key: API_KEY });    
        })

    }catch(e) {
        res.status(500).json({ ServerErrorMsg: "Internal Server Error" })
        console.log(e)
    }
})

// updating profile image (image url in db)
app.put("/users/:id/profileImage", (req, res) => {
    try{
        const token = req.cookies.jwt_token;

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }
    

        jwt.verify(token, "jwtkey", (err, decoded) => {

            if (err) {
                return res.status(403).json({ ServerErrorMsg: "Invalid token" });
            }

            db.prepare(
                'UPDATE users SET profileImgPath = ? WHERE userId = ?')
                .run(req.body.image_url, decoded.userId)
            res.status(200).json({message : "Profile image has been updated"})  
        })

    }catch(e){
        res.status(500).json({ServerErrorMsg : "Internal Server Error"});
    }
})

// generating code and sending code
app.post('/users/:id/generateCode',  (req, res) => {

    try{
        const token = req.cookies.jwt_token;

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", async (err, decoded) => {

            if (err) {
                return res.status(403).json({ ServerErrorMsg: "Invalid token" });
            }

            const code = crypto.randomInt(100000, 999999).toString()
            const expirationTime = 3 * 60 * 1000; 
            const expiresAt = new Date(Date.now() + expirationTime).toISOString();
            const email = req.body.email

            db.prepare("INSERT INTO verificationCodes (userId, code, expiresAt) VALUES (?, ?, ?) ").run(
                 decoded.userId, 
                 code, 
                 expiresAt
            )

            await resend.emails.send({
                from: RESEND_EMAIL,
                to: [email],
                subject: "Verification code",
                html:  `
                <div style="font-family: Arial, sans-serif; color: #333; text-align: center;">
                  <h1>Your Verification Code</h1>
                  <p>Use the code below to complete your verification process:</p>
                  <div style="
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #f2f2f2;
                    border: 1px solid #ccc;
                    border-radius: 5px;
                    font-size: 24px;
                    letter-spacing: 4px;
                    font-weight: bold;
                  ">
                    ${code}
                  </div>
                  <p style="margin-top: 20px; color: #777; font-size: 12px;">
                    This code will expire in 10 minutes. If you did not request this, please ignore this email.
                  </p>
                </div>
              `
            }); 

            res.status(200).json({message : "Code has been sent"})
        })

    }catch(e) {
        res.status(500).json({ ServerErrorMsg: "Internal Server Error" })
        console.log(e)
    }
})


//verifying code
app.put('/users/:id/verifyCode', (req, res) => {
    try{
        const token = req.cookies.jwt_token;
        

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", async (err, decoded) => {

            if (err) {
                return res.status(403).json({ ServerErrorMsg: "Invalid token" });
            }

            const code = req.body.code
            
            //console.log(code)
            const veriCode = db.prepare("SELECT * from verificationCodes WHERE userId = ? AND code = ?").get(  // return undefined if no match
                 decoded.userId,
                 code  
            )

            if (veriCode) {
                const now = new Date();
                if (new Date(veriCode.expiresAt) > now) {
                    res.status(200).json({message : "Verification successful"})
                    return
                }
                else{
                    res.status(403).json({ServerErrorMsg : "Your code is expired"})
                    return
                }
            }
            else {
                res.status(404).json({ServerErrorMsg : "Wrong code"})
                return
            }
        })

    }catch(e) {
        res.status(500).json({ ServerErrorMsg: "Internal Server Error" })
        console.log(e)
    }
})


//resetting password
app.put('/users/:id/resetPassword', (req, res) => {
    try{
        const token = req.cookies.jwt_token;

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", async (err, decoded) => {

            if (err) {
                return res.status(403).json({ ServerErrorMsg: "Invalid token" });
            }
            const password = req.body.password
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            db.prepare("UPDATE users SET password = ? where userId = ?").run(hashedPassword, decoded.userId)

            res.status(200).json({message : "Successfully changed the password"})
        })    
    }
    catch(e) {
        res.status(500).json({ ServerErrorMsg: "Internal Server Error" })
        //console.log(e)
    }
})


// getting notes
app.get('/notes', (req, res) => {

    try{
        const token = req.cookies.jwt_token;

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

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


// adding new note
app.post('/notes', (req, res) => {
    try{
        const token = req.cookies.jwt_token;

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", (err, decoded) => {
            if (err) return res.status(403).json({ServerErrorMsg: "Invalid token"})
            
            const {noteName, content} = req.body;

            const duplicate = db.prepare(
                'SELECT * FROM notes where name = ? and userId = ?').get(noteName, decoded.userId)

            if (duplicate) {
                return res.status(409).json({ ServerErrorMsg: "Note Name is already taken" });
            }

            db.prepare(
                'INSERT INTO notes (name, content, userId) VALUES (?, ?, ?)').run(noteName, content, decoded.userId)

            res.status(200).json({message : `${noteName} has been saved`})
        })

    }catch(e) {
        res.status(500).json({ ServerErrorMsg : "Internal Server Error"})
        console.log(e)
    }
})

// editing existing note
app.put('/notes/:id', (req, res) => {
    try{
        const token = req.cookies.jwt_token;

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", (err, decoded) => {
            if (err) return res.status(403).json({ServerErrorMsg : "Invalid token"})
            
            const { content, id} = req.body

            db.prepare("UPDATE notes SET content = ? WHERE userId = ? and id = ?").run(content, decoded.userId, id)

            return res.status(200).json({message : `Note with id :${id} has been updated`})
        })

    }catch(e) {
        res.status(500).json({ ServerErrorMsg : "Internal Server Error"})
    }
})


// edit note name
app.put('/notes/:id/name', (req, res) => {

    try{
        const token = req.cookies.jwt_token;

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", (err, decoded) => {
            if (err) return res.status(403).json({ServerErrorMsg : "Invalid token"})
            
            const { noteName, id} = req.body

            const duplicate = db.prepare(
                'SELECT * FROM notes where name = ? and userId = ?').get(noteName, decoded.userId)

            if (duplicate) {
                return res.status(409).json({ ServerErrorMsg: "Note Name is already taken" });
            }

            db.prepare("UPDATE notes SET name = ? WHERE userId = ? and id = ?").run(noteName, decoded.userId, id)

            return res.status(200).json({message : `name of Note with id :${id} has been updated`})
        })

    }catch(e) {
        res.status(500).json({ ServerErrorMsg : "Internal Server Error"})
    }
})

// delete note
app.delete('/notes/:id', (req, res) => {
    try{
        const token = req.cookies.jwt_token;

        jwt.verify(token, "jwtkey", (err, decoded) => {
            if (err) return res.status(403).json({ServerErrorMsg : "Invalid token"})
            
            //const {id} = req.body  // wtf is that 
            const id = req.params.id

            db.prepare("DELETE FROM notes WHERE id = ? AND userId = ?").run(id, decoded.userId)

            return res.status(200).json({message : `Note with id :${id} has been deleted`})
        })

    }catch(e) {
        res.status(500).json({ ServerErrorMsg : "Internal Server Error"})
    }
})

// saving drawing board data
app.post('/drawingBoard', (req, res) => {
    try{
        const token = req.cookies.jwt_token; 

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", (err, decoded) => {
            if (err) return res.status(403).json({ServerErrorMsg : "Invalid token"})

                const drawingData = JSON.stringify(req.body.drawingData);
            
            db.prepare("INSERT INTO drawingBoard (drawingData, userId) VALUES (?, ?)").run(
                drawingData, decoded.userId
            )
            return res.status(200).json({message : "Data has been saved"})
        })
    }
    catch(e) {
        res.status(500).json({ ServerErrorMsg : "Falied to save drawing data"}) 
        console.log(e)
    }
})


app.get('/drawingBoard', (req, res) => {

    try{
        const token = req.cookies.jwt_token;

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", (err, decoded) => {

            if (err) {
                return res.status(403).json({ ServerErrorMsg: "Invalid token" });
            }

            const drawingData = db.prepare('SELECT * FROM drawingBoard where userId = ?').get(decoded.userId)
            res.status(200).json(drawingData)  
        })

    }catch(e) {
        res.status(500).json({ ServerErrorMsg: "Internal Server Error" })
        console.log(e)
    }
})

// editing board data
app.put('/drawingBoard', (req, res) => {
    
    try{
        const token = req.cookies.jwt_token; 

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", (err, decoded) => {
            if (err) return res.status(403).json({ServerErrorMsg : "Invalid token"})

                const drawingData = JSON.stringify(req.body.drawingData);
            
                db.prepare("UPDATE drawingBoard SET drawingData = ? WHERE userId = ?").run(
                    drawingData, decoded.userId
                )

                return res.status(200).json({message : "Data has been updated"})
        })
    }
    catch(e) {
        res.status(500).json({ ServerErrorMsg : "Falied to save drawing data"}) 
        console.log(e)
    }
})


// add log
app.post('/users/:id/history', (req, res) => {
    try{
        const token = req.cookies.jwt_token; 

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }

        jwt.verify(token, "jwtkey", (err, decoded) => {
            if (err) return res.status(403).json({ServerErrorMsg : "Invalid token"})

            const {logContent, createdAt, logType} = req.body
            
            db.prepare("INSERT INTO activityLogs (logContent, userId, createdAt, logType) VALUES (?, ?, ?, ?) ").run(
                logContent, decoded.userId, createdAt, logType
            )
            return res.status(200).json({message : "log has been created"})
        })
    }
    catch(e) {
        res.status(500).json({ ServerErrorMsg : "Falied to create activity log"}) 
    }
})


// get logs
app.get('/users/:id/history', (req, res) => {

    try{
        const token = req.cookies.jwt_token;

        if (!token){
            res.status(401).json({ ServerErrorMsg: "Not logged in" });
            return
        }
        jwt.verify(token, "jwtkey", (err, decoded) => {

            if (err) {
                return res.status(403).json({ ServerErrorMsg: "Invalid token" });
            }

            const logs = db.prepare('SELECT * FROM activityLogs where userId = ?').all(decoded.userId)
            res.status(200).json(logs)  
        })

    }catch(e) {
        res.status(500).json({ ServerErrorMsg: "Internal Server Error" })
        console.log(e)
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
        res.status(500).json({ServerErrorMsg : "Internal Server Error"})
        console.log(e)
    } 
})


app.listen(7000, () => {
    console.log('connected to backend')
})



// const cloudinary = require("cloudinary").v2;
// const express = require("express");
// const app = express();

// cloudinary.config({
//   cloud_name: "your_cloud_name",
//   api_key: "your_api_key",
//   api_secret: "your_api_secret"
// });

// app.get("/generate-signature", (req, res) => {
//   const timestamp = Math.round(new Date().getTime() / 1000); // Current time
//   const params = {
//     timestamp,
//     folder: "user_uploads" // Optional: restrict uploads to a folder
//   };
//   const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  
//   res.json({ signature, timestamp, cloud_name: "your_cloud_name", api_key: "your_api_key" });
// });

// app.listen(7000, () => console.log("Server running on port 7000"));


// const cloudinaryResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
//     method: "POST",
//     body: formData
// });