import {JSX, useEffect} from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
    useLocation
} from "react-router-dom";
import {onAuthStateChanged} from "firebase/auth";
import {auth} from "../firebase";
import {useState} from "react";

import Login from "../pages/Login";
import NotFound from "../pages/NotFound";
import Forbidden from "../pages/Forbidden";
import DefaultLayout from "../layouts/DefaultLayout";
import adminRoutes from "./adminRoutes";

const RequireAuth = ({children}: { children: JSX.Element }) => {
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setAuthenticated(!!user);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center">
                <div
                    className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4"></div>
                <p className="text-xl font-semibold text-gray-700">Cargando...</p>
            </div>
        </div>
    );

    return authenticated ? children : <Navigate to="/login" state={{from: location}} replace/>;
};

const AppRouter = () => {
    return (
        <Router>
            <DocumentTitleHandler/>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace/>}/>
                <Route path="/login" element={<Login/>}/>
                <Route path="/forbidden" element={<Forbidden/>}/>
                <Route
                    path="/admin"
                    element={
                        <RequireAuth>
                            <DefaultLayout/>
                        </RequireAuth>
                    }
                >
                    {adminRoutes.map((route, index) => (
                        <Route key={index} path={route.path} element={route.element}/>
                    ))}
                </Route>
                <Route path="*" element={<NotFound/>}/>
            </Routes>
        </Router>
    );
};

export default AppRouter;

// Cambiar el título dinámicamente
const DocumentTitleHandler = () => {
    const location = useLocation();

    useEffect(() => {
        const titleMap: Record<string, string> = {
            "/login": "Pokédex App - Sign In",
            "/forbidden": "Denied Access",
            "/admin": "Dashboard",
        };

        const title = titleMap[location.pathname] || "Pokédex App";
        document.title = title;
    }, [location]);

    return null;
};