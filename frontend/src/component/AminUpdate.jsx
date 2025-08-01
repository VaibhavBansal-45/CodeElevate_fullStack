import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { useDispatch,useSelector } from 'react-redux';
import axiosClient from '../utills/axiosClient';
import { fetchProblems } from '../authSlice';
import { useDebounce } from '../useDebounce';


const AdminUpdateProblemList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate(); // navigate function ko initialize kiya

    const { list: reduxProblems, meta: reduxMeta, status: problemsStatus } = useSelector(state => state.problems);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchMeta, setSearchMeta] = useState(null);
    const [searchStatus, setSearchStatus] = useState('idle');

    const [page, setPage] = useState(1);
    const limit = 10; // 10 problems per page

    const debouncedSearch = useDebounce(searchQuery, 500);

    useEffect(() => {
        const performSearch = async () => {
            setSearchStatus('loading');
            try {
                const { data } = await axiosClient.get("/problem/search", { params: { query: debouncedSearch, page, limit } });
                setSearchResults(data.data || []);
                setSearchMeta(data.meta || null);
                setSearchStatus('succeeded');
            } catch (err) {
                console.error("Search error:", err);
                setSearchStatus('failed');
            }
        };

        if (debouncedSearch.trim()) {
            performSearch();
        } else {
            setSearchResults([]);
            setSearchMeta(null);
            dispatch(fetchProblems({ page, limit }));
        }
    }, [debouncedSearch, page, limit, dispatch]);

    useEffect(() => {
        setPage(1);
    }, [debouncedSearch]);

    // *** UPDATE FUNCTION ***
    // Yeh function problem ID ke saath update page par navigate karega
    const handleUpdate = (id) => {
        navigate(`/problem/update/${id}`);
    };

    const isSearching = !!debouncedSearch.trim();
    const dataToDisplay = isSearching ? searchResults : reduxProblems;
    const currentStatus = isSearching ? searchStatus : problemsStatus;
    const activeMeta = isSearching ? searchMeta : reduxMeta;
    
    const hasNextPage = activeMeta ? activeMeta.currentPage < activeMeta.totalPages : false;

    return (
        <div className="container mx-auto h-screen flex flex-col p-4"> 
            <header className="flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    {/* Title change kiya gaya hai */}
                    <h1 className="text-3xl font-bold">Update Problems</h1>
                    <NavLink to="/" className="btn btn-primary">Back to Homepage</NavLink>
                </div>

                <div className="form-control mb-4">
                    <input
                        type="text"
                        placeholder="Search problems to update..."
                        className="input input-bordered w-full md:w-1/2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            <main className="flex-grow overflow-y-auto">
                {currentStatus === 'loading' && (
                    <div className="flex justify-center items-center h-full"><span className="loading loading-spinner loading-lg"></span></div>
                )}

                {currentStatus === 'succeeded' && (
                    <>
                        {dataToDisplay.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th className="text-base">Title</th>
                                            <th className="text-base">Difficulty</th>
                                            <th className="text-base">Tags</th>
                                            <th className="text-base text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataToDisplay.map((problem) => (
                                            <tr key={problem._id}>
                                                <td className="py-3 text-md">{problem.title}</td>
                                                <td className="py-3">
                                                    <span className={`badge badge-lg ${problem.difficulty === 'easy' ? 'badge-success' : problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>{problem.difficulty}</span>
                                                </td>
                                                <td className="py-3"><span  className="badge badge-lg badge-outline mr-2">{problem.tags}</span></td>
                                                <td className="py-3 text-right">
                                                    {/* *** ACTION BUTTON CHANGE *** */}
                                                    {/* Ab yahan Update button hai jo handleUpdate ko call karta hai */}
                                                    <button 
                                                        onClick={() => handleUpdate(problem._id)} 
                                                        className="btn btn-sm btn-info" // Different color for update
                                                    >
                                                        Update
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center h-full"><p className="text-xl">No problems found.</p></div>
                        )}
                    </>
                )}
            </main>

            <footer className="flex-shrink-0 pt-4">
                {activeMeta && dataToDisplay.length > 0 && (
                    <div className="flex justify-center">
                        <div className="btn-group">
                            <button className="btn" onClick={() => setPage(page - 1)} disabled={page === 1}>«</button>
                            <button className="btn btn-active">Page {page} of {activeMeta.totalPages}</button>
                            <button className="btn" onClick={() => setPage(page + 1)} disabled={!hasNextPage}>»</button>
                        </div>
                    </div>
                )}
            </footer>
        </div>
    );
};

export default AdminUpdateProblemList;