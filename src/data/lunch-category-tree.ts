import type { LunchCategoryTree } from "@/lib/categories/types";

/**
 * 日本の会社員ランチ想定：カテゴリ → ジャンル → 詳細（タグ風キーワード付き）
 */
export const LUNCH_CATEGORY_TREE: LunchCategoryTree = [
  {
    id: "washoku",
    label: "和食",
    children: [
      {
        id: "washoku-teishoku",
        label: "定食",
        children: [
          {
            id: "washoku-teishoku-yakizakana",
            label: "焼き魚定食",
            searchBoost: "焼魚 御膳",
          },
          {
            id: "washoku-teishoku-tonkatsu",
            label: "とんかつ定食",
            searchBoost: "豚カツ 定食",
          },
          {
            id: "washoku-teishoku-hamburg",
            label: "ハンバーグ定食",
            searchBoost: "ハンバーグ ライス",
          },
          {
            id: "washoku-teishoku-shogayaki",
            label: "生姜焼き定食",
            searchBoost: "豚生姜焼き",
          },
        ],
      },
      {
        id: "washoku-sushi",
        label: "寿司・刺身",
        children: [
          {
            id: "washoku-sushi-nigiri",
            label: "にぎり寿司",
            searchBoost: "握り寿司 ネタ",
          },
          {
            id: "washoku-sushi-kaisendon",
            label: "海鮮丼",
            searchBoost: "海鮮丼 刺身丼",
          },
          {
            id: "washoku-sushi-chirashi",
            label: "ちらし寿司",
            searchBoost: "ばらちらし",
          },
        ],
      },
      {
        id: "washoku-soba-udon",
        label: "蕎麦・うどん",
        children: [
          {
            id: "washoku-soba-kake",
            label: "かけそば・かけうどん",
            searchBoost: "かけ ミニ",
          },
          {
            id: "washoku-soba-tempura",
            label: "天ぷらそば・うどん",
            searchBoost: "天トロ",
          },
          {
            id: "washoku-soba-tsukemen-like",
            label: "ぶっかけ・ざる",
            searchBoost: "ぶっかけうどん ざる",
          },
        ],
      },
      {
        id: "washoku-don",
        label: "丼もの",
        children: [
          {
            id: "washoku-don-oyako",
            label: "親子丼",
            searchBoost: "親子丼 どんぶり",
          },
          {
            id: "washoku-don-gyu",
            label: "牛丼・牛皿",
            searchBoost: "牛丼 ライス",
          },
          {
            id: "washoku-don-katsu",
            label: "カツ丼・親子以外の豚丼",
            searchBoost: "カツ丼 とんてき",
          },
        ],
      },
      {
        id: "washoku-nabe-misc",
        label: "鍋・麺（その他）",
        children: [
          {
            id: "washoku-oden",
            label: "おでん",
            searchBoost: "おでん 関東煮",
          },
          {
            id: "washoku-suki-shabu",
            label: "すき焼き・しゃぶしゃぶ（ランチ）",
            searchBoost: "すき焼きランチ しゃぶ",
          },
        ],
      },
    ],
  },
  {
    id: "yoshoku",
    label: "洋食",
    children: [
      {
        id: "yoshoku-grill",
        label: "グリル・肉料理",
        children: [
          {
            id: "yoshoku-hamburg-steak",
            label: "ハンバーグステーキ",
            searchBoost: "ハンバーグ デミソース",
          },
          {
            id: "yoshoku-tonkatsu-west",
            label: "とんかつ（洋食屋）",
            searchBoost: "ロースカツ ヒレカツ",
          },
          {
            id: "yoshoku-steak",
            label: "ビフステーキ・鉄板",
            searchBoost: "ステーキ 鉄板焼き",
          },
        ],
      },
      {
        id: "yoshoku-pasta",
        label: "パスタ・スパゲティ",
        children: [
          {
            id: "yoshoku-napo-meat",
            label: "ナポリタン・ミートソース",
            searchBoost: "ナポリタン ミートソース",
          },
          {
            id: "yoshoku-cream",
            label: "クリーム・カルボナーラ",
            searchBoost: "カルボナーラ クリームパスタ",
          },
          {
            id: "yoshoku-peperoncino",
            label: "オイル・ペペロンチーノ",
            searchBoost: "ペペロンチーノ アーリオオーリオ",
          },
        ],
      },
      {
        id: "yoshoku-rice-gratin",
        label: "ライス・グラタン",
        children: [
          {
            id: "yoshoku-omu",
            label: "オムライス",
            searchBoost: "オムライス ケチャップ",
          },
          {
            id: "yoshoku-doria",
            label: "ドリア・グラタン",
            searchBoost: "ドリア グラタン",
          },
        ],
      },
      {
        id: "yoshoku-sand",
        label: "サンド・軽め洋食",
        children: [
          {
            id: "yoshoku-katsu-sando",
            label: "カツサンド・ホットサンド",
            searchBoost: "カツサンド サンドイッチ",
          },
          {
            id: "yoshoku-pizza-toast",
            label: "ピザトースト・モーニング",
            searchBoost: "ピザトースト モーニングサービス",
          },
        ],
      },
    ],
  },
  {
    id: "chuka",
    label: "中華",
    children: [
      {
        id: "chuka-men",
        label: "麺類",
        children: [
          {
            id: "chuka-ramen",
            label: "ラーメン（醤油・味噌・豚骨など）",
            searchBoost: "ラーメン 麺屋",
          },
          {
            id: "chuka-tantan",
            label: "汁なし坦々麺・まぜそば",
            searchBoost: "汁なし坦々 まぜそば",
          },
          {
            id: "chuka-hiyashi",
            label: "冷やし中華・焼きそば",
            searchBoost: "冷やし中華 やきそば",
          },
        ],
      },
      {
        id: "chuka-meshi",
        label: "飯・炒め物",
        children: [
          {
            id: "chuka-chahan",
            label: "チャーハン・炒飯",
            searchBoost: "チャーハン 五目",
          },
          {
            id: "chuka-mabo",
            label: "麻婆豆腐飯・マーボー丼",
            searchBoost: "麻婆豆腐 ご飯セット",
          },
        ],
      },
      {
        id: "chuka-dimsum",
        label: "点心・飲茶",
        children: [
          {
            id: "chuka-gyoza",
            label: "餃子・ワンタン",
            searchBoost: "餃子の王将風 ワンタン",
          },
          {
            id: "chuka-xiaolongbao",
            label: "小籠包・飲茶セット",
            searchBoost: "小籠包 飲茶",
          },
        ],
      },
      {
        id: "chuka-plate",
        label: "皿もの・セット",
        children: [
          {
            id: "chuka-ebi-chili",
            label: "エビチリ・酢豚セット",
            searchBoost: "エビチリ 酢豚 ランチセット",
          },
          {
            id: "chuka-mapo-nasu",
            label: "マーボー茄子・青椒肉絲",
            searchBoost: "青椒肉絲 四川",
          },
        ],
      },
    ],
  },
  {
    id: "asia-ethnic",
    label: "アジア・エスニック",
    children: [
      {
        id: "asia-thai",
        label: "タイ料理",
        children: [
          {
            id: "asia-gapao",
            label: "ガパオライス・カオマンガイ",
            searchBoost: "ガパオ タイ料理",
          },
          {
            id: "asia-tomyum",
            label: "トムヤムクン・タイフォー",
            searchBoost: "トムヤム フォー",
          },
        ],
      },
      {
        id: "asia-viet",
        label: "ベトナム料理",
        children: [
          {
            id: "asia-pho",
            label: "フォー・バインミー",
            searchBoost: "フォー バインミー",
          },
          {
            id: "asia-bun",
            label: "ブンチャー・生春巻き",
            searchBoost: "ブンチャー 生春巻き",
          },
        ],
      },
      {
        id: "asia-indian",
        label: "インド・ネパール",
        children: [
          {
            id: "asia-curry-nan",
            label: "カレーライス・ナンセット",
            searchBoost: "インドカレー ナン食べ放題",
          },
          {
            id: "asia-tandoor",
            label: "タンドリー・ビリヤニ",
            searchBoost: "タンドリーチキン ビリヤニ",
          },
        ],
      },
      {
        id: "asia-korean",
        label: "韓国料理",
        children: [
          {
            id: "asia-bibimbap",
            label: "ビビンバ・冷麺",
            searchBoost: "ビビンパ 冷麺ランチ",
          },
          {
            id: "asia-sundubu",
            label: "スンドゥブ・チゲ系",
            searchBoost: "スンドゥブ 豆腐チゲ",
          },
        ],
      },
    ],
  },
  {
    id: "keishoku",
    label: "軽食",
    children: [
      {
        id: "keishoku-salad",
        label: "サラダ・デリカ",
        children: [
          {
            id: "keishoku-salad-bowl",
            label: "サラダボウル・プレートランチ",
            searchBoost: "サラダランチ 野菜中心",
          },
          {
            id: "keishoku-delica",
            label: "デリカフェ・惣菜セット",
            searchBoost: "デリカ 惣菜弁当",
          },
        ],
      },
      {
        id: "keishoku-bakery",
        label: "ベーカリー・パン",
        children: [
          {
            id: "keishoku-pan-lunch",
            label: "パンランチ・モーニング",
            searchBoost: "ベーカリーカフェ パンランチ",
          },
          {
            id: "keishoku-sando-cafe",
            label: "サンド・クロワッサン系",
            searchBoost: "サンドイッチ カフェランチ",
          },
        ],
      },
      {
        id: "keishoku-fast",
        label: "ファストフード",
        children: [
          {
            id: "keishoku-burger",
            label: "ハンバーガー・フライドチキン",
            searchBoost: "ハンバーガーショップ フライドチキン",
          },
          {
            id: "keishoku-karaage",
            label: "からあげ専門・テイクアウト",
            searchBoost: "からあげ専門店 唐揚げ弁当",
          },
        ],
      },
    ],
  },
];
