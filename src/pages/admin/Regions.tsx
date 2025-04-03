import {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {ref, onValue, set} from "firebase/database";
import {auth, database} from "../../firebase";
import Modal from "../../components/Modal.tsx";

interface PokemonEntry {
    entry_number: number;
    pokemon_species: {
        name: string;
        url: string;
    };
}

interface PokemonDetail {
    id: number;
    name: string;
    sprite: string;
    description: string;
    types: string[];
    abilities: string[];
    moves: string[];
}

export default function RegionPokedex() {
    const {name} = useParams<{ name: string }>();
    const navigate = useNavigate();
    const [pokemonList, setPokemonList] = useState<PokemonEntry[]>([]);
    const [captured, setCaptured] = useState<string[]>([]);
    const [showPokemonModal, setShowPokemonModal] = useState(false);
    const [selectedPokemonDetails, setSelectedPokemonDetails] = useState<PokemonDetail | null>(null);

    const user = auth.currentUser;

    useEffect(() => {
        const fetchPokemonByRegion = async () => {
            try {
                const regionRes = await fetch(`https://pokeapi.co/api/v2/region/${name}`);
                const regionData = await regionRes.json();
                const pokedexUrl = regionData.pokedexes?.[0]?.url;
                if (!pokedexUrl) return;

                const pokedexRes = await fetch(pokedexUrl);
                const pokedexData = await pokedexRes.json();

                setPokemonList(pokedexData.pokemon_entries);
            } catch (error) {
                console.error("Error fetching Pokédex:", error);
            }
        };

        fetchPokemonByRegion();
    }, [name]);

    useEffect(() => {
        if (!user || !name) return;

        const capturedRef = ref(database, `users/${user.uid}/captured/${name}`);
        const unsubscribe = onValue(capturedRef, (snapshot) => {
            const data = snapshot.val() || {};
            const capturedNames = Object.keys(data).filter((key) => data[key] === true);
            setCaptured(capturedNames);
        });

        return () => unsubscribe();
    }, [user, name]);

    const handleToggleCapture = (pokemonName: string) => {
        if (!user || !name) return;

        const isCaptured = captured.includes(pokemonName);
        const updated = isCaptured
            ? captured.filter((n) => n !== pokemonName)
            : [...captured, pokemonName];

        setCaptured(updated);

        const userRef = ref(database, `users/${user.uid}/captured/${name}/${pokemonName}`);
        set(userRef, !isCaptured);
    };

    const handleOpenPokemonModal = async (pokemonName: string) => {
        try {
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
            const data = await res.json();

            const speciesRes = await fetch(data.species.url);
            const speciesData = await speciesRes.json();
            const englishFlavor = speciesData.flavor_text_entries.find(
                (entry: { language: { name: string }; flavor_text: string }) => entry.language.name === "en"
            );

            const formattedDetails: PokemonDetail = {
                id: data.id,
                name: data.name,
                sprite: data.sprites.front_default,
                description: englishFlavor?.flavor_text?.replace(/\f/g, " ") || "No description available.",
                types: data.types.map((t: { type: { name: string } }) => t.type.name),
                abilities: data.abilities.map((a: { ability: { name: string } }) => a.ability.name),
                moves: data.moves.map((m: { move: { name: string } }) => m.move.name),
            };

            setSelectedPokemonDetails(formattedDetails);
            setShowPokemonModal(true);
        } catch (error) {
            console.error("Error loading Pokémon info", error);
        }
    };

    const getSpriteUrl = (pokemonName: string): string =>
        `https://img.pokemondb.net/sprites/home/normal/${pokemonName}.png`;

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold text-red-600 capitalize">{name} Region Pokédex</h2>
                    <p className="text-gray-600 mt-1">
                        Captured {captured.length} / {pokemonList.length}
                    </p>
                    <p>Just select the Pokémon card to save it to your Pokédex.</p>
                </div>
                <button
                    onClick={() => navigate("/admin")}
                    className="bg-gray-700 hover:bg-gray-900 text-white px-4 py-2 rounded cursor-pointer"
                >
                    ← Back to Dashboard
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {pokemonList.map(({entry_number, pokemon_species}) => {
                    const isCaptured = captured.includes(pokemon_species.name);
                    const imageUrl = getSpriteUrl(pokemon_species.name);

                    return (
                        <div
                            key={entry_number}
                            onClick={() => handleToggleCapture(pokemon_species.name)}
                            className={`relative bg-white border-2 rounded-lg shadow hover:scale-105 transition-all cursor-pointer flex flex-col items-center p-4 ${
                                isCaptured ? "border-green-500 bg-green-100" : "border-gray-200"
                            }`}
                        >
                            {/* Botón de información */}
                            <div
                                className="absolute top-2 right-2 flex flex-wrap gap-1 justify-center"
                                onClick={(e) => {
                                    e.stopPropagation(); // evita capturar también
                                    handleOpenPokemonModal(pokemon_species.name);
                                }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600"
                                     viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd"
                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 4a1 1 0 00-2 0v3a1 1 0 002 0v-3z"
                                          clipRule="evenodd"/>
                                </svg>
                            </div>

                            <img
                                src={imageUrl}
                                alt={pokemon_species.name}
                                className="w-20 h-20 mb-2 object-contain"
                                onError={(e) =>
                                    ((e.target as HTMLImageElement).src =
                                        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/0.png")
                                }
                            />
                            <span className="text-xs text-gray-500 mb-1">#{entry_number}</span>
                            <h3 className="text-base font-semibold capitalize text-gray-800">
                                {pokemon_species.name}
                            </h3>
                        </div>
                    );
                })}
            </div>

            {/* Modal */}
            <Modal
                show={showPokemonModal}
                title={
                    selectedPokemonDetails
                        ? `#${selectedPokemonDetails.id} ${selectedPokemonDetails.name}`
                        : ""
                }
                width="w-full max-w-2xl mx-2 sm:mx-auto"
                onClose={() => setShowPokemonModal(false)}
                footer={
                    <button
                        onClick={() => setShowPokemonModal(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer"
                    >
                        Close
                    </button>
                }
            >
                {selectedPokemonDetails ? (
                    <div className="text-center space-y-4">
                        <img
                            src={selectedPokemonDetails.sprite}
                            alt={selectedPokemonDetails.name}
                            className="mx-auto w-24 h-24"
                        />
                        <p className="text-gray-700 italic">{selectedPokemonDetails.description}</p>

                        <div>
                            <p className="font-semibold">Types:</p>
                            <div className="flex gap-2 justify-center flex-wrap">
                                {selectedPokemonDetails.types.map((type, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-200 rounded text-xs">
                    {type}
                  </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold">Abilities:</p>
                            <ul className="text-sm space-y-1">
                                {selectedPokemonDetails.abilities.map((a, idx) => (
                                    <li key={idx}>{a}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="font-semibold">Moves:</p>
                            <div className="max-h-40 overflow-y-auto border rounded p-2 text-sm text-left space-y-1">
                                {selectedPokemonDetails.moves.map((m, idx) => (
                                    <div key={idx}>{m}</div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-gray-500">Loading...</p>
                )}
            </Modal>
        </div>
    );
}
