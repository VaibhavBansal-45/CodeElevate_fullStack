const express=require('express')
const app=express();
require('dotenv').config();
const {main}= require('./config/DB')
const cookieParser= require('cookie-parser');
const authRouter=require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter=require("./routes/problemCreator")
const submitRouter=require("./routes/submit")
const cors=require('cors');
const aiRouter = require('./routes/aiChatting');
const profileRoutes=require('./routes/userProfile')

app.use(cors({
    origin: 'http://localhost:5173',
    credentials:true
}))



app.use(express.json())
app.use(cookieParser());
app.use("/user", authRouter);
app.use('/problem', problemRouter);
app.use('/submission', submitRouter)
app.use('/ai',aiRouter)
app.use('/profile', profileRoutes);

// main()
// .then(async()=>{
//     app.listen(process.env.PORT,()=>{
//         console.log("Server listening at port no"+ process.env.PORT)
    
// })
// }).catch((err)=>{
//     throw new Error(err.message);

// })

const InitializeConnection=async()=>{
    try{
        await Promise.all([main(), redisClient.connect()]);
        console.log("DB connected");
        app.listen(process.env.PORT,()=>{
                   console.log("Server listening at port no"+ process.env.PORT)})

    }
    catch(err){
        console.log("Error"+ err);

    }
}
InitializeConnection();

