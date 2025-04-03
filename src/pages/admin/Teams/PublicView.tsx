import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../../../firebase";

interface PokemonEntry {
    name: string;
    id: number;
}

interface Team {
    id: string;
    name: string;
    pokemon: PokemonEntry[];
    region?: string;
}

interface PokemonFullData {
    name: string;
    id: number;
    sprite: string;
    types: string[];
    abilities: string[];
    moves: string[];
    description: string;
}

interface FlavorTextEntry {
    flavor_text: string;
    language: {
        name: string;
    };
}

interface PokeAPIResponse {
    name: string;
    id: number;
    sprites: {
        front_default: string;
    };
    types: {
        type: {
            name: string;
        };
    }[];
    abilities: {
        ability: {
            name: string;
        };
    }[];
    moves: {
        move: {
            name: string;
        };
    }[];
}

interface SpeciesResponse {
    flavor_text_entries: FlavorTextEntry[];
}

const decodeShortToken = (token: string) => {
    return atob(token);
};

export default function PublicTeam() {
    const POKEAPI_URL = "https://pokeapi.co/api/v2";
    const { token } = useParams<{ token: string }>();
    const [team, setTeam] = useState<Team | null>(null);
    const [detailedPokemon, setDetailedPokemon] = useState<PokemonFullData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) return;

        try {
            const teamId = decodeShortToken(token);
            const teamRef = ref(database, `public/teams/${teamId}`);

            onValue(teamRef, async (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    setTeam(data);
                    const details = await Promise.all(
                        data.pokemon.map(async (p: PokemonEntry) => {
                            const res = await fetch(`${POKEAPI_URL}/pokemon/${p.name}`);
                            const pokeData: PokeAPIResponse = await res.json();

                            const speciesRes = await fetch(`${POKEAPI_URL}/pokemon-species/${p.name}`);
                            const speciesData: SpeciesResponse = await speciesRes.json();
                            const description =
                                speciesData.flavor_text_entries.find((entry: FlavorTextEntry) => entry.language.name === "en")?.flavor_text.replace(/\f/g, " ") ||
                                "No description available.";

                            return {
                                name: pokeData.name,
                                id: pokeData.id,
                                sprite: pokeData.sprites.front_default,
                                types: pokeData.types.map((t) => t.type.name),
                                abilities: pokeData.abilities.map((a) => a.ability.name),
                                moves: pokeData.moves.map((m) => m.move.name),
                                description,
                            };
                        })
                    );

                    setDetailedPokemon(details);
                } else {
                    setTeam(null);
                }

                setLoading(false);
            });
        } catch (error) {
            console.error("Invalid token", error);
            setTeam(null);
            setLoading(false);
        }
    }, [token]);

    if (loading) return <p className="text-center mt-10 text-lg">Loading...</p>;
    if (!team) return <p className="text-center mt-10 text-red-500">Team not found.</p>;

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">{team.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {detailedPokemon.map((poke, idx) => (
                    <div key={idx} className="bg-white shadow-md rounded-lg p-4 border border-gray-200">
                        <div className="flex flex-col items-center text-center mb-4">
                            <img src={poke.sprite} alt={poke.name} className="w-20 h-20" />
                            <h3 className="text-xl font-bold capitalize mt-2">{poke.name}</h3>
                            <p className="text-sm text-gray-500">#{poke.id}</p>
                        </div>

                        <div className="mb-2">
                            <strong>Types:</strong>{" "}
                            {poke.types.map((type, i) => (
                                <span
                                    key={i}
                                    className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                                >
                                    {type}
                                </span>
                            ))}
                        </div>

                        <div className="mb-2">
                            <strong>Abilities:</strong>{" "}
                            {poke.abilities.map((ability, i) => (
                                <span
                                    key={i}
                                    className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                                >
                                    {ability}
                                </span>
                            ))}
                        </div>

                        <div className="mb-3">
                            <strong>Description:</strong>
                            <p className="text-sm text-gray-700 italic mt-1">{poke.description}</p>
                        </div>

                        <div>
                            <strong>Moves:</strong>
                            <div className="max-h-32 overflow-y-auto text-sm mt-1 p-2 bg-gray-100 rounded">
                                {poke.moves.map((move, i) => (
                                    <span key={i} className="inline-block mr-2 mb-1 text-gray-800">
                                        {move}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}