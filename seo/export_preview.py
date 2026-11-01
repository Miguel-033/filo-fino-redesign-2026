"""Sync a LOCAL preview/* worktree from the dependency-only preview build. Never deploys."""
import argparse
import shutil
import subprocess
import tempfile
from pathlib import Path
from build import ROOT, build

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    dest = args.output.resolve()
    remote = subprocess.check_output(['git', 'remote', 'get-url', 'origin'], cwd=dest, text=True).strip()
    branch = subprocess.check_output(['git', 'branch', '--show-current'], cwd=dest, text=True).strip()
    assert remote == 'https://github.com/Miguel-033/filo-fino-redesign-2026.git'
    assert branch.startswith('preview/') and dest != ROOT
    assert (dest / '.nojekyll').exists() and not (dest / 'CNAME').exists()
    subprocess.run(['python', str(ROOT / 'seo/verify.py')], check=True)
    work = ROOT / '.build'
    work.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(dir=work) as temporary:
        source = build('preview', Path(temporary) / 'preview')
        # Remove stale publish files rather than carrying old pages/assets forward.
        for path in dest.iterdir():
            if path.name == '.git':
                continue
            if path.is_dir():
                shutil.rmtree(path)
            else:
                path.unlink()
        shutil.copytree(source, dest, dirs_exist_ok=True)
    print('PASS: local preview worktree synchronized; no git push/ref update/deployment')
