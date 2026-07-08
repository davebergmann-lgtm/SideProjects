import { useState } from 'react';
import { Button } from '../ui/Button';

const TABS = ['How to Play', 'Game Modes', 'XP & Levels', 'Mythologies'];

export function InstructionsScreen({ onBack }) {
  const [tab, setTab] = useState(0);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      <header className="pt-7 px-5 pb-4 flex items-center gap-3">
        <button onClick={onBack} className="text-stone-400 hover:text-stone-200 text-2xl transition-colors">
          ←
        </button>
        <div>
          <h1 className="text-xl font-black text-amber-400 tracking-wide">How to Play</h1>
          <p className="text-stone-600 text-xs">PANTHEON — The Mythology Challenge</p>
        </div>
      </header>

      {/* Tab bar */}
      <div className="px-5 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              tab === i
                ? 'bg-amber-500 text-stone-950'
                : 'bg-stone-900 text-stone-400 hover:text-stone-200'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-5 py-5 max-w-lg mx-auto w-full pb-10 space-y-4">

        {/* How to Play */}
        {tab === 0 && (
          <>
            <Section title="The Basics" emoji="📜">
              <p>PANTHEON is a mythology trivia game spanning 10+ pantheons from around the world. Answer questions correctly to earn XP, level up, and unlock new mythologies.</p>
            </Section>

            <Section title="Answering Questions" emoji="⚡">
              <ul className="space-y-2">
                <Item emoji="👆" text="Tap an answer to lock it in — you can't change your pick." />
                <Item emoji="✅" text="Green means correct. Red means wrong. The correct answer is always revealed." />
                <Item emoji="📖" text="Read the explanation to deepen your knowledge." />
                <Item emoji="➡️" text="Tap Next to advance to the next question." />
              </ul>
            </Section>

            <Section title="Streaks & Combos" emoji="🔥">
              <ul className="space-y-2">
                <Item emoji="🔥" text="Correct answers in a row build your streak. It resets on any wrong answer." />
                <Item emoji="💥" text="Hit a 3× streak to trigger a COMBO — your XP for that answer is multiplied by 1.5×." />
                <Item emoji="📈" text="Higher streaks shown in orange display your current multiplier." />
              </ul>
            </Section>

            <Section title="Your Champion" emoji="👤">
              <ul className="space-y-2">
                <Item emoji="🎭" text="Choose a champion from any unlocked pantheon during setup." />
                <Item emoji="👗" text="Each champion has 3 unique outfits (regalia) with different color schemes." />
                <Item emoji="🔓" text="Unlock more pantheons as you level up to access new champions." />
                <Item emoji="🔄" text="Change your champion any time from your Profile." />
              </ul>
            </Section>
          </>
        )}

        {/* Game Modes */}
        {tab === 1 && (
          <>
            <Section title="⚔️ Solo Quest" emoji="⚔️">
              <p>The standard experience. Pick your mythologies, set your difficulty, choose how many questions (5–20), and test your knowledge at your own pace. No time limit.</p>
            </Section>

            <Section title="☀️ Daily Oracle" emoji="☀️">
              <p>A fresh challenge every day, the same for everyone. Come back daily to keep your streak and see how your score compares. Each day's questions reset at midnight.</p>
            </Section>

            <Section title="⚡ Speed Myth" emoji="⚡">
              <p>Race the clock. Answer before the timer runs out — or the question is auto-failed. The time limit scales with difficulty:</p>
              <div className="mt-3 space-y-2">
                <TimerRow difficulty="Initiate" emoji="🌙" seconds={45} color="#6366f1" />
                <TimerRow difficulty="Adept" emoji="⚡" seconds={30} color="#f59e0b" />
                <TimerRow difficulty="Scholar" emoji="🔥" seconds={20} color="#f97316" />
                <TimerRow difficulty="Oracle" emoji="💀" seconds={15} color="#ef4444" />
              </div>
              <p className="text-xs text-stone-500 mt-3">Tip: Higher difficulties earn more XP — but less time makes it harder!</p>
            </Section>

            <Section title="👥 Pantheon Battle" emoji="👥">
              <p>Play with friends! One player creates a room and shares the 6-letter code. Others join with the code. Best for screen-sharing over Zoom, Teams, WhatsApp, or gathered around one device.</p>
              <div className="mt-3 space-y-1.5">
                <Item emoji="1️⃣" text="Host taps Create Room and shares the code." />
                <Item emoji="2️⃣" text="Others tap Join Room and enter the code." />
                <Item emoji="3️⃣" text="Host starts the game when everyone is in the lobby." />
                <Item emoji="🏆" text="Final leaderboard ranks all players at the end." />
              </div>
            </Section>
          </>
        )}

        {/* XP & Levels */}
        {tab === 2 && (
          <>
            <Section title="Earning XP" emoji="⭐">
              <p>Correct answers earn XP. Wrong answers earn nothing — so accuracy matters. Each question has a base XP value boosted by:</p>
              <div className="mt-3 space-y-2">
                <XPRow label="Initiate 🌙" mult="1×" color="#6366f1" />
                <XPRow label="Adept ⚡" mult="2×" color="#f59e0b" />
                <XPRow label="Scholar 🔥" mult="3×" color="#f97316" />
                <XPRow label="Oracle 💀" mult="5×" color="#ef4444" />
              </div>
              <p className="text-xs text-stone-500 mt-3">Combo streaks add a further 1.5× multiplier on top of the difficulty multiplier.</p>
            </Section>

            <Section title="Leveling Up" emoji="🌟">
              <p>XP needed per level increases on a curve — early levels come quickly, higher levels take dedication. Each level-up is announced at the results screen.</p>
              <div className="mt-3 bg-stone-900/60 rounded-xl p-3 border border-stone-800 text-xs text-stone-400 space-y-1">
                <div className="flex justify-between"><span>Level 1 → 2</span><span className="text-amber-400">50 XP</span></div>
                <div className="flex justify-between"><span>Level 5 → 6</span><span className="text-amber-400">~380 XP</span></div>
                <div className="flex justify-between"><span>Level 10 → 11</span><span className="text-amber-400">~1,000 XP</span></div>
                <div className="flex justify-between"><span>Level 20 → 21</span><span className="text-amber-400">~3,400 XP</span></div>
              </div>
            </Section>

            <Section title="Unlocking Mythologies" emoji="🔓">
              <p>New pantheons unlock as you level up, giving you access to new question sets and new champions:</p>
              <div className="mt-3 space-y-1.5 text-sm">
                {[
                  { level: 1, name: 'Greek & Norse', emoji: '🏛️⚡', note: 'Available from start' },
                  { level: 5, name: 'Egyptian', emoji: '𓂀' },
                  { level: 10, name: 'Hindu', emoji: '🪷' },
                  { level: 15, name: 'Japanese', emoji: '⛩️' },
                  { level: 20, name: 'Celtic', emoji: '🍀' },
                  { level: 25, name: 'Aztec', emoji: '🌞' },
                  { level: 30, name: 'Mesopotamian', emoji: '🏺' },
                  { level: 35, name: 'Chinese', emoji: '🐉' },
                  { level: 40, name: 'Slavic', emoji: '🌲' },
                ].map(m => (
                  <div key={m.name} className="flex items-center gap-3 bg-stone-900/40 rounded-lg px-3 py-2 border border-stone-800">
                    <span className="text-lg">{m.emoji}</span>
                    <span className="text-stone-200 font-semibold flex-1">{m.name}</span>
                    <span className="text-xs text-amber-400 font-bold">
                      {m.note || `Level ${m.level}`}
                    </span>
                  </div>
                ))}
              </div>
            </Section>
          </>
        )}

        {/* Mythologies */}
        {tab === 3 && (
          <>
            <Section title="About the Pantheons" emoji="🌍">
              <p>PANTHEON covers 10 mythological traditions. Questions span multiple types — multiple choice, true/false, cross-mythology comparisons, and ordering challenges.</p>
            </Section>

            {[
              { emoji: '🏛️', name: 'Greek', desc: 'Zeus, Athena, Heracles, and the Twelve Olympians. The foundation of Western mythology.' },
              { emoji: '⚡', name: 'Norse', desc: 'Odin, Thor, Loki, and the Nine Worlds. From Yggdrasil to Ragnarök.' },
              { emoji: '𓂀', name: 'Egyptian', desc: 'Ra, Isis, Osiris, Anubis. Millennia of divine tradition along the Nile.' },
              { emoji: '🪷', name: 'Hindu', desc: 'Vishnu, Shiva, Brahma, and the vast Vedic cosmos.' },
              { emoji: '⛩️', name: 'Japanese', desc: 'Amaterasu, Susanoo, and the 8 million kami of the Shinto tradition.' },
              { emoji: '🍀', name: 'Celtic', desc: 'The Tuatha Dé Danann, Cú Chulainn, and the magic of ancient Ireland.' },
              { emoji: '🌞', name: 'Aztec', desc: 'Quetzalcoatl, Huitzilopochtli, and the cosmic cycles of Mesoamerica.' },
              { emoji: '🏺', name: 'Mesopotamian', desc: 'Inanna, Gilgamesh, and the oldest written stories in human history.' },
              { emoji: '🐉', name: 'Chinese', desc: 'The Jade Emperor, Guan Yu, and the divine bureaucracy of heaven.' },
              { emoji: '🌲', name: 'Slavic', desc: 'Perun, Veles, Baba Yaga, and the spirits of Eastern European folklore.' },
            ].map(m => (
              <div key={m.name} className="bg-stone-900/40 rounded-xl p-3.5 border border-stone-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{m.emoji}</span>
                  <span className="font-black text-stone-100">{m.name}</span>
                </div>
                <p className="text-xs text-stone-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </>
        )}
      </main>

      <div className="px-5 pb-6">
        <Button variant="primary" size="lg" className="w-full" onClick={onBack}>
          Got it — Let's Play!
        </Button>
      </div>
    </div>
  );
}

function Section({ title, emoji, children }) {
  return (
    <div className="bg-stone-900/40 rounded-2xl border border-stone-800 p-4 space-y-2.5">
      <h3 className="font-black text-stone-100 flex items-center gap-2">
        <span>{emoji}</span> {title}
      </h3>
      <div className="text-sm text-stone-400 leading-relaxed space-y-2">
        {children}
      </div>
    </div>
  );
}

function Item({ emoji, text }) {
  return (
    <li className="flex items-start gap-2">
      <span className="flex-shrink-0 mt-0.5">{emoji}</span>
      <span>{text}</span>
    </li>
  );
}

function TimerRow({ difficulty, emoji, seconds, color }) {
  return (
    <div className="flex items-center gap-3 bg-stone-900/60 rounded-lg px-3 py-2 border border-stone-800">
      <span>{emoji}</span>
      <span className="text-stone-300 font-semibold flex-1">{difficulty}</span>
      <span className="font-black text-lg" style={{ color }}>{seconds}s</span>
    </div>
  );
}

function XPRow({ label, mult, color }) {
  return (
    <div className="flex items-center gap-3 bg-stone-900/60 rounded-lg px-3 py-2 border border-stone-800">
      <span className="text-stone-300 flex-1 text-sm">{label}</span>
      <span className="font-black text-lg" style={{ color }}>{mult} XP</span>
    </div>
  );
}
