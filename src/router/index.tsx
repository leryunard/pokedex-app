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

    if (loading) return <p className="text-center mt-10">Cargando...</p>;

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
                    path="/administracion/*"
                    element={
                        <RequireAuth>
                            <DefaultLayout/>
                        </RequireAuth>
                    }
                />
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
            "/login": "Iniciar sesión",
            "/forbidden": "Acceso denegado",
            "/administracion": "Panel de administración",
        };

        const title = titleMap[location.pathname] || "Pokédex App";
        document.title = title;
    }, [location]);

    return null;
};
