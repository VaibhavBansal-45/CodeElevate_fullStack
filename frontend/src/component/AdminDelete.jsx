import { useEffect, useState, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router';
import { fetchProblems, deleteProblem } from '../authSlice';
import axiosClient from '../utills/axiosClient';
import { useDebounce } from '../useDebounce';



const AdminProblemManagement = () => {
    const dispatch = useDispatch();

    const { list: reduxProblems, meta: reduxMeta, status: problemsStatus } = useSelector(state => state.problems);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchMeta, setSearchMeta] = useState(null);
    const [searchStatus, setSearchStatus] = useState('idle');

    const [page, setPage] = useState(1);
    // *** REQUIREMENT 1: Problems per page set back to 10 ***
    const limit = 10;

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

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this problem?')) {
            dispatch(deleteProblem(id));
        }
    };

    const isSearching = !!debouncedSearch.trim();
    const dataToDisplay = isSearching ? searchResults : reduxProblems;
    const currentStatus = isSearching ? searchStatus : problemsStatus;
    const activeMeta = isSearching ? searchMeta : reduxMeta;
    
    const hasNextPage = activeMeta ? activeMeta.currentPage < activeMeta.totalPages : false;

    return (
        // *** LAYOUT CHANGE 1: Main container takes full screen height and uses flexbox column layout ***
        <div className="container mx-auto h-screen flex flex-col p-4"> 
            {/* Header section (will not grow) */}
            <header className="flex-shrink-0">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-3xl font-bold">Manage Problems</h1>
                    <NavLink to="/" className="btn btn-primary">Back to Homepage</NavLink>
                </div>

                <div className="form-control mb-4">
                    <input
                        type="text"
                        placeholder="Search problems..."
                        className="input input-bordered w-full md:w-1/2"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* *** LAYOUT CHANGE 2: Main content area grows to fill available space and has its own scrollbar if needed *** */}
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
                                            {/* REQUIREMENT 2: Increased font size for headers */}
                                            <th className="text-base">Title</th>
                                            <th className="text-base">Difficulty</th>
                                            <th className="text-base">Tags</th>
                                            <th className="text-base text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {dataToDisplay.map((problem) => (
                                            <tr key={problem._id}>
                                                {/* REQUIREMENT 2: Increased padding (py-3) and font size (text-md) for readability */}
                                                <td className="py-3 text-md">{problem.title}</td>
                                                <td className="py-3">
                                                    <span className={`badge badge-lg ${problem.difficulty === 'easy' ? 'badge-success' : problem.difficulty === 'medium' ? 'badge-warning' : 'badge-error'}`}>{problem.difficulty}</span>
                                                </td>
                                                <td className="py-3"> <span  className="badge badge-lg badge-outline mr-2">{problem.tags}</span></td>
                                                <td className="py-3 text-right">
                                                    <button onClick={() => handleDelete(problem._id)} className="btn btn-sm btn-error">Delete</button>
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

            {/* *** LAYOUT CHANGE 3: Footer section for pagination (will not grow) *** */}
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

export default AdminProblemManagement;