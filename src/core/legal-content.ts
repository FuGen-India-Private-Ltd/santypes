// Santypes Shared FAQ & Terms of Use Content
// Single source of truth for interactive modals and compliance verification

export interface FaqItem {
  id: string;
  category: 'Typing & Metrics' | 'Privacy & Data' | 'Features & Shortcuts' | 'Security & Support';
  question: string;
  answer: string;
}

export interface TermsSection {
  id: string;
  title: string;
  body: string;
}

export const TERMS_VERSION = '2026-11';
export const TERMS_EFFECTIVE_DATE = 'November 11, 2026';

export const FAQ_ITEMS: readonly FaqItem[] = [
  {
    id: 'faq-wpm',
    category: 'Typing & Metrics',
    question: 'How does Santypes calculate Net WPM, Raw WPM, Accuracy, and Consistency?',
    answer:
      'Net WPM treats 5 correct characters as 1 standard word divided by elapsed minutes, excluding uncommitted/incorrect keystrokes from net speed. Raw WPM includes all typed keystrokes. Accuracy tracks correct vs total keystrokes, and Consistency scores how steady your per-second typing velocity remains across the session (0–100%).',
  },
  {
    id: 'faq-indic',
    category: 'Typing & Metrics',
    question: 'Does Santypes support Kannada and Hindi typing accurately?',
    answer:
      'Yes. Use the Language selector in the Typing Test ribbon to choose English, Kannada (Native Inscript/Unicode or Kanglish transliteration), or Hindi (Native Devanagari or Hinglish). The engine segments Unicode scripts by grapheme clusters rather than UTF-16 code units so conjuncts and vowel signs score accurately.',
  },
  {
    id: 'faq-paste',
    category: 'Typing & Metrics',
    question: 'Why is copy-paste blocked inside the typing test input?',
    answer:
      'Paste and drop events are blocked inside the active typing arena to protect WPM integrity and keep skill analytics accurate. If you want to practice your own text or code snippets, switch to Custom mode in the test bar or create a saved drill in the Curriculum tab.',
  },
  {
    id: 'faq-storage',
    category: 'Privacy & Data',
    question: 'Where is my typing history saved? Do I need an account?',
    answer:
      'Santypes is local-first with zero user accounts or backend databases. Your session telemetry, streaks, XP, badges, custom drills, feedback drafts, and preferences remain solely in browser localStorage on your device.',
  },
  {
    id: 'faq-analytics',
    category: 'Privacy & Data',
    question: 'Does Santypes track me or send my typed text to external servers?',
    answer:
      'No keystrokes, typed text, or feedback notes are ever sent to analytics. Optional anonymous Google Analytics 4 stays disabled by default until you explicitly choose "Accept Analytics" in the consent banner or Privacy settings, and runs with IP anonymization enabled.',
  },
  {
    id: 'faq-export-erase',
    category: 'Privacy & Data',
    question: 'How do I export or permanently delete all of my data?',
    answer:
      'Open "Privacy & IT Notice" from the footer or Settings -> Privacy & Data. You can download a complete JSON backup ("Export All Local Data") or click "Delete All Local Data" to erase all saved Santypes storage and clear any analytics cookies.',
  },
  {
    id: 'faq-modes',
    category: 'Features & Shortcuts',
    question: 'What are Ghost Mode, Adaptive AI Weak-Keys, and Focus Mode?',
    answer:
      'Ghost Mode races your live cursor against your personal best session for that mode and language. Adaptive AI targets your slowest/most error-prone keys from recent history. Focus Mode (Ctrl+Shift+F) clears distractions and toggles fullscreen; press Esc anytime to exit.',
  },
  {
    id: 'faq-shortcuts',
    category: 'Features & Shortcuts',
    question: 'What keyboard shortcuts are built in?',
    answer:
      'Press Tab to restart quickly, Esc to reset or dismiss modals, Ctrl+Shift+F for Focus Mode, Ctrl+Shift+W to toggle word-error mode, Ctrl+Shift+P for the Pomodoro bar, and Ctrl+Shift+? to open the full Shortcuts cheatsheet.',
  },
  {
    id: 'faq-audio',
    category: 'Security & Support',
    question: 'Why does mechanical sound not use external audio files or work offline?',
    answer:
      'All keystroke and button sounds are synthesized locally in real time using the browser Web Audio API (no external MP3/WAV downloads needed). If muted or blocked by browser autoplay rules, toggle the speaker button in the top bar or check Settings -> Sound.',
  },
  {
    id: 'faq-feedback-security',
    category: 'Security & Support',
    question: 'How do I report a bug, suggest features, or report a security issue?',
    answer:
      'Use the Feedback button in the top header to record feedback locally and copy a formatted report summary, or submit public bug reports/grievances via GitHub Issues (https://github.com/suhas-hoskere/santypes/issues). For security vulnerability disclosure, visit https://github.com/suhas-hoskere/santypes/security or review Security Policy (/.well-known/security.txt) in the footer.',
  },
];

export const TERMS_SECTIONS: readonly TermsSection[] = [
  {
    id: 'terms-acceptance',
    title: '1. Acceptance of Terms',
    body: 'By accessing or using Santypes, you agree to these Terms of Use. If you do not agree with these terms, please discontinue using the application.',
  },
  {
    id: 'terms-local-service',
    title: '2. Local-First Service & Data Responsibility',
    body: 'Santypes operates client-side inside your web browser without user accounts or cloud storage. You retain full ownership and responsibility for your locally stored practice history, custom drills, and settings. Clearing browser data or using a private session may permanently remove local records unless you export a JSON backup first.',
  },
  {
    id: 'terms-acceptable-use',
    title: '3. Acceptable Use',
    body: 'You agree to use Santypes lawfully and strictly for legitimate typing practice, educational training, or personal benchmarking. You must not attempt automated abuse, service disruption, security bypassing, or misleading redistribution of the Santypes platform.',
  },
  {
    id: 'terms-content-ip',
    title: '4. Intellectual Property & Custom Content',
    body: 'Application design, source code, visual assets, and built-in drills remain the property of Santypes and its licensors. Any custom practice lessons or text drills you enter locally belong solely to you and remain on your device.',
  },
  {
    id: 'terms-third-party',
    title: '5. Self-Hosted Assets & Optional Analytics',
    body: 'Santypes bundles its interface and multilingual typography inside the application package with zero external font CDN calls. Only after your explicit opt-in consent (and respecting browser Global Privacy Control signals) does Santypes load optional anonymous Google Analytics 4 telemetry.',
  },
  {
    id: 'terms-warranty-liability',
    title: '6. Disclaimer of Warranties & Limitation of Liability',
    body: 'Santypes is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, whether express or implied, including fitness for a particular purpose, uninterrupted uptime, or data persistence. To the fullest extent permitted by applicable law, Santypes is not liable for indirect, incidental, or consequential damages arising from use of the application.',
  },
  {
    id: 'terms-updates',
    title: '7. Updates, Support Contact & Related Policies',
    body: 'We may update these Terms of Use alongside application releases. Please also review our Privacy & IT Notice and RFC 9116 Security Disclosure Policy (/.well-known/security.txt). Support inquiries or grievances may be opened at https://github.com/suhas-hoskere/santypes/issues, and security vulnerabilities reported via https://github.com/suhas-hoskere/santypes/security.',
  },
];

export function filterFaqItems(rawQuery: unknown): FaqItem[] {
  const query = typeof rawQuery === 'string' ? rawQuery.trim().toLowerCase() : '';
  if (!query) return [...FAQ_ITEMS];
  return FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.category.toLowerCase().includes(query)
  );
}
