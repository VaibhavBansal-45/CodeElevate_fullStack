const express=require('express');
const authRouter=express.Router();
const {register, login, logout, adminRegister,deleteProfile}=require("../controllers/userAuthent");
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminmiddleware');
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', userMiddleware, logout);
authRouter.post('/create/admin', adminMiddleware,adminRegister);
authRouter.delete('/deleteProfile', userMiddleware,deleteProfile);
authRouter.get('/check', userMiddleware,(req,res)=>{
    const reply={
        firstName:req.result.firstName,
        emaiId:req.result.emaiId,
        _id:req.result._id,
        role:req.result.role,
        avatarUrl: req.result.avatarUrl
    }
    res.status(200).json({
        user:reply,
        message:"valid user"
    })

})
// authRouter.get('/getProfile',getProfile);

module.exports =authRouter;
