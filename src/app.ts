import { iconv } from 'iconv-lite';

const getPokemon = () => {
  // ポケモン徹底攻略
  const url = 'https://yakkun.com/sv/pokemon_list.htm?mode=national';
  // データを書き込むシートID
  const sid = '1qpHD4JvVJWh6_bUJdnBSZOj-EZid6eVlKX4ER_ET0xM';
  // スプレッドシートを取得
  const spereadsheet = SpreadsheetApp.openById(sid);
  // シートを取得
  const sheetName = 'ポケモンリスト';
  const sheet = spereadsheet.getSheetByName(sheetName);

  // ページの取得
  const html = UrlFetchApp.fetch(url).getContentText('UTF-8');
  // cheerioの初期化
  const $ = Cheerio.load(html);

  const $rows = $('table.list td.c1');

  // 全国図鑑No を取得していく
  const numbers = [];
  $rows.each((_, row) => {
    numbers.push(Number($(row).text()));
  });

  // ポケモンの詳細を取得していく
  const pokemons = getPokemonDetail(numbers);
}

/**
 * @param {Array<Number>}
 * @return {Array}
 */
const getPokemonDetail = (numbers) => {

  // pokemonオブジェクトの配列
  const pokemons = [];

  numbers.forEach((number, index) => {
    // ポケモンごとの図鑑ページ
    const url = `https://yakkun.com/sv/zukan/n${number}`;
    // ページの取得
    const html = UrlFetchApp.fetch(url).getContentText('EUC-JP');
    const $ = Cheerio.load(html);

    // タイプ
    const types = [];
    $('#base_anchor > table > tbody > tr').each((_, tr) => {
      // imgのaltからタイプ名を取得
      // 8行目を指定しているがポケモンごとに揺れがあるのでだめ
      const $tr = $(tr);
      console.info($tr.find('td:first-child').text());
      return true;
      $td.find('img').each((_, img) => {
        types.push($(img).attr('alt'));
      });
    });

    // pokemonオブジェクトの生成
    const pokemon = {
      icon: $('#base_anchor > table > tbody > tr:nth-child(2) > td > img').attr('src'),
      name: $('#base_anchor > table > tbody > tr:first-child > th').text(),
      weight: $('#base_anchor > table > tbody > tr:nth-child(7) > td:not(.c1) > ul > li:first-child').text().replace('/kg/g', ''), 
      types: types,
      baseStats: {
        hp: $('#stats_anchor > table > tbody > tr:nth-child(2) > td:nth-child(2)').text().trim().replace('/\(.*\)/g', ''),
      }
    };
    console.log(pokemon);
  });

  return pokemons;
}
