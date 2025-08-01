import { Routes, Route,Navigate } from "react-router";

import HomePage from "./pages/HomePage";
import Signup from "./pages/Signup"
import Login from "./pages/Login";
import LandingPage from "./pages/forstPage";
 import {checkAuth} from "./authSlice"
import {useDispatch, useSelector} from 'react-redux'
import { useEffect } from "react";
import Admin from "./pages/admin";
import AdminPanel from "./component/AdminPanel";
import ProblemPage from "./pages/problem";
import AdminDelete from "./component/AdminDelete";
import AdminUpdate from "./component/AminUpdate";
import UpdateProblem from "./component/UpdateProblem";
import ListPageRouter from "./utills/ListPageRouter";
import ProfileForm from "./component/editProfilePage";

import UnderConstruction from "./component/underconstruction";


function App() {

  const dispatch=useDispatch();
  const { isAuthenticated, user, loading}=useSelector((state)=>state.auth);
  

  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch]);

 if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200">
      <div className="flex space-x-4">
        <span
          className="w-6 h-6 bg-gray-500 rounded-full animate-bounce"
          style={{ animationDelay: "0s" }}
        />
        <span
          className="w-6 h-6 bg-gray-500  rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="w-6 h-6 bg-gray-500  rounded-full animate-bounce"
          style={{ animationDelay: "0.4s" }}
        />
      </div>
      </div>
   

    )
    }
  return(
    <>
     <Routes>
      <Route path="/" element={isAuthenticated? <HomePage></HomePage>:<LandingPage></LandingPage>}> </Route>
       <Route path="/login" element={isAuthenticated? <Navigate to="/"/>:<Login></Login>}> </Route>
        <Route path="/profile" element={isAuthenticated? <UnderConstruction/>:<Login></Login>}> </Route>
         <Route path="/settings" element={isAuthenticated? <ProfileForm userId={user._id}/>:<Login></Login>}> </Route>
        <Route path="/signup" element={isAuthenticated? <Navigate to="/"/>:<Signup></Signup>}> </Route>
        
        <Route path='/admin' element={isAuthenticated && user?.role=="admin" ? <Admin/> : <Navigate to="/"/>}/>
        <Route path='/admin/create' element={isAuthenticated && user?.role=="admin" ? <AdminPanel/> : <Navigate to="/"/>}/>
         <Route path='/admin/delete' element={isAuthenticated && user?.role=="admin" ? <AdminDelete/> : <Navigate to="/"/>}/>
          <Route path='/admin/update' element={isAuthenticated && user?.role=="admin" ? <AdminUpdate/> : <Navigate to="/"/>}/>
          <Route path="/problem/update/:id" element={isAuthenticated && user?.role=="admin" ?<UpdateProblem />:<Navigate to="/"/>} />
          <Route path="/list/:id" element={<ListPageRouter />} />
        <Route path='/problem/:problemId' element={<ProblemPage></ProblemPage>}></Route>
     </Routes>
     {/* <LandingPage/>
      */}
      
    </>
  )
}

export default App
