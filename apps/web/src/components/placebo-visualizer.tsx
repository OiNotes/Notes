"use client";

import React, { useEffect, useRef, useState } from 'react';
import { X, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

// --- TYPES ---
type Track = {
  id: string;
  artist: string;
  title: string;
  color: string;
  coverUrl?: string;
  lyrics: (string | { original: string; translation: string; time?: number })[];
  audioSrc?: string | null;
  syncedLyrics?: {
    id: number;
    original: string;
    translation: string;
    time: number;
    isSynced: boolean;
  }[];
};

type PlaceboVisualizerProps = {
  activeTrack: Track;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onSeek: (time: number) => void;
  onClose: () => void;
};

// --- VISUAL EFFECTS CLASSES ---
class Scratch {
  x: number = 0;
  y: number = 0;
  length: number = 0;
  angle: number = 0;
  life: number = 0;
  width: number = 0;
  opacity: number = 0;
  canvasWidth: number = 0;
  canvasHeight: number = 0;

  constructor(w: number, h: number) {
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvasWidth;
    this.y = Math.random() * this.canvasHeight;
    this.length = Math.random() * 100 + 50;
    this.angle = (Math.PI / 2) + (Math.random() * 0.2 - 0.1); 
    this.life = Math.random() * 10 + 2;
    this.width = Math.random() * 2 + 0.5;
    this.opacity = Math.random() * 0.5 + 0.1;
  }

  update() {
    this.life--;
    if (this.life <= 0) this.reset();
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(this.x + Math.cos(this.angle) * this.length, this.y + Math.sin(this.angle) * this.length);
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.lineWidth = this.width;
    ctx.stroke();
  }
}

class Pill {
  x: number = 0;
  y: number = 0;
  size: number = 0;
  angle: number = 0;
  rotationSpeed: number = 0;
  speedY: number = 0;
  opacity: number = 0;
  canvasWidth: number = 0;
  canvasHeight: number = 0;

  constructor(w: number, h: number) {
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.reset();
  }
  
  reset() {
    this.x = Math.random() * this.canvasWidth;
    this.y = Math.random() * -this.canvasHeight;
    this.size = Math.random() * 10 + 5;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    this.speedY = Math.random() * 3 + 1;
    this.opacity = Math.random() * 0.6 + 0.2;
  }
  
  update() {
    this.y += this.speedY;
    this.angle += this.rotationSpeed;
    if (this.y > this.canvasHeight + this.size) this.reset();
  }
  
  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.beginPath();
    ctx.moveTo(-this.size, -this.size/2);
    ctx.lineTo(this.size, -this.size/2);
    ctx.arc(this.size, 0, this.size/2, -Math.PI/2, Math.PI/2);
    ctx.lineTo(-this.size, this.size/2);
    ctx.arc(-this.size, 0, this.size/2, Math.PI/2, -Math.PI/2);
    ctx.closePath();
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, -this.size/2);
    ctx.lineTo(0, this.size/2);
    ctx.stroke();
    ctx.restore();
  }
}

class PendulumClock {
  centerX: number = 0;
  centerY: number = 0;
  radius: number = 0;
  pendulumLength: number = 0;
  pendulumAngle: number = 0;
  tickTockState: number = 0;

  resize(w: number, h: number) {
    this.centerX = w / 2;
    this.centerY = h / 3;
    this.radius = Math.min(w, h) * 0.15;
    this.pendulumLength = this.radius * 2.5;
  }
  
  update(isTickTock: boolean) {
    if (isTickTock) {
      this.pendulumAngle = Math.sin(Date.now() / 500) * (Math.PI / 6);
      if (Math.random() > 0.8) {
        this.tickTockState = this.tickTockState === 0 ? 1 : 0;
      }
    } else {
      this.pendulumAngle = Math.sin(Date.now() / 1000) * (Math.PI / 8);
    }
  }
  
  draw(ctx: CanvasRenderingContext2D, isTickTock: boolean) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;

    // Clock Face
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(this.centerX, this.centerY, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();

    const minuteHandAngle = this.tickTockState === 0 ? Math.PI * 1.5 : Math.PI * 1.7;
    const hourHandAngle = this.tickTockState === 0 ? Math.PI * 0.5 : Math.PI * 0.7;
    this.drawHand(ctx, this.centerX, this.centerY, this.radius * 0.8, minuteHandAngle, 2);
    this.drawHand(ctx, this.centerX, this.centerY, this.radius * 0.5, hourHandAngle, 3);

    const pendulumX = this.centerX + Math.sin(this.pendulumAngle) * this.pendulumLength;
    const pendulumY = this.centerY + Math.cos(this.pendulumAngle) * this.pendulumLength;
    
    ctx.beginPath();
    ctx.moveTo(this.centerX, this.centerY + this.radius);
    for(let i=0; i<5; i++) {
       ctx.lineTo(this.centerX + (Math.random()-0.5)*5, this.centerY + this.radius + (this.pendulumLength/5)*i);
    }
    ctx.lineTo(pendulumX, pendulumY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(pendulumX, pendulumY, this.radius * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    
    for(let i=0; i<10; i++) {
         ctx.beginPath();
         ctx.moveTo(pendulumX + (Math.random()-0.5)*this.radius*0.4, pendulumY + (Math.random()-0.5)*this.radius*0.4);
         ctx.lineTo(pendulumX + (Math.random()-0.5)*this.radius*0.4, pendulumY + (Math.random()-0.5)*this.radius*0.4);
         ctx.stroke();
    }

    ctx.restore();
  }

  drawHand(ctx: CanvasRenderingContext2D, x: number, y: number, length: number, angle: number, width: number) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0,0);
    for(let i=0; i<5; i++) {
       ctx.lineTo((length/5)*i, (Math.random()-0.5)*width*2);
    }
    ctx.lineTo(length, 0);
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.restore();
  }
}

const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const PlaceboVisualizer = ({ activeTrack, currentTime, duration, isPlaying, onTogglePlay, onSeek, onClose }: PlaceboVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lyricLine, setLyricLine] = useState<{ en: string, ru: string, isTickTock?: boolean, isExplosion?: boolean, isFall?: boolean }>({ en: '', ru: '' });
  const [flashIntensity, setFlashIntensity] = useState(0);
  const [showClock, setShowClock] = useState(false);
  const [showPills, setShowPills] = useState(false);
  const requestRef = useRef<number>();
  
  // Effect references
  const scratchesRef = useRef<Scratch[]>([]);
  const pillsRef = useRef<Pill[]>([]);
  const clockRef = useRef<PendulumClock>(new PendulumClock());

  // --- LYRIC SYNC ENGINE ---
  useEffect(() => {
    if (!activeTrack.lyrics) return;

    const lyrics = activeTrack.syncedLyrics || activeTrack.lyrics;
    
    // Logic: Find the active line for current timestamp
    // Since lines are ordered by time, we take the last one that has started
    // @ts-ignore
    let activeIndex = -1;
    // @ts-ignore
    for (let i = 0; i < lyrics.length; i++) {
        // @ts-ignore
        if ((lyrics[i].time || 0) <= currentTime) {
            activeIndex = i;
        } else {
            break;
        }
    }

    const current = activeIndex !== -1 ? lyrics[activeIndex] : null;

    if (current && typeof current !== 'string') {
      let en = current.original || '';
      let ru = current.translation || '';

      // Handle Appending
      // @ts-ignore
      if (current.isAppend) {
         let prevIdx = activeIndex - 1;
         // @ts-ignore
         while (prevIdx >= 0 && lyrics[prevIdx + 1].isAppend) {
             // @ts-ignore
             const prev = lyrics[prevIdx];
             en = (prev.original || '') + " " + en;
             ru = (prev.translation || '') + " " + ru;
             // @ts-ignore
             if (!prev.isAppend) break;
             prevIdx--;
         }
      }
      
      // Detect keywords for effects
      const lowerEn = en.toLowerCase();
      const isTickTock = lowerEn.includes('tick') && lowerEn.includes('tock');
      const isExplosion = lowerEn.includes('unclean') || lowerEn.includes('libertine') || lowerEn.includes('spleen');
      const isFall = lowerEn.includes('fall') || lowerEn.includes('nothing');

      setLyricLine({ en, ru, isTickTock, isExplosion, isFall });
      
      setShowClock(!!isTickTock);
      setShowPills(!!isExplosion);
      
      // Trigger Flash on specific beats (only once per line change ideally, but simple here is fine)
      if ((isTickTock || isExplosion) && lyricLine.en !== en) {
          setFlashIntensity(0.8);
      }

    } else {
        // No active lyric (intro or silence)
        setLyricLine({ en: '', ru: '' });
        setShowClock(false);
        setShowPills(false);
    }
  }, [currentTime, activeTrack]);

  // --- ANIMATION LOOP ---
  const stateRef = useRef({ showClock, showPills, flashIntensity });
  useEffect(() => {
      stateRef.current = { showClock, showPills, flashIntensity };
  }, [showClock, showPills, flashIntensity]);

  const animateRef = useRef<() => void>();
  animateRef.current = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const state = stateRef.current;

      // Trails
      ctx.fillStyle = 'rgba(10, 10, 10, 0.4)';
      ctx.fillRect(0, 0, width, height);

      // Clock (Always draw in background for style, tick-tock makes it frantic)
      // If not in specific section, draw it calm
      if (state.showClock) {
        clockRef.current.update(true);
        clockRef.current.draw(ctx, true);
      } else {
        clockRef.current.update(false);
        // HIDE CLOCK COMPLETELY unless tick-tock
        // ctx.save();
        // ctx.globalAlpha = 0.1;
        // clockRef.current.draw(ctx, false);
        // ctx.restore();
      }

      // Pills
      if (state.showPills) {
         pillsRef.current.forEach(p => {
           p.update();
           p.draw(ctx);
         });
      }

      // Scratches
      scratchesRef.current.forEach(s => {
        s.update();
        s.draw(ctx);
      });

      // Static (Noise)
      for (let i = 0; i < 3000; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.1)';
        ctx.fillRect(x, y, 2, 2);
      }

      // Scanlines
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      for (let i = 0; i < height; i += 4) {
          ctx.fillRect(0, i, width, 1);
      }

      // Static Vignette (No mouse follow)
      const gradient = ctx.createRadialGradient(width/2, height/2, width/4, width/2, height/2, width);
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(0.7, 'rgba(0,0,0,0.5)');
      gradient.addColorStop(1, 'rgba(0,0,0,0.95)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Flash
      if (state.flashIntensity > 0.01) {
          ctx.fillStyle = `rgba(255, 255, 255, ${state.flashIntensity})`;
          ctx.fillRect(0, 0, width, height);
          stateRef.current.flashIntensity *= 0.9;
          if (stateRef.current.flashIntensity < 0.01) setFlashIntensity(0); 
      }

      // Glitch
      if (Math.random() > 0.97) {
          const shiftX = Math.random() * 10 - 5;
          const offset = Math.random() * 100;
          const h = Math.random() * 50;
          try {
              const imageData = ctx.getImageData(0, offset, width, h);
              ctx.putImageData(imageData, shiftX, offset);
          } catch(e) {}
           ctx.fillStyle = `rgba(255, 255, 255, 0.05)`;
           ctx.fillRect(0, 0, width, height);
      }

      requestRef.current = requestAnimationFrame(animateRef.current!);
  };

  // --- SETUP ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      scratchesRef.current = Array.from({ length: 20 }, () => new Scratch(canvas.width, canvas.height));
      pillsRef.current = Array.from({ length: 15 }, () => new Pill(canvas.width, canvas.height));
      clockRef.current.resize(canvas.width, canvas.height);
    };
    
    resize();
    window.addEventListener('resize', resize);
    
    // Start Loop immediately (even if paused, we want the static noise/vignette)
    requestRef.current = requestAnimationFrame(animateRef.current!);

    return () => {
        window.removeEventListener('resize', resize);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []); // Run once on mount

  return (
    <div className="fixed inset-0 z-[60] bg-[#050505] overflow-hidden text-[#ddd] select-none">
       <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Special+Elite&family=Bad+Script&display=swap');
        .font-elite { font-family: 'Special Elite', monospace; }
        .font-script { font-family: 'Bad Script', cursive; }
       `}</style>

       <canvas ref={canvasRef} className="absolute top-0 left-0 z-10 block" />

       {/* LYRICS LAYER */}
       <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-none mix-blend-exclusion p-8 text-center pb-32">
          <div className="transform transition-all duration-500" style={{
               opacity: lyricLine.en ? 1 : 0,
               textShadow: lyricLine.isFall ? "4px 4px 0px rgba(200, 0, 0, 0.5)" : "2px 2px 0px rgba(255, 255, 255, 0.1)",
               transform: `scale(${0.95 + Math.random() * 0.1}) rotate(${(Math.random() * 2 - 1)}deg)`
          }}>
              <div className="text-3xl sm:text-5xl md:text-7xl font-elite uppercase tracking-widest mb-6 filter blur-[0.5px]">
                  {lyricLine.en}
              </div>
              <div className="text-xl sm:text-3xl font-script text-[#aaa] italic">
                  {lyricLine.ru}
              </div>
          </div>
       </div>

       {/* PLAYER CONTROLS LAYER (Styled) */}
       <div className="absolute bottom-0 left-0 right-0 z-50 p-8 md:p-12 flex flex-col gap-6 bg-gradient-to-t from-black via-black/80 to-transparent">
          
          {/* Progress Bar */}
          <div className="w-full group cursor-pointer" 
               onClick={(e) => {
                 const rect = e.currentTarget.getBoundingClientRect();
                 const percent = (e.clientX - rect.left) / rect.width;
                 onSeek(percent * duration);
               }}>
            <div className="h-1 w-full bg-white/20 relative overflow-hidden">
               <div className="absolute top-0 left-0 h-full bg-[#eee] shadow-[0_0_10px_white]" style={{ width: `${(currentTime / duration) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs font-elite mt-2 text-white/50">
               <span>{formatTime(currentTime)}</span>
               <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
             <div className="flex flex-col">
                <h1 className="text-2xl md:text-3xl font-elite uppercase tracking-widest text-white">{activeTrack.title}</h1>
                <p className="text-sm md:text-lg font-elite text-white/50">{activeTrack.artist}</p>
             </div>

             <div className="flex items-center gap-8">
                <button onClick={() => onSeek(currentTime - 10)} className="text-white/50 hover:text-white transition-colors">
                   <SkipBack size={32} />
                </button>
                
                <button 
                   onClick={onTogglePlay} 
                   className="w-16 h-16 border-2 border-[#eee] rounded-full flex items-center justify-center hover:bg-[#eee] hover:text-black transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                >
                   {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </button>

                <button onClick={() => onSeek(currentTime + 10)} className="text-white/50 hover:text-white transition-colors">
                   <SkipForward size={32} />
                </button>
             </div>
          </div>
       </div>

       {/* Close Button */}
       <button 
         onClick={onClose} 
         className="absolute top-6 right-6 z-50 p-2 text-white/50 hover:text-white border border-transparent hover:border-white/20 rounded-full transition-all cursor-pointer mix-blend-difference"
       >
         <X size={32} />
       </button>
    </div>
  );
};