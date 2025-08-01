import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../authSlice";
import { problemsReducer } from "../authSlice";

export const store=configureStore({
    reducer:{
         problems: problemsReducer,
        auth: authReducer
    }
})