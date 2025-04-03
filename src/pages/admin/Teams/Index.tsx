import {useEffect, useState} from "react";
import {ref, onValue, remove} from "firebase/database";
import {database, auth} from "../../../firebase";
import {toast} from "react-toastify";
import Modal from "../../../components/Modal";

interface PokemonEntry {
    name: string;
    id: number;
}

interface RawTeamData {
    name: string;
    pokemon: PokemonEntry[];
    region?: string;
}

interface Team {
    id: string;
    name: string;
    pokemon: PokemonEntry[];
    region?: string;
}

interface PokemonDetail {
    name: string;
    id: number;
    sprite: string;
    types: string[];
    description: string;
    abilities: string[];
    moves: string[];
}

export default function Teams() {
    const [teams, setTeams] = useState<Team[]>([]);
    const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const [selectedPokemonName, setSelectedPokemonName] = useState<string | null>(null);
    const [selectedPokemonDetails, setSelectedPokemonDetails] = useState<PokemonDetail | null>(null);
    const [showPokemonModal, setShowPokemonModal] = useState(false);

    const [searchName, setSearchName] = useState("");
    const [selectedRegion, setSelectedRegion] = useState("all");

    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const teamsRef = ref(database, `teams/${userId}`);
        onValue(teamsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedTeams: Team[] = Object.entries(data).map(([key, value]) => {
                    const teamData = value as RawTeamData;
                    return {
                        id: key,
                        name: teamData.name,
                        pokemon: teamData.pokemon,
                        region: teamData.region || "unknown",
                    };
                });
                setTeams(loadedTeams);
            } else {
                setTeams([]);
            }
        });
    }, []);

    const confirmDelete = (team: Team) => {
        setSelectedTeam(team);
        setShowConfirm(true);
    };

    const deleteTeam = async () => {
        if (!selectedTeam) return;
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        try {
            await remove(ref(database, `teams/${userId}/${selectedTeam.id}`));
            toast.success("Team deleted successfully");
            setShowConfirm(false);
            setSelectedTeam(null);
        } catch {
            toast.error("Failed to delete team");
        }
    };

    const handleOpenPokemonModal = (name: string) => {
        setSelectedPokemonName(null);
        setSelectedPokemonDetails(null);
        setShowPokemonModal(false);

        setTimeout(() => {
            setSelectedPokemonName(name);
        }, 0);
    };

    useEffect(() => {
        if (!selectedPokemonName) return;

        const fetchDetails = async () => {
            try {
                const [res1, res2] = await Promise.all([
                    fetch(`https://pokeapi.co/api/v2/pokemon/${selectedPokemonName}`),
                    fetch(`https://pokeapi.co/api/v2/pokemon-species/${selectedPokemonName}`),
                ]);

                const data1 = await res1.json();
                const data2 = await res2.json();

                const detail: PokemonDetail = {
                    name: data1.name,
                    id: data1.id,
                    sprite: data1.sprites.front_default,
                    types: data1.types.map((t: { type: { name: string } }) => t.type.name),
                    abilities: data1.abilities.map((a: { ability: { name: string } }) => a.ability.name),
                    moves: data1.moves.map((m: { move: { name: string } }) => m.move.name),
                    description:
                        data2.flavor_text_entries.find((d: {
                            language: { name: string }
                        }) => d.language.name === "en")?.flavor_text || "",
                };

                setSelectedPokemonDetails(detail);
                setShowPokemonModal(true);
            } catch {
                toast.error("Failed to load Pokémon details");
            }
        };

        fetchDetails();
    }, [selectedPokemonName]);

    const filteredTeams = teams
        .filter((team) => team.name.toLowerCase().includes(searchName.toLowerCase()))
        .filter((team) => selectedRegion === "all" || team.region === selectedRegion);

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">My Pokémon Teams</h2>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                <input
                    type="text"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    placeholder="Search by team name..."
                    className="border px-3 py-2 rounded w-full sm:w-60"
                />

                <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="border px-3 py-2 rounded w-full sm:w-60 cursor-pointer"
                >
                    <option value="all">All regions</option>
                    <option value="kanto">Kanto</option>
                    <option value="johto">Johto</option>
                    <option value="hoenn">Hoenn</option>
                    <option value="sinnoh">Sinnoh</option>
                    <option value="unova">Unova</option>
                    <option value="kalos">Kalos</option>
                    <option value="alola">Alola</option>
                    <option value="galar">Galar</option>
                    <option value="paldea">Paldea</option>
                </select>
            </div>

            {/* Listado */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTeams.map((team) => (
                    <div key={team.id} className="relative bg-white shadow-md rounded-lg p-4">
                        <h3 className="text-lg font-bold mb-2">{team.name}</h3>

                        <div className="grid grid-cols-3 gap-2 mb-2">
                            {team.pokemon.map((poke, idx) => (
                                <PokemonCard
                                    key={idx}
                                    name={poke.name}
                                    number={poke.id}
                                    onClick={() => handleOpenPokemonModal(poke.name)}
                                />
                            ))}
                        </div>

                        <button
                            onClick={() => confirmDelete(team)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm cursor-pointer"
                        >
                            Delete
                        </button>
                    </div>
                ))}
            </div>

            {/* Modal eliminar */}
            <Modal
                show={showConfirm}
                title="Confirm Delete"
                width="w-full max-w-xl mx-2 sm:mx-auto"
                onClose={() => setShowConfirm(false)}
                footer={
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center">
                        <button
                            onClick={() => setShowConfirm(false)}
                            className="px-4 py-2 border rounded cursor-pointer w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={deleteTeam}
                            className="px-4 py-2 bg-red-600 text-white rounded cursor-pointer w-full sm:w-auto"
                        >
                            Delete
                        </button>
                    </div>
                }
            >
                <p className="text-center">
                    Are you sure you want to delete <strong>{selectedTeam?.name}</strong>?
                </p>
            </Modal>

            {/* Modal Pokémon */}
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

function PokemonCard({
                         name,
                         onClick,
                     }: {
    name: string;
    number: number;
    onClick: () => void;
}) {
    const [sprite, setSprite] = useState("");

    useEffect(() => {
        fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
            .then((res) => res.json())
            .then((data) => {
                setSprite(data.sprites.front_default || "");
            });
    }, [name]);

    return (
        <div
            onClick={onClick}
            className="relative h-24 bg-gray-100 rounded overflow-hidden flex flex-col justify-end items-center p-1 cursor-pointer"
        >
            {sprite && (
                <img
                    src={sprite}
                    alt={name}
                    className="absolute inset-0 w-full h-full object-contain"
                />
            )}
        </div>
    );
}
