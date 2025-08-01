import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import axiosClient from '../utills/axiosClient';
import { useSelector } from 'react-redux';
import { Play, Check, Search, ArrowLeft, Star } from 'lucide-react';
import classNames from 'classnames';

export default function FavoritesPage() {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // State for data
  const [favoriteProblems, setFavoriteProblems] = useState([]);
  const [solvedProblems, setSolvedProblems] = useState([]);
  
  // State for search functionality
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch favorite problem IDs and their details
  useEffect(() => {
    // Get favorite problem IDs from localStorage
    const favoriteIds = JSON.parse(localStorage.getItem('favoriteProblemIds')) || [];

    if (favoriteIds.length > 0) {
      axiosClient
        .post('/problem/problemsInBatches', { ids: favoriteIds })
        .then(res => setFavoriteProblems(res.data.sort((a, b) => a.problemId - b.problemId))) 
        .catch(console.error);
    }
  }, []);

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

  const solvedIds = solvedProblems.map(p => p._id);

  const difficultyStats = {
    Easy: favoriteProblems.filter(q => q.difficulty === 'easy').length,
    Medium: favoriteProblems.filter(q => q.difficulty === 'medium').length,
    Hard: favoriteProblems.filter(q => q.difficulty === 'hard').length,
  };

  const difficultySolved = {
    Easy: favoriteProblems.filter(q => q.difficulty === 'easy' && solvedIds.includes(q._id)).length,
    Medium: favoriteProblems.filter(q => q.difficulty === 'medium' && solvedIds.includes(q._id)).length,
    Hard: favoriteProblems.filter(q => q.difficulty === 'hard' && solvedIds.includes(q._id)).length,
  };
  
  const solvedCount = difficultySolved.Easy + difficultySolved.Medium + difficultySolved.Hard;
  const progressPercent = favoriteProblems.length > 0 ? (solvedCount / favoriteProblems.length) * 100 : 0;
  
  // Filter questions based on search query
  const filteredFavorites = favoriteProblems.filter(q => 
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
    <div className="bg-[#1A1A1A] p-4 sm:p-6 lg:p-8 flex flex-col lg:flex-row gap-8 text-gray-300 min-h-screen font-sans">
      {/* Left Panel */}
      <aside className="w-full lg:w-[320px] flex-shrink-0 flex flex-col gap-6">
        <div className="bg-[#282828] p-5 rounded-xl flex flex-col shadow-lg">
          <div className='flex flex-col items-center text-center'>
            <div className="bg-yellow-500 p-4 rounded-lg shadow-inner text-white">
              <Star size={32} fill="currentColor" />
            </div>
            <h2 className="text-2xl font-bold mt-4 text-white">Favorite Problems</h2>
            <p className="text-sm text-gray-400 mt-1">{`${user?.firstName || 'User'} · ${favoriteProblems.length} questions`}</p>
          </div>
          <div className="flex gap-2 mt-5">
            <button className="btn btn-sm bg-green-500 text-white hover:bg-green-600 flex-grow"><Play size={16} className="mr-1" />Practice All</button>
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
                        className="text-yellow-500"
                        strokeDasharray={`${progressPercent}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                    />
                </svg>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <div className="text-4xl font-bold text-white">{solvedCount}<span className='text-2xl text-gray-400'>/{favoriteProblems.length}</span></div>
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
            <NavLink to="/" className="btn btn-outline btn-accent">
                <ArrowLeft size={20} />
                Back
            </NavLink>
            <div className="relative flex-grow max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
                <input 
                  type="text" 
                  placeholder="Search favorites..." 
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
                {filteredFavorites.map((q, idx) => (
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
  );
}