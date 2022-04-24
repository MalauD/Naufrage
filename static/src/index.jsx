import Axios from "axios";
import { createRoot } from "react-dom/client";
import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Routes/Login";
import Register from "./Routes/Register";
import MainPage from "./Routes/MainPage";

Axios.defaults.withCredentials = true;

const App = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <HashRouter>
            <Routes>
                <Route
                    path="/"
                    exact
                    element={<ProtectedRoute component={MainPage} />}
                />
                <Route path="/Login" element={<Login />} />
                <Route path="/Register" element={<Register />} />
            </Routes>
        </HashRouter>
    </Suspense>
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
