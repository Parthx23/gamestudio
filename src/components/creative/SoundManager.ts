class SoundManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();

  async init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  async loadSound(name: string, frequency: number, duration: number, type: OscillatorType = 'sine') {
    if (!this.audioContext) await this.init();
    
    const buffer = this.audioContext!.createBuffer(1, this.audioContext!.sampleRate * duration, this.audioContext!.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < data.length; i++) {
      const t = i / this.audioContext!.sampleRate;
      data[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 2);
    }
    
    this.sounds.set(name, buffer);
  }

  playSound(name: string, volume: number = 0.3) {
    if (!this.audioContext || !this.sounds.has(name)) return;
    
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();
    
    source.buffer = this.sounds.get(name)!;
    gainNode.gain.value = volume;
    
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    source.start();
  }

  async preloadGameSounds() {
    await this.loadSound('jump', 440, 0.2);
    await this.loadSound('collect', 880, 0.1);
    await this.loadSound('hit', 220, 0.3);
    await this.loadSound('win', 660, 0.5);
    await this.loadSound('lose', 110, 0.8);
  }
}

export const soundManager = new SoundManager();