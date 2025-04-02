import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar"; // tu navbar
import { useState } from "react";

export default function DefaultLayout() {
    const location = useLocation();
    const [mostrarSidebar] = useState(true);

    return (
        <>
            <div
                className={`relative padding-custom-course min-h-screen ${
                    mostrarSidebar ? "sm:ml-0" : ""
                }`}
            >
                <Navbar />
                <div
                    className="px-4"
                    style={{ position: "relative", zIndex: 1 }}
                >
                    <Outlet key={location.pathname} />
                </div>

                <div className="w-full z-50 bg-gray-900 footer-custom absolute bottom-0">
                    {/* Espacio para el footer */}
                </div>
            </div>
        </>
    );
}
