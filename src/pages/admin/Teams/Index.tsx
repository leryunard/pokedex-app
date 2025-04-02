export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 text-center px-4">
            <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
            <p className="text-xl text-gray-700 mb-4">Página no encontrada</p>
            <p className="text-gray-500">La ruta que estás buscando no existe.</p>
        </div>
    );
}
