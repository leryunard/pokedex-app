import {useEffect, useState} from "react";
import {GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User} from "firebase/auth";
import {auth} from "../firebase";
import {toast} from "react-toastify";

const provider = new GoogleAuthProvider();

export default function Auth() {
    const [user, setUser] = useState<User | null>(null);

    const login = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Error desconocido al iniciar sesión");
            }
        }

    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Error desconocido al cerrar sesión");
            }
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    return (
        <div className="text-center mt-10">
            {user ? (
                <div className="flex flex-col items-center gap-4">
                    <p></p>
                    <img src={user.photoURL || ""} alt={user.displayName || "User"}
                         className="w-16 h-16 rounded-full"/>
                    <p className="text-lg">¡Hola, {user.displayName}!</p>
                    <button onClick={logout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">
                        Cerrar sesión
                    </button>
                </div>
            ) : (
                <button onClick={login} className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                    Iniciar sesión con Google
                </button>
            )}
        </div>
    );
}