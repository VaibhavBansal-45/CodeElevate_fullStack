import { useEffect, useState } from 'react';
// Using react-router-dom is standard for web apps
import { NavLink, useParams, useNavigate } from 'react-router';
import axiosClient from '../utills/axiosClient';
import { useSelector } from 'react-redux';
import { Play, Plus, MoreHorizontal, Check, Search, Edit, Trash2, ArrowLeft } from 'lucide-react';
import classNames from 'classnames';

// Modal Component for adding questions, editing list name, and deleting list
const Modal = ({ children, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
      <div className="bg-[#282828] p-5 rounded-lg max-w-sm w-full relative">
        <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2">✕</button>
        {children}
      </div>
    </div>
  );
};


export default function ListDetail() {
  const { user } = useSelector((state) => state.auth);
  const { id } = useParams();
  const navigate = useNavigate(); 

  // State for data
  const [listName, setListName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);

  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');

  // State for Modals
  
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [newListName, setNewListName] = useState(listName);


  // Fetch list details and questions
  useEffect(() => {
    const storedLists = JSON.parse(localStorage.getItem('myLists')) || [];
    const currentList = storedLists.find(list => list.id === id);

    if (currentList) {
      setListName(currentList.name);
      setNewListName(currentList.name);
      if (currentList.questions.length > 0) {
        axiosClient
          .post('/problem/problemsInBatches', { ids: currentList.questions })
          .then(res => setQuestions(res.data.sort((a, b) => a.problemId - b.problemId)))
          .catch(console.error);
      }
    } else {
        // If list not found, maybe navigate back or show an error
        navigate('/');
    }
  }, [id, navigate]);

  // Fetch user's solved problems
  useEffect(() => {
    const fetchSolved = async () => {
      if (!user) {
        setSolvedProblems([]);
        return;
      }
      try {
        const { data } = await axiosClient.get("/problem/problemSolvedByUser");
        setSolvedProblems(data);
      } catch (err) {
        console.error("Error fetching solved list:", err);
      }
    };
    fetchSolved();
  }, [user]);



  const handleEditListName = () => {
    const storedLists = JSON.parse(localStorage.getItem('myLists')) || [];
    const updatedLists = storedLists.map(list => {
      if (list.id === id) {
        return { ...list, name: newListName };
      }
      return list;
    });
    localStorage.setItem('myLists', JSON.stringify(updatedLists));
    setListName(newListName);
    setEditModalOpen(false);
  };

  const handleDeleteList = () => {
    const storedLists = JSON.parse(localStorage.getItem('myLists')) || [];
    const updatedLists = storedLists.filter(list => list.id !== id);
    localStorage.setItem('myLists', JSON.stringify(updatedLists));
    
    setDeleteModalOpen(false);
    // Navigate back to the homepage after deletion
    navigate('/');
  };

  const solvedIds = solvedProblems.map(p => p._id);

  const difficultyStats = {
    Easy: questions.filter(q => q.difficulty === 'easy').length,
    Medium: questions.filter(q => q.difficulty === 'medium').length,
    Hard: questions.filter(q => q.difficulty === 'hard').length,
  };

  const difficultySolved = {
    Easy: questions.filter(q => q.difficulty === 'easy' && solvedIds.includes(q._id)).length,
    Medium: questions.filter(q => q.difficulty === 'medium' && solvedIds.includes(q._id)).length,
    Hard: questions.filter(q => q.difficulty === 'hard' && solvedIds.includes(q._id)).length,
  };

  const solvedCount = difficultySolved.Easy + difficultySolved.Medium + difficultySolved.Hard;
  const progressPercent = questions.length > 0 ? (solvedCount / questions.length) * 100 : 0;

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyClass = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      <div className="bg-[#1A1A1A] p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 text-gray-300 min-h-screen font-sans">
        {/* Left Panel */}
        <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-[#282828] p-5 rounded-xl flex flex-col shadow-lg">
            <div className='flex flex-col items-center text-center'>
              <div className="bg-gray-700 p-4 rounded-lg shadow-inner">
                <img src="https://img.icons8.com/office/40/000000/checklist.png" alt="checklist icon" />
              </div>
              <h2 className="text-2xl font-bold mt-4 text-white">{listName}</h2>
              <p className="text-sm text-gray-400 mt-1">{`${user?.firstName || 'User'} · ${questions.length} questions`}</p>
            </div>
            <div className="flex gap-2 mt-5">
              <button className="btn btn-sm bg-green-500 text-white hover:bg-green-600 flex-grow"><Play size={16} className="mr-1" />Practice</button>
              <div className="dropdown dropdown-end">
                <button tabIndex={0} className="btn btn-sm btn-square bg-[#383838] border-none"><MoreHorizontal size={16} /></button>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-[#383838] rounded-box w-52 z-[1]">
                 
                  <li><a onClick={() => setEditModalOpen(true)}><Edit size={16} className="mr-2" />Edit Name</a></li>
                  <li><a onClick={() => setDeleteModalOpen(true)} className="text-red-500 hover:text-red-400"><Trash2 size={16} className="mr-2" />Delete List</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-[#282828] p-5 rounded-xl flex flex-col shadow-lg">
            <div className='flex justify-between items-center mb-4'>
              <h3 className="font-semibold text-white">Progress</h3>
            </div>
            <div className="relative w-48 h-48 mx-auto">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="text-gray-700"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="currentColor" strokeWidth="2"
                />
                <path
                  className="text-green-500"
                  strokeDasharray={`${progressPercent}, 100`}
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                />
              </svg>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="text-4xl font-bold text-white">{solvedCount}<span className='text-2xl text-gray-400'>/{questions.length}</span></div>
                <div className="text-sm text-gray-400">Solved</div>
              </div>
            </div>
            <div className='grid grid-cols-3 gap-3 mt-6 text-center'>
              <div className='bg-[#383838] p-3 rounded-lg'>
                <div className='text-sm text-green-400'>Easy</div>
                <div className='font-bold text-white mt-1'>{difficultySolved.Easy}/{difficultyStats.Easy}</div>
              </div>
              <div className='bg-[#383838] p-3 rounded-lg'>
                <div className='text-sm text-yellow-400'>Medium</div>
                <div className='font-bold text-white mt-1'>{difficultySolved.Medium}/{difficultyStats.Medium}</div>
              </div>
              <div className='bg-[#383838] p-3 rounded-lg'>
                <div className='text-sm text-red-400'>Hard</div>
                <div className='font-bold text-white mt-1'>{difficultySolved.Hard}/{difficultyStats.Hard}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel */}
        <main className="flex-1 flex flex-col">
          <div className="flex items-center mb-4 flex-shrink-0 gap-4">
            {/* BACK TO HOMEPAGE BUTTON */}
            <NavLink to="/"className="btn btn-outline btn-accent">
                <ArrowLeft size={20} />
                Back
            </NavLink>
            <div className="relative flex-grow max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
              <input
                type="text"
                placeholder="Search questions..."
                className="input input-bordered bg-[#282828] w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="bg-[#282828] rounded-xl shadow-lg overflow-hidden flex-grow">
            <div className="overflow-y-auto h-full">
              <table className="table">
                <thead className='text-gray-400 text-sm'>
                  <tr>
                    <th>Status</th>
                    <th>#</th>
                    <th>Title</th>
                    <th>Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuestions.map((q, idx) => (
                    <tr key={q._id} className="hover:bg-[#333333]">
                      <td className='w-12 text-center'>
                        {solvedIds.includes(q._id) && <Check className="text-green-500 mx-auto" size={22} />}
                      </td>
                      <td className='text-gray-500'>{String(idx + 1).padStart(2, '0')}</td>
                      <td>
                        <NavLink to={`/problem/${q._id}`} className="group flex items-baseline gap-3" title={q.title}>
                          <span className="font-medium text-sm sm:text-base text-gray-300 group-hover:text-blue-400 truncate">{q.title}</span>
                        </NavLink>
                      </td>
                      <td className={classNames("font-semibold", getDifficultyClass(q.difficulty))}>
                        {q.difficulty?.charAt(0).toUpperCase() + q.difficulty?.slice(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
   

      <Modal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)}>
        <h3 className="font-bold text-lg text-white">Edit List Name</h3>
        <div className="py-4">
          <input
            type="text"
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            className="input input-bordered w-full"
          />
        </div>
        <div className="modal-action mt-4">
          <button className="btn btn-primary" onClick={handleEditListName}>Save</button>
          <button className="btn btn-ghost" onClick={() => setEditModalOpen(false)}>Cancel</button>
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <h3 className="font-bold text-lg text-white">Delete List</h3>
        <p className="py-4">Are you sure you want to delete the "{listName}" list? This action cannot be undone.</p>
        <div className="modal-action mt-4">
          <button className="btn btn-error" onClick={handleDeleteList}>Delete</button>
          <button className="btn btn-ghost" onClick={() => setDeleteModalOpen(false)}>Cancel</button>
        </div>
      </Modal>
    </>
  );
}