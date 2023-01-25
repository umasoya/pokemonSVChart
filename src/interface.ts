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
