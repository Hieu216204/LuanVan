const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Playfair+Display:wght@400;600;700&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap');
 
  .ht-root {
    --bg: #f0f4f8;
    --surface: #ffffff;
    --surface2: #f8fafc;
    --surface3: #eef2f7;
    --border: #dde3ec;
    --border-strong: #c8d1de;
    --accent-blue: #0f7ab0;
    --accent-blue-light: #e8f4fd;
    --accent-green: #0e9f6e;
    --accent-green-light: #e8faf4;
    --accent-yellow: #c27803;
    --accent-yellow-light: #fef9ec;
    --accent-red: #d63f3f;
    --accent-red-light: #fef0f0;
    --text-primary: #1a2533;
    --text-secondary: #4a5568;
    --text-muted: #8896a8;
    --shadow: 0 1px 4px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04);
    --shadow-md: 0 4px 16px rgba(0,0,0,0.12);
    --display: 'Playfair Display', 'Times New Roman', Georgia, serif;
    --body:    'Lora', 'Times New Roman', Georgia, serif;
    --mono:    'Share Tech Mono', 'Courier New', monospace;
    font-family: var(--body);
    background: var(--bg);
    color: var(--text-primary);
    padding: 20px;
    box-sizing: border-box;
    font-size: 15px;
  }
 
  /* ── HEADER ── */
  .ht-header {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 18px; padding-bottom: 16px;
    border-bottom: 1px solid var(--border);
  }
  .ht-header-icon {
    width: 44px; height: 44px;
    background: linear-gradient(135deg, #1a9fd4, #0a6fa0);
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px;
    box-shadow: 0 2px 8px rgba(10,111,160,0.25);
    flex-shrink: 0;
  }
  .ht-title {
    font-family: var(--display);
    font-size: 26px; font-weight: 700;
    color: var(--text-primary); margin: 0;
    line-height: 1.15;
  }
  .ht-subtitle {
    font-family: var(--body);
    font-size: 13px; font-style: italic;
    color: var(--text-muted); margin: 3px 0 0;
  }
  .ht-status {
    margin-left: auto;
    display: flex; align-items: center; gap: 6px;
    font-family: var(--body); font-size: 13px; font-style: italic;
    color: var(--accent-green);
  }
  .ht-status-dot {
    width: 8px; height: 8px; border-radius: 50%;
    background: var(--accent-green);
    box-shadow: 0 0 6px var(--accent-green);
    animation: ht-pulse 2s infinite; flex-shrink: 0;
  }
  @keyframes ht-pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
 
  /* ── CONTROLS ── */
  .ht-controls {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 16px 20px;
    margin-bottom: 16px;
    display: flex; flex-wrap: wrap;
    align-items: flex-end; gap: 18px;
    box-shadow: var(--shadow);
  }
  .ht-filter-label {
    font-family: var(--body); font-size: 12px; font-weight: 600;
    font-style: italic; color: var(--text-muted);
    display: block; margin-bottom: 5px;
  }
 
  /* ── CUSTOM DATE-TIME PICKER ── */
  .ht-dt-wrap { position: relative; }
  .ht-dt-display {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface2);
    border: 1.5px solid var(--border-strong);
    border-radius: 8px;
    padding: 8px 13px;
    cursor: pointer;
    transition: border-color 0.18s, box-shadow 0.18s;
    min-width: 220px; user-select: none;
  }
  .ht-dt-display:hover { border-color: var(--accent-blue); }
  .ht-dt-display.open  { border-color: var(--accent-blue); box-shadow: 0 0 0 3px rgba(15,122,176,0.12); }
  .ht-dt-display.filled { border-color: var(--accent-blue); }
  .ht-dt-icon { font-size: 15px; flex-shrink: 0; }
  .ht-dt-text {
    font-family: var(--body); font-size: 14px;
    color: var(--text-primary); flex: 1;
  }
  .ht-dt-text.ph { color: var(--text-muted); font-style: italic; }
  .ht-dt-clear {
    font-size: 13px; color: var(--text-muted);
    cursor: pointer; padding: 1px 3px; border-radius: 3px;
    transition: color 0.15s; line-height: 1;
  }
  .ht-dt-clear:hover { color: var(--accent-red); }
 
  .ht-dt-popup {
    position: absolute; top: calc(100% + 6px); left: 0; z-index: 200;
    background: var(--surface);
    border: 1px solid var(--border-strong);
    border-radius: 12px;
    box-shadow: var(--shadow-md);
    padding: 18px; min-width: 280px;
    animation: ht-pop 0.14s ease;
  }
  @keyframes ht-pop {
    from { opacity:0; transform:translateY(-5px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .ht-dt-popup-title {
    font-family: var(--display); font-size: 15px; font-weight: 600;
    color: var(--text-secondary); margin-bottom: 14px;
  }
  .ht-dt-fields { display: flex; gap: 10px; margin-bottom: 14px; }
  .ht-dt-field { flex: 1; }
  .ht-dt-field > label {
    font-family: var(--body); font-size: 12px; font-style: italic;
    color: var(--text-muted); display: block; margin-bottom: 5px;
  }
  .ht-dt-native {
    width: 100%; box-sizing: border-box;
    background: var(--surface2); border: 1px solid var(--border);
    border-radius: 7px; color: var(--text-primary);
    font-family: var(--body); font-size: 14px;
    padding: 8px 9px; outline: none;
    transition: border-color 0.18s; color-scheme: light;
  }
  .ht-dt-native:focus { border-color: var(--accent-blue); box-shadow: 0 0 0 2px rgba(15,122,176,0.1); }
  .ht-dt-actions {
    display: flex; gap: 8px; justify-content: flex-end;
    padding-top: 12px; border-top: 1px solid var(--border);
  }
  .ht-dt-btn {
    font-family: var(--body); font-size: 14px; font-weight: 600;
    padding: 7px 18px; border-radius: 7px;
    cursor: pointer; border: 1.5px solid transparent;
    transition: all 0.15s;
  }
  .ht-dt-btn.cancel {
    background: transparent; color: var(--text-secondary);
    border-color: var(--border);
  }
  .ht-dt-btn.cancel:hover { background: var(--surface3); }
  .ht-dt-btn.apply {
    background: var(--accent-blue); color: #fff; border-color: var(--accent-blue);
    box-shadow: 0 2px 6px rgba(15,122,176,0.2);
  }
  .ht-dt-btn.apply:hover { background: #0a6fa0; }
 
  .ht-divider { width:1px; height:48px; background:var(--border); align-self:center; }
 
  /* ── TOGGLES ── */
  .ht-toggles { display:flex; gap:8px; flex-wrap:wrap; }
  .ht-toggle {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 7px 15px; border-radius: 8px;
    font-family: var(--body); font-size: 12px; font-weight: 600;
    cursor: pointer; border: 1.5px solid var(--border);
    background: var(--surface2); color: var(--text-muted);
    transition: all 0.18s; user-select: none;
  }
  .ht-toggle:hover { border-color: var(--border-strong); color: var(--text-secondary); }
  .ht-toggle.input.active  { color:var(--accent-blue);   border-color:var(--accent-blue);   background:var(--accent-blue-light); }
  .ht-toggle.output.active { color:var(--accent-green);  border-color:var(--accent-green);  background:var(--accent-green-light); }
  .ht-toggle.pump.active   { color:var(--accent-yellow); border-color:var(--accent-yellow); background:var(--accent-yellow-light); }
  .ht-toggle.event.active  { color:var(--accent-red);    border-color:var(--accent-red);    background:var(--accent-red-light); }
  .ht-toggle-dot { width:7px; height:7px; border-radius:50%; background:currentColor; flex-shrink:0; }
 
  .ht-row-count {
    font-family: var(--body); font-size: 14px; font-style: italic;
    color: var(--text-muted); margin-left: auto; white-space: nowrap; align-self: center;
  }
  .ht-row-count strong { color: var(--accent-blue); font-style: normal; }

  /* ── EXPORT BUTTONS ── */
  .ht-export-group {
    display: flex; flex-direction: column; gap: 8px;
  }
  .ht-export-buttons {
    display: flex; gap: 10px; flex-wrap: wrap;
  }
  .ht-export-btn {
    font-family: var(--body); font-size: 13px; font-weight: 600;
    padding: 9px 18px; border-radius: 8px;
    border: none; cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex; align-items: center; gap: 6px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  }
  .ht-export-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  .ht-export-btn:active {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  }
  .ht-export-btn.pdf {
    background: linear-gradient(135deg, #b92f2f 0%, #8f1f1f 100%);
    color: #ffffff;
  }
  .ht-export-btn.pdf:hover {
    background: linear-gradient(135deg, #c73d3d 0%, #a02a2a 100%);
  }
  .ht-export-btn.print {
    background: linear-gradient(135deg, #1b7daa 0%, #0d6288 100%);
    color: #ffffff;
  }
  .ht-export-btn.print:hover {
    background: linear-gradient(135deg, #2491c0 0%, #1a7aa0 100%);
  }

  /* ── TABLE ── */
  .ht-table-wrap {
    border: 1px solid var(--border); border-radius: 12px;
    overflow: auto; max-height: 700px;
    background: var(--surface); box-shadow: var(--shadow);
    position: relative;
  }
  .ht-table { border-collapse: collapse; width: 100%; min-width: 1200px; }
  .ht-table thead { position: sticky; top: 0; z-index: 10; }
 
  .ht-th-group {
    font-family: var(--display); font-size: 14px; font-weight: 700;
    padding: 12px 16px; text-align: center;
    border-bottom: 1px solid var(--border);
  }
  .ht-th-group.stt    { background:var(--surface2); color:var(--text-muted); border-right:1px solid var(--border); font-size:13px; }
  .ht-th-group.input  { background:#ddeef9; color:var(--accent-blue);   border-left:3px solid var(--accent-blue); }
  .ht-th-group.output { background:#d6f5eb; color:var(--accent-green);  border-left:3px solid var(--accent-green); }
  .ht-th-group.pump   { background:#fef3d0; color:var(--accent-yellow); border-left:3px solid var(--accent-yellow); }
  .ht-th-group.event  { background:#fde8e8; color:var(--accent-red);    border-left:3px solid var(--accent-red); }
 
  .ht-th-sub {
    font-family: var(--body); font-size: 13px; font-weight: 700; font-style: italic;
    padding: 8px 14px; text-align: center;
    color: var(--text-muted); background: var(--surface2);
    border-bottom: 2px solid var(--border); white-space: nowrap;
  }
  .ht-th-sub.stt { border-right: 1px solid var(--border); }
 
  .ht-td {
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    font-family: var(--body); font-size: 14px;
    text-align: center; white-space: nowrap;
    color: var(--text-secondary); transition: background 0.1s;
  }
  .ht-td.stt {
    color: var(--text-muted); font-size: 13px; font-style: italic;
    background: var(--surface2); position: sticky; left: 0; z-index: 2;
    border-right: 1px solid var(--border);
  }
  .ht-td.input  { border-left: 1px solid rgba(15,122,176,0.1); }
  .ht-td.output { border-left: 1px solid rgba(14,159,110,0.1); }
  .ht-td.pump   { border-left: 1px solid rgba(194,120,3,0.1); }
  .ht-td.event  { border-left: 1px solid rgba(214,63,63,0.1); }
  .ht-td.time   { color: var(--text-muted); font-size: 13px; font-style: italic; }
  .ht-val       { color: var(--text-primary); font-weight: 600; }
 
  tr:hover .ht-td          { background: #f2f6fb; }
  tr:hover .ht-td.stt      { background: var(--surface3); }
  tr:nth-child(even) .ht-td     { background: #fafbfd; }
  tr:nth-child(even) .ht-td.stt { background: var(--surface2); }
 
  .ht-empty {
    text-align: center; padding: 60px 20px;
    font-family: var(--body); font-size: 15px; font-style: italic;
    color: var(--text-muted);
  }
 
  /* ── FOOTER ── */
  .ht-footer {
    margin-top: 12px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .ht-footer-text {
    font-family: var(--body); font-size: 12px; font-style: italic;
    color: var(--text-muted);
  }

  @media print {
    @page {
      size: A4 landscape;
      margin: 8mm;
    }

    .ht-root {
      background: #ffffff !important;
      padding: 0 !important;
      box-shadow: none !important;
      font-size: 12px !important;
    }

    .ht-print-area {
      max-height: none !important;
      overflow: visible !important;
    }

    .ht-table-wrap {
      max-height: 900px !important;
      overflow: visible !important;
      border: 1px solid #dde3ec !important;
      box-shadow: none !important;
    }

    .ht-table {
      width: 100% !important;
      min-width: 0 !important;
      table-layout: fixed !important;
    }

    .ht-th-group,
    .ht-th-sub,
    .ht-td {
      padding: 5px 6px !important;
      font-size: 10px !important;
      white-space: normal !important;
      word-break: break-word !important;
      overflow-wrap: anywhere !important;
    }

    .ht-table thead {
      position: static !important;
      display: table-header-group;
    }

    .ht-th-group.stt,
    .ht-td.stt {
      position: static !important;
      left: auto !important;
    }

    .ht-export-group {
      display: none !important;
    }

    .ht-table tr,
    .ht-table td,
    .ht-table th {
      break-inside: avoid;
      page-break-inside: avoid;
    }
  }
`;
 
export default styles;