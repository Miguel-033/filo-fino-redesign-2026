#!/usr/bin/env python3
"""Read-only verification of the vendored skills and preserved site files."""
import ast
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
LOCK = json.loads((ROOT / '.agents/skills-lock.json').read_text(encoding='utf-8'))
errors = []
expected_remote = 'https://github.com/Miguel-033/filo-fino-redesign-2026.git'
remote = subprocess.check_output(['git', 'remote', 'get-url', 'origin'], cwd=ROOT, text=True).strip()
if remote != expected_remote:
    errors.append('Unexpected repository remote: ' + remote)

expected_skills = {s['name'] for s in LOCK['skills']}
found_skills = {p.parent.name for p in (ROOT / '.agents/skills').glob('*/SKILL.md')}
if expected_skills != found_skills:
    errors.append('Skill directory set differs from lock')
for name in sorted(expected_skills):
    p = ROOT / '.agents/skills' / name / 'SKILL.md'
    text = p.read_text(encoding='utf-8')
    if not text.startswith('---\n') or '\n---\n' not in text[4:]:
        errors.append(str(p) + ': missing YAML frontmatter')
        continue
    front = text.split('---', 2)[1]
    declared = re.search(r'^name:\s*(.+)$', front, re.M)
    description = re.search(r'^description:\s*(.+)$', front, re.M)
    if not declared or declared.group(1).strip().strip('"\'') != name:
        errors.append(name + ': mismatched name')
    if not description or not description.group(1).strip():
        errors.append(name + ': missing description')
    if name == 'ui-ux-pro-max' and 'CLAUDE_PLUGIN_ROOT' in text:
        errors.append(name + ': unadapted Claude path')

for entry in LOCK['files']:
    p = ROOT / entry['path']
    if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest() != entry['sha256']:
        errors.append(entry['path'] + ': integrity mismatch')
actual_files = {p.relative_to(ROOT).as_posix() for p in (ROOT / '.agents/skills').rglob('*') if p.is_file()}
if actual_files != {entry['path'] for entry in LOCK['files']}:
    errors.append('Unexpected or missing files in skills directories')

python_modules = []
for p in (ROOT / '.agents/skills').rglob('*.py'):
    ast.parse(p.read_text(encoding='utf-8'), filename=str(p))
    python_modules.append(p.relative_to(ROOT).as_posix())

# Check actual local Markdown reference links; ignore remote URLs and fragments.
for p in (ROOT / '.agents/skills').rglob('*.md'):
    for target in re.findall(r'\]\(([^)]+)\)', p.read_text(encoding='utf-8')):
        target = target.split('#', 1)[0]
        if target and not target.startswith('/') and not re.match(r'^[a-zA-Z]+:', target) and ' ' not in target:
            if not (p.parent / target).is_file():
                errors.append(str(p.relative_to(ROOT)) + ': missing link ' + target)

baseline = json.loads((ROOT / '.agents/skill-support/site-baseline.json').read_text(encoding='utf-8'))
for name, digest in baseline.items():
    p = ROOT / name
    if not p.is_file() or hashlib.sha256(p.read_bytes()).hexdigest() != digest:
        errors.append(name + ': original file changed')

allowed = {'AGENTS.md', '.agents/SKILLS.md', '.agents/skills-lock.json'}
changed = subprocess.check_output(['git', 'diff', '--name-only', LOCK['baseline_commit']], cwd=ROOT, text=True).splitlines()
untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard'], cwd=ROOT, text=True).splitlines()
for name in changed + untracked:
    if name not in allowed and not name.startswith(('.agents/skills/', '.agents/skill-support/')):
        errors.append(name + ': outside authorized installation scope')

result = {'skills': len(expected_skills), 'vendored_files': len(LOCK['files']),
          'readable_instructions': sorted(expected_skills), 'python_modules': python_modules,
          'unchanged_original_files': len(baseline), 'errors': errors}
print(json.dumps(result, ensure_ascii=False, indent=2))
raise SystemExit(bool(errors))
