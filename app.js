import express from 'express';
import cors from 'cors';
import path from 'path';
import connectdb from './server/config/db.js'
import userRoutes from './server/routes/userRoutes.js'

import { fileURLToPath } from 'url';
const app = express();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.static("public"));
app.use(express.json());             // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use('/api/users', userRoutes);
connectdb();
app.get("/",(req,res)=>{
  res.sendFile(path.join(__dirname, 'public/index.html'));
})

app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname, 'public/login.html'));
})

app.get('/register', (req,res)=>{
    res.sendFile(path.join(__dirname, 'public/register.html'));
})

app.listen(3000, () => {
    console.log(`Server running at http://localhost:${3000}`);
});
