import  { useEffect } from "react";
import axiosClient from "../utills/axiosClient";
import { useForm } from "react-hook-form";
import { useSelector } from 'react-redux'
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { NavLink, useNavigate } from "react-router";

// Icon Imports
import {
    Terminal, Star, UserCircle, Calendar,
    Github, Linkedin, Twitter, Globe, ArrowLeft, User, Settings,ShieldCheck
} from 'lucide-react';

const ProfileForm = ({ userId }) => {
    const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();
    const navigate = useNavigate();
    
    const { user } = useSelector((state) => state.auth);
    const avatarUrl = watch("avatarUrl", "");

  useEffect(() => {
  if (!userId) return;

  const fetchProfile = async () => {
    try {
      const res = await axiosClient.get(`/profile/${userId}`);
      const data = res.data;

      // If there's a date field, reformat it to yyyy-MM-dd
      if (data.birthday) {
        data.birthday = new Date(data.birthday).toISOString().slice(0, 10);
      }

      // Reset the entire form, including our formatted dob
      reset(data);
    } catch (err) {
      console.log("No existing profile found. Creating new on save.");
    }
  };

  fetchProfile();
}, [userId, reset]);


    const onSubmit = async (data) => {
        try {
            await axiosClient.put(`/profile/${userId}`, data);
            toast.success("Profile updated successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile. Please try again.");
        }
    };

    const handlePremium = () => {
  navigate('/profile');
};

   

    return (
        <div className="bg-slate-900 min-h-screen text-gray-300 font-sans" data-theme="dark">
            <ToastContainer position="bottom-right" theme="dark" />

            {/* Navbar */}
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
                                       
                                        {user.role === "admin" && (<li><NavLink to="/admin"><ShieldCheck size={16} /> Admin Panel</NavLink></li>)}
                                        <div className="divider my-0" />
                                        
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

            {/* Main Content */}
            <main className="container mx-auto p-4 lg:p-8 max-w-6xl">
                <div className="flex items-center gap-4 mb-10">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="btn btn-ghost hover:bg-slate-800 transition-all duration-300"
                    >
                        <ArrowLeft size={24} className="text-indigo-400" />
                        <span className="btn btn-outline btn-accent">Back</span>
                    </button>
                </div>

                <div className="flex items-start gap-6 mb-10">
                    <UserCircle size={48} className="text-indigo-400 flex-shrink-0 mt-1" />
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white">Edit Your Profile</h1>
                        <p className="text-gray-400 mt-2">
                            Update your personal information and social profiles
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Left Column */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Personal Info Card */}
                            <div className="card bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-xl">
                                <div className="border-b border-slate-700 pb-4 mb-6">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <UserCircle size={20} />
                                        Personal Information
                                    </h3>
                                </div>
                                
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Full Name
                                        </label>
                                        <input 
                                            {...register("name", { required: "Name is required" })} 
                                            type="text" 
                                            placeholder="Enter your full name" 
                                            className={`input w-full bg-slate-700 border ${errors.name ? 'border-rose-500' : 'border-slate-600'} focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                        />
                                        {errors.name && <p className="mt-1 text-sm text-rose-500">{errors.name.message}</p>}
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Gender
                                            </label>
                                            <select 
                                                {...register("gender")} 
                                                className="select w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            >
                                                <option value="">Select</option>
                                                <option>Male</option>
                                                <option>Female</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Birthday
                                            </label>
                                            <div className="relative">
                                                <input 
                                                    type="date" 
                                                    {...register("birthday")} 
                                                    className={`input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10`}
                                                />
                                                <span className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                                    <Calendar className="text-gray-500" size={18} />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Location
                                        </label>
                                        <input 
                                            {...register("location")} 
                                            type="text" 
                                            placeholder="e.g. Delhi, India" 
                                            className="input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Profile Summary
                                        </label>
                                        <textarea 
                                            {...register("summary")} 
                                            className="textarea w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-32" 
                                            placeholder="Tell us about yourself..."
                                        ></textarea>
                                        <p className="mt-1 text-xs text-gray-500">Max 250 characters</p>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Skills Card */}
                            <div className="card bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-xl">
                                <div className="border-b border-slate-700 pb-4 mb-6">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                        💼 Skills & Expertise
                                    </h3>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-2">
                                        Technical Skills
                                    </label>
                                    <input 
                                        {...register("skills")} 
                                        className="input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        placeholder="React, Node.js, Python..." 
                                    />
                                    <p className="mt-2 text-xs text-gray-500">
                                        Separate skills with commas
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right Column */}
                        <div className="lg:col-span-3 space-y-8">
                            {/* Avatar & Socials Card */}
                            <div className="card bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-xl">
                                <div className="border-b border-slate-700 pb-4 mb-6">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                        🌐 Online Presence
                                    </h3>
                                </div>
                                
                                <div className="flex flex-col lg:flex-row gap-8">
                                    <div className="lg:w-1/2">
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Avatar URL
                                            </label>
                                            <input 
                                                {...register("avatarUrl")} 
                                                type="text" 
                                                placeholder="https://..." 
                                                className="input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                                Preview
                                            </label>
                                            <div className="flex justify-center">
                                                <div className="avatar">
                                                    <div className="w-32 rounded-xl ring-4 ring-indigo-500/30 ring-offset-slate-800 ring-offset-2 overflow-hidden">
                                                        <img 
                                                            src={avatarUrl || "https://via.placeholder.com/300/1e293b/7e22ce?text=Avatar"} 
                                                            alt="Avatar Preview" 
                                                            className="object-cover w-full h-32"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="lg:w-1/2">
                                        <h4 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                                            <Globe size={18} />
                                            Social Profiles
                                        </h4>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                                                    <Github size={18} />
                                                    GitHub
                                                </label>
                                                <input 
                                                    {...register("socialLinks.github")} 
                                                    type="text" 
                                                    placeholder="https://github.com/username" 
                                                    className="input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                                                    <Linkedin size={18} />
                                                    LinkedIn
                                                </label>
                                                <input 
                                                    {...register("socialLinks.linkedin")} 
                                                    type="text" 
                                                    placeholder="https://linkedin.com/in/username" 
                                                    className="input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                                                    <Twitter size={18} />
                                                    Twitter
                                                </label>
                                                <input 
                                                    {...register("socialLinks.twitter")} 
                                                    type="text" 
                                                    placeholder="https://twitter.com/username" 
                                                    className="input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                                />
                                            </div>
                                            
                                            <div>
                                                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                                                    <Globe size={18} />
                                                    Portfolio
                                                </label>
                                                <input 
                                                    {...register("socialLinks.website")} 
                                                    type="text" 
                                                    placeholder="https://your-portfolio.com" 
                                                    className="input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Education Card */}
                            <div className="card bg-slate-800/60 backdrop-blur-sm p-6 rounded-xl border border-slate-700 shadow-xl">
                                <div className="border-b border-slate-700 pb-4 mb-6">
                                    <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                                        🎓 Education
                                    </h3>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Institution
                                        </label>
                                        <input 
                                            {...register("education.0.institution")} 
                                            type="text" 
                                            placeholder="Your college name" 
                                            className="input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Degree
                                        </label>
                                        <input 
                                            {...register("education.0.degree")} 
                                            type="text" 
                                            placeholder="e.g. Bachelor of Technology" 
                                            className="input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Field of Study
                                        </label>
                                        <input 
                                            {...register("education.0.field")} 
                                            type="text" 
                                            placeholder="e.g. Computer Science" 
                                            className="input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-400 mb-2">
                                            Graduation Year
                                        </label>
                                        <input 
                                            {...register("education.0.year")} 
                                            type="text" 
                                            placeholder="e.g. 2024" 
                                            className="input w-full bg-slate-700 border border-slate-600 focus:ring-2 focus:ring-indigo-500 focus:border-transparent" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Form Actions */}
                    <div className="mt-12 pt-6 border-t border-slate-800 flex justify-end gap-4">
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)} 
                            className="btn bg-slate-700 hover:bg-slate-600 border-slate-600 text-white w-32 transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn bg-indigo-600 hover:bg-indigo-500 border-indigo-500 text-white w-40 transition-all shadow-lg shadow-indigo-500/20"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
};

export default ProfileForm;