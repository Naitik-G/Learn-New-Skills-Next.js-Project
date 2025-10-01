export interface Sentence {
  text: string;
  phonetic: string;
  hint: string;
}

export interface SentenceLevels {
  beginner: Sentence[];
  intermediate: Sentence[];
  advanced: Sentence[];
}

export const sentences: SentenceLevels = {
  beginner: [
    {
      text: "Hello, how are you today?",
      phonetic: "/həˈloʊ, haʊ ɑr ju təˈdeɪ/",
      hint: "Focus on the 'h' sound at the beginning and the 'oo' sound in 'you'",
    },
    {
      text: "The weather is beautiful today.",
      phonetic: "/ðə ˈwɛðər ɪz ˈbjutəfəl təˈdeɪ/",
      hint: "Pay attention to the 'th' sound in 'the' and 'weather'",
    },
    {
      text: "I love learning new languages.",
      phonetic: "/aɪ lʌv ˈlɜrnɪŋ nu ˈlæŋgwɪdʒəz/",
      hint: "The 'ng' sound in 'learning' and 'languages' is important",
    },
  ],
  beginner: [
    {
      text: "The quick brown fox jumps over the lazy dog.",
      phonetic: "/ðə kwɪk braʊn fɑks dʒʌmps ˈoʊvər ðə ˈleɪzi dɔg/",
      hint: "This pangram contains many different sounds - focus on clarity",
    },
    {
      text: "She sells seashells by the seashore.",
      phonetic: "/ʃi sɛlz ˈsiʃɛlz baɪ ðə ˈsiʃɔr/",
      hint: "Practice the 'sh' and 's' sounds - they're different!",
    },
    {
      text: "The thoughtful teacher taught thoroughly.",
      phonetic: "/ðə ˈθɔtfəl ˈtiʧər tɔt ˈθɜroʊli/",
      hint: "Focus on the 'th' sounds - some are voiced, some are not",
    },
  ],
  advanced: [
    {
      text: "The phenomenon of bioluminescence is absolutely fascinating.",
      phonetic:
        "/ðə fəˈnɑməˌnɑn ʌv ˌbaɪoʊˌluməˈnɛsəns ɪz ˈæbsəˌlutli ˈfæsəˌneɪtɪŋ/",
      hint: "Break down complex words into syllables for better pronunciation",
    },
    {
      text: "Entrepreneurs often face unprecedented challenges.",
      phonetic:
        "/ˌɑntrəprəˈnɜrz ˈɔfən feɪs ʌnˈprɛsəˌdɛntəd ˈʧælənʤəz/",
      hint: "Focus on stress patterns in multi-syllable words",
    },
  ],
};
