   const Problem=require("../model/problem");
   const Submission=require("../model/submission");
   const User=require("../model/user");

const { getLanguageById,submitBatch,submitToken } = require("../utills/problemUtility");
   
 const submitCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;                  // ← let here

    if (!userId || !problemId || !language) 
      return res.status(400).send("Some Field Missing");

    if (language === "cpp") 
      language = "c++";

    const problem = await Problem.findById(problemId);
    if (!problem) 
      return res.status(404).send("Problem not found");

    // initialize submission record
    const submittedResult = await Submission.create({
      userId,
      problemId,
      code,
      language: language.toLowerCase(),               // ← correct method
      status: 'pending',
      testCaseTotal: problem.hiddenTestCases.length  // ← correct property
    });

    // build Judge0 payload...
    const languageId = getLanguageById(language);
    const submissions = problem.hiddenTestCases.map(tc => ({
      source_code: code,
      language_id: languageId,
      stdin: tc.input,
      expected_output: tc.output
    }));

    const submitResult = await submitBatch(submissions);
    const tokens       = submitResult.map(r => r.token);
    const testResult   = await submitToken(tokens);

    // aggregate results
    let testCasePassed = 0, runtime = 0, memory = 0;
    let status = "accepted", errorMessage = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasePassed++;
        runtime += parseFloat(test.time);
        memory  = Math.max(memory, test.memory);
      } else if (test.status_id === 4) {
        status = 'error';
        errorMessage = test.stderr;
      } else {
        status = 'wrong';
        errorMessage = test.stderr;
      }
    }

    // save totals back to DB
    submittedResult.status          = status;
    submittedResult.testCasePassed  = testCasePassed;
    submittedResult. testCaseTotal  = testResult.length;
    submittedResult.errorMessage    = errorMessage;
    submittedResult.runtime         = runtime;
    submittedResult.memory          = memory;
    await submittedResult.save();

    // mark problem solved for user
    if (!req.result.problemSolved.includes(problemId)) {
      req.result.problemSolved.push({  problem: problemId,
  solvedAt: new Date(), });
      await req.result.save();
    }

    // respond, referencing the saved totalTestCases
    res.status(201).json({
      accepted: status === 'accepted',
      testCaseTotal: submittedResult.testCaseTotal,
      passesTestCases: testCasePassed,
      runtime,
      memory
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error: " + err.message);
  }
};


 const runCode = async (req, res) => {
  try {
    const userId = req.result._id;
    const problemId = req.params.id;
    let { code, language } = req.body;               // ← use let so we can reassign

    // 1. Validate inputs
    if (!userId || !problemId || !language) {
      return res.status(400).send("Some field is missing");
    }

    // 2. Normalize C++ → c++
    if (language === "cpp") {
      language = "c++";
    }

    // 3. Fetch the problem
    const problem = await Problem.findById(problemId);
    if (!problem) { 
      return res.status(404).send("Problem not found");
    }

    // 4. Build Judge0 submissions payload
    const languageId = getLanguageById(language.toLowerCase());
    const submissions = problem.visibleTestCases.map(tc => ({
      source_code: code,
      language_id:   languageId,
      stdin:         tc.input,
      expected_output: tc.output
    }));

    // 5. Submit & poll
    const submitResult = await submitBatch(submissions);
    const tokens       = submitResult.map(r => r.token);
    const testResult   = await submitToken(tokens);
    console.log(testResult)

    // 6. Aggregate
    let testCasePassed = 0;
    let runtime        = 0;
    let memory         = 0;
    let success        = true;
    let errorMessage   = null;

    for (const test of testResult) {
      if (test.status_id === 3) {
        testCasePassed++;
        runtime += parseFloat(test.time);
        memory  = Math.max(memory, test.memory);
      } else {
        success      = false;
        errorMessage = test.stderr || test.compile_output || null;
        // stop at first failure if you like:
        // break;
      }
    }

    // 7. Respond
    return res.status(200).json({
      success,
      passed:        testCasePassed,
      total:         problem.visibleTestCases.length,
      runtime,
      memory,
      errorMessage,         // only set if success===false
      rawResults:    testResult  // optional: full per-test details
    });

  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error: " + err.message);
  }
};

module.exports={submitCode, runCode};