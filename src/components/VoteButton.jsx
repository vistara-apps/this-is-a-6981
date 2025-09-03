import React from 'react';
import { ThumbsUp, ThumbsDown, Loader2 } from 'lucide-react';

const VoteButton = ({ variant, onClick, disabled = false, loading = false, count = null }) => {
  const isYes = variant === 'yes';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
        isYes
          ? 'bg-green-400/20 text-green-400 border border-green-400/30 hover:bg-green-400/30 hover:scale-105'
          : 'bg-red-400/20 text-red-400 border border-red-400/30 hover:bg-red-400/30 hover:scale-105'
      } ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        isYes ? <ThumbsUp className="w-4 h-4" /> : <ThumbsDown className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">{isYes ? 'Yes' : 'No'}</span>
      {count !== null && (
        <span className="ml-1 text-xs bg-surface/50 px-2 py-0.5 rounded-full">
          {count.toLocaleString()}
        </span>
      )}
    </button>
  );
};

export default VoteButton;
