import { PlacedTile, BoardEnd, DominoTileData, TableSide } from '../types/domino';

export interface VisualTileNode {
  tile: DominoTileData;
  x: number;
  y: number;
  rotation: number; // 0, 90, 180, 270
  isDouble: boolean;
  side: TableSide | 'root';
  leftValue: number;
  rightValue: number;
  sequence: number;
}

export interface BoardLayoutResult {
  placedTiles: VisualTileNode[];
  headEnd: BoardEnd | null;
  tailEnd: BoardEnd | null;
  bounds: { minX: number; maxX: number; minY: number; maxY: number; width: number; height: number };
}

// Domino dimensions (relative grid units)
const TILE_LENGTH = 80;
const TILE_WIDTH = 40;
const HALF_LEN = TILE_LENGTH / 2;
const HALF_WID = TILE_WIDTH / 2;
const GAP = 3;

/**
 * Computes exact 2D positions, rotations, and branch turns for the domino chain.
 * Center root tile starts at (0, 0).
 * Head grows leftwards/upwards with turns if too long.
 * Tail grows rightwards/downwards with turns if too long.
 */
export function calculateBoardLayout(
  chain: { tile: DominoTileData; side: TableSide | 'root'; reversed: boolean }[],
  headValue: number | null,
  tailValue: number | null
): BoardLayoutResult {
  if (chain.length === 0) {
    return {
      placedTiles: [],
      headEnd: null,
      tailEnd: null,
      bounds: { minX: -200, maxX: 200, minY: -150, maxY: 150, width: 400, height: 300 },
    };
  }

  const placedTiles: VisualTileNode[] = [];
  const rootItem = chain[0];

  // Root tile at (0, 0)
  // If root is double, orient vertically (rotation: 90)
  const isRootDouble = rootItem.tile.isDouble;
  placedTiles.push({
    tile: rootItem.tile,
    x: 0,
    y: 0,
    rotation: isRootDouble ? 90 : 0,
    isDouble: isRootDouble,
    side: 'root',
    leftValue: rootItem.tile.left,
    rightValue: rootItem.tile.right,
    sequence: 0,
  });

  // Separate chain into Head branch (items placed at 'head') and Tail branch ('tail')
  const headBranch: { tile: DominoTileData; reversed: boolean; seq: number }[] = [];
  const tailBranch: { tile: DominoTileData; reversed: boolean; seq: number }[] = [];

  for (let i = 1; i < chain.length; i++) {
    const item = chain[i];
    if (item.side === 'head') {
      headBranch.push({ tile: item.tile, reversed: item.reversed, seq: i });
    } else {
      tailBranch.push({ tile: item.tile, reversed: item.reversed, seq: i });
    }
  }

  // --- BUILD TAIL BRANCH (Moves to the right, turns down, then left) ---
  let tailX = isRootDouble ? HALF_WID : HALF_LEN;
  let tailY = 0;
  let tailDir: 'right' | 'down' | 'left' | 'up' = 'right';
  let tailDist = 0;
  const MAX_HORIZ = 340;

  tailBranch.forEach((item) => {
    const isDouble = item.tile.isDouble;
    let tileX = tailX;
    let tileY = tailY;
    let rot = 0;

    if (tailDir === 'right') {
      if (tailDist >= MAX_HORIZ && !isDouble) {
        // Turn Downwards
        tailDir = 'down';
        tileX = tailX + HALF_WID;
        tileY = tailY + HALF_LEN;
        rot = 90;
        tailX = tileX;
        tailY = tileY + HALF_LEN + GAP;
        tailDist = 0;
      } else {
        if (isDouble) {
          tileX = tailX + HALF_WID + GAP;
          tileY = tailY;
          rot = 90;
          tailX = tileX + HALF_WID + GAP;
        } else {
          tileX = tailX + HALF_LEN + GAP;
          tileY = tailY;
          rot = item.reversed ? 180 : 0;
          tailX = tileX + HALF_LEN + GAP;
        }
        tailDist += TILE_LENGTH;
      }
    } else if (tailDir === 'down') {
      if (tailDist >= 160 && !isDouble) {
        // Turn Leftwards
        tailDir = 'left';
        tileX = tailX - HALF_LEN;
        tileY = tailY + HALF_WID;
        rot = 180;
        tailX = tileX - HALF_LEN - GAP;
        tailY = tileY;
        tailDist = 0;
      } else {
        if (isDouble) {
          tileX = tailX;
          tileY = tailY + HALF_WID + GAP;
          rot = 0;
          tailY = tileY + HALF_WID + GAP;
        } else {
          tileX = tailX;
          tileY = tailY + HALF_LEN + GAP;
          rot = item.reversed ? 270 : 90;
          tailY = tileY + HALF_LEN + GAP;
        }
        tailDist += TILE_LENGTH;
      }
    } else if (tailDir === 'left') {
      if (isDouble) {
        tileX = tailX - HALF_WID - GAP;
        tileY = tailY;
        rot = 90;
        tailX = tileX - HALF_WID - GAP;
      } else {
        tileX = tailX - HALF_LEN - GAP;
        tileY = tailY;
        rot = item.reversed ? 0 : 180;
        tailX = tileX - HALF_LEN - GAP;
      }
      tailDist += TILE_LENGTH;
    }

    placedTiles.push({
      tile: item.tile,
      x: tileX,
      y: tileY,
      rotation: rot,
      isDouble,
      side: 'tail',
      leftValue: item.reversed ? item.tile.right : item.tile.left,
      rightValue: item.reversed ? item.tile.left : item.tile.right,
      sequence: item.seq,
    });
  });

  // --- BUILD HEAD BRANCH (Moves to the left, turns up, then right) ---
  let headX = isRootDouble ? -HALF_WID : -HALF_LEN;
  let headY = 0;
  let headDir: 'left' | 'up' | 'right' | 'down' = 'left';
  let headDist = 0;

  headBranch.forEach((item) => {
    const isDouble = item.tile.isDouble;
    let tileX = headX;
    let tileY = headY;
    let rot = 0;

    if (headDir === 'left') {
      if (headDist >= MAX_HORIZ && !isDouble) {
        // Turn Upwards
        headDir = 'up';
        tileX = headX - HALF_WID;
        tileY = headY - HALF_LEN;
        rot = 270;
        headX = tileX;
        headY = tileY - HALF_LEN - GAP;
        headDist = 0;
      } else {
        if (isDouble) {
          tileX = headX - HALF_WID - GAP;
          tileY = headY;
          rot = 90;
          headX = tileX - HALF_WID - GAP;
        } else {
          tileX = headX - HALF_LEN - GAP;
          tileY = headY;
          rot = item.reversed ? 0 : 180;
          headX = tileX - HALF_LEN - GAP;
        }
        headDist += TILE_LENGTH;
      }
    } else if (headDir === 'up') {
      if (headDist >= 160 && !isDouble) {
        // Turn Rightwards
        headDir = 'right';
        tileX = headX + HALF_LEN;
        tileY = headY - HALF_WID;
        rot = 0;
        headX = tileX + HALF_LEN + GAP;
        headY = tileY;
        headDist = 0;
      } else {
        if (isDouble) {
          tileX = headX;
          tileY = headY - HALF_WID - GAP;
          rot = 0;
          headY = tileY - HALF_WID - GAP;
        } else {
          tileX = headX;
          tileY = headY - HALF_LEN - GAP;
          rot = item.reversed ? 90 : 270;
          headY = tileY - HALF_LEN - GAP;
        }
        headDist += TILE_LENGTH;
      }
    } else if (headDir === 'right') {
      if (isDouble) {
        tileX = headX + HALF_WID + GAP;
        tileY = headY;
        rot = 90;
        headX = tileX + HALF_WID + GAP;
      } else {
        tileX = headX + HALF_LEN + GAP;
        tileY = headY;
        rot = item.reversed ? 180 : 0;
        headX = tileX + HALF_LEN + GAP;
      }
      headDist += TILE_LENGTH;
    }

    placedTiles.push({
      tile: item.tile,
      x: tileX,
      y: tileY,
      rotation: rot,
      isDouble,
      side: 'head',
      leftValue: item.reversed ? item.tile.right : item.tile.left,
      rightValue: item.reversed ? item.tile.left : item.tile.right,
      sequence: item.seq,
    });
  });

  // Calculate Board Ends for Anchor Target placement
  let headEnd: BoardEnd | null = null;
  let tailEnd: BoardEnd | null = null;

  if (headValue !== null) {
    let targetX = headX;
    let targetY = headY;
    if (headDir === 'left') targetX -= 45;
    else if (headDir === 'up') targetY -= 45;
    else if (headDir === 'right') targetX += 45;
    else if (headDir === 'down') targetY += 45;

    headEnd = {
      side: 'head',
      value: headValue,
      x: headX,
      y: headY,
      direction: headDir,
      targetX,
      targetY,
    };
  }

  if (tailValue !== null) {
    let targetX = tailX;
    let targetY = tailY;
    if (tailDir === 'right') targetX += 45;
    else if (tailDir === 'down') targetY += 45;
    else if (tailDir === 'left') targetX -= 45;
    else if (tailDir === 'up') targetY -= 45;

    tailEnd = {
      side: 'tail',
      value: tailValue,
      x: tailX,
      y: tailY,
      direction: tailDir,
      targetX,
      targetY,
    };
  }

  // Calculate bounding box for auto-zoom/fit
  let minX = 0, maxX = 0, minY = 0, maxY = 0;
  placedTiles.forEach(t => {
    minX = Math.min(minX, t.x - 50);
    maxX = Math.max(maxX, t.x + 50);
    minY = Math.min(minY, t.y - 50);
    maxY = Math.max(maxY, t.y + 50);
  });

  if (headEnd) {
    minX = Math.min(minX, headEnd.targetX - 40);
    maxX = Math.max(maxX, headEnd.targetX + 40);
    minY = Math.min(minY, headEnd.targetY - 40);
    maxY = Math.max(maxY, headEnd.targetY + 40);
  }
  if (tailEnd) {
    minX = Math.min(minX, tailEnd.targetX - 40);
    maxX = Math.max(maxX, tailEnd.targetX + 40);
    minY = Math.min(minY, tailEnd.targetY - 40);
    maxY = Math.max(maxY, tailEnd.targetY + 40);
  }

  return {
    placedTiles,
    headEnd,
    tailEnd,
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
      width: Math.max(300, maxX - minX + 60),
      height: Math.max(200, maxY - minY + 60),
    },
  };
}
