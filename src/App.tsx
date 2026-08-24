/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  DominoTileData,
  Player,
  GameSettings,
  TableSide,
  RoundResult,
  MatchStats,
  MoveOption,
} from './types/domino';
import {
  generateDoubleSixSet,
  shuffleTiles,
  findStartingPlayer,
  getLegalMoves,
  calculateAllFivesScore,
  calculateRoundEndScore,
  getAIMove,
} from './utils/dominoLogic';
import { calculateBoardLayout } from './utils/boardLayout';
import { soundManager } from './utils/audio';
import { ScoreBoard } from './components/ScoreBoard';
import { DominoBoard } from './components/DominoBoard';
import { PlayerHand } from './components/PlayerHand';
import { Boneyard } from './components/Boneyard';
import { GameSettingsModal } from './components/GameSettingsModal';
import { RoundEndModal } from './components/RoundEndModal';
import { RulesModal } from './components/RulesModal';
import { StatsModal } from './components/StatsModal';
import { Sparkles, Bot, AlertCircle, RefreshCw } from 'lucide-react';

const DEFAULT_SETTINGS: GameSettings = {
  mode: 'draw',
  targetScore: 100,
  playerCount: 2,
  aiDifficulty: 'medium',
  isPassAndPlay: false,
  soundEnabled: true,
  tableTheme: 'green_felt',
  tileSkin: 'classic_ivory',
  showHints: true,
};

const DEFAULT_STATS: MatchStats = {
  gamesPlayed: 0,
  gamesWon: 0,
  roundsPlayed: 0,
  totalPoints: 0,
  highestRoundScore: 0,
  dominoesPlayed: 0,
  blockedRoundsWon: 0,
  allFivesScoredTotal: 0,
};

export default function App() {
  // Settings & Audio State
  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('domino_settings');
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  });

  const [stats, setStats] = useState<MatchStats>(() => {
    const saved = localStorage.getItem('domino_stats');
    return saved ? { ...DEFAULT_STATS, ...JSON.parse(saved) } : DEFAULT_STATS;
  });

  // Game Engine State
  const [players, setPlayers] = useState<Player[]>([]);
  const [boneyard, setBoneyard] = useState<DominoTileData[]>([]);
  const [placedChain, setPlacedChain] = useState<{ tile: DominoTileData; side: TableSide | 'root'; reversed: boolean }[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState<number>(0);
  const [headValue, setHeadValue] = useState<number | null>(null);
  const [tailValue, setTailValue] = useState<number | null>(null);
  
  // Game Status
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [consecutivePasses, setConsecutivePasses] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('بدء جولة جديدة...');
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);
  const [selectedTile, setSelectedTile] = useState<DominoTileData | null>(null);
  const [lastScoredPoints, setLastScoredPoints] = useState<{ points: number; timestamp: number } | null>(null);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [isRoundEndOpen, setIsRoundEndOpen] = useState<boolean>(false);
  const [isMatchFinished, setIsMatchFinished] = useState<boolean>(false);
  const [matchWinner, setMatchWinner] = useState<Player | null>(null);
  const [hintMessage, setHintMessage] = useState<string | null>(null);

  // Sync sound settings
  useEffect(() => {
    soundManager.setEnabled(settings.soundEnabled);
    localStorage.setItem('domino_settings', JSON.stringify(settings));
  }, [settings]);

  // Sync stats
  useEffect(() => {
    localStorage.setItem('domino_stats', JSON.stringify(stats));
  }, [stats]);

  // Compute Layout for visual board
  const layout = React.useMemo(() => {
    return calculateBoardLayout(placedChain, headValue, tailValue);
  }, [placedChain, headValue, tailValue]);

  // Active Player
  const currentPlayer = players[currentTurnIndex];
  const isHumanTurn = currentPlayer ? !currentPlayer.isAI : false;

  // Compute Legal Moves for Human Player
  const legalMoves = React.useMemo(() => {
    if (!currentPlayer || !currentPlayer.hand) return [];
    return getLegalMoves(currentPlayer.hand, headValue, tailValue);
  }, [currentPlayer, headValue, tailValue]);

  const playableTileIds = React.useMemo(() => {
    return Array.from(new Set(legalMoves.map(m => m.tile.id)));
  }, [legalMoves]);

  // Valid sides for currently selected tile
  const validSidesForSelected = React.useMemo(() => {
    if (!selectedTile) return [];
    const moves = legalMoves.filter(m => m.tile.id === selectedTile.id);
    return moves.map(m => m.side);
  }, [selectedTile, legalMoves]);

  // Start new match
  const startNewGame = useCallback((newSettings?: GameSettings) => {
    const activeSettings = newSettings || settings;
    if (newSettings) setSettings(newSettings);

    const initialPlayers: Player[] = [];
    if (activeSettings.isPassAndPlay) {
      initialPlayers.push({ id: 'p1', name: 'اللاعب 1 (أنت)', isAI: false, avatar: '👤', hand: [], score: 0, roundScore: 0 });
      initialPlayers.push({ id: 'p2', name: 'اللاعب 2 (صديقك)', isAI: false, avatar: '👥', hand: [], score: 0, roundScore: 0 });
    } else if (activeSettings.playerCount === 2) {
      initialPlayers.push({ id: 'p1', name: 'أنت', isAI: false, avatar: '👤', hand: [], score: 0, roundScore: 0 });
      initialPlayers.push({ id: 'ai1', name: 'الكمبيوتر الذكي', isAI: true, avatar: '🤖', hand: [], score: 0, roundScore: 0 });
    } else {
      // 4 Players
      initialPlayers.push({ id: 'p1', name: 'أنت', isAI: false, avatar: '👤', hand: [], score: 0, roundScore: 0, team: 1 });
      initialPlayers.push({ id: 'ai1', name: 'سامي (AI)', isAI: true, avatar: '🤖', hand: [], score: 0, roundScore: 0, team: 2 });
      initialPlayers.push({ id: 'ai2', name: 'شريكك (AI)', isAI: true, avatar: '🤖', hand: [], score: 0, roundScore: 0, team: 1 });
      initialPlayers.push({ id: 'ai3', name: 'كريم (AI)', isAI: true, avatar: '🤖', hand: [], score: 0, roundScore: 0, team: 2 });
    }

    setPlayers(initialPlayers);
    setRoundNumber(1);
    setIsMatchFinished(false);
    setMatchWinner(null);
    setRoundResult(null);
    setIsRoundEndOpen(false);

    startRound(initialPlayers, activeSettings, 1);
  }, [settings]);

  // Start Round
  const startRound = (currentPlayersList: Player[], activeSettings: GameSettings, rNum: number) => {
    soundManager.playShuffle();
    const fullDeck = shuffleTiles(generateDoubleSixSet());
    const tilesPerPlayer = currentPlayersList.length === 2 ? 7 : 5;

    let deckIndex = 0;
    const updatedPlayers = currentPlayersList.map(p => {
      const hand = fullDeck.slice(deckIndex, deckIndex + tilesPerPlayer);
      deckIndex += tilesPerPlayer;
      return {
        ...p,
        hand,
        roundScore: 0,
        passedLastTurn: false,
      };
    });

    const remainingBoneyard = fullDeck.slice(deckIndex);

    // Determine who starts
    const { playerIndex, startingTile } = findStartingPlayer(updatedPlayers);
    const starterName = updatedPlayers[playerIndex].name;

    setPlayers(updatedPlayers);
    setBoneyard(remainingBoneyard);
    setPlacedChain([]);
    setHeadValue(null);
    setTailValue(null);
    setCurrentTurnIndex(playerIndex);
    setConsecutivePasses(0);
    setSelectedTile(null);
    setHintMessage(null);
    setRoundNumber(rNum);
    setStatusMessage(
      startingTile
        ? `يبدأ ${starterName} الجولة بامتلاكه لأعلى قطعة [${startingTile.left}-${startingTile.right}]`
        : `يبدأ ${starterName} الجولة!`
    );
  };

  // Initial load
  const hasInitialized = useRef(false);
  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      startNewGame();
    }
  }, [startNewGame]);

  // Handle Game End / Check Round Over
  const checkRoundEnd = useCallback((
    activePlayers: Player[],
    lastPlayer: Player,
    reason: 'domino' | 'blocked'
  ) => {
    const winnerId = reason === 'domino' ? lastPlayer.id : null;
    const result = calculateRoundEndScore(activePlayers, winnerId, reason);

    if (reason === 'domino') {
      soundManager.playRoundWin();
    } else {
      soundManager.playBlock();
    }

    // Update match scores
    let matchWon = false;
    let matchChampion: Player | null = null;

    const newPlayers = activePlayers.map(p => {
      let addedPoints = 0;
      if (p.id === result.winnerId) {
        addedPoints = result.pointsGained;
      }
      const newTotal = p.score + addedPoints;
      if (newTotal >= settings.targetScore && !matchWon) {
        matchWon = true;
        matchChampion = { ...p, score: newTotal };
      }
      return {
        ...p,
        score: newTotal,
        roundScore: addedPoints,
      };
    });

    setPlayers(newPlayers);
    setRoundResult(result);
    setIsRoundEndOpen(true);
    setIsMatchFinished(matchWon);
    setMatchWinner(matchChampion);

    // Update Stats
    setStats(prev => {
      const isHumanWinner = result.winnerId === 'p1';
      return {
        ...prev,
        gamesPlayed: matchWon ? prev.gamesPlayed + 1 : prev.gamesPlayed,
        gamesWon: matchWon && matchChampion?.id === 'p1' ? prev.gamesWon + 1 : prev.gamesWon,
        roundsPlayed: prev.roundsPlayed + 1,
        totalPoints: prev.totalPoints + (isHumanWinner ? result.pointsGained : 0),
        highestRoundScore: isHumanWinner ? Math.max(prev.highestRoundScore, result.pointsGained) : prev.highestRoundScore,
        blockedRoundsWon: isHumanWinner && reason === 'blocked' ? prev.blockedRoundsWon + 1 : prev.blockedRoundsWon,
      };
    });

    if (matchWon) {
      soundManager.playWin();
    }
  }, [settings.targetScore]);

  // Advance turn to next player
  const advanceTurn = useCallback((updatedPlayers: Player[], numPasses: number) => {
    if (numPasses >= updatedPlayers.length) {
      // Board blocked!
      setStatusMessage('انتهت الجولة: اللعبة مقفلة (عجز جميع اللاعبين عن الحركة)!');
      checkRoundEnd(updatedPlayers, updatedPlayers[currentTurnIndex], 'blocked');
      return;
    }

    const nextIndex = (currentTurnIndex + 1) % updatedPlayers.length;
    setCurrentTurnIndex(nextIndex);
    setSelectedTile(null);
    setHintMessage(null);
    setStatusMessage(`دور ${updatedPlayers[nextIndex].name}`);
  }, [currentTurnIndex, checkRoundEnd]);

  // Place Tile Action (Human or AI)
  const placeTile = useCallback((tile: DominoTileData, side: TableSide, reversed: boolean) => {
    soundManager.playTilePlace();

    const activePlayer = players[currentTurnIndex];
    const newHand = activePlayer.hand.filter(t => t.id !== tile.id);

    // Calculate new ends
    let newHead = headValue;
    let newTail = tailValue;

    if (placedChain.length === 0) {
      // First tile placed
      newHead = tile.left;
      newTail = tile.right;
    } else if (side === 'head') {
      newHead = reversed ? tile.left : tile.right;
    } else {
      newTail = reversed ? tile.left : tile.right;
    }

    const newChainItem = {
      tile,
      side: placedChain.length === 0 ? ('root' as const) : side,
      reversed,
    };
    const newChain = [...placedChain, newChainItem];

    // All Fives scoring
    let pointsScored = 0;
    if (settings.mode === 'all_fives') {
      const fivesPoints = calculateAllFivesScore(newHead, newTail, [
        ...newChain.map(c => ({ tile: c.tile } as any)),
      ]);
      if (fivesPoints > 0) {
        pointsScored = fivesPoints;
        soundManager.playScorePoints();
        setLastScoredPoints({ points: fivesPoints, timestamp: Date.now() });
        setStatusMessage(`سجل ${activePlayer.name} ${fivesPoints} نقطة مضاعفات الـ5!`);
        
        setStats(prev => ({
          ...prev,
          allFivesScoredTotal: activePlayer.id === 'p1' ? prev.allFivesScoredTotal + fivesPoints : prev.allFivesScoredTotal,
        }));
      }
    }

    const updatedPlayers = players.map((p, idx) => {
      if (idx === currentTurnIndex) {
        return {
          ...p,
          hand: newHand,
          score: p.score + pointsScored,
          passedLastTurn: false,
        };
      }
      return p;
    });

    setPlacedChain(newChain);
    setHeadValue(newHead);
    setTailValue(newTail);
    setPlayers(updatedPlayers);
    setConsecutivePasses(0);

    // Update domino stats if human
    if (activePlayer.id === 'p1') {
      setStats(prev => ({ ...prev, dominoesPlayed: prev.dominoesPlayed + 1 }));
    }

    // Check if player won this round with 0 tiles remaining
    if (newHand.length === 0) {
      setStatusMessage(`دومينو! فاز ${activePlayer.name} بالجولة!`);
      checkRoundEnd(updatedPlayers, activePlayer, 'domino');
      return;
    }

    advanceTurn(updatedPlayers, 0);
  }, [players, currentTurnIndex, headValue, tailValue, placedChain, settings.mode, checkRoundEnd, advanceTurn]);

  // Human Selects / Places Tile
  const handleHumanTileClick = (tile: DominoTileData) => {
    if (!isHumanTurn) return;

    soundManager.playTileClack();
    const validMoves = legalMoves.filter(m => m.tile.id === tile.id);

    if (validMoves.length === 0) {
      // Tile cannot be played
      return;
    }

    if (validMoves.length === 1) {
      // Direct placement (only 1 valid side)
      const move = validMoves[0];
      placeTile(tile, move.side, move.reversed);
      setSelectedTile(null);
    } else {
      // Matches both ends! Select tile to let user click the head or tail anchor
      setSelectedTile(selectedTile?.id === tile.id ? null : tile);
    }
  };

  // Human Places on Anchor
  const handleHumanPlaceOnAnchor = (side: TableSide) => {
    if (!isHumanTurn || !selectedTile) return;
    const move = legalMoves.find(m => m.tile.id === selectedTile.id && m.side === side);
    if (move) {
      placeTile(move.tile, move.side, move.reversed);
      setSelectedTile(null);
    }
  };

  // Draw Tile Action
  const handleDrawTile = () => {
    if (boneyard.length === 0) return;
    soundManager.playDraw();

    const drawnTile = boneyard[0];
    const newBoneyard = boneyard.slice(1);
    const activePlayer = players[currentTurnIndex];
    const newHand = [...activePlayer.hand, drawnTile];

    const updatedPlayers = players.map((p, idx) =>
      idx === currentTurnIndex ? { ...p, hand: newHand } : p
    );

    setBoneyard(newBoneyard);
    setPlayers(updatedPlayers);
    setStatusMessage(`سحب ${activePlayer.name} قطعة من المخزن`);

    // Check if drawn tile can immediately play
    const drawnMoves = getLegalMoves([drawnTile], headValue, tailValue);
    if (drawnMoves.length === 1 && activePlayer.isAI) {
      // AI will play it automatically in AI loop
    }
  };

  // Pass Turn Action
  const handlePassTurn = () => {
    soundManager.playPass();
    const activePlayer = players[currentTurnIndex];
    const updatedPlayers = players.map((p, idx) =>
      idx === currentTurnIndex ? { ...p, passedLastTurn: true } : p
    );

    setPlayers(updatedPlayers);
    const newPasses = consecutivePasses + 1;
    setConsecutivePasses(newPasses);
    setStatusMessage(`مرر ${activePlayer.name} دوره (باص)`);
    advanceTurn(updatedPlayers, newPasses);
  };

  // Sort Hand
  const handleSortHand = () => {
    soundManager.playClick();
    if (!currentPlayer) return;

    const sorted = [...currentPlayer.hand].sort((a, b) => {
      // Doubles first
      if (a.isDouble && !b.isDouble) return -1;
      if (!a.isDouble && b.isDouble) return 1;
      // High pip sum descending
      return (b.left + b.right) - (a.left + a.right);
    });

    setPlayers(prev =>
      prev.map((p, idx) => (idx === currentTurnIndex ? { ...p, hand: sorted } : p))
    );
  };

  // AI Turn Automated Decision Loop
  useEffect(() => {
    if (!currentPlayer || !currentPlayer.isAI || isRoundEndOpen || isMatchFinished) {
      setIsAiThinking(false);
      return;
    }

    setIsAiThinking(true);
    const timer = setTimeout(() => {
      const aiMoves = getLegalMoves(currentPlayer.hand, headValue, tailValue);

      if (aiMoves.length > 0) {
        // AI selects best move
        const chosen = getAIMove(
          currentPlayer,
          aiMoves,
          settings.aiDifficulty,
          settings.mode,
          headValue,
          tailValue,
          players,
          layout.placedTiles as any
        );

        if (chosen) {
          placeTile(chosen.tile, chosen.side, chosen.reversed);
        }
      } else {
        // No moves for AI
        if (settings.mode === 'draw' && boneyard.length > 0) {
          // AI draws
          handleDrawTile();
        } else {
          // AI passes
          handlePassTurn();
        }
      }
      setIsAiThinking(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [currentPlayer, isHumanTurn, isRoundEndOpen, isMatchFinished, headValue, tailValue, boneyard.length]);

  // Hint / Strategy Assistant
  const handleGetHint = () => {
    soundManager.playClick();
    if (legalMoves.length === 0) {
      setHintMessage(
        boneyard.length > 0 && settings.mode === 'draw'
          ? 'لا توجد قطع مطابقة في يدك حالياً، اسحب من المخزن!'
          : 'لا توجد حركات متاحة، مرر دورك (باص).'
      );
      return;
    }

    const bestMove = getAIMove(
      currentPlayer,
      legalMoves,
      'hard',
      settings.mode,
      headValue,
      tailValue,
      players,
      layout.placedTiles as any
    );

    if (bestMove) {
      setSelectedTile(bestMove.tile);
      setHintMessage(
        `القطعة المقترحة: [${bestMove.tile.left}-${bestMove.tile.right}] على الطرف (${bestMove.side === 'head' ? headValue : tailValue})`
      );
    }
  };

  // Check if human must draw or pass
  const humanHasNoMoves = isHumanTurn && legalMoves.length === 0;
  const canHumanDraw = humanHasNoMoves && settings.mode === 'draw' && boneyard.length > 0;
  const canHumanPass = humanHasNoMoves && (settings.mode === 'block' || boneyard.length === 0);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-['Tajawal',sans-serif] select-none">
      {/* Top Header & Scoreboard */}
      <ScoreBoard
        players={players}
        currentTurnIndex={currentTurnIndex}
        mode={settings.mode}
        targetScore={settings.targetScore}
        roundNumber={roundNumber}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => setSettings(s => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRules={() => setIsRulesOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        onGetHint={handleGetHint}
        onRestartGame={() => startNewGame()}
        canHint={isHumanTurn && !isRoundEndOpen && !isMatchFinished}
      />

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col max-w-7xl w-full mx-auto p-2 sm:p-4 gap-2 sm:gap-3">
        {/* Opponents Tray / Arena Top Bar */}
        <div className="w-full flex items-center justify-between gap-2 overflow-x-auto py-1">
          <div className="flex items-center gap-2">
            {players
              .filter((_, idx) => idx !== 0) // Opponents
              .map((opp) => (
                <PlayerHand
                  key={`top-opp-${opp.id}`}
                  player={opp}
                  isCurrentTurn={players[currentTurnIndex]?.id === opp.id}
                  isHuman={!opp.isAI}
                  selectedTile={null}
                  playableTileIds={[]}
                  tileSkin={settings.tileSkin}
                  onTileClick={() => {}}
                  position="top"
                />
              ))}
          </div>

          {/* AI Thinking Status Badge */}
          {isAiThinking && (
            <div className="flex items-center gap-2 bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-lg animate-pulse">
              <Bot className="w-4 h-4 animate-spin text-indigo-400" />
              <span>الكمبيوتر يفكّر في خطوته...</span>
            </div>
          )}
        </div>

        {/* Dynamic Status & Hint Banner */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-stone-900/60 rounded-xl border border-white/5 text-xs text-stone-300">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span className="font-semibold text-stone-200">{statusMessage}</span>
          </div>

          {hintMessage && (
            <div className="flex items-center gap-1.5 text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20 font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{hintMessage}</span>
            </div>
          )}
        </div>

        {/* Domino Table Arena */}
        <div className="flex-1 min-h-[360px] md:min-h-[420px] relative">
          <DominoBoard
            tiles={layout.placedTiles}
            headEnd={layout.headEnd}
            tailEnd={layout.tailEnd}
            selectedTile={selectedTile}
            validSidesForSelected={validSidesForSelected}
            onPlaceTile={handleHumanPlaceOnAnchor}
            tileSkin={settings.tileSkin}
            tableTheme={settings.tableTheme}
            lastScoredPoints={lastScoredPoints}
            isCurrentPlayerHuman={isHumanTurn}
          />
        </div>

        {/* Bottom Controls Area (Boneyard + Active Player Hand) */}
        <div className="w-full flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            {/* Boneyard Panel */}
            <Boneyard
              boneyard={boneyard}
              canDraw={canHumanDraw}
              mustDraw={canHumanDraw}
              canPass={canHumanPass}
              onDraw={handleDrawTile}
              onPass={handlePassTurn}
              tileSkin={settings.tileSkin}
              isHumanTurn={isHumanTurn}
              mode={settings.mode}
            />

            {/* Hint alert for human when multiple placements available */}
            {selectedTile && validSidesForSelected.length > 1 && (
              <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-md animate-bounce">
                <AlertCircle className="w-4 h-4 text-emerald-400" />
                <span>القطعة تناسب الطرفين! اضغط على علامة "ضع هنا" لاختيار الطرف المناسب</span>
              </div>
            )}
          </div>

          {/* Primary Human Player Hand Tray */}
          {players[0] && (
            <PlayerHand
              player={players[0]}
              isCurrentTurn={currentTurnIndex === 0}
              isHuman={true}
              selectedTile={selectedTile}
              playableTileIds={playableTileIds}
              tileSkin={settings.tileSkin}
              onTileClick={handleHumanTileClick}
              onSortHand={handleSortHand}
              position="bottom"
            />
          )}
        </div>
      </main>

      {/* Modals */}
      <GameSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={(newS) => setSettings(newS)}
        onStartNewGame={(newS) => startNewGame(newS)}
      />

      <RoundEndModal
        isOpen={isRoundEndOpen}
        roundResult={roundResult}
        players={players}
        targetScore={settings.targetScore}
        isMatchFinished={isMatchFinished}
        matchWinner={matchWinner}
        tileSkin={settings.tileSkin}
        onNextRound={() => {
          setIsRoundEndOpen(false);
          startRound(players, settings, roundNumber + 1);
        }}
        onNewMatch={() => {
          setIsRoundEndOpen(false);
          startNewGame();
        }}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />

      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        onResetStats={() => setStats(DEFAULT_STATS)}
      />
    </div>
  );
}
