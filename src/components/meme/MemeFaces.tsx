import React, { useState } from 'react';

interface MemeFace {
  id: number;
  isUnlocked: boolean;
}

interface MemeFacesProps {
  memeFaces: MemeFace[];
  onFaceClick: (faceNumber: number, isUnlocked: boolean) => void;
}

export const MemeFaces = ({ memeFaces, onFaceClick }: MemeFacesProps) => {
  return (
    <div className="grid grid-cols-6 gap-4 w-full mt-4">
      {memeFaces.map((face) => (
        <button
          key={face.id}
          onClick={() => onFaceClick(face.id, face.isUnlocked)}
          className={`relative aspect-square rounded-lg overflow-hidden ${
            face.isUnlocked ? 'cursor-pointer hover:scale-105 transition-transform' : 'cursor-not-allowed opacity-50'
          }`}
          disabled={!face.isUnlocked}
          aria-label={`Meme face ${face.id}`}
        >
          <img
            src={`https://i.postimg.cc/L40J9m7x/Meme-${face.id}-Revealed.png`}
            alt={`Meme face ${face.id}`}
            className="w-full h-full object-cover"
          />
        </button>
      ))}
    </div>
  );
}; 