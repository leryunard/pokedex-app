export default function Forbidden() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 text-center px-4">
            <h1 className="text-5xl font-bold text-yellow-500 mb-4">403</h1>
            <p className="text-xl text-gray-700 mb-4">Acceso denegado</p>
            <p className="text-gray-500">No tienes permisos para ver esta página.</p>
        </div>
    );
}
