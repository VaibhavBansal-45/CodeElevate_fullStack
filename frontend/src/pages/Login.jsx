import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, NavLink } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { loginUser } from "../authSlice";
import { Terminal, Mail, Lock, Eye, EyeOff } from 'lucide-react';


// Zod schema for validation
const loginSchema = z
  .object({
   
    emailId: z.string().email("Invalid email address"),
    password: z
      .string()  .min(8, "Password must be at least 8 characters")
      .regex(/[^A-Za-z0-9]/, "Must include a special character"),
    // confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  // .refine((data) => data.password === data.confirmPassword, {
  //   message: "Passwords must match",
  //   path: ["confirmPassword"],
  // });

export default function Login() {
  const dispatch=useDispatch();
  const navigate=useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const {isAuthenticated, loading, error}=useSelector((state)=> state.auth);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });
  useEffect(()=>{
    if(isAuthenticated){
      navigate('/');
    }
  },[isAuthenticated, navigate])

  const onSubmit = (data) => {
    
    dispatch(loginUser(data));
    // TODO: send data to backend
  };
 // In LoginPage.jsx

// REPLACE the old GoogleIcon with this new one



 return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 p-4 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      
      <div className="relative z-10 bg-base-100 p-8 rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex flex-col items-center mb-6 text-center">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-primary rounded-lg">
                    <Terminal className="h-7 w-7 text-primary-content" />
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent text-transparent bg-clip-text">
                    CodeElevate
                </h1>
            </div>
          <h1 className="text-3xl font-bold">Welcome Back!</h1>
          <p className="text-base-content/70 mt-1">Sign in to continue elevating your skills.</p>
        </div>

        
        

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Input */}
          <div className="form-control">
            <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40 z-10 pointer-events-none" />
                <input
                    type="email"
                    placeholder="E-mail address"
                    className={`input input-bordered w-full pl-10 ${errors.emailId ? 'input-error' : ''}`}
                    {...register("emailId", { required: "Email is required" })}
                />
            </div>
          </div>

          {/* Password Input */}
          <div className="form-control">
            <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-base-content/40 z-10 pointer-events-none" />
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    className={`input input-bordered w-full pl-10 pr-10 ${errors.password ? 'input-error' : ''}`}
                    {...register("password", { required: "Password is required" })}
                />
                <button
                    type="button"
                    className="absolute top-1/2 right-3 transform -translate-y-1/2 text-base-content/60 hover:text-primary focus:outline-none z-20"
                    onClick={() => setShowPassword(!showPassword)}
                >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
            </div>
          </div>
          
          {/* --- Forgot Password & Remember Me --- */}
          <div className="flex items-center justify-between text-sm">
            <div className="form-control">
               
            </div>
            <a href="/forgot-password" className="link link-hover text-primary font-medium">Forgot Password?</a>
          </div>

          <button
            type="submit"
            className={`btn btn-primary w-full mt-2 font-bold text-base border-0 bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/40 transform hover:scale-105 transition-all duration-300 ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-base-content/70">
          New to CodeElevate?{' '}
          <NavLink to="/signup" className="link link-primary font-medium hover:text-primary-focus">
            Create a Free Account
          </NavLink>
        </div>
      </div>
    </div>
  );
};



