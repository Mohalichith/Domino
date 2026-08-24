import { DominoTileData, PlacedTile, TableSide, Player, GameMode, AIDifficulty, RoundResult, MoveOption } from '../types/domino';

// Generate standard Double-Six Domino set (28 tiles)
export function generateDoubleSixSet(): DominoTileData[] {
  const tiles: DominoTileData[] = [];
  for (let i = 0; i <= 6; i++) {
    for (let j = i; j <= 6; j++) {
      tiles.push({
        id: `${i}-${j}`,
        left: i,
        right: j,
        isDouble: i === j,
      });
    }
  }
  return tiles;
}

// Fisher-Yates Shuffle
export function shuffleTiles(tiles: DominoTileData[]): DominoTileData[] {
  const result = [...tiles];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Tile pip sum
export function getTilePipSum(tile: DominoTileData): number {
  return tile.left + tile.right;
}

// Hand pip sum
export function getHandPipSum(hand: DominoTileData[]): number {
  return hand.reduce((sum, tile) => sum + getTilePipSum(tile), 0);
}

// Find who starts first
export function findStartingPlayer(players: Player[]): { playerIndex: number; startingTile: DominoTileData | null } {
  // 1. Look for highest double from 6-6 down to 0-0
  for (let doubleVal = 6; doubleVal >= 0; doubleVal--) {
    for (let p = 0; p < players.length; p++) {
      const doubleTile = players[p].hand.find(t => t.left === doubleVal && t.right === doubleVal);
      if (doubleTile) {
        return { playerIndex: p, startingTile: doubleTile };
      }
    }
  }

  // 2. If no doubles in any hand, find tile with highest sum, then highest single pip
  let highestSum = -1;
  let highestPlayerIndex = 0;
  let highestTile: DominoTileData | null = null;

  players.forEach((player, pIdx) => {
    player.hand.forEach(tile => {
      const sum = getTilePipSum(tile);
      if (sum > highestSum || (sum === highestSum && Math.max(tile.left, tile.right) > (highestTile ? Math.max(highestTile.left, highestTile.right) : -1))) {
        highestSum = sum;
        highestPlayerIndex = pIdx;
        highestTile = tile;
      }
    });
  });

  return { playerIndex: highestPlayerIndex, startingTile: highestTile };
}

// Get all legal moves for a given hand and open ends
export function getLegalMoves(hand: DominoTileData[], headValue: number | null, tailValue: number | null): MoveOption[] {
  // If board is empty, any tile in hand can be played
  if (headValue === null || tailValue === null) {
    return hand.map(tile => ({
      tile,
      side: 'head',
      reversed: false,
      value: tile.right, // Exposed end
    }));
  }

  const moves: MoveOption[] = [];

  hand.forEach(tile => {
    // Check Head
    if (tile.left === headValue) {
      moves.push({
        tile,
        side: 'head',
        reversed: false, // Left connects to head, right becomes new head
        value: tile.right,
      });
    } else if (tile.right === headValue) {
      moves.push({
        tile,
        side: 'head',
        reversed: true, // Right connects to head, left becomes new head
        value: tile.left,
      });
    }

    // Check Tail
    if (tile.left === tailValue) {
      moves.push({
        tile,
        side: 'tail',
        reversed: false, // Left connects to tail, right becomes new tail
        value: tile.right,
      });
    } else if (tile.right === tailValue) {
      moves.push({
        tile,
        side: 'tail',
        reversed: true, // Right connects to tail, left becomes new tail
        value: tile.left,
      });
    }
  });

  // Remove duplicate moves if head and tail have the same value
  const uniqueMoves: MoveOption[] = [];
  const seen = new Set<string>();

  moves.forEach(m => {
    const key = `${m.tile.id}-${m.side}-${m.reversed}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueMoves.push(m);
    }
  });

  return uniqueMoves;
}

// Calculate All Fives (Muggins) points from open board ends
export function calculateAllFivesScore(headValue: number | null, tailValue: number | null, placedTiles: PlacedTile[]): number {
  if (headValue === null || tailValue === null || placedTiles.length === 0) return 0;
  
  if (placedTiles.length === 1) {
    const root = placedTiles[0].tile;
    const sum = root.isDouble ? root.left + root.right : root.left + root.right;
    return sum % 5 === 0 ? sum : 0;
  }

  const sum = headValue + tailValue;
  return sum % 5 === 0 && sum > 0 ? sum : 0;
}

// Calculate score at round end
export function calculateRoundEndScore(players: Player[], winnerId: string | null, reason: 'domino' | 'blocked'): RoundResult {
  const remainingHands = players.map(p => ({
    playerId: p.id,
    name: p.name,
    tiles: [...p.hand],
    pipSum: getHandPipSum(p.hand),
  }));

  if (reason === 'domino' && winnerId) {
    // Winner gets sum of all opponents' pips
    const pointsGained = remainingHands
      .filter(h => h.playerId !== winnerId)
      .reduce((sum, h) => sum + h.pipSum, 0);

    const winner = players.find(p => p.id === winnerId);
    return {
      winnerId,
      winnerName: winner ? winner.name : '',
      reason: 'domino',
      pointsGained,
      remainingHands,
    };
  }

  // Blocked game: Player with lowest pip sum wins difference
  // Sort by pip sum ascending
  const sortedHands = [...remainingHands].sort((a, b) => a.pipSum - b.pipSum);
  const lowestHand = sortedHands[0];
  const secondLowest = sortedHands[1];

  // Check if tie on lowest sum
  const isTie = secondLowest && lowestHand.pipSum === secondLowest.pipSum;

  if (isTie) {
    // Tie in blocked game: 0 points awarded
    return {
      winnerId: null,
      winnerName: null,
      reason: 'blocked',
      pointsGained: 0,
      remainingHands,
    };
  }

  // Winner gets difference or total of other players
  const otherPipsSum = sortedHands.slice(1).reduce((sum, h) => sum + h.pipSum, 0);
  const pointsGained = otherPipsSum - lowestHand.pipSum;

  return {
    winnerId: lowestHand.playerId,
    winnerName: lowestHand.name,
    reason: 'blocked',
    pointsGained: Math.max(0, pointsGained),
    remainingHands,
  };
}

// Intelligent Domino AI Engine
export function getAIMove(
  aiPlayer: Player,
  legalMoves: MoveOption[],
  difficulty: AIDifficulty,
  mode: GameMode,
  headValue: number | null,
  tailValue: number | null,
  allPlayers: Player[],
  placedTiles: PlacedTile[]
): MoveOption | null {
  if (legalMoves.length === 0) return null;
  if (legalMoves.length === 1) return legalMoves[0];

  // 1. Easy Mode: Random choice with slight preference for doubles
  if (difficulty === 'easy') {
    const doubleMoves = legalMoves.filter(m => m.tile.isDouble);
    if (doubleMoves.length > 0 && Math.random() < 0.6) {
      return doubleMoves[Math.floor(Math.random() * doubleMoves.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // 2. Medium Mode:
  // - In All Fives: maximize instant points
  // - In Draw/Block: play highest pips to minimize risk, prioritize heavy doubles
  if (difficulty === 'medium') {
    if (mode === 'all_fives') {
      let bestMove = legalMoves[0];
      let maxPoints = -1;

      legalMoves.forEach(m => {
        const newHead = m.side === 'head' ? m.value : headValue;
        const newTail = m.side === 'tail' ? m.value : tailValue;
        const score = calculateAllFivesScore(newHead, newTail, [...placedTiles, { tile: m.tile } as PlacedTile]);
        if (score > maxPoints) {
          maxPoints = score;
          bestMove = m;
        }
      });

      if (maxPoints > 0) return bestMove;
    }

    // Sort by pip sum descending (heaviest tiles first)
    const sortedMoves = [...legalMoves].sort((a, b) => {
      // Doubles get slight bonus
      const weightA = getTilePipSum(a.tile) + (a.tile.isDouble ? 6 : 0);
      const weightB = getTilePipSum(b.tile) + (b.tile.isDouble ? 6 : 0);
      return weightB - weightA;
    });

    return sortedMoves[0];
  }

  // 3. Hard / Master Mode:
  // Strategic heuristics:
  // a) Hand coverage: Keep numbers that match other tiles in AI hand so AI won't be blocked later.
  // b) Opponent block: Remember which numbers opponents passed on and play towards those numbers to freeze them.
  // c) Pip dumping: Safely get rid of [6-6], [6-5], [5-5], etc.
  // d) All-Fives scoring optimization.

  const opponents = allPlayers.filter(p => p.id !== aiPlayer.id);

  let bestMove = legalMoves[0];
  let highestScore = -9999;

  legalMoves.forEach(move => {
    let score = 0;

    // A) Immediate All-Fives Score
    if (mode === 'all_fives') {
      const newHead = move.side === 'head' ? move.value : headValue;
      const newTail = move.side === 'tail' ? move.value : tailValue;
      const points = calculateAllFivesScore(newHead, newTail, [...placedTiles, { tile: move.tile } as PlacedTile]);
      score += points * 25; // High weight for immediate points
    }

    // B) Pip disposal: Playing heavy tiles is generally safer
    const pipSum = getTilePipSum(move.tile);
    score += pipSum * 2;

    // Heavy doubles are dangerous to hold
    if (move.tile.isDouble) {
      score += move.tile.left >= 4 ? 12 : 5;
    }

    // C) Synergies with remaining hand:
    // Does the newly exposed end value (move.value) match any OTHER tile in AI hand?
    const otherTiles = aiPlayer.hand.filter(t => t.id !== move.tile.id);
    const matchesInHand = otherTiles.filter(t => t.left === move.value || t.right === move.value).length;
    score += matchesInHand * 6; // Excellent flexibility

    // D) Opponent Block:
    // If opponent passed on a specific value earlier, setting board ends to that value locks them out!
    opponents.forEach(opp => {
      if (opp.passedLastTurn) {
        // Opponent couldn't play on the previous ends
        if (headValue !== null && move.value === headValue) score += 10;
        if (tailValue !== null && move.value === tailValue) score += 10;
      }
    });

    // E) Domino winning move:
    if (aiPlayer.hand.length === 1) {
      score += 500; // Immediate win!
    }

    if (score > highestScore) {
      highestScore = score;
      bestMove = move;
    }
  });

  return bestMove;
}
