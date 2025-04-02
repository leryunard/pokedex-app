import {useEffect} from "react";
import {GoogleAuthProvider, signInWithPopup, onAuthStateChanged} from "firebase/auth";
import {auth} from "../firebase";
import {useNavigate} from "react-router-dom";
import {toast} from "react-toastify";

const provider = new GoogleAuthProvider();

export default function Login() {
    const navigate = useNavigate();

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
                toast.success("Sesión iniciada correctamente");
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 text-center px-4">
            <h1 className="text-3xl font-bold mb-4">Iniciar sesión</h1>
            <button
                onClick={login}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded text-lg"
            >
                Iniciar sesión con Google
            </button>
        </div>
    );
}
