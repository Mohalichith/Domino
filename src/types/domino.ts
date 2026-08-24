export interface DominoTileData {
  id: string; // e.g. "6-6", "3-5"
  left: number; // 0-6
  right: number; // 0-6
  isDouble: boolean;
}

export type TableSide = 'head' | 'tail';

export interface PlacedTile {
  tile: DominoTileData;
  x: number; // grid or canvas coordinates
  y: number;
  rotation: number; // 0 = horizontal (left-to-right), 90 = vertical, 180, 270
  placedAtEnd: TableSide | 'root';
  openLeft: boolean;
  openRight: boolean;
  leftValue: number; // value pointing towards the connection or open
  rightValue: number;
  sequence: number; // order of placement
}

export interface BoardEnd {
  side: TableSide;
  value: number;
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right';
  targetX: number;
  targetY: number;
}

export interface Player {
  id: string;
  name: string;
  isAI: boolean;
  avatar: string;
  hand: DominoTileData[];
  score: number;
  roundScore: number;
  team?: 1 | 2;
  passedLastTurn?: boolean;
}

export type GameMode = 'draw' | 'block' | 'all_fives';
export type AIDifficulty = 'easy' | 'medium' | 'hard';
export type TableTheme = 'green_felt' | 'walnut_wood' | 'midnight_blue' | 'ruby_red';
export type TileSkin = 'classic_ivory' | 'midnight_black' | 'pure_marble';

export interface RoundResult {
  winnerId: string | null;
  winnerName: string | null;
  reason: 'domino' | 'blocked';
  pointsGained: number;
  remainingHands: { playerId: string; name: string; tiles: DominoTileData[]; pipSum: number }[];
}

export interface GameSettings {
  mode: GameMode;
  targetScore: number; // e.g. 50, 100, 150
  playerCount: 2 | 3 | 4;
  aiDifficulty: AIDifficulty;
  isPassAndPlay: boolean; // if true, human vs human local
  soundEnabled: boolean;
  tableTheme: TableTheme;
  tileSkin: TileSkin;
  showHints: boolean;
}

export interface MoveOption {
  tile: DominoTileData;
  side: TableSide;
  reversed: boolean; // whether tile numbers need flip to match
  value: number;
}

export interface MatchStats {
  gamesPlayed: number;
  gamesWon: number;
  roundsPlayed: number;
  totalPoints: number;
  highestRoundScore: number;
  dominoesPlayed: number;
  blockedRoundsWon: number;
  allFivesScoredTotal: number;
}
