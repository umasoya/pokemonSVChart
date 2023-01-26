import {
  BaseStats,
  Pokemon,
  PokeJson,
  PokeSpecies,
  PokeAvilities
} from './interface'
import { TransType } from './const';

const cheerio = require('cheerio');

// データを書き込むシートID
const sid: string = '1qpHD4JvVJWh6_bUJdnBSZOj-EZid6eVlKX4ER_ET0xM';
// スプレッドシートを取得
const spereadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null = SpreadsheetApp.openById(sid);

// シートを取得
const sheetName: string = 'ポケモンリスト';
const sheet: GoogleAppsScript.Spreadsheet.Sheet | null = spereadsheet.getSheetByName(sheetName);

export const getPokemon = () => {
  // ポケモン徹底攻略
  const url: string = 'https://yakkun.com/sv/pokemon_list.htm?mode=national';
  // ページの取得
  const html: string = UrlFetchApp.fetch(url).getContentText('EUC-JP');
  // cheerioの初期化
  const $: cheerio.Root = cheerio.load(html);

  const $rows: any = $('table.list td.c1');

  // 全国図鑑No を取得していく
  const numbers: number[] = [];
  $rows.each((_: number, row: any) => {
    numbers.push(Number($(row).text()));
  });

  // ポケモンの詳細を取得していく
  // const pokemons: Pokemon[] = getPokemonDetail(numbers);
  const pokemons: Pokemon[] = getPokemonData(numbers);

  // シートに書き込み
  // writePokemonsData(pokemons);
}

const getPokemonData = (numbers :number[]): Pokemon[] => {
  const pokemons :Pokemon[] = [];
  numbers.forEach((number: number, index: number) => {
    // pokeapi
    const url  :string   = `https://pokeapi.co/api/v2/pokemon/${number}`;
    const json :PokeJson = JSON.parse(UrlFetchApp.fetch(url).getContentText());
    const speciesUrl :string = `https://pokeapi.co/api/v2/pokemon-species/${number}`;
    const speciesJson :PokeSpecies = JSON.parse(UrlFetchApp.fetch(speciesUrl).getContentText());

    // name
    const name :string = speciesJson.names.find((obj :any) => {
      return obj.language.name === 'ja';
    })!.name;

    // base stats
    const hp :number = json.stats.find((obj :any) => {
      return obj.stat.name === 'hp';
    })!.base_stat;
    const attack :number = json.stats.find((obj :any) => {
      return obj.stat.name === 'attack';
    })!.base_stat;
    const defence :number = json.stats.find((obj :any) => {
      return obj.stat.name === 'defense';
    })!.base_stat;
    const specialAttack :number = json.stats.find((obj :any) => {
      return obj.stat.name === 'special-attack';
    })!.base_stat;
    const specialDefence :number = json.stats.find((obj :any) => {
      return obj.stat.name === 'special-defense';
    })!.base_stat;
    const speed :number = json.stats.find((obj :any) => {
      return obj.stat.name === 'speed';
    })!.base_stat;

    // types
    const types :string[] = [];
    json.types.forEach((obj :any) => {
      types.push(TransType[obj.type.name]);
      // types.push(obj.type.name);
    });

    // abilities
    const abilities :string[] = [];
    json.abilities.forEach((obj :any) => {
      const res = UrlFetchApp.fetch(obj.ability.url).getContentText();
      const json :PokeAvilities = JSON.parse(res);
      const abilityName :string = json.names.find((obj :any) => {
        return obj.language.name === 'ja';
      })!.name;
      abilities.push(abilityName);
    });

    // pokemonオブジェクトの生成
    const pokemon: Pokemon = {
      icon: json.sprites.front_default,
      name: name,
      weight: json.weight,
      types: types,
      baseStats: {
        h: hp,
        a: attack,
        b: defence,
        c: specialAttack,
        d: specialDefence,
        s: speed,
      },
      abilities: abilities,
    };

    console.log(pokemon);
    pokemons.push(pokemon);
  });
  return pokemons;
};

const writePokemonsData = (pokemons: Pokemon[]) => {
  // A4 - M*
}