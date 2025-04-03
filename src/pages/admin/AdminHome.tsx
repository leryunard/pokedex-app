import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Region {
    name: string;
    url: string;
}

export default function AdminHome() {
    const [regions, setRegions] = useState<Region[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("https://pokeapi.co/api/v2/region")
            .then((res) => res.json())
            .then((data) => setRegions(data.results))
            .catch(() => setRegions([]));
    }, []);

    const getRandomSpriteUrls = (start: number, end: number, count = 8): string[] => {
        const nums: number[] = [];
        while (nums.length < count) {
            const rand = Math.floor(Math.random() * (end - start + 1)) + start;
            if (!nums.includes(rand)) nums.push(rand);
        }
        return nums.map(
            (id) => `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`
        );
    };

    const regionSpriteRanges: Record<string, [number, number]> = {
        kanto: [1, 151],
        johto: [152, 251],
        hoenn: [252, 386],
        sinnoh: [387, 493],
        unova: [494, 649],
        kalos: [650, 721],
        alola: [722, 809],
        galar: [810, 898],
        paldea: [899, 1010],
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-red-600">Welcome, Trainer!</h2>
            <p className="text-gray-700 text-lg mb-6">
                Ready to build your next unbeatable Pokémon team? Choose a region and get started.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
                {regions.map((region, idx) => {
                    const cleanName = region.name.replace("-", " ");
                    const spriteRange = regionSpriteRanges[region.name] || [1, 151];
                    const spriteUrls = getRandomSpriteUrls(spriteRange[0], spriteRange[1]);

                    return (
                        <div
                            key={idx}
                            className="relative overflow-hidden bg-white border-2 border-red-500 rounded-lg shadow-md p-4 hover:scale-105 hover:ring-2 hover:ring-red-400 transition-transform duration-300 cursor-pointer"
                            onClick={() => navigate(`/admin/regions/${region.name}`)}
                        >
                            <div className="absolute inset-0 opacity-70 z-0 pointer-events-none">
                                {spriteUrls.map((url, i) => (
                                    <img
                                        key={i}
                                        src={url}
                                        alt=""
                                        className="absolute w-10 h-10"
                                        style={{
                                            top: `${Math.random() * 80}%`,
                                            left: `${Math.random() * 80}%`,
                                            transform: `rotate(${Math.random() * 360}deg)`,
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="relative z-10">
                                <h3 className="text-xl font-bold text-gray-800 capitalize">{cleanName}</h3>
                                <p className="text-sm text-gray-600">{spriteRange[1] - spriteRange[0] + 1} Pokémon</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-center">
                <button
                    onClick={() => navigate("/admin/teams/new")}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full shadow font-semibold tracking-wide cursor-pointer"
                >
                    ➕ Create New Team
                </button>
            </div>
        </div>
    );
}
