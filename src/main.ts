import { BaseStats, Pokemon } from './interface'

const iconv = require('iconv-lite');
const cheerio = require('cheerio');
// require('buffer');

// ポケモン徹底攻略
const url :string = 'https://yakkun.com/sv/pokemon_list.htm?mode=national';
// データを書き込むシートID
const sid :string = '1qpHD4JvVJWh6_bUJdnBSZOj-EZid6eVlKX4ER_ET0xM';
// スプレッドシートを取得
const spereadsheet = SpreadsheetApp.openById(sid);
// シートを取得
const sheetName :string = 'ポケモンリスト';
const sheet = spereadsheet.getSheetByName(sheetName);

export const getPokemon = () => {
  // ページの取得
  const html = UrlFetchApp.fetch(url).getContentText('EUC-JP');
  // cheerioの初期化
  const $ = cheerio.load(html);

  const $rows = $('table.list td.c1');

  // 全国図鑑No を取得していく
  const numbers :number[] = [];
  $rows.each((_ :number, row :any) => {
    numbers.push(Number($(row).text()));
  });

  // ポケモンの詳細を取得していく
  const pokemons :Pokemon[] = getPokemonDetail(numbers);
}

/**
 * @param {Array<Number>}
 * @return {Array}
 */
const getPokemonDetail = (numbers :number[]): Pokemon[] => {

  // pokemonオブジェクトの配列
  const pokemons :Pokemon[] = [];

  numbers.forEach((number :number, index :number) => {
    // ポケモンごとの図鑑ページ
    const url :string = `https://yakkun.com/sv/zukan/n${number}`;
    // ページの取得
    const html :string = UrlFetchApp.fetch(url).getContentText('EUC-JP');
    const $ :any = cheerio.load(html);

    // タイプ
    const types :string[] = [];
    $('#base_anchor > table > tbody > tr > td.c1:contains("タイプ")').each((_ :number, td: any) => {
      // imgのaltからタイプ名を取得
      // 8行目を指定しているがポケモンごとに揺れがあるのでだめ
      const $td = $(td).next();
      $td.find('img').each((_: number, img: any) => {
        types.push($(img).attr('alt'));
      });
    });

    // pokemonオブジェクトの生成
    const pokemon :Pokemon = {
      icon: $('#base_anchor > table > tbody > tr:nth-child(2) > td > img').attr('src'),
      name: $('#base_anchor > table > tbody > tr:first-child > th').text(),
      weight: $('#base_anchor > table > tbody > tr:nth-child(7) > td:not(.c1) > ul > li:first-child').text().replace('/kg/g', ''), 
      types: types,
      baseStats: {
        h: $('#stats_anchor > table > tbody > tr:nth-child(2) > td:nth-child(2)').text().trim().replace('/\(.*\)/g', ''),
        a: 0,
        b: 0,
        c: 0,
        d: 0,
        s: 0,
      }
    };
    console.log(pokemon);
  });

  return pokemons;
}
