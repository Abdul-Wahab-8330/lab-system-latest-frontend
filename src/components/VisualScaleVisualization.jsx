import React from 'react';

const VisualScaleVisualization = ({ visualScale, resultValue, unit }) => {
  if (!visualScale || !visualScale.thresholds || !visualScale.labels || !resultValue) {
    return null;
  }

  const { thresholds, labels, colors, rangeTexts } = visualScale;

  // Parse result value to number
  const numericResult = parseFloat(resultValue);
  if (isNaN(numericResult)) return null;

  // ✅ Calculate smarter gap based on threshold range
  const minThreshold = Math.min(...thresholds);
  const maxThreshold = Math.max(...thresholds);
  const thresholdRange = maxThreshold - minThreshold;

  let gap;
  if (thresholdRange <= 10) gap = 1;
  else if (thresholdRange <= 20) gap = 2;
  else if (thresholdRange <= 40) gap = 5;
  else if (thresholdRange <= 100) gap = 10;
  else if (thresholdRange <= 200) gap = 20;
  else if (thresholdRange <= 500) gap = 50;
  else gap = 100;

  // ✅ Generate 6 scale values (result near middle)
  const numValues = 6;
  const middleIndex = 2.5;

  const scaleValues = [];
  for (let i = 0; i < numValues; i++) {
    const value = numericResult + (i - middleIndex) * gap;
    scaleValues.push(Math.round(value));
  }

  // Sort descending for display (top to bottom)
  scaleValues.sort((a, b) => b - a);

  const minScale = scaleValues[scaleValues.length - 1];
  const maxScale = scaleValues[0];

  // ✅ Determine which label/color the result falls into
  let resultLabel = labels[0];
  let resultColor = colors[0];

  const sortedThresholds = [...thresholds].sort((a, b) => a - b);
  for (let i = 0; i < sortedThresholds.length; i++) {
    if (numericResult >= sortedThresholds[i]) {
      resultLabel = labels[i + 1] || labels[i];
      resultColor = colors[i + 1] || colors[i];
    }
  }

  // ✅ Helper function: Get color for a specific value
  const getColorForValue = (value) => {
    for (let i = sortedThresholds.length - 1; i >= 0; i--) {
      if (value >= sortedThresholds[i]) {
        return colors[i + 1] || colors[i];
      }
    }
    return colors[0];
  };

  // ✅ COMPLETE REWRITE: Calculate exact pixel position
  const rowHeight = 20; // Each row is 20px
  const totalRows = 12; // Always 12 rows (6 values + 6 empty)
  const totalHeight = totalRows * rowHeight; // 240px total

  // Build the visual structure with EXACT pixel positions
  const visualRows = [];

  // Row 0: Empty (0-20px)
  visualRows.push({
    type: 'empty',
    topPx: 0,
    value: null
  });

  // Rows 1-11: Alternating value and empty
  for (let i = 0; i < scaleValues.length; i++) {
    const rowIndex = (i * 2) + 1; // 1, 3, 5, 7, 9, 11
    visualRows.push({
      type: 'value',
      topPx: rowIndex * rowHeight,
      value: scaleValues[i]
    });

    // Add empty row after (except after last value)
    if (i < scaleValues.length - 1) {
      visualRows.push({
        type: 'empty',
        topPx: (rowIndex + 1) * rowHeight,
        value: null
      });
    }
  }

  // ✅ Calculate EXACT marker position in PIXELS
  const calculateMarkerPositionPx = () => {
    // Get only value rows
    const valueRows = visualRows.filter(r => r.type === 'value');

    // Find which two rows the result falls between
    for (let i = 0; i < valueRows.length - 1; i++) {
      const upperRow = valueRows[i];
      const lowerRow = valueRows[i + 1];

      const upperValue = upperRow.value;
      const lowerValue = lowerRow.value;

      // Check if result is between these two values (descending scale)
      if (numericResult <= upperValue && numericResult >= lowerValue) {
        // Calculate exact position using linear interpolation
        const valueRange = upperValue - lowerValue;
        const resultOffset = upperValue - numericResult;
        const ratio = resultOffset / valueRange;

        // Get pixel positions (CENTER of each row where the line is drawn)
        const upperPx = upperRow.topPx + (rowHeight / 2); // ✅ Center of upper row
        const lowerPx = lowerRow.topPx + (rowHeight / 2); // ✅ Center of lower row

        // Calculate exact pixel position
        const exactPx = upperPx + (ratio * (lowerPx - upperPx));

        return exactPx;
      }
    }

    // Edge cases
    if (numericResult >= valueRows[0].value) {
      return valueRows[0].topPx + (rowHeight / 2); // Above highest
    }
    if (numericResult <= valueRows[valueRows.length - 1].value) {
      return valueRows[valueRows.length - 1].topPx + (rowHeight / 2); // Below lowest
    }

    return totalHeight / 2; // Fallback to middle
  };

  const markerPositionPx = calculateMarkerPositionPx();

  return (
    <div className="mt-4 mb-6 flex items-start gap-6" style={{ width: '83%' }}>
      {/* Left side: Scale with bars */}
      <div className="flex-1">
        <div className="relative bg-white" style={{ height: `${totalHeight}px` }}>
          {/* Render all rows with gridlines */}
          {visualRows.map((row, idx) => (
            <div
              key={idx}
              className="absolute w-full flex items-center"
              style={{
                top: `${row.topPx}px`,
                height: `${rowHeight}px`
              }}
            >
              {row.type === 'value' ? (
                <>
                  {/* Value label on left */}
                  <span className="text-xs font-medium w-12 text-right pr-2">
                    {row.value}
                  </span>

                  {/* Horizontal colored line */}
                  <div
                    className="flex-1 relative"
                    style={{
                      height: '4px',
                      backgroundColor: getColorForValue(row.value),
                      opacity: 0.9
                    }}
                  />
                </>
              ) : (
                // Empty row - thin black line
                <>
                  <span className="w-12" />
                  <div className="flex-1" style={{ height: '1px', backgroundColor: '#000', opacity: 0.2 }} />
                </>
              )}
            </div>
          ))}

          {/* ✅ Result marker with EXACT pixel positioning */}
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: '48px',
              right: '0',
              top: `${markerPositionPx}px`,
              transform: 'translateY(-50%)', // ✅ Center the marker vertically
              zIndex: 20,
              pointerEvents: 'none'
            }}
          >
            {/* Marker rectangle */}
            <div
              className="px-3 py-1.5 font-bold text-white text-sm shadow-xl border-2 border-white"
              style={{
                backgroundColor: resultColor,
                minWidth: '50px',
                textAlign: 'center',
                borderRadius: '4px'
              }}
            >
              {numericResult}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3 text-xs">
          {labels.map((label, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: colors[idx] }}
              />
              <span className="font-medium">{label}</span>
              {rangeTexts && rangeTexts[idx] && (
                <span className="text-gray-500">({rangeTexts[idx]})</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Big result display */}
      <div className="flex flex-col items-center justify-center min-w-[120px]" style={{ height: `${totalHeight}px` }}>
        <div className="text-5xl font-bold text-center" style={{ color: resultColor }}>
          {resultValue}
        </div>
        <div className="text-sm font-medium text-gray-600 mt-1 text-center">
          {unit}
        </div>
        <div className="text-base font-semibold mt-2 text-center" style={{ color: resultColor }}>
          {resultLabel}
        </div>
      </div>
    </div>
  );
};

export default VisualScaleVisualization;