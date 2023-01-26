export interface BaseStats {
    h: number;
    a: number;
    b: number;
    c: number;
    d: number;
    s: number;
}

export interface Pokemon {
    icon: string;
    name: string;
    weight: number;
    types: string[];
    baseStats: BaseStats;
    avility: string[];
}

export interface PokeJson {
    id: number;
    name: string;
    weight: number;
    abilities: {
        ability: {
            name: string;
            url:  string;
        };
    }[];
    species: {
        name: string;
        url:  string;
    };
    sprites: {
        front_default: string;
    };
    stats: {
        base_stat: number;
        stat: {
            name: string;
            url:  string;
        };
    }[];
}

export interface PokeSpecies {
    names: {
        language: {
            name: string;
            url: string;
        }
        name: string;
    }[];
}