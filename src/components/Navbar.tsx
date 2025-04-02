// src/components/Navbar.tsx
import {signOut, onAuthStateChanged} from "firebase/auth";
import {useEffect, useState} from "react";
import {auth} from "../firebase";
import {useNavigate, Link} from "react-router-dom";
import {toast} from "react-toastify";
import {FaSignOutAlt} from 'react-icons/fa';
import adminRoutes from "../router/adminRoutes";

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Error desconocido al cerrar sesión");
            }
        }
    };

    return (
        <nav className="flex justify-between items-center px-6 py-4 bg-white shadow-md">
            <h1 className="text-xl font-bold text-gray-800">Pokédex App</h1>

            <div className="flex gap-4">
                {adminRoutes.map((route, index) => (
                    <Link key={index} to={`/admin/${route.path}`} className="text-gray-700 hover:text-gray-900">
                        {route.name}
                    </Link>
                ))}
            </div>

            {user && (
                <div className="flex items-center gap-4">
                    <p className="text-gray-700 truncate max-w-xs">{user.displayName}</p>
                    <img
                        src={user.photoURL || ""}
                        alt="Profile picture"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <button
                        onClick={handleLogout}
                        className="relative group bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded flex items-center cursor-pointer"
                    >
                        <FaSignOutAlt className="w-6 h-6"/>
                        <span
                            className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded py-1 px-4">
                            Log out
                        </span>
                    </button>
                </div>
            )}
        </nav>
    );
}