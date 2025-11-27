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
  baseSpeedY: number = 0;
  opacity: number = 0;
  type: 'capsule' | 'round' = 'capsule';
  color: string = '255, 255, 255';
  canvasWidth: number = 0;
  canvasHeight: number = 0;

  constructor(w: number, h: number) {
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.reset();
  }

  reset() {
    this.x = Math.random() * this.canvasWidth;
    this.y = Math.random() * -this.canvasHeight - 50; // Start well above
    this.size = Math.random() * 15 + 8;
    this.angle = Math.random() * Math.PI * 2;
    this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    this.baseSpeedY = Math.random() * 1 + 0.5; // Slow base speed
    this.opacity = Math.random() * 0.5 + 0.3;
    this.type = Math.random() > 0.6 ? 'round' : 'capsule';
    
    // Random pill colors (white, pale blue, pale red)
    const colors = ['255, 255, 255', '200, 220, 255', '255, 200, 200'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update(speedMultiplier: number) {
    this.y += this.baseSpeedY * speedMultiplier;
    this.angle += this.rotationSpeed * Math.sqrt(speedMultiplier); // Spin faster when moving fast
    
    if (this.y > this.canvasHeight + this.size) {
        this.reset();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    
    ctx.strokeStyle = `rgba(${this.color}, ${this.opacity})`;
    ctx.lineWidth = 1.5;

    if (this.type === 'capsule') {
        ctx.beginPath();
        ctx.moveTo(-this.size, -this.size/2);
        ctx.lineTo(this.size, -this.size/2);
        ctx.arc(this.size, 0, this.size/2, -Math.PI/2, Math.PI/2);
        ctx.lineTo(-this.size, this.size/2);
        ctx.arc(-this.size, 0, this.size/2, Math.PI/2, -Math.PI/2);
        ctx.closePath();
        ctx.stroke();
        
        // Line across middle
        ctx.beginPath();
        ctx.moveTo(0, -this.size/2);
        ctx.lineTo(0, this.size/2);
        ctx.strokeStyle = `rgba(${this.color}, ${this.opacity * 0.5})`;
        ctx.stroke();
    } else {
        // Round pill
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.8, 0, Math.PI*2);
        ctx.stroke();
        
        // Cross imprint
        ctx.beginPath();
        ctx.moveTo(-this.size*0.4, 0);
        ctx.lineTo(this.size*0.4, 0);
        ctx.moveTo(0, -this.size*0.4);
        ctx.lineTo(0, this.size*0.4);
        ctx.stroke();
    }

    ctx.restore();
  }
}

// --- SCREEN TEAR EFFECT ---
class ScreenTear {
  y: number = 0;
  height: number = 0;
  offsetX: number = 0;
  life: number = 0;
  maxLife: number = 0;
  canvasWidth: number = 0;
  canvasHeight: number = 0;
  rgbOffset: number = 0;

  constructor(w: number, h: number) {
    this.canvasWidth = w;
    this.canvasHeight = h;
    this.reset();
  }

  reset() {
    this.y = Math.random() * this.canvasHeight;
    this.height = Math.random() * 30 + 10;
    this.offsetX = (Math.random() - 0.5) * 40;
    this.rgbOffset = Math.random() * 8 + 2;
    this.maxLife = Math.random() * 20 + 10;
    this.life = this.maxLife;
  }

  update() {
    this.life--;
    // Glitch movement
    if (Math.random() > 0.7) {
      this.offsetX += (Math.random() - 0.5) * 10;
    }
  }

  isAlive() {
    return this.life > 0;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.isAlive()) return;

    const alpha = this.life / this.maxLife;

    try {
      // Get image data for the tear region
      const imageData = ctx.getImageData(0, this.y, this.canvasWidth, this.height);

      // Apply chromatic aberration (RGB separation)
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const pixel = Math.floor(i / 4);
        const x = pixel % this.canvasWidth;

        // Shift red channel left
        const redOffset = Math.min(Math.max(0, (x - this.rgbOffset) * 4), data.length - 4);
        // Shift blue channel right
        const blueOffset = Math.min(Math.max(0, (x + this.rgbOffset) * 4), data.length - 4);

        if (redOffset >= 0 && blueOffset < data.length) {
          data[i] = data[redOffset] || data[i]; // Red
          data[i + 2] = data[blueOffset + 2] || data[i + 2]; // Blue
        }
      }

      // Put displaced
      ctx.putImageData(imageData, this.offsetX * alpha, this.y);

      // Draw tear line
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, this.y);
      ctx.lineTo(this.canvasWidth, this.y);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, this.y + this.height);
      ctx.lineTo(this.canvasWidth, this.y + this.height);
      ctx.stroke();
    } catch (e) {
      // Canvas security error, skip
    }
  }
}

// --- STITCH EFFECT (зашивание) ---
class Stitch {
  startX: number = 0;
  startY: number = 0;
  endX: number = 0;
  endY: number = 0;
  controlX: number = 0;
  controlY: number = 0;
  progress: number = 0;
  duration: number = 0;
  stitchCount: number = 0;

  constructor(w: number, h: number) {
    // Create stitch from edge to center
    const side = Math.floor(Math.random() * 4); // 0=top, 1=right, 2=bottom, 3=left
    const centerX = w / 2 + (Math.random() - 0.5) * 100;
    const centerY = h / 2 + (Math.random() - 0.5) * 100;

    switch(side) {
      case 0: // top
        this.startX = Math.random() * w;
        this.startY = 0;
        break;
      case 1: // right
        this.startX = w;
        this.startY = Math.random() * h;
        break;
      case 2: // bottom
        this.startX = Math.random() * w;
        this.startY = h;
        break;
      case 3: // left
        this.startX = 0;
        this.startY = Math.random() * h;
        break;
    }

    this.endX = centerX;
    this.endY = centerY;
    this.controlX = (this.startX + this.endX) / 2 + (Math.random() - 0.5) * 100;
    this.controlY = (this.startY + this.endY) / 2 + (Math.random() - 0.5) * 100;
    this.duration = 60 + Math.random() * 40;
    this.progress = 0;
    this.stitchCount = Math.floor(Math.random() * 8) + 5;
  }

  update() {
    this.progress++;
  }

  isAlive() {
    return this.progress < this.duration;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const t = Math.min(this.progress / this.duration, 1);
    const easeOut = 1 - Math.pow(1 - t, 3);

    // Calculate current point on bezier
    const currentX = Math.pow(1-easeOut,2)*this.startX + 2*(1-easeOut)*easeOut*this.controlX + Math.pow(easeOut,2)*this.endX;
    const currentY = Math.pow(1-easeOut,2)*this.startY + 2*(1-easeOut)*easeOut*this.controlY + Math.pow(easeOut,2)*this.endY;

    ctx.save();
    ctx.strokeStyle = `rgba(180, 50, 50, ${0.8 - t * 0.5})`;
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 4]); // Dashed line like stitches

    ctx.beginPath();
    ctx.moveTo(this.startX, this.startY);
    ctx.quadraticCurveTo(this.controlX, this.controlY, currentX, currentY);
    ctx.stroke();

    // Draw stitch crosses along the line
    ctx.setLineDash([]);
    ctx.strokeStyle = `rgba(200, 80, 80, ${0.6 - t * 0.3})`;
    ctx.lineWidth = 1.5;

    const stitchesDrawn = Math.floor(this.stitchCount * easeOut);
    for (let i = 0; i < stitchesDrawn; i++) {
      const st = i / this.stitchCount;
      const sx = Math.pow(1-st,2)*this.startX + 2*(1-st)*st*this.controlX + Math.pow(st,2)*this.endX;
      const sy = Math.pow(1-st,2)*this.startY + 2*(1-st)*st*this.controlY + Math.pow(st,2)*this.endY;

      // Cross stitch
      ctx.beginPath();
      ctx.moveTo(sx - 4, sy - 4);
      ctx.lineTo(sx + 4, sy + 4);
      ctx.moveTo(sx + 4, sy - 4);
      ctx.lineTo(sx - 4, sy + 4);
      ctx.stroke();
    }

    ctx.restore();
  }
}

// --- INK SPLATTER ---
class InkDroplet {
  x: number = 0;
  y: number = 0;
  targetX: number = 0;
  targetY: number = 0;
  size: number = 0;
  progress: number = 0;
  duration: number = 0;
  opacity: number = 0;
  color: string = '';

  constructor(originX: number, originY: number) {
    this.x = originX;
    this.y = originY;
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 80 + 20;
    this.targetX = originX + Math.cos(angle) * distance;
    this.targetY = originY + Math.sin(angle) * distance;
    this.size = Math.random() * 12 + 3;
    this.duration = Math.random() * 40 + 30;
    this.progress = 0;
    this.opacity = Math.random() * 0.4 + 0.3;
    // Dark colors: black, dark red, dark purple
    const colors = ['rgba(20, 20, 20,', 'rgba(60, 10, 10,', 'rgba(30, 10, 40,'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    this.progress++;
  }

  isAlive() {
    return this.progress < this.duration;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const t = Math.min(this.progress / this.duration, 1);
    const easeOut = 1 - Math.pow(1 - t, 2);

    const currentX = this.x + (this.targetX - this.x) * easeOut;
    const currentY = this.y + (this.targetY - this.y) * easeOut;
    const currentSize = this.size * (1 + easeOut * 0.5);
    const alpha = this.opacity * (1 - t * 0.7);

    // Draw ink blob with gradient
    const gradient = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, currentSize);
    gradient.addColorStop(0, `${this.color} ${alpha})`);
    gradient.addColorStop(0.6, `${this.color} ${alpha * 0.5})`);
    gradient.addColorStop(1, `${this.color} 0)`);

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(currentX, currentY, currentSize, 0, Math.PI * 2);
    ctx.fill();
  }
}

class InkSplatter {
  droplets: InkDroplet[] = [];

  spawn(x: number, y: number, count: number = 12) {
    for (let i = 0; i < count; i++) {
      this.droplets.push(new InkDroplet(x, y));
    }
  }

  update() {
    this.droplets.forEach(d => d.update());
    this.droplets = this.droplets.filter(d => d.isAlive());
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.droplets.forEach(d => d.draw(ctx));
  }
}

// --- NERVOUS SCRIBBLE (Specific Trigger Only) ---
class NervousScribble {
  x: number = 0;
  y: number = 0;
  type: number = 0; 
  life: number = 0;
  points: {x: number, y: number}[] = [];
  width: number = 0;
  height: number = 0;
  
  constructor(w: number, h: number) {
      this.width = w;
      this.height = h;
      this.reset();
  }
  
  reset() {
      this.x = Math.random() * this.width;
      this.y = Math.random() * this.height;
      this.type = Math.floor(Math.random() * 3);
      this.life = Math.random() * 5 + 2; 
      
      this.points = [];
      let cx = 0, cy = 0;
      for(let i=0; i<8; i++) {
          cx += (Math.random() - 0.5) * 30;
          cy += (Math.random() - 0.5) * 30;
          this.points.push({x: cx, y: cy});
      }
  }
  
  spawn() {
      this.life = Math.random() * 10 + 5;
      this.x = Math.random() * this.width;
      this.y = Math.random() * this.height;
  }

  update() {
      this.life--;
  }
  
  draw(ctx: CanvasRenderingContext2D) {
      if (this.life <= 0) return;
      
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      
      if (this.type === 0) { // Frantic Circle
          ctx.beginPath();
          for(let i=0; i<3; i++) {
              ctx.ellipse(0, 0, 10 + Math.random()*5, 10 + Math.random()*5, Math.random(), 0, Math.PI*2);
          }
          ctx.stroke();
      } else if (this.type === 1) { // Violent Cross
          ctx.beginPath();
          const s = 15;
          ctx.moveTo(-s, -s); ctx.lineTo(s, s);
          ctx.moveTo(s, -s); ctx.lineTo(-s, s);
          ctx.stroke();
      } else { // Text Scribble
          ctx.beginPath();
          ctx.moveTo(0,0);
          for(let p of this.points) ctx.lineTo(p.x, p.y);
          ctx.stroke();
      }
      ctx.restore();
  }
}


class PendulumClock {
  centerX: number = 0;
  centerY: number = 0;
  radius: number = 0;
  pendulumLength: number = 0;
  
  // Pendulum Physics (Smooth & Heavy)
  angle: number = Math.PI / 4;
  angularVelocity: number = 0;
  angularAcceleration: number = 0;
  gravity: number = 0.0025; 
  damping: number = 0.995; 

  // Hand Physics (Broken/Chaotic)
  hourAngle: number = 0;
  minuteAngle: number = 0;
  handState: 'STILL' | 'CRAWL' | 'SPIN' | 'TWITCH' | 'REVERSE' = 'CRAWL';
  handTimer: number = 0;

  // Horror / Glitch State
  time: number = 0;
  visibility: number = 1; // 0 to 1
  glitchOffsetX: number = 0;
  glitchOffsetY: number = 0;
  isBroken: boolean = false;

  resize(w: number, h: number) {
    this.centerX = w / 2;
    this.centerY = h * 0.3; // Clock face visible at top 30%
    this.radius = Math.min(w, h) * 0.12; // Smaller clock face
    this.pendulumLength = h * 0.5; // Hangs down
  }

  update(isTickTock: boolean) {
    this.time++;

    // --- 1. Pendulum Physics (Always Smooth & Heavy) ---
    this.angularAcceleration = -this.gravity * Math.sin(this.angle);
    this.angularVelocity += this.angularAcceleration;
    this.angularVelocity *= this.damping;
    this.angle += this.angularVelocity;

    // --- 2. Hands Chaos Engine ---
    this.handTimer--;
    if (this.handTimer <= 0) {
      // Change behavior randomly
      const rand = Math.random();
      if (rand < 0.4) this.handState = 'CRAWL';
      else if (rand < 0.6) this.handState = 'TWITCH';
      else if (rand < 0.8) this.handState = 'SPIN';
      else if (rand < 0.9) this.handState = 'STILL';
      else this.handState = 'REVERSE';
      
      this.handTimer = Math.random() * 60 + 10; // Duration of state
    }

    // Execute Hand Behavior
    const speedMult = isTickTock ? 3 : 1;

    switch (this.handState) {
      case 'CRAWL':
        this.minuteAngle += 0.005 * speedMult;
        this.hourAngle += 0.0005 * speedMult;
        break;
      case 'SPIN':
        this.minuteAngle += 0.3 * speedMult;
        this.hourAngle -= 0.1 * speedMult; // Counter-rotate
        break;
      case 'TWITCH':
        if (this.time % 5 === 0) {
           this.minuteAngle += (Math.random() - 0.5) * 0.5;
           this.hourAngle += (Math.random() - 0.5) * 0.5;
        }
        break;
      case 'REVERSE':
        this.minuteAngle -= 0.05 * speedMult;
        this.hourAngle -= 0.01 * speedMult;
        break;
      case 'STILL':
        // Do nothing, uncanny stillness
        break;
    }

    // --- 3. Visibility Strobe (The "Horror Movie" flicker) ---
    // Base visibility is high, but dips to 0 randomly
    if (isTickTock || Math.random() > 0.98) {
        if (Math.random() > 0.7) {
           this.visibility = 0; // Disappear
        } else if (Math.random() > 0.7) {
           this.visibility = Math.random(); // Flicker
        } else {
           this.visibility = 1;
        }
        
        // Position Glitch (Jitter)
        if (Math.random() > 0.8) {
            this.glitchOffsetX = (Math.random() - 0.5) * 20;
            this.glitchOffsetY = (Math.random() - 0.5) * 20;
        } else {
            this.glitchOffsetX = 0;
            this.glitchOffsetY = 0;
        }
    } else {
        // Calm state - slowly fade back to visible
        if (this.visibility < 1) this.visibility += 0.05;
        this.glitchOffsetX = 0;
        this.glitchOffsetY = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D, isTickTock: boolean) {
    if (this.visibility < 0.05) return; // Invisible

    ctx.save();
    ctx.translate(this.centerX + this.glitchOffsetX, this.centerY + this.glitchOffsetY);
    ctx.globalAlpha = this.visibility;

    // 1. Draw Pendulum (Hanging from clock)
    const bobX = Math.sin(this.angle) * this.pendulumLength;
    const bobY = Math.cos(this.angle) * this.pendulumLength;
    
    // Pendulum Rod (Thin, barely visible wire)
    ctx.beginPath();
    ctx.moveTo(0, this.radius); // Start from bottom of clock
    ctx.lineTo(bobX, bobY);
    ctx.strokeStyle = 'rgba(80, 80, 80, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pendulum Blade (The menace)
    ctx.save();
    ctx.translate(bobX, bobY);
    ctx.rotate(this.angle);
    
    // Draw Blade
    const bladeW = this.radius * 1.5;
    const bladeH = bladeW * 0.8;
    
    ctx.beginPath();
    ctx.moveTo(-bladeW/2, 0);
    // Crescent shape
    ctx.bezierCurveTo(-bladeW/2, bladeH, bladeW/2, bladeH, bladeW/2, 0);
    ctx.bezierCurveTo(bladeW/3, bladeH * 0.6, -bladeW/3, bladeH * 0.6, -bladeW/2, 0);
    
    const bladeGrad = ctx.createLinearGradient(-bladeW/2, 0, bladeW/2, 0);
    bladeGrad.addColorStop(0, '#000');
    bladeGrad.addColorStop(0.5, '#333');
    bladeGrad.addColorStop(1, '#000');
    ctx.fillStyle = bladeGrad;
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 15;
    ctx.fill();
    
    // Sharp edge
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#555';
    ctx.stroke();
    ctx.restore();


    // 2. Draw Clock Face (Distressed)
    // Main circle
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#050505'; // Almost black
    ctx.fill();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Roman Numerals (Roughly drawn)
    ctx.font = `${this.radius * 0.2}px "Times New Roman", serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#666';
    const numerals = ['XII', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
    numerals.forEach((num, i) => {
        const ang = (i * Math.PI * 2) / 12 - Math.PI / 2;
        const r = this.radius * 0.8;
        ctx.fillText(num, Math.cos(ang) * r, Math.sin(ang) * r);
    });

    // 3. Draw Hands (The Madness)
    // Hour Hand
    this.drawHand(ctx, this.radius * 0.5, this.hourAngle, 4, '#444');
    // Minute Hand
    this.drawHand(ctx, this.radius * 0.8, this.minuteAngle, 2, '#888');
    
    // Center Pin
    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI*2);
    ctx.fillStyle = '#a00'; // Blood red pin
    ctx.fill();

    // 4. Ghosting / Double Vision Effect (If glitching)
    if (this.glitchOffsetX !== 0) {
       ctx.globalCompositeOperation = 'screen';
       ctx.globalAlpha = 0.3;
       ctx.drawImage(ctx.canvas, -this.centerX + 10, -this.centerY, ctx.canvas.width, ctx.canvas.height);
       ctx.globalCompositeOperation = 'source-over';
    }

    ctx.restore();
  }

  drawHand(ctx: CanvasRenderingContext2D, length: number, angle: number, width: number, color: string) {
      ctx.save();
      ctx.rotate(angle);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(0, 0);
      // Distorted hand line
      ctx.lineTo(length, 0);
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

// Keyword triggers for effects
const TEAR_WORDS = ['strange', 'infatuation', 'imagination', 'correlation', 'saturation', 'over'];
const STITCH_WORDS = ['take', 'side', 'by your', 'your side'];
const INK_WORDS = ['lies', 'skin', 'hide', 'unclean', 'pack', 'breeds'];
const FLASH_WORDS = ['tick', 'tock', 'nothing', 'libertine', 'spleen'];

export const PlaceboVisualizer = ({ activeTrack, currentTime, duration, isPlaying, onTogglePlay, onSeek, onClose }: PlaceboVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lyricLine, setLyricLine] = useState<{
    en: string;
    ru: string;
    isTickTock?: boolean;
    isExplosion?: boolean;
    isFall?: boolean;
    isTear?: boolean;
    isStitch?: boolean;
    isInk?: boolean;
  }>({ en: '', ru: '' });
  const flashRef = useRef(0);
  const [showClock, setShowClock] = useState(false);
  const [showPills, setShowPills] = useState(false);
  const requestRef = useRef<number>(undefined);
  const prevLyricRef = useRef<string>('');

  // Effect references
  const scratchesRef = useRef<Scratch[]>([]);
  const pillsRef = useRef<Pill[]>([]);
  const clockRef = useRef<PendulumClock>(new PendulumClock());
  const scribblesRef = useRef<NervousScribble[]>([]); // NEW
  // NEW effect refs
  const tearsRef = useRef<ScreenTear[]>([]);
  const stitchesRef = useRef<Stitch[]>([]);
  const inkSplatterRef = useRef<InkSplatter>(new InkSplatter());

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
         while (prevIdx >= 0 && (lyrics[prevIdx + 1] as any).isAppend) {
             const prev = lyrics[prevIdx] as any;
             en = (prev.original || '') + " " + en;
             ru = (prev.translation || '') + " " + ru;
             if (!prev.isAppend) break;
             prevIdx--;
         }
      }
      
      // Detect keywords for effects
      const lowerEn = en.toLowerCase();
      const isTickTock = lowerEn.includes('tick') && lowerEn.includes('tock');
      const isExplosion = lowerEn.includes('unclean') || lowerEn.includes('libertine') || lowerEn.includes('spleen');
      const isFall = lowerEn.includes('fall') || lowerEn.includes('nothing');

      // NEW keyword detection
      const isTear = TEAR_WORDS.some(word => lowerEn.includes(word));
      const isStitch = STITCH_WORDS.some(word => lowerEn.includes(word));
      const isInk = INK_WORDS.some(word => lowerEn.includes(word));
      const shouldFlash = FLASH_WORDS.some(word => lowerEn.includes(word));

      setLyricLine({ en, ru, isTickTock, isExplosion, isFall, isTear, isStitch, isInk });

      setShowClock(!!isTickTock);
      setShowPills(!!isExplosion);

      // Spawn effects on line change
      const isNewLine = prevLyricRef.current !== en;
      if (isNewLine) {
        prevLyricRef.current = en;
        const canvas = canvasRef.current;

        // Spawn Scribbles (Mental breakdown - ONLY on specific nervous words)
        if (scribblesRef.current && (isExplosion || isInk)) {
           const count = Math.floor(Math.random() * 3) + 1;
           for(let i=0; i<count; i++) {
               scribblesRef.current[Math.floor(Math.random() * scribblesRef.current.length)].spawn();
           }
        }

        // Spawn TEAR effects (screen rips)
        if (isTear && canvas) {
          const tearCount = Math.floor(Math.random() * 2) + 1;
          for (let i = 0; i < tearCount; i++) {
            if (tearsRef.current.length < 3) tearsRef.current.push(new ScreenTear(canvas.width, canvas.height));
          }
        }

        // Spawn STITCH effects
        if (isStitch && canvas) {
          const stitchCount = Math.floor(Math.random() * 3) + 2;
          for (let i = 0; i < stitchCount; i++) {
            if (stitchesRef.current.length < 8) stitchesRef.current.push(new Stitch(canvas.width, canvas.height));
          }
        }

        // Spawn INK splatter
        if (isInk && canvas) {
          const x = canvas.width / 2 + (Math.random() - 0.5) * canvas.width * 0.6;
          const y = canvas.height / 2 + (Math.random() - 0.5) * canvas.height * 0.4;
          inkSplatterRef.current.spawn(x, y, 15);
        }

        // Flash ONLY for emphasis words (tick-tock, chorus keywords)
        if (shouldFlash || isTickTock || isExplosion) flashRef.current = 0.8;
      }

    } else {
        // No active lyric (intro or silence)
        setLyricLine({ en: '', ru: '' });
        setShowClock(false);
        setShowPills(false);
    }
  }, [currentTime, activeTrack]);

  // --- ANIMATION LOOP ---
  const stateRef = useRef({ showClock, showPills, lyricLine });
  useEffect(() => {
      stateRef.current = { showClock, showPills, lyricLine };
  }, [showClock, showPills, lyricLine]);

  const animateRef = useRef<() => void>(undefined);
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

      // Clock
      if (state.showClock) {
        clockRef.current.update(true);
        clockRef.current.draw(ctx, true);
      } else {
        clockRef.current.update(false);
      }

      // Pills (Always draw, variable speed)
      const pillSpeed = state.lyricLine.isExplosion ? 15 : 1;
      pillsRef.current.forEach(p => {
         p.update(pillSpeed);
         p.draw(ctx);
      });

      // Scratches
      scratchesRef.current.forEach(s => {
        s.update();
        s.draw(ctx);
      });

      // Scribbles (Nervous - drawn behind text usually)
      // Randomly spawn idle scribbles for background texture
      if (Math.random() > 0.98) {
          scribblesRef.current[Math.floor(Math.random() * scribblesRef.current.length)].spawn();
      }
      scribblesRef.current.forEach(s => { s.update(); s.draw(ctx); });

      // Effects

      // Screen Tears (update and draw, remove dead ones)
      tearsRef.current.forEach(tear => {
        tear.update();
        tear.draw(ctx);
      });
      tearsRef.current = tearsRef.current.filter(t => t.isAlive());

      // Stitches (update and draw, remove dead ones)
      stitchesRef.current.forEach(stitch => {
        stitch.update();
        stitch.draw(ctx);
      });
      stitchesRef.current = stitchesRef.current.filter(s => s.isAlive());

      // Ink Splatter
      inkSplatterRef.current.update();
      inkSplatterRef.current.draw(ctx);

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
      if (flashRef.current > 0.01) {
          ctx.fillStyle = `rgba(255, 255, 255, ${flashRef.current})`;
          ctx.fillRect(0, 0, width, height);
          flashRef.current *= 0.9;
          if (flashRef.current < 0.01) flashRef.current = 0; 
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
      scribblesRef.current = Array.from({ length: 8 }, () => new NervousScribble(canvas.width, canvas.height)); // Init scribbles
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
          <div className="transition-opacity duration-300" style={{
               opacity: lyricLine.en ? 1 : 0,
               textShadow: lyricLine.isFall ? "4px 4px 0px rgba(200, 0, 0, 0.5)" : "2px 2px 0px rgba(255, 255, 255, 0.1)"
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
       <div className="absolute bottom-0 left-0 right-0 z-50 p-8 md:p-12 flex-col gap-6 bg-gradient-to-t from-black via-black/80 to-transparent hidden md:flex">
          
          {/* Progress Bar - Hidden on PC as requested, hidden on mobile via parent */}
          <div className="w-full group cursor-pointer md:hidden" 
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