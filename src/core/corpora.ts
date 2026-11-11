// Santypes Multilingual & Specialized Corpora Engine
// 100% Framework-Free Pure TypeScript

import { TypingMode, LanguageCode } from './types.ts';

// Anti-repeat history ring buffer
const recentPicks = new Map<string, number[]>();

export function randomOf<T>(array: T[], cacheKeyPrefix: string = 'default'): T {
  if (!array || array.length === 0) {
    return ('' as unknown as T);
  }
  if (array.length === 1) return array[0];

  const key = `${cacheKeyPrefix}:${array.length}`;
  if (!recentPicks.has(key)) {
    recentPicks.set(key, []);
  }

  const history = recentPicks.get(key)!;
  const maxHistory = Math.min(history.length, Math.floor(array.length / 2));
  const recent = history.slice(-maxHistory);

  let candidateIndices = array.map((_, i) => i).filter(i => !recent.includes(i));
  if (candidateIndices.length === 0) {
    candidateIndices = array.map((_, i) => i);
  }

  const chosenIndex = candidateIndices[Math.floor(Math.random() * candidateIndices.length)];
  history.push(chosenIndex);
  if (history.length > 5) history.shift();

  return array[chosenIndex];
}

export const COMMON_WORDS = [
  'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it',
  'that', 'for', 'they', 'with', 'as', 'not', 'on', 'she', 'at', 'by',
  'this', 'we', 'you', 'do', 'but', 'his', 'from', 'they', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
  'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go',
  'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
  'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see',
  'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well',
  'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most',
  'us', 'great', 'between', 'need', 'large', 'under', 'never', 'start', 'city', 'earth',
  'eyes', 'light', 'thought', 'head', 'story', 'saw', 'far', 'sea', 'draw',
  'left', 'late', 'run', 'while', 'press', 'close', 'night', 'real', 'life',
  'few', 'stop', 'open', 'seem', 'together', 'next', 'white', 'children', 'begin', 'got',
  'walk', 'example', 'ease', 'paper', 'group', 'always', 'music', 'those', 'both', 'mark',
  'often', 'letter', 'until', 'mile', 'river', 'car', 'feet', 'care', 'second', 'book',
  'carry', 'took', 'science', 'eat', 'room', 'friend', 'began', 'idea', 'fish', 'mountain',
  'north', 'once', 'base', 'hear', 'horse', 'cut', 'sure', 'watch', 'color', 'face',
  'wood', 'main', 'enough', 'plain', 'girl', 'usual', 'young', 'ready', 'above', 'ever',
  'red', 'list', 'though', 'feel', 'talk', 'bird', 'soon', 'body', 'dog', 'family',
  'direct', 'pose', 'leave', 'song', 'measure', 'door', 'product', 'black', 'short', 'numeral',
  'class', 'wind', 'question', 'happen', 'complete', 'ship', 'area', 'half', 'rock', 'order',
  'fire', 'south', 'problem', 'piece', 'told', 'knew', 'pass', 'since', 'top', 'whole',
  'king', 'space', 'heard', 'best', 'hour', 'better', 'true', 'during', 'hundred', 'five',
  'remember', 'step', 'early', 'hold', 'west', 'ground', 'interest', 'reach', 'fast', 'verb',
  'sing', 'listen', 'six', 'table', 'travel', 'less', 'morning', 'ten', 'simple', 'several'
];

export const PARAGRAPHS = [
  'The art of touch typing is not merely about mechanical finger speed, but the flow of thought directly onto the digital canvas. When muscle memory takes over, the keyboard ceases to be a barrier and becomes a natural extension of human consciousness.',
  'Sunlight filtered through the canopy of the ancient forest, casting dappled shadows on the emerald moss beneath. Each breath of morning air carried the crisp fragrance of cedar and damp earth, awakening the quiet wilderness from slumber.',
  'Deep beneath the ocean surface lies a realm untouched by sunlight, illuminated only by the faint bioluminescent glow of strange deep-sea creatures. Here, tectonic vents spew superheated mineral clouds into the freezing abyss.',
  'Throughout history, the evolution of human communication has dictated the velocity of civilization. From primitive cuneiform clay tablets pressed in ancient Sumer to the Gutenberg printing press, each leap forward decentralized ideas.',
  'The principles of deliberate practice suggest that mere repetition without mindful feedback yields rapid plateaus. To transcend automaticity, one must identify precise micro-weaknesses and intentionally push beyond comfort zones.',
  'Mechanical keyboards derive their tactile superiority from discrete physical switches housed underneath individual keycaps. Whether utilizing clicky leaf springs, tactile bumps, or linear stems, each mechanism delivers instantaneous kinesthetic confirmation.',
  'In the field of neuroscience, motor skill acquisition relies upon the progressive myelination of axonal pathways connecting the motor cortex to the extremities. As repetitive sequences are executed with pristine accuracy, neural conduction velocity multiplies dramatically.',
  'Telescopes deployed in deep space peer across billions of light years into the cosmic past. Light originating from the earliest stellar nurseries journeys across vast expanding voids before being focused onto ultra-cold infrared sensor arrays.',
  'Distributed consensus algorithms allow vast clusters of independent servers to agree upon a single timeline of state transitions despite erratic network latency and machine failure. Through protocols like Raft and Paxos, distributed databases guarantee resilient data consistency.',
  'Modern microprocessors execute billions of discrete instructions each second by organizing silicon logic into pipelined stages. When conditional branches cannot be immediately resolved, speculative branch predictors forecast outcomes with astonishing accuracy.',
  'The ancient library of Alexandria stood as a monumental beacon of Mediterranean scholarship, gathering papyrus scrolls spanning astronomy, medicine, and geometry. Its legacy reminds humanity that the preservation of collective wisdom demands relentless vigilance.',
  'Acoustic resonance in wooden stringed instruments depends on the meticulous carving of the soundboard and the velocity of sound waves propagating through seasoned spruce. Every millimeter of thickness variation subtly shifts the harmonic spectrum.',
  'High-voltage direct current transmission lines carry gigawatts of renewable energy across thousands of kilometers with negligible resistance losses compared to alternating current, linking remote wind farms directly to bustling coastal metropolises.',
  'Quantum computing exploits the counterintuitive principles of superposition and quantum entanglement to evaluate vast combinatoric state spaces simultaneously, unlocking algorithmic speedups for molecular simulation and post-quantum cryptography.',
  'The human cardiovascular system is an engineering marvel capable of circulating five liters of blood through sixty thousand miles of vessels every sixty seconds, constantly balancing oxygen saturation and core thermodynamic equilibrium.',
  'Typography is the subtle craft of orchestrating black marks upon white negative space so that written language speaks with measured cadence and clear voice. Kerning, tracking, and leading work in quiet harmony.',
  'Glaciers carve deep amphitheater valleys into granite peaks over millennia through the sheer gravitational weight of compressed snow and steady subglacial abrasion, sculpting majestic fjords that outlast empires.',
  'The architectural philosophy of minimalism emphasizes the elimination of superfluous decoration so that fundamental structure, proportion, and natural light can speak with clarity and uncompromising honesty.',
  'Deep neural networks learn complex hierarchical representations by adjusting millions of numerical weights through backpropagation and gradient descent, discovering latent mathematical manifolds hidden within unstructured data.',
  'Biological enzyme catalysis accelerates chemical reactions by factors exceeding millions without being consumed, meticulously positioning reactive substrates within hydrophobic active sites.',
  'Aerospace engineers design supersonic airfoils that carefully manage transonic shockwave formation, preventing turbulent boundary layer separation and maintaining aerodynamic control at the boundary of sound.',
  'The history of cryptographic ciphers reflects an eternal intellectual duel between code makers and code breakers, evolving from simple substitution alphabets to mathematical trapdoor one-way functions.',
  'Photosynthesis represents the planet primary thermodynamic bridge, converting solar photons into chemical bonds of glucose while releasing the breathable oxygen that sustains terrestrial biology.',
  'In competitive racing, vehicle balance depends upon trail braking and weight transfer across the tire contact patches during high-speed corner entry, seeking the exact threshold between friction and drift.',
  'Cognitive focus behaves like an elastic reserve: prolonged context switching dissipates mental momentum, whereas sustained immersion in a singular challenge induces flow states characterized by peak creative output.',
  'The James Webb Space Telescope orbits the second Sun-Earth Lagrange point, unfolding a five-layer sunshield the size of a tennis court to maintain its gold-coated beryllium primary mirrors at cryogenic temperatures.',
  'Volcanic archipelagos emerge from the open sea when mantle plumes burn through oceanic lithosphere, slowly generating biodiversity hotspots through biological colonization and adaptive radiation.',
  'Compiler optimization transforms high-level human abstractions into relentless machine code through register allocation, loop unrolling, dead code elimination, and vectorized SIMD instructions.',
  'The Apollo Guidance Computer achieved lunar landing with less than four kilobytes of magnetic core memory, relying on priority interrupt scheduling and heroic software design to navigate humanity to the lunar surface.',
  'Patience is the foundation of genuine virtuosity. Rapid progress is often an illusion born of shallow shortcuts, whereas patient, deliberate mastery builds foundations that can never be shaken.'
];

export const STORIES = [
  'The old lighthouse keeper climbed the spiral iron stairs as dusk settled over the jagged cliffs. Wind howled through the lantern room, but his routine remained unwavering. He lit the brass lamp, watched the beam slice through the gathering fog, and knew that vessels miles out at sea were guided safely home.',
  'Dr. Elena Vance adjusted the frequency dial on the radio telescope receiver. At precisely 03:14 UTC, a rhythmic pattern pulsed across the spectrogram. It was not stellar noise or solar flare interference. Somewhere across twenty light years, an artificial transmitter was beaconing into the void.',
  'The train rattled across the snowbound mountain pass, its steam whistling against the frozen gorge. Inside the dining carriage, passengers exchanged stories of forgotten towns and distant ports, bound together by the rhythm of the rails.'
];

export const BOOKS = [
  'It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of light, it was the season of darkness, it was the spring of hope, it was the winter of despair.',
  'Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.',
  'In my younger and more vulnerable years my father gave me some advice that I have been turning over in my mind ever since. Whenever you feel like criticizing anyone, he told me, just remember that all the people in this world have not had the advantages that you have had.'
];

export const QUOTES = [
  { text: 'Simplicity is prerequisite for reliability.', author: 'Edsger W. Dijkstra' },
  { text: 'Premature optimization is the root of all evil.', author: 'Donald Knuth' },
  { text: 'Programs must be written for people to read, and only incidentally for machines to execute.', author: 'Harold Abelson' },
  { text: 'Any fool can write code that a computer can understand. Good programmers write code that humans can understand.', author: 'Martin Fowler' },
  { text: 'Truth can only be found in one place: the code.', author: 'Robert C. Martin' },
  { text: 'Make it work, make it right, make it fast.', author: 'Kent Beck' },
  { text: 'Knowledge is power.', author: 'Francis Bacon' },
  { text: 'Stay hungry, stay foolish.', author: 'Stewart Brand' },
  { text: 'Talk is cheap. Show me the code.', author: 'Linus Torvalds' },
  { text: 'The function of good software is to make the complex appear simple.', author: 'Grady Booch' },
  { text: 'First, solve the problem. Then, write the code.', author: 'John Johnson' },
  { text: 'Experience is the name everyone gives to their mistakes.', author: 'Oscar Wilde' },
  { text: 'In programming the hard part is not solving problems, but deciding what problems to solve.', author: 'Paul Graham' },
  { text: 'Good code is its own best documentation.', author: 'Steve McConnell' },
  { text: 'The only way to go fast is to go well.', author: 'Robert C. Martin' },
  { text: 'Measuring programming progress by lines of code is like measuring aircraft building progress by weight.', author: 'Bill Gates' },
  { text: 'There are two hard things in Computer Science: cache invalidation and naming things.', author: 'Phil Karlton' },
  { text: 'Complexity is your enemy. Any fool can make something complicated. It is hard to keep things simple.', author: 'Richard Branson' },
  { text: 'Before software can be reusable it first has to be usable.', author: 'Ralph Johnson' },
  { text: 'It is not enough for code to work. It must be clean, elegant, and maintainable.', author: 'Michael Feathers' },
  { text: 'The most dangerous phrase in the language is: We have always done it this way.', author: 'Grace Hopper' },
  { text: 'You can have data without information, but you cannot have information without data.', author: 'Daniel Keys Moran' },
  { text: 'Focus is a muscle. The more you practice single-tasking, the sharper your mind becomes.', author: 'Cal Newport' },
  { text: 'Speed will follow accuracy, but accuracy never follows speed.', author: 'Typographic Principle' },
  { text: 'Somewhere, something incredible is waiting to be known.', author: 'Carl Sagan' },
  { text: 'Science is what we understand well enough to explain to a computer. Art is everything else we do.', author: 'Donald Knuth' },
  { text: 'The Cosmos is all that is or was or ever will be.', author: 'Carl Sagan' },
  { text: 'I would rather have questions that cannot be answered than answers that cannot be questioned.', author: 'Richard Feynman' },
  { text: 'Imagination is more important than knowledge.', author: 'Albert Einstein' },
  { text: 'Nothing in life is to be feared, it is only to be understood.', author: 'Marie Curie' },
  { text: 'Look up at the stars and not down at your feet.', author: 'Stephen Hawking' },
  { text: 'The mind is not a vessel to be filled, but a fire to be kindled.', author: 'Plutarch' },
  { text: 'Waste no more time arguing what a good man should be. Be one.', author: 'Marcus Aurelius' },
  { text: 'We suffer more often in imagination than in reality.', author: 'Seneca' },
  { text: 'It is not that we have a short time to live, but that we waste a lot of it.', author: 'Seneca' },
  { text: 'Do not go where the path may lead, go instead where there is no path and leave a trail.', author: 'Ralph Waldo Emerson' },
  { text: 'Simplicity is about subtracting the obvious and adding the meaningful.', author: 'John Maeda' },
  { text: 'Design is not just what it looks like and feels like. Design is how it works.', author: 'Steve Jobs' },
  { text: 'Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.', author: 'Antoine de Saint-Exupery' },
  { text: 'Typographic elegance is found in the calm space between letters.', author: 'Robert Bringhurst' },
  { text: 'Details make perfection, and perfection is not a detail.', author: 'Leonardo da Vinci' },
  { text: 'The secret of getting ahead is getting started.', author: 'Mark Twain' },
  { text: 'Continuous improvement is better than delayed perfection.', author: 'Mark Twain' },
  { text: 'Action is the foundational key to all success.', author: 'Pablo Picasso' },
  { text: 'The master has failed more times than the beginner has even tried.', author: 'Stephen McCranie' },
  { text: 'Rhythm is the architecture of motion, whether in music, dance, or typing.', author: 'Typing Mastery' },
  { text: 'Velocity comes effortlessly when precision becomes second nature.', author: 'Zen of Typing' },
  { text: 'A smooth sea never made a skilled sailor.', author: 'Franklin D. Roosevelt' },
  { text: 'Everything should be made as simple as possible, but not simpler.', author: 'Albert Einstein' },
  { text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' }
];

export const CODE_SNIPPETS = [
  'function calculateMovingAverage(data, windowSize) { return data.slice(windowSize - 1).map((_, i) => data.slice(i, i + windowSize).reduce((a, b) => a + b, 0) / windowSize); }',
  'const observer = new IntersectionObserver((entries) => { entries.forEach(entry => entry.isIntersecting && entry.target.classList.add("visible")); });',
  'async function fetchData(url, retries = 3) { for (let i = 0; i < retries; i++) { try { const r = await fetch(url); if (r.ok) return await r.json(); } catch (e) { if (i === retries - 1) throw e; } } }',
  'int *ptr = (int *)malloc(sizeof(int) * 64); if (!ptr) return -1; memset(ptr, 0, sizeof(int) * 64); free(ptr);',
  'def binary_search(arr, target): low, high = 0, len(arr) - 1\nwhile low <= high:\n    mid = (low + high) // 2\n    if arr[mid] == target: return mid\n    elif arr[mid] < target: low = mid + 1\n    else: high = mid - 1\nreturn -1',
  'export function debounce(fn, delay) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); }; }',
  'const memoize = (fn) => { const cache = new Map(); return (arg) => { if (cache.has(arg)) return cache.get(arg); const res = fn(arg); cache.set(arg, res); return res; }; };',
  'pub fn quick_sort<T: Ord>(slice: &mut [T]) { if slice.len() <= 1 { return; } let pivot = partition(slice); let (left, right) = slice.split_at_mut(pivot); quick_sort(left); quick_sort(&mut right[1..]); }',
  'func worker(id int, jobs <-chan int, results chan<- int) { for j := range jobs { results <- j * 2 } }',
  'SELECT u.id, u.username, COUNT(o.id) AS total_orders, SUM(o.amount) AS total_spent FROM users u LEFT JOIN orders o ON u.id = o.user_id GROUP BY u.id, u.username HAVING total_spent > 500 ORDER BY total_spent DESC;',
  'class EventEmitter { constructor() { this.events = new Map(); } on(name, cb) { if (!this.events.has(name)) this.events.set(name, []); this.events.get(name).push(cb); } emit(name, data) { (this.events.get(name) || []).forEach(cb => cb(data)); } }',
  'def quicksort(arr): return arr if len(arr) <= 1 else quicksort([x for x in arr[1:] if x <= arr[0]]) + [arr[0]] + quicksort([x for x in arr[1:] if x > arr[0]])',
  'WITH ranked_scores AS ( SELECT player_id, score, DENSE_RANK() OVER (PARTITION BY game_id ORDER BY score DESC) as rank_pos FROM leaderboard ) SELECT * FROM ranked_scores WHERE rank_pos <= 3;',
  'fn find_first_duplicate(items: &[i32]) -> Option<i32> { let mut seen = std::collections::HashSet::new(); for &item in items { if !seen.insert(item) { return Some(item); } } None }',
  'const pipeline = (...fns) => (init) => fns.reduce((acc, fn) => fn(acc), init);',
  'def fibonacci_generator(limit: int): a, b = 0, 1\nwhile a < limit:\n    yield a\n    a, b = b, a + b',
  'const deepClone = (obj) => structuredClone ? structuredClone(obj) : JSON.parse(JSON.stringify(obj));',
  'int partition(int arr[], int low, int high) { int pivot = arr[high], i = (low - 1); for (int j = low; j < high; j++) { if (arr[j] < pivot) { i++; int t = arr[i]; arr[i] = arr[j]; arr[j] = t; } } int t = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = t; return (i + 1); }',
  'type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };',
  'async function* streamReader(response) { const reader = response.body.getReader(); const decoder = new TextDecoder(); while (true) { const { done, value } = await reader.read(); if (done) break; yield decoder.decode(value); } }',
  'fn dot_product(v1: &[f64], v2: &[f64]) -> f64 { v1.iter().zip(v2.iter()).map(|(a, b)| a * b).sum() }',
  'SELECT DATE_TRUNC(\'month\', created_at) AS sale_month, COUNT(*) AS count, AVG(revenue) AS avg_rev FROM transactions GROUP BY sale_month ORDER BY sale_month DESC LIMIT 12;',
  'const clamp = (val, min, max) => Math.min(Math.max(val, min), max);',
  'def retry(attempts=3, delay=1.0): def decorator(func): def wrapper(*args, **kwargs): for i in range(attempts): try: return func(*args, **kwargs) except Exception: if i == attempts - 1: raise\n        return wrapper\n    return decorator',
  'const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));',
  'struct Point { x: f32, y: f32 } impl Point { fn distance(&self, other: &Point) -> f32 { ((self.x - other.x).powi(2) + (self.y - other.y).powi(2)).sqrt() } }',
  'def merge_sort(nums): if len(nums) <= 1: return nums\nmid = len(nums) // 2\nleft, right = merge_sort(nums[:mid]), merge_sort(nums[mid:])\nreturn merge(left, right)',
  'const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));',
  'CREATE INDEX idx_user_email_active ON users (email) WHERE is_active = true;',
  'pub enum OptionTree<T> { Leaf(T), Node(Vec<OptionTree<T>>) }',
  'const uniqueBy = (arr, keyFn) => Array.from(new Map(arr.map(item => [keyFn(item), item])).values());',
  'int countSetBits(unsigned int n) { int count = 0; while (n) { count += n & 1; n >>= 1; } return count; }',
  'const shuffle = (array) => { const arr = [...array]; for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };',
  'def is_palindrome(s: str) -> bool: cleaned = [c.lower() for c in s if c.isalnum()]\nreturn cleaned == cleaned[::-1]',
  'const hexToRgb = (hex) => { const n = parseInt(hex.replace(\'#\', \'\'), 16); return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }; };'
];

export const KANNADA_TEXTS = {
  native: [
    'ಕನ್ನಡ ನಾಡು ನುಡಿ ಮತ್ತು ಸಂಸ್ಕೃತಿ ಅತ್ಯಂತ ಶ್ರೀಮಂತ ಹಾಗೂ ಪ್ರಾಚೀನವಾದದ್ದು.',
    'ಸಿರಿಗನ್ನಡಂ ಗೆಲ್ಗೆ ಸಿರಿಗನ್ನಡಂ ಬಾಳ್ಗೆ ಎಂದು ಕವಿರಾಜಮಾರ್ಗಕಾರನು ಸಾರಿದ್ದಾನೆ.',
    'ಜ್ಞಾನವೇ ಬೆಳಕು ವಿದ್ಯೆಯೇ ಮಾನವನಿಗೆ ಅತಿ ದೊಡ್ಡ ಶ್ರೇಷ್ಠ ಸಂಪತ್ತು.',
    'ಕಾಯಕವೇ ಕೈಲಾಸ ಎಂದು ಬಸವಣ್ಣನವರು ತಮ್ಮ ವಚನಗಳ ಮೂಲಕ ಜಗತ್ತಿಗೆ ಸಾರಿದ್ದಾರೆ.',
    'ಮನಸ್ಸಿದ್ದರೆ ಮಾರ್ಗ ಪರಿಶ್ರಮಕ್ಕೆ ತಕ್ಕ ಪ್ರತಿಫಲ ಖಂಡಿತವಾಗಿಯೂ ಸಿಗುತ್ತದೆ.',
    'ಸಮಯವು ಅತ್ಯಂತ ಅಮೂಲ್ಯವಾದದ್ದು ಅದನ್ನು ಸದುಪಯೋಗ ಪಡಿಸಿಕೊಳ್ಳಿ.'
  ],
  kanglish: [
    'kannada naadu nudi matthu samskruthi athyantha sreemanthavaaddhu.',
    'sirigannadam gelge sirigannadam baalge endu kaviraajamaargakaaranu saariddhaane.',
    'kaayakave kailaasa endu basavannanavaru vachanagala moolaka saariddhaare.',
    'jnaanave belaku vidyeye maanavannige athi dhodda shreshta sampatthu.',
    'manassiddhare maarga parishramakke thakka prathiphala kanditha sigutthadhe.'
  ]
};

export const HINDI_TEXTS = {
  native: [
    'सफलता का कोई संक्षिप्त मार्ग नहीं होता, यह केवल कठिन परिश्रम और अनुशासन से प्राप्त होती है।',
    'ज्ञान ही वह शक्ति है जो मनुष्य को अज्ञान के अंधकार से प्रकाश की ओर ले जाती है।',
    'समय और धैर्य वे दो शक्तिशाली योद्धा हैं जो हर परिस्थिति को बदल सकते हैं।',
    'सत्य और अहिंसा ही मानव जीवन के सबसे बड़े मार्गदर्शक सिद्धांत हैं।',
    'कर्म ही पूजा है और निरंतर अभ्यास ही पूर्णता का रहस्य है।'
  ],
  hinglish: [
    'safalta ka koi aasan raasta nahi hota, yeh keval kathin parishram se milti hai.',
    'gyan hi wo shakti hai jo manushya ko andhkaar se prakash ki aur le jaati hai.',
    'samay aur dhairya do sabse shaktishali hathiyar hain.',
    'karm hi pooja hai aur lagataar abhyas hi safalta ki kunji hai.'
  ]
};

/**
 * Generate procedural numbers drills.
 */
export function generateNumbersText(count: number = 30): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if (r < 0.3) {
      words.push(String(Math.floor(Math.random() * 9000 + 1000)));
    } else if (r < 0.6) {
      words.push(String(Math.floor(Math.random() * 900 + 100)));
    } else if (r < 0.85) {
      words.push((Math.random() * 100).toFixed(2));
    } else {
      words.push(`${Math.floor(Math.random() * 90 + 10)}-${Math.floor(Math.random() * 900 + 100)}`);
    }
  }
  return words.join(' ');
}

/**
 * Generate procedural punctuation drills.
 */
export function generatePunctuationText(count: number = 25): string {
  const baseWords = COMMON_WORDS.slice(0, 100);
  const words: string[] = [];
  const punctuationSets = [
    (w: string) => `"${w}"`,
    (w: string) => `(${w})`,
    (w: string) => `[${w}]`,
    (w: string) => `{${w}}`,
    (w: string) => `${w};`,
    (w: string) => `${w}:`,
    (w: string) => `${w}?`,
    (w: string) => `${w}!`,
    (w: string) => `${w},`,
    (w: string) => `${w}...`,
    (w: string) => `${w}-oriented`,
    (w: string) => `${w}_test`,
  ];

  for (let i = 0; i < count; i++) {
    const word = randomOf(baseWords, 'punct_word');
    const wrap = randomOf(punctuationSets, 'punct_wrap');
    words.push(wrap(word));
  }
  return words.join(' ');
}

/**
 * Generate procedural mixed alphanumeric text.
 */
export function generateMixedText(count: number = 25): string {
  const words: string[] = [];
  const baseWords = COMMON_WORDS.slice(0, 80);
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    if (r < 0.4) {
      const w = randomOf(baseWords, 'mixed_word');
      words.push(r < 0.2 ? `${w}${Math.floor(Math.random() * 99)}` : `${w}!`);
    } else if (r < 0.7) {
      words.push(String(Math.floor(Math.random() * 9000 + 1000)));
    } else {
      const codeTokens = ['const', 'let', 'val=42;', '#include', 'print(x)', 'array[0]'];
      words.push(randomOf(codeTokens, 'mixed_code'));
    }
  }
  return words.join(' ');
}

/**
 * Procedural random word stream generator for infinite replenishment.
 * Language-aware so Kannada and Hindi time tests do not revert to English.
 */
export function getRandomWordsArray(
  count: number = 40,
  lang: LanguageCode = 'en',
  scriptType?: string
): string[] {
  if (lang === 'kn') {
    const list = scriptType === 'kanglish' ? KANNADA_TEXTS.kanglish : KANNADA_TEXTS.native;
    const allWords = (list || []).join(' ').split(/\s+/).filter(Boolean);
    const pool = allWords.length > 0 ? allWords : ['ಕನ್ನಡ', 'ಬೆರಳಚ್ಚು', 'ಅಭ್ಯಾಸ'];
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(randomOf(pool, 'kn_stream'));
    }
    return result;
  }
  if (lang === 'hi') {
    const list = scriptType === 'hinglish' ? HINDI_TEXTS.hinglish : HINDI_TEXTS.native;
    const allWords = (list || []).join(' ').split(/\s+/).filter(Boolean);
    const pool = allWords.length > 0 ? allWords : ['हिन्दी', 'टाइपिंग', 'अभ्यास'];
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      result.push(randomOf(pool, 'hi_stream'));
    }
    return result;
  }
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(randomOf(COMMON_WORDS, 'stream'));
  }
  return result;
}

/**
 * Assemble adaptive text targeting user's historical weak keys.
 */
export function buildAdaptiveText(
  weakKeys: Array<{ key: string }>,
  _lang: LanguageCode = 'en'
): string {
  const topKeys = (Array.isArray(weakKeys) ? weakKeys : []).slice(0, 5).map(k => k?.key).filter(Boolean);
  if (topKeys.length === 0) {
    return 'Focus on smooth pacing and clean finger rhythm. Accuracy naturally creates high velocity over time.';
  }

  const focusKeysDrill = Array.from({ length: 16 }, (_, i) => topKeys[i % topKeys.length]).join(' ');
  const homeRowAnchors = ['asdf', 'jkl;', 'fade', 'lake', 'flask', 'dash', 'sled', 'half'];
  const drillWords: string[] = [];

  for (let i = 0; i < 20; i++) {
    const key = topKeys[i % topKeys.length];
    const anchor = randomOf(homeRowAnchors, 'adaptive_anchor');
    drillWords.push(`${anchor}${key}`);
  }

  return `Focus keys: ${focusKeysDrill}. Practice calmly: ${drillWords.join(' ')}`;
}

export interface GetTextOptions {
  lang?: LanguageCode;
  wordCount?: number;
  customText?: string;
  weakKeys?: Array<{ key: string }>;
  kannadaType?: 'native' | 'kanglish';
  hindiType?: 'native' | 'hinglish';
}

/**
 * Universal dispatcher selecting text for all 12 modes.
 */
export function getTextForMode(
  mode: TypingMode,
  options: GetTextOptions = {}
): { text: string; author?: string } {
  const lang = options.lang || 'en';

  if (lang === 'kn') {
    const list = options.kannadaType === 'kanglish' ? KANNADA_TEXTS.kanglish : KANNADA_TEXTS.native;
    const text = list && list.length > 0 ? randomOf(list, 'kannada') : 'ಕನ್ನಡ ಬೆರಳಚ್ಚು ಅಭ್ಯಾಸ.';
    return { text };
  }

  if (lang === 'hi') {
    const list = options.hindiType === 'hinglish' ? HINDI_TEXTS.hinglish : HINDI_TEXTS.native;
    const text = list && list.length > 0 ? randomOf(list, 'hindi') : 'हिन्दी टाइपिंग अभ्यास।';
    return { text };
  }

  switch (mode) {
    case 'time':
    case 'words': {
      const count = options.wordCount && options.wordCount > 0 ? options.wordCount : 40;
      return { text: getRandomWordsArray(count).join(' ') };
    }
    case 'quote': {
      const quote = randomOf(QUOTES, 'quote');
      return { text: quote.text, author: quote.author };
    }
    case 'paragraph':
      return { text: randomOf(PARAGRAPHS, 'paragraph') };
    case 'story':
      return { text: randomOf(STORIES, 'story') };
    case 'book':
      return { text: randomOf(BOOKS, 'book') };
    case 'code':
      return { text: randomOf(CODE_SNIPPETS, 'code') };
    case 'numbers':
      return { text: generateNumbersText(options.wordCount || 35) };
    case 'punctuation':
      return { text: generatePunctuationText(options.wordCount || 30) };
    case 'mixed':
      return { text: generateMixedText(options.wordCount || 30) };
    case 'custom':
      return {
        text: (options.customText && options.customText.trim()) || 'The quick brown fox jumps over the lazy dog.'
      };
    case 'ai':
      return { text: buildAdaptiveText(options.weakKeys || [], lang) };
    default:
      return { text: getRandomWordsArray(30).join(' ') };
  }
}
