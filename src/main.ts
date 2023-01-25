import { BaseStats, Pokemon } from './interface'

const iconv = require('iconv-lite');
const cheerio = require('cheerio');

// ポケモン徹底攻略
const url :string = 'https://yakkun.com/sv/pokemon_list.htm?mode=national';
// データを書き込むシートID
const sid :string = '1qpHD4JvVJWh6_bUJdnBSZOj-EZid6eVlKX4ER_ET0xM';
// スプレッドシートを取得
const spereadsheet :GoogleAppsScript.Spreadsheet.Spreadsheet|null = SpreadsheetApp.openById(sid);

// シートを取得
const sheetName :string = 'ポケモンリスト';
const sheet :GoogleAppsScript.Spreadsheet.Sheet|null = spereadsheet.getSheetByName(sheetName);

export const getPokemon = () => {
  // ページの取得
  const html :string = UrlFetchApp.fetch(url).getContentText('EUC-JP');
  // cheerioの初期化
  const $ :cheerio.Root = cheerio.load(html);

  const $rows :any = $('table.list td.c1');

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
    const $ :cheerio.Root = cheerio.load(html);

    // タイプ
    const types :string[] = [];
    $('#base_anchor > table > tbody > tr > td.c1:contains("タイプ")').each((_ :number, td: any) => {
      // imgのaltからタイプ名を取得
      // 8行目を指定しているがポケモンごとに揺れがあるのでだめ
      const $td :any = $(td).next();
      $td.find('img').each((_: number, img: any) => {
        types.push($(img).attr('alt')!);
      });
    });

    const weight = () :number => {
      const $prev :any    = $('#base_anchor > table > tbody > tr > td.c1:contains("重さ")');
      const $td   :any    = $prev.next();
      const str   :string = $td.find('li:first-child').text();
      return Number(str.replace(/kg/g, ''));
    };

   const hp = () :number => {
    const $prev :any = $('#stats_anchor > table > tbody > tr > td.c1:contains("HP")').first();
    const $td :any = $prev.next();
    const str :string = $td.text();
    return Number(str.trim().replace(/\([^\)]*\)/g, ''));
   };
   const a = () :number => {
    const $prev :any = $('#stats_anchor > table > tbody > tr > td.c1:contains("こうげき")').first();
    const $td :any = $prev.next();
    const str :string = $td.text();
    return Number(str.trim().replace(/\([^\)]*\)/g, ''));
   };
   const b = () :number => {
    const $prev :any = $('#stats_anchor > table > tbody > tr > td.c1:contains("ぼうぎょ")').first();
    const $td :any = $prev.next();
    const str :string = $td.text();
    return Number(str.trim().replace(/\([^\)]*\)/g, ''));
   };
   const c = () :number => {
    const $prev :any = $('#stats_anchor > table > tbody > tr > td.c1:contains("とくこう")').first();
    const $td :any = $prev.next();
    const str :string = $td.text();
    return Number(str.trim().replace(/\([^\)]*\)/g, ''));
   };
   const d = () :number => {
    const $prev :any = $('#stats_anchor > table > tbody > tr > td.c1:contains("とくぼう")').first();
    const $td :any = $prev.next();
    const str :string = $td.text();
    return Number(str.trim().replace(/\([^\)]*\)/g, ''));
   };
   const s = () :number => {
    const $prev :any = $('#stats_anchor > table > tbody > tr > td.c1:contains("すばやさ")').first();
    const $td :any = $prev.next();
    const str :string = $td.text();
    return Number(str.trim().replace(/\([^\)]*\)/g, ''));
   };

    // pokemonオブジェクトの生成
    const pokemon :Pokemon = {
      icon: $('#base_anchor > table > tbody > tr:nth-child(2) > td > img').attr('src')!,
      name: $('#base_anchor > table > tbody > tr:first-child > th').text(),
      weight: weight(),
      types: types,
      baseStats: {
        h: hp(),
        a: a(),
        b: b(),
        c: c(),
        d: d(),
        s: s(),
      }
    };
  });

  return pokemons;
}
