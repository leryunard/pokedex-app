import { signOut, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useNavigate, NavLink } from "react-router-dom";
import { toast } from "react-toastify";
import { FaSignOutAlt } from "react-icons/fa";
import adminRoutes from "../router/adminRoutes";

export default function Navbar() {
    const [user, setUser] = useState<any>(null);
    const [menuOpen, setMenuOpen] = useState(false);
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
        <nav className="px-6 py-4 shadow-md bg-[#787978] text-white">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-bold">Pokédex App</h1>

                {/* Botón de hamburguesa (solo en móvil) */}
                <button
                    className="lg:hidden text-white text-2xl cursor-pointer"
                    onClick={() => setMenuOpen(!menuOpen)}
                >
                    ☰
                </button>

                {/* Menú en pantallas grandes */}
                <div className="hidden lg:flex gap-6">
                    {adminRoutes
                        .filter((route) => route.showInNavbar)
                        .map((route) => (
                            <NavLink
                                key={route.path}
                                to={`/admin/${route.path}`}
                                end
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md transition-all duration-200 ${
                                        isActive
                                            ? "bg-[#b70a24] text-white font-semibold"
                                            : "hover:bg-[#dc0b2c] hover:text-white"
                                    }`
                                }
                            >
                                {route.name}
                            </NavLink>
                        ))}
                </div>

                {/* Usuario + Logout */}
                {user && (
                    <div className="hidden lg:flex items-center gap-4">
                        <p className="truncate max-w-xs">{user.displayName}</p>
                        <img
                            src={user.photoURL || ""}
                            alt="Profile picture"
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <button
                            onClick={handleLogout}
                            className="relative group bg-[#dc0b2c] hover:bg-red-700 text-white px-4 py-3 rounded flex items-center cursor-pointer"
                        >
                            <FaSignOutAlt className="w-6 h-6" />
                            <span className="absolute left-1/2 transform -translate-x-1/2 top-full mt-2 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-4">
                Log out
              </span>
                        </button>
                    </div>
                )}
            </div>

            {/* Menú móvil */}
            {menuOpen && (
                <div className="flex flex-col mt-4 gap-3 lg:hidden">
                    {adminRoutes
                        .filter((route) => route.showInNavbar)
                        .map((route) => (
                            <NavLink
                                key={route.path}
                                to={`/admin/${route.path}`}
                                end
                                className={({ isActive }) =>
                                    `px-3 py-2 rounded-md transition-all duration-200 ${
                                        isActive
                                            ? "bg-[#b70a24] text-white font-semibold"
                                            : "hover:bg-[#dc0b2c] hover:text-white"
                                    }`
                                }
                                onClick={() => setMenuOpen(false)}
                            >
                                {route.name}
                            </NavLink>
                        ))}

                    {/* Usuario y logout (móvil) */}
                    {user && (
                        <div className="flex flex-col gap-2 mt-2">
                            <div className="flex items-center gap-2">
                                <img
                                    src={user.photoURL || ""}
                                    alt="Profile"
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <p>{user.displayName}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-[#dc0b2c] hover:bg-red-700 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
                            >
                                <FaSignOutAlt />
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
}
