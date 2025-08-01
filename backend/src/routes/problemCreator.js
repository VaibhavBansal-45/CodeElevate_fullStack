const express=require('express');
const problemRouter=express.Router();
const Problem = require("../model/problem");
const adminMiddleware=require("../middleware/adminmiddleware");
const {createProblem,updateProblem,deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem,searchProblem,problemsInBatches}=require('../controllers/userProblem');
const userMiddleware = require('../middleware/userMiddleware');

problemRouter.post("/create", adminMiddleware, createProblem);
problemRouter.put("/update/:id", adminMiddleware, updateProblem);
problemRouter.delete("/delete/:id", adminMiddleware, deleteProblem);


problemRouter.get("/problemById/:id", userMiddleware ,getProblemById);
problemRouter.get("/getAllProblem",userMiddleware,getAllProblem);
problemRouter.get("/problemSolvedByUser", userMiddleware,solvedAllProblemByUser);
problemRouter.get("/submittedProblem/:pid",userMiddleware,submittedProblem);
problemRouter.get("/search", userMiddleware, searchProblem )
problemRouter.post('/problemsInBatches', userMiddleware, problemsInBatches)
problemRouter.post('/favorite/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {  isFavroite } = req.body;

    // update the problem document
    const updated = await Problem.findByIdAndUpdate(
      id,
      {  isFavroite },
      { new: true }
    ).select('_id  isFavroite'); // return only what you need

    if (!updated) {
      return res.status(404).json({ message: 'Problem not found' });
    }

    res.json({ data: updated });
  } catch (err) {
    console.error('Favorite toggle error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


module.exports=problemRouter;
