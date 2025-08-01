const {getLanguageById, submitBatch,submitToken}=require("../utills/problemUtility");
const{ getCollection} =require('../config/DB')

const Problem = require("../model/problem");
const submission = require("../model/submission");
const User=require("../model/user")




const createProblem = async (req, res) => {
  const {
    title, description, tags,
    visibleTestCases, hiddenTestCases,
    startCode, referenceSolution, problemCreator,Constraints, isFavroite
  } = req.body;

  try {
    // console.log(JSON.stringify(req.body, null, 2));
    // console.log(Object.keys(req.body.startCode[3])); // just to catch typos
    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      const submissions = visibleTestCases.map(tc => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: tc.input,
        expected_output: tc.output
      }));

      // send off the batch
      const submitResult = await submitBatch(submissions);
  
      

      // extract tokens
      const tokens = submitResult.map(r => r.token);
      

      // poll until done
      const testResult = await submitToken(tokens);
      
      console.log(testResult)

      // **check the correct field here**:
      for (const test of testResult) {
        if (test.status_id !== 3) { 
          console.log('passed')             // ← use status_id, not status.id
          return res
            .status(400)
            .send(`Error: one or more reference solutions failed (status_id=${test.status_id})`);
        }
        
      }
    }

    // if we got here, all languages / test‐cases passed
    const userProblem = await Problem.create({
      ...req.body,
      problemCreator: req.result._id
    });
    
    return res.status(201).send("Problem Saved Successfully");
    
  }
  catch (err) {
    console.error(err);
    return res.status(500).send("Server Error: " + err.message);
  }
};

const updateProblem= async (req, res) => {
  const {id}= req.params;
  const {
    title, description, tags,
    visibleTestCases, hiddenTestCases,
    startCode, referenceSolution, problemCreator,Constraints
  } = req.body;

  try {
    if(!id) return res.status(400).send("Missing Id Field");

    const DsaProblem= await Problem.findById(id);

    if(!DsaProblem) return res.status(400).send("Problem is not present in server")

    for (const { language, completeCode } of referenceSolution) {
      const languageId = getLanguageById(language);

      const submissions = visibleTestCases.map(tc => ({
        source_code: completeCode,
        language_id: languageId,
        stdin: tc.input,
        expected_output: tc.output
      }));

      // send off the batch
      const submitResult = await submitBatch(submissions);
      

      // extract tokens
      const tokens = submitResult.map(r => r.token);
      

      // poll until done
      const testResult = await submitToken(tokens);
      console.log(testResult)

      // **check the correct field here**:
      for (const test of testResult) {
        if (test.status_id !== 3) {              // ← use status_id, not status.id
          return res
            .status(400)
            .send(`Error: one or more reference solutions failed (status_id=${test.status_id})`);
        }
      }
    }

    // if we got here, all languages / test‐cases passed
   const newProblem =await Problem.findByIdAndUpdate(id, {...req.body}, {runValidators:true, new:true})
   res.status(200).send(newProblem)
  }
  catch (err) {
    console.error(err);
    return res.status(500).send("Server Error: " + err.message);
  }
};

const deleteProblem=async(req,res)=>{
  const {id}=req.params;
  try{
    if(!id){
      return res.status(400).send("Id is missing");
    }

    const deletedProblem=await Problem.findByIdAndDelete(id);
    if(!deletedProblem) return res.status(404).send("Problem is Missing");

    res.status(200).send("successflly Deleted")

  }
  catch(err){
    res.status(500).send("Error "+err)

  }
}

const getProblemById=async(req,res)=>{
  const {id}=req.params;
  try{
    if(!id){
      return res.status(400).send("Id is missing");
    }

    const getProblem =await Problem.findById(id).select('_id title description difficulty tags visibleTestCases  hiddenTestCases startCode referenceSolution  isFavroite  Constraints');
    if(!getProblem) return res.status(404).send("Problem is Missing");



    res.status(200).send(getProblem)

  }
  catch(err){
    res.status(500).send("Error "+err)

  }
}

// controllers/problem.js (or wherever)
const getAllProblem = async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)) || 1;
    const limit = Math.max(1, parseInt(req.query.limit)) || 10; // now dynamic
    const skip  = (page - 1) * limit;

    const total = await Problem.countDocuments();

    const problems = await Problem.find({})
      .select("_id title difficulty tags")
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      problems,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalProblems: total,
        limit
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.toString() });
  }
};





// src/controllers/userProblem.js
const solvedAllProblemByUser = async (req, res) => {
  try {
    const userId = req.result._id;
    const user = await User.findById(userId)
      .populate({ 
        path: 'problemSolved',
        populate: {
          path: 'problem',
          model: 'problem',
          select: '_id title difficulty'
        }
      });
      

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // filter out any unpopulated entries just in case
    const solvedProblems = user.problemSolved
      .filter(p => p.problem)
      .map(p => ({
        _id: p.problem._id,
        title: p.problem.title,
        difficulty: p.problem.difficulty,
        solvedAt: p.solvedAt,
      }));

    res.status(200).send(solvedProblems);
  } catch (err) {
    console.error('solvedAllProblemByUser error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};



const submittedProblem =async(req,res)=>{
  
  try{
    const userId=req.result._id
    const problemId=req.params.pid;

    const ans= await submission.find({userId, problemId});

   
    res.status(200).send(ans)



  }
  catch(err){
    res.status(500).send("Server Error")

  }
}

const searchProblem = async (req, res) => {
  try {
    const collectionName = 'problems';
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({ error: "Query is required" });
    }

    const titleCollection =  getCollection(process.env.Db_Name, 'problems');

    const aggregationPipeline = [
      {
        $search: {
          index: 'default', // using autocomplete index
          autocomplete: {
            query: query,
            path: 'title'
          }
        }
      },
      { $limit: 5 }
    ];

    const result = await titleCollection.aggregate(aggregationPipeline).toArray();

 

    res.status(200).json({ data: result });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

const problemsInBatches=async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Problem IDs are required.' });
    }

    const problems = await Problem.find({ _id: { $in: ids } });

    res.json(problems);
  } catch (err) {
    console.error('Batch fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};



module.exports={createProblem,updateProblem, deleteProblem,getProblemById,getAllProblem,solvedAllProblemByUser,submittedProblem,searchProblem, problemsInBatches}