import {signOut, onAuthStateChanged} from "firebase/auth";
import {useEffect, useState} from "react";
import {auth} from "../firebase";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

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

            {user && (
                <div className="flex items-center gap-4">
                    <p className="text-gray-700">{user.displayName}</p>
                    <img
                        src={user.photoURL || ""}
                        alt="Foto de perfil"
                        className="w-10 h-10 rounded-full object-cover"
                    />
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
                    >
                        Cerrar sesión
                    </button>
                </div>
            )}
        </nav>
    );
}
