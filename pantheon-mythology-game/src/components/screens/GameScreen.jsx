import { useState, useEffect, useCallback } from 'react';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { questions, DIFFICULTY, MYTHOLOGIES } from '../../data/questions';

const TIMER_DURATION = 30; // seconds for speed mode

export function GameScreen({ config, player, onComplete, onQuit }) {
  const [gameQuestions, setGameQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState([]);
  const [timeLeft, setTimeLeft] = useState(TIMER_DURATION);
  const [streak, setStreak] = useState(0);
  const [combo, setCombo] = useState(false);

  // Build question pool
  useEffect(() => {
    let pool = [...questions];
    if (config.mythologies && config.mythologies.length > 0) {
      pool = pool.filter(q =>
        config.mythologies.includes(q.mythology) || q.mythology === 'cross'
      );
    }
    if (config.difficulty) {
      pool = pool.filter(q => q.difficulty === config.difficulty);
    }
    pool.sort(() => Math.random() - 0.5);
    setGameQuestions(pool.slice(0, config.count || 10));
  }, [config]);

  const currentQ = gameQuestions[currentIndex];
  const isSpeed = config.mode === 'speed';

  // Timer for speed mode
  useEffect(() => {
    if (!isSpeed || revealed || !currentQ) return;
    if (timeLeft <= 0) {
      handleAnswer(null);
      return;
    }
    const t = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, isSpeed, revealed, currentQ]);

  // Reset timer on new question
  useEffect(() => {
    setTimeLeft(TIMER_DURATION);
  }, [currentIndex]);

  const handleAnswer = useCallback((answer) => {
    if (revealed || !currentQ) return;
    setSelectedAnswer(answer);
    setRevealed(true);

    const isCorrect = answer === currentQ.answer;
    const newStreak = isCorrect ? streak + 1 : 0;
    setStreak(newStreak);
    setCombo(newStreak >= 3 && isCorrect);

    const diff = DIFFICULTY[currentQ.difficulty.toUpperCase()] || DIFFICULTY.INITIATE;
    const xp = isCorrect
      ? currentQ.xp * diff.xpMultiplier * (newStreak >= 3 ? 1.5 : 1)
      : 0;

    setResults(prev => [...prev, {
      question: currentQ,
      answer,
      isCorrect,
      xpEarned: Math.round(xp),
      mythology: currentQ.mythology,
    }]);
  }, [revealed, currentQ, streak]);

  const handleNext = () => {
    if (currentIndex + 1 >= gameQuestions.length) {
      onComplete(results);
    } else {
      setCurrentIndex(i => i + 1);
      setSelectedAnswer(null);
      setRevealed(false);
      setCombo(false);
    }
  };

  if (!currentQ) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center text-stone-400">
        Loading questions...
      </div>
    );
  }

  const progress = ((currentIndex) / gameQuestions.length) * 100;
  const correctSoFar = results.filter(r => r.isCorrect).length;
  const mythInfo = MYTHOLOGIES[currentQ.mythology?.toUpperCase()] || { emoji: '🌍', name: 'Cross-Mythology', color: '#888' };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-2 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <button onClick={onQuit} className="text-stone-500 hover:text-stone-300 transition-colors">
            ✕ Quit
          </button>
          <span className="text-stone-400">
            {currentIndex + 1} / {gameQuestions.length}
          </span>
          <div className="flex items-center gap-2">
            {streak >= 2 && (
              <span className="text-orange-400 font-bold animate-pulse">🔥 ×{streak}</span>
            )}
            <span className="text-amber-400 font-bold">
              {results.reduce((s, r) => s + r.xpEarned, 0)} XP
            </span>
          </div>
        </div>
        <ProgressBar value={progress} max={100} color="amber" />
        {isSpeed && !revealed && (
          <div className="flex items-center gap-2">
            <div className="text-xs text-stone-500">Time</div>
            <ProgressBar
              value={timeLeft}
              max={TIMER_DURATION}
              color={timeLeft <= 10 ? 'red' : 'blue'}
              className="flex-1"
            />
            <div className={`text-sm font-bold ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-blue-400'}`}>
              {timeLeft}s
            </div>
          </div>
        )}
      </div>

      {/* Question */}
      <main className="flex-1 px-5 py-3 flex flex-col max-w-2xl mx-auto w-full">
        {/* Mythology badge */}
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold mb-4 self-start"
          style={{ backgroundColor: `${mythInfo.color}25`, color: mythInfo.color, border: `1px solid ${mythInfo.color}50` }}
        >
          <span>{mythInfo.emoji}</span>
          <span>{mythInfo.name.toUpperCase()} MYTHOLOGY</span>
          {currentQ.mythology === 'cross' && <span className="ml-1">· CROSS-MYTH</span>}
        </div>

        {/* Difficulty badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-stone-500 uppercase tracking-wider">
            {DIFFICULTY[currentQ.difficulty?.toUpperCase()]?.icon}{' '}
            {DIFFICULTY[currentQ.difficulty?.toUpperCase()]?.name || currentQ.difficulty}
          </span>
        </div>

        {/* Question text */}
        <div className="bg-stone-900/80 rounded-2xl p-5 mb-5 border border-stone-800">
          <p className="text-lg font-semibold leading-relaxed">{currentQ.question}</p>
        </div>

        {/* Answers */}
        <div className="space-y-2.5 flex-1">
          {currentQ.type === 'true_false' ? (
            <div className="grid grid-cols-2 gap-3">
              {[true, false].map(val => (
                <AnswerButton
                  key={String(val)}
                  label={val ? 'TRUE' : 'FALSE'}
                  onClick={() => handleAnswer(val)}
                  state={getAnswerState(val, selectedAnswer, currentQ.answer, revealed)}
                />
              ))}
            </div>
          ) : (
            currentQ.options?.map((opt) => (
              <AnswerButton
                key={opt}
                label={opt}
                onClick={() => handleAnswer(opt)}
                state={getAnswerState(opt, selectedAnswer, currentQ.answer, revealed)}
              />
            ))
          )}
        </div>

        {/* Combo message */}
        {combo && revealed && (
          <div className="text-center py-2 text-orange-400 font-black text-lg animate-bounce">
            🔥 COMBO ×{streak} — {Math.round(streak * 1.5)}x XP!
          </div>
        )}

        {/* Explanation */}
        {revealed && (
          <div className={`mt-4 p-4 rounded-xl border text-sm leading-relaxed ${
            selectedAnswer === currentQ.answer
              ? 'bg-emerald-900/30 border-emerald-700/50 text-emerald-200'
              : 'bg-red-900/30 border-red-700/50 text-red-200'
          }`}>
            <div className="font-bold mb-1">
              {selectedAnswer === currentQ.answer ? '✓ Correct!' : '✗ Not quite.'}
              {selectedAnswer === currentQ.answer && results[results.length - 1]?.xpEarned > 0 && (
                <span className="ml-2 text-amber-400">+{results[results.length - 1]?.xpEarned} XP</span>
              )}
            </div>
            {currentQ.explanation}
          </div>
        )}

        {/* Next button */}
        {revealed && (
          <Button
            variant="primary"
            size="lg"
            className="w-full mt-4"
            onClick={handleNext}
          >
            {currentIndex + 1 >= gameQuestions.length ? '🏆 See Results' : 'Next Question →'}
          </Button>
        )}
      </main>
    </div>
  );
}

function getAnswerState(option, selected, correct, revealed) {
  if (!revealed) return 'default';
  if (option === correct) return 'correct';
  if (option === selected && option !== correct) return 'wrong';
  return 'default';
}

function AnswerButton({ label, onClick, state }) {
  const styles = {
    default: 'border-stone-700 bg-stone-900/60 text-stone-200 hover:border-amber-600 hover:bg-stone-800 cursor-pointer',
    correct: 'border-emerald-500 bg-emerald-900/40 text-emerald-200 cursor-default',
    wrong: 'border-red-500 bg-red-900/40 text-red-200 cursor-default',
  };
  const icons = { default: '', correct: '✓ ', wrong: '✗ ' };

  return (
    <button
      onClick={state === 'default' ? onClick : undefined}
      className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-150 ${styles[state]} ${
        state === 'correct' ? 'scale-[1.01]' : state === 'wrong' ? 'opacity-70' : 'active:scale-[0.98]'
      }`}
    >
      {icons[state]}{label}
    </button>
  );
}
