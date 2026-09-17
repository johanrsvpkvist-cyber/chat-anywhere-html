export type SoundName = "send" | "receive" | "presence" | "switch" | "success" | "warning" | "submit" | "vote" | "tick" | "winner" | "blast";

let audioContext: AudioContext | null = null;

function context() {
  if (typeof window === "undefined") return null;
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

function tone(frequency: number, duration: number, volume: number, type: OscillatorType = "sine", delay = 0) {
  const ctx = context();
  if (!ctx) return;
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const startsAt = ctx.currentTime + delay;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startsAt);
  gain.gain.setValueAtTime(0.0001, startsAt);
  gain.gain.exponentialRampToValueAtTime(volume, startsAt + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, startsAt + duration);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(startsAt);
  oscillator.stop(startsAt + duration + 0.02);
}

export function playSound(name: SoundName, enabled: boolean) {
  if (!enabled) return;
  const patterns: Record<SoundName, Array<[number, number, number, OscillatorType?, number?]>> = {
    send: [[520, 0.08, 0.025, "sine"], [780, 0.1, 0.02, "sine", 0.05]],
    receive: [[680, 0.12, 0.018, "sine"], [900, 0.12, 0.014, "sine", 0.07]],
    presence: [[330, 0.08, 0.014, "triangle"], [440, 0.1, 0.012, "triangle", 0.05]],
    switch: [[240, 0.07, 0.018, "square"], [360, 0.07, 0.014, "square", 0.04]],
    success: [[440, 0.09, 0.02, "triangle"], [660, 0.13, 0.018, "triangle", 0.07]],
    warning: [[160, 0.14, 0.025, "sawtooth"], [120, 0.18, 0.02, "sawtooth", 0.11]],
    submit: [[420, 0.08, 0.02, "square"], [840, 0.12, 0.018, "triangle", 0.06]],
    vote: [[760, 0.07, 0.018, "square"]],
    tick: [[980, 0.035, 0.012, "square"]],
    winner: [[392, 0.13, 0.024, "triangle"], [523, 0.14, 0.022, "triangle", 0.1], [784, 0.28, 0.02, "triangle", 0.22]],
    blast: [[110, 0.16, 0.03, "sawtooth"], [880, 0.2, 0.018, "square", 0.08]],
  };
  patterns[name].forEach(([frequency, duration, volume, type, delay]) => tone(frequency, duration, volume, type, delay));
}