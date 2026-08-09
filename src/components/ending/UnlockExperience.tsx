import { type FormEvent, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';

// Edit these three values when the personal details are ready.
export const UNLOCK_PHRASE = 'ORANGE634';
export const FINAL_NOTE = `Hey, ig tumhe ye viocenote mil gaya hoga(i hope).

mein bss ye bolna chahata hu ki mujhe sachmei nahi pata konsi baat tumhe buri lagi hai and usko ig mein maafi ke kabil nahi but phir bhi im sorry aur tumne bola tha ki mera edit kaha hai prev year ka toh ye hai tumhara edit bs ye voice note sunlo then decied karna. And jo bhi decision hoga ill accept it i hope ki achha he hoga 

ps;ANSHU`;
export const VOICE_NOTE_SRC = 'voice.note';

interface UnlockExperienceProps {
  visible: boolean;
  unlocked: boolean;
  onUnlock: () => void;
  onVoiceStart: () => void;
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
}

function resolveAudioSource(source: string) {
  if (!source || source === 'REPLACE_WITH_AUDIO_FILE') return '';
  if (/^(https?:)?\/\//.test(source) || source.startsWith('data:')) return source;
  return `${import.meta.env.BASE_URL}${source.replace(/^\/+/, '')}`;
}

function VoiceNotePlayer({ onVoiceStart }: { onVoiceStart: () => void }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState('');
  const audioSource = resolveAudioSource(VOICE_NOTE_SRC);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
      if (audio) audio.currentTime = 0;
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audioSource || !audio) {
      setError('Add your voice-note file, then update VOICE_NOTE_SRC.');
      return;
    }

    if (!audio.paused) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    onVoiceStart();
    audio.volume = 0.95;
    audio.muted = false;
    setIsMuted(false);
    setError('');

    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
      setError('The voice note could not be played. Check the file path.');
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    if (!nextMuted) audio.volume = 0.95;
    setIsMuted(nextMuted);
  };

  const handleSeek = (value: string) => {
    const audio = audioRef.current;
    const nextProgress = Number(value);
    if (!audio || !Number.isFinite(audio.duration)) return;
    audio.currentTime = (nextProgress / 100) * audio.duration;
    setProgress(nextProgress);
  };

  return (
    <div className="w-full max-w-sm">
      <audio
        ref={audioRef}
        src={audioSource || undefined}
        preload="metadata"
        className="hidden"
        onLoadedMetadata={event => setDuration(event.currentTarget.duration)}
        onTimeUpdate={event => {
          const audio = event.currentTarget;
          setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
        }}
        onEnded={event => {
          event.currentTarget.pause();
          setIsPlaying(false);
          setProgress(0);
          event.currentTarget.currentTime = 0;
        }}
        onError={() => setError('The voice note could not be loaded. Check the file path.')}
      />

      <div className="rounded-2xl border border-primary/20 bg-card/50 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={togglePlayback}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.94 }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 text-primary transition-colors hover:bg-primary/10"
            aria-label={isPlaying ? 'Pause voice note' : 'Play voice note'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
          </motion.button>

          <div className="min-w-0 flex-1">
            <p className="serif text-sm text-primary/90">A voice note for you</p>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={event => handleSeek(event.target.value)}
              className="mt-2 w-full cursor-pointer accent-primary"
              aria-label="Voice note progress"
              disabled={!audioSource}
            />
          </div>

          <span className="w-10 shrink-0 text-right text-xs text-muted-foreground/70">
            {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={toggleMute}
            className="shrink-0 text-primary/70 transition-colors hover:text-primary"
            aria-label={isMuted ? 'Unmute voice note' : 'Mute voice note'}
          >
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-3 text-center text-xs text-primary/60"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function UnlockExperience({
  visible,
  unlocked,
  onUnlock,
  onVoiceStart,
}: UnlockExperienceProps) {
  const [input, setInput] = useState('');
  const [incorrect, setIncorrect] = useState(false);

  useEffect(() => {
    if (!visible) {
      setInput('');
      setIncorrect(false);
    }
  }, [visible]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (input.trim() === UNLOCK_PHRASE.trim()) {
      setIncorrect(false);
      onUnlock();
      return;
    }
    setIncorrect(true);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="unlock-experience"
          className="absolute inset-0 z-[45] flex items-center justify-center px-5 py-12"
          initial={{ opacity: 0, filter: 'blur(10px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(10px)' }}
          transition={{ duration: 1.4, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            {!unlocked ? (
              <motion.div
                key="phrase-gate"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18, filter: 'blur(5px)' }}
                transition={{ duration: 0.9 }}
                className="flex w-full max-w-lg flex-col items-center text-center"
              >
                <p
                  className="serif text-2xl italic text-primary/90 sm:text-3xl"
                  style={{ textShadow: '0 0 28px rgba(212,175,55,0.35)' }}
                >
                  that wasn't the last thing
                </p>
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-foreground/50">
                  There is one more page, but it only opens when you know what to say.
                </p>

                <form onSubmit={handleSubmit} className="mt-9 flex w-full max-w-sm flex-col items-center">
                  <label htmlFor="unlock-phrase" className="sr-only">
                    Unlock phrase
                  </label>
                  <input
                    id="unlock-phrase"
                    value={input}
                    onChange={event => {
                      setInput(event.target.value);
                      if (incorrect) setIncorrect(false);
                    }}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="type the phrase"
                    className={`w-full border-b bg-transparent px-2 py-3 text-center font-serif text-lg text-foreground outline-none transition-colors placeholder:text-foreground/25 ${
                      incorrect ? 'border-primary/80' : 'border-primary/30 focus:border-primary/80'
                    }`}
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="mt-7 rounded-full border border-primary/35 px-6 py-2 text-sm text-primary/80 transition-all hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    continue
                  </button>
                  <AnimatePresence>
                    {incorrect && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0, x: [0, -4, 4, -2, 2, 0] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.45 }}
                        className="mt-4 text-xs text-primary/65"
                      >
                        not quite. try again.
                      </motion.p>
                    )}
                  </AnimatePresence>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="final-note"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
                className="flex w-full max-w-lg flex-col items-center text-center"
              >
                <p className="serif whitespace-pre-wrap text-xl leading-relaxed text-primary/90 sm:text-2xl">
                  {FINAL_NOTE}
                </p>
                <div className="mt-9 w-full">
                  <VoiceNotePlayer onVoiceStart={onVoiceStart} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}