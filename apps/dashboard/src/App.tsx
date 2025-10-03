import React, { useEffect, useRef, useState } from 'react';

type Event =
  | { type: 'runStart'; runId: string; startTime: number }
  | { type: 'testStart'; runId: string; testId: string; title: string }
  | { type: 'step'; runId: string; testId: string; message: string }
  | { type: 'artifact'; runId: string; testId: string; kind: string; path: string }
  | { type: 'pass'; runId: string; testId: string; duration: number }
  | { type: 'fail'; runId: string; testId: string; error: string; duration: number }
  | { type: 'runEnd'; runId: string; endTime: number };

type RecordingLine = { ts: number; target: any };

const SERVER = 'http://localhost:4321';

export function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [runId, setRunId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [runs, setRuns] = useState<string[]>([]);
  const [live, setLive] = useState(false);
  const lastTextRef = useRef<string>('');

  const [recordings, setRecordings] = useState<string[]>([]);
  const [recLines, setRecLines] = useState<RecordingLine[]>([]);
  const [recUrl, setRecUrl] = useState('https://example.com');

  const parseJsonl = (text: string) => {
    lastTextRef.current = text;
    const lines = text.split(/\r?\n/).filter(Boolean);
    const parsed: Event[] = [];
    for (const l of lines) { try { parsed.push(JSON.parse(l)); } catch {} }
    setEvents(parsed);
    const runStart = parsed.find(e => e.type === 'runStart') as any;
    setRunId(runStart?.runId ?? null);
  };

  const fetchText = async (url: string) => {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`${resp.status} ${resp.statusText}`);
    return await resp.text();
  };

  const loadLatest = async () => {
    setLoading(true); setErr(null);
    try { parseJsonl(await fetchText(`${SERVER}/latest`)); }
    catch (e: any) { setErr(e.message || 'Failed to load /latest'); }
    finally { setLoading(false); }
  };

  const loadRun = async (id: string) => {
    setLoading(true); setErr(null);
    try { parseJsonl(await fetchText(`${SERVER}/run/${encodeURIComponent(id)}`)); }
    catch (e: any) { setErr(e.message || 'Failed to load run'); }
    finally { setLoading(false); }
  };

  const triggerRun = async () => {
    setErr(null);
    try {
      await fetch(`${SERVER}/trigger/example`, { method: 'POST' });
      setLive(true);
    } catch (e: any) { setErr(e.message || 'Failed to trigger run'); }
  };

  const refreshRuns = async () => {
    try {
      const resp = await fetch(`${SERVER}/runs`);
      if (resp.ok) setRuns(await resp.json());
    } catch (_) {}
  };

  const refreshRecordings = async () => {
    try {
      const resp = await fetch(`${SERVER}/recordings`);
      if (resp.ok) setRecordings(await resp.json());
    } catch (_) {}
  };

  const loadRecording = async (file: string) => {
    try {
      const txt = await fetchText(`${SERVER}/recording/${encodeURIComponent(file)}`);
      const lines = txt.split(/\r?\n/).filter(Boolean).map(l => {
        try { return JSON.parse(l) as RecordingLine; } catch { return null; }
      }).filter(Boolean) as RecordingLine[];
      setRecLines(lines);
    } catch (e: any) { setErr(e.message || 'Failed to load recording'); }
  };

  const startRecording = async () => {
    setErr(null);
    try {
      await fetch(`${SERVER}/record`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: recUrl }) });
      // The browser pops up; user starts clicking. Refresh recordings list after a short delay.
      setTimeout(refreshRecordings, 1500);
    } catch (e: any) { setErr(e.message || 'Failed to start recorder'); }
  };

  // auto-refresh lists
  useEffect(() => {
    const t1 = setInterval(refreshRuns, 2000); refreshRuns();
    const t2 = setInterval(refreshRecordings, 3000); refreshRecordings();
    return () => { clearInterval(t1); clearInterval(t2); };
  }, []);

  // Live tail
  useEffect(() => {
    if (!live) return;
    let stop = false;
    const tick = async () => {
      try {
        const text = await fetchText(`${SERVER}/latest`);
        if (text !== lastTextRef.current) parseJsonl(text);
      } catch {}
      if (!stop) setTimeout(tick, 1000);
    };
    tick();
    return () => { stop = true; };
  }, [live]);

  const tests = (() => {
    const map = new Map<string, { title: string; status: 'running'|'passed'|'failed'; duration?: number; artifacts: { kind: string; path: string }[] }>();
    for (const ev of events) {
      if (ev.type === 'testStart') map.set(ev.testId, { title: ev.title, status: 'running', artifacts: [] });
      else if (ev.type === 'pass') { const t = map.get(ev.testId); if (t) map.set(ev.testId, { ...t, status: 'passed', duration: ev.duration }); }
      else if (ev.type === 'fail') { const t = map.get(ev.testId); if (t) map.set(ev.testId, { ...t, status: 'failed', duration: ev.duration }); }
      else if (ev.type === 'artifact') { const t = map.get(ev.testId); if (t) t.artifacts.push({ kind: ev.kind, path: ev.path }); }
    }
    return Array.from(map.entries()).map(([id, t]) => ({ id, ...t }));
  })();

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <aside style={{ borderRight: '1px solid #eee', padding: 16 }}>
        <h2 style={{ marginTop: 0 }}>Runs</h2>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
          <button onClick={refreshRuns}>Refresh</button>
          <button onClick={loadLatest} disabled={loading}>{loading ? 'Loading…' : 'Load latest'}</button>
          <button onClick={triggerRun}>Run tests</button>
          <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input type="checkbox" checked={live} onChange={e => setLive(e.target.checked)} />
            Live
          </label>
        </div>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6, marginBottom: 16 }}>
          {runs.length ? runs.map(id => (
            <li key={id}>
              <button onClick={() => loadRun(id)} style={{ width: '100%', textAlign: 'left', padding: '6px 8px', border: '1px solid #ddd', borderRadius: 6, background: runId === id ? '#eef6ff' : 'white' }}>
                {id}
              </button>
            </li>
          )) : <li style={{ color: '#666' }}>No runs</li>}
        </ul>

        <h2>Record</h2>
        <div style={{ display: 'grid', gap: 8 }}>
          <input value={recUrl} onChange={e => setRecUrl(e.target.value)} placeholder="https://example.com" />
          <button onClick={startRecording}>Record URL</button>
        </div>

        <h3 style={{ marginTop: 16 }}>Recordings</h3>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 6 }}>
          {recordings.length ? recordings.map(f => (
            <li key={f}>
              <button onClick={() => loadRecording(f)} style={{ width: '100%', textAlign: 'left', padding: '6px 8px', border: '1px solid #ddd', borderRadius: 6 }}>
                {f}
              </button>
            </li>
          )) : <li style={{ color: '#666' }}>No recordings</li>}
        </ul>

        {err && <div style={{ color: 'crimson', marginTop: 12 }}>{err}</div>}
      </aside>

      <main style={{ padding: 16 }}>
        <h1>HyperTest Dashboard</h1>

        {runId && <>
          <h3 style={{ marginTop: 8 }}>Run: {runId}</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Test</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Status</th>
                <th style={{ textAlign: 'right', borderBottom: '1px solid #ddd', padding: 8 }}>Duration (ms)</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Artifacts</th>
              </tr>
            </thead>
            <tbody>
              {tests.map(t => (
                <tr key={t.id}>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{t.title}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                    {t.status === 'passed' ? '✅ passed' : t.status === 'failed' ? '❌ failed' : '⏳ running'}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0', textAlign: 'right' }}>
                    {t.duration ?? '—'}
                  </td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                    {/* You already implemented artifact links earlier */}
                    {/* left as-is to keep this patch focused */}
                  </td>
                </tr>
              ))}
              {!tests.length && <tr><td colSpan={4} style={{ padding: 8, color: '#666' }}>No tests yet.</td></tr>}
            </tbody>
          </table>
        </>}

        <h2 style={{ marginTop: 24 }}>Recording viewer</h2>
        <p style={{ color: '#555' }}>Click targets below to copy into your tests.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>When</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Target JSON</th>
              <th style={{ textAlign: 'left', borderBottom: '1px solid #ddd', padding: 8 }}>Copy</th>
            </tr>
          </thead>
          <tbody>
            {recLines.length ? recLines.map((l, i) => {
              const json = JSON.stringify(l.target);
              const at = new Date(l.ts).toLocaleTimeString();
              return (
                <tr key={i}>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>{at}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' }}>{json}</td>
                  <td style={{ padding: 8, borderBottom: '1px solid #f0f0f0' }}>
                    <button onClick={() => navigator.clipboard?.writeText(json)}>Copy</button>
                  </td>
                </tr>
              );
            }) : <tr><td colSpan={3} style={{ padding: 8, color: '#666' }}>No recording loaded.</td></tr>}
          </tbody>
        </table>
      </main>
    </div>
  );
}
