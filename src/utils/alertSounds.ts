// Web Audio API를 사용한 알람 사운드 생성
export class AlertSoundManager {
  private audioContext: AudioContext | null = null;
  private isEnabled: boolean = true;

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Audio context not supported:', error);
    }
  }

  setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  private async ensureAudioContext() {
    if (!this.audioContext) return null;
    
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    return this.audioContext;
  }

  async playOpenAlert() {
    if (!this.isEnabled) return;
    
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    // 상승하는 톤의 알람음 (개장)
    const duration = 0.8;
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 첫 번째 톤
    oscillator1.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + duration / 2);
    oscillator1.type = 'sine';

    // 두 번째 톤 (하모니)
    oscillator2.frequency.setValueAtTime(400, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + duration / 2);
    oscillator2.type = 'triangle';

    // 볼륨 조절
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator1.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator1.stop(ctx.currentTime + duration);
    oscillator2.stop(ctx.currentTime + duration);
  }

  async playCloseAlert() {
    if (!this.isEnabled) return;
    
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    // 하강하는 톤의 알람음 (폐장)
    const duration = 1.0;
    const oscillator1 = ctx.createOscillator();
    const oscillator2 = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator1.connect(gainNode);
    oscillator2.connect(gainNode);
    gainNode.connect(ctx.destination);

    // 첫 번째 톤
    oscillator1.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator1.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + duration);
    oscillator1.type = 'sine';

    // 두 번째 톤 (하모니)
    oscillator2.frequency.setValueAtTime(600, ctx.currentTime);
    oscillator2.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + duration);
    oscillator2.type = 'triangle';

    // 볼륨 조절
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator1.start(ctx.currentTime);
    oscillator2.start(ctx.currentTime);
    oscillator1.stop(ctx.currentTime + duration);
    oscillator2.stop(ctx.currentTime + duration);
  }

  async playTestSound() {
    if (!this.isEnabled) return;
    
    const ctx = await this.ensureAudioContext();
    if (!ctx) return;

    // 테스트용 짧은 비프음
    const duration = 0.3;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.setValueAtTime(800, ctx.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }
}

// 싱글톤 인스턴스
export const alertSoundManager = new AlertSoundManager();