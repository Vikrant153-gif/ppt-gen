/**
 * PresentMode — Fullscreen presentation slideshow view.
 * Supports keyboard navigation, auto-play slideshow, fullscreen toggle,
 * and mouse-idle auto-hiding controls.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import SlideRenderer from './SlideRenderer';

export default function PresentMode({ project, initialSlideIndex = 0, onClose }) {
  const slides = project?.slides || [];
  const [currentIndex, setCurrentIndex] = useState(
    Math.max(0, Math.min(initialSlideIndex, slides.length - 1))
  );
  const [controlsVisible, setControlsVisible] = useState(true);
  const [isAutoPlaying, setIsAutoPlaying] = useState(false);
  const [autoPlayInterval, setAutoPlayInterval] = useState(6); // seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef(null);
  const hideTimeoutRef = useRef(null);
  const autoPlayTimerRef = useRef(null);

  const currentSlide = slides[currentIndex];

  // ─── Navigation ─────────────────────────────────────────────────────────────

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => {
      if (prev < slides.length - 1) return prev + 1;
      if (isAutoPlaying) return 0; // loop in autoplay
      return prev;
    });
  }, [slides.length, isAutoPlaying]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen request failed:', err);
    }
  };

  // ─── Mouse Idle Hide Controls ───────────────────────────────────────────────

  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    hideTimeoutRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 2800);
  };

  // ─── Auto-play Timer ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!isAutoPlaying) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      goToNext();
    }, autoPlayInterval * 1000);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, autoPlayInterval, goToNext]);

  // ─── Keyboard Navigation ───────────────────────────────────────────────────

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if modifier keys are pressed
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case ' ': // Space
        case 'PageDown':
          e.preventDefault();
          goToNext();
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
        case 'Backspace':
          e.preventDefault();
          goToPrev();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentIndex(slides.length - 1);
          break;
        case 'Escape':
        case 'q':
        case 'Q':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => {});
          }
          onClose();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'p':
        case 'P':
          e.preventDefault();
          setIsAutoPlaying((prev) => !prev);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, slides.length, onClose]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  if (!currentSlide) return null;

  const progressPercent = ((currentIndex + 1) / slides.length) * 100;

  return (
    <div
      ref={containerRef}
      className="present-mode-container"
      onMouseMove={handleMouseMove}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#050505',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: controlsVisible ? 'default' : 'none',
        userSelect: 'none',
      }}
    >
      {/* 16:9 Presentation Stage */}
      <div
        className="present-stage"
        style={{
          width: 'min(94vw, calc(90vh * (16 / 9)))',
          height: 'min(90vh, calc(94vw * (9 / 16)))',
          aspectRatio: '16 / 9',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.08)',
          position: 'relative',
          transition: 'transform 0.15s ease',
        }}
      >
        <SlideRenderer slide={currentSlide} />
      </div>

      {/* Floating Bottom Control Bar */}
      <div
        className="present-controls-bar"
        style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '8px 16px',
          background: 'rgba(18, 18, 18, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 9999,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.5)',
          opacity: controlsVisible ? 1 : 0,
          pointerEvents: controlsVisible ? 'auto' : 'none',
          transition: 'opacity 0.25s ease, transform 0.25s ease',
          zIndex: 10,
        }}
      >
        {/* Previous Button */}
        <button
          type="button"
          onClick={goToPrev}
          disabled={currentIndex === 0}
          title="Previous (Left Arrow / Backspace)"
          style={{
            background: 'none',
            border: 'none',
            color: currentIndex === 0 ? '#444' : '#fff',
            cursor: currentIndex === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            padding: '4px 8px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ◀
        </button>

        {/* Slide Counter Pill */}
        <span style={{
          color: '#e2e8f0',
          fontSize: '0.85rem',
          fontWeight: 600,
          padding: '2px 8px',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {currentIndex + 1} <span style={{ color: '#64748b' }}>/</span> {slides.length}
        </span>

        {/* Next Button */}
        <button
          type="button"
          onClick={goToNext}
          disabled={currentIndex === slides.length - 1}
          title="Next (Right Arrow / Space)"
          style={{
            background: 'none',
            border: 'none',
            color: currentIndex === slides.length - 1 ? '#444' : '#fff',
            cursor: currentIndex === slides.length - 1 ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            padding: '4px 8px',
            borderRadius: 6,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ▶
        </button>

        <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.15)', margin: '0 4px' }} />

        {/* Auto-play toggle */}
        <button
          type="button"
          onClick={() => setIsAutoPlaying((prev) => !prev)}
          title={isAutoPlaying ? "Pause slideshow (P)" : "Play slideshow (P)"}
          style={{
            background: isAutoPlaying ? 'rgba(99, 102, 241, 0.25)' : 'none',
            border: isAutoPlaying ? '1px solid #6366f1' : '1px solid transparent',
            color: isAutoPlaying ? '#a5b4fc' : '#cbd5e1',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            padding: '4px 10px',
            borderRadius: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{isAutoPlaying ? '⏸' : '▶'}</span>
          <span>{isAutoPlaying ? 'Auto' : 'Play'}</span>
        </button>

        {/* Fullscreen Button */}
        <button
          type="button"
          onClick={toggleFullscreen}
          title="Toggle Fullscreen (F)"
          style={{
            background: 'none',
            border: 'none',
            color: '#cbd5e1',
            cursor: 'pointer',
            fontSize: '0.95rem',
            padding: '4px 6px',
            borderRadius: 6,
          }}
        >
          ⛶
        </button>

        {/* Exit Button */}
        <button
          type="button"
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen().catch(() => {});
            }
            onClose();
          }}
          title="Exit Presentation (Esc)"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            cursor: 'pointer',
            fontSize: '0.78rem',
            fontWeight: 600,
            padding: '4px 12px',
            borderRadius: 9999,
            marginLeft: 4,
          }}
        >
          ✕ Exit
        </button>
      </div>

      {/* Subtle Progress Bar Along Bottom Edge */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100%',
        height: 3,
        background: 'rgba(255, 255, 255, 0.08)',
        zIndex: 5,
      }}>
        <div style={{
          width: `${progressPercent}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #6366f1, #a855f7)',
          transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );
}
