export const categories = [
  ['driver','ドライバー'],['fairway_wood','フェアウェイウッド'],['utility','ユーティリティ'],['iron','アイアン'],['wedge','ウェッジ'],['putter','パター'],['shaft','シャフト'],['grip','グリップ'],['bag','キャディバッグ'],['wear','ウェア'],['shoes','シューズ'],['practice','練習用品'],['accessory','小物'],['other','その他'],
] as const;
export const categoryName = (id:string) => categories.find(([key])=>key===id)?.[1] ?? 'その他';
