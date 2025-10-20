export interface MapControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onToggleFullscreen: () => void;
  currentZoom: number;
  isFullscreen: boolean;
}

export default function MapControls({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onToggleFullscreen,
  currentZoom,
  isFullscreen,
}: MapControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 bg-nuaibria-bg/50 rounded-lg p-1">
        <button
          onClick={onZoomOut}
          className="px-3 py-1 bg-nuaibria-elevated hover:bg-nuaibria-gold/20 text-nuaibria-text-primary rounded transition-colors"
          title="Zoom Out"
        >
          −
        </button>
        <span className="px-3 py-1 text-nuaibria-text-accent text-sm font-mono min-w-[60px] text-center">
          {Math.round(currentZoom * 100)}%
        </span>
        <button
          onClick={onZoomIn}
          className="px-3 py-1 bg-nuaibria-elevated hover:bg-nuaibria-gold/20 text-nuaibria-text-primary rounded transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={onResetZoom}
          className="px-3 py-1 bg-nuaibria-elevated hover:bg-nuaibria-gold/20 text-nuaibria-text-primary rounded transition-colors text-sm"
          title="Reset Zoom (1:1)"
        >
          1:1
        </button>
      </div>
      <button
        onClick={onToggleFullscreen}
        className="px-4 py-1 bg-nuaibria-elevated hover:bg-nuaibria-gold/20 text-nuaibria-text-primary rounded-lg transition-colors text-sm"
        title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
      >
        {isFullscreen ? '⊡ Exit' : '⊞ Fullscreen'}
      </button>
    </div>
  );
}
