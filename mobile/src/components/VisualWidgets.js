import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

/**
 * Overhead steel-navy radial ambient light wash for flagship obsidian look
 */
export function AmbientAurora({ height = 340, intensity = 1 }) {
  return (
    <View style={[styles.auroraWrap, { height }]} pointerEvents="none">
      <View
        style={[
          styles.auroraOrbOuter,
          { opacity: 0.42 * intensity },
        ]}
      />
      <View
        style={[
          styles.auroraOrbMid,
          { opacity: 0.32 * intensity },
        ]}
      />
      <View
        style={[
          styles.auroraOrbInner,
          { opacity: 0.18 * intensity },
        ]}
      />
    </View>
  );
}

/**
 * Symmetrical silver/platinum laurel wreath flanking the Hero Score
 */
export function LaurelScore({ score = 86, label = 'Your Fuel Score' }) {
  const renderWing = (side) => {
    const isLeft = side === 'left';
    const leaves = [
      { top: 4, offset: 6, angle: isLeft ? '-22deg' : '22deg', size: 13 },
      { top: 15, offset: 2, angle: isLeft ? '-34deg' : '34deg', size: 15 },
      { top: 27, offset: 0, angle: isLeft ? '-44deg' : '44deg', size: 16 },
      { top: 40, offset: 3, angle: isLeft ? '-54deg' : '54deg', size: 15 },
      { top: 52, offset: 10, angle: isLeft ? '-66deg' : '66deg', size: 13 },
    ];

    return (
      <View style={styles.wingCol}>
        {leaves.map((l, idx) => (
          <View
            key={idx}
            style={[
              styles.leafSlot,
              {
                top: l.top,
                [isLeft ? 'left' : 'right']: l.offset,
                transform: [
                  { rotate: l.angle },
                  { scaleX: isLeft ? 1 : -1 },
                ],
              },
            ]}
          >
            <MaterialCommunityIcons
              name="leaf"
              size={l.size}
              color="rgba(226, 232, 240, 0.85)"
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.laurelWrap}>
      <View style={styles.laurelRow}>
        {renderWing('left')}
        <Text style={styles.heroScore}>{score}</Text>
        {renderWing('right')}
      </View>
      <Text style={styles.heroScoreLabel}>{label}</Text>
    </View>
  );
}

/**
 * Compact pill badge with circular directional indicator (e.g. "12% (up)")
 */
export function StatusPill({ text, positive = true }) {
  const fg = positive ? COLORS.successLight : COLORS.dangerLight;
  const bg = positive ? COLORS.successAlpha : COLORS.dangerAlpha;
  const circleBg = positive ? COLORS.success : COLORS.danger;

  return (
    <View style={[styles.statusPill, { backgroundColor: bg }]}>
      <Text style={[styles.statusPillText, { color: fg }]}>{text}</Text>
      <View style={[styles.statusCircle, { backgroundColor: circleBg }]}>
        <Ionicons
          name={positive ? 'arrow-up' : 'arrow-down'}
          size={8}
          color="#05070B"
          style={{
            transform: [{ rotate: positive ? '45deg' : '-45deg' }],
          }}
        />
      </View>
    </View>
  );
}

/**
 * Smooth continuous glowing curve rendered with interpolated RN views + highlight dot
 * variant: 'ascending' | 'descending'
 */
export function SmoothSparkCurve({
  variant = 'ascending',
  progress = 0.72,
  height = 56,
  lineColor = '#E2E8F0',
  dotColor = '#FFFFFF',
  glowColor = 'rgba(91, 181, 255, 0.45)',
}) {
  const [width, setWidth] = useState(120);
  const clamped = Math.max(0.15, Math.min(0.88, progress));

  const pointsCount = 26;
  const pts = [];
  for (let i = 0; i <= pointsCount; i++) {
    const t = i / pointsCount;
    const x = 4 + t * Math.max(40, width - 8);
    let y;
    if (variant === 'ascending') {
      // Smooth upward S-curve matching STEPS visual
      const curve = Math.pow(t, 0.85) * 0.55 + 0.12 * Math.sin(t * Math.PI);
      y = height - 8 - curve * (height - 16);
    } else {
      // Smooth downward relaxing curve matching HEART RATE visual
      const curve = 0.72 - 0.58 * t + 0.08 * Math.sin(t * Math.PI * 2);
      y = height - 8 - Math.max(0.08, Math.min(0.92, curve)) * (height - 16);
    }
    pts.push({ x, y });
  }

  const dotIdx = Math.min(pointsCount - 2, Math.max(3, Math.round(clamped * pointsCount)));
  const dotPt = pts[dotIdx] || pts[Math.floor(pts.length * 0.7)];

  return (
    <View
      style={[styles.curveBox, { height }]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 20 && Math.abs(w - width) > 4) setWidth(w);
      }}
    >
      {/* Vertical drop line under anchor node */}
      {dotPt && (
        <View
          style={{
            position: 'absolute',
            left: dotPt.x - 0.75,
            top: dotPt.y,
            width: 1.5,
            height: Math.max(0, height - dotPt.y - 2),
            backgroundColor: 'rgba(255, 255, 255, 0.28)',
          }}
        />
      )}

      {/* Segments */}
      {pts.slice(0, -1).map((p1, idx) => {
        const p2 = pts[idx + 1];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        const cx = (p1.x + p2.x) / 2;
        const cy = (p1.y + p2.y) / 2;
        const isTail = idx > dotIdx;

        return (
          <View
            key={idx}
            style={{
              position: 'absolute',
              left: cx - (len + 1.2) / 2,
              top: cy - 1.1,
              width: len + 1.2,
              height: 2.2,
              borderRadius: 1.5,
              backgroundColor: isTail ? 'rgba(226, 232, 240, 0.28)' : lineColor,
              transform: [{ rotate: `${angle}deg` }],
            }}
          />
        );
      })}

      {/* Luminous Anchor Dot */}
      {dotPt && (
        <View
          style={[
            styles.dotHalo,
            {
              left: dotPt.x - 10,
              top: dotPt.y - 10,
              backgroundColor: glowColor,
            },
          ]}
        >
          <View style={[styles.dotCore, { backgroundColor: dotColor }]} />
        </View>
      )}
    </View>
  );
}

/**
 * Dual-sine ocean/ice-blue curve for wide bottom Weight/Targets card
 */
export function DualWaveCurve({ height = 56, nodeProgress = 0.62 }) {
  const [width, setWidth] = useState(140);
  const steps = 28;
  const primaryPts = [];
  const secondaryPts = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const x = 4 + t * Math.max(40, width - 8);
    const y1 = height * 0.5 + Math.sin(t * Math.PI * 2.4 + 0.6) * (height * 0.28);
    const y2 = height * 0.52 + Math.cos(t * Math.PI * 2.1) * (height * 0.22);
    primaryPts.push({ x, y: y1 });
    secondaryPts.push({ x, y: y2 });
  }

  const dotIdx = Math.round(Math.max(0.2, Math.min(0.82, nodeProgress)) * steps);
  const dotPt = primaryPts[dotIdx];

  const renderCurve = (points, color, strokeWidth) =>
    points.slice(0, -1).map((p1, idx) => {
      const p2 = points[idx + 1];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      const cx = (p1.x + p2.x) / 2;
      const cy = (p1.y + p2.y) / 2;
      return (
        <View
          key={idx}
          style={{
            position: 'absolute',
            left: cx - (len + 1) / 2,
            top: cy - strokeWidth / 2,
            width: len + 1,
            height: strokeWidth,
            borderRadius: strokeWidth / 2,
            backgroundColor: color,
            transform: [{ rotate: `${angle}deg` }],
          }}
        />
      );
    });

  return (
    <View
      style={[styles.curveBox, { height }]}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w > 20 && Math.abs(w - width) > 4) setWidth(w);
      }}
    >
      {renderCurve(secondaryPts, 'rgba(100, 116, 139, 0.35)', 1.5)}
      {renderCurve(primaryPts, COLORS.accent, 2.2)}

      {dotPt && (
        <View
          style={{
            position: 'absolute',
            left: dotPt.x - 0.75,
            top: 4,
            width: 1.5,
            height: height - 8,
            backgroundColor: 'rgba(91, 181, 255, 0.22)',
          }}
        />
      )}

      {dotPt && (
        <View
          style={[
            styles.dotHalo,
            {
              left: dotPt.x - 10,
              top: dotPt.y - 10,
              backgroundColor: 'rgba(91, 181, 255, 0.35)',
            },
          ]}
        >
          <View style={[styles.dotCore, { backgroundColor: '#93C5FD' }]} />
        </View>
      )}
    </View>
  );
}

/**
 * Glacier-blue vertical waveform equalizer bars matching ACTIVE TIME widget
 */
export function WaveformBars({ fillRatio = 0.68, height = 56 }) {
  const pattern = [
    0.28, 0.54, 0.36, 0.78, 0.92, 0.62, 0.44, 0.86, 0.98, 0.72,
    0.42, 0.68, 0.84, 0.56, 0.32, 0.74, 0.52, 0.28,
  ];
  const activeLimit = Math.round(fillRatio * pattern.length);

  return (
    <View style={[styles.waveRow, { height }]}>
      {pattern.map((norm, idx) => {
        const barH = Math.max(8, Math.round(norm * (height - 8)));
        const isLit = idx <= Math.max(2, activeLimit);
        return (
          <View
            key={idx}
            style={[
              styles.waveBar,
              {
                height: barH,
                backgroundColor: isLit
                  ? idx % 2 === 0
                    ? COLORS.accent
                    : '#7DD3FC'
                  : 'rgba(91, 181, 255, 0.2)',
              },
            ]}
          />
        );
      })}
    </View>
  );
}

/**
 * 7x4 Calendar Consistency Matrix matching ACTIVE DAYS widget
 */
export function ActivityTileMatrix({ activeFlags = [] }) {
  // activeFlags: array of 28 booleans (oldest -> newest), pad or fill deterministically if fewer
  const rows = 4;
  const cols = 7;

  return (
    <View style={styles.matrixWrap}>
      {Array.from({ length: rows }).map((_, r) => (
        <View style={styles.matrixRow} key={r}>
          {Array.from({ length: cols }).map((__, c) => {
            const idx = r * cols + c;
            const lit = Boolean(activeFlags[idx]);
            return (
              <View
                key={c}
                style={[
                  styles.matrixTile,
                  lit ? styles.matrixTileLit : styles.matrixTileOff,
                ]}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  auroraWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
    alignItems: 'center',
  },
  auroraOrbOuter: {
    position: 'absolute',
    top: -190,
    width: 520,
    height: 360,
    borderRadius: 260,
    backgroundColor: COLORS.auroraDeep,
  },
  auroraOrbMid: {
    position: 'absolute',
    top: -210,
    width: 390,
    height: 320,
    borderRadius: 200,
    backgroundColor: COLORS.auroraMid,
  },
  auroraOrbInner: {
    position: 'absolute',
    top: -220,
    width: 240,
    height: 270,
    borderRadius: 140,
    backgroundColor: '#3B82F6',
  },
  laurelWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  laurelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  wingCol: {
    width: 38,
    height: 70,
    position: 'relative',
  },
  leafSlot: {
    position: 'absolute',
  },
  heroScore: {
    fontSize: 56,
    fontWeight: '400',
    color: COLORS.text,
    letterSpacing: -1.5,
    includeFontPadding: false,
  },
  heroScoreLabel: {
    fontSize: 13,
    fontWeight: '400',
    color: COLORS.textSecondary,
    marginTop: 2,
    letterSpacing: 0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 7,
    paddingRight: 4,
    paddingVertical: 2.5,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '600',
  },
  statusCircle: {
    width: 13,
    height: 13,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  curveBox: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  dotHalo: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotCore: {
    width: 8.5,
    height: 8.5,
    borderRadius: 5,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 2,
  },
  waveBar: {
    width: 3.5,
    borderRadius: 2,
  },
  matrixWrap: {
    width: '100%',
    gap: 4.5,
    marginTop: 4,
  },
  matrixRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  matrixTile: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 13,
    borderRadius: 3.5,
  },
  matrixTileLit: {
    backgroundColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  matrixTileOff: {
    backgroundColor: '#19202C',
  },
});
