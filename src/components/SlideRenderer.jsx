/**
 * SlideRenderer — renders a visual presentation slide based on layout, theme, and Unsplash imagery.
 * Supports: standard, headline, split, cards, metrics
 * Renders **Bold Lead-In:** formatted bullet points with proper typography.
 * Prominently displays high-resolution Unsplash images with photographer credits.
 */
import { getTheme } from '../utils/themes';

/**
 * Parses a bullet string that may contain **Bold:** lead-in formatting.
 * Returns an array of React elements with bold spans.
 */
function renderBullet(text, themeColors) {
  if (!text) return null;

  // Match **SomeText:** or **SomeText** at the start
  const boldMatch = text.match(/^\*\*(.+?)\*\*:?\s*/);
  if (boldMatch) {
    const boldPart = boldMatch[1];
    const rest = text.substring(boldMatch[0].length);
    return (
      <>
        <strong style={{ color: themeColors.heading, fontWeight: 700 }}>{boldPart}:</strong>{' '}
        <span>{rest}</span>
      </>
    );
  }

  return <span>{text}</span>;
}

/**
 * Prominent Featured Image Card for Split & Standard layouts
 */
function FeaturedImageCard({ image, height = '100%', flex = '0 0 42%', border = '#eaeaea' }) {
  if (!image || !image.url) return null;

  return (
    <div style={{
      flex,
      height,
      minHeight: 220,
      position: 'relative',
      borderRadius: 14,
      overflow: 'hidden',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
      border: `1px solid ${border}`,
      background: '#111',
    }}>
      <img
        src={image.url}
        alt={image.alt || 'Slide image'}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
        loading="lazy"
      />
      {image.photographerName && (
        <a
          href={image.photographerUrl || 'https://unsplash.com'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            fontSize: '0.62rem',
            color: '#fff',
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            padding: '3px 8px',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            zIndex: 2,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <span>📷</span> {image.photographerName}
        </a>
      )}
    </div>
  );
}

export default function SlideRenderer({ slide }) {
  if (!slide) return null;

  const layout = slide.layout || 'standard';
  const title = slide.title || '';
  const subtitle = slide.subtitle || '';
  const t = getTheme(slide.theme);
  const image = slide.image || null;
  const hasImage = !!(image && image.url);
  const contentArr = Array.isArray(slide.content)
    ? slide.content
    : (slide.content || '').split('\n');

  const baseStyle = {
    width: '100%',
    height: '100%',
    padding: '40px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    backgroundColor: t.bg,
    color: t.text,
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative',
  };

  switch (layout) {
    case 'headline': {
      // If there's an image, create a dramatic hero slide with dark gradient overlay
      if (hasImage) {
        return (
          <div style={{
            ...baseStyle,
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.75)), url(${image.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: '#f8fafc',
          }}>
            <div style={{ maxWidth: '85%', zIndex: 1 }}>
              <h1 style={{
                fontSize: 'clamp(2rem, 4.2vw, 3rem)',
                fontWeight: 900,
                letterSpacing: '-0.05em',
                lineHeight: 1.15,
                color: '#ffffff',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                margin: '0 auto',
              }}>{title}</h1>
              {subtitle && (
                <p style={{
                  fontSize: '1.15rem',
                  color: '#cbd5e1',
                  marginTop: 18,
                  fontWeight: 400,
                  lineHeight: 1.5,
                  maxWidth: '75%',
                  margin: '18px auto 0',
                }}>{subtitle}</p>
              )}
              {contentArr.filter(Boolean).length > 0 && contentArr[0] !== '' && (
                <p style={{
                  fontSize: '0.9rem',
                  color: '#94a3b8',
                  marginTop: 14,
                  maxWidth: '65%',
                  lineHeight: 1.5,
                  margin: '14px auto 0',
                }}>
                  {renderBullet(contentArr[0], { heading: '#38bdf8' })}
                </p>
              )}
            </div>
            {image.photographerName && (
              <span style={{
                position: 'absolute', bottom: 12, right: 16,
                fontSize: '0.62rem', color: 'rgba(255,255,255,0.7)',
                background: 'rgba(0,0,0,0.5)', padding: '2px 8px',
                borderRadius: 4, fontWeight: 500,
              }}>
                📷 {image.photographerName}
              </span>
            )}
          </div>
        );
      }

      // Headline without image
      return (
        <div style={{ ...baseStyle, alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <div style={{ maxWidth: '85%' }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 4.2vw, 3rem)',
              fontWeight: 900,
              letterSpacing: '-0.05em',
              lineHeight: 1.15,
              color: t.heading,
              margin: '0 auto',
            }}>{title}</h1>
            {subtitle && (
              <p style={{
                fontSize: '1.15rem',
                color: t.subtitle,
                marginTop: 16,
                fontWeight: 400,
                lineHeight: 1.5,
                maxWidth: '75%',
                margin: '16px auto 0',
              }}>{subtitle}</p>
            )}
            {contentArr.filter(Boolean).length > 0 && contentArr[0] !== '' && (
              <p style={{
                fontSize: '0.88rem',
                color: t.muted,
                marginTop: 14,
                maxWidth: '65%',
                lineHeight: 1.5,
                margin: '14px auto 0',
              }}>
                {renderBullet(contentArr[0], t)}
              </p>
            )}
          </div>
        </div>
      );
    }

    case 'split':
      return (
        <div style={{
          ...baseStyle,
          flexDirection: 'row',
          gap: 32,
          alignItems: 'center',
          padding: '36px 44px',
        }}>
          {/* Content Column */}
          <div style={{
            flex: hasImage ? '0 0 55%' : '0 0 45%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            maxHeight: '100%',
            overflowY: 'auto',
          }}>
            <h2 style={{
              fontSize: '1.55rem',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1.2,
              marginBottom: 6,
              color: t.heading,
            }}>{title}</h2>
            {subtitle && (
              <p style={{ fontSize: '0.86rem', color: t.subtitle, lineHeight: 1.45, marginBottom: 12 }}>
                {subtitle}
              </p>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {contentArr.filter(Boolean).map((line, i) => (
                <li key={i} style={{
                  fontSize: '0.82rem',
                  color: t.text,
                  padding: '5px 0 5px 18px',
                  lineHeight: 1.5,
                  position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '11px',
                    width: 5,
                    height: 5,
                    backgroundColor: t.bullet,
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}></span>
                  {renderBullet(line, t)}
                </li>
              ))}
            </ul>
          </div>

          {/* Right Column: Prominent Image if available, or empty balance space */}
          {hasImage ? (
            <FeaturedImageCard image={image} flex="1" height="88%" border={t.border} />
          ) : (
            <div style={{ flex: 1 }} />
          )}
        </div>
      );

    case 'cards': {
      const cards = [];
      const lines = contentArr.filter(Boolean);
      for (let i = 0; i < lines.length && cards.length < 3; i += 2) {
        cards.push({ heading: lines[i], body: lines[i + 1] || '' });
      }
      while (cards.length < 3) cards.push({ heading: `Card ${cards.length + 1}`, body: '' });

      return (
        <div style={{ ...baseStyle, padding: '32px 40px' }}>
          {/* Background image watermark for cards layout */}
          {hasImage && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.12,
              filter: 'blur(2px)',
              zIndex: 0,
            }} />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ textAlign: 'left' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.03em', color: t.heading, margin: 0 }}>
                  {title}
                </h2>
                {subtitle && (
                  <p style={{ fontSize: '0.82rem', color: t.subtitle, margin: '4px 0 0' }}>{subtitle}</p>
                )}
              </div>
              {hasImage && (
                <div style={{
                  width: 54, height: 38,
                  borderRadius: 6, overflow: 'hidden',
                  border: `1px solid ${t.border}`,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  position: 'relative',
                }}>
                  <img src={image.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
              {cards.map((card, i) => (
                <div key={i} style={{
                  background: t.cardBg,
                  border: `1px solid ${t.border}`,
                  borderRadius: 12,
                  padding: '18px 16px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                }}>
                  <h4 style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 8, color: t.heading }}>
                    {card.heading}
                  </h4>
                  {card.body && (
                    <p style={{ fontSize: '0.74rem', color: t.subtitle, lineHeight: 1.5, margin: 0 }}>
                      {renderBullet(card.body, t)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    case 'metrics': {
      const metrics = contentArr.filter(Boolean).slice(0, 4).map((line) => {
        const parts = line.split(/\s*[—–]\s*/);
        if (parts.length >= 2) return { value: parts[0].trim(), label: parts.slice(1).join(' — ').trim() };
        return { value: line, label: '' };
      });

      return (
        <div style={{ ...baseStyle, padding: '32px 44px', textAlign: 'center' }}>
          {hasImage && (
            <div style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.1,
              filter: 'blur(3px)',
              zIndex: 0,
            }} />
          )}
          <div style={{ position: 'relative', zIndex: 1 }}>
            <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 4, color: t.heading }}>
              {title}
            </h2>
            {subtitle && (
              <p style={{ fontSize: '0.85rem', color: t.subtitle, marginBottom: 24 }}>{subtitle}</p>
            )}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 18, flexWrap: 'wrap' }}>
              {metrics.map((m, i) => (
                <div key={i} style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  minWidth: 120,
                  maxWidth: 210,
                  padding: '18px 20px',
                  background: t.cardBg,
                  border: `1px solid ${t.border}`,
                  borderRadius: 14,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                }}>
                  <span style={{ fontSize: '1.65rem', fontWeight: 900, letterSpacing: '-0.03em', color: t.accent }}>
                    {m.value}
                  </span>
                  {m.label && (
                    <span style={{ fontSize: '0.7rem', color: t.subtitle, fontWeight: 500, lineHeight: 1.4 }}>
                      {m.label}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          {hasImage && image.photographerName && (
            <span style={{
              position: 'absolute', bottom: 10, right: 14,
              fontSize: '0.6rem', color: t.muted,
            }}>
              📷 {image.photographerName}
            </span>
          )}
        </div>
      );
    }

    default: {
      // standard layout — when hasImage is true, use a side-by-side featured layout!
      if (hasImage) {
        return (
          <div style={{
            ...baseStyle,
            flexDirection: 'row',
            gap: 32,
            alignItems: 'center',
            padding: '36px 44px',
          }}>
            {/* Left 58%: Title, Subtitle, Bullets */}
            <div style={{
              flex: '0 0 58%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              maxHeight: '100%',
              overflowY: 'auto',
            }}>
              <h2 style={{
                fontSize: '1.65rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                marginBottom: 6,
                lineHeight: 1.2,
                color: t.heading,
              }}>{title}</h2>
              {subtitle && (
                <p style={{ fontSize: '0.88rem', color: t.subtitle, marginBottom: 14, fontWeight: 500 }}>
                  {subtitle}
                </p>
              )}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {contentArr.filter(Boolean).map((line, i) => (
                  <li key={i} style={{
                    fontSize: '0.82rem',
                    color: t.text,
                    padding: '5px 0 5px 18px',
                    lineHeight: 1.5,
                    position: 'relative',
                  }}>
                    <span style={{
                      position: 'absolute',
                      left: 0,
                      top: '11px',
                      width: 5,
                      height: 5,
                      backgroundColor: t.bullet,
                      borderRadius: '50%',
                      display: 'inline-block',
                    }}></span>
                    {renderBullet(line, t)}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right 42%: Beautiful Featured Image Card */}
            <FeaturedImageCard image={image} flex="1" height="88%" border={t.border} />
          </div>
        );
      }

      // Standard layout without image (Full width)
      return (
        <div style={{ ...baseStyle, padding: '44px 54px' }}>
          <div>
            <h2 style={{
              fontSize: '1.85rem',
              fontWeight: 800,
              letterSpacing: '-0.04em',
              marginBottom: 8,
              lineHeight: 1.15,
              color: t.heading,
            }}>{title}</h2>
            {subtitle && (
              <p style={{ fontSize: '0.92rem', color: t.subtitle, marginBottom: 18, fontWeight: 500 }}>
                {subtitle}
              </p>
            )}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {contentArr.filter(Boolean).map((line, i) => (
                <li key={i} style={{
                  fontSize: '0.88rem',
                  color: t.text,
                  padding: '5px 0 5px 20px',
                  lineHeight: 1.5,
                  position: 'relative',
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    top: '12px',
                    width: 6,
                    height: 6,
                    backgroundColor: t.bullet,
                    borderRadius: '50%',
                    display: 'inline-block',
                  }}></span>
                  {renderBullet(line, t)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
  }
}
