export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 text-center px-4">
            <h1 className="text-5xl font-bold text-red-600 mb-4">404</h1>
            <p className="text-xl text-gray-700 mb-4">Page not found</p>
            <p className="text-gray-500">The route you are looking for does not exist.</p>
        </div>
    );
}
