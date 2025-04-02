import {useEffect} from "react";
import {GoogleAuthProvider, signInWithPopup, onAuthStateChanged} from "firebase/auth";
import {auth} from "../firebase";
import {useNavigate} from "react-router-dom";

const provider = new GoogleAuthProvider();

export default function Login() {
    const navigate = useNavigate();

    const login = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error al iniciar sesión:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate("/administracion");
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
