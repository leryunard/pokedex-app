import {useEffect, useState} from "react";
import TextInput from "../../../components/ui/TextInput.tsx";
import SelectInput from "../../../components/ui/SelectInput.tsx";
import {toast} from "react-toastify";
import {ref, push} from "firebase/database";
import {database, auth} from "../../../firebase.ts";
import {useNavigate} from "react-router-dom";
import Modal from "../../../components/Modal.tsx";

interface Region {
    name: string;
    url: string;
}

interface PokemonEntry {
    entry_number: number;
    pokemon_species: { name: string };
}

interface PokemonDetails {
    id: number;
    name: string;
    sprite: string;
    types: string[];
    description: string;
    abilities: string[];
    moves: string[];
}

interface PokemonType {
    type: {
        name: string;
    };
}

interface Ability {
    ability: {
        name: string;
    };
}

interface Move {
    move: {
        name: string;
    };
}

interface FlavorTextEntry {
    flavor_text: string;
    language: {
        name: string;
    };
}

interface SpeciesData {
    flavor_text_entries: FlavorTextEntry[];
}

export default function CreateTeam() {
    const navigate = useNavigate();
    const [teamName, setTeamName] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("");
    const [regions, setRegions] = useState<Region[]>([]);
    const [errors, setErrors] = useState<{ name?: string; region?: string }>({});
    const [pokemonList, setPokemonList] = useState<PokemonEntry[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<PokemonEntry[]>([]);
    const [filter, setFilter] = useState("");
    const [pokemonDetailsMap, setPokemonDetailsMap] = useState<Record<string, PokemonDetails>>({});
    const POKEAPI_URL = "https://pokeapi.co/api/v2";
    const [showPokemonModal, setShowPokemonModal] = useState(false);
    const [selectedPokemonDetails, setSelectedPokemonDetails] = useState<PokemonDetails | null>(null);

    useEffect(() => {
        fetch(`${POKEAPI_URL}/region`)
            .then((res) => res.json())
            .then((data) => setRegions(data.results))
            .catch(() => toast.error("Error loading regions"));
    }, []);

    const handleOpenPokemonModal = async (name: string) => {
        const details = pokemonDetailsMap[name];
        if (!details) {
            await fetchPokemonDetails(name);
        }
        console.log("Details", pokemonDetailsMap[name]);
        setSelectedPokemonDetails(pokemonDetailsMap[name]);
        setShowPokemonModal(true);
    };

    useEffect(() => {
        if (!selectedRegion) return;

        const fetchRegionPokemon = async () => {
            try {
                const regionRes = await fetch(`${POKEAPI_URL}/region/${selectedRegion}`);
                const regionData = await regionRes.json();
                const pokedexName = regionData.pokedexes[0].name;
                const pokedexRes = await fetch(`${POKEAPI_URL}/pokedex/${pokedexName}`);
                const pokedexData = await pokedexRes.json();
                setPokemonList(pokedexData.pokemon_entries);
            } catch {
                toast.error("Failed to load Pokémon for region");
            }
        };

        fetchRegionPokemon();
    }, [selectedRegion]);

    const fetchPokemonDetails = async (name: string) => {
        if (pokemonDetailsMap[name]) return;

        try {
            const res = await fetch(`${POKEAPI_URL}/pokemon/${name}`);
            const data: {
                id: number;
                name: string;
                sprites: { front_default: string };
                types: PokemonType[];
                abilities: Ability[];
                moves: Move[];
                species: { url: string };
            } = await res.json();

            const speciesRes = await fetch(data.species.url);
            const speciesData: SpeciesData = await speciesRes.json();

            const id = data.id;
            const sprite = data.sprites.front_default;
            const types = data.types.map((t) => t.type.name);
            const description = speciesData.flavor_text_entries.find((entry) => entry.language.name === "en")?.flavor_text || "";
            const abilities = data.abilities.map((a) => a.ability.name);
            const moves = data.moves.map((m) => m.move.name);

            setPokemonDetailsMap((prev) => ({
                ...prev,
                [name]: {id, name, sprite, types, description, abilities, moves},
            }));
        } catch {
            console.error(`Failed to fetch details for ${name}`);
        }
    };

    useEffect(() => {
        filteredPokemon.forEach((p) => {
            fetchPokemonDetails(p.pokemon_species.name);
        });
    }, [pokemonList, filter]);

    const handleSelectPokemon = (pokemon: PokemonEntry) => {
        const alreadySelected = selectedPokemon.some(p => p.pokemon_species.name === pokemon.pokemon_species.name);
        if (alreadySelected) {
            setSelectedPokemon(prev => prev.filter(p => p.pokemon_species.name !== pokemon.pokemon_species.name));
        } else {
            if (selectedPokemon.length >= 6) {
                toast.warn("You can only select up to 6 Pokémon");
                return;
            }
            setSelectedPokemon(prev => [...prev, pokemon]);
        }
    };

    const handleSaveTeam = async () => {
        let hasError = false;
        const newErrors: typeof errors = {};

        if (!teamName.trim()) {
            newErrors.name = "Team name is required";
            toast.error(newErrors.name);
            hasError = true;
        } else if (teamName.length > 20) {
            newErrors.name = "Team name must be 20 characters or less";
            toast.error(newErrors.name);
            hasError = true;
        }

        if (!selectedRegion) {
            newErrors.region = "Region is required";
            toast.error(newErrors.region);
            hasError = true;
        }

        if (selectedPokemon.length < 3 || selectedPokemon.length > 6) {
            toast.error("Select between 3 and 6 Pokémon");
            hasError = true;
        }

        setErrors(newErrors);
        if (hasError) return;

        const userId = auth.currentUser?.uid;
        if (!userId) {
            toast.error("You must be logged in to save a team");
            return;
        }

        const teamData = {
            name: teamName,
            region: selectedRegion,
            pokemon: selectedPokemon.map(p => ({
                id: p.entry_number,
                name: p.pokemon_species.name,
            })),
            createdAt: new Date().toISOString(),
        };

        try {
            const newTeamRef = ref(database, `teams/${userId}`);
            await push(newTeamRef, teamData);
            setTeamName("");
            setSelectedRegion("");
            setSelectedPokemon([]);
            setErrors({});
            navigate("/admin/teams");
            toast.success("Team saved successfully!");
        } catch {
            toast.error("Failed to save team");
        }
    };

    const filteredPokemon = pokemonList.filter(p =>
        p.pokemon_species.name.toLowerCase().includes(filter.toLowerCase()) ||
        String(p.entry_number).includes(filter)
    );

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Create New Pokémon Team</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <TextInput
                        label="Team Name"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Enter a team name"
                    />
                    {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                </div>

                <div>
                    <SelectInput
                        label="Select Region"
                        value={selectedRegion}
                        options={regions.map((r) => ({label: r.name, value: r.name}))}
                        onChange={setSelectedRegion}
                        placeholder="Choose a region"
                    />
                    {errors.region && <p className="text-red-500 text-sm">{errors.region}</p>}
                </div>
            </div>

            {selectedRegion && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    {/* Lista de Pokémon */}
                    <div className="md:col-span-2">
                        <TextInput
                            label="Search Pokémon"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            placeholder="Filter by name or number"
                        />

                        <div className="max-h-[500px] overflow-y-auto pr-2 mt-2">
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                                {filteredPokemon.map((pokemon, idx) => {
                                    const name = pokemon.pokemon_species.name;
                                    const number = pokemon.entry_number;
                                    const selected = selectedPokemon.some(p => p.pokemon_species.name === name);
                                    const details = pokemonDetailsMap[name];

                                    return (
                                        <div
                                            key={idx}
                                            onClick={() => handleSelectPokemon(pokemon)}
                                            className={`relative px-3 py-6 rounded border text-sm capitalize cursor-pointer bg-cover bg-center flex flex-col items-center justify-end ${
                                                selected ? "bg-green-200 text-white" : "bg-white hover:bg-blue-100"
                                            }`}
                                            style={{
                                                backgroundImage: details?.sprite ? `url(${details.sprite})` : "none",
                                                backgroundColor: selected ? "#22c55e" : undefined,
                                            }}
                                        >
                                            <div className="absolute top-2 right-2 flex flex-wrap gap-1 justify-center"
                                                 onClick={(event) => {
                                                     event.stopPropagation();
                                                     handleOpenPokemonModal(name);
                                                 }}>
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                     className="h-5 w-5 text-blue-600" viewBox="0 0 20 20"
                                                     fill="currentColor">
                                                    <path fillRule="evenodd"
                                                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-4a1 1 0 100 2 1 1 0 000-2zm1 4a1 1 0 00-2 0v3a1 1 0 002 0v-3z"
                                                          clipRule="evenodd"/>
                                                </svg>
                                            </div>
                                            <span
                                                className="bg-white bg-opacity-80 px-2 py-1 rounded mb-1 text-xs text-black font-semibold">
                        #{number} - {name}
                      </span>

                                            <div className="flex flex-wrap gap-1 justify-center">
                                                {details?.types.map((type, i) => (
                                                    <span
                                                        key={i}
                                                        className="text-[10px] px-2 py-[2px] bg-gray-200 rounded-full text-black"
                                                    >
                            {type}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Pokémon seleccionados */}
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-semibold mb-2">Selected Pokémon ({selectedPokemon.length}/6)</h3>
                        <ul className="space-y-2">
                            {selectedPokemon.map((p, idx) => (
                                <li
                                    key={idx}
                                    className="bg-gray-100 px-3 py-2 rounded border text-sm capitalize flex justify-between items-center cursor-pointer"
                                >
                                    #{p.entry_number} - {p.pokemon_species.name}
                                    <button
                                        onClick={() => handleSelectPokemon(p)}
                                        className="ml-2 text-red-500 hover:underline text-xs cursor-pointer"
                                    >
                                        Remove
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="mt-6 text-right">
                <button
                    onClick={handleSaveTeam}
                    className="bg-[#dc0b2c] hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold cursor-pointer"
                >
                    Save Team
                </button>
            </div>
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
                                {selectedPokemonDetails.abilities?.map((a, idx) => (
                                    <li key={idx}>{a}</li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <p className="font-semibold">Moves:</p>
                            <div className="max-h-40 overflow-y-auto border rounded p-2 text-sm text-left space-y-1">
                                {selectedPokemonDetails.moves?.map((m, idx) => (
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
