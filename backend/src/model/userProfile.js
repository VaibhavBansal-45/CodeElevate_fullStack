// models/UserProfile.js
const mongoose = require('mongoose');

const socialLinksSchema = new mongoose.Schema({
  github: String,
  linkedin: String,
  twitter: String,
  website: String,
});

const educationSchema = new mongoose.Schema({
  institution: String,
  degree: String,
  startDate: Date,
  endDate: Date,
});

const experienceSchema = new mongoose.Schema({
  company: String,
  position: String,
  startDate: Date,
  endDate: Date,
});

const userProfileSchema = new mongoose.Schema({
  name: String,
  gender: String,
  location: String,
  birthday: Date,
  summary: String,
  avatarUrl: String,
  socialLinks: socialLinksSchema,
  education: [educationSchema],
  experience: [experienceSchema],
  skills: [String],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    unique: true,
  },
});

userProfileSchema.post("findOneAndUpdate", async function (doc) {
  try {
    if (!doc || !doc.userId || !doc.avatarUrl) return;

    const User = require("./user");

    await User.findByIdAndUpdate(doc.userId, {
      avatarUrl: doc.avatarUrl
    });
  } catch (err) {
    console.error("Failed to sync avatarUrl to User:", err.message);
  }
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
