'use client';

import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

// Nightingale imports would be used when the actual library is installed:
// import { SequenceViewer, Track, SequenceRenderer } from 'protvista-nightingale';
// For now, we're using a custom implementation

// Interfaces for component props
interface Highlight {
  start: number;
  end: number;
  color?: string;
  className?: string;
  metadata?: Record<string, any>;
}

interface Feature {
  type: string;
  start: number;
  end: number;
  color?: string;
  description?: string;
  metadata?: Record<string, any>;
}

interface SequenceViewerProps {
  sequence: string;
  rangeStart: number;
  displayWidth?: number;
  displayHeight?: number;
  highlights?: Highlight[];
  features?: Feature[];
  highlightedPosition?: number | null;
  onPositionSelect?: (position: number) => void;
  showNumbering?: boolean;
  showAxis?: boolean;
  colorMapping?: Record<string, string>;
  displayFormat?: 'wrap' | 'continuous';
  residuesPerLine?: number;
  renderingMode?: 'default' | 'condensed' | 'expanded';
}

/**
 * SequenceViewer component using a custom implementation for sequence visualization
 *
 * This component creates a sequence visualization that can be synchronized
 * with a 3D structure viewer. It supports highlighting regions, marking
 * features, and selecting individual residues.
 */
const NightingaleSequenceViewer = forwardRef<any, SequenceViewerProps>(({
  sequence,
  rangeStart,
  displayWidth = '100%',
  displayHeight = 'auto',
  highlights = [],
  features = [],
  highlightedPosition = null,
  onPositionSelect,
  showNumbering = true,
  showAxis = true,
  colorMapping = {},
  displayFormat = 'wrap',
  residuesPerLine = 50,
  renderingMode = 'default'
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<any>(null);

  // Expose methods to parent through ref
  useImperativeHandle(ref, () => ({
    // Highlight a specific position in the sequence
    highlightPosition: (position: number) => {
      if (highlightedPosition !== position) {
        if (onPositionSelect) onPositionSelect(position);
      }

      // Auto-scroll to the position to ensure it's visible
      scrollToPosition(position);
    },

    // Get the current highlight
    getHighlightedPosition: () => highlightedPosition,

    // Clear any selection
    clearSelection: () => {
      if (onPositionSelect) onPositionSelect(null);
    },

    // Get the sequence viewer instance (would be nightingale instance in real implementation)
    getViewer: () => viewerRef.current
  }));

  // Initialize the sequence viewer
  useEffect(() => {
    if (!containerRef.current || !sequence) return;

    // Clear previous content
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }

    // Set up the container
    const container = document.createElement('div');
    container.className = 'sequence-display';
    container.style.fontFamily = 'monospace';
    container.style.fontSize = renderingMode === 'condensed' ? '12px' : '14px';
    container.style.lineHeight = renderingMode === 'condensed' ? '1.2' : '1.5';
    container.style.whiteSpace = 'pre-wrap';
    container.style.padding = '0.5rem';
    container.style.position = 'relative';

    // Initialize the sequence display
    initializeSequenceDisplay(container);

    containerRef.current.appendChild(container);

    // Save a reference to our viewer
    viewerRef.current = { container };

  }, [sequence, rangeStart, renderingMode, residuesPerLine, displayFormat]);

  // Update highlights when they change
  useEffect(() => {
    if (!viewerRef.current || !sequence) return;

    // Update the display with new highlights
    updateHighlights();

  }, [highlights, highlightedPosition, sequence]);

  // Build the sequence display
  const initializeSequenceDisplay = (container: HTMLDivElement) => {
    if (!sequence) return;

    // Clear container
    container.innerHTML = '';

    // Create the necessary elements
    const charsPerLine = displayFormat === 'wrap' ? residuesPerLine : sequence.length;
    const lines = Math.ceil(sequence.length / charsPerLine);

    // Add axis if enabled
    if (showAxis) {
      const axis = document.createElement('div');
      axis.className = 'sequence-axis';
      axis.style.height = '20px';
      axis.style.position = 'relative';
      axis.style.marginBottom = '5px';
      axis.style.borderBottom = '1px solid #ddd';

      // Add ticks to the axis
      const ticksCount = Math.min(10, sequence.length);
      const tickInterval = Math.floor(sequence.length / ticksCount);

      for (let i = 0; i <= ticksCount; i++) {
        const pos = i * tickInterval;
        if (pos > sequence.length) continue;

        const tick = document.createElement('div');
        tick.style.position = 'absolute';
        tick.style.bottom = '0';
        tick.style.left = `${(pos / sequence.length) * 100}%`;
        tick.style.width = '1px';
        tick.style.height = '5px';
        tick.style.backgroundColor = '#888';

        const label = document.createElement('div');
        label.style.position = 'absolute';
        label.style.bottom = '6px';
        label.style.left = `${(pos / sequence.length) * 100}%`;
        label.style.transform = 'translateX(-50%)';
        label.style.fontSize = '10px';
        label.style.color = '#666';
        label.textContent = String(rangeStart + pos);

        axis.appendChild(tick);
        axis.appendChild(label);
      }

      container.appendChild(axis);
    }

    // Create the sequence element
    const sequenceElement = document.createElement('div');
    sequenceElement.className = 'sequence-content';

    for (let line = 0; line < lines; line++) {
      const lineStart = line * charsPerLine;
      const lineEnd = Math.min(lineStart + charsPerLine, sequence.length);
      const lineChars = sequence.slice(lineStart, lineEnd);

      const lineDiv = document.createElement('div');
      lineDiv.className = 'sequence-line';
      lineDiv.style.display = 'flex';
      lineDiv.style.marginBottom = '0.25rem';

      // Position number at start of line
      if (showNumbering) {
        const positionDiv = document.createElement('div');
        positionDiv.className = 'position-number';
        positionDiv.style.width = '3rem';
        positionDiv.style.textAlign = 'right';
        positionDiv.style.paddingRight = '0.5rem';
        positionDiv.style.color = '#666';
        positionDiv.textContent = String(rangeStart + lineStart);
        lineDiv.appendChild(positionDiv);
      }

      // Sequence characters
      const seqDiv = document.createElement('div');
      seqDiv.className = 'sequence-characters';
      seqDiv.style.flex = '1';

      // Add individual character spans
      for (let i = 0; i < lineChars.length; i++) {
        const position = lineStart + i;
        const char = lineChars[i];
        const span = document.createElement('span');
        span.textContent = char;
        span.dataset.position = String(rangeStart + position);
        span.className = 'sequence-residue';
        span.style.padding = '0 1px';

        // Add base color for residue
        if (colorMapping[char]) {
          span.style.color = colorMapping[char];
        }

        // Add click handler
        span.addEventListener('click', () => {
          if (onPositionSelect) {
            onPositionSelect(rangeStart + position);
          }
        });

        // Add hover effect
        span.addEventListener('mouseover', () => {
          span.style.backgroundColor = 'rgba(0,0,0,0.1)';
          span.style.cursor = 'pointer';
        });

        span.addEventListener('mouseout', () => {
          span.style.backgroundColor = '';
        });

        seqDiv.appendChild(span);
      }

      lineDiv.appendChild(seqDiv);

      // Position number at end of line
      if (showNumbering) {
        const endPositionDiv = document.createElement('div');
        endPositionDiv.className = 'position-number';
        endPositionDiv.style.width = '3rem';
        endPositionDiv.style.textAlign = 'left';
        endPositionDiv.style.paddingLeft = '0.5rem';
        endPositionDiv.style.color = '#666';
        endPositionDiv.textContent = String(rangeStart + lineEnd - 1);
        lineDiv.appendChild(endPositionDiv);
      }

      sequenceElement.appendChild(lineDiv);
    }

    container.appendChild(sequenceElement);

    // Apply initial highlights
    updateHighlights();
  };

  // Update highlights in the sequence
  const updateHighlights = () => {
    if (!viewerRef.current || !containerRef.current) return;

    // Reset any previous highlights
    const residues = containerRef.current.querySelectorAll('.sequence-residue');
    residues.forEach(span => {
      const element = span as HTMLElement;
      element.style.backgroundColor = '';
      element.style.color = colorMapping[element.textContent || ''] || '';
      element.style.fontWeight = 'normal';
    });

    // Apply highlights
    highlights.forEach(highlight => {
      for (let pos = highlight.start; pos <= highlight.end; pos++) {
        const span = containerRef.current!.querySelector(`.sequence-residue[data-position="${pos}"]`) as HTMLElement;
        if (span) {
          span.style.backgroundColor = highlight.color || '#4285F4';
          span.style.color = 'white';

          // Add custom class if provided
          if (highlight.className) {
            span.classList.add(highlight.className);
          }
        }
      }
    });

    // Apply selected position highlight (this takes precedence)
    if (highlightedPosition !== null) {
      const selectedSpan = containerRef.current!.querySelector(`.sequence-residue[data-position="${highlightedPosition}"]`) as HTMLElement;
      if (selectedSpan) {
        selectedSpan.style.backgroundColor = '#FFC107';
        selectedSpan.style.color = 'black';
        selectedSpan.style.fontWeight = 'bold';
      }
    }
  };

  // Scroll to show a specific position
  const scrollToPosition = (position: number) => {
    if (!containerRef.current) return;

    const selectedSpan = containerRef.current.querySelector(`.sequence-residue[data-position="${position}"]`);
    if (selectedSpan) {
      selectedSpan.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  return (
    <div
      ref={containerRef}
      className="nightingale-sequence-viewer"
      style={{
        width: typeof displayWidth === 'number' ? `${displayWidth}px` : displayWidth,
        height: typeof displayHeight === 'number' ? `${displayHeight}px` : displayHeight,
        overflowX: 'auto',
        overflowY: 'auto',
        backgroundColor: '#f8f9fa',
        border: '1px solid #eaecef',
        borderRadius: '4px'
      }}
    >
      {!sequence && (
        <div className="flex items-center justify-center h-40 text-gray-500">
          No sequence data available
        </div>
      )}
    </div>
  );
});

NightingaleSequenceViewer.displayName = 'NightingaleSequenceViewer';

export default NightingaleSequenceViewer;
