import React, { useState } from 'react';
// Import the icons we need from lucide-react
import { Terminal, BookOpenText, Trophy, Lightbulb, X, Mail, Linkedin, LogIn } from 'lucide-react';
// Make sure you have react-router-dom installed: npm install react-router-dom
import { NavLink } from 'react-router';

// --- Reusable Modal Component (for footer links) ---
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box w-11/12 max-w-4xl">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-2xl">{title}</h3>
                    <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
                <div className="prose max-w-none text-base-content/80">
                    {children}
                </div>
            </div>
            <div className="modal-backdrop" onClick={onClose}></div>
        </div>
    );
};

// --- Reusable Auth Wall Component (for protected links) ---
const AuthWall = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        // Backdrop container
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            {/* Content Box - stopPropagation prevents closing when clicking inside */}
            <div className="card w-full max-w-md bg-base-100 shadow-xl m-4 animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
                <div className="card-body items-center text-center">
                    <div className="p-4 bg-primary/20 rounded-full mb-4">
                        <LogIn className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="card-title text-2xl">Access Restricted</h2>
                    <p className="py-4 text-base-content/70">Please sign in or create an account to continue.</p>
                    <div className="card-actions justify-center w-full gap-4">
                         <NavLink to="/login" className="btn btn-primary flex-1">Sign In</NavLink>
                         <NavLink to="/signup" className="btn btn-outline flex-1">Sign Up</NavLink>
                    </div>
                     <button className="btn btn-sm btn-circle btn-ghost absolute top-2 right-2" onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};


const LandingPage = () => {
    const [modalContent, setModalContent] = useState(null);
    const [showAuthWall, setShowAuthWall] = useState(false); // State for the Auth Wall

    // --- Modal Handlers ---
    const openModal = (contentKey) => setModalContent(contentKey);
    const closeModal = () => setModalContent(null);
    
    // --- Auth Wall Handlers ---
    const openAuthWall = (e) => {
        e.preventDefault(); // Prevent default link navigation
        setShowAuthWall(true);
    };
    const closeAuthWall = () => setShowAuthWall(false);
    
    // --- All Modal Content (for footer links) ---
    const modalData = {
        about: {
            title: "About CodeElevate",
            content: (
                <>
                    <h4>Our Mission</h4>
                    <p>Our mission is to provide an accessible, engaging, and effective platform for developers of all levels to master Data Structures and Algorithms. We believe that a strong foundation in these core concepts is the key to unlocking career opportunities and building innovative technology.</p>
                    <h4>Why We're Different</h4>
                    <ul>
                        <li><strong>Curated Quality:</strong> Every problem is hand-picked and tested to ensure it is relevant and instructive.</li>
                        <li><strong>Community Focused:</strong> Learn and grow with others in our discussion forums and live contests.</li>
                        <li><strong>Expert Guidance:</strong> Our detailed solutions aren't just code; they are lessons in problem-solving strategy.</li>
                    </ul>
                </>
            )
        },
        contact: {
            title: "Contact Us",
            content: (
                <>
                    <p>Have a question or suggestion? We'd love to hear from you. You can reach us via email or connect on LinkedIn.</p>
                    <div className="flex flex-col gap-4 mt-6">
                        <a href="mailto:vaibhavbnsal120@gmail.com" className="btn btn-outline btn-primary">
                            <Mail className="h-5 w-5" />
                            <span className="ml-2">vaibhavbnsal120@gmail.com</span>
                        </a>
                        <a 
                            href="https://www.linkedin.com/in/vaibhav-bansal-5345432a6/" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="btn btn-outline"
                        >
                            <Linkedin className="h-5 w-5 text-info" />
                            <span className="ml-2">Connect on LinkedIn</span>
                        </a>
                    </div>
                </>
            )
        },
        careers: {
            title: "Careers at CodeElevate",
            content: (
                 <>
                    <p>Want to help shape the future of tech education? We're looking for passionate, talented individuals to join our mission-driven team.</p>
                    <h4 className="mt-6">Open Positions</h4>
                    <p>Currently, there are no open positions, but we are always on the lookout for great talent.</p>
                </>
            )
        },
        terms: {
            title: "Terms of Use",
            content: (
                <>
                    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
                    <p>Welcome to CodeElevate! These Terms of Use govern your use of our website and services. By using our platform, you agree to these terms.</p>
                    <p><i>This is a placeholder document. Consult with a legal professional for official terms.</i></p>
                </>
            )
        },
        privacy: {
            title: "Privacy Policy",
            content: (
                <>
                    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
                    <p>Your privacy is important to us. This policy explains how we collect, use, and protect your information.</p>
                    <p><i>This is a placeholder document. Consult with a legal professional for an official policy.</i></p>
                </>
            )
        },
        cookie: {
            title: "Cookie Policy",
            content: (
                <>
                    <p><strong>Last Updated: {new Date().toLocaleDateString()}</strong></p>
                    <p>We use cookies to enhance your experience, for authentication, and to analyze site traffic. By using our site, you consent to our use of cookies.</p>
                    <p><i>This is a placeholder document. Consult with a legal professional for an official policy.</i></p>
                </>
            )
        },
    };

    // The rest of your page JSX is here...
    return (
        <div className="bg-base-100 text-base-content font-sans">
            {/* NEW: This div blurs the entire page when the auth wall is active */}
            <div className={showAuthWall ? 'blur-sm transition-all duration-300' : 'transition-all duration-300'}>
                
                {/* Header */}
                <header className="fixed top-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-md shadow-sm">
                    <div className="container mx-auto">
                    <div className="navbar px-0">
                        <div className="navbar-start">
                        <a href="/" className="flex items-center gap-3 text-2xl font-bold">
                            <div className="p-2 bg-primary rounded-lg">
                            <Terminal className="h-6 w-6 text-primary-content" />
                            </div>
                            <span className="bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
                            CodeElevate
                            </span>
                        </a>
                        </div>
                        <div className="navbar-center hidden lg:flex">
                        <ul className="menu menu-horizontal px-1 text-base">
                            {/* UPDATED: These links now trigger the auth wall */}
                            <li><a href="#" onClick={openAuthWall}>Problems</a></li>
                            <li><a href="#" onClick={openAuthWall}>Contests</a></li>
                            <li><a href="#" onClick={openAuthWall}>Discuss</a></li>
                        </ul>
                        </div>
                        <div className="navbar-end gap-2">
                        <a href="#" onClick={openAuthWall} className="btn btn-ghost hidden sm:inline-flex">Premium</a>
                        {/* These links lead to actual auth pages */}
                        <NavLink to="/login" className="btn btn-outline btn-primary">Sign In</NavLink>
                        <NavLink to="/signup" className="btn btn-outline btn-primary">Sign Up</NavLink>
                        </div>
                    </div>
                    </div>
                </header>

                <main>
                    {/* Hero Section */}
                    <section className="relative flex items-center justify-center min-h-screen pt-20 pb-10 bg-base-200 overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                        <div className="hero-content text-center z-10">
                            <div className="max-w-3xl">
                                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                                    <span className="bg-gradient-to-r from-primary via-purple-500 to-accent text-transparent bg-clip-text">
                                    Master the Algorithm.
                                    </span>
                                    <br />
                                    Land Your Dream Job.
                                </h1>
                                <p className="py-8 text-lg md:text-xl text-base-content/70 max-w-2xl mx-auto">
                                    The ultimate platform for honing your DSA skills. Solve curated problems, compete in real-time contests, and get expert-written explanations to fast-track your journey from novice to pro.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                    {/* UPDATED: These buttons now trigger the auth wall */}
                                    <button onClick={openAuthWall} className="btn btn-primary btn-lg font-bold border-0 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/40 transform hover:scale-105 transition-all duration-300">
                                        Start Solving for Free
                                    </button>
                                    <button onClick={openAuthWall} className="btn btn-ghost btn-lg">
                                        Explore Problems
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Features Section */}
                    <section className="py-24 bg-base-100">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold">Why Choose CodeElevate?</h2>
                        <p className="text-base-content/60 mt-2">Everything you need to succeed in one place.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
                                <div className="card-body items-center text-center">
                                    <div className="p-4 bg-primary/20 rounded-full"><BookOpenText className="h-8 w-8 text-primary" /></div>
                                    <h3 className="card-title mt-4 text-xl font-bold">Vast Problem Library</h3>
                                    <p>Access hundreds of hand-picked problems from real company interviews, categorized by difficulty and topic.</p>
                                </div>
                            </div>
                            <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
                                <div className="card-body items-center text-center">
                                    <div className="p-4 bg-secondary/20 rounded-full"><Trophy className="h-8 w-8 text-secondary" /></div>
                                    <h3 className="card-title mt-4 text-xl font-bold">Live Contests</h3>
                                    <p>Challenge yourself and compete against a global community in weekly and monthly coding contests.</p>
                                </div>
                            </div>
                            <div className="card bg-base-200 shadow-xl hover:-translate-y-2 transition-transform duration-300">
                                <div className="card-body items-center text-center">
                                    <div className="p-4 bg-accent/20 rounded-full"><Lightbulb className="h-8 w-8 text-accent" /></div>
                                    <h3 className="card-title mt-4 text-xl font-bold">Detailed Solutions</h3>
                                    <p>Never get stuck. Understand the 'why' behind the code with our in-depth editorials and video explanations.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="footer p-10 bg-neutral text-neutral-content">
                    <aside>
                        <Terminal className="h-10 w-10" />
                        <p className="font-bold text-lg">CodeElevate</p>
                        <p>Master the Algorithm. © {new Date().getFullYear()}</p>
                    </aside>
                    <nav>
                        <header className="footer-title">Services</header>
                        {/* These also trigger the auth wall */}
                        <a href="#" onClick={openAuthWall} className="link link-hover">Problems</a>
                        <a href="#" onClick={openAuthWall} className="link link-hover">Contests</a>
                        <a href="#" onClick={openAuthWall} className="link link-hover">Go Premium</a>
                    </nav>
                    <nav>
                        <header className="footer-title">Company</header>
                        {/* These open the regular modal */}
                        <a onClick={() => openModal('about')} className="link link-hover cursor-pointer">About us</a>
                        <a onClick={() => openModal('contact')} className="link link-hover cursor-pointer">Contact</a>
                        <a onClick={() => openModal('careers')} className="link link-hover cursor-pointer">Careers</a>
                    </nav>
                    <nav>
                        <header className="footer-title">Legal</header>
                        {/* These open the regular modal */}
                        <a onClick={() => openModal('terms')} className="link link-hover cursor-pointer">Terms of use</a>
                        <a onClick={() => openModal('privacy')} className="link link-hover cursor-pointer">Privacy policy</a>
                        <a onClick={() => openModal('cookie')} className="link link-hover cursor-pointer">Cookie policy</a>
                    </nav>
                </footer>
            </div>

            {/* --- RENDER THE MODAL AND AUTH WALL (outside the blur div) --- */}
            <Modal
                isOpen={!!modalContent}
                onClose={closeModal}
                title={modalContent ? modalData[modalContent].title : ''}
            >
                {modalContent ? modalData[modalContent].content : null}
            </Modal>

            <AuthWall isOpen={showAuthWall} onClose={closeAuthWall} />

        </div>
    );
};

export default LandingPage;