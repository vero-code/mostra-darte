// Text-to-speech engine using Web Speech API for Virtual Docent narration

class DocentSpeechEngine {
  private synth: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private isMuted = false;
  private onSpeakingChangeCallback: ((speaking: boolean) => void) | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    // Prefer warm, articulate English voices (e.g. Daniel, Oliver, Victoria, Serena, or Italian-English)
    const preferred = voices.find(
      (v) =>
        v.name.includes('Daniel') ||
        v.name.includes('Oliver') ||
        v.name.includes('Google UK English Male') ||
        v.name.includes('Natural') ||
        v.name.includes('Serena') ||
        (v.lang.startsWith('en') && v.name.includes('Male'))
    ) || voices.find((v) => v.lang.startsWith('en'));

    if (preferred) {
      this.voice = preferred;
    }
  }

  public setSpeakingCallback(cb: (speaking: boolean) => void) {
    this.onSpeakingChangeCallback = cb;
  }

  public speak(text: string, force = false) {
    if (!this.synth || (this.isMuted && !force)) return;

    this.stop();

    // Clean markdown and tool tags from spoken text
    const cleanText = text
      .replace(/\[WebMCP Tool:[^\]]+\]/g, '')
      .replace(/\{x:[^}]+\}/g, '')
      .replace(/[*_#`~]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.rate = 0.95; // Slightly measured, aristocratic cadence
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.onSpeakingChangeCallback?.(true);
    };

    utterance.onend = () => {
      this.onSpeakingChangeCallback?.(false);
    };

    utterance.onerror = () => {
      this.onSpeakingChangeCallback?.(false);
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.onSpeakingChangeCallback?.(false);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stop();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const docentSpeech = new DocentSpeechEngine();
