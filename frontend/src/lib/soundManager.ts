// Sound Manager - Handles all audio playback with proper browser autoplay policy handling
class SoundManager {
    private static instance: SoundManager;
    private initialized: boolean = false;
    private soundsEnabled: boolean = true;
    private audioContext: AudioContext | null = null;
    private sounds: Map<string, HTMLAudioElement> = new Map();

    private constructor() {
        // Listen for first user interaction to enable sounds
        this.setupUserInteraction();
    }

    public static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    private setupUserInteraction() {
        const initAudio = () => {
            if (!this.initialized) {
                this.initialize();
                console.log('🔊 SoundManager initialized after user interaction');
                // Remove listeners after first interaction
                document.removeEventListener('click', initAudio);
                document.removeEventListener('keydown', initAudio);
                document.removeEventListener('touchstart', initAudio);
            }
        };

        document.addEventListener('click', initAudio, { once: true });
        document.addEventListener('keydown', initAudio, { once: true });
        document.addEventListener('touchstart', initAudio, { once: true });
    }

    private initialize() {
        try {
            // Create AudioContext for better sound management
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (AudioContextClass) {
                this.audioContext = new AudioContextClass();
            }
            this.initialized = true;
        } catch (error) {
            console.warn('Failed to initialize AudioContext:', error);
        }
    }

    public preloadSound(name: string, path: string): void {
        if (this.sounds.has(name)) return;

        const audio = new Audio();
        audio.src = path;
        audio.preload = 'auto';
        audio.volume = 0.5;

        audio.addEventListener('error', (e) => {
            console.error(`Failed to load sound '${name}' from ${path}:`, e);
        });

        this.sounds.set(name, audio);
    }

    public async play(soundName: string, volume: number = 0.5): Promise<void> {
        if (!this.soundsEnabled || !this.initialized) {
            console.log(`Sound '${soundName}' not played (enabled: ${this.soundsEnabled}, initialized: ${this.initialized})`);
            return;
        }

        const audio = this.sounds.get(soundName);
        if (!audio) {
            console.warn(`Sound '${soundName}' not found. Did you preload it?`);
            return;
        }

        try {
            console.log(`🔊 Playing sound: ${soundName}`);
            audio.volume = Math.min(1, Math.max(0, volume));
            audio.currentTime = 0; // Reset to start
            await audio.play();
        } catch (error) {
            console.warn(`Failed to play sound '${soundName}':`, error);
        }
    }

    public setSoundsEnabled(enabled: boolean): void {
        this.soundsEnabled = enabled;
        console.log(`Sounds ${enabled ? 'enabled' : 'disabled'}`);
    }

    public getSoundsEnabled(): boolean {
        return this.soundsEnabled;
    }

    public isInitialized(): boolean {
        return this.initialized;
    }
}

export const soundManager = SoundManager.getInstance();

// Preload common sounds
soundManager.preloadSound('click-modern', '/sounds/click-modern.mp3');
soundManager.preloadSound('success-chime', '/sounds/success-chime.mp3');
soundManager.preloadSound('notification-chime', '/sounds/notification-chime.mp3');

// THE WEB-SLINGER THEME SOUNDS (Spider-Man)
soundManager.preloadSound('web-shoot', '/sounds/web-shoot.mp3');
soundManager.preloadSound('thwip', '/sounds/thwip.mp3');
soundManager.preloadSound('spider-sense', '/sounds/spider-sense.mp3');

// THE EMPIRE THEME SOUNDS (Breaking Bad)
soundManager.preloadSound('bubble', '/sounds/bubble.mp3');
soundManager.preloadSound('chemical-drop', '/sounds/chemical-drop.mp3');
soundManager.preloadSound('glass-clink', '/sounds/glass-clink.mp3');

// ENCHANTED TALES THEME SOUNDS (Snow White/Rapunzel/Barbie)
soundManager.preloadSound('pop-sparkle', '/sounds/pop-sparkle.mp3');
soundManager.preloadSound('barbie-pop', '/sounds/barbie-pop.mp3');
soundManager.preloadSound('sparkle-chime', '/sounds/sparkle-chime.mp3');

