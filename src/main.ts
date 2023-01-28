import {
  BaseStats,
  Pokemon,
  PokeJson,
  PokeSpecies,
  PokeAvilities,
  generation,
  NumDict
} from './interface'
import { TransType } from './const';

const cheerio = require('cheerio');

// データを書き込むシートID
const sid: string = '1qpHD4JvVJWh6_bUJdnBSZOj-EZid6eVlKX4ER_ET0xM';
// スプレッドシートを取得
const spereadsheet: GoogleAppsScript.Spreadsheet.Spreadsheet | null = SpreadsheetApp.openById(sid);

// シートを取得
const sheetName: string = 'ポケモンリスト';
const sheet: GoogleAppsScript.Spreadsheet.Sheet = spereadsheet.getSheetByName(sheetName)!;

export const getPokemon = () => {
  // pokeapi
  const url: string = 'http://pokeapi.co/api/v2/generation/9/';
  const json :generation = JSON.parse(UrlFetchApp.fetch(url).getContentText());

  const ids :number[] = getIds();

  // ポケモンの詳細を取得していく
  const pokemons: Pokemon[] = getPokemonData(ids);

  // シートに書き込み
  writePokemonsData(sheet, pokemons);
}

/**
 *  ポケモン徹底攻略からSVで入手可能なポケモンのみを抽出
 * @returns
 */
const getIds = (): number[] => {
  const ids :number[] = [];
  // ポケ徹
  const url :string = 'https://yakkun.com/sv/pokemon_list.htm';
  const res = UrlFetchApp.fetch(url).getContentText('EUC-JP');
  const $ = cheerio.load(res);

  $('table[summary="ポケモンリスト"] tr:not(:first)').each((_: number, row :any) => {
    const $row :any    = $(row);
    const url  :string = $row.find('td:nth-child(3) > a').attr('href');
    let   id   :number = Number(url.split('/').pop()!.replace(/[^0-9]/g, ''));

    // ドオー
    if (id === 1009) {
      id = 980;
    }
    // コノヨザル
    if (id === 1010) {
      id = 979;
    }
    // ノココッチ
    if (id === 917) {
      id = 982;
    }
    // リキキリン
    if (id === 928) {
      id = 981;
    }

    if (ids.includes(id)) {
      // continue
      return true;
    }

    ids.push(id);
  });

  // 以下でフォルム違いを個別に追加
  ids.push(10008); // ヒートロトム
  ids.push(10009); // ウォッシュロトム
  ids.push(10010); // フロストロトム
  ids.push(10011); // スピンロトム
  ids.push(10012); // カットロトム
  ids.push(10126); // ルガルガン(真夜中)
  ids.push(10152); // ルガルガン(黄昏)
  ids.push(10123); // オドリドリ(ぱちぱち)
  ids.push(10124); // オドリドリ(ふらふら)
  ids.push(10125); // オドリドリ(まいまい)
  ids.push(10250); // パルデアケンタロス(格闘単)
  ids.push(10251); // パルデアケンタロス(炎)
  ids.push(10252); // パルデアケンタロス(水)
  ids.push(10256); // イルカマン(マイティフォルム)
  ids.push(10185); // コオリッポ(ナイスフェイス)

  return ids;
}

const getPokemonData = (numbers :number[]): Pokemon[] => {
  const pokemons :Pokemon[] = [];
  try {
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

      console.log(pokemon.name);
      pokemons.push(pokemon);
    });
  } catch (err) {
    console.error(err);
  }
  return pokemons;
};

const writePokemonsData = (sheet :GoogleAppsScript.Spreadsheet.Sheet, pokemons: Pokemon[]) => {
  // A4 - M*
  // [
  //   [ 'icon', 'name', ... ]
  // ]
  const length = pokemons.length;
  const rows :any[][] = [];
  pokemons.forEach((pokemon :Pokemon) => {
    const row :any[] = [
      `=IMAGE("${pokemon.icon}")` || '',
      pokemon.name,
      pokemon.types[0],
      pokemon.types[1] || '',
      pokemon.abilities[0],
      pokemon.abilities[1] || '',
      pokemon.abilities[2] || '',
      pokemon.baseStats.h,
      pokemon.baseStats.a,
      pokemon.baseStats.b,
      pokemon.baseStats.c,
      pokemon.baseStats.d,
      pokemon.baseStats.s,
      pokemon.weight / 10, // なぜかpokeapiの体重表記は0.1kg = 1
    ];
    rows.push(row);
  });

  sheet.getRange(4, 1, length, 14).setValues(rows);
  // sheet.getRange(4, 1, length + 4, 14).setValues(rows);
}