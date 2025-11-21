"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, SkipBack, SkipForward, Volume2, Disc, List } from 'lucide-react';

// --- ДАННЫЕ ---
const TRACKS = [
  {
    id: 1,
    artist: "The Weeknd",
    title: "After Hours",
    color: "from-red-900 via-red-950 to-black",
    lyrics: [
      "Я снова остался один...",
      "Огни города зовут меня,",
      "Но без тебя они тускнеют.",
      "Я потерял веру в свои сны,",
      "Когда ты ушла, забрав рассвет.",
      "Прости, что разбил твое сердце,",
      "В час, когда закрываются бары."
    ]
  },
  {
    id: 2,
    artist: "Lana Del Rey",
    title: "Old Money",
    color: "from-blue-900 via-slate-900 to-black",
    lyrics: [
      "Голубая гортензия,",
      "Холодные наличные, божественно...",
      "Я жду тебя на углу,",
      "В своем лучшем платье.",
      "Если ты позовешь - я прибегу,",
      "Куда бы ты ни ушел.",
      "Любовь моя..."
    ]
  },
  {
    id: 3,
    artist: "Arctic Monkeys",
    title: "Do I Wanna Know?",
    color: "from-zinc-800 via-neutral-900 to-black",
    lyrics: [
      "Ты уже нашла оправдание?",
      "Чтобы остаться или уйти?",
      "Ползком возвращаюсь к тебе,",
      "Могу ли я войти?",
      "Ночи созданы, чтобы говорить то,",
      "Что не скажешь утром."
    ]
  },
  {
    id: 4,
    artist: "Frank Ocean",
    title: "Pink + White",
    color: "from-fuchsia-900 via-purple-950 to-black",
    lyrics: [
      "Так оно и есть,",
      "Точно так, как ты видишь.",
      "Земля под ногами, небо в огне,",
      "Ты показала мне любовь,",
      "Которая не может умереть,",
      "Даже если мы перестанем дышать."
    ]
  }
];

// --- КОМПОНЕНТЫ ---

// Реалистичный Тонарм (Игла)
const Tonearm = ({ isActive }) => {
  const rotation = isActive ? 32 : 0;
  return (
    <div
      className="absolute top-[10%] right-[8%] w-24 h-80 z-30 pointer-events-none transition-transform duration-[2000ms] ease-in-out origin-[50%_15%]"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      {/* База */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full bg-gradient-to-b from-[#333] to-[#111] shadow-[0_4px_10px_rgba(0,0,0,0.5)] flex items-center justify-center border border-white/5">
         <div className="w-14 h-14 rounded-full bg-[#1a1a1a] shadow-inner border border-black flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 shadow-sm" />
         </div>
      </div>
      {/* Противовес */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-12 bg-gradient-to-r from-[#222] via-[#444] to-[#222] rounded-sm shadow-lg border-t border-white/10" />
      {/* Трубка */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-3 h-56 bg-gradient-to-r from-gray-300 via-gray-100 to-gray-400 shadow-xl rounded-full" />
      {/* Головка */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-8 h-14 bg-[#1a1a1a] rounded-sm border border-white/10 shadow-xl transform -rotate-6 origin-top">
         <div className="absolute -right-2 top-4 w-4 h-1 bg-gray-400 rounded-full" />
         <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-2 bg-amber-200 shadow-[0_0_5px_rgba(251,191,36,0.5)]" />
      </div>
    </div>
  );
};

// Виниловая пластинка
const VinylRecord = ({ track, isPlaying }) => {
  return (
    <div className={`relative w-full h-full rounded-full shadow-2xl flex items-center justify-center border border-[#111] bg-black transition-all duration-1000`}>
      <div className={`absolute inset-0 w-full h-full rounded-full bg-[conic-gradient(from_0deg,#111_0deg,#1a1a1a_90deg,#111_180deg,#1a1a1a_270deg,#111_360deg)] opacity-40 ${isPlaying ? 'animate-spin-slow' : ''}`}
           style={{ animationDuration: '1.8s' }} />
      <div className={`absolute inset-0 w-full h-full rounded-full bg-gradient-to-br from-gray-800/20 via-black to-gray-900/20 ${isPlaying ? 'animate-spin-slow' : ''}`}
           style={{ animationDuration: '4s' }}>
        <div className="absolute inset-0 rounded-full opacity-60"
             style={{ background: 'repeating-radial-gradient(#151515 0, #0a0a0a 1px, transparent 2px, transparent 3px)' }} />
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-45 mix-blend-overlay" />
      </div>
      <div className={`absolute z-10 w-[35%] h-[35%] rounded-full bg-gradient-to-br ${track.color} shadow-inner flex items-center justify-center border border-white/5 ${isPlaying ? 'animate-spin-slow' : ''}`}
           style={{ animationDuration: '4s' }}>
        <div className="w-2 h-2 bg-black rounded-full border border-gray-600" />
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/10 to-transparent opacity-50" />
      </div>
    </div>
  );
};

// Проигрыватель
const Turntable = ({ track, isPlaying, isTonearmMoving }) => {
  return (
    <div className="relative w-[340px] h-[340px] md:w-[500px] md:h-[420px] bg-[#181818] rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.7)] border-t border-white/5 flex items-center justify-center shrink-0 transform transition-transform duration-1000">
      <div className="absolute inset-0 rounded-[2rem] opacity-30 bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')] mix-blend-overlay pointer-events-none" />
      <div className="absolute bottom-6 left-6 w-12 h-12 rounded-full bg-[#111] shadow-[inset_0_1px_3px_rgba(0,0,0,1),0_1px_0_rgba(255,255,255,0.1)] flex items-center justify-center">
        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'bg-gray-700'}`} />
      </div>
      <div className="absolute bottom-6 right-8 flex flex-col gap-2">
         <div className="w-1 h-8 bg-[#222] rounded-full relative overflow-hidden">
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-amber-500" />
         </div>
         <span className="text-[8px] text-gray-500 font-mono uppercase">Pitch</span>
      </div>
      <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] rounded-full bg-[#0a0a0a] shadow-[0_5px_15px_rgba(0,0,0,0.8)] border-4 border-[#151515] flex items-center justify-center">
        <div className="absolute inset-2 rounded-full bg-[#111]" />
        <div className="w-[92%] h-[92%]">
           <VinylRecord track={track} isPlaying={isPlaying} />
        </div>
      </div>
      <Tonearm isActive={isTonearmMoving} />
    </div>
  );
};

export default function MusicApp() {
  const [activeTrack, setActiveTrack] = useState(null);
  const [isTonearmMoving, setIsTonearmMoving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [immersiveMode, setImmersiveMode] = useState(false);
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (isPlaying || isTonearmMoving) {
      setIsPlaying(false);
      setIsTonearmMoving(false);
      setImmersiveMode(false);
    } else {
      setIsTonearmMoving(true);
      setTimeout(() => {
        setIsPlaying(true);
      }, 2000);
    }
  };

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(() => {
        setImmersiveMode(true);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isPlaying]);

  useEffect(() => {
    let interval;
    if (isPlaying && activeTrack) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            setIsTonearmMoving(false);
            setImmersiveMode(false);
            return 0;
          }
          return prev + 0.2;
        });
        setCurrentLyricIndex((prev) => {
             const totalLyrics = activeTrack.lyrics.length;
             const lyricsPerPercent = 100 / totalLyrics;
             const newIndex = Math.floor(progress / lyricsPerPercent);
             return Math.min(newIndex, totalLyrics - 1);
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeTrack, progress]);

  const handleSelectTrack = (track) => {
    setActiveTrack(track);
    setIsPlaying(false);
    setIsTonearmMoving(false);
    setImmersiveMode(false);
    setProgress(0);
  };

  const handleClosePlayer = () => {
    setIsPlaying(false);
    setIsTonearmMoving(false);
    setImmersiveMode(false);
    setActiveTrack(null);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-amber-500 selection:text-black overflow-x-hidden relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500&display=swap');

        .font-lyrics { font-family: 'Cormorant Garamond', serif; }
        .font-sans { font-family: 'Inter', sans-serif; }

        .animate-spin-slow { animation: spin 6s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>

      {/* Фильтр шума удален для чистоты картинки */}

      {/* --- ГЛАВНАЯ: КАТАЛОГ --- */}
      <div className={`transition-all duration-1000 ease-out ${activeTrack ? 'opacity-0 scale-95 pointer-events-none blur-md fixed inset-0' : 'opacity-100 scale-100 relative'}`}>

        <header className="px-8 py-16 md:py-24 text-center">
          <p className="text-amber-500/80 tracking-[0.2em] text-xs uppercase mb-4 font-sans">Archive</p>
          <h1 className="text-5xl md:text-7xl font-lyrics italic bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-500">
            Music Translations
          </h1>
        </header>

        <main className="max-w-7xl mx-auto px-6 pb-32">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-20">
            {TRACKS.map((track) => (
              <div
                key={track.id}
                onClick={() => handleSelectTrack(track)}
                className="group cursor-pointer relative flex items-center p-4 rounded-3xl hover:bg-white/[0.02] transition-colors"
              >
                {/* 1. Конверт */}
                <div className="relative z-20 w-48 h-48 bg-[#0f0f0f] shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-sm flex flex-col justify-between p-5 border border-white/5 group-hover:-translate-x-4 transition-transform duration-700 ease-out">
                  <div className={`w-full h-full bg-gradient-to-br ${track.color} opacity-20 absolute inset-0 blur-xl`} />
                  <div className="relative z-10 text-[10px] text-gray-500 font-mono uppercase tracking-widest">Stereo</div>
                  <div className="relative z-10 font-lyrics text-2xl text-gray-200 leading-none">{track.artist}</div>
                </div>

                {/* 2. Пластинка (Торчит только край, left-20) */}
                <div className="absolute left-20 z-10 w-40 h-40 transition-transform duration-700 ease-out group-hover:translate-x-24 group-hover:rotate-12">
                  <VinylRecord track={track} isPlaying={false} />
                </div>

                {/* 3. Название */}
                <div className="ml-40 pl-8 flex flex-col justify-center border-l border-white/5 h-32 group-hover:border-amber-500/30 transition-colors">
                  <h3 className="text-4xl font-lyrics italic text-gray-400 group-hover:text-white transition-colors duration-300">
                    {track.title}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>


      {/* --- ПРОИГРЫВАТЕЛЬ --- */}
      {activeTrack && (
        <div className="fixed inset-0 z-[60] overflow-hidden bg-[#050505]">

          {/* ФОНОВЫЙ ЦВЕТ */}
          <div className={`absolute inset-0 bg-gradient-to-br ${activeTrack.color} transition-all duration-[2000ms]
            ${immersiveMode ? 'opacity-0' : 'opacity-20 blur-[120px]'}`} />

          {/* ТОНЕР (Черный занавес) */}
          <div className={`absolute inset-0 bg-black/95 transition-opacity duration-[2000ms] ease-in-out pointer-events-none
            ${immersiveMode ? 'opacity-100' : 'opacity-0'}`} />

          {/* CLOSE BUTTON */}
          <button
            onClick={handleClosePlayer}
            className={`absolute top-8 right-8 z-50 p-3 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all duration-1000
              ${immersiveMode ? 'opacity-0 -translate-y-4 pointer-events-none' : 'opacity-100 translate-y-0'}`}
          >
            <X size={24} strokeWidth={1} />
          </button>


          {/* КОНТЕНТ */}
          <div className="relative w-full h-full flex items-center justify-center px-4">

            {/* СЕКЦИЯ ВЕРТУШКИ */}
            <div className={`absolute flex flex-col items-center transition-all duration-[2000ms] ease-in-out
               ${immersiveMode ? 'opacity-0 scale-110 blur-lg pointer-events-none' : 'opacity-100 scale-100 blur-0'}`}>

              <Turntable track={activeTrack} isPlaying={isPlaying} isTonearmMoving={isTonearmMoving} />

              <div className="mt-12 text-center space-y-2">
                 <h2 className="text-5xl font-lyrics italic text-white">{activeTrack.title}</h2>
                 <p className="text-amber-500 uppercase tracking-[0.3em] text-xs">{activeTrack.artist}</p>
              </div>
            </div>


            {/* СЕКЦИЯ ТЕКСТА (С ЗАДЕРЖКОЙ 2 СЕКУНДЫ) */}
            <div className={`relative z-50 w-full max-w-3xl text-center transition-all duration-[1000ms]
               ${immersiveMode
                 ? 'opacity-100 translate-y-0 delay-[2000ms]'
                 : 'opacity-0 translate-y-20 pointer-events-none delay-0'}`}>

              {isPlaying && (
                <div className="space-y-12">
                   {/* Предыдущая строка */}
                   <p className="text-2xl text-white/20 font-lyrics italic blur-[1px] transition-all duration-700">
                     {activeTrack.lyrics[currentLyricIndex - 1] || "..."}
                   </p>

                   {/* Активная строка */}
                   <p className="text-5xl md:text-7xl font-lyrics italic leading-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      "{activeTrack.lyrics[currentLyricIndex]}"
                   </p>

                   {/* Следующая строка */}
                   <p className="text-2xl text-white/20 font-lyrics italic blur-[1px] transition-all duration-700">
                     {activeTrack.lyrics[currentLyricIndex + 1] || "..."}
                   </p>
                </div>
              )}
            </div>


            {/* КОНТРОЛЛЕРЫ */}
            <div className={`absolute bottom-12 w-full max-w-xl px-6 transition-all duration-[1500ms]
              ${immersiveMode ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'}`}>

              <div className="w-full bg-white/5 h-[1px] rounded-full mb-8 flex items-center">
                <div
                  className="bg-amber-500 h-[2px] rounded-full relative shadow-[0_0_10px_rgba(245,158,11,0.8)] transition-all duration-300 ease-linear"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-white/40">
                 <SkipBack size={24} className="hover:text-white cursor-pointer transition-colors" />

                 <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white hover:text-black hover:scale-105 hover:border-white transition-all flex items-center justify-center"
                 >
                    {isPlaying || isTonearmMoving ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" /> }
                 </button>

                 <SkipForward size={24} className="hover:text-white cursor-pointer transition-colors" />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
