"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import styles from './music.module.css';

// --- ICONS (SVG Helpers to avoid dependencies) ---
const Icons = {
  Play: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z" /></svg>,
  Pause: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>,
  SkipBack: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 20L9 12l10-8v16z" /><line x1="5" y1="19" x2="5" y2="5" /></svg>,
  SkipForward: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 4l10 8-10 8V4z" /><line x1="19" y1="5" x2="19" y2="19" /></svg>,
  Mic: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
  Music: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></svg>,
  Upload: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  Save: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>,
  ChevronLeft: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>,
  Undo: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 7v6h6" /><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" /></svg>
};

// --- CONSTANTS ---
type SongStatus = 'draft' | 'published';

type Song = {
  id: string;
  title: string;
  artist: string;
  lyrics: LyricLine[];
  audioSrc: string | null;
  status: SongStatus;
};

const INITIAL_SONGS: Song[] = [
  {
    id: 'feelings_gone',
    title: "Feeling's Gone",
    artist: "The Cat Empire",
    lyrics: [
      { id: 1, original: "This is a demo of the visual player", translation: "Это демо визуального плеера", time: 0, isSet: true },
      { id: 2, original: "Upload your own track in the Studio", translation: "Загрузите свой трек в Студии", time: 5, isSet: true },
      { id: 3, original: "To see the full cinematic effect", translation: "Чтобы увидеть полный кино-эффект", time: 10, isSet: true }
    ], 
    audioSrc: null,
    status: 'published'
  }
];

const DEFAULT_SONG = INITIAL_SONGS[0];

// --- TYPES ---
type LyricLine = {
  id: number;
  original: string;
  translation: string;
  time: number;
  isSet: boolean;
};

type Meta = {
  id?: string; // Added ID to track drafts correctly
  title: string;
  artist: string;
  status: SongStatus;
};

export default function MusicPage() {
  // --- VIEW STATE ---
  const [view, setView] = useState<'playlist' | 'player' | 'studio'>('playlist');
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const [password, setPassword] = useState('');

  // --- DATA STATE ---
  const [songs, setSongs] = useState<Song[]>(INITIAL_SONGS);

  // --- SONG STATE ---
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [meta, setMeta] = useState<Meta>({ 
      id: DEFAULT_SONG.id,
      title: DEFAULT_SONG.title, 
      artist: DEFAULT_SONG.artist,
      status: DEFAULT_SONG.status 
  });
  const [lyrics, setLyrics] = useState<LyricLine[]>([]);
  
  // --- PLAYER STATE ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);

  // --- STUDIO STATE ---
  const [rawOriginal, setRawOriginal] = useState("");
  const [rawTranslation, setRawTranslation] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordIndex, setRecordIndex] = useState(0);

  // --- EFFECTS ---
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const onEnded = () => {
      setIsPlaying(false);
      setIsRecording(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioSrc]);

  // Auto-scroll logic (Cinematic Center)
  useEffect(() => {
    if (view === 'player' && lyrics.length > 0 && isPlaying) {
      const activeIndex = lyrics.findIndex((line, i) => {
        const nextLine = lyrics[i + 1];
        return currentTime >= line.time && (!nextLine || currentTime < nextLine.time);
      });

      if (activeIndex !== -1 && lyricsContainerRef.current) {
        const children = lyricsContainerRef.current.children;
        if (children[activeIndex]) {
            children[activeIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [currentTime, view, lyrics, isPlaying]);

  // Keyboard controls for Studio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'studio' || !isRecording) return;
      if (e.code === 'Space') { e.preventDefault(); recordTiming(); }
      else if (e.code === 'ArrowLeft') { e.preventDefault(); undoLastLine(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRecording, view, recordIndex, lyrics]);

  // --- HANDLERS ---

  // Header Logic (Navigation & Admin Trigger)
  const handleHeaderClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // If in player or studio, header acts as "Back"
    if (view !== 'playlist') {
        setView('playlist');
        return;
    }
    
    // Secret Admin Trigger (only on playlist view)
    if (isAdmin) {
        setView('studio');
        return;
    }
    
    setSecretClicks(prev => {
        const next = prev + 1;
        if (next >= 5) {
            setShowAuth(true);
            return 0;
        }
        return next;
    });
  };
  
  const handleAuth = (e: React.FormEvent) => {
      e.preventDefault();
      if (password === '1111') {
          setIsAdmin(true);
          setShowAuth(false);
          setView('studio');
      } else {
          alert('Incorrect Password');
          setPassword('');
      }
  };

  const loadSong = (song: Song) => {
      setMeta({ id: song.id, title: song.title, artist: song.artist, status: song.status });
      setLyrics(song.lyrics);
      setAudioSrc(song.audioSrc);
      setView('player');
      // Auto-play when loading user song
      if (audioRef.current) {
          setTimeout(() => {
             // Optional: auto-play logic could go here
          }, 100);
      }
  };

  const openInStudio = (song: Song) => {
      setMeta({ id: song.id, title: song.title, artist: song.artist, status: song.status });
      setLyrics(song.lyrics);
      setAudioSrc(song.audioSrc);
      
      const orig = song.lyrics.map(l => l.original).join('\n');
      const trans = song.lyrics.map(l => l.translation).join('\n');
      setRawOriginal(orig);
      setRawTranslation(trans);
      
      setView('studio');
  };

  // File Management
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioSrc(url);
      if (meta.title === DEFAULT_SONG.title) {
          setMeta(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
      }
    }
  };

  const handleJsonImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target?.result as string);
            if (data.meta) setMeta(data.meta);
            if (data.lyrics && Array.isArray(data.lyrics)) {
                setLyrics(data.lyrics);
                const orig = data.lyrics.map((l: any) => l.original).join('\n');
                const trans = data.lyrics.map((l: any) => l.translation).join('\n');
                setRawOriginal(orig);
                setRawTranslation(trans);
            }
            alert("Loaded successfully!");
        } catch (err) {
            alert("Error parsing JSON");
        }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const exportData = () => {
    const dataStr = JSON.stringify({ meta, lyrics }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meta.title || 'song'}.json`;
    a.click();
  };

  // Player Controls
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
          audioRef.current.pause();
      } else {
          const playPromise = audioRef.current.play();
          if (playPromise !== undefined) {
              playPromise.catch(error => {
                  console.warn("Playback aborted:", error);
              });
          }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Studio Logic
  const prepareForRecording = () => {
    const origLines = rawOriginal.split('\n').filter(l => l.trim() !== '');
    const transLines = rawTranslation.split('\n').filter(l => l.trim() !== '');
    const maxLen = Math.max(origLines.length, transLines.length);
    
    const newLyrics: LyricLine[] = [];
    for (let i = 0; i < maxLen; i++) {
      newLyrics.push({
        id: i,
        original: origLines[i] || '',
        translation: transLines[i] || '',
        time: 0,
        isSet: false
      });
    }
    setLyrics(newLyrics);
    setRecordIndex(0);
    setCurrentTime(0);
    if (audioRef.current) {
        audioRef.current.currentTime = 0;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
             playPromise.catch(error => console.warn("Playback aborted:", error));
        }
        setIsPlaying(true);
    }
    setIsRecording(true);
  };

  const recordTiming = () => {
    if (recordIndex >= lyrics.length) {
        setIsRecording(false);
        setIsPlaying(false);
        audioRef.current?.pause();
        return;
    }
    const currentAudioTime = audioRef.current ? audioRef.current.currentTime : 0;
    setLyrics(prev => {
      const updated = [...prev];
      updated[recordIndex] = { ...updated[recordIndex], time: currentAudioTime, isSet: true };
      return updated;
    });
    setRecordIndex(prev => prev + 1);
  };

  const undoLastLine = () => {
      if (recordIndex > 0) {
          const newIndex = recordIndex - 1;
          setRecordIndex(newIndex);
          if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 2);
          setLyrics(prev => {
              const updated = [...prev];
              updated[newIndex] = { ...updated[newIndex], isSet: false }; 
              return updated;
          });
      }
  };

  const handleSaveDraft = () => {
      exportData(); // Reuse export for now
      alert("Draft saved locally!");
  };

  const handlePublish = () => {
      // Validation
      if (!meta.title.trim() || !meta.artist.trim()) {
          alert("Error: Title and Artist are required to publish.");
          return;
      }
      
      // Create updated object
      const updatedStatus = 'published';
      setMeta(prev => ({ ...prev, status: updatedStatus }));
      
      // Update 'Database' (Local State)
      setSongs(prev => {
          // 1. Try to find by ID first (most reliable)
          let existingIndex = prev.findIndex(s => s.id === meta.id);
          
          // 2. Fallback: try to find by title if ID is missing (legacy/newly created)
          if (existingIndex === -1) {
              existingIndex = prev.findIndex(s => s.title === meta.title);
          }

          const newSongData: Song = {
              id: existingIndex !== -1 ? prev[existingIndex].id : (meta.id || Date.now().toString()),
              title: meta.title,
              artist: meta.artist,
              lyrics: lyrics,
              audioSrc: audioSrc,
              status: updatedStatus
          };
          
          if (existingIndex !== -1) {
              const updated = [...prev];
              updated[existingIndex] = newSongData;
              return updated;
          } else {
              return [...prev, newSongData];
          }
      });
      
      // Feedback and Redirect
      // Don't use alert, it breaks the flow. Just change view.
      // alert("Success: Track Published!"); 
      if (view === 'studio') {
         // Stay in studio but show success state via button change
      }
  };

  // --- RENDER ---

  // Filter Songs
  const visibleSongs = songs.filter(s => isAdmin || s.status === 'published');

  return (
    <div className={`${styles.container} ${isPlaying && view === 'player' ? styles.cinematic : ''}`}>
      <audio ref={audioRef} src={audioSrc || undefined} />
      
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerControls}>
             {/* Left controls can be empty now as header acts as back */}
        </div>
        <button 
            type="button"
            className={styles.brand} 
            onClick={handleHeaderClick}
            title={view === 'playlist' ? "Admin Access (5 clicks)" : "Back to Playlist"}
        >
             {view === 'playlist' ? "OINOTS" : "← OINOTS"}
        </button>
        <div className={styles.headerControls}>
             {view === 'studio' && (
                 <button onClick={() => setView('player')} className={styles.btnControl}>
                     Preview
                 </button>
             )}
             {isAdmin && view !== 'studio' && (
                 <button onClick={() => setView('studio')} className={styles.btnControl}>
                     <Icons.Mic />
                 </button>
             )}
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.viewContainer}>
        
        {/* PLAYLIST VIEW */}
        {view === 'playlist' && (
            <div className={styles.playlistView}>
                <h1 className={styles.playlistTitle}>Select Track</h1>
                <div className={styles.grid}>
                    {visibleSongs.map((song) => (
                        <div 
                            key={song.id} 
                            className={styles.card} 
                            onClick={() => isAdmin ? openInStudio(song) : loadSong(song)}
                        > 
                            <div className={styles.vinyl}>
                                <div className={styles.vinylIcon}><Icons.Music /></div>
                            </div>
                            <div className={styles.cardMeta}>
                                <h3>
                                    {song.title}
                                    {song.status === 'draft' && (
                                        <span style={{ 
                                            fontSize: '0.6em', 
                                            background: '#333', 
                                            color: '#aaa', 
                                            padding: '2px 6px', 
                                            borderRadius: '4px', 
                                            marginLeft: '8px',
                                            verticalAlign: 'middle'
                                        }}>
                                            DRAFT
                                        </span>
                                    )}
                                </h3>
                                <p>{song.artist}</p>
                            </div>
                        </div>
                    ))}
                    
                    {/* New Track Card for Admin */}
                    {isAdmin && (
                         <div 
                            className={styles.card} 
                            style={{ borderStyle: 'dashed', opacity: 0.5 }}
                            onClick={() => {
                                setMeta({ id: Date.now().toString(), title: '', artist: '', status: 'draft' });
                                setLyrics([]);
                                setRawOriginal('');
                                setRawTranslation('');
                                setAudioSrc(null);
                                setView('studio');
                            }}
                         >
                            <div className={styles.vinyl} style={{ background: 'transparent', border: 'none' }}>
                                <div className={styles.vinylIcon}><Icons.Upload /></div>
                            </div>
                            <div className={styles.cardMeta}>
                                <h3>New Track</h3>
                                <p>Create from scratch</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* PLAYER VIEW */}
        {view === 'player' && (
            <div className={styles.playerView}>
                <div className={styles.lyricsContainer} ref={lyricsContainerRef}>
                     {lyrics.length === 0 ? (
                         <div style={{ opacity: 0.5, marginTop: '100px' }}>
                             <h3 style={{marginBottom: '16px'}}>No lyrics loaded</h3>
                             {!audioSrc && <p>No audio source available for this track.</p>}
                         </div>
                     ) : (
                         lyrics.map((line, i) => {
                             // Find active line
                             const activeIndex = lyrics.findIndex((l, idx) => {
                                const next = lyrics[idx+1];
                                return currentTime >= l.time && (!next || currentTime < next.time);
                             });
                             const isActive = i === activeIndex;

                             return (
                                 <div 
                                    key={line.id} 
                                    className={`${styles.lyricLine} ${isActive ? styles.active : ''}`}
                                    onClick={() => {
                                        if (audioRef.current) {
                                            audioRef.current.currentTime = line.time;
                                            setCurrentTime(line.time);
                                            if (!isPlaying) {
                                                const playPromise = audioRef.current.play();
                                                if (playPromise !== undefined) {
                                                    playPromise.catch(err => console.warn("Playback aborted:", err));
                                                }
                                                setIsPlaying(true);
                                            }
                                        }
                                    }}
                                 >
                                     <h2>{line.translation || line.original}</h2>
                                 </div>
                             );
                         })
                     )}
                </div>

                <div className={styles.controls}>
                    {/* Progress Bar Integrated */}
                    <div className={styles.progressBar}>
                        <input 
                            type="range" min="0" max={duration || 0} value={currentTime} onChange={seek}
                            style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer', zIndex: 10, width: '100%', height: '100%' }}
                        />
                        <div className={styles.progressFill} style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
                    </div>

                    <div className={styles.buttons}>
                        <button onClick={() => { if(audioRef.current) audioRef.current.currentTime -= 10 }} className={styles.btnControl}><Icons.SkipBack /></button>
                        
                        {!audioSrc ? (
                            <div style={{ color: '#555', fontSize: '0.8rem' }}>NO AUDIO</div>
                        ) : (
                            <button onClick={togglePlay} className={styles.btnPlay}>
                                {isPlaying ? <Icons.Pause /> : <Icons.Play />}
                            </button>
                        )}
                        
                        <button onClick={() => { if(audioRef.current) audioRef.current.currentTime += 10 }} className={styles.btnControl}><Icons.SkipForward /></button>
                    </div>
                </div>
            </div>
        )}

        {/* STUDIO VIEW (Admin) */}
        {view === 'studio' && (
            <div className={styles.studioContainer}>
                <div className={styles.studioHeader}>
                    <h2 style={{ fontFamily: 'var(--font-display)' }}>Studio</h2>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <label className={styles.btnPrimary} style={{ background: '#333', fontSize: '0.8rem' }}>
                            <Icons.Upload /> JSON
                            <input type="file" accept=".json" hidden onChange={handleJsonImport} />
                        </label>
                        <button onClick={exportData} className={styles.btnPrimary} style={{ background: '#333', fontSize: '0.8rem' }}><Icons.Save /> JSON</button>
                    </div>
                </div>
                
                {isRecording ? (
                     <div className={styles.recorderOverlay}>
                        <div className={styles.recIndicator}>REC</div>
                        <div className={styles.recorderCurrent}>
                            {/* Previous Line Context (Single, Large) */}
                            <div className={styles.recorderContext}>
                                {lyrics[recordIndex - 1] && (
                                    <div>
                                        <h3>{lyrics[recordIndex - 1].original}</h3>
                                    </div>
                                )}
                            </div>

                            {/* Active Line (Massive) */}
                            <div className={styles.recorderActiveLine}>
                                <h2>
                                    {lyrics[recordIndex]?.original || <span style={{color: 'var(--color-acid-lime)'}}>Done!</span>}
                                </h2>
                                <p style={{ fontSize: '2rem', color: 'var(--color-electric-violet)', opacity: 0.9, fontWeight: 500 }}>
                                    {lyrics[recordIndex]?.translation}
                                </p>
                            </div>
                        </div>
                        
                        <div className={styles.controls} style={{ background: '#111', padding: '20px 40px' }}>
                            <div className={styles.progressBar}>
                                <div className={styles.progressFill} style={{ width: `${(currentTime / (duration || 1)) * 100}%` }} />
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
                                {/* Left Actions */}
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <button onClick={handleSaveDraft} className={styles.btnAction}>
                                        <Icons.Save /> Save Draft
                                    </button>
                                    {meta.status !== 'published' && (
                                        <button onClick={handlePublish} className={`${styles.btnAction} ${styles.btnPublish}`}>
                                            <Icons.Upload /> Publish
                                        </button>
                                    )}
                                </div>

                                {/* Center Controls */}
                                <div className={styles.buttons}>
                                    <button onClick={undoLastLine} className={styles.btnControl} title="Undo (Left Arrow)"><Icons.Undo /></button>
                                    <button 
                                        onClick={recordTiming} 
                                        className={styles.btnPlay}
                                        style={{ width: '120px', borderRadius: '16px', background: 'var(--color-electric-violet)', color: '#fff', fontSize: '1.2rem', fontWeight: 'bold' }}
                                    >
                                        SPACE
                                    </button>
                                    <button onClick={togglePlay} className={styles.btnControl}>{isPlaying ? <Icons.Pause /> : <Icons.Play />}</button>
                                </div>

                                {/* Right Spacer to balance layout */}
                                <div style={{ width: '200px' }}></div>
                            </div>
                        </div>
                     </div>
                ) : (
                    <div className={styles.studioLayout}>
                        <div className={styles.studioSidebar}>
                            <div className={styles.inputGroup}>
                                <label>Audio File</label>
                                <label className={styles.input} style={{ cursor: 'pointer', display: 'block', textAlign: 'center', borderStyle: 'dashed' }}>
                                    {audioSrc ? "Audio Loaded" : "Click to Upload MP3"}
                                    <input type="file" accept="audio/*" hidden onChange={handleFileUpload} />
                                </label>
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Title</label>
                                <input className={styles.input} value={meta.title} onChange={e => setMeta({...meta, title: e.target.value})} />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Artist</label>
                                <input className={styles.input} value={meta.artist} onChange={e => setMeta({...meta, artist: e.target.value})} />
                            </div>
                            
                            <div style={{ height: '1px', background: '#333', margin: '10px 0' }}></div>

                            <button className={styles.btnPrimary} disabled={!audioSrc || !rawOriginal} onClick={prepareForRecording}>
                                <Icons.Play /> Start Recording
                            </button>

                            {meta.status === 'published' ? (
                                <div style={{ 
                                    marginTop: '20px', 
                                    textAlign: 'center', 
                                    padding: '12px', 
                                    background: 'rgba(0,255,0,0.1)', 
                                    border: '1px solid rgba(0,255,0,0.3)',
                                    borderRadius: '8px',
                                    color: '#4ade80',
                                    fontSize: '0.8rem',
                                    letterSpacing: '0.1em',
                                    textTransform: 'uppercase'
                                }}>
                                    <span style={{ marginRight: '8px' }}>●</span> Published
                                </div>
                            ) : (
                                <button 
                                    className={styles.btnPrimary} 
                                    onClick={handlePublish}
                                    disabled={!meta.title || !meta.artist}
                                    style={{ marginTop: '20px', background: meta.title && meta.artist ? '#fff' : '#333', color: '#000' }}
                                >
                                    <Icons.Upload /> Publish Track
                                </button>
                            )}
                        </div>
                        <div className={styles.studioContent}>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ color: '#666', marginBottom: '8px', display: 'block', fontSize: '0.8rem' }}>ORIGINAL LYRICS</label>
                                <textarea className={styles.textArea} value={rawOriginal} onChange={e => setRawOriginal(e.target.value)} placeholder="Paste lyrics here..." />
                            </div>
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <label style={{ color: '#666', marginBottom: '8px', display: 'block', fontSize: '0.8rem' }}>TRANSLATION</label>
                                <textarea className={styles.textArea} value={rawTranslation} onChange={e => setRawTranslation(e.target.value)} placeholder="Paste translation here..." />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* AUTH MODAL */}
        {showAuth && (
            <div className={styles.modalOverlay} onClick={() => setShowAuth(false)}>
                <div className={styles.modal} onClick={e => e.stopPropagation()}>
                    <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '20px' }}>Studio Access</h2>
                    <form onSubmit={handleAuth}>
                        <input 
                            type="password" 
                            className={styles.pinInput} 
                            maxLength={4} 
                            autoFocus
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </form>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}