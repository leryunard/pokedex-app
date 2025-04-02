import AppRouter from "./router";
import {ToastContainer} from "react-toastify";

function App() {
    return (
        <>
            <AppRouter/>
            <ToastContainer position="top-right" autoClose={3000}/>
        </>
    );
}

export default App;