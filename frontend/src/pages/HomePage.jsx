import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useDebounce } from '../useDebounce';
import axiosClient from '../utills/axiosClient';
import AddQuestionsModalRedux from '../component/addQuestionsToList';
import { fetchProblems, logoutUser } from '../authSlice';
import {
    Terminal, User, Star, Settings, LogOut, Search, ArrowUpDown, Filter, ShieldCheck, Plus,
    ChevronDown, Wand2, X, RefreshCw, SearchX, AlertTriangle, List, Heart, Database, Code,
} from 'lucide-react';



  


// Helper Icon Component (No changes)
const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const topics = ['All Topics', 'Algorithms', 'Database', 'Shell', 'Concurrency', 'JavaScript', 'Pandas'];

// All modal and sidebar components are unchanged
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
         <div className="modal modal-open bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-[#1f2937] rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700">
                <div className="flex items-start">
                    <div className="mr-4 flex-shrink-0 bg-red-800/20 rounded-full p-2">
                        <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">{title}</h3>
                        <p className="text-sm text-gray-400 mt-2">{children}</p>
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={onClose} className="btn btn-ghost">Cancel</button>
                    <button onClick={onConfirm} className="btn btn-error">Confirm</button>
                </div>
            </div>
        </div>
    );
};

const AddNewListModal = ({ isOpen, onClose, onAddNewList }) => {
    const [listName, setListName] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        if (listName.trim()) {
            onAddNewList(listName.trim());
            setListName("");
            onClose();
        }
    };
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]">
            <div className="bg-[#1f2937] rounded-lg shadow-xl p-6 w-full max-w-sm border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">Create New List</h3>
                <form onSubmit={handleSubmit}>
                    <input type="text" placeholder="Enter list name" className="input input-bordered w-full bg-gray-800" value={listName} onChange={(e) => setListName(e.target.value)} autoFocus />
                    <div className="mt-6 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
                        <button type="submit" className="btn btn-primary">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const MyListsSidebar = ({ onAddNewListClick, myLists, favoriteIds,onDeleteList }) => {
    const navigate = useNavigate();
    const [selectedList, setSelectedList] = useState(null);

    const handleNavigate = (list) => {
        setSelectedList(list.id);
        navigate(`/list/${list.id}`, { state: { listName: list.name } });
    };

    return (
        <div className="w-60 bg-[#1f2937] h-full p-4 flex-col gap-2 border-r border-gray-700 flex-shrink-0 hidden md:flex">
            <div className="flex items-center justify-between px-2 mb-2">
                <h2 className="text-xs font-semibold uppercase text-gray-400">My Lists</h2>
                <div className="dropdown dropdown-end">
                    <label tabIndex={0} className="btn btn-ghost btn-xs">
                        <Plus size={16} /> <ChevronDown size={14} />
                    </label>
                    <ul tabIndex={0} className="dropdown-content menu p-2 shadow-xl bg-gray-800 rounded-box w-52 z-50">
                        <li><a onClick={onAddNewListClick}><Plus size={16} /> New List</a></li>
                        
                    </ul>
                </div>
            </div>
            <div className="flex flex-col gap-1">
                <div onClick={() => handleNavigate({ id: 'favorites', name: 'Favorites' })} className={`flex items-center justify-between gap-4 px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 ${selectedList === 'favorites' ? 'bg-gray-700 text-white' : 'hover:bg-gray-700/50'}`}>
                    <div className="flex items-center gap-4">
                        <Heart className="w-4 h-4 text-pink-400" />
                        <span>Favorites</span>
                    </div>
                    <span className="text-xs bg-gray-600 rounded-full px-2">{favoriteIds.size}</span>
                </div>
                {myLists.map(list => (
                    <div key={list.id} className={`group flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium rounded-md cursor-pointer transition-colors duration-200 ${selectedList === list.id ? 'bg-gray-700 text-white' : 'hover:bg-gray-700/50'}`}>
                                           <div onClick={() => handleNavigate(list)} className="flex items-center gap-4 truncate">
                                              <List className="w-4 h-4" />
                                              <span className='truncate'>{list.name}</span>
                                           </div>
                                           <button onClick={(e) => { e.stopPropagation(); onDeleteList(list); }} className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-red-400">
                                               <X size={14} />
                                           </button>
                                       </div>
                ))}
            </div>
        </div>
    );
};

const EmptyTopicMessage = ({ topic }) => {
    return (
        <div className="text-center py-20 flex flex-col items-center">
            <Database className="h-24 w-24 text-gray-700" strokeWidth={1} />
            <h3 className="text-2xl font-semibold mt-8 text-gray-500">More '{topic}' Problems Coming Soon!</h3>
            <p className="text-gray-500 mt-2 max-w-sm">
                We don't have enough problems for this topic yet, but our team is working hard to add them. Please check back later!
            </p>
        </div>
    );
};


function FiltersPanel({ filters, onChange, onClose, onReset }) {
    const FILTER_TAGS = ['All', 'Array', 'LinkedList', 'Math', 'DP', 'Graph', 'String'];
    return (
        <div className="
      absolute right-0 top-full mt-2
      p-6 bg-[#1f2937] rounded-xl shadow-xl border border-gray-700
      flex flex-col space-y-6 w-max max-w-xs z-50
    ">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white">Filters</h3>
                <div className="flex items-center space-x-2">
                    <button className="btn btn-ghost btn-xs p-1" onClick={onReset} title="Reset all filters">
                        <RefreshCw className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                    <button className="btn btn-ghost btn-xs p-1" onClick={onClose} title="Close">
                        <X className="w-4 h-4 text-gray-400 hover:text-white" />
                    </button>
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold mb-2 text-gray-300">Status</p>
                <div className="flex flex-wrap gap-2">
                    {['All', 'Solved', 'Unsolved'].map(opt => (
                        <button
                            key={opt}
                            className={`btn btn-xs rounded-full ${filters.status === opt.toLowerCase()
                                ? 'btn-info text-black'
                                : 'btn-outline btn-info'
                                }`}
                            onClick={() => onChange({ ...filters, status: opt.toLowerCase() })}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold mb-2 text-gray-300">Difficulty</p>
                <div className="flex flex-wrap gap-2">
                    {['All', 'Easy', 'Medium', 'Hard'].map(opt => (
                        <button
                            key={opt}
                            className={`btn btn-xs rounded-full ${filters.difficulty === opt.toLowerCase()
                                ? 'btn-warning text-black'
                                : 'btn-outline btn-warning'
                                }`}
                            onClick={() => onChange({ ...filters, difficulty: opt.toLowerCase() })}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <p className="text-sm font-semibold mb-2 text-gray-300">Tags</p>
                <div className="flex flex-wrap gap-2">
                    {FILTER_TAGS.map(tag => (
                        <button
                            key={tag}
                            className={`btn btn-xs rounded-full ${filters.tag === tag.toLowerCase()
                                ? 'btn-success text-black'
                                : 'btn-outline btn-success'
                                }`}
                            onClick={() => onChange({ ...filters, tag: tag.toLowerCase() })}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
export default function Homepage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 400);
    const [searchResults, setSearchResults] = useState([]);
    const [searchMeta, setSearchMeta] = useState({ currentPage: 1, totalPages: 1, totalProblems: 0, limit: 10 });
    const [filters, setFilters] = useState({ difficulty: "all", tag: "all", status: "all" });
    const [sort, setSort] = useState({ key: 'id', order: 'asc' });
    const [showFilters, setShowFilters] = useState(false);
    const [activeTopics, setActiveTopics] = useState(["All Topics"]);
    const [solvedProblems, setSolvedProblems] = useState([]);
     const [isAddQModalOpen, setAddQModalOpen] = useState(false);
  const [activeListId, setActiveListId]   = useState(null);
    const { list: allProblems, meta: allMeta, status } = useSelector((state) => state.problems);

    const [myLists, setMyLists] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [isLogoutModalOpen, setLogoutModalOpen] = useState(false);
    const [isDeleteListModalOpen, setDeleteListModalOpen] = useState(false);
        const [listToDelete, setListToDelete] = useState(null);
    const [isAddListModalOpen, setAddListModalOpen] = useState(false);
    const [problemList, setProblemList] = useState([]);

    useEffect(() => {
        const storedFavorites = localStorage.getItem('favoriteProblemIds');
        if (storedFavorites) {
            setFavoriteIds(new Set(JSON.parse(storedFavorites)));
        }
        const storedLists = localStorage.getItem('myLists');
        if (storedLists) {
            setMyLists(JSON.parse(storedLists));
        }
    }, []);

    useEffect(() => {
        if (!debouncedSearch.trim()) {
            dispatch(fetchProblems({ page, limit }));
        }
    }, [dispatch, page, limit, debouncedSearch]);

    useEffect(() => {
        const updatedProblemList = allProblems.map(p => ({
            ...p,
            isFavorited: favoriteIds.has(p._id)
        }));
        setProblemList(updatedProblemList);
    }, [allProblems, favoriteIds]);

    useEffect(() => {
        setPage(1);
        const fetchSearch = async () => {
            if (debouncedSearch.trim()) {
                try {
                    const { data } = await axiosClient.get("/problem/search", { params: { query: debouncedSearch } });
                    const results = data.data || [];
                    const updatedResults = results.map(p => ({ ...p, isFavorited: favoriteIds.has(p._id) }));
                    setSearchResults(updatedResults);
                    setSearchMeta({ currentPage: 1, totalPages: Math.ceil(results.length / limit) || 1, totalProblems: results.length, limit: limit });
                } catch (err) {
                    console.error("Search error:", err);
                    setSearchResults([]);
                    setSearchMeta((m) => ({ ...m, totalProblems: 0, totalPages: 1 }));
                }
            } else {
                setSearchResults([]);
            }
        };
        fetchSearch();
    }, [debouncedSearch, limit, favoriteIds]);

    useEffect(() => {
        const fetchSolved = async () => {
            if (!user) { setSolvedProblems([]); return; }
            try {
                const { data } = await axiosClient.get("/problem/problemSolvedByUser");
                setSolvedProblems(data);
            } catch (err) { console.error("Error fetching solved list:", err); }
        };
        fetchSolved();
    }, [user]);

    const handleLogout = () => setLogoutModalOpen(true);

    const confirmLogout = () => {
        dispatch(logoutUser());
        setSolvedProblems([]);
        setLogoutModalOpen(false);
        navigate('/login');
    };

    const handleToggleFavorite = async (problemId, currentIsFavorited) => {
        try {
            await axiosClient.post(`/problem/favorite/${problemId}`, { isFavorited: !currentIsFavorited });

            const newFavoriteIds = new Set(favoriteIds);
            if (currentIsFavorited) {
                newFavoriteIds.delete(problemId);
            } else {
                newFavoriteIds.add(problemId);
            }
            setFavoriteIds(newFavoriteIds);
            localStorage.setItem('favoriteProblemIds', JSON.stringify(Array.from(newFavoriteIds)));

        } catch (err) {
            console.error("Favorite toggle error:", err);
        }
    };
  const handlePremium = () => {
  navigate('/profile');
};

    const handleAddNewList = (listName) => {
    const id = listName.toLowerCase().replace(/\s+/g, '-');
    const newList = { id, name: listName, questions: [] };
    const updated = [...myLists, newList];
    setMyLists(updated);
    localStorage.setItem('myLists', JSON.stringify(updated));

    // नया लिस्ट id सेव करके तुरंत सवाल ऐड मोडल खोलो
    setActiveListId(id);
    setAddListModalOpen(false);
    setAddQModalOpen(true);
  };

   const handleAddQuestions = (ids) => {
    const updated = myLists.map(lst =>
      lst.id === activeListId
        ? { ...lst, questions: [...(lst.questions||[]), ...ids] }
        : lst
    );
    setMyLists(updated);
    localStorage.setItem('myLists', JSON.stringify(updated));
    setAddQModalOpen(false);
  };

      const handleDeleteListClick = (list) => {
        setListToDelete(list);
        setDeleteListModalOpen(true);
    };

    const confirmDeleteList = () => {
        if (listToDelete) {
            const updatedLists = myLists.filter(list => list.id !== listToDelete.id);
            setMyLists(updatedLists);
            localStorage.setItem('myLists', JSON.stringify(updatedLists));
        }
        setDeleteListModalOpen(false);
        setListToDelete(null);
    };

    const toggleTopic = (topic) => setActiveTopics([topic]);
    const handleReset = () => setFilters({ difficulty: "all", tag: "all", status: "all" });

    const isSearching = debouncedSearch.trim().length > 0;
    const baseList = isSearching ? searchResults : problemList;
    const meta = isSearching ? searchMeta : allMeta;

    const { problemsToRender, showEmptyTopicMessage, activeTopicForMessage } = useMemo(() => {
        const topicFiltered = baseList.filter((problem) => {
            return activeTopics.includes("All Topics") || activeTopics.some(t => problem.topic === t);
        });
        
        const isTopicEmpty = topicFiltered.length === 0 && !activeTopics.includes("All Topics");

        const fullyFiltered = topicFiltered.filter((problem) => {
            const diffMatch = filters.difficulty === "all" || problem.difficulty === filters.difficulty;
            const tagMatch = filters.tag === "all" || problem.tags?.toLowerCase() === filters.tag;
            const isSolved = solvedProblems.some((sp) => sp._id === problem._id);
            let statusMatch = true;
            if (filters.status === "solved") statusMatch = isSolved;
            else if (filters.status === "unsolved") statusMatch = !isSolved;
            return diffMatch && tagMatch && statusMatch;
        });

        const difficultyOrder = { 'easy': 1, 'medium': 2, 'hard': 3 };
        const sorted = [...fullyFiltered].sort((a, b) => {
            const order = sort.order === 'asc' ? 1 : -1;
            if (sort.key === 'id') return (a.id - b.id) * order;
            if (sort.key === 'difficulty') return (difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]) * order;
            if (typeof a[sort.key] === 'string') return a[sort.key].localeCompare(b[sort.key]) * order;
            return 0;
        });

        const finalProblems = isSearching ? sorted.slice((page - 1) * limit, page * limit) : sorted;

        return {
            problemsToRender: finalProblems,
            showEmptyTopicMessage: isTopicEmpty,
            activeTopicForMessage: activeTopics[0]
        };
    }, [baseList, filters, solvedProblems, activeTopics, sort, isSearching, page, limit]);

    const activeFilterCount = useMemo(() => ["difficulty", "tag", "status"].reduce((cnt, key) => (filters[key] !== "all" ? cnt + 1 : cnt), 0), [filters]);
    const areFiltersActive = activeFilterCount > 0;

    const goPrev = () => setPage((p) => Math.max(1, p - 1));
    const goNext = () => setPage((p) => Math.min(meta.totalPages, p + 1));
    

    return (
        <div className="h-screen flex flex-col bg-[#111827] text-gray-300 overflow-hidden" data-theme="dark">
            <ConfirmationModal isOpen={isLogoutModalOpen} onClose={() => setLogoutModalOpen(false)} onConfirm={confirmLogout} title="Confirm Logout">
                Are you sure you want to log out?
            </ConfirmationModal>
            <AddNewListModal
      isOpen={isAddListModalOpen}
      onClose={() => setAddListModalOpen(false)}
      onAddNewList={handleAddNewList}
    />
     <AddQuestionsModalRedux
      isOpen={isAddQModalOpen}
      onClose={() => setAddQModalOpen(false)}
      onAdd={handleAddQuestions}
      limit={10}
    />
                  <ConfirmationModal isOpen={isDeleteListModalOpen} onClose={() => setDeleteListModalOpen(false)} onConfirm={confirmDeleteList} title="Delete List">
                Are you sure you want to delete the list "{listToDelete?.name}"? This action cannot be undone.
            </ConfirmationModal>

            <nav className="bg-[#1f2937] shadow-lg sticky top-0 z-40 h-16 flex-shrink-0 border-b border-gray-700">
                <div className="navbar container mx-auto h-full">
                    <div className="navbar-start">
                        <NavLink to="/" className="btn btn-ghost text-xl normal-case gap-2">
                            <Terminal className="text-blue-400" />
                            <span className="font-bold text-white">CodeElevate</span>
                        </NavLink>
                    </div>
                    <div className="navbar-end">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <button onClick={handlePremium}className="btn btn-sm btn-warning gap-2 hidden sm:inline-flex !text-black">
                                    <Star size={16} /> Premium
                                </button>
                                <div className="dropdown dropdown-end">
                                    <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
                                        <div className="w-10 rounded-full ring-2 ring-blue-400 ring-offset-gray-800 ring-offset-2">
                                            <img src={user.avatarUrl} alt="User" />
                                        </div>
                                    </label>
                                    <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 p-2 shadow bg-gray-800 rounded-box w-52 z-[1]">
                                        <li className="p-2 font-semibold">Hello, {user.firstName}</li>
                                        <div className="divider my-0" />
                                        <li><NavLink to="/profile"><User size={16} /> Profile</NavLink></li>
                                        <li><NavLink to="/settings"><Settings size={16} /> Settings</NavLink></li>
                                        {user.role === "admin" && (<li><NavLink to="/admin"><ShieldCheck size={16} /> Admin Panel</NavLink></li>)}
                                        <div className="divider my-0" />
                                        <li><button onClick={handleLogout} className="text-red-400 w-full flex items-center gap-2"><LogOut size={16} /> Logout</button></li>
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <NavLink to="/login" className="btn btn-ghost">Login</NavLink>
                                <NavLink to="/signup" className="btn btn-primary">Sign Up</NavLink>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <div className="flex flex-1 overflow-hidden">
                <MyListsSidebar onAddNewListClick={() => setAddListModalOpen(true)} myLists={myLists} favoriteIds={favoriteIds} onDeleteList={handleDeleteListClick}  />

                <main className="flex flex-col flex-grow p-2 sm:p-4 lg:p-6 overflow-hidden">
                    <header className="space-y-4 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                            {topics.map((topic) => (
                                <button key={topic} onClick={() => toggleTopic(topic)} className={`btn btn-xs rounded-full ${activeTopics.includes(topic) ? "btn-neutral" : "btn-ghost"}`}>
                                    {topic}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center w-full gap-2">
                            <div className="relative flex-grow max-w-lg">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 z-10" />
                                <input type="text" placeholder="Search..." className="input input-xs sm:input-sm input-bordered w-full pl-10 bg-[#1f2937]" onChange={(e) => setSearch(e.target.value)} />
                            </div>

                            <div className="dropdown dropdown-end">
                                <label tabIndex={0} className="btn btn-xs sm:btn-sm btn-ghost gap-1">
                                    <ArrowUpDown className="w-4 h-4" />
                                    <span className="hidden sm:inline">Sort</span>
                                </label>
                                <ul tabIndex={0} className="dropdown-content menu p-2 shadow-xl bg-gray-800 rounded-box w-52 z-30">
                                    <li><a onClick={() => setSort({ key: 'title', order: 'asc' })}>Title (A-Z)</a></li>
                                    <li><a onClick={() => setSort({ key: 'title', order: 'desc' })}>Title (Z-A)</a></li>
                                    <li><a onClick={() => setSort({ key: 'difficulty', order: 'asc' })}>Difficulty (Easy-Hard)</a></li>
                                    <li><a onClick={() => setSort({ key: 'difficulty', order: 'desc' })}>Difficulty (Hard-Easy)</a></li>
                                </ul>
                            </div>

                            <div className="relative">
                                <button className="btn btn-xs sm:btn-sm btn-ghost gap-1" onClick={() => setShowFilters(v => !v)}>
                                    <Filter className="w-4 h-4" />
                                    <span className="hidden sm:inline">Filter</span>
                                </button>
                                {areFiltersActive && (<div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs font-bold pointer-events-none">{activeFilterCount}</div>)}
                                {showFilters && (<FiltersPanel filters={filters} onChange={setFilters} onClose={() => setShowFilters(false)} onReset={handleReset} />)}
                            </div>
                        </div>
                    </header>
                    <div className="flex-1 overflow-y-auto pr-2">
                        <div className="space-y-1.5">
                            {/* START: RESPONSIVE UPDATE */}
                            <div className="px-4 py-2 grid grid-cols-[2rem_1fr_6rem_2rem] sm:grid-cols-[2rem_1fr_6rem_6rem_2rem] gap-4 text-xs font-semibold text-gray-500 uppercase">
                                <span></span>
                                <span>Title</span>
                                <span className="text-center">Difficulty</span>
                                <span className="text-center hidden sm:block">Tags</span>
                                <span className="text-center hidden sm:block">Fav</span>
                            </div>
                            {/* END: RESPONSIVE UPDATE */}

                            {status === "loading" && !isSearching ? (
                                Array.from({ length: limit }).map((_, i) => (<div key={i} className="h-12 bg-gray-800 rounded-lg animate-pulse"></div>))
                            ) : showEmptyTopicMessage ? (
                                <EmptyTopicMessage topic={activeTopicForMessage} />
                            ) : problemsToRender.length > 0 ? (
                                problemsToRender.map((problem,idx) => {
                                    const isSolved = solvedProblems.some(sp => sp._id === problem._id);
                                     const number = (page - 1) * limit + idx + 1;
                                    return (
                                        <div key={problem._id} className="bg-gray-800 hover:bg-gray-700/50 transition-colors duration-200 rounded-lg">
                                            {/* START: RESPONSIVE UPDATE */}
                                            <div className="px-4 py-3 grid grid-cols-[2rem_1fr_6rem_2rem] sm:grid-cols-[2rem_1fr_6rem_6rem_2rem] gap-4 items-center">
                                                <div className="flex items-center justify-center h-full">
                                                    {isSolved && <CheckCircleIcon />}
                                                </div>

                                                <div className="min-w-0"> {/* Wrapper to enforce truncation */}
                                                    <NavLink to={`/problem/${problem._id}`} className="group flex items-baseline gap-3" title={problem.title}>
                                                        <span className="text-gray-500 text-sm">{number}.</span>
                                                        <span className="font-medium text-sm sm:text-base text-gray-300 group-hover:text-blue-400 truncate">
                                                            {problem.title}
                                                        </span>
                                                    </NavLink>
                                                </div>

                                                <div className={`text-center font-medium text-xs sm:text-sm capitalize ${getDifficultyBadgeColor(problem.difficulty)}`}>
                                                    {problem.difficulty}
                                                </div>

                                                <div className="text-center hidden sm:block"> {/* Hide tags on small screens */}
                                                    {problem.tags && (<span className="text-xs bg-gray-700 text-gray-300 rounded-full px-2 py-0.5 capitalize">{problem.tags}</span>)}
                                                </div>

                                                <div className="flex justify-center">
                                                    <button className="btn btn-ghost btn-xs p-1" onClick={(e) => { e.stopPropagation(); handleToggleFavorite(problem._id, problem.isFavorited); }}>
                                                        <Star className={`w-4 h-4 transition-colors ${problem.isFavorited ? "text-yellow-400 fill-current" : "text-gray-600 hover:text-yellow-400"}`} />
                                                    </button>
                                                </div>
                                            </div>
                                            {/* END: RESPONSIVE UPDATE */}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-20 flex flex-col items-center">
                                    <SearchX className="h-24 w-24 text-gray-700" strokeWidth={1} />
                                    <h3 className="text-2xl font-semibold mt-8 text-gray-500">No Problems Found</h3>
                                    <p className="text-gray-500 mt-2 max-w-sm">Your search and filter combination didn't return any results.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <footer className="pt-8 flex items-center justify-center gap-4">
                        <button onClick={goPrev} disabled={page <= 1} className="btn btn-outline btn-sm">Previous</button>
                        <span className="text-sm font-medium">Page {page} of {meta.totalPages || 1}</span>
                        <button onClick={goNext} disabled={page >= (meta.totalPages || 1)} className="btn btn-outline btn-sm">Next</button>
                    </footer>
                </main>
            </div>
        </div>
    );
}

function getDifficultyBadgeColor(diff) {
    switch (diff?.toLowerCase()) {
        case 'easy': return 'text-green-400';
        case 'medium': return 'text-yellow-400';
        case 'hard': return 'text-red-400';
        default: return 'text-gray-400';
    }
}