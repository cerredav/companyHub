#!/usr/bin/env python3
"""One-shot xlsx → seed.js agreements array. ponytail: stdlib only (zipfile + XML)."""

import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta
from pathlib import Path

NS = {'m': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
DATE_ARTIFACTS = {'0', '0.0', '41', '41.0', '1095', '1095.0'}
OTHER_TYPES = [
    ('Reseller', 8),
    ('Partnership', 9),
    ('Teaming', 10),
    ('Donation', 11),
    ('EUSA', 12),
    ('Contract', 13),
]


def col_idx(ref: str) -> int:
    m = re.match(r'([A-Z]+)', ref)
    col = 0
    for c in m.group(1):
        col = col * 26 + (ord(c) - 64)
    return col - 1


def excel_to_iso(val: str) -> str:
    if not val or val in DATE_ARTIFACTS:
        return ''
    try:
        serial = float(val)
        if serial < 100:
            return ''
        d = datetime(1899, 12, 30) + timedelta(days=serial)
        if d.year < 2000 or d.year > 2045:
            return ''
        return d.strftime('%Y-%m-%d')
    except (TypeError, ValueError):
        return str(val).strip()


def mnda_signed(val: str) -> str:
    return 'yes' if val in ('1', '1.0') else 'no'


def fold_others(cells: dict) -> str:
    parts = []
    for label, idx in OTHER_TYPES:
        v = (cells.get(idx) or '').strip()
        if v:
            parts.append(f'{label}: {v}')
    return ' · '.join(parts)


def fold_demo(cells: dict) -> str:
    start = excel_to_iso(cells.get(15, ''))
    duration = (cells.get(16) or '').strip()
    end = excel_to_iso(cells.get(17, ''))
    user = (cells.get(18) or '').strip()
    if user in ('0', '0.0'):
        user = ''

    parts = [p for p in (start, duration, end, user) if p]
    return ' · '.join(parts)


def parse_xlsx(path: Path) -> list[dict]:
    with zipfile.ZipFile(path) as z:
        shared: list[str] = []
        if 'xl/sharedStrings.xml' in z.namelist():
            root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in root.findall('m:si', NS):
                texts = [t.text or '' for t in si.findall('.//m:t', NS)]
                shared.append(''.join(texts))

        sheet = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        rows = sheet.findall('m:sheetData/m:row', NS)

        def cell_val(c) -> str:
            t = c.get('t')
            v = c.find('m:v', NS)
            if v is None:
                return ''
            val = v.text or ''
            if t == 's':
                return shared[int(val)]
            return val

        agreements = []
        for row in rows[2:]:  # skip merged header + column header
            cells = {}
            for c in row.findall('m:c', NS):
                cells[col_idx(c.get('r'))] = cell_val(c)

            partner = (cells.get(0) or '').strip()
            if not partner:
                continue

            agreements.append({
                'partner': partner,
                'mndaSigned': mnda_signed(cells.get(1, '')),
                'mndaDate': excel_to_iso(cells.get(2, '')),
                'expiration': excel_to_iso(cells.get(5, '')),
                'contact': (cells.get(3) or '').strip(),
                'email': (cells.get(4) or '').strip(),
                'sender': (cells.get(6) or '').strip(),
                'others': fold_others(cells),
                'demo': fold_demo(cells),
                'notes': (cells.get(7) or '').strip(),
            })

    return agreements


def js_string(s: str) -> str:
    return json.dumps(s, ensure_ascii=False)


def to_seed_js(agreements: list[dict]) -> str:
    lines = ['export const agreements = [']
    for a in agreements:
        lines.append('  {')
        lines.append(f"    partner: {js_string(a['partner'])},")
        lines.append(f"    mndaSigned: {js_string(a['mndaSigned'])},")
        lines.append(f"    mndaDate: {js_string(a['mndaDate'])},")
        lines.append(f"    expiration: {js_string(a['expiration'])},")
        lines.append(f"    contact: {js_string(a['contact'])},")
        lines.append(f"    email: {js_string(a['email'])},")
        lines.append(f"    sender: {js_string(a['sender'])},")
        lines.append(f"    others: {js_string(a['others'])},")
        lines.append(f"    demo: {js_string(a['demo'])},")
        lines.append(f"    notes: {js_string(a['notes'])},")
        lines.append('  },')
    lines.append(']')
    return '\n'.join(lines)


def main() -> int:
    xlsx = Path(sys.argv[1] if len(sys.argv) > 1 else '~/Downloads/Agreement Tracker.xlsx').expanduser()
    seed = Path(sys.argv[2] if len(sys.argv) > 2 else 'src/seed.js').expanduser()

    agreements = parse_xlsx(xlsx)
    block = to_seed_js(agreements)

    text = seed.read_text(encoding='utf-8')
    marker = 'export const agreements = ['
    if marker in text:
        start = text.index(marker)
        end = text.index(']', start) + 1
        text = text[:start] + block + text[end:]
    else:
        text = text.rstrip() + '\n\n' + block + '\n'

    seed.write_text(text, encoding='utf-8')
    print(f'Wrote {len(agreements)} agreements to {seed}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
