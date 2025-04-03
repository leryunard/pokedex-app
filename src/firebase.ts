import {initializeApp} from "firebase/app";
import {getAuth} from "firebase/auth";
import {getDatabase} from "firebase/database";

const firebaseConfig = {
    apiKey: "AIzaSyCIjEcFxX-gyVzlSbpAjbJYEAKl_fH7-Zg",
    authDomain: "pokedex-app-43535.firebaseapp.com",
    databaseURL: "https://pokedex-app-43535-default-rtdb.firebaseio.com",
    projectId: "pokedex-app-43535",
    storageBucket: "pokedex-app-43535.firebasestorage.app",
    messagingSenderId: "1086342964231",
    appId: "1:1086342964231:web:2a0878793734ac90fdb6a2"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);
