import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router';
import axiosClient from '../utills/axiosClient';
import SubmissionHistory from '../component/SubmissionHistory';
import ChatComponent from '../component/chatAi';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- ICONS ---
import {
    Loader2, RefreshCcw, Settings, Expand, Tags, CheckCircle2, XCircle,
    ChevronLeft, ChevronRight, Shuffle, Play, CloudUpload, NotebookText, Plus
} from 'lucide-react';

// --- RESIZABLE PANELS ---
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels";

// Language mapping
const langMap = {
    'javascript': 'JavaScript',
    'java': 'Java',
    'cpp': 'C++',
    'python':'Python'
};


// --- HEADER COMPONENT for Run/Submit buttons ---
const ProblemHeader = ({ onRun, onSubmit, isRunLoading, isSubmitLoading }) => {
    return (
        <div className="flex-shrink-0 flex justify-between items-center px-4 py-2 bg-base-300 border-b border-base-100">
            {/* Left side: Daily Question Nav */}
            <div className="flex items-center gap-2">
                <span className="font-semibold">Daily Question</span>
                <button className="btn btn-ghost btn-sm btn-square"><ChevronLeft size={18} /></button>
                <button className="btn btn-ghost btn-sm btn-square"><ChevronRight size={18} /></button>
                <button className="btn btn-ghost btn-sm btn-square"><Shuffle size={16} /></button>
            </div>

            {/* Right side: Action Buttons */}
            <div className="flex items-center gap-2">
                <button className="btn btn-sm" onClick={onRun} disabled={isRunLoading}>
                    <Play size={16} className="text-yellow-400" />
                    {isRunLoading ? 'Running...' : 'Run'}
                </button>
                <button className="btn btn-success btn-sm" onClick={onSubmit} disabled={isSubmitLoading}>
                    <CloudUpload size={16} />
                    {isSubmitLoading ? 'Submitting...' : 'Submit'}
                </button>
                 <button className="btn btn-ghost btn-sm btn-square">
                    <NotebookText size={18} />
                </button>
            </div>
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---
const ProblemPage = () => {
  const { problemId } = useParams();

  // State hooks
  const [problem, setProblem] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState('java');
  const [code, setCode] = useState('');
  const [loadingProblem, setLoadingProblem] = useState(true);
  const [activeLeftTab, setActiveLeftTab] = useState('description');
  const [activeRightBottomTab, setActiveRightBottomTab] = useState('testcase');
  const [activeTestCaseIndex, setActiveTestCaseIndex] = useState(0);
  const [isRunLoading, setIsRunLoading] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
    const [allTestCases, setAllTestCases] = useState([]);
  
    
  

  // Fetch problem data
  useEffect(() => {
    const fetchProblem = async () => {
      setLoadingProblem(true);
      try {
        const response = await axiosClient.get(`/problem/problemById/${problemId}`);
        
        setProblem(response.data);
       const dbLang = selectedLanguage === "cpp" ? "c++" : selectedLanguage;
      const initialCode =response.data.startCode.find(sc => sc.language.toLowerCase() === dbLang.toLowerCase())?.initialCode?? "";
      setCode(initialCode);
      } catch (error) {
        console.error('Error fetching problem:', error);
      } finally {
        setLoadingProblem(false);
      }
    };
    if (problemId) fetchProblem();
  }, [problemId]);

  // Update code on language change
  useEffect(() => {
    if (problem) {
      const dbLang = selectedLanguage === "cpp" ? "c++" : selectedLanguage;
      const newCode =problem.startCode.find(sc => sc.language.toLowerCase() === dbLang.toLowerCase())?.initialCode?? "";
      setCode(newCode);
       setAllTestCases(problem.visibleTestCases);
    
       
    }
  }, [selectedLanguage, problem]);
 

   

  const handleLanguageChange = (e) => setSelectedLanguage(e.target.value);

  // API Handlers
  const handleRun = async () => {
    setIsRunLoading(true);
    setRunResult(null);
    setActiveRightBottomTab('result');
    try {
      const response = await axiosClient.post(`/submission/run/${problemId}`, { code, language: selectedLanguage });
      setRunResult(response.data);
    } catch (error) {
      setRunResult({ success: false, testCase: [], error: error.response?.data?.message || 'Run failed.' });
    } finally {
      setIsRunLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    setIsSubmitLoading(true);
    setSubmitResult(null);
    try {
      const response = await axiosClient.post(`/submission/submit/${problemId}`, { code, language: selectedLanguage });
      setSubmitResult(response.data);
    } catch (error) {
      setSubmitResult({ accepted: false, error: error.response?.data?.message || 'Submission failed.' });
    } finally {
      setIsSubmitLoading(false);
      document.getElementById('submission_modal').showModal();
    }
  };
  const ResultDisplayBox = ({ label, content }) => (
  <div>
    <p className="text-xs font-semibold text-base-content/70 mb-1">{label}</p>
    <pre className="bg-base-100 p-3 rounded-md text-sm font-mono whitespace-pre-wrap">
      {content}
    </pre>
  </div>
);



  

  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-info font-medium shadow-none border-none';
      case 'medium': return 'text-warning font-medium shadow-none border-none';
      case 'hard': return 'text-error font-medium shadow-none border-none';
      default: return 'badge-neutral';
    }
  }

   const renderContent = () => {
    switch (activeLeftTab) {
      case 'description':
        return (
          <>
            <div className="flex items-center gap-4 mb-6">
  <h1 className="text-2xl font-bold">{problem.title}</h1>
  <div className={`badge badge-outline ${getDifficultyClass(problem.difficulty)}`}>
    {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
  </div>
  <div className="badge badge-ghost badge-sm capitalize truncate px-1.5">{problem.tags}</div>
</div>

<div className="prose max-w-none">
  <div className="whitespace-pre-wrap text-sm leading-relaxed">
    {problem.description}
  </div>
</div>

<div className="mt-8">
  <h3 className="text-lg font-semibold mb-4">Examples</h3>
  <div className="space-y-6">
    {problem.visibleTestCases.map((example, index) => (
      <div key={index} className="bg-base-200 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">Example {index + 1}:</h4>
        <div className="space-y-1 text-sm font-mono bg-base-300 p-3 rounded-md">
         <div>
  <strong className="text-base-content/70">Input:</strong>
  <pre className="whitespace-pre-wrap text-sm mt-1">{example.input}</pre>
</div>
          <div><strong className="text-base-content/70">Output:</strong> {example.output}</div>
          {example.explanation && <div><strong className="text-base-content/70">Explanation:</strong> {example.explanation}</div>}
        </div>
      </div>
    ))}
  </div>
</div>

{problem.Constraints && (
  <div className="mt-8">
    <h3 className="text-lg font-semibold mb-4">Constraints</h3>
    <div className="bg-base-200 p-4 rounded-lg">
      <ul className="list-disc list-inside space-y-2">
        {problem.Constraints.split(',').map((constraint, index) => (
          <li key={index} className="text-sm">{constraint.trim()}</li>
        ))}
      </ul>
    </div>
  </div>
)}
          </>
        );

      case 'editorial':
        return (
          <div className="prose prose-invert max-w-none">
            <h2 className="text-xl font-bold mb-4">Editorial</h2>
            <p>The official editorial and approach for this problem will be explained here. It often includes insights into the optimal solution, time/space complexity analysis, and common pitfalls.</p>
            {/* You would fetch and render the editorial content here */}
          </div>
        );

     case 'solutions':
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Solutions</h2>
      <div className="space-y-6">
        {
        problem.referenceSolution?.length > 0 ? (
          problem.referenceSolution.map((solution, index) => (
            <div key={index} className="border border-base-300 rounded-lg overflow-hidden">
              <div className="bg-base-200 px-4 py-2 flex justify-between items-center">
                
                <span className="font-semibold">{solution.language}</span>
                {/* Optional: Add a copy button */}
                <button 
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigator.clipboard.writeText(solution.completeCode)}
                >
                  Copy
                </button>
              </div>
              
              {/* --- THIS IS THE UPDATED PART --- */}
              <SyntaxHighlighter
                language={solution.language.toLowerCase()=="c++" ? "cpp" : solution.language.toLowerCase()} // e.g., 'javascript', 'python'
                style={vscDarkPlus}
                showLineNumbers={true} // Optional: for line numbers
                customStyle={{
                  margin: 0, // Remove default margin
                  borderRadius: '0 0 0.5rem 0.5rem', // Match parent border radius
                  padding: '1.25rem 1rem', // Add some padding
                  backgroundColor: '#1E1E1E' // The actual VS Code dark background color
                }}
                codeTagProps={{
                  style: {
                    fontFamily: '"Fira Code", "Dank Mono", monospace', // Use a nice coding font
                    fontSize: '0.875rem' // 14px
                  }
                }}
              >
                {solution.completeCode}
              </SyntaxHighlighter>

            </div>
          ))
        ) : (
          <p className="text-base-content/60 mt-4">Solutions will be available after you solve the problem or are provided by the platform.</p>
        )}
      </div>
    </div>
  );
      case 'submissions':
        return (
          <div>
            <h2 className="text-xl font-bold mb-4">My Submissions</h2>
            <div className="text-base-content/60">
              {/* You would integrate your SubmissionHistory component here */}
               <SubmissionHistory problemId={problemId} />
              {/* <p>Your past submissions for this problem will appear here.</p> */}
            </div>
          </div>
        );

      case 'chatai':
         return (
          <div>
           
            <div className="text-base-content/60">
              <p>Ask our AI assistant for hints, clarifications, or to debug your code.</p>
              {/* Placeholder for a chat interface */}
             <ChatComponent problem={problem}></ChatComponent>
            </div>
          </div>
        );

      default:
        return null;
    }
  }; 
  const tabs = ['description', 'editorial', 'solutions', 'submissions', 'chatai'];


  const currentTestCase = problem?.visibleTestCases[activeTestCaseIndex];
  const currentTestResult = runResult?.rawResults?.[activeTestCaseIndex];

  if (loadingProblem) {
    return (
      <div className="flex justify-center items-center h-screen bg-base-300">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  if (!problem) {
    return <div className="text-center text-error p-10">Failed to load problem.</div>;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-base-200 text-sm font-sans" data-theme="night">
      {/* HEADER WITH RUN/SUBMIT BUTTONS */}
      <ProblemHeader
        onRun={handleRun}
        onSubmit={handleSubmitCode}
        isRunLoading={isRunLoading}
        isSubmitLoading={isSubmitLoading}
      />
      
      <div className="flex-grow h-0">
        <PanelGroup direction="horizontal">
          {/* Left Panel */}
         

      
  
    <Panel defaultSize={50} minSize={30} className="flex flex-col bg-base-100">
      {/* Tabs Header */}
      <div className="flex-shrink-0 border-b border-base-300 px-2">
        <div role="tablist" className="tabs tabs-bordered">
          {tabs.map(tab => (
             <button
              key={tab}
              role="tab"
              className={`tab capitalize ${activeLeftTab === tab ? 'tab-active' : ''}`}
              onClick={() => setActiveLeftTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6 overflow-y-auto flex-grow">
        {renderContent()}
      </div>
    </Panel>
  

          <PanelResizeHandle className="w-1.5 bg-base-300 hover:bg-primary transition-colors cursor-col-resize" />

          {/* Right Panel */}
          <Panel defaultSize={50} minSize={30} className="flex flex-col">
            <div className="flex-shrink-0 p-2 flex justify-between items-center bg-base-300 border-b border-base-100">
              <select className="select select-bordered select-sm" value={selectedLanguage} onChange={handleLanguageChange}>
                {Object.entries(langMap).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
              </select>
              <div className="flex items-center gap-4">
                  <button className="btn btn-ghost btn-sm btn-square"><RefreshCcw size={16}/></button>
                  <button className="btn btn-ghost btn-sm btn-square"><Settings size={16}/></button>
                  <button className="btn btn-ghost btn-sm btn-square"><Expand size={16}/></button>
              </div>
            </div>
            
            {/* === NESTED VERTICAL PANEL GROUP FOR RESIZABLE HEIGHT === */}
            <PanelGroup direction="vertical">
              <Panel defaultSize={60} minSize={20}>
                <div className="h-full">
                  <Editor
                    height="100%"
                    language={selectedLanguage}
                    value={code}
                    onChange={(value) => setCode(value || '')}
                    theme="vs-dark"
                    options={{ minimap: { enabled: false }, scrollBeyondLastLine: false, fontSize: 14 }}
                  />
                </div>
              </Panel>

              <PanelResizeHandle className="h-1.5 bg-base-300 hover:bg-primary transition-colors cursor-row-resize" />

              <Panel defaultSize={40} minSize={20} className="flex flex-col bg-base-200">
                   {/* Header with Tabs */}
                   <div className="flex-shrink-0 px-4 pt-2 border-b border-base-300">
                     <div role="tablist" className="tabs tabs-lifted">
                       <button role="tab" className={`tab ${activeRightBottomTab === 'testcase' ? 'tab-active' : ''}`} onClick={() => setActiveRightBottomTab('testcase')}>
                         Testcase
                       </button>
                       <button role="tab" className={`tab ${activeRightBottomTab === 'result' ? 'tab-active' : ''}`} onClick={() => setActiveRightBottomTab('result')}>
                         Test Result
                       </button>
                     </div>
                   </div>
                   
                   {/* Content Area */}
                   <div className="flex-grow overflow-y-auto p-4">
                     {/* --- TESTCASE VIEW --- */}
                     {activeRightBottomTab === 'testcase' && (
                       <div>
                         <div className="flex items-center gap-2 mb-4 flex-wrap">
                           {allTestCases.map((_, index) => (
                             <button 
                               key={index} 
                               className={`btn btn-sm normal-case ${activeTestCaseIndex === index ? 'btn-neutral' : 'btn-ghost'}`} 
                               onClick={() => setActiveTestCaseIndex(index)}
                             >
                               Case {index + 1}
                             </button>
                           ))}
                          
                         </div>
                         {currentTestCase && (<>
                          <ResultDisplayBox label="Input" content={currentTestCase.input} />
                                  
                                    <ResultDisplayBox label="Expected" content={currentTestCase.output} /></>
                         )}
                       </div>
                     )}
             
                     {/* --- RESULT VIEW --- */}
                     {activeRightBottomTab === 'result' && (
                       <div className='h-full'>
                           {isRunLoading && (
                                <div className="flex w-full flex-col gap-4">
                                    <div className="skeleton h-32 w-full"></div>
                                    <div className="skeleton h-4 w-28"></div>
                                    <div className="skeleton h-4 w-full"></div>
                                    <div className="skeleton h-4 w-full"></div>
                                    <p>Running...</p>
                                </div>
                            )}
                         
                         {runResult && !isRunLoading && (
                           <div className="space-y-4">
                             {/* Overall Status */}
                             {runResult.success ? (
                               <div className="text-success space-y-2">
                                  <h3 className='font-bold text-lg flex items-center gap-2'><CheckCircle2 /> Accepted</h3>
                                  <p className="text-xs text-base-content/70">Runtime: {runResult.runtime}</p>
                               </div>
                             ) : (
                               <div className="text-error space-y-2">
                                 <h3 className='font-bold text-lg flex items-center gap-2'><XCircle /> Wrong Answer</h3>
                                 <p className="text-xs text-base-content/70">Runtime: {runResult.runtime}</p>
                               </div>
                             )}
             
                             {/* Case Selector Pills */}
                             <div className="flex items-center gap-2 mb-4 flex-wrap">
                               {runResult.rawResults?.map((result, index) => (
                                 <button 
                                   key={index}
                                   className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm cursor-pointer transition-colors ${activeTestCaseIndex === index ? 'bg-base-300' : 'bg-transparent hover:bg-base-100'}`}
                                   onClick={() => setActiveTestCaseIndex(index)}
                                 >
                                   <span className={`${result.status_id === 3 ? 'text-success' : 'text-error'}`}>•</span>
                                   <span>Case {index + 1}</span>
                                 </button>
                               ))}
                             </div>
             
                             {/* Detailed I/O for the selected case */}
                             {currentTestResult && (
                               <div className="space-y-4">
                                 <ResultDisplayBox label="Input" content={currentTestCase.input} />
                                    <ResultDisplayBox label="Output" content={currentTestResult?.stdout } />
                                    <ResultDisplayBox label="Expected" content={currentTestCase.output} />
                               </div>
                             )}
                           </div>
                         )}
             
                         {!runResult && !isRunLoading && (
                           <div className="flex justify-center items-center h-full text-base-content/60">
                             <p>Click "Run" or "Submit" to see the results.</p>
                           </div>
                         )}
                       </div>
                     )}
                   </div>
                 </Panel>
            </PanelGroup>
            
          </Panel>
        </PanelGroup>
      </div>

      <dialog id="submission_modal" className="modal">
  <div className="modal-box w-11/12 max-w-md">
    {/* This content is rendered based on the 'submitResult' state */}
    {submitResult ? (
      <>
        {/* --- SUCCESS CASE --- */}
        {submitResult.accepted ? (
          <div className="text-center">
            <CheckCircle2 size={56} className="mx-auto mb-4 text-success" />
            <h3 className="text-2xl font-bold text-success">Accepted</h3>
            <div className="mt-6 text-left space-y-3">
              <div className="flex justify-between p-3 bg-base-200 rounded-lg">
                <span>Runtime:</span>
                <span className="font-semibold">{Number(submitResult.runtime).toFixed(2)} ms</span>
              </div>
              <div className="flex justify-between p-3 bg-base-200 rounded-lg">
                <span>Memory:</span>
                <span className="font-semibold">{Number(submitResult.memory / 1024).toFixed(2)} MB</span>
              </div>
              <div className="flex justify-between p-3 bg-base-200 rounded-lg">
                <span>Test Cases Passed:</span>
                <span className="font-semibold">{submitResult.passesTestCases} / {submitResult.testCaseTotal}</span>
              </div>
            </div>
          </div>
        ) : (
        /* --- FAILURE CASE --- */
          <div className="text-center">
            <XCircle size={56} className="mx-auto mb-4 text-error" />
            <h3 className="text-2xl font-bold text-error">
              {/* Show more specific error title */}
              {submitResult.status === 'wrong' ? 'Wrong Answer' : 'Runtime Error'}
            </h3>
            <div className="mt-6 text-left space-y-3">
                <div className="flex justify-between p-3 bg-base-200 rounded-lg">
                    <span>Test Cases Passed:</span>
                    <span className="font-semibold text-error">{submitResult.passesTestCases} / {submitResult.testCaseTotal}</span>
                </div>
                {/* Show the specific error message from the backend */}
                {submitResult.errorMessage && (
                    <div>
                        <h4 className="font-semibold mt-4 mb-2">Error Details:</h4>
                        <pre className="bg-base-200 p-3 rounded-lg text-xs text-error-content whitespace-pre-wrap">
                            {submitResult.errorMessage}
                        </pre>
                    </div>
                )}
            </div>
          </div>
        )}
      </>
    ) : (
      // Fallback content if something goes wrong and result is null
      <div className="text-center">
        <h3 className="font-bold text-lg">Processing...</h3>
        <p>Waiting for submission result.</p>
      </div>
    )}

    {/* Modal close button */}
    <div className="modal-action">
      <form method="dialog">
        <button className="btn">Close</button>
      </form>
    </div>
  </div>
</dialog>
    </div>
  );
};

export default ProblemPage;  