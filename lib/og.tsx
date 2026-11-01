import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { ImageResponse } from 'next/og';

/**
 * Shared OG image template — SPEC.md § Brand assets: "black background,
 * wordmark, page title in Display style, grid texture."
 *
 * Rendered at build time by next/og (satori + resvg). A static export has
 * no request-time server, so every image is emitted during `next build`.
 *
 * Satori supports a flexbox subset of CSS, so the grid texture is drawn as
 * explicit lines rather than a repeating background.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = 'image/png';

const FONT_DIR = join(process.cwd(), 'node_modules/geist/dist/fonts/geist-sans');

async function fonts() {
  const [regular, semibold] = await Promise.all([
    readFile(join(FONT_DIR, 'Geist-Regular.ttf')),
    readFile(join(FONT_DIR, 'Geist-SemiBold.ttf')),
  ]);
  return [
    { name: 'Geist', data: regular, weight: 400 as const, style: 'normal' as const },
    { name: 'Geist', data: semibold, weight: 600 as const, style: 'normal' as const },
  ];
}

const BG = '#0A0A0A';
const FG = '#EDEDED';
const MUTED = '#A1A1A1';
const LINE = 'rgba(255,255,255,0.055)';

export async function ogImage({
  title,
  eyebrow,
  meta,
}: {
  title: string;
  eyebrow?: string;
  meta?: string;
}) {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: BG,
        padding: 72,
        position: 'relative',
        fontFamily: 'Geist',
      }}
    >
      {/* grid texture */}
      {Array.from({ length: 9 }).map((_, i) => (
        <div
          key={`v${i}`}
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: (i + 1) * 120,
            width: 1,
            background: LINE,
          }}
        />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={`h${i}`}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: (i + 1) * 126,
            height: 1,
            background: LINE,
          }}
        />
      ))}

      {/* wordmark: the three stacked bars, drawn as divs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <div style={{ width: 34, height: 6, borderRadius: 3, background: FG }} />
          <div
            style={{
              width: 23,
              height: 6,
              borderRadius: 3,
              background: FG,
              opacity: 0.6,
            }}
          />
          <div
            style={{
              width: 13,
              height: 6,
              borderRadius: 3,
              background: FG,
              opacity: 0.32,
            }}
          />
        </div>
        <div style={{ fontSize: 30, fontWeight: 600, color: FG, letterSpacing: -0.6 }}>
          Stackrel
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {eyebrow ? (
          <div
            style={{
              fontSize: 22,
              color: MUTED,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            {eyebrow}
          </div>
        ) : null}
        <div
          style={{
            fontSize: title.length > 60 ? 60 : 76,
            fontWeight: 600,
            color: FG,
            lineHeight: 1.05,
            letterSpacing: -2.6,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        {meta ? <div style={{ fontSize: 24, color: MUTED }}>{meta}</div> : null}
      </div>
    </div>,
    { ...OG_SIZE, fonts: await fonts() },
  );
}
