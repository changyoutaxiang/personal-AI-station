export const dynamic = 'force-static';

export default function ThemeLabPage() {
  const tags = [
    { key: 'blue', label: 'Blue' },
    { key: 'green', label: 'Green' },
    { key: 'yellow', label: 'Yellow' },
    { key: 'orange', label: 'Orange' },
    { key: 'red', label: 'Red' },
    { key: 'purple', label: 'Purple' },
    { key: 'pink', label: 'Pink' },
  ];

  const samples = [
    { label: 'Primary Card', style: { backgroundColor: 'var(--card-glass)', color: 'var(--text-primary)', border: '1px solid var(--card-border)' } },
    { label: 'Secondary Card', style: { backgroundColor: 'var(--panel-bg)', color: 'var(--text-secondary)', border: '1px solid var(--panel-border)' } },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Theme Lab</h1>
      <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Quick visual check for theme variables in light/dark + theme flavors.</p>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Cards</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {samples.map((s) => (
            <div key={s.label} style={{ ...s.style, borderRadius: 12, padding: 12 }}>
              <div style={{ fontSize: 12, marginBottom: 8 }}>{s.label}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {tags.map((t) => (
                  <span
                    key={t.key + s.label}
                    style={{
                      backgroundColor: `var(--tag-${t.key}-bg)`,
                      color: `var(--tag-${t.key}-text)`,
                      border: `1px solid var(--tag-${t.key}-border)`,
                      padding: '4px 8px',
                      borderRadius: 999,
                      fontSize: 12,
                    }}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Buttons</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tags.map((t) => (
            <button
              key={'btn-' + t.key}
              style={{
                backgroundColor: `var(--tag-${t.key}-bg)`,
                color: `var(--tag-${t.key}-text)`,
                border: `1px solid var(--tag-${t.key}-border)`,
                padding: '6px 10px',
                borderRadius: 8,
                fontSize: 12,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Text samples</h2>
        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div style={{ backgroundColor: 'var(--card-glass)', border: '1px solid var(--card-border)', borderRadius: 12, padding: 12 }}>
            <div style={{ color: 'var(--text-primary)', fontSize: 14 }}>Primary text</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Secondary text</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>Muted text</div>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Computed variables</h2>
        <div style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          backgroundColor: 'var(--panel-bg)',
          color: 'var(--text-secondary)',
          border: '1px solid var(--panel-border)',
          borderRadius: 12,
          padding: 12,
          fontSize: 12,
          overflowX: 'auto',
        }}>
          <div>card-glass: <code>var(--card-glass)</code></div>
          <div>card-border: <code>var(--card-border)</code></div>
          <div>text-primary: <code>var(--text-primary)</code></div>
          <div>text-secondary: <code>var(--text-secondary)</code></div>
          <div>text-muted: <code>var(--text-muted)</code></div>
        </div>
      </section>
    </div>
  );
}

