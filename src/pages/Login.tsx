import {useEffect, useState} from "react";
import {GoogleAuthProvider, signInWithPopup, onAuthStateChanged} from "firebase/auth";
import {auth} from "../firebase";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

const provider = new GoogleAuthProvider();

export default function Login() {
    const navigate = useNavigate();
    const [checkingAuth, setCheckingAuth] = useState(true);

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

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate("/administracion");
            } else {
                setCheckingAuth(false);
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    if (checkingAuth) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div
                        className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-32 w-32 mb-4"></div>
                    <p className="text-xl font-semibold text-gray-700">Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-yellow-300 text-center px-4">
            <img src="/src/assets/logo.png" alt="App logo" className="mb-4"/>
            <h1 className="text-3xl font-bold mb-4">Sign In</h1>
            <button
                onClick={login}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded text-lg flex items-center cursor-pointer"
            >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google logo"
                     className="w-6 h-6 mr-2"/>
                Sign in with Google
            </button>
        </div>
    );
}