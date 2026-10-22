// @/data/pronunciation.ts

export interface Sentence {
  text: string;
  readablePhonetic: string;
  words: string[];
}

export interface SentencesByLevel {
  beginner: Sentence[];
  intermediate: Sentence[];
  advanced: Sentence[];
}

export const sentencesByLevel: SentencesByLevel = {
  beginner: [
  {
    text: "Good morning!",
    readablePhonetic: "guhd MOR-ning",
    words: ["Good", "morning"]
  },
  {
    text: "What is your name?",
    readablePhonetic: "wuht iz yor naym",
    words: ["What", "is", "your", "name"]
  },
  {
    text: "My name is John.",
    readablePhonetic: "mai naym iz JON",
    words: ["My", "name", "is", "John"]
  },
  {
    text: "Nice to meet you.",
    readablePhonetic: "nys tuh MEET yoo",
    words: ["Nice", "to", "meet", "you"]
  },
  {
    text: "How old are you?",
    readablePhonetic: "how OHLD are yoo",
    words: ["How", "old", "are", "you"]
  },
  {
    text: "I am twenty years old.",
    readablePhonetic: "ai am TWEN-tee yeerz ohld",
    words: ["I", "am", "twenty", "years", "old"]
  },
  {
    text: "Where are you from?",
    readablePhonetic: "wair are yoo frum",
    words: ["Where", "are", "you", "from"]
  },
  {
    text: "I am from India.",
    readablePhonetic: "ai am frum IN-dee-uh",
    words: ["I", "am", "from", "India"]
  },
  {
    text: "Do you speak English?",
    readablePhonetic: "doo yoo speek ING-glish",
    words: ["Do", "you", "speak", "English"]
  },
  {
    text: "Yes, I do.",
    readablePhonetic: "yes, ai doo",
    words: ["Yes", "I", "do"]
  },
  {
    text: "No, I don't.",
    readablePhonetic: "noh, ai doh-nt",
    words: ["No", "I", "don't"]
  },
  {
    text: "Please help me.",
    readablePhonetic: "pleez help mee",
    words: ["Please", "help", "me"]
  },
  {
    text: "Thank you very much.",
    readablePhonetic: "thangk yoo VEH-ree much",
    words: ["Thank", "you", "very", "much"]
  },
  {
    text: "You're welcome.",
    readablePhonetic: "yoor WEL-kum",
    words: ["You're", "welcome"]
  },
  {
    text: "Excuse me.",
    readablePhonetic: "ek-SKYOOZ mee",
    words: ["Excuse", "me"]
  },
  {
    text: "I'm sorry.",
    readablePhonetic: "aim SOR-ee",
    words: ["I'm", "sorry"]
  },
  {
    text: "What time is it?",
    readablePhonetic: "wuht tym iz it",
    words: ["What", "time", "is", "it"]
  },
  {
    text: "It is five o'clock.",
    readablePhonetic: "it iz FYV uh-KLOK",
    words: ["It", "is", "five", "o'clock"]
  },
  {
    text: "I like apples.",
    readablePhonetic: "ai lyk AP-uhlz",
    words: ["I", "like", "apples"]
  },
  {
    text: "Do you like bananas?",
    readablePhonetic: "doo yoo lyk buh-NA-nuhz",
    words: ["Do", "you", "like", "bananas"]
  },
  {
    text: "I live in Delhi.",
    readablePhonetic: "ai liv in DEL-ee",
    words: ["I", "live", "in", "Delhi"]
  },
  {
    text: "This is my book.",
    readablePhonetic: "this iz mai buk",
    words: ["This", "is", "my", "book"]
  },
  {
    text: "That is your pen.",
    readablePhonetic: "that iz yor pen",
    words: ["That", "is", "your", "pen"]
  },
  {
    text: "Can you help me?",
    readablePhonetic: "kan yoo help mee",
    words: ["Can", "you", "help", "me"]
  },
  {
    text: "I don't understand.",
    readablePhonetic: "ai doh-nt un-der-STAND",
    words: ["I", "don't", "understand"]
  },
  {
    text: "Please speak slowly.",
    readablePhonetic: "pleez speek SLOH-lee",
    words: ["Please", "speak", "slowly"]
  },
  {
    text: "I am learning English.",
    readablePhonetic: "ai am LURN-ing ING-glish",
    words: ["I", "am", "learning", "English"]
  },
  {
    text: "What does this mean?",
    readablePhonetic: "wuht duz this meen",
    words: ["What", "does", "this", "mean"]
  },
  {
    text: "I am hungry.",
    readablePhonetic: "ai am HUN-gree",
    words: ["I", "am", "hungry"]
  },
  {
    text: "Let's go!",
    readablePhonetic: "lets GOH",
    words: ["Let's", "go"]
  }
],


  intermediate: [
  {
    text: "Could you please help me with this problem?",
    readablePhonetic: "KUUD yoo PLEEZ help mee with this PRAH-blum",
    words: ["Could", "you", "please", "help", "me", "with", "this", "problem"]
  },
  {
    text: "I’m trying to understand this concept better.",
    readablePhonetic: "aim TRY-ing tuh un-der-STAND this KON-sept BET-er",
    words: ["I'm", "trying", "to", "understand", "this", "concept", "better"]
  },
  {
    text: "She explained the instructions very clearly.",
    readablePhonetic: "she ek-SPLAYND thee in-STRUK-shunz VEH-ree KLEER-lee",
    words: ["She", "explained", "the", "instructions", "very", "clearly"]
  },
  {
    text: "We need to finish this task before lunch.",
    readablePhonetic: "wee NEED tuh FIN-ish this TASK bih-FOR LUNCH",
    words: ["We", "need", "to", "finish", "this", "task", "before", "lunch"]
  },
  {
    text: "I have already completed my homework.",
    readablePhonetic: "ai hav awl-RED-ee kum-PLEET-ed mai HOME-wurk",
    words: ["I", "have", "already", "completed", "my", "homework"]
  },
  {
    text: "They are planning a trip to the mountains.",
    readablePhonetic: "thay are PLAN-ing uh TRIP tuh thee MOWN-tinz",
    words: ["They", "are", "planning", "a", "trip", "to", "the", "mountains"]
  },
  {
    text: "Can you tell me more about this topic?",
    readablePhonetic: "kan yoo TEL mee MOR uh-BOWT this TAH-pik",
    words: ["Can", "you", "tell", "me", "more", "about", "this", "topic"]
  },
  {
    text: "I forgot to bring my notebook today.",
    readablePhonetic: "ai for-GOT tuh BRING mai NOTE-buk tuh-DAY",
    words: ["I", "forgot", "to", "bring", "my", "notebook", "today"]
  },
  {
    text: "Let’s review the answers together.",
    readablePhonetic: "lets ree-VYOO thee AN-surz tuh-GETH-er",
    words: ["Let's", "review", "the", "answers", "together"]
  },
  {
    text: "He usually arrives at work by nine.",
    readablePhonetic: "hee YOO-zhoo-uh-lee uh-RYVZ at wurk by NINE",
    words: ["He", "usually", "arrives", "at", "work", "by", "nine"]
  },
  {
    text: "I’m interested in learning new languages.",
    readablePhonetic: "aim IN-ter-est-ed in LURN-ing nyoo LANG-gwij-iz",
    words: ["I'm", "interested", "in", "learning", "new", "languages"]
  },
  {
    text: "Please make sure to submit it on time.",
    readablePhonetic: "pleez MAYK shoor tuh sub-MIT it on TYM",
    words: ["Please", "make", "sure", "to", "submit", "it", "on", "time"]
  },
  {
    text: "The weather has been quite unpredictable lately.",
    readablePhonetic: "thuh WETH-er haz bin kwyt un-pre-DIK-tuh-bul LAYT-lee",
    words: ["The", "weather", "has", "been", "quite", "unpredictable", "lately"]
  },
  {
    text: "I prefer working in a quiet environment.",
    readablePhonetic: "ai pre-FUR WURK-ing in uh KWY-it en-VY-ron-ment",
    words: ["I", "prefer", "working", "in", "a", "quiet", "environment"]
  },
  {
    text: "She is responsible for organizing the event.",
    readablePhonetic: "she iz re-SPON-suh-bul for OR-guh-nyz-ing thee ee-VENT",
    words: ["She", "is", "responsible", "for", "organizing", "the", "event"]
  },
  {
    text: "We should discuss this issue in detail.",
    readablePhonetic: "wee shood dis-KUSS this ISH-yoo in DEE-tayl",
    words: ["We", "should", "discuss", "this", "issue", "in", "detail"]
  },
  {
    text: "He didn’t agree with the final decision.",
    readablePhonetic: "hee DID-nt uh-GREE with thee FY-nul duh-SIZH-un",
    words: ["He", "didn't", "agree", "with", "the", "final", "decision"]
  },
  {
    text: "I’m looking forward to the weekend.",
    readablePhonetic: "aim LOOK-ing FOR-werd tuh thee WEEK-end",
    words: ["I'm", "looking", "forward", "to", "the", "weekend"]
  },
  {
    text: "Could you explain that again, please?",
    readablePhonetic: "KUUD yoo ek-SPLAYN that uh-GEN, pleez",
    words: ["Could", "you", "explain", "that", "again", "please"]
  },
  {
    text: "We are working on a group project.",
    readablePhonetic: "wee are WURK-ing on uh GROOP PRAH-jekt",
    words: ["We", "are", "working", "on", "a", "group", "project"]
  },
  {
    text: "She asked a very thoughtful question.",
    readablePhonetic: "she ASKD uh VEH-ree THAWT-ful KWES-chun",
    words: ["She", "asked", "a", "very", "thoughtful", "question"]
  },
  {
    text: "I need to improve my writing skills.",
    readablePhonetic: "ai NEED tuh im-PROOV mai RY-ting SKILZ",
    words: ["I", "need", "to", "improve", "my", "writing", "skills"]
  },
  {
    text: "The instructions were a bit confusing.",
    readablePhonetic: "thee in-STRUK-shunz wer uh bit kun-FYOOZ-ing",
    words: ["The", "instructions", "were", "a", "bit", "confusing"]
  },
  {
    text: "Let’s meet at the library tomorrow.",
    readablePhonetic: "lets MEET at thee LY-brer-ee tuh-MAH-roh",
    words: ["Let's", "meet", "at", "the", "library", "tomorrow"]
  },
  {
    text: "He gave a detailed explanation.",
    readablePhonetic: "hee GAYV uh DEE-tayld ek-spluh-NAY-shun",
    words: ["He", "gave", "a", "detailed", "explanation"]
  },
  {
    text: "I’m not sure how to solve this.",
    readablePhonetic: "aim not shoor how tuh SAHLV this",
    words: ["I'm", "not", "sure", "how", "to", "solve", "this"]
  },
  {
    text: "She suggested a better solution.",
    readablePhonetic: "she sug-JEST-ed uh BET-er suh-LOO-shun",
    words: ["She", "suggested", "a", "better", "solution"]
  },
  {
    text: "We’ll need more time to complete it.",
    readablePhonetic: "weel NEED mor TYM tuh kum-PLEET it",
    words: ["We'll", "need", "more", "time", "to", "complete", "it"]
  },
  {
    text: "He’s preparing for his final exams.",
    readablePhonetic: "heez pre-PAIR-ing for hiz FY-nul eg-ZAMZ",
    words: ["He's", "preparing", "for", "his", "final", "exams"]
  },
  {
    text: "I appreciate your help and support.",
    readablePhonetic: "ai uh-PREE-shee-ayt yor HELP and suh-PORT",
    words: ["I", "appreciate", "your", "help", "and", "support"]
  }
]
,

 advanced: [
  {
    text: "The pharmaceutical company's innovative methodology revolutionized therapeutic approaches.",
    readablePhonetic: "thuh far-muh-SOO-tih-kul KUM-puh-neez IN-uh-vay-tiv meth-uh-DOL-uh-jee rev-uh-loo-shuh-NIZED ther-uh-PYOO-tik uh-PROH-chuz",
    words: ["The", "pharmaceutical", "company's", "innovative", "methodology", "revolutionized", "therapeutic", "approaches"]
  },
  {
    text: "Her eloquent articulation captivated the audience during the symposium.",
    readablePhonetic: "hur EL-uh-kwent ar-tik-yuh-LAY-shun KAP-tuh-vay-ted thee AW-dee-uhns DUR-ing thee sim-POH-zee-um",
    words: ["Her", "eloquent", "articulation", "captivated", "the", "audience", "during", "the", "symposium"]
  },
  {
    text: "Despite the complexity, the algorithm performed with remarkable precision.",
    readablePhonetic: "duh-SPYT thee kom-PLEK-suh-tee, thee AL-guh-ri-thum pur-FORMD with ree-MAR-kuh-bul pre-SIZH-un",
    words: ["Despite", "the", "complexity", "the", "algorithm", "performed", "with", "remarkable", "precision"]
  },
  {
    text: "The geopolitical ramifications of the treaty were profound.",
    readablePhonetic: "thuh jee-oh-puh-LIT-ih-kul ram-uh-fuh-KAY-shunz uv thee TREE-tee wer pro-FOUND",
    words: ["The", "geopolitical", "ramifications", "of", "the", "treaty", "were", "profound"]
  },
  {
    text: "He demonstrated unparalleled expertise in quantum mechanics.",
    readablePhonetic: "hee DEM-uhn-stray-ted un-PAIR-uh-leld ek-spur-TEEZ in KWON-tum muh-KAN-iks",
    words: ["He", "demonstrated", "unparalleled", "expertise", "in", "quantum", "mechanics"]
  },
  {
    text: "The architectural design seamlessly blended tradition with modernity.",
    readablePhonetic: "thuh ar-kuh-TEK-chuh-rul dih-ZYN SEEM-luhs-lee BLEN-ded truh-DISH-un with muh-DUR-nuh-tee",
    words: ["The", "architectural", "design", "seamlessly", "blended", "tradition", "with", "modernity"]
  },
  {
    text: "Her dissertation explored the intersection of ethics and artificial intelligence.",
    readablePhonetic: "hur dis-er-TAY-shun ek-SPLORD thee in-ter-SEK-shun uv ETH-iks and ar-tuh-FISH-uhl in-TEL-uh-jens",
    words: ["Her", "dissertation", "explored", "the", "intersection", "of", "ethics", "and", "artificial", "intelligence"]
  },
  {
    text: "The economic implications of inflation are multifaceted and far-reaching.",
    readablePhonetic: "thuh ek-uh-NAH-mik im-pluh-KAY-shunz uv in-FLAY-shun are MUL-tee-FAS-uh-tid and FAR-REE-ching",
    words: ["The", "economic", "implications", "of", "inflation", "are", "multifaceted", "and", "far-reaching"]
  },
  {
    text: "He proposed a paradigm shift in educational methodologies.",
    readablePhonetic: "hee pruh-POHZD uh PAR-uh-dym shift in ed-yoo-KAY-shuh-nul meth-uh-DOL-uh-jeez",
    words: ["He", "proposed", "a", "paradigm", "shift", "in", "educational", "methodologies"]
  },
  {
    text: "The documentary provided a nuanced perspective on climate change.",
    readablePhonetic: "thuh dok-yoo-MEN-tuh-ree pruh-VY-did uh NYOO-awnst pur-SPEK-tiv on KLY-mit chaynj",
    words: ["The", "documentary", "provided", "a", "nuanced", "perspective", "on", "climate", "change"]
  },
  {
    text: "Her meticulous research contributed significantly to the field of neuroscience.",
    readablePhonetic: "hur muh-TIK-yoo-lus REE-surch kun-TRIB-yoo-tid SIG-nif-uh-kunt-lee tuh thee FEELD uv NYOO-roh-sy-ens",
    words: ["Her", "meticulous", "research", "contributed", "significantly", "to", "the", "field", "of", "neuroscience"]
  },
  {
    text: "The legislation aimed to mitigate socioeconomic disparities.",
    readablePhonetic: "thuh lej-is-LAY-shun AYMD tuh MIT-uh-gayt soh-shee-oh-ek-uh-NAH-mik dis-PAIR-uh-teez",
    words: ["The", "legislation", "aimed", "to", "mitigate", "socioeconomic", "disparities"]
  },
  {
    text: "He articulated his stance with clarity and conviction.",
    readablePhonetic: "hee ar-TIK-yoo-lay-ted hiz STANS with KLAR-uh-tee and kun-VIK-shun",
    words: ["He", "articulated", "his", "stance", "with", "clarity", "and", "conviction"]
  },
  {
    text: "The hypothesis was substantiated through empirical evidence.",
    readablePhonetic: "thuh hy-POTH-uh-sis wuz sub-STAN-shee-ay-ted throo em-PIHR-ih-kuhl EV-uh-dens",
    words: ["The", "hypothesis", "was", "substantiated", "through", "empirical", "evidence"]
  },
  {
    text: "Her proficiency in multiple languages is commendable.",
    readablePhonetic: "hur pro-FISH-en-see in MUL-tuh-pul LANG-gwij-iz iz kuh-MEN-duh-bul",
    words: ["Her", "proficiency", "in", "multiple", "languages", "is", "commendable"]
  },
  {
    text: "The novel delves into existential themes with philosophical depth.",
    readablePhonetic: "thuh NAH-vul DELVZ in-too ek-zis-TEN-shul THEEMZ with FIL-uh-suh-FI-kuhl depth",
    words: ["The", "novel", "delves", "into", "existential", "themes", "with", "philosophical", "depth"]
  },
  {
    text: "He navigated the bureaucratic maze with strategic finesse.",
    readablePhonetic: "hee NAV-uh-gay-ted thee byoo-roh-KRAT-ik MAYZ with struh-TEE-jik fi-NESS",
    words: ["He", "navigated", "the", "bureaucratic", "maze", "with", "strategic", "finesse"]
  },
  {
    text: "The experiment yielded groundbreaking results in genetic engineering.",
    readablePhonetic: "thuh ek-SPER-uh-ment YEELD-ed GROUND-bray-king ri-ZULTS in juh-NET-ik en-juh-NEER-ing",
    words: ["The", "experiment", "yielded", "groundbreaking", "results", "in", "genetic", "engineering"]
  },
  {
    text: "Her analysis incorporated both qualitative and quantitative data.",
    readablePhonetic: "hur uh-NAL-uh-sis in-KOR-puh-ray-ted both KWOL-uh-tay-tiv and KWON-tuh-tay-tiv DAY-tuh",
    words: ["Her", "analysis", "incorporated", "both", "qualitative", "and", "quantitative", "data"]
  },
  {
    text: "The conference facilitated interdisciplinary collaboration.",
    readablePhonetic: "thuh KON-fruhns fuh-SIL-uh-tay-ted in-ter-DIS-uh-pluh-nair-ee kuh-LAB-uh-RAY-shun",
    words: ["The", "conference", "facilitated", "interdisciplinary", "collaboration"]
  },
  {
    text: "He exhibited resilience in the face of adversity.",
    readablePhonetic: "hee eg-ZIB-uh-tid ruh-ZIL-yens in thee FAYS uv ad-VUR-suh-tee",
    words: ["He", "exhibited", "resilience", "in", "the", "face", "of", "adversity"]
  },
]
};

// Export individual levels if needed
export const beginnerSentences = sentencesByLevel.beginner;
export const intermediateSentences = sentencesByLevel.intermediate;
export const advancedSentences = sentencesByLevel.advanced;