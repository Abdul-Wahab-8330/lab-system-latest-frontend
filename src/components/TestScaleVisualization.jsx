import React from 'react';

const TestScaleVisualization = ({ scaleConfig, resultValue, unit = '' }) => {
  // ✅ Validation - NEW FORMAT
  if (!scaleConfig || !scaleConfig.thresholds || !scaleConfig.labels) {
    return null;
  }

  const { thresholds, labels } = scaleConfig;

  // Validate: labels.length should be thresholds.length + 1
  if (labels.length !== thresholds.length + 1) {
    console.error('Invalid scaleConfig: labels.length must be thresholds.length + 1');
    return null;
  }

  const numericResult = parseFloat(resultValue);
  if (isNaN(numericResult)) {
    return null;
  }

  // Sort thresholds (just in case)
  const sortedThresholds = [...thresholds].sort((a, b) => a - b);

  // ✅ Create segments from thresholds
  const segments = [];

  // First segment: < first threshold
  segments.push({
    label: `< ${sortedThresholds[0]}`,
    displayLabel: labels[0],
    min: null,
    max: sortedThresholds[0]
  });

  // Middle segments: between thresholds
  for (let i = 0; i < sortedThresholds.length - 1; i++) {
    segments.push({
      label: `${sortedThresholds[i]} - ${sortedThresholds[i + 1]}`,
      displayLabel: labels[i + 1],
      min: sortedThresholds[i],
      max: sortedThresholds[i + 1]
    });
  }

  // Last segment: >= last threshold
  segments.push({
    label: `> ${sortedThresholds[sortedThresholds.length - 1]}`,
    displayLabel: labels[labels.length - 1],
    min: sortedThresholds[sortedThresholds.length - 1],
    max: null
  });

  // ✅ Color mapping
  const getColorMapping = (segmentCount) => {
    if (segmentCount === 2) return ['#22C55E', '#EF4444'];
    if (segmentCount === 3) return ['#EF4444', '#22C55E', '#EF4444'];
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

  // ✅ Calculate pointer position
  const calculatePointerPosition = () => {
    const minValue = sortedThresholds[0];
    const maxValue = sortedThresholds[sortedThresholds.length - 1];
    const segmentWidth = 100 / segments.length;

    // Handle out of range - clamp to segment centers
    if (numericResult < minValue) {
      return segmentWidth / 2; // Middle of first segment
    }
    // Handle exact match with last threshold - point AT the boundary
    if (numericResult === maxValue) {
      return segmentWidth * (sortedThresholds.length); // Exactly at last boundary
    }
    if (numericResult > maxValue) {
      return 100 - (segmentWidth / 2); // Middle of last segment
    }

    // Find which threshold segment we're in
    for (let i = 0; i < sortedThresholds.length - 1; i++) {
      if (numericResult >= sortedThresholds[i] && numericResult <= sortedThresholds[i + 1]) {
        const segmentIndex = i + 1; // +1 because first segment is "< min"
        const segmentMin = sortedThresholds[i];
        const segmentMax = sortedThresholds[i + 1];
        const segmentRange = segmentMax - segmentMin;
        const positionInSegment = (numericResult - segmentMin) / segmentRange;

        const position = (segmentIndex * segmentWidth) + (positionInSegment * segmentWidth);
        return position;
      }
    }

    return 50;
  };

  // ✅ Determine segment index
  const getResultSegmentIndex = () => {
    if (numericResult < sortedThresholds[0]) return 0;

    for (let i = 0; i < sortedThresholds.length - 1; i++) {
      if (numericResult >= sortedThresholds[i] && numericResult <= sortedThresholds[i + 1]) {
        return i + 1;
      }
    }

    return segments.length - 1;
  };

  const pointerPosition = calculatePointerPosition();
  const segmentIndex = getResultSegmentIndex();
  const pointerColor = colors[segmentIndex];

  return (
    <div className="my-6" style={{ width: '83%' }}>
      {/* Labels on top - using segment labels */}
      <div className="flex mb-1 text-xs font-semibold text-gray-700">
        {labels.map((label, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              textAlign: 'center'
            }}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="relative" style={{ paddingBottom: '40px' }}>
        {/* Scale Bar */}
        <div className="relative mb-10">
          <div
            className="flex h-9 border-2 border-gray-800 relative"
            style={{
              borderRadius: '20px',
              overflow: 'visible'
            }}
          >
            {segments.map((segment, index) => {
              let borderRadius = '0px';
              if (index === 0) {
                borderRadius = '18px 0 0 18px';
              } else if (index === segments.length - 1) {
                borderRadius = '0 18px 18px 0';;
              }

              return (
                <div
                  key={index}
                  style={{
                    backgroundColor: colors[index],
                    flex: 1,
                    borderRadius: borderRadius,
                    position: 'relative',
                    zIndex: 1
                  }}
                  className="flex items-center justify-center text-[9px] font-bold text-white"
                >
                  {index === 0 && <span style={{ marginLeft: '4px', fontSize: '12px', fontWeight: 'bold' }}>{segment.label}</span>}
                  {index === segments.length - 1 && <span style={{ marginRight: '4px', fontSize: '12px', fontWeight: 'bold' }}>{segment.label}</span>}
                </div>
              );
            })}
          </div>

          {/* Threshold values below bar */}
          <div className="relative mt-1 text-xs text-gray-600" style={{ height: '16px' }}>
            {sortedThresholds.map((threshold, index) => {
              const segmentWidth = 100 / segments.length;
              const position = segmentWidth * (index + 1);

              return (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    left: `${position}%`,
                    transform: 'translateX(-50%)',
                    fontWeight: '700'
                  }}
                >
                  {threshold}
                </div>
              );
            })}
          </div>

          {/* Pointer */}
          <div
            className="absolute"
            style={{
              left: `${pointerPosition}%`,
              top: '100%',
              transform: 'translateX(-50%)',
              marginTop: '18px',
              zIndex: 10
            }}
          >
            {/* Triangle */}
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: `12px solid ${pointerColor}`,
                margin: '0 auto',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />

           {/* Result value - no box */}
<div
  className="mt-1 font-bold whitespace-nowrap"
  style={{
    transform: 'translateX(-50%)',
    marginLeft: '50%',
    textAlign: 'center',
    color: pointerColor,
    fontSize: '24px',
    textShadow: '0 1px 3px rgba(0,0,0,0.2)'
  }}
>
  {numericResult} <span style={{ fontSize: '14px', fontWeight: '600' }}>{unit}</span>
</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestScaleVisualization;