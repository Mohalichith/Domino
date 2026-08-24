import React from 'react';
import { DominoTileData, TileSkin } from '../types/domino';

interface DominoTileProps {
  tile?: DominoTileData;
  skin?: TileSkin;
  orientation?: 'horizontal' | 'vertical';
  isFaceDown?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

// Render pips for a single half (0-6)
const PipGrid: React.FC<{ value: number; skin: TileSkin; size: 'sm' | 'md' | 'lg' }> = ({ value, skin, size }) => {
  const pipColorClass =
    skin === 'midnight_black'
      ? 'pip-recessed-gold'
      : skin === 'pure_marble'
      ? 'pip-recessed-marble'
      : 'pip-recessed-dark';
  
  const pipSizes = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };
  const dotCls = `${pipSizes[size]} ${pipColorClass} rounded-full transition-transform shrink-0`;

  // Standard 3x3 matrix for domino pips
  const renderPips = () => {
    switch (value) {
      case 0:
        return null;
      case 1:
        return (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`${dotCls} ${size === 'lg' ? 'scale-110' : ''}`} />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full p-1.5 flex flex-col justify-between">
            <div className="flex justify-start"><div className={dotCls} /></div>
            <div className="flex justify-end"><div className={dotCls} /></div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full p-1.5 flex flex-col justify-between">
            <div className="flex justify-start"><div className={dotCls} /></div>
            <div className="flex justify-center"><div className={dotCls} /></div>
            <div className="flex justify-end"><div className={dotCls} /></div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full p-1.5 flex flex-col justify-between">
            <div className="flex justify-between"><div className={dotCls} /><div className={dotCls} /></div>
            <div className="flex justify-between"><div className={dotCls} /><div className={dotCls} /></div>
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full p-1.5 relative flex flex-col justify-between">
            <div className="flex justify-between"><div className={dotCls} /><div className={dotCls} /></div>
            <div className="absolute inset-0 flex items-center justify-center"><div className={dotCls} /></div>
            <div className="flex justify-between"><div className={dotCls} /><div className={dotCls} /></div>
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full p-1.5 flex flex-col justify-between">
            <div className="flex justify-between"><div className={dotCls} /><div className={dotCls} /></div>
            <div className="flex justify-between"><div className={dotCls} /><div className={dotCls} /></div>
            <div className="flex justify-between"><div className={dotCls} /><div className={dotCls} /></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center p-0.5">
      {renderPips()}
    </div>
  );
};

export const DominoTile: React.FC<DominoTileProps> = ({
  tile,
  skin = 'classic_ivory',
  orientation = 'vertical',
  isFaceDown = false,
  isPlayable = false,
  isSelected = false,
  size = 'md',
  onClick,
  className = '',
  disabled = false,
}) => {
  // Dimensions
  const sizeStyles = {
    sm: orientation === 'vertical' ? 'w-8 h-16' : 'w-16 h-8',
    md: orientation === 'vertical' ? 'w-11 h-22' : 'w-22 h-11',
    lg: orientation === 'vertical' ? 'w-14 h-28' : 'w-28 h-14',
  };

  // Skin background & borders with 3D tactile shader classes
  const skinStyles = {
    classic_ivory: 'tile-ivory-material text-stone-900',
    midnight_black: 'tile-black-material text-amber-100',
    pure_marble: 'tile-marble-material text-slate-900',
  };

  // Back face style (when face-down in boneyard or opponent hand)
  const faceDownStyle = skin === 'midnight_black'
    ? 'bg-gradient-to-br from-[#2a2d36] via-[#17181e] to-[#0a0b0e] border-[#4a4e5d] shadow-[0_4px_12px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]'
    : 'bg-gradient-to-br from-[#4a2211] via-[#331508] to-[#1d0a03] border-[#6b351d] shadow-[0_4px_12px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)]';

  if (isFaceDown || !tile) {
    return (
      <div
        id={tile ? `tile-facedown-${tile.id}` : 'tile-facedown'}
        onClick={!disabled ? onClick : undefined}
        className={`
          ${sizeStyles[size]} ${faceDownStyle}
          relative rounded-lg border-2 flex items-center justify-center
          transition-all duration-200 cursor-pointer overflow-hidden
          ${!disabled ? 'hover:scale-105 active:scale-95' : 'cursor-default opacity-85'}
          ${className}
        `}
      >
        <div className="absolute inset-1 rounded border border-amber-400/25 flex items-center justify-center bg-black/20">
          {/* Subtle ornate back medallion */}
          <div className="w-4 h-4 rounded-full border border-amber-400/40 flex items-center justify-center shadow-inner">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400/60" />
          </div>
        </div>
      </div>
    );
  }

  const isVert = orientation === 'vertical';

  return (
    <div
      id={`domino-${tile.id}`}
      onClick={!disabled ? onClick : undefined}
      className={`
        ${sizeStyles[size]} ${skinStyles[skin]}
        relative rounded-lg border flex select-none
        transition-all duration-200 cursor-pointer overflow-hidden
        ${isVert ? 'flex-col' : 'flex-row'}
        ${isSelected ? 'ring-4 ring-amber-400 -translate-y-2 shadow-[0_12px_25px_rgba(245,158,11,0.5)] scale-105 z-20' : ''}
        ${isPlayable && !isSelected ? 'playable-pulse hover:-translate-y-1.5 hover:scale-105 z-10 cursor-pointer ring-2 ring-emerald-400' : ''}
        ${!isPlayable && !isSelected && !disabled ? 'opacity-95 hover:opacity-100 hover:-translate-y-0.5' : ''}
        ${disabled ? 'cursor-default' : ''}
        ${className}
      `}
    >
      {/* Subtle top specular glossy reflection across the tile face */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-white/[0.12] pointer-events-none rounded-lg" />

      {/* Top / Left Half */}
      <div className={`relative ${isVert ? 'w-full h-1/2' : 'h-full w-1/2'}`}>
        <PipGrid value={tile.left} skin={skin} size={size} />
      </div>

      {/* Center Divider Groove & Brass Spinner */}
      <div
        className={`
          relative flex items-center justify-center shrink-0 z-10
          ${isVert 
            ? `w-full h-[2px] ${skin === 'midnight_black' ? 'tile-groove-line-dark' : 'tile-groove-line'} my-[-1px]` 
            : `h-full w-[2px] ${skin === 'midnight_black' ? 'tile-groove-line-dark' : 'tile-groove-line'} mx-[-1px]`
          }
        `}
      >
        {/* Realistic Brass Spinner Rivet */}
        <div
          className={`
            absolute rounded-full tile-spinner-rivet z-10 flex items-center justify-center
            ${size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}
          `}
        >
          <div className="w-0.5 h-0.5 rounded-full bg-white/90 shadow-sm" />
        </div>
      </div>

      {/* Bottom / Right Half */}
      <div className={`relative ${isVert ? 'w-full h-1/2' : 'h-full w-1/2'}`}>
        <PipGrid value={tile.right} skin={skin} size={size} />
      </div>
    </div>
  );
};
