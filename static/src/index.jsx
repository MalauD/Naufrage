import Axios from "axios";
import { createRoot } from "react-dom/client";
import React, { Suspense } from "react";
import ReactDOM from "react-dom";
import { HashRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "./Routes/Login";
import Register from "./Routes/Register";
import MainPage from "./Routes/MainPage";
import CardEntryDashBoard from "./Routes/CardEntry";
import Checkout from "./Routes/Checkout";
import Status from "./Routes/Status";

Axios.defaults.withCredentials = true;

const App = () => (
    <Suspense fallback={<div>Loading...</div>}>
        <HashRouter>
            <Routes>
                <Route
                    path="/"
                    element={<ProtectedRoute component={CardEntryDashBoard} />}
                />
                <Route
                    path="/Carte"
                    element={<ProtectedRoute component={CardEntryDashBoard} />}
                />
                <Route
                    path="/Paiment"
                    element={<ProtectedRoute component={Checkout} />}
                />
                <Route
                    path="/Statut"
                    element={<ProtectedRoute component={Status} />}
                />
                <Route path="/Connexion" element={<Login />} />
                <Route path="/Inscription" element={<Register />} />
            </Routes>
        </HashRouter>
    </Suspense>
);

const container = document.getElementById("root");
const root = createRoot(container);
root.render(<App />);
