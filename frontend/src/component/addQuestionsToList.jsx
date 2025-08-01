import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProblems } from '../authSlice';
import { useDebounce } from '../useDebounce';
import axiosClient from '../utills/axiosClient';

export default function AddQuestionsModalRedux({
  isOpen,
  onClose,
  onAdd,
  limit = 10,
}) {
  const dispatch = useDispatch();
  const { list: allProblems, meta: allMeta, status: reduxStatus } = useSelector(
    s => s.problems
  );

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const debounced = useDebounce(search, 400);
  const [selected, setSelected] = useState(new Set());

  // Local state for search‐results
  const [searchResults, setSearchResults] = useState([]);
  const [searchStatus, setSearchStatus] = useState('idle');
  const [searchMeta, setSearchMeta] = useState({ totalPages: 1 });

  // Reset page to 1 whenever modal opens or search changes
  useEffect(() => {
    if (isOpen) {
      setPage(1);
    }
  }, [isOpen]);

  // Fetch either paginated list or search results
  useEffect(() => {
    if (!isOpen) return;

    const q = debounced.trim();

    if (q) {
      // hit your /problem/search endpoint
      setSearchStatus('loading');
      axiosClient
        .get('/problem/search', { params: { query: q } })
        .then(res => {
          const data = res.data.data || [];
          setSearchResults(data);
          // your search endpoint always returns up to 5 items and no paging
          setSearchMeta({ totalPages: 1 });
          setSearchStatus('succeeded');
        })
        .catch(err => {
          console.error('Search API error', err);
          setSearchResults([]);
          setSearchStatus('failed');
        });
    } else {
      // clear out old searchResults
      setSearchResults([]);
      setSearchStatus('idle');
      // fallback to Redux‐backed pagination
      dispatch(
        fetchProblems({
          page,
          limit,
          search: undefined,
        })
      );
    }
  }, [dispatch, isOpen, page, limit, debounced]);

  const toggle = id => {
    setSelected(prev => {
      const nxt = new Set(prev);
      nxt.has(id) ? nxt.delete(id) : nxt.add(id);
      return nxt;
    });
  };

  const handleAdd = () => {
    onAdd(Array.from(selected));
    setSelected(new Set());
    onClose();
  };

  if (!isOpen) return null;

  // Decide which data to show
  const isSearching = Boolean(debounced.trim());
  const displayProblems = isSearching ? searchResults : allProblems;
  const displayMeta = isSearching ? searchMeta : allMeta;
  const status = isSearching ? searchStatus : reduxStatus;

  return (
    <div className="modal modal-open bg-slate-900/40 backdrop-blur-sm">
      <div className="modal-box w-11/12 max-w-2xl bg-slate-800 text-slate-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-700">
          <h3 className="text-xl font-bold text-slate-100">Add Questions</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost text-slate-400 hover:bg-slate-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search questions..."
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="input input-bordered w-full pl-12 bg-slate-700/50 focus:bg-slate-700 focus:border-slate-500"
            />
          </div>
        </div>

        {/* List */}
        <div className="max-h-96 min-h-[18rem] overflow-y-auto rounded-lg bg-slate-900/50">
          {status === 'loading' ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: limit / 2 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="skeleton h-5 w-5 rounded bg-slate-700"></div>
                  <div className="skeleton h-4 flex-grow rounded bg-slate-700"></div>
                </div>
              ))}
            </div>
          ) : displayProblems.length ? (
            displayProblems.map((q, idx) => (
              <label
                key={q._id}
                className="flex items-center justify-between p-4 hover:bg-slate-700/50 cursor-pointer transition-colors duration-200"
              >
                <div className="flex items-center space-x-4">
                  <input
                    type="checkbox"
                    checked={selected.has(q._id)}
                    onChange={() => toggle(q._id)}
                    className="checkbox checkbox-primary checkbox-sm"
                  />
                  <span className="text-slate-300">
                    {(page - 1) * limit + idx + 1}. {q.title}
                  </span>
                </div>
                <span
                  className={`badge badge-outline text-sm font-medium capitalize ${
                    q.difficulty === 'easy'
                      ? 'border-green-500/50 text-green-400'
                      : q.difficulty === 'medium'
                      ? 'border-yellow-500/50 text-yellow-400'
                      : 'border-red-500/50 text-red-400'
                  }`}
                >
                  {q.difficulty}
                </span>
              </label>
            ))
          ) : (
            <div className="flex items-center justify-center h-full text-center text-slate-500">
              <p>No questions found.</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="modal-action mt-6 pt-4 border-t border-slate-700">
          <div className="flex-1">
            {/* only show paging when not searching */}
            {!isSearching && (
              <div className="join">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="join-item btn btn-outline btn-sm border-slate-600 hover:bg-slate-700"
                >
                  Previous
                </button>
                <button className="join-item btn btn-ghost btn-sm">
                  Page {page} of {displayMeta.totalPages || 1}
                </button>
                <button
                  onClick={() => setPage(p => Math.min(displayMeta.totalPages, p + 1))}
                  disabled={page === displayMeta.totalPages}
                  className="join-item btn btn-outline btn-sm border-slate-600 hover:bg-slate-700"
                >
                  Next
                </button>
              </div>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={selected.size === 0}
            className="btn btn-primary btn-sm"
          >
            Add ({selected.size}) to List
          </button>
        </div>
      </div>
    </div>
  );
}

AddQuestionsModalRedux.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  limit: PropTypes.number,
};
