// PANTHEON - Question Bank
// Covers: Greek, Norse, Egyptian, Hindu, Japanese, Celtic, Aztec, Mesopotamian, Chinese

export const MYTHOLOGIES = {
  GREEK: { id: 'greek', name: 'Greek', color: '#4A90D9', emoji: '🏛️', unlockLevel: 0 },
  NORSE: { id: 'norse', name: 'Norse', color: '#2D6A4F', emoji: '⚡', unlockLevel: 0 },
  EGYPTIAN: { id: 'egyptian', name: 'Egyptian', color: '#E9C46A', emoji: '𓂀', unlockLevel: 5 },
  HINDU: { id: 'hindu', name: 'Hindu', color: '#E76F51', emoji: '🪷', unlockLevel: 10 },
  JAPANESE: { id: 'japanese', name: 'Japanese', color: '#E63946', emoji: '⛩️', unlockLevel: 15 },
  CELTIC: { id: 'celtic', name: 'Celtic', color: '#57CC99', emoji: '🍀', unlockLevel: 20 },
  AZTEC: { id: 'aztec', name: 'Aztec', color: '#F4A261', emoji: '🌞', unlockLevel: 25 },
  MESOPOTAMIAN: { id: 'mesopotamian', name: 'Mesopotamian', color: '#9B5DE5', emoji: '🏺', unlockLevel: 30 },
  CHINESE: { id: 'chinese', name: 'Chinese', color: '#F15BB5', emoji: '🐉', unlockLevel: 35 },
  SLAVIC: { id: 'slavic', name: 'Slavic', color: '#00BBF9', emoji: '🌲', unlockLevel: 40 },
};

export const QUESTION_TYPES = {
  MULTIPLE_CHOICE: 'multiple_choice',
  TRUE_FALSE: 'true_false',
  MATCH: 'match',
  ORDER: 'order',
  IDENTIFY: 'identify',
  CROSS_MYTH: 'cross_myth',
};

export const DIFFICULTY = {
  INITIATE: { id: 'initiate', name: 'Initiate', icon: '🌙', xpMultiplier: 1, color: '#74C0FC' },
  ADEPT: { id: 'adept', name: 'Adept', icon: '⚡', xpMultiplier: 2, color: '#69DB7C' },
  SCHOLAR: { id: 'scholar', name: 'Scholar', icon: '🔥', xpMultiplier: 3, color: '#FFA94D' },
  ORACLE: { id: 'oracle', name: 'Oracle', icon: '💀', xpMultiplier: 5, color: '#E599F7' },
};

export const questions = [
  // ─────────────────────────────────────────────
  // GREEK - INITIATE
  // ─────────────────────────────────────────────
  {
    id: 'g1',
    mythology: 'greek',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'Who is the king of the Greek Olympian gods?',
    options: ['Poseidon', 'Hades', 'Zeus', 'Ares'],
    answer: 'Zeus',
    explanation: 'Zeus is the king of the Olympians, ruler of Mount Olympus and god of sky, thunder, and justice.',
    xp: 10,
  },
  {
    id: 'g2',
    mythology: 'greek',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What creature has the body of a man and the head of a bull in Greek mythology?',
    options: ['Centaur', 'Minotaur', 'Cyclops', 'Satyr'],
    answer: 'Minotaur',
    explanation: 'The Minotaur, born of Pasiphae and a bull, was imprisoned in the Labyrinth of Crete.',
    xp: 10,
  },
  {
    id: 'g3',
    mythology: 'greek',
    difficulty: 'initiate',
    type: QUESTION_TYPES.TRUE_FALSE,
    question: 'Achilles was made fully invulnerable by being dipped in the River Styx.',
    answer: false,
    explanation: 'Achilles was held by his heel when dipped, leaving that spot vulnerable — his famous weak point.',
    xp: 10,
  },
  {
    id: 'g4',
    mythology: 'greek',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'Which goddess sprang fully-formed and armored from Zeus\'s head?',
    options: ['Artemis', 'Aphrodite', 'Athena', 'Hera'],
    answer: 'Athena',
    explanation: 'Athena, goddess of wisdom and war strategy, was born from Zeus\'s forehead after he swallowed her pregnant mother Metis.',
    xp: 10,
  },
  {
    id: 'g5',
    mythology: 'greek',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What is the name of the three-headed dog that guards the entrance to the Underworld?',
    options: ['Orthrus', 'Cerberus', 'Fenrir', 'Scylla'],
    answer: 'Cerberus',
    explanation: 'Cerberus, offspring of Typhon and Echidna, guards the gates of Hades to prevent the dead from leaving.',
    xp: 10,
  },
  // GREEK - ADEPT
  {
    id: 'g6',
    mythology: 'greek',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What task did Sisyphus perform for eternity as punishment?',
    options: [
      'Carrying the world on his shoulders',
      'Rolling a boulder up a hill only for it to roll back down',
      'Being chained to a rock while an eagle ate his liver',
      'Standing in water beneath fruit he could never reach',
    ],
    answer: 'Rolling a boulder up a hill only for it to roll back down',
    explanation: 'Sisyphus was punished for his trickery and hubris. Carrying the sky was Atlas\'s burden; the eagle was Prometheus.',
    xp: 20,
  },
  {
    id: 'g7',
    mythology: 'greek',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'The Labors of Heracles were assigned by which king?',
    options: ['King Minos', 'King Eurystheus', 'King Agamemnon', 'King Pelias'],
    answer: 'King Eurystheus',
    explanation: 'Hera drove Heracles mad so he killed his family; the Oracle told him to serve King Eurystheus for 10 (later 12) years.',
    xp: 20,
  },
  {
    id: 'g8',
    mythology: 'greek',
    difficulty: 'adept',
    type: QUESTION_TYPES.TRUE_FALSE,
    question: 'Prometheus was punished for giving fire to humanity by being chained to a rock where an eagle ate his liver each day.',
    answer: true,
    explanation: 'Zeus punished Prometheus because the gods wanted to keep fire for themselves. Heracles eventually freed him.',
    xp: 20,
  },
  // GREEK - SCHOLAR
  {
    id: 'g9',
    mythology: 'greek',
    difficulty: 'scholar',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'In the Theogony, which primordial entities were born first according to Hesiod?',
    options: ['Chaos, Gaia, Tartarus, Eros', 'Gaia, Uranus, Oceanus, Tethys', 'Night, Day, Earth, Sky', 'Zeus, Hera, Poseidon, Demeter'],
    answer: 'Chaos, Gaia, Tartarus, Eros',
    explanation: 'Hesiod\'s Theogony describes Chaos as the first entity, followed by Gaia, Tartarus, and Eros — all primordial forces before the Titans.',
    xp: 30,
  },
  {
    id: 'g10',
    mythology: 'greek',
    difficulty: 'scholar',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What is the name of the river in the Underworld whose waters grant forgetfulness?',
    options: ['Styx', 'Acheron', 'Lethe', 'Phlegethon'],
    answer: 'Lethe',
    explanation: 'The five rivers of the Underworld: Styx (oath), Acheron (woe), Lethe (forgetfulness), Phlegethon (fire), Cocytus (lamentation).',
    xp: 30,
  },
  // GREEK - ORACLE
  {
    id: 'g11',
    mythology: 'greek',
    difficulty: 'oracle',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'In the Orphic cosmogony, which primordial being emerged from the World Egg?',
    options: ['Phanes/Eros', 'Chronos', 'Nyx', 'Aether'],
    answer: 'Phanes/Eros',
    explanation: 'Orphic tradition differs from Hesiod. Phanes (also called Protogonos or Eros) emerged from the Cosmic Egg created by Chronos and Nyx.',
    xp: 50,
  },

  // ─────────────────────────────────────────────
  // NORSE - INITIATE
  // ─────────────────────────────────────────────
  {
    id: 'n1',
    mythology: 'norse',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What is the name of the great ash tree that connects the nine worlds in Norse mythology?',
    options: ['Mjolnir', 'Asgard', 'Yggdrasil', 'Bifrost'],
    answer: 'Yggdrasil',
    explanation: 'Yggdrasil is the immense sacred ash tree at the center of the Norse cosmos, connecting nine worlds.',
    xp: 10,
  },
  {
    id: 'n2',
    mythology: 'norse',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What is the name of Thor\'s hammer?',
    options: ['Gungnir', 'Mjolnir', 'Gram', 'Tyrfing'],
    answer: 'Mjolnir',
    explanation: 'Mjolnir was forged by the dwarven brothers Brokkr and Sindri and is one of the most fearsome weapons in Norse mythology.',
    xp: 10,
  },
  {
    id: 'n3',
    mythology: 'norse',
    difficulty: 'initiate',
    type: QUESTION_TYPES.TRUE_FALSE,
    question: 'Loki is the son of Odin in Norse mythology.',
    answer: false,
    explanation: 'Loki is the son of the giants Fárbauti and Laufey. He became Odin\'s blood brother, not his son. Thor is Odin\'s son.',
    xp: 10,
  },
  {
    id: 'n4',
    mythology: 'norse',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What is Ragnarok?',
    options: [
      'The home of the gods',
      'The final battle and destruction of the Norse cosmos',
      'The rainbow bridge between worlds',
      'The wolf that chases the sun',
    ],
    answer: 'The final battle and destruction of the Norse cosmos',
    explanation: 'Ragnarok is the twilight of the gods — a series of catastrophic events including a great battle that results in the death of major deities and the submersion of the world.',
    xp: 10,
  },
  // NORSE - ADEPT
  {
    id: 'n5',
    mythology: 'norse',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'Which of Odin\'s two ravens bring him information from around the world?',
    options: ['Huginn and Muninn', 'Geri and Freki', 'Skoll and Hati', 'Nidhogg and Ratatoskr'],
    answer: 'Huginn and Muninn',
    explanation: 'Huginn (Thought) and Muninn (Memory) fly across the world daily and return to whisper what they\'ve seen to Odin.',
    xp: 20,
  },
  {
    id: 'n6',
    mythology: 'norse',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What did Odin sacrifice to gain wisdom from the Well of Mimir?',
    options: ['His right hand', 'One of his eyes', 'His son Baldr', 'His immortality'],
    answer: 'One of his eyes',
    explanation: 'Odin sacrificed one eye at Mimir\'s well to gain cosmic wisdom. He also hung himself on Yggdrasil for 9 nights to discover the runes.',
    xp: 20,
  },
  {
    id: 'n7',
    mythology: 'norse',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'Who is the blind god tricked by Loki into killing Baldr?',
    options: ['Tyr', 'Hodr', 'Vidar', 'Vali'],
    answer: 'Hodr',
    explanation: 'Loki gave the blind god Hodr a spear of mistletoe — the only thing that could harm Baldr — and guided his throw.',
    xp: 20,
  },
  // NORSE - SCHOLAR
  {
    id: 'n8',
    mythology: 'norse',
    difficulty: 'scholar',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What are the names of the two main groups of Norse gods?',
    options: ['Aesir and Vanir', 'Asgardians and Jotnar', 'Ljosalfar and Dokkalfar', 'Disir and Norns'],
    answer: 'Aesir and Vanir',
    explanation: 'The Aesir (war gods: Odin, Thor, Tyr) and Vanir (fertility gods: Freyr, Freya, Njord) once warred and then exchanged hostages for peace.',
    xp: 30,
  },
  {
    id: 'n9',
    mythology: 'norse',
    difficulty: 'scholar',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'The Prose Edda was written by which Icelandic scholar in the 13th century?',
    options: ['Saxo Grammaticus', 'Snorri Sturluson', 'Ari Thorgilsson', 'Egill Skallagrímsson'],
    answer: 'Snorri Sturluson',
    explanation: 'Snorri Sturluson compiled the Prose Edda around 1220 CE, making it one of the most important sources of Norse mythology.',
    xp: 30,
  },

  // ─────────────────────────────────────────────
  // EGYPTIAN - ADEPT
  // ─────────────────────────────────────────────
  {
    id: 'e1',
    mythology: 'egyptian',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What is the Egyptian god of the dead and afterlife?',
    options: ['Ra', 'Anubis', 'Osiris', 'Set'],
    answer: 'Osiris',
    explanation: 'Osiris is the god of the dead, resurrection, and the afterlife. Anubis is god of embalming and funerary rites.',
    xp: 10,
  },
  {
    id: 'e2',
    mythology: 'egyptian',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'In the weighing of the heart ceremony, what was the heart weighed against?',
    options: ['A golden scale', 'The Feather of Ma\'at', 'A stone of truth', 'The eye of Ra'],
    answer: 'The Feather of Ma\'at',
    explanation: 'After death, the heart was weighed against the feather of Ma\'at (truth/justice). If heavier, Ammit the devourer ate the heart.',
    xp: 20,
  },
  {
    id: 'e3',
    mythology: 'egyptian',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'Which god did Set murder and dismember, scattering the pieces across Egypt?',
    options: ['Ra', 'Horus', 'Osiris', 'Thoth'],
    answer: 'Osiris',
    explanation: 'Set, jealous of Osiris, murdered him and scattered 14 pieces across Egypt. Isis gathered them and resurrected him long enough to conceive Horus.',
    xp: 20,
  },
  {
    id: 'e4',
    mythology: 'egyptian',
    difficulty: 'scholar',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What is the name of the Egyptian concept of cosmic order, truth, and balance?',
    options: ['Ka', 'Ba', 'Ma\'at', 'Heka'],
    answer: 'Ma\'at',
    explanation: 'Ma\'at was both a goddess and the abstract concept of truth, balance, and cosmic order that the pharaoh was obligated to uphold.',
    xp: 30,
  },
  {
    id: 'e5',
    mythology: 'egyptian',
    difficulty: 'oracle',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'The Ogdoad of Hermopolis represented eight primordial deities in four pairs. Which pair was NOT part of the Ogdoad?',
    options: ['Nun and Naunet', 'Amun and Amaunet', 'Osiris and Isis', 'Kek and Kauket'],
    answer: 'Osiris and Isis',
    explanation: 'The Ogdoad: Nun/Naunet (water), Huh/Hauhet (infinity), Kek/Kauket (darkness), Amun/Amaunet (air). Osiris and Isis are part of the Ennead of Heliopolis.',
    xp: 50,
  },

  // ─────────────────────────────────────────────
  // HINDU
  // ─────────────────────────────────────────────
  {
    id: 'h1',
    mythology: 'hindu',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'In Hinduism, what is the name of the great cosmic destroyer who is also the god of yoga and ascetics?',
    options: ['Brahma', 'Vishnu', 'Shiva', 'Indra'],
    answer: 'Shiva',
    explanation: 'Shiva is the destroyer in the Hindu Trinity (Trimurti), alongside Brahma the creator and Vishnu the preserver.',
    xp: 10,
  },
  {
    id: 'h2',
    mythology: 'hindu',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'Which demon did Durga slay in the great battle described in the Devi Mahatmya?',
    options: ['Ravana', 'Mahishasura', 'Hiranyakashipu', 'Vritra'],
    answer: 'Mahishasura',
    explanation: 'Mahishasura (the buffalo demon) could not be defeated by any god or man. The gods combined their powers to create Durga, who slew him.',
    xp: 20,
  },
  {
    id: 'h3',
    mythology: 'hindu',
    difficulty: 'scholar',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'How many avatars does Vishnu have in the Dashavatara tradition?',
    options: ['8', '10', '12', '24'],
    answer: '10',
    explanation: 'The Dashavatara (ten avatars): Matsya, Kurma, Varaha, Narasimha, Vamana, Parashurama, Rama, Krishna, Buddha, and Kalki (yet to come).',
    xp: 30,
  },
  {
    id: 'h4',
    mythology: 'hindu',
    difficulty: 'oracle',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'In the Rigveda, which hymn is considered the creation hymn that questions whether even the gods know the origin of the cosmos?',
    options: ['Purusha Sukta', 'Nasadiya Sukta', 'Devi Sukta', 'Indra Sukta'],
    answer: 'Nasadiya Sukta',
    explanation: 'The Nasadiya Sukta (RV 10.129), the "Hymn of Creation," ends with profound uncertainty: "Perhaps it formed itself, or perhaps it did not — the one who looks down on it, in the highest heaven, only he knows — or perhaps he does not know."',
    xp: 50,
  },

  // ─────────────────────────────────────────────
  // JAPANESE
  // ─────────────────────────────────────────────
  {
    id: 'j1',
    mythology: 'japanese',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'Who are the creator couple in Japanese mythology who gave birth to the islands of Japan?',
    options: ['Amaterasu and Susanoo', 'Izanagi and Izanami', 'Ryujin and Benten', 'Raijin and Fujin'],
    answer: 'Izanagi and Izanami',
    explanation: 'Izanagi and Izanami stood on the Floating Bridge of Heaven and stirred the ocean to create the first islands.',
    xp: 10,
  },
  {
    id: 'j2',
    mythology: 'japanese',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'Why did Amaterasu, the sun goddess, hide in a cave causing the world to go dark?',
    options: [
      'She was mourning her husband Tsukuyomi',
      'Her brother Susanoo\'s destructive rampage frightened her',
      'She was challenged by the moon god',
      'A great monster blocked her path',
    ],
    answer: 'Her brother Susanoo\'s destructive rampage frightened her',
    explanation: 'Susanoo\'s tantrum — destroying rice fields, killing attendants — drove Amaterasu to hide in Ama-no-Iwato cave, plunging the world into darkness.',
    xp: 20,
  },
  {
    id: 'j3',
    mythology: 'japanese',
    difficulty: 'scholar',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What are the two oldest written sources for Japanese mythology?',
    options: ['Manyoshu and Nihon Shoki', 'Kojiki and Nihon Shoki', 'Fudoki and Kojiki', 'Genji Monogatari and Nihon Shoki'],
    answer: 'Kojiki and Nihon Shoki',
    explanation: 'The Kojiki (712 CE, "Record of Ancient Matters") and Nihon Shoki (720 CE, "Chronicles of Japan") are the two foundational texts of Japanese mythology.',
    xp: 30,
  },

  // ─────────────────────────────────────────────
  // CELTIC
  // ─────────────────────────────────────────────
  {
    id: 'c1',
    mythology: 'celtic',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What is the name of the Irish otherworld in Celtic mythology?',
    options: ['Avalon', 'Tír na nÓg', 'Annwn', 'Mag Mell'],
    answer: 'Tír na nÓg',
    explanation: 'Tír na nÓg ("Land of the Young") is the most famous Irish otherworld — a place of eternal youth, beauty, and joy.',
    xp: 10,
  },
  {
    id: 'c2',
    mythology: 'celtic',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'The Tuatha Dé Danann were defeated and went underground by which invaders?',
    options: ['The Fomorians', 'The Milesians', 'The Fir Bolg', 'The Romans'],
    answer: 'The Milesians',
    explanation: 'The Milesians (Sons of Mil, legendary ancestors of the Irish people) defeated the Tuatha Dé Danann, who retreated underground into the síde (fairy mounds).',
    xp: 20,
  },

  // ─────────────────────────────────────────────
  // AZTEC
  // ─────────────────────────────────────────────
  {
    id: 'az1',
    mythology: 'aztec',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'Which Aztec god is depicted as a feathered serpent?',
    options: ['Tlaloc', 'Huitzilopochtli', 'Quetzalcoatl', 'Tezcatlipoca'],
    answer: 'Quetzalcoatl',
    explanation: 'Quetzalcoatl means "feathered serpent" — he was a major deity of wind, air, learning, and Venus across Mesoamerican cultures.',
    xp: 10,
  },
  {
    id: 'az2',
    mythology: 'aztec',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'According to Aztec creation myth, how many "Suns" (worlds) existed before the current one?',
    options: ['2', '3', '4', '5'],
    answer: '4',
    explanation: 'The Aztecs believed four previous Suns existed before ours (the 5th Sun). Each was destroyed by different means: jaguar, wind, rain of fire, and flood.',
    xp: 20,
  },
  {
    id: 'az3',
    mythology: 'aztec',
    difficulty: 'scholar',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What did the gods sacrifice to create the 5th Sun (our current world) at Teotihuacan?',
    options: ['Their immortality', 'Their blood — they pierced themselves', 'A great serpent', 'The previous sun god'],
    answer: 'Their blood — they pierced themselves',
    explanation: 'The gods sacrificed their own blood to set the 5th Sun in motion. This established the Aztec concept of blood debt requiring human sacrifice to sustain the cosmos.',
    xp: 30,
  },

  // ─────────────────────────────────────────────
  // MESOPOTAMIAN
  // ─────────────────────────────────────────────
  {
    id: 'm1',
    mythology: 'mesopotamian',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'What is the name of the Sumerian/Akkadian epic featuring humanity\'s first great hero-king?',
    options: ['The Iliad', 'Epic of Gilgamesh', 'Enuma Elish', 'Atrahasis'],
    answer: 'Epic of Gilgamesh',
    explanation: 'The Epic of Gilgamesh (~2100 BCE) is one of the oldest works of literature, featuring the king of Uruk\'s quest for immortality and the great flood.',
    xp: 20,
  },
  {
    id: 'm2',
    mythology: 'mesopotamian',
    difficulty: 'scholar',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'In the Enuma Elish, from whose body did Marduk create the world?',
    options: ['Apsu', 'Enlil', 'Tiamat', 'Nammu'],
    answer: 'Tiamat',
    explanation: 'Marduk slew the chaos dragon Tiamat and split her body in two — one half became the sky, the other the earth.',
    xp: 30,
  },

  // ─────────────────────────────────────────────
  // CROSS-MYTHOLOGY (Special questions)
  // ─────────────────────────────────────────────
  {
    id: 'cross1',
    mythology: 'cross',
    difficulty: 'adept',
    type: QUESTION_TYPES.CROSS_MYTH,
    question: 'Which of these gods from different mythologies share the domain of thunder and storms?',
    options: [
      'Zeus (Greek), Thor (Norse), Indra (Hindu), Susanoo (Japanese)',
      'Ares (Greek), Tyr (Norse), Shiva (Hindu), Raijin (Japanese)',
      'Hermes (Greek), Loki (Norse), Vishnu (Hindu), Inari (Japanese)',
      'Hephaestus (Greek), Odin (Norse), Agni (Hindu), Izanagi (Japanese)',
    ],
    answer: 'Zeus (Greek), Thor (Norse), Indra (Hindu), Susanoo (Japanese)',
    explanation: 'Storm gods across cultures: Zeus (Greek lightning king), Thor (Norse thunder), Indra (Vedic storm/thunder king), Susanoo (Japanese storm god).',
    xp: 25,
  },
  {
    id: 'cross2',
    mythology: 'cross',
    difficulty: 'scholar',
    type: QUESTION_TYPES.CROSS_MYTH,
    question: 'A great flood myth appears in which of these sets of mythologies?',
    options: [
      'Mesopotamian, Hebrew, Hindu, Greek, Norse, Chinese — all of them',
      'Only Mesopotamian and Hebrew',
      'Only Mesopotamian, Greek, and Hindu',
      'Only Western mythologies (Mesopotamian, Hebrew, Greek)',
    ],
    answer: 'Mesopotamian, Hebrew, Hindu, Greek, Norse, Chinese — all of them',
    explanation: 'Flood myths are nearly universal: Utnapishtim (Mesopotamian), Noah (Hebrew), Manu (Hindu), Deucalion (Greek), Bergelmir (Norse), Gun-Yu (Chinese).',
    xp: 35,
  },
  {
    id: 'cross3',
    mythology: 'cross',
    difficulty: 'adept',
    type: QUESTION_TYPES.CROSS_MYTH,
    question: 'Which trickster figures from different mythologies are known for shapeshifting?',
    options: [
      'Loki (Norse), Coyote (Native American), Anansi (African/West African), Hermes (Greek)',
      'Odin (Norse), Zeus (Greek), Ra (Egyptian), Vishnu (Hindu)',
      'Thor (Norse), Ares (Greek), Set (Egyptian), Indra (Hindu)',
      'Freya (Norse), Aphrodite (Greek), Hathor (Egyptian), Lakshmi (Hindu)',
    ],
    answer: 'Loki (Norse), Coyote (Native American), Anansi (African/West African), Hermes (Greek)',
    explanation: 'Trickster figures who use cunning and shapeshifting: Loki (turned into mare, salmon, etc.), Coyote, Anansi the spider, and Hermes the divine messenger.',
    xp: 25,
  },
  {
    id: 'cross4',
    mythology: 'cross',
    difficulty: 'initiate',
    type: QUESTION_TYPES.CROSS_MYTH,
    question: 'MYTH OR MISCONCEPTION: Thor is a blonde-haired hero according to the original Norse myths.',
    options: ['Myth (true)', 'Misconception (false)'],
    answer: 'Misconception (false)',
    explanation: 'The Prose Edda describes Thor as having RED hair and a red beard. The blonde modern image comes from Marvel Comics (1962), not Norse texts.',
    xp: 15,
  },
  {
    id: 'cross5',
    mythology: 'cross',
    difficulty: 'initiate',
    type: QUESTION_TYPES.CROSS_MYTH,
    question: 'MYTH OR MISCONCEPTION: Vikings wore horned helmets into battle.',
    options: ['Myth (true)', 'Misconception (false)'],
    answer: 'Misconception (false)',
    explanation: 'No horned helmets have been found in Viking burial sites. The Gjermundbu helmet (found in Norway) is smooth metal. Horned helmets were ceremonial in the Bronze Age.',
    xp: 15,
  },
  {
    id: 'cross6',
    mythology: 'cross',
    difficulty: 'scholar',
    type: QUESTION_TYPES.CROSS_MYTH,
    question: 'Which concept appears across Egyptian (Ma\'at), Hindu (Dharma), Chinese (Tao/Dao), and Norse (Wyrd) mythologies?',
    options: [
      'Cosmic order and a natural law governing all things',
      'The cycle of reincarnation',
      'A supreme creator god',
      'The path of the heroic soul after death',
    ],
    answer: 'Cosmic order and a natural law governing all things',
    explanation: 'All four represent a universal order: Ma\'at (truth/balance), Dharma (cosmic duty/order), Tao (the Way), Wyrd (fate/interconnected destiny). The theme of cosmic law is universal.',
    xp: 35,
  },

  // ─────────────────────────────────────────────
  // CHINESE
  // ─────────────────────────────────────────────
  {
    id: 'ch1',
    mythology: 'chinese',
    difficulty: 'initiate',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'In Chinese mythology, who is the Jade Emperor?',
    options: [
      'The god of war',
      'The supreme ruler of Heaven and all realms',
      'The dragon king of the seas',
      'The god of wealth',
    ],
    answer: 'The supreme ruler of Heaven and all realms',
    explanation: 'The Jade Emperor (Yù Huáng) is the ruler of Heaven, Earth, and Hell in Chinese mythology and folk religion.',
    xp: 10,
  },
  {
    id: 'ch2',
    mythology: 'chinese',
    difficulty: 'adept',
    type: QUESTION_TYPES.MULTIPLE_CHOICE,
    question: 'Which Chinese mythological figure is credited with creating humans from yellow clay?',
    options: ['Nuwa', 'Pangu', 'Fuxi', 'Houyi'],
    answer: 'Nuwa',
    explanation: 'Nuwa, a serpent-bodied creator goddess, shaped humans from yellow clay. She also repaired the sky by melting colored stones after the great catastrophe.',
    xp: 20,
  },

  // ─────────────────────────────────────────────
  // ORDER (special question type)
  // ─────────────────────────────────────────────
  {
    id: 'ord1',
    mythology: 'greek',
    difficulty: 'adept',
    type: QUESTION_TYPES.ORDER,
    question: 'Put the 12 Labors of Heracles in the correct order (first 4):',
    items: ['Nemean Lion', 'Lernaean Hydra', 'Ceryneian Hind', 'Erymanthian Boar'],
    answer: ['Nemean Lion', 'Lernaean Hydra', 'Ceryneian Hind', 'Erymanthian Boar'],
    explanation: 'The classic order of the 12 Labors begins: 1) Nemean Lion, 2) Lernaean Hydra, 3) Ceryneian Hind, 4) Erymanthian Boar.',
    xp: 25,
  },
];

export const getQuestionsByDifficulty = (difficulty) =>
  questions.filter(q => q.difficulty === difficulty);

export const getQuestionsByMythology = (mythology) =>
  questions.filter(q => q.mythology === mythology);

export const getRandomQuestions = (count = 10, filters = {}) => {
  let pool = [...questions];
  if (filters.mythology) pool = pool.filter(q => q.mythology === filters.mythology || q.mythology === 'cross');
  if (filters.difficulty) pool = pool.filter(q => q.difficulty === filters.difficulty);
  pool.sort(() => Math.random() - 0.5);
  return pool.slice(0, count);
};

export const ACHIEVEMENTS = [
  { id: 'first_win', name: 'First Myth', description: 'Complete your first game', icon: '⚡', xpRequired: 0 },
  { id: 'streak_3', name: 'Mythic Streak', description: 'Answer 3 in a row correctly', icon: '🔥', xpRequired: 0 },
  { id: 'cross_myth', name: 'Pantheon Sage', description: 'Answer 5 cross-mythology questions', icon: '🌍', xpRequired: 0 },
  { id: 'lvl5', name: 'Adept Scholar', description: 'Reach Level 5', icon: '📚', xpRequired: 150 },
  { id: 'lvl10', name: 'Mythology Master', description: 'Reach Level 10', icon: '🏛️', xpRequired: 500 },
  { id: 'perfect', name: 'Oracle\'s Blessing', description: 'Perfect score in any game', icon: '💎', xpRequired: 0 },
  { id: 'all_myth', name: 'World Pantheon', description: 'Answer from 6 different mythologies', icon: '🌐', xpRequired: 0 },
];
