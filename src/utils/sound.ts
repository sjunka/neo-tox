import { createAudioPlayer } from 'expo-audio';
import { TOKENS } from '../theme/tokens';

/**
 * Victory chime — a short C5–E5–G5 arpeggio bundled with the app.
 * One player instance is created up front and rewound on each replay,
 * so wins never pay a loading cost.
 */
const winPlayer = createAudioPlayer(require('../../assets/sfx/win.m4a'));
winPlayer.volume = TOKENS.sound.winVolume;

/**
 * Plays the win chime. Mirrors the haptics contract: audio is garnish,
 * so any failure (muted device, interrupted session, simulator quirks)
 * is swallowed — sound must never crash or block gameplay.
 */
export const playWinSound = (): void => {
  try {
    winPlayer.seekTo(0);
    winPlayer.play();
  } catch {
    // Deliberately ignored — see contract above.
  }
};
