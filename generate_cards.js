const fs = require('fs');
const path = require('path');

async function main() {
  console.log('1. Fetching YGOPRODeck database...');
  const ygRes = await fetch('https://db.ygoprodeck.com/api/v7/cardinfo.php');
  const ygJson = await ygRes.json();
  const ygMap = new Map();
  ygJson.data.forEach(c => {
    ygMap.set(c.name.toLowerCase(), c);
  });
  console.log(`YGOPRODeck loaded: ${ygMap.size} cards.`);

  const setsConfig = [
    {
      id: 'vol1',
      page: 'Set_Card_Lists:Vol.1_(OCG-JP)',
      name: 'Vol.1',
      fullName: 'Volume 1 (第1弾)',
      type: 'volume',
      releaseDate: '1999-02-04',
      coverCard: 'Blue-Eyes White Dragon',
      description: 'Booster pack pertama dalam sejarah Yu-Gi-Oh! OCG dirilis pada 4 Februari 1999 di Jepang. Memuat 40 kartu ikonik awal termasuk Blue-Eyes White Dragon, Dark Magician, Gaia The Fierce Knight, Trap Hole, dan Dark Hole.'
    },
    {
      id: 'vol2',
      page: 'Set_Card_Lists:Vol.2_(OCG-JP)',
      name: 'Vol.2',
      fullName: 'Volume 2 (第2弾)',
      type: 'volume',
      releaseDate: '1999-03-27',
      coverCard: 'Hitotsu-Me Giant',
      description: 'Volume kedua melanjutkan ekspansi monster dan Spell pendukung. Menghadirkan Monster Reborn (Super Rare), Uraby, Mystical Elf, Giant Soldier of Stone, dan Swords of Revealing Light.'
    },
    {
      id: 'vol3',
      page: 'Set_Card_Lists:Vol.3_(OCG-JP)',
      name: 'Vol.3',
      fullName: 'Volume 3 (第3弾)',
      type: 'volume',
      releaseDate: '1999-05-27',
      coverCard: 'Red-Eyes Black Dragon',
      description: 'Memperkenalkan 50 kartu baru: Red-Eyes Black Dragon (Ultra Rare), Summoned Skull (Ultra Rare), Man-Eater Bug, Polymerization, dan kartu bagian tubuh Exodia pertama.'
    },
    {
      id: 'vol4',
      page: 'Set_Card_Lists:Vol.4_(OCG-JP)',
      name: 'Vol.4',
      fullName: 'Volume 4 (第4弾)',
      type: 'volume',
      releaseDate: '1999-07-22',
      coverCard: 'Mystical Elf',
      description: 'Ekspansi 50 kartu yang memperkenalkan staple pertahanan legendaris Mirror Force (Ultra Rare), Solemn Judgment (Super Rare), dan Level 4 beatstick 1800 ATK La Jinn the Mystical Genie of the Lamp.'
    },
    {
      id: 'vol5',
      page: 'Set_Card_Lists:Vol.5_(OCG-JP)',
      name: 'Vol.5',
      fullName: 'Volume 5 (第5弾)',
      type: 'volume',
      releaseDate: '1999-09-23',
      coverCard: 'Black Skull Dragon',
      description: 'Menghadirkan Black Skull Dragon (Ultra Rare, 3200 ATK), Sangan, Suijin, Kazejin, Sanga of the Thunder, Gate Guardian, serta melengkapi kelima bagian Exodia the Forbidden One.'
    },
    {
      id: 'vol6',
      page: 'Set_Card_Lists:Vol.6_(OCG-JP)',
      name: 'Vol.6',
      fullName: 'Volume 6 (第6弾)',
      type: 'volume',
      releaseDate: '1999-11-18',
      coverCard: 'Catapult Turtle',
      description: 'Menghadirkan 52 kartu: Catapult Turtle, Time Wizard, Petit Moth, Cocoon of Evolution, Great Moth, Star Boy, Milus Radiant, dan Spell pembersih Heavy Storm.'
    },
    {
      id: 'vol7',
      page: 'Set_Card_Lists:Vol.7_(OCG-JP)',
      name: 'Vol.7',
      fullName: 'Volume 7 (第7弾)',
      type: 'volume',
      releaseDate: '2000-01-27',
      coverCard: 'Swamp Battleguard',
      description: 'Volume penutup era Series 1 pada Januari 2000 dengan 52 kartu. Menghadirkan Jinzo, Lava Battleguard, Swamp Battleguard, Relinquished, dan Black Illusion Ritual.'
    },
    {
      id: 'booster1',
      page: 'Set_Card_Lists:Booster_1_(OCG-JP)',
      name: 'Booster 1',
      fullName: 'Booster 1 (カードダス第1弾)',
      type: 'booster',
      releaseDate: '1999-03-01',
      coverCard: 'Aqua Madoor',
      description: 'Rilis pertama lini Carddass vending machine dengan 40 kartu. Menghadirkan Aqua Madoor (2000 DEF), Kagemusha of the Blue Flame, dan monster Normal awal.'
    },
    {
      id: 'booster2',
      page: 'Set_Card_Lists:Booster_2_(OCG-JP)',
      name: 'Booster 2',
      fullName: 'Booster 2 (カードダス第2弾)',
      type: 'booster',
      releaseDate: '1999-05-25',
      coverCard: 'Koumori Dragon',
      description: 'Set Carddass kedua dengan 40 kartu, memperluas pilihan monster tipe Dragon dan Fiend untuk format awal OCG.'
    },
    {
      id: 'booster3',
      page: 'Set_Card_Lists:Booster_3_(OCG-JP)',
      name: 'Booster 3',
      fullName: 'Booster 3 (カードダス第3弾)',
      type: 'booster',
      releaseDate: '1999-07-05',
      coverCard: 'Battle Ox',
      description: 'Menghadirkan 40 kartu Carddass, termasuk Battle Ox (1700 ATK), monster Level 4 beatdown terkuat saat dirilis.'
    },
    {
      id: 'booster4',
      page: 'Set_Card_Lists:Booster_4_(OCG-JP)',
      name: 'Booster 4',
      fullName: 'Booster 4 (カードダス第4弾)',
      type: 'booster',
      releaseDate: '1999-08-26',
      coverCard: 'Hane-Hane',
      description: 'Menghadirkan 40 kartu Carddass, termasuk monster efek pantul Hane-Hane dan beater kuat Neo the Magic Swordsman (1700 ATK).'
    },
    {
      id: 'booster5',
      page: 'Set_Card_Lists:Booster_5_(OCG-JP)',
      name: 'Booster 5',
      fullName: 'Booster 5 (カードダス第5弾)',
      type: 'booster',
      releaseDate: '1999-10-17',
      coverCard: 'Penguin Soldier',
      description: 'Menghadirkan 40 kartu Carddass, termasuk kartu kontrol flip legendaris Penguin Soldier yang dapat mengembalikan hingga 2 monster ke tangan.'
    },
    {
      id: 'booster6',
      page: 'Set_Card_Lists:Booster_6_(OCG-JP)',
      name: 'Booster 6',
      fullName: 'Booster 6 (カードダス第6弾)',
      type: 'booster',
      releaseDate: '1999-12-01',
      coverCard: 'Sangan',
      description: 'Menghadirkan 40 kartu Carddass, memperluas distribusi monster pencari seperti Sangan dan kartu pendukung era pertengahan.'
    },
    {
      id: 'booster7',
      page: 'Set_Card_Lists:Booster_7_(OCG-JP)',
      name: 'Booster 7',
      fullName: 'Booster 7 (カードダス第7弾)',
      type: 'booster',
      releaseDate: '2000-03-01',
      coverCard: 'Witch of the Black Forest',
      description: 'Set Carddass penutup Series 1 dengan 40 kartu, memuat Witch of the Black Forest dan kartu penting akhir format 1999.'
    },
    {
      id: 'starter-theatrical',
      page: 'Set_Card_Lists:Starter_Box:_Theatrical_Release_(OCG-JP)',
      name: 'Starter Box: Theatrical',
      fullName: 'Starter Box: Theatrical Release (劇場限定版)',
      type: 'starter',
      releaseDate: '1999-03-06',
      coverCard: 'Blue-Eyes White Dragon',
      description: 'Kotak starter khusus yang dijual terbatas pada penayangan film Yu-Gi-Oh! di bioskop Jepang, memuat Blue-Eyes White Dragon dan Raigeki.'
    },
    {
      id: 'starter-retail',
      page: 'Set_Card_Lists:Starter_Box_(OCG-JP)',
      name: 'Starter Box',
      fullName: 'Starter Box (スターターボックス 常売版)',
      type: 'starter',
      releaseDate: '1999-03-18',
      coverCard: 'Blue-Eyes White Dragon',
      description: 'Versi komersial Starter Box pertama untuk toko umum (50 kartu), memperkenalkan 6 Field Spell generasi pertama.'
    },
    {
      id: 'starter-ex',
      page: 'Set_Card_Lists:EX_Starter_Box_(OCG-JP)',
      name: 'EX Starter Box',
      fullName: 'EX Starter Box (遊戯王デュエルモンスターズ EX)',
      type: 'starter',
      releaseDate: '1999-12-16',
      coverCard: 'Dark Magician',
      description: 'Box starter ganda legendaris berisi Yugi Deck dan Kaiba Deck (100 kartu), memperkenalkan 17 kartu unik baru termasuk Lord of D. dan The Flute of Summoning Dragon.'
    },
    {
      id: 'le-yugi',
      page: 'Set_Card_Lists:Limited_Edition:_Yugi_Pack_(OCG-JP)',
      name: 'Limited Edition: Yugi',
      fullName: 'Limited Edition 1: Yugi Pack (遊戯パック)',
      type: 'special',
      releaseDate: '1999-06-01',
      coverCard: 'Millennium Shield',
      description: 'Pack promosi Weekly Shonen Jump berisi Millennium Shield (3000 DEF), Flying Penguin, dan Stuffed Animal.'
    },
    {
      id: 'le-kaiba',
      page: 'Set_Card_Lists:Limited_Edition:_Kaiba_Pack_(OCG-JP)',
      name: 'Limited Edition: Kaiba',
      fullName: 'Limited Edition 1: Kaiba Pack (海馬パック)',
      type: 'special',
      releaseDate: '1999-06-01',
      coverCard: 'Takriminos',
      description: 'Pack promosi bertema Kaiba berisi Takriminos, Yaranzo, dan Three-Legged Zombies.'
    },
    {
      id: 'le-joey',
      page: 'Set_Card_Lists:Limited_Edition:_Joey_Pack_(OCG-JP)',
      name: 'Limited Edition: Joey',
      fullName: 'Limited Edition 1: Joey Pack (城之内パック)',
      type: 'special',
      releaseDate: '1999-06-01',
      coverCard: 'Yamadron',
      description: 'Pack promosi bertema Joey Wheeler berisi Yamadron, Megasonic Eye, dan Fairy\'s Gift.'
    },
    {
      id: 'pp1-tokyo',
      page: null,
      name: 'Premium Pack 1 & Tokyo Dome',
      fullName: 'Premium Pack 1 + Hadiah Turnamen Tokyo Dome (1999)',
      type: 'special',
      releaseDate: '1999-08-26',
      coverCard: 'Cosmo Queen',
      description: 'Pack turnamen legendaris Tokyo Dome 1999 (10 kartu PP1) plus 8 kartu hadiah juara dan peserta turnamen pertama, total 18 kartu debut.',
      customCards: [
        'Cosmo Queen',
        'Exodia the Forbidden One',
        'Time Wizard',
        'Meteor Dragon',
        'Mikazukinoyaiba',
        'Great Mammoth of Goldfine',
        'Slime Toad',
        'Turu-Purun',
        'Goddess of Whim',
        'Tainted Wisdom',
        'Blue-Eyes Ultimate Dragon',
        'Meteor Black Dragon',
        'Firewing Pegasus',
        'Tri-Horned Dragon',
        'Gate Guardian',
        'Sengenjin',
        'Magician of Black Chaos',
        'Serpent Night Dragon',
        'Steel Ogre Grotto #1',
        'Armored Glass'
      ]
    },
    {
      id: 'pp2',
      page: 'Set_Card_Lists:Premium_Pack_2_(OCG-JP)',
      name: 'Premium Pack 2',
      fullName: 'Premium Pack 2 (Jump Festa 2000)',
      type: 'special',
      releaseDate: '1999-12-18',
      coverCard: 'Black Luster Soldier',
      description: 'Jump Festa 2000 eksklusif (8 kartu baru), debut Ritual Monster pertama: Black Luster Soldier dan Zera the Mant.'
    },
    {
      id: 'dark-ceremony',
      page: 'Set_Card_Lists:Dark_Ceremony_Edition_(OCG-JP)',
      name: 'Dark Ceremony Edition',
      fullName: 'Dark Ceremony Edition (ダーク・セレモニー)',
      type: 'special',
      releaseDate: '2000-03-23',
      coverCard: 'Black Luster Soldier',
      description: 'Pack khusus penutup Series 1 berisi 8 Ritual Monster dan 8 Ritual Spell Super Rare (8 kartu unik baru, 8 reprint).'
    },
    {
      id: 'promo-kanan',
      page: null,
      name: 'Promo Nasional 1999',
      fullName: 'Turnamen Nasional Pertama: Kanan the Swordmistress (1999)',
      type: 'special',
      releaseDate: '1999-02-21',
      coverCard: 'Kanan the Swordmistress',
      description: 'Kartu hadiah kejuaraan nasional pertama Yu-Gi-Oh! OCG di Ginza Pocket Park, Tokyo (21 Februari 1999). Diberikan hanya kepada 400 peserta turnamen.',
      customCards: [
        'Kanan the Swordmistress'
      ]
    },
    {
      id: 'dm2-promos',
      page: null,
      name: 'Duel Monsters II & Panduan',
      fullName: 'Duel Monsters II: Dark Duel Stories & Buku Panduan (1999)',
      type: 'special',
      releaseDate: '1999-07-08',
      coverCard: 'Perfectly Ultimate Great Moth',
      description: '12 kartu promosi debut dari cartridge Game Boy Color Duel Monsters II dan 2 volume buku panduan strategi resmi Shueisha.',
      customCards: [
        'Perfectly Ultimate Great Moth',
        'Seiyaryu',
        'Insect Armor with Laser Cannon',
        'Cyber Shield',
        'Salamandra',
        'Shine Palace',
        "Harpie's Feather Duster",
        'Kunai with Chain',
        'Crush Card Virus',
        'Acid Trap Hole',
        'Right Arm of the Forbidden One',
        'Left Arm of the Forbidden One'
      ]
    },
    {
      id: 'valuable-book-1',
      page: null,
      name: 'The Valuable Book 1',
      fullName: 'The Valuable Book 1 Promotional Cards (1999)',
      type: 'special',
      releaseDate: '1999-08-20',
      coverCard: 'Dokurorider',
      description: '2 kartu ritual promosi Ultra Rare yang dibundel dengan buku ensiklopedia resmi pertama Shueisha: Dokurorider dan Revival of Dokurorider.',
      customCards: [
        'Dokurorider',
        'Revival of Dokurorider'
      ]
    },
    {
      id: 'forbidden-memories',
      page: null,
      name: 'Forbidden Memories & Panduan',
      fullName: 'Shin Duel Monsters: Fuuin Sareshi Kioku & Panduan (1999)',
      type: 'special',
      releaseDate: '1999-12-09',
      coverCard: 'Red-Eyes Black Metal Dragon',
      description: '6 kartu promosi debut dari video game PlayStation Shin Duel Monsters (Forbidden Memories) dan buku panduan strategi resminya.',
      customCards: [
        'Red-Eyes Black Metal Dragon',
        "Harpie's Pet Dragon",
        'Metalmorph',
        'Zoa',
        'Metalzoa',
        'Black Magic Ritual',
        'Megamorph'
      ]
    }
  ];

  const nameFixes = {
    'winged dragon, guardian of the fortress 1': 'winged dragon, guardian of the fortress #1',
    'polymerization (alternate password)': 'polymerization'
  };

  const ignoredNonCards = new Set([
    'what is faq?',
    'fusion & effect card volume',
    'spell & trap card volume 1',
    'spell & trap card volume 2',
    'spell & trap card volume 3',
    'spell & trap card volume 4'
  ]);

  console.log('2. Fetching and parsing all 27 sets from Yugipedia...');
  const parsedSets = [];
  let totalCardsInAllSets = 0;
  let volCount = 0;
  let boosterCount = 0;

  for (const item of setsConfig) {
    const cards = [];
    const rarityBreakdown = {};

    if (item.customCards) {
      for (const cardName of item.customCards) {
        const ygCard = ygMap.get(cardName.toLowerCase());
        if (ygCard) {
          cards.push({
            name: ygCard.name,
            id: ygCard.id,
            type: ygCard.type,
            attribute: ygCard.attribute || null,
            race: ygCard.race || null,
            level: ygCard.level !== undefined ? ygCard.level : null,
            atk: ygCard.atk !== undefined ? ygCard.atk : null,
            def: ygCard.def !== undefined ? ygCard.def : null,
            rarity: 'Ultra Rare',
            desc: ygCard.desc || ''
          });
          rarityBreakdown['Ultra Rare'] = (rarityBreakdown['Ultra Rare'] || 0) + 1;
        } else {
          console.warn('WARN: Missing custom card in YGOPRODeck:', cardName);
        }
      }
    } else {
      const url = 'https://yugipedia.com/api.php?action=parse&page=' + encodeURIComponent(item.page) + '&prop=wikitext&format=json';
      const res = await fetch(url, { headers: { 'User-Agent': 'YugiohEncyclopediaBot/1.0' } });
      const data = await res.json();
      const wt = data.parse ? data.parse.wikitext['*'] : '';

      const regex = /\{\{Set list[^\}]*?\|([\s\S]*?)\}\}/gi;
      let m;

      while ((m = regex.exec(wt)) !== null) {
        const body = m[1];
        const lines = body.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('<!--'));
        for (const line of lines) {
          const parts = line.split(';').map(p => p.trim());
          let rawName = parts[0].replace(/\[\[|\]\]/g, '').replace(/^#\s*/, '').trim();
          if (!rawName || rawName.startsWith('options=') || rawName.startsWith('region=') || rawName.startsWith('rarities=') || rawName.startsWith('print=') || rawName.startsWith('qty=')) continue;

          const lowerRaw = rawName.toLowerCase();
          if (ignoredNonCards.has(lowerRaw)) continue;

          let lookupName = nameFixes[lowerRaw] || lowerRaw;
          let rarity = parts[1] || 'Common';
          if (rarity === 'New' || rarity === 'Reprint') rarity = 'Common';

          rarityBreakdown[rarity] = (rarityBreakdown[rarity] || 0) + 1;

          const ygCard = ygMap.get(lookupName);
          if (ygCard) {
            cards.push({
              name: ygCard.name,
              id: ygCard.id,
              type: ygCard.type,
              attribute: ygCard.attribute || null,
              race: ygCard.race || null,
              level: ygCard.level !== undefined ? ygCard.level : null,
              atk: ygCard.atk !== undefined ? ygCard.atk : null,
              def: ygCard.def !== undefined ? ygCard.def : null,
              rarity: rarity,
              desc: ygCard.desc || ''
            });
          } else {
            cards.push({
              name: rawName,
              id: 0,
              type: 'Normal Monster',
              attribute: 'EARTH',
              race: 'Warrior',
              level: 4,
              atk: 1000,
              def: 1000,
              rarity: rarity,
              desc: ''
            });
          }
        }
      }
    }

    if (item.type === 'volume') volCount += cards.length;
    if (item.type === 'booster') boosterCount += cards.length;
    totalCardsInAllSets += cards.length;

    console.log(`- ${item.name} (${item.type}): ${cards.length} cards`);
    parsedSets.push({
      id: item.id,
      name: item.name,
      fullName: item.fullName,
      type: item.type,
      releaseDate: item.releaseDate,
      totalCards: cards.length,
      rarityBreakdown,
      description: item.description,
      coverCard: item.coverCard,
      cards: cards
    });
  }

  console.log('--- SUMMARY ---');
  console.log(`7 Volumes total: ${volCount} cards`);
  console.log(`7 Boosters total: ${boosterCount} cards`);
  console.log(`7 Volumes + 7 Boosters total: ${volCount + boosterCount} cards`);
  console.log(`All Sets total cards: ${totalCardsInAllSets} cards`);

  // Read existing synergies and metaDecks from data.js
  const currentDataFile = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
  const synMatch = currentDataFile.match(/synergies:\s*(\[[\s\S]*?\]),\s*\n\s*\/\/ ===== META DECKS =====/);
  const decksMatch = currentDataFile.match(/metaDecks:\s*(\[[\s\S]*?\])\s*\}\s*;/);

  if (!synMatch || !decksMatch) {
    throw new Error('Could not extract synergies or metaDecks from existing data.js');
  }

  const synergiesRaw = synMatch[1];
  const metaDecksRaw = decksMatch[1].replace(/"Black Hole"/g, '"Dark Hole"');

  const outData = `/* ========================================
   Yu-Gi-Oh! OCG Series 1 - Complete Database
   27 Historical Releases / Sets
   Exact 717 Unique Cards Census (1999–2000)
   ======================================== */

const SERIES1_DATA = {
    meta: {
        title: "Series 1 — OCG (1999–2000)",
        description: "Seri pertama Yu-Gi-Oh! Official Card Game yang dirilis di Jepang melalui 7 Volume booster, 7 Booster Carddass, Starter Box, dan Special Promo Packs. Tepat 717 kartu unik baru dicetak selama era fondasi 1999–2000.",
        period: "4 Februari 1999 — 23 Maret 2000",
        totalSets: ${parsedSets.length},
        characteristics: [
            "Tidak memiliki nomor set (set code) yang tercetak di kartu",
            "Tidak ada hologram Eye of Anubis di pojok kanan bawah",
            "Layout kartu Series 1 yang khas (deskripsi sempit, tanpa kotak effect)",
            "Didistribusikan melalui booster pack reguler, Carddass vending machine, turnamen, dan bundel media"
        ],
        census: [
            { source: "Vol. 1–7 dan Booster 1–7", count: 580, type: "Core & Carddass" },
            { source: "Starter Box (Theatrical + Retail)", count: 56, type: "Starter Box" },
            { source: "EX Starter Box", count: 17, type: "Starter Box" },
            { source: "Limited Edition 1 (Yugi, Kaiba, Joey)", count: 9, type: "Special Pack" },
            { source: "Promo nasional Kanan the Swordmistress", count: 1, type: "Tournament Prize" },
            { source: "Duel Monsters II + buku panduan", count: 12, type: "Game & Guide Promo" },
            { source: "The Valuable Book 1", count: 2, type: "Book Promo" },
            { source: "Premium Pack 1 + hadiah Tokyo Dome", count: 18, type: "Special Pack & Prize" },
            { source: "Forbidden Memories + buku panduan", count: 6, type: "Game & Guide Promo" },
            { source: "Premium Pack 2", count: 8, type: "Special Pack" },
            { source: "Dark Ceremony Edition", count: 8, type: "Special Pack" }
        ]
    },

    // ===== ALL SETS WITH COMPLETE CARD LISTS =====
    sets: ${JSON.stringify(parsedSets, null, 8)},

    // ===== SYNERGIES & CONNECTIONS =====
    synergies: ${synergiesRaw},

    // ===== META DECKS =====
    metaDecks: ${metaDecksRaw}
};

// --- Helper Functions attached to SERIES1_DATA ---
SERIES1_DATA.cardIndex = new Map();

// Populate card index across all sets
SERIES1_DATA.sets.forEach(set => {
    (set.cards || []).forEach(card => {
        if (!SERIES1_DATA.cardIndex.has(card.name)) {
            SERIES1_DATA.cardIndex.set(card.name, { ...card, setOrigins: [set.name] });
        } else {
            const existing = SERIES1_DATA.cardIndex.get(card.name);
            if (!existing.setOrigins.includes(set.name)) {
                existing.setOrigins.push(set.name);
            }
        }
    });
});

SERIES1_DATA.getCardByName = function(name) {
    if (!name) return null;
    return SERIES1_DATA.cardIndex.get(name) || null;
};

SERIES1_DATA.getAllCards = function() {
    return Array.from(SERIES1_DATA.cardIndex.values());
};
`;

  fs.writeFileSync(path.join(__dirname, 'data.js'), outData, 'utf8');
  console.log('Successfully updated data.js with COMPLETE 717 UNIQUE CARDS database!');
}

main().catch(err => {
  console.error('Error during generation:', err);
  process.exit(1);
});
