const axios = require('axios');

const getLanguageById = (lang) => {
  const map = { "c++": 105, "java": 91, "javascript": 102, "python": 109 };
  return map[lang.toLowerCase()];
};

const waiting = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const submitBatch = async (submissions) => {
  const options = {
    method: 'POST',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch', // Corrected endpoint
    params: {
      base64_encoded: 'false',
      wait: 'false',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.RAIDAPI_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
      'Content-Type': 'application/json'
    },
    data: {
      submissions
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
    
      return response.data; // Return the data
    } catch (error) {
      console.error("Batch submission error:", error);
      throw error; // Propagate the error
    }
  }

  return await fetchData();
};

const submitToken = async (tokens) => {
  const options = {
    method: 'GET',
    url: 'https://judge0-ce.p.rapidapi.com/submissions/batch', // Corrected endpoint
    params: {
      tokens: tokens.join(","), // Correct parameter name and value
      base64_encoded: 'false',
      fields: '*'
    },
    headers: {
      'x-rapidapi-key': process.env.RAIDAPI_KEY,
      'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
    }
  };

  async function fetchData() {
    try {
      const response = await axios.request(options);
    
      return response.data; // Return the data
    } catch (error) {
      console.error("Batch retrieval error:", error);
      throw error; // Propagate the error
    }
  }

  while (true) {
    try {
      const result = await fetchData();
      // Check if all submissions have completed processing (status_id > 2)
      const isResultObtained = result.submissions.every(r => r.status_id > 2);
      if (isResultObtained) {
        return result.submissions;
      }
      await waiting(1000);
    } catch (error) {
      console.error("Error fetching submission results:", error);
      throw error; // Handle or retry as needed
    }
  }
};

module.exports = { getLanguageById, submitBatch, submitToken };
