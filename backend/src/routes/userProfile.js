const express = require('express');
const  profileRoutes = express.Router();
const UserProfile = require("../model/userProfile")


profileRoutes.get('/:userId', async (req, res) => {
  try {
   
    const userId = req.params.userId;

   
    const profile = await UserProfile.findOne({ userId: userId });

    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.status(200).json(profile);

  } catch (err) {
    console.error('getUserProfile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE or UPDATE profile
profileRoutes.put('/:userId', async (req, res) => {
  const { userId } = req.params;
  const updateData = req.body;
  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    updateData,
    { new: true, upsert: true }
  );
  res.json(profile);
});

module.exports=profileRoutes;