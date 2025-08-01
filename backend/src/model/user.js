 const mongoose=require('mongoose')
 const {Schema}=mongoose;

 const solvedEntrySchema = new mongoose.Schema({
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'problem',
    required: true,
    default:[]
  },
  solvedAt: {
    type: Date,
    default: Date.now
  }
});

 const userSchema=new Schema({
    firstName:{
        type: String,
        required: true,
        minLength:3,
        maxLength:20
    },
    lastName:{
        type:String,
        minLength:3,
        maxLength:20
    },
    emailId:{
        type:String,
        required:true,
        unique:true,
        trim:true,
        lowercase:true,
        immutable: true,
    },
    age:{
        type:Number,
        min:5,
        max:80,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default: 'user'
    },
 problemSolved: [solvedEntrySchema],
   avatarUrl: {
    type: String, 
    default:' https://i.pinimg.com/236x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg'
  },
    password:{
        type:String,
        required: true
    }, 
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken:  String,
    resetPasswordExpiresAt:  Date,
    verificationToken: String,
    verificationTokenExpiresAt: Date

    
 },
 {
    timestamps:true
 });


 const User=mongoose.model("user", userSchema);
 module.exports=User;