import { cp, mkdir, readdir } from 'node:fs/promises';
import { basename, dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const destination = process.argv[2] && resolve(process.argv[2]);
if (!destination || destination === root || destination.startsWith(root + sep)) {
  console.error('Укажите новый или пустой каталог вне репозитория.');
  process.exitCode = 1;
} else {
  try {
    await mkdir(destination, { recursive: true });
    if ((await readdir(destination)).length) throw new Error('Выходной каталог должен быть пустым.');
    const entries = await readdir(root, { withFileTypes: true });
    const directories = new Set(['assets', 'legal', 'servicios']);
    const extensions = new Set(['.html', '.css', '.js']);
    for (const entry of entries) {
      const allowed = entry.isDirectory() && directories.has(entry.name) ||
        entry.isFile() && (entry.name === '.nojekyll' || extensions.has(extname(entry.name)));
      if (allowed) {
        const source = join(root, entry.name);
        await cp(source, join(destination, entry.name), {
          recursive: true, filter: path => path === source || !basename(path).startsWith('.'),
        });
      }
    }
    console.log('Сайт собран локально: ' + destination);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
