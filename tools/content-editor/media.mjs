import { execFile } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createWriteStream } from 'node:fs';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const maxUpload = 300 * 1024 * 1024;
const inputTypes = new Set(['mjpeg', 'png', 'webp', 'h264', 'hevc', 'av1', 'vp8', 'vp9', 'mpeg4', 'mpeg2video', 'prores', 'jpeg2000', 'theora', 'dnxhd', 'h263', 'wmv3', 'vc1']);
const imageTypes = new Set(['jpeg_pipe', 'png_pipe', 'webp_pipe', 'image2']);
const videoFormats = new Set(['mov', 'mp4', 'm4v', 'matroska', 'webm', 'avi', 'mpeg', 'mpegts', 'flv', 'asf', 'ogg']);
const inputOptions = ['-protocol_whitelist', 'file,pipe', '-format_whitelist',
  [...imageTypes, ...videoFormats].join(',')];

async function probe(path) {
  const { stdout } = await exec('ffprobe', [
    '-v', 'error', ...inputOptions, '-show_streams', '-show_format', '-of', 'json', path,
  ], { timeout: 30_000, maxBuffer: 256_000 });
  const result = JSON.parse(stdout);
  const stream = result.streams.find(item => item.codec_type === 'video' && !item.disposition?.attached_pic);
  if (!stream?.width || !stream.height) throw new Error('В файле нет изображения или видео.');
  return { stream, format: result.format };
}

function ffmpeg(args) {
  return exec('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-nostdin', '-threads', '2', '-filter_threads', '1', ...args],
    { timeout: 600_000, maxBuffer: 256_000 });
}

function scale(size, even = false) {
  return 'scale=w=min(iw\\,' + size + '):h=min(ih\\,' + size +
    '):force_original_aspect_ratio=decrease' + (even ? ':force_divisible_by=2' : '') + ',setsar=1';
}

export async function processUpload(request, staging) {
  if (Number(request.headers['content-length']) > maxUpload) throw new Error('Файл превышает 300 МБ.');
  const id = randomUUID();
  const directory = join(staging, id);
  const input = join(directory, 'upload');
  await mkdir(directory);
  let received = 0;
  try {
    await pipeline(request, new Transform({
      transform(chunk, _, done) {
        received += chunk.length;
        done(received > maxUpload ? new Error('Файл превышает 300 МБ.') : null, chunk);
      },
    }), createWriteStream(input, { flags: 'wx' }));

    const { stream, format } = await probe(input);
    const isImage = imageTypes.has(format.format_name) && ['mjpeg', 'png', 'webp'].includes(stream.codec_name);
    if (!isImage && (!inputTypes.has(stream.codec_name) ||
      !format.format_name.split(',').some(value => videoFormats.has(value)))) {
      throw new Error('Поддерживаются JPG, PNG, WebP, MOV, MP4, WebM и распространённые видеоформаты.');
    }

    const filename = isImage ? 'photo.webp' : 'video.mp4';
    const output = join(directory, filename);
    const source = [...inputOptions, '-i', input, '-map', '0:V:0', '-map_metadata', '-1'];
    if (isImage) {
      await ffmpeg([...source, '-frames:v', '1', '-vf', scale(2000), '-c:v', 'libwebp', '-quality', '86', output]);
    } else {
      await ffmpeg([...source, '-map', '0:a:0?', '-vf', scale(1920, true), '-c:v', 'libx264', '-preset', 'fast',
        '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-threads', '2', output]);
    }
    const encoded = await probe(output);
    const cover = join(directory, 'preview.webp');
    const seconds = Number(encoded.format.duration) || 0;
    const seek = isImage ? [] : ['-ss', String(Math.min(seconds * 0.12, 2))];
    const posterInput = [...inputOptions, '-i', output, '-frames:v', '1',
      '-vf', scale(680), '-c:v', 'libwebp', '-quality', '78', cover];
    try {
      await ffmpeg([...seek, ...posterInput]);
      await probe(cover);
    } catch (error) {
      if (isImage || !seek.length) throw error;
      await rm(cover, { force: true });
      await ffmpeg(posterInput);
    }
    await rm(input);
    const { width, height } = encoded.stream;
    const time = Math.round(seconds);
    return { id, type: isImage ? 'image' : 'video', filename, width, height,
      duration: isImage ? '' : Math.floor(time / 60) + ':' + String(time % 60).padStart(2, '0') };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    if (error.code === 'ENOENT') throw new Error('Установите FFmpeg и ffprobe командой brew install ffmpeg.');
    if (error.cmd) throw new Error('FFmpeg не смог обработать файл. Проверьте формат и попробуйте другой исходник.');
    throw error;
  }
}
