// Curated multilingual and specialized corpora for Santypes
// Modes: Words, Time, Quotes, Paragraphs, Code, Hindi, Kannada

export const COMMON_WORDS = [
  "the", "be", "of", "and", "a", "to", "in", "he", "have", "it",
  "that", "for", "they", "with", "as", "not", "on", "she", "at", "by",
  "this", "we", "you", "do", "but", "his", "from", "they", "say", "her",
  "she", "or", "an", "will", "my", "one", "all", "would", "there", "their",
  "what", "so", "up", "out", "if", "about", "who", "get", "which", "go",
  "me", "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could", "them", "see",
  "other", "than", "then", "now", "look", "only", "come", "its", "over", "think",
  "also", "back", "after", "use", "two", "how", "our", "work", "first", "well",
  "way", "even", "new", "want", "because", "any", "these", "give", "day", "most",
  "us", "great", "between", "need", "large", "under", "never", "start", "city", "earth",
  "eyes", "light", "thought", "head", "under", "story", "saw", "far", "sea", "draw",
  "left", "late", "run", "while", "press", "close", "night", "real", "life",
  "few", "stop", "open", "seem", "together", "next", "white", "children", "begin", "got",
  "walk", "example", "ease", "paper", "group", "always", "music", "those", "both", "mark",
  "often", "letter", "until", "mile", "river", "car", "feet", "care", "second", "book",
  "carry", "took", "science", "eat", "room", "friend", "began", "idea", "fish", "mountain",
  "north", "once", "base", "hear", "horse", "cut", "sure", "watch", "color", "face",
  "wood", "main", "enough", "plain", "girl", "usual", "young", "ready", "above", "ever",
  "red", "list", "though", "feel", "talk", "bird", "soon", "body", "dog", "family",
  "direct", "pose", "leave", "song", "measure", "door", "product", "black", "short", "numeral",
  "class", "wind", "question", "happen", "complete", "ship", "area", "half", "rock", "order",
  "fire", "south", "problem", "piece", "told", "knew", "pass", "since", "top", "whole",
  "king", "space", "heard", "best", "hour", "better", "true", "during", "hundred", "five",
  "remember", "step", "early", "hold", "west", "ground", "interest", "reach", "fast", "verb",
  "sing", "listen", "six", "table", "travel", "less", "morning", "ten", "simple", "several"
];

// Rich natural English paragraphs
export const PARAGRAPHS = {
  short: [
    "The art of touch typing is not merely about mechanical finger speed, but the flow of thought directly onto the digital canvas. When muscle memory takes over, the keyboard ceases to be a barrier and becomes a natural extension of human consciousness.",
    "Sunlight filtered through the canopy of the ancient forest, casting dappled shadows on the emerald moss beneath. Each breath of morning air carried the crisp fragrance of cedar and damp earth, awakening the quiet wilderness from slumber.",
    "Modern computers execute billions of cycles per second, yet human intuition remains the irreplaceable catalyst for genuine innovation. True engineering lies in crafting systems that are both robust and profoundly simple."
  ],
  medium: [
    "Deep beneath the ocean surface lies a realm untouched by sunlight, illuminated only by the faint bioluminescent glow of strange deep-sea creatures. Here, tectonic vents spew superheated mineral clouds into the freezing abyss, nourishing resilient ecosystems that thrive under crushing pressure in perpetual darkness.",
    "Astronomy teaches us humility. Looking up at the tapestry of galaxies spanning billions of light-years, one realizes that every boundary ever fought over and every fleeting triumph took place on a pale blue dot suspended in a sunbeam. Our curiosity drives us to explore the cosmos.",
    "Software development is an exercise in managing complexity. Clean architecture and modular design protect future maintainability against the entropy of rushed deadlines. When code is treated as technical literature, both current developers and future maintainers benefit immeasurably."
  ],
  long: [
    "Throughout history, the evolution of human communication has dictated the velocity of civilization. From primitive cuneiform clay tablets pressed in ancient Sumer to the Gutenberg printing press that dismantled monopolies on knowledge, each leap forward decentralized ideas. Today, through global fiber optic networks transmitting packets at near the speed of light, billions of human minds are interconnected in an unprecedented global neural network of shared intellect.",
    "The principles of deliberate practice suggest that mere repetition without mindful feedback yields rapid plateaus. To transcend automaticity, one must identify precise micro-weaknesses, analyze biomechanical rhythm, and intentionally push beyond comfort zones. Whether mastering an instrument or refining precision touch typing, consistent targeted focus consistently outperforms unfocused volume."
  ]
};

// Real-world code snippets across languages
export const CODE_SNIPPETS = {
  c: [
    "#include <stdio.h> int main(int argc, char *argv[]) { printf(\"Hello, World!\\n\"); return 0; }",
    "int *ptr = (int *)malloc(sizeof(int) * 10); if (ptr == NULL) return -1; free(ptr);",
    "struct Node { int data; struct Node *next; }; struct Node *head = NULL;",
    "void swap(int *a, int *b) { int temp = *a; *a = *b; *b = temp; }",
    "char *str_copy(char *dest, const char *src) { char *p = dest; while ((*p++ = *src++)); return dest; }",
    "size_t hash(const char *str) { size_t h = 5381; int c; while ((c = *str++)) h = ((h << 5) + h) + c; return h; }"
  ],
  javascript: [
    "async function fetchUserData(userId) { const res = await fetch(`/api/users/${userId}`); if (!res.ok) throw new Error('Not found'); return await res.json(); }",
    "const activeItems = items.filter(item => item.isActive).map(item => ({ id: item.id, label: item.title.toUpperCase() }));",
    "class EventEmitter { constructor() { this.events = new Map(); } on(name, fn) { if (!this.events.has(name)) this.events.set(name, []); this.events.get(name).push(fn); } }",
    "function debounce(fn, delay = 300) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }"
  ],
  python: [
    "def calculate_moving_average(data, window_size): return [sum(data[i:i+window_size]) / window_size for i in range(len(data) - window_size + 1)]",
    "class NeuralLayer: def __init__(self, in_features, out_features): self.weights = np.random.randn(in_features, out_features) * 0.01; self.biases = np.zeros((1, out_features))",
    "import math; def euclidean_distance(p1, p2): return math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))",
    "from collections import defaultdict; counter = defaultdict(int); for word in text.split(): counter[word] += 1"
  ],
  html_css: [
    "<button class=\"btn btn-primary\" aria-label=\"Submit Form\" onclick=\"handleSubmit(event)\">Save Changes</button>",
    ".card { display: flex; flex-direction: column; backdrop-filter: blur(16px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; }",
    "@media (max-width: 768px) { .nav-container { flex-direction: column; width: 100%; display: none; } }"
  ]
};

// Kannada Language Corpora (Native Script & Kanglish Transliteration)
export const KANNADA_TEXTS = {
  native: [
    "ಕನ್ನಡ ನಾಡು ನುಡಿ ಮತ್ತು ಸಂಸ್ಕೃತಿ ಅತ್ಯಂತ ಶ್ರೀಮಂತ ಹಾಗೂ ಪ್ರಾಚೀನವಾದದ್ದು.",
    "ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ ಸಿರಿಗನ್ನಡಂ ಬಾಳ್ಗೆ ಎಂದು ಕವಿರಾಜಮಾರ್ಗಕಾರನು ಸಾರಿದ್ದಾನೆ.",
    "ಜ್ಞಾನವೇ ಬೆಳಕು ವಿದ್ಯೆಯೇ ಮಾನವನಿಗೆ ಅತಿ ದೊಡ್ಡ ಶ್ರೇಷ್ಠ ಸಂಪತ್ತು.",
    "ಕಾಯಕವೇ ಕೈಲಾಸ ಎಂದು ಬಸವಣ್ಣನವರು ತಮ್ಮ ವಚನಗಳ ಮೂಲಕ ಜಗತ್ತಿಗೆ ಸಾರಿದ್ದಾರೆ.",
    "ಮನಸ್ಸಿದ್ದರೆ ಮಾರ್ಗ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ಖಂಡಿತವಾಗಿಯೂ ಸಿಗುತ್ತದೆ.",
    "ಸಮಯವು ಅತ್ಯಂತ ಅಮೂಲ್ಯವಾದದ್ದು ಅದನ್ನು ಸದುಪಯೋಗ ಪಡಿಸಿಕೊಳ್ಳಿ.",
    "ವಿದ್ಯೆಯಿಂದ ವಿನಯ ವಿನಯದಿಂದ ಅರ್ಹತೆ ಅರ್ಹತೆಯಿಂದ ಸಂಪತ್ತು ಲಭಿಸುತ್ತದೆ.",
    "ಕನ್ನಡ ಭಾಷೆಗೆ ಸಾವಿರಾರು ವರ್ಷಗಳ ಭವ್ಯ ಇತಿಹಾಸ ಮತ್ತು ಸಾಹಿತ್ಯ ಪರಂಪರೆ ಇದೆ."
  ],
  kanglish: [
    "kannada naadu nudi matthu samskruthi athyantha sreemanthavaaddhu.",
    "sirigannadam gelge sirigannadam baalge endu kaviraajamaargakaaranu saariddhaane.",
    "kaayakave kailaasa endu basavannanavaru vachanagala moolaka saariddhaare.",
    "jnaanave belaku vidyeye maanavannige athi dhodda shreshta sampatthu.",
    "manassiddhare maarga parishramakke thakka prathiphala kanditha sigutthadhe.",
    "samayavu athyantha amoolyavaaddhu adhannu sadupayoga padisikolli.",
    "vidyeyinda vinaya vinayadinda arhake arhatheyinda sampatthu labhisutthadhe.",
    "elladaru iru enthadaru iru endendigu nee kannadavaagiru."
  ]
};

// Hindi Language Corpora (Devanagari Script & Hinglish Transliteration)
export const HINDI_TEXTS = {
  native: [
    "सत्यमेव जयते नानृतं सत्येन पन्था विततो देवयानः।",
    "कर्म ही पूजा है निरंतर अभ्यास और लगन से ही सफलता मिलती है।",
    "जहाँ चाह है वहाँ राह है सच्ची मेहनत कभी व्यर्थ नहीं जाती।",
    "समय बहुत मूल्यवान है बीता हुआ पल कभी वापस नहीं आता।",
    "ज्ञान ही शक्ति है शिक्षा से ही समाज और राष्ट्र का विकास संभव है।",
    "सफलता का कोई सरल मार्ग नहीं होता कठिन परिश्रम ही उसका आधार है।",
    "विद्या ददाति विनयं विनयाद् याति पात्रताम् पात्रत्वाद् धनमाप्नोति।",
    "उद्यमेन हि सिध्यन्ति कार्याणि न मनोरथैः न हि सुप्तस्य सिंहस्य प्रविशन्ति मुखे मृगाः।"
  ],
  hinglish: [
    "karm hi pooja hai nirantar abhyas aur lagan se hi safalta milti hai.",
    "jahan chah hai wahan raah hai sachhi mehnat kabhi vyarth nahi jaati.",
    "samay bahut mulyavan hai beeta hua pal kabhi wapas nahi aata.",
    "safalta ka koi aasan rasta nahi hota kathin parishram hi ekmatra marg hai.",
    "gyan hi shakti hai shiksha se hi samaj aur rashtra ka vikas sambhav hai.",
    "satyamev jayate hamesha sach ki hi vijay hoti hai.",
    "koshish karne walon ki kabhi haar nahi hoti lahron se darr kar nauka paar nahi hoti.",
    "man ke jeete jeet hai man ke haare haar."
  ]
};

// Inspiring Famous Quotes
export const FAMOUS_QUOTES = [
  { text: "Simplicity is prerequisite for reliability.", author: "Edsger W. Dijkstra", length: "short" },
  { text: "Premature optimization is the root of all evil.", author: "Donald Knuth", length: "short" },
  { text: "Talk is cheap. Show me the code.", author: "Linus Torvalds", length: "short" },
  { text: "First, solve the problem. Then, write the code.", author: "John Johnson", length: "short" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", length: "short" },
  { text: "Arise, awake, and stop not until the goal is reached.", author: "Swami Vivekananda", length: "short" },
  { text: "You have to dream before your dreams can come true.", author: "A. P. J. Abdul Kalam", length: "medium" },
  { text: "Imagination is more important than knowledge. Knowledge is limited. Imagination encircles the world.", author: "Albert Einstein", length: "medium" },
  { text: "We can only see a short distance ahead, but we can see plenty there that needs to be done.", author: "Alan Turing", length: "medium" },
  { text: "I would rather have questions that cannot be answered than answers that cannot be questioned.", author: "Richard Feynman", length: "medium" },
  { text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.", author: "Martin Fowler", length: "medium" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", length: "medium" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle", length: "short" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", length: "medium" },
  { text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry", length: "long" },
  { text: "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.", author: "Buddha", length: "medium" }
];

function getRandom(arr) {
  if (!arr || arr.length === 0) return "";
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getRandomWordsArray(count = 25) {
  const words = [];
  for (let i = 0; i < count; i++) {
    words.push(getRandom(COMMON_WORDS));
  }
  return words;
}

export function getRandomWords(count = 25) {
  return getRandomWordsArray(count).join(" ");
}

export function getTextForTest(mode = "time", options = {}) {
  switch (mode) {
    case "paragraph": {
      const lengthKey = options.paragraphLength || "medium";
      const pool = PARAGRAPHS[lengthKey] || PARAGRAPHS.medium;
      return { text: getRandom(pool), author: null };
    }
    case "code": {
      const langKey = options.codeLang || "javascript";
      const pool = CODE_SNIPPETS[langKey] || CODE_SNIPPETS.javascript;
      return { text: getRandom(pool), author: null };
    }
    case "kannada": {
      const subType = options.kannadaType || "native";
      const pool = KANNADA_TEXTS[subType] || KANNADA_TEXTS.native;
      return { text: getRandom(pool), author: null };
    }
    case "hindi": {
      const subType = options.hindiType || "native";
      const pool = HINDI_TEXTS[subType] || HINDI_TEXTS.native;
      return { text: getRandom(pool), author: null };
    }
    case "quote": {
      const quotePool = options.quoteLength && options.quoteLength !== "all"
        ? FAMOUS_QUOTES.filter(q => q.length === options.quoteLength)
        : FAMOUS_QUOTES;
      const selected = getRandom(quotePool.length > 0 ? quotePool : FAMOUS_QUOTES);
      return {
        text: selected ? selected.text : "Stay hungry, stay foolish.",
        author: selected ? selected.author : "Steve Jobs"
      };
    }
    case "words": {
      return { text: getRandomWords(options.wordCount || 25), author: null };
    }
    case "time":
    default: {
      return { text: getRandomWords(100), author: null };
    }
  }
}
