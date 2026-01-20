import React from 'react';

const SmallTestScaleVisualization = ({ scaleConfig, resultValue, unit = '' }) => {
  if (!scaleConfig || !scaleConfig.thresholds || !scaleConfig.labels) {
    return null;
  }

  const { thresholds, labels } = scaleConfig;

  if (labels.length !== thresholds.length + 1) {
    console.error('Invalid scaleConfig: labels.length must be thresholds.length + 1');
    return null;
  }

  const numericResult = parseFloat(resultValue);
  if (isNaN(numericResult)) {
    return null;
  }

  const sortedThresholds = [...thresholds].sort((a, b) => a - b);

  // Create segments
  const segments = [];
  segments.push({
    label: `< ${sortedThresholds[0]}`,
    displayLabel: labels[0],
    min: null,
    max: sortedThresholds[0]
  });

  for (let i = 0; i < sortedThresholds.length - 1; i++) {
    segments.push({
      label: `${sortedThresholds[i]} - ${sortedThresholds[i + 1]}`,
      displayLabel: labels[i + 1],
      min: sortedThresholds[i],
      max: sortedThresholds[i + 1]
    });
  }

  segments.push({
    label: `> ${sortedThresholds[sortedThresholds.length - 1]}`,
    displayLabel: labels[labels.length - 1],
    min: sortedThresholds[sortedThresholds.length - 1],
    max: null
  });

  // Color mapping
  const getColorMapping = (segmentCount) => {
    if (segmentCount === 2) return ['#3B82F6', '#22C55E'];
    if (segmentCount === 3) return ['#3B82F6', '#22C55E', '#F97316'];
    if (segmentCount === 4) return ['#EF4444', '#22C55E', '#F59E0B', '#EF4444'];
    if (segmentCount === 5) return ['#EF4444', '#22C55E', '#F59E0B', '#FB923C', '#EF4444'];
    if (segmentCount === 6) return ['#EF4444', '#22C55E', '#F59E0B', '#FB923C', '#DC2626', '#EF4444'];

    const colors = [];
    colors.push('#EF4444');
    for (let i = 1; i < segmentCount - 1; i++) {
      const baseColors = ['#22C55E', '#F59E0B', '#FB923C'];
      colors.push(baseColors[(i - 1) % baseColors.length]);
    }
    colors.push('#EF4444');
    return colors;
  };

  const colors = getColorMapping(segments.length);

  // Determine segment index
  const getResultSegmentIndex = () => {
    if (numericResult < sortedThresholds[0]) return 0;

    for (let i = 0; i < sortedThresholds.length - 1; i++) {
      if (numericResult >= sortedThresholds[i] && numericResult <= sortedThresholds[i + 1]) {
        return i + 1;
      }
    }

    return segments.length - 1;
  };

  const segmentIndex = getResultSegmentIndex();
  const resultColor = colors[segmentIndex];

  // ✅ Determine arrow direction
  const getArrowIcon = () => {
    const minThreshold = sortedThresholds[0];
    const maxThreshold = sortedThresholds[sortedThresholds.length - 1];

    // Down arrow if below minimum
    if (numericResult < minThreshold) {
      return '▼';
    }
    // Up arrow if above maximum
    if (numericResult > maxThreshold) {
      return '▲';
    }
    // No arrow if in normal range
    return '';
  };

  const arrowIcon = getArrowIcon();

  return (
    <div style={{ width: '100%' }}>
      {/* Result Value on Top with Arrow */}
      <div className="flex justify-end mb-0.5 items-baseline gap-1">
        {arrowIcon && (
          <span className="text-[19px] font-bold" style={{ color: resultColor }}>
            {arrowIcon}
          </span>
        )}
        <span className="text-[19px] font-bold" style={{ color: resultColor }}>
          {numericResult}
        </span>
        <span className="text-[11px] font-semibold text-gray-600">
          {unit}
        </span>
      </div>

      {/* Threshold values above bar */}
      <div className="relative mb-0.5" style={{ height: '10px' }}>
        {sortedThresholds.map((threshold, index) => {
          const segmentWidth = 100 / segments.length;
          const position = segmentWidth * (index + 1);

          return (
            <div
              key={index}
              className="text-[8px] text-gray-600 font-semibold"
              style={{
                position: 'absolute',
                left: `${position}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {threshold}
            </div>
          );
        })}
      </div>

      {/* Scale Bar - No border, No rounded corners, Taller */}
      <div className="relative">
        <div
          className="flex"
          style={{
            height: '22px', // Taller
            overflow: 'hidden'
          }}
        >
          {segments.map((segment, index) => (
            <div
              key={index}
              className="flex items-center justify-center text-[8px] font-bold text-white"
              style={{
                backgroundColor: colors[index],
                flex: 1,
              }}
            >
              {/* Labels INSIDE the bars */}
              {labels[index]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmallTestScaleVisualization;