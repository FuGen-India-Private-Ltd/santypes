// Santypes Structured Touch-Typing Curriculum Data
// 6 Progressive Phases, 24 Chapters, isolated drills, finger mastery, and real-world code/prose

export interface ChapterDefinition {
  id: string;
  title: string;
  keys: string[];
  goal: string;
  tips: string;
  text: string;
  wpmTarget: number;
  accTarget: number;
  mode?: string;
}

export interface PhaseDefinition {
  phase: number;
  title: string;
  desc: string;
  chapters: ChapterDefinition[];
}

export const CURRICULUM_PHASES: PhaseDefinition[] = [
  {
    phase: 1,
    title: "Phase 1: Absolute Beginner Isolation",
    desc: "Single key isolation drills. Build muscle memory one finger at a time.",
    chapters: [
      {
        id: "p1c1",
        title: "Index F & J Isolation",
        keys: ["f", "j"],
        goal: "Feel for the tactile home bumps on F and J and tap them lightly.",
        tips: "Locate the tactile bumps. Left index finger rests on F, right index on J. Tap in a steady, comfortable cadence.",
        text: "ffff jjjj ffff jjjj ff jj ff jj fff jjj ffff jjjj fff jjj ff jj f j f j",
        wpmTarget: 10,
        accTarget: 90,
      },
      {
        id: "p1c2",
        title: "Middle D & K Isolation",
        keys: ["d", "k"],
        goal: "Tap middle finger keys D and K independently without lifting hands.",
        tips: "Keep wrists elevated. Left middle finger on D, right middle on K. Do not rest wrists flat on the desk.",
        text: "dddd kkkk dddd kkkk dd kk dd kk ddd kkk dddd kkkk ddd kkk dd kk d k d k",
        wpmTarget: 10,
        accTarget: 90,
      },
      {
        id: "p1c3",
        title: "Ring S & L Isolation",
        keys: ["s", "l"],
        goal: "Develop independent finger control over the ring fingers on S and L.",
        tips: "Ring fingers are biologically linked to middle fingers. Take your time — accuracy builds tendon independence.",
        text: "ssss llll ssss llll ss ll ss ll sss lll ssss llll sss lll ss ll s l s l",
        wpmTarget: 12,
        accTarget: 92,
      },
      {
        id: "p1c4",
        title: "Pinky A & Semicolon Isolation",
        keys: ["a", ";"],
        goal: "Strengthen pinky fingers on outer home keys A and semicolon.",
        tips: "Keep pinkies relaxed. Left pinky rests on A, right pinky on semicolon (;). Strike with the finger pad.",
        text: "aaaa ;;;; aaaa ;;;; aa ;; aa ;; aaa ;;; aaaa ;;;; aaa ;;; aa ;; a ; a ;",
        wpmTarget: 12,
        accTarget: 92,
      },
    ],
  },
  {
    phase: 2,
    title: "Phase 2: Home Row Mastery",
    desc: "Combine home row keys into pairs, triplets, and full 8-key words.",
    chapters: [
      {
        id: "p2c1",
        title: "Two-Key Alternation",
        keys: ["f", "j", "d", "k", "s", "l", "a", ";"],
        goal: "Alternate left and right hands in steady cadence.",
        tips: "Left, right, left, right. Establish a rhythmic tempo like walking feet.",
        text: "fj fj dk dk sl sl a; a; fjdk sl a; fj dk sl a; fjdksl a; fj dk sl a; fj",
        wpmTarget: 15,
        accTarget: 93,
      },
      {
        id: "p2c2",
        title: "Left Hand Home Row: ASDF",
        keys: ["a", "s", "d", "f"],
        goal: "Type left hand home row combinations effortlessly.",
        tips: "Keep fingers curled naturally over ASDF: Pinky A, ring S, middle D, index F.",
        text: "aaa sss ddd fff asd fda sad fad ads fas daf sdf fds asd sad dad fad all fall add ask",
        wpmTarget: 18,
        accTarget: 94,
      },
      {
        id: "p2c3",
        title: "Right Hand Home Row: JKL;",
        keys: ["j", "k", "l", ";"],
        goal: "Type right hand home row combinations smoothly.",
        tips: "Index J, middle K, ring L, pinky ;. Keep fingers anchored in home position.",
        text: "jjj kkk lll ;;; jkl ;lk kj jl lk jkl; lkj; jjk kll l;j klj ;lk jl kl jkl jk lj",
        wpmTarget: 18,
        accTarget: 94,
      },
      {
        id: "p2c4",
        title: "Full Home Row Words & Sentences",
        keys: ["a", "s", "d", "f", "j", "k", "l", ";"],
        goal: "Type full home row sentences without looking at the keyboard.",
        tips: "Accuracy first. 95% accuracy builds reliable, permanent muscle memory.",
        text: "ask dad a flask; fall as a lad; a sad dad asks a lad; a fall; a flask is a dad flask;",
        wpmTarget: 22,
        accTarget: 95,
      },
    ],
  },
  {
    phase: 3,
    title: "Phase 3: Top & Bottom Row Reaches",
    desc: "Reach upward to QWERTYUIOP and downward to ZXCVBNM.",
    chapters: [
      {
        id: "p3c1",
        title: "Top Row: E & I Reaches",
        keys: ["e", "i"],
        goal: "Reach left middle to E, right middle to I, then return to home row.",
        tips: "Reach and return. Move middle finger up to key, press, and immediately return to home position.",
        text: "deed kik; see fee die lie kid led red fed key see flee side idle feel seek knee",
        wpmTarget: 20,
        accTarget: 93,
      },
      {
        id: "p3c2",
        title: "Top Row: R & U Reaches",
        keys: ["r", "u"],
        goal: "Reach left index to R, right index to U.",
        tips: "Index extensions. F reaches up to R, J reaches up to U. Keep remaining fingers resting lightly.",
        text: "frf juj red run rue ear far fur rid rude dark fur sur rug fire user rider fur",
        wpmTarget: 22,
        accTarget: 93,
      },
      {
        id: "p3c3",
        title: "Top Row: Q, W, O, P Extensions",
        keys: ["q", "w", "o", "p"],
        goal: "Reach outer fingers up to top corners.",
        tips: "Pinky reaches up to Q and P; ring fingers reach up to W and O.",
        text: "quite power quote world paper slow quick proud prow quiet loop plow pour power",
        wpmTarget: 24,
        accTarget: 94,
      },
      {
        id: "p3c4",
        title: "Bottom Row: C & M Reaches",
        keys: ["c", "m"],
        goal: "Curl left middle down to C, right index down to M.",
        tips: "Curl the fingers downward underneath home position without shifting your whole hand.",
        text: "cat come mica calm claim mice camp mask mock came comb music climb match",
        wpmTarget: 24,
        accTarget: 94,
      },
      {
        id: "p3c5",
        title: "Bottom Row: Z, X, V, B, N Reaches",
        keys: ["z", "x", "v", "b", "n"],
        goal: "Master complete bottom row reaches with both hands.",
        tips: "Left pinky reaches Z, ring X, index V and B. Right index reaches N.",
        text: "zone zebra vex box vibe next ban van navy zero view next exam vine bone",
        wpmTarget: 25,
        accTarget: 94,
      },
      {
        id: "p3c6",
        title: "Full 26-Letter Alphabet Sentences",
        keys: [],
        goal: "Type full prose sentences using all 26 letters.",
        tips: "Keep your head up. Rely purely on muscle memory to locate every key position.",
        text: "the quick brown fox jumps over the lazy dog. pack my box with five dozen liquor jugs.",
        wpmTarget: 28,
        accTarget: 95,
      },
    ],
  },
  {
    phase: 4,
    title: "Phase 4: Numbers & Punctuation",
    desc: "Master top-row digits, shifts, and code/email symbols.",
    chapters: [
      {
        id: "p4c1",
        title: "Digits 1 - 5",
        keys: ["1", "2", "3", "4", "5"],
        goal: "Reach up from left hand home row to top number row.",
        tips: "Pinky 1, Ring 2, Middle 3, Index 4 & 5. Return to home row after every digit.",
        text: "11 22 33 44 55 12 34 51 23 45 123 451 234 512 345 11 22 33 44 55",
        wpmTarget: 20,
        accTarget: 90,
      },
      {
        id: "p4c2",
        title: "Digits 6 - 0",
        keys: ["6", "7", "8", "9", "0"],
        goal: "Reach up from right hand home row to numbers 6 through 0.",
        tips: "Index 6 & 7, Middle 8, Ring 9, Pinky 0. Keep right wrist elevated.",
        text: "66 77 88 99 00 67 89 06 78 90 678 906 789 012 345 678 900 67 89",
        wpmTarget: 20,
        accTarget: 90,
      },
      {
        id: "p4c3",
        title: "Basic Punctuation",
        keys: [",", ".", "?", "!"],
        goal: "Type commas, periods, question marks, and exclamation points effortlessly.",
        tips: "Hold shift with opposite hand for ? and !. Never look down to find punctuation.",
        text: "hello, world. how are you? amazing! yes, indeed. stop, look, and listen! ready?",
        wpmTarget: 25,
        accTarget: 92,
      },
      {
        id: "p4c4",
        title: "Email & Web Symbols",
        keys: ["@", ".", "_", "-"],
        goal: "Type email addresses and URL patterns smoothly.",
        tips: "Shift + 2 for @. Train @ and . as fast compound chords.",
        text: "contact@company.com user_name@domain.org info-test@site.net admin@server.io",
        wpmTarget: 28,
        accTarget: 93,
      },
    ],
  },
  {
    phase: 5,
    title: "Phase 5: Speed Ladder",
    desc: "Progressive speed checkpoints from 25 WPM to 60+ WPM.",
    chapters: [
      {
        id: "p5c1",
        title: "Speed Checkpoint: 25 WPM",
        keys: [],
        goal: "Maintain 25 WPM with 95% accuracy over continuous prose.",
        tips: "Rhythm is key. Smooth continuous typing beats bursts followed by corrections.",
        text: "focus on your posture and let your fingers glide smoothly over the keys without stopping.",
        wpmTarget: 25,
        accTarget: 95,
      },
      {
        id: "p5c2",
        title: "Speed Checkpoint: 35 WPM",
        keys: [],
        goal: "Reach 35 WPM on normal prose.",
        tips: "Look 2-3 words ahead. Anticipate next letter movements before fingers arrive.",
        text: "consistent daily practice is the fastest way to build unbreakable muscle memory.",
        wpmTarget: 35,
        accTarget: 95,
      },
      {
        id: "p5c3",
        title: "Speed Checkpoint: 45 WPM",
        keys: [],
        goal: "Cross the 45 WPM threshold.",
        tips: "Minimize pause intervals. Eliminate hesitation between word boundaries.",
        text: "great typists type whole words as single fluid motions rather than individual keypresses.",
        wpmTarget: 45,
        accTarget: 95,
      },
      {
        id: "p5c4",
        title: "Speed Checkpoint: 60 WPM",
        keys: [],
        goal: "Achieve professional 60 WPM speed.",
        tips: "Relaxed hands move faster. Tension in the forearms slows finger travel speed.",
        text: "at sixty words per minute you can write articles emails and code as fast as you can think.",
        wpmTarget: 60,
        accTarget: 96,
      },
    ],
  },
  {
    phase: 6,
    title: "Phase 6: Professional & Code",
    desc: "Real-world typing for software engineering, emails, and technical workflows.",
    chapters: [
      {
        id: "p6c1",
        title: "HTML & CSS Tags",
        keys: ["<", ">", "/", "="],
        goal: "Type HTML tags and CSS attributes fluently.",
        tips: "Angle brackets and slashes. Practice using right pinky for / and shifts for < and >.",
        text: '<div class="container"><h1 id="title">Hello World</h1><p>Welcome!</p></div>',
        wpmTarget: 30,
        accTarget: 90,
      },
      {
        id: "p6c2",
        title: "JavaScript Code Snippets",
        keys: ["{", "}", "(", ")", ";", "="],
        goal: "Type JavaScript functions and arrow syntax fluently.",
        tips: "Brackets and parens. Code typing requires extreme symbol accuracy.",
        text: 'const fetchData = async (url) => { const res = await fetch(url); return await res.json(); };',
        wpmTarget: 32,
        accTarget: 90,
      },
      {
        id: "p6c3",
        title: "Python Data Structures",
        keys: ["[", "]", ":", ","],
        goal: "Type Python lists, dicts, and list comprehensions.",
        tips: "Colons and square brackets. Keep finger home anchors stable.",
        text: 'def process_items(data: list) -> dict: return {item["id"]: item["val"] for item in data}',
        wpmTarget: 32,
        accTarget: 90,
      },
      {
        id: "p6c4",
        title: "Real-World Email Prose",
        keys: [],
        goal: "Type professional workplace emails at 45+ WPM.",
        tips: "Blend business language with high rhythm.",
        text: "Hi team, please review the latest pull request and submit your feedback before end of day. Thanks!",
        wpmTarget: 45,
        accTarget: 95,
      },
    ],
  },
];

export function getAllCurriculumChapters(): Array<ChapterDefinition & { phaseNum: number; phaseTitle: string }> {
  const result: Array<ChapterDefinition & { phaseNum: number; phaseTitle: string }> = [];
  for (const phase of CURRICULUM_PHASES) {
    for (const chap of phase.chapters) {
      result.push({
        ...chap,
        phaseNum: phase.phase,
        phaseTitle: phase.title,
      });
    }
  }
  return result;
}

export function getCurriculumChapterById(id: string): (ChapterDefinition & { phaseNum: number; phaseTitle: string }) | null {
  const all = getAllCurriculumChapters();
  return all.find(c => c.id === id) || null;
}
