/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Coins, 
  Zap, 
  TrendingUp, 
  MousePointer2, 
  ShoppingBag,
  Trophy,
  MousePointerClick,
  PartyPopper,
  RefreshCcw,
  Flame,
  Ghost,
  Star,
  Heart,
  Sword,
  Target,
  BatteryCharging,
  ZapOff,
  DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface FloatingText {
  id: number;
  x: number;
  y: number;
  value: bigint;
}

interface CursorItem {
  id: string;
  name: string;
  icon: any;
  color: string;
}

const CURSORS: CursorItem[] = [
  { id: "default", name: "Sariq", icon: MousePointerClick, color: "text-yellow-400" },
  { id: "fire", name: "Olov", icon: Flame, color: "text-orange-500" },
  { id: "ghost", name: "Arvoh", icon: Ghost, color: "text-purple-400" },
  { id: "star", name: "Yulduz", icon: Star, color: "text-cyan-400" },
  { id: "heart", name: "Yurak", icon: Heart, color: "text-pink-400" },
  { id: "sword", name: "Qilich", icon: Sword, color: "text-slate-300" },
  { id: "target", name: "Nishon", icon: Target, color: "text-red-500" },
];

const WIN_TARGET = 100000n;

const FallingMoney = () => {
  const [bills, setBills] = useState<{ id: number; left: number; delay: number; duration: number }[]>([]);

  useEffect(() => {
    const newBills = Array.from({ length: 20 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 5 + Math.random() * 5,
    }));
    setBills(newBills);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {bills.map((bill) => (
        <motion.div
          key={bill.id}
          initial={{ y: -100, x: `${bill.left}vw`, rotate: 0, opacity: 0 }}
          animate={{ 
            y: "110vh", 
            rotate: 360,
            opacity: [0, 0.4, 0.4, 0]
          }}
          transition={{
            duration: bill.duration,
            repeat: Infinity,
            delay: bill.delay,
            ease: "linear"
          }}
          className="absolute text-emerald-500/20"
        >
          <DollarSign className="w-12 h-12" />
        </motion.div>
      ))}
    </div>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'clicker' | 'shop' | 'trophy'>('clicker');
  
  const [score, setScore] = useState<bigint>(() => {
    const saved = localStorage.getItem("hamster_score");
    return saved ? BigInt(saved) : 0n;
  });
  
  const [clickPower, setClickPower] = useState<bigint>(() => {
    const saved = localStorage.getItem("hamster_clickPower");
    return saved ? BigInt(saved) : 1n;
  });

  const [autoClickRate, setAutoClickRate] = useState<bigint>(() => {
    const saved = localStorage.getItem("hamster_autoClickRate");
    return saved ? BigInt(saved) : 0n;
  });

  const [cubes, setCubes] = useState<bigint>(() => {
    const saved = localStorage.getItem("hamster_cubes");
    return saved ? BigInt(saved) : 0n;
  });

  const [fakeMoney, setFakeMoney] = useState<bigint>(() => {
    const saved = localStorage.getItem("hamster_fakeMoney");
    return saved ? BigInt(saved) : 0n;
  });

  const [wins, setWins] = useState<number>(() => {
    const saved = localStorage.getItem("hamster_wins");
    return saved ? parseInt(saved) : 0;
  });

  const [ownedCursors, setOwnedCursors] = useState<string[]>(() => {
    const saved = localStorage.getItem("hamster_ownedCursors");
    return saved ? JSON.parse(saved) : ["default"];
  });

  const [selectedCursorId, setSelectedCursorId] = useState<string>(() => {
    return localStorage.getItem("hamster_selectedCursor") || "default";
  });

  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isClicking, setIsClicking] = useState(false);
  const [hasWon, setHasWon] = useState(false);

  // Milestone logic for cubes: Earn 1 cube every 10^12 points
  useEffect(() => {
    const expectedCubes = score / BigInt("1000000000000");
    if (expectedCubes > cubes) {
      setCubes(expectedCubes);
    }
  }, [score, cubes]);

  useEffect(() => {
    localStorage.setItem("hamster_score", score.toString());
    localStorage.setItem("hamster_clickPower", clickPower.toString());
    localStorage.setItem("hamster_autoClickRate", autoClickRate.toString());
    localStorage.setItem("hamster_cubes", cubes.toString());
    localStorage.setItem("hamster_fakeMoney", fakeMoney.toString());
    localStorage.setItem("hamster_wins", wins.toString());
    localStorage.setItem("hamster_ownedCursors", JSON.stringify(ownedCursors));
    localStorage.setItem("hamster_selectedCursor", selectedCursorId);

    if (score >= WIN_TARGET && !hasWon) {
      setHasWon(true);
    }
  }, [score, clickPower, autoClickRate, cubes, ownedCursors, selectedCursorId, hasWon]);

  useEffect(() => {
    if (autoClickRate > 0n) {
      const interval = setInterval(() => {
        setScore(prev => prev + autoClickRate);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [autoClickRate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleClick = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'clientX' in e ? e.clientX : e.touches[0].clientX;
    const clientY = 'clientY' in e ? e.clientY : e.touches[0].clientY;

    setScore(prev => prev + clickPower);
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 100);

    const newText: FloatingText = {
      id: Date.now(),
      x: clientX,
      y: clientY,
      value: clickPower
    };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== newText.id));
    }, 1000);
  };

  const buyUpgrade = (type: 'power' | 'auto') => {
    const cost = type === 'power' ? clickPower * 50n : (autoClickRate + 1n) * 100n;
    if (score >= cost) {
      setScore(prev => prev - cost);
      if (type === 'power') setClickPower(prev => prev + 1n);
      else setAutoClickRate(prev => prev + 1n);
    }
  };

  const buyCursor = (cursorId: string) => {
    if (ownedCursors.includes(cursorId)) {
      setSelectedCursorId(cursorId);
      return;
    }
    if (score >= 1000n) {
      setScore(prev => prev - 1000n);
      setOwnedCursors(prev => [...prev, cursorId]);
      setSelectedCursorId(cursorId);
    }
  };

  const buyFakeMoney = (amount: bigint) => {
    const cost = amount * 10n;
    if (score >= cost) {
      setScore(prev => prev - cost);
      setFakeMoney(prev => prev + amount);
    }
  };

  const resetGame = () => {
    if (confirm("Haqiqatan ham o'yinni boshidan boshlamoqchimisiz?")) {
      setScore(0n);
      setClickPower(1n);
      setAutoClickRate(0n);
      setCubes(0n);
      setFakeMoney(0n);
      setWins(0);
      setOwnedCursors(["default"]);
      setSelectedCursorId("default");
      setHasWon(false);
      localStorage.clear();
    }
  };

  const formatBigInt = (num: bigint) => {
    const s = num.toString();
    if (s.length <= 15) return num.toLocaleString();
    return s.slice(0, 1) + "." + s.slice(1, 4) + "e" + (s.length - 1);
  };

  const SelectedCursorIcon = CURSORS.find(c => c.id === selectedCursorId)?.icon || MousePointerClick;
  const selectedCursorColor = CURSORS.find(c => c.id === selectedCursorId)?.color || "text-yellow-400";

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-hidden cursor-none select-none">
      <FallingMoney />
      {/* Custom Cursor */}
      <motion.div 
        className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[200] mix-blend-difference"
        animate={{ 
          x: mousePos.x - 16, 
          y: mousePos.y - 16,
          scale: isClicking ? 0.8 : 1,
          rotate: isClicking ? 15 : 0
        }}
        transition={{ type: "spring", damping: 20, stiffness: 250, mass: 0.5 }}
      >
        <SelectedCursorIcon className={`w-full h-full ${selectedCursorColor} fill-current/20`} />
      </motion.div>

      {/* Background Glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 blur-[120px] rounded-full" />
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-md mx-auto h-screen flex flex-col p-6">
        {/* Stats Header */}
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-2xl border border-slate-700/50 backdrop-blur-md flex-1 mr-2">
              <div className="bg-yellow-500 p-2 rounded-xl shadow-lg shadow-yellow-500/20">
                <Coins className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Balans</p>
                <p className="text-xl font-black tabular-nums">{formatBigInt(score)}</p>
              </div>
            </div>
            <button 
              onClick={resetGame}
              className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:bg-slate-700 transition-colors"
            >
              <RefreshCcw className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          <div className="flex items-center gap-3 bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
            <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
              <DollarSign className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <p className="text-xs text-emerald-400/70 font-bold uppercase tracking-wider">Soxta Pul (USD)</p>
              <p className="text-2xl font-black tabular-nums text-emerald-400">${formatBigInt(fakeMoney)}</p>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pb-24 scrollbar-hide">
          <AnimatePresence mode="wait">
            {activeTab === 'clicker' && (
              <motion.div 
                key="clicker"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="h-full flex flex-col"
              >
                {/* Win Progress */}
                <div className="mb-6 px-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    <span>G'alabaga yo'l</span>
                    <span>{((Number(score * 100n / WIN_TARGET))).toFixed(2)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, Number(score * 100n / WIN_TARGET))}%` }}
                    />
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center py-8">
                  <motion.div 
                    className="relative"
                    whileTap={{ scale: 0.92 }}
                    onClick={handleClick}
                  >
                    <div className="w-64 h-64 rounded-full bg-gradient-to-br from-yellow-300 via-yellow-500 to-orange-600 p-2 shadow-[0_0_50px_rgba(234,179,8,0.3)] border-8 border-yellow-400/30 flex items-center justify-center relative overflow-hidden group">
                      <div className="w-48 h-48 rounded-full bg-yellow-400 border-4 border-yellow-500 flex items-center justify-center shadow-inner">
                        <Coins className="w-32 h-32 text-slate-900/40" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Current Stats Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Click Power</p>
                    <p className="text-xl font-black text-blue-400">+{formatBigInt(clickPower)}</p>
                  </div>
                  <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Auto Click</p>
                    <p className="text-xl font-black text-purple-400">{formatBigInt(autoClickRate)}/s</p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'shop' && (
              <motion.div 
                key="shop"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                {/* Boosts Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl font-black">Valyuta Ayirboshlash</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => buyFakeMoney(1n)}
                      disabled={score < 10n}
                      className="bg-slate-800/50 border border-slate-700 p-4 rounded-3xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                      <span className="text-2xl font-black text-emerald-400">$1</span>
                      <span className="text-xs text-yellow-400 font-bold">10 🪙</span>
                    </button>
                    <button 
                      onClick={() => buyFakeMoney(10n)}
                      disabled={score < 100n}
                      className="bg-slate-800/50 border border-slate-700 p-4 rounded-3xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                      <span className="text-2xl font-black text-emerald-400">$10</span>
                      <span className="text-xs text-yellow-400 font-bold">100 🪙</span>
                    </button>
                    <button 
                      onClick={() => buyFakeMoney(100n)}
                      disabled={score < 1000n}
                      className="bg-slate-800/50 border border-slate-700 p-4 rounded-3xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                      <span className="text-2xl font-black text-emerald-400">$100</span>
                      <span className="text-xs text-yellow-400 font-bold">1,000 🪙</span>
                    </button>
                    <button 
                      onClick={() => buyFakeMoney(1000n)}
                      disabled={score < 10000n}
                      className="bg-slate-800/50 border border-slate-700 p-4 rounded-3xl flex flex-col items-center gap-2 hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                      <span className="text-2xl font-black text-emerald-400">$1,000</span>
                      <span className="text-xs text-yellow-400 font-bold">10,000 🪙</span>
                    </button>
                  </div>
                </section>

                {/* Boosts Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-xl font-black">Kuchaytirish (Boosts)</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <button 
                      onClick={() => buyUpgrade('power')}
                      disabled={score < clickPower * 50n}
                      className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl flex items-center justify-between hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-500/20 p-3 rounded-2xl">
                          <TrendingUp className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold">Click Power Lvl {formatBigInt(clickPower)}</p>
                          <p className="text-xs text-slate-400">Har bir klikka +1 ball</p>
                        </div>
                      </div>
                      <span className={`font-black ${score >= clickPower * 50n ? 'text-yellow-400' : 'text-red-400'}`}>
                        {formatBigInt(clickPower * 50n)} 🪙
                      </span>
                    </button>

                    <button 
                      onClick={() => buyUpgrade('auto')}
                      disabled={score < (autoClickRate + 1n) * 100n}
                      className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl flex items-center justify-between hover:bg-slate-700 transition-all disabled:opacity-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-purple-500/20 p-3 rounded-2xl">
                          <MousePointer2 className="w-6 h-6 text-purple-400" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold">Auto Click {formatBigInt(autoClickRate)}/s</p>
                          <p className="text-xs text-slate-400">Sekundiga avtomatik ball</p>
                        </div>
                      </div>
                      <span className={`font-black ${score >= (autoClickRate + 1n) * 100n ? 'text-yellow-400' : 'text-red-400'}`}>
                        {formatBigInt((autoClickRate + 1n) * 100n)} 🪙
                      </span>
                    </button>
                  </div>
                </section>

                {/* Cursors Section */}
                <section>
                  <div className="flex items-center gap-2 mb-4">
                    <MousePointerClick className="w-5 h-5 text-pink-400" />
                    <h3 className="text-xl font-black">Kursorlar</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {CURSORS.map(cursor => (
                      <button 
                        key={cursor.id}
                        onClick={() => buyCursor(cursor.id)}
                        className={`p-4 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 ${
                          selectedCursorId === cursor.id 
                            ? 'bg-yellow-500/10 border-yellow-500' 
                            : ownedCursors.includes(cursor.id)
                              ? 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                              : 'bg-slate-900/50 border-slate-800 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className={`p-4 rounded-2xl bg-slate-800 ${cursor.color}`}>
                          <cursor.icon className="w-8 h-8" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold">{cursor.name}</p>
                          <p className={`text-[10px] uppercase font-black mt-1 ${
                            ownedCursors.includes(cursor.id) 
                              ? 'text-emerald-400' 
                              : score >= 1000n ? 'text-yellow-500' : 'text-red-500'
                          }`}>
                            {ownedCursors.includes(cursor.id) ? 'Sotib olingan' : '1,000 🪙'}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </motion.div>
            )}

            {activeTab === 'trophy' && (
              <motion.div 
                key="trophy"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-32 h-32 bg-indigo-500/20 rounded-[40px] flex items-center justify-center mb-8 border-2 border-indigo-500/30">
                  <Trophy className="w-16 h-16 text-indigo-400" />
                </div>
                <h3 className="text-3xl font-black mb-2">Sizning Kubiklaringiz</h3>
                <p className="text-slate-400 mb-8 max-w-[200px]">
                  Har 1 trillion balldan keyin 1 ta kubik olasiz!
                </p>
                <div className="bg-slate-800/50 p-8 rounded-[40px] border border-slate-700 w-full mb-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Jami kubiklar</p>
                  <p className="text-6xl font-black text-indigo-400">{formatBigInt(cubes)}</p>
                </div>
                <div className="bg-emerald-500/10 p-8 rounded-[40px] border border-emerald-500/20 w-full">
                  <p className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest mb-2">G'alabalar (Sovrinlar)</p>
                  <p className="text-6xl font-black text-emerald-400">{wins}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Floating Texts */}
        <AnimatePresence>
          {floatingTexts.map(text => (
            <motion.div
              key={text.id}
              initial={{ opacity: 1, y: text.y - 20, x: text.x }}
              animate={{ opacity: 0, y: text.y - 150 }}
              exit={{ opacity: 0 }}
              className="fixed pointer-events-none text-3xl font-black text-yellow-400 z-40 drop-shadow-lg"
            >
              +{formatBigInt(text.value)}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Win Overlay */}
        <AnimatePresence>
          {hasWon && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 z-[300] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-8 text-center"
            >
              <motion.div
                initial={{ scale: 0.5, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-slate-900 border-2 border-yellow-500 rounded-[40px] p-12 shadow-[0_0_100px_rgba(234,179,8,0.2)]"
              >
                <div className="w-24 h-24 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <PartyPopper className="w-12 h-12 text-slate-900" />
                </div>
                <h2 className="text-5xl font-black text-white mb-4">SIZ YUTDINGIZ!</h2>
                <div className="bg-emerald-500/20 p-4 rounded-2xl mb-6 border border-emerald-500/30">
                  <p className="text-emerald-400 font-bold">Yangi Sovrin: Oltin Hamster!</p>
                  <p className="text-xs text-slate-400">Jami g'alabalar: {wins}</p>
                </div>
                <p className="text-slate-400 text-lg mb-8">
                  Siz haqiqiy Hamster Qirolisiz!
                </p>
                <button 
                  onClick={resetGame}
                  className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black px-12 py-4 rounded-2xl transition-all active:scale-95"
                >
                  YANGI O'YIN BOSHLASH
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Bar */}
        <div className="fixed bottom-6 left-6 right-6 max-w-md mx-auto bg-slate-900/80 border border-slate-800 p-2 rounded-3xl flex justify-around backdrop-blur-xl shadow-2xl">
          <button 
            onClick={() => setActiveTab('clicker')}
            className={`p-4 rounded-2xl transition-all ${activeTab === 'clicker' ? 'text-yellow-400 bg-yellow-400/10' : 'text-slate-500 hover:text-white'}`}
          >
            <Coins className="w-7 h-7" />
          </button>
          <button 
            onClick={() => setActiveTab('shop')}
            className={`p-4 rounded-2xl transition-all ${activeTab === 'shop' ? 'text-pink-400 bg-pink-400/10' : 'text-slate-500 hover:text-white'}`}
          >
            <ShoppingBag className="w-7 h-7" />
          </button>
          <button 
            onClick={() => setActiveTab('trophy')}
            className={`p-4 rounded-2xl transition-all ${activeTab === 'trophy' ? 'text-indigo-400 bg-indigo-400/10' : 'text-slate-500 hover:text-white'}`}
          >
            <Trophy className="w-7 h-7" />
          </button>
        </div>
      </main>
    </div>
  );
}
