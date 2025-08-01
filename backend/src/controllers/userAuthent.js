const redisClient = require("../config/redis");
const submission = require("../model/submission");
const User=require("../model/user")
const validate=require("../utills/validator");
const bcrypt=require("bcrypt");
const jwt=require("jsonwebtoken");

const register=async(req,res)=>{
    try{
        validate(req.body);
        const{firstName,emailId, password}=req.body;
        req.body.role="user";

        const userAlreadyExist= await User.findOne({emailId});
        if(userAlreadyExist){
            return res.status(400).json({message: "User already exists"});
        }
        req.body.password=await bcrypt.hash(password, 10);
        


        const user= await User.create(req.body);
        const token=jwt.sign({_id:user._id,emailId:emailId,role:"user"}, process.env.JWT_KEY,{expiresIn:60*60});
        res.cookie('token', token,{maxAge:60*60*1000});
        const reply={
        firstName: user.firstName,
        emailId:user.emailId,
        _id: user._id,
        role:user.role,
        avatarUrl:user.avatarUrl
     }
        res.status(201).json({
            user:reply,
            message:"User Registered Succesfully"
        })
        
    }

   
    catch(err){
        res.status(400).json({success: false, message:err.message});

    }
}

const login=async(req,res)=>{
    try{
        const{emailId,password}=req.body;
        if(!emailId) 
            throw new Error("Invalid Credentials");
        if(!password)
            throw new Error ("Invalid Credentials");

     const user=await User.findOne({emailId});

     const match=await bcrypt.compare(password,user.password);
     if(!match)
        throw new Error("Invalid Credentials");

     const reply={
        firstName: user.firstName,
        emailId:user.emailId,
        _id: user._id,
        role:user.role,
        avatarUrl: user.avatarUrl
     }
     const token=jwt.sign({_id:user._id,emailId:emailId,role:user.role}, process.env.JWT_KEY,{expiresIn:60*60});
        res.cookie('token', token,{maxAge:60*60*1000});
        res.status(201).json({
            user:reply,
            message:"Loggin Succesfully"
        })

        

     

    }
    catch(err){
        res.status(401).send("Error: "+err);

    }
}

const logout=async(req,res)=>{
    try{
        // validate the token using middleware



        // token added to redis's blocklist 
        const{token}=req.cookies;
        const payload=jwt.decode(token);

        await redisClient.set(`token:${token}`, "Blocked");
        await redisClient.expireAt(`token:${token}`, payload.exp);

        // clear the cookies
        res.cookie("token", null,{expires: new Date(Date.now())});
        res.send("Logged Out Succesfully");

    }
    catch(err){
        res.status(503).send("Error"+err);

    }
}

const adminRegister=async(req,res)=>{
    try{
        if(req.result.role!='admin')
            throw new Error("Invalid Credentials");
        // validate(req.body);
        // const{ firstName, emailId,password}=req.body;
        // req.body.password=await bcrypt.hash(password,10);

        // const user=await User.create(req.body);
        // const token=jwt.sign({_id:user._id, emailId:emailId,role:user.role}, process.env.JWT_KEY,{expiresIn:60*60});
        // res.cookie('token', token,{maxAge:60*60*1000})
        // res.status(201).send("User Registered Successfully")
        const user= await User.findById(req.result._id)
    }
    catch(err){
        res.status(400).send("Error: " +err)

    }
}


const deleteProfile=async(req,res)=>{
    try{
        const userId=req.result._id;
        await User.findByIdAndDelete(userId);
        //submission se bhi delete

        await submission.deleteMany({userId})
        res.status(200).send("deleted Succesfully");

    }
    catch(error){
        res.status(200).send("Internal Server Error")

    }
}
module.exports={register, login, logout, adminRegister ,deleteProfile};