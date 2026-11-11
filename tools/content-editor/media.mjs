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
let availableEncoders;

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

async function encoders() {
  if (!availableEncoders) {
    const { stdout } = await ffmpeg(['-encoders']);
    availableEncoders = new Set([...stdout.matchAll(/^\s*[VAS][A-Z.]{5}\s+(\S+)/gm)].map(match => match[1]));
  }
  return availableEncoders;
}

function imageFormat(webp, alpha = false, preview = false) {
  if (webp) return { extension: 'webp', args: ['-c:v', 'libwebp', '-quality', preview ? '78' : '86'] };
  if (alpha) return { extension: 'png', args: ['-c:v', 'png', '-compression_level', '6'] };
  return { extension: 'jpg', args: ['-c:v', 'mjpeg', '-q:v', preview ? '4' : '2'] };
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
  let stage = 'чтение файла';
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

    stage = 'проверка кодеков FFmpeg';
    const codecs = await encoders();
    const webp = codecs.has('libwebp');
    const alpha = /^(?:pal8|rgba|argb|bgra|abgr|ya|yuva|gbrap)/.test(stream.pix_fmt ?? '');
    const photo = imageFormat(webp, alpha);
    const poster = imageFormat(webp, isImage && alpha, true);
    const filename = isImage ? 'photo.' + photo.extension : 'video.mp4';
    const previewFilename = 'preview.' + poster.extension;
    const output = join(directory, filename);
    const source = [...inputOptions, '-i', input, '-map', '0:V:0', '-map_metadata', '-1'];
    if (isImage) {
      stage = 'оптимизация фотографии';
      await ffmpeg([...source, '-frames:v', '1', '-vf', scale(2000), ...photo.args, output]);
    } else {
      if (!codecs.has('libx264')) throw new Error('В установленном FFmpeg нет кодека libx264 для MP4.');
      stage = 'конвертация видео в MP4';
      await ffmpeg([...source, '-map', '0:a:0?', '-vf', scale(1920, true), '-c:v', 'libx264', '-preset', 'fast',
        '-crf', '22', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', '-threads', '2', output]);
    }
    const encoded = await probe(output);
    stage = 'создание обложки';
    const cover = join(directory, previewFilename);
    const seconds = Number(encoded.format.duration) || 0;
    const seek = isImage ? [] : ['-ss', String(Math.min(seconds * 0.12, 2))];
    const posterInput = [...inputOptions, '-i', output, '-frames:v', '1',
      '-vf', scale(680), ...poster.args, cover];
    try {
      await ffmpeg([...seek, ...posterInput]);
      await probe(cover);
    } catch (error) {
      if (isImage || !seek.length) throw error;
      await rm(cover, { force: true });
      await ffmpeg(posterInput);
      await probe(cover);
    }
    await rm(input);
    const { width, height } = encoded.stream;
    const time = Math.round(seconds);
    return { id, type: isImage ? 'image' : 'video', filename, previewFilename, width, height,
      duration: isImage ? '' : Math.floor(time / 60) + ':' + String(time % 60).padStart(2, '0') };
  } catch (error) {
    await rm(directory, { recursive: true, force: true });
    if (error.code === 'ENOENT') throw new Error('Установите FFmpeg и ffprobe командой brew install ffmpeg.');
    if (error.cmd) {
      const details = String(error.stderr ?? '').trim().replaceAll(directory, '[рабочий файл]');
      console.error('FFmpeg · ' + stage + '\n' + (details || error.code || 'Процесс прерван'));
      throw new Error('Ошибка FFmpeg: ' + stage + '. Подробности в окне Терминала, где запущен редактор.');
    }
    throw error;
  }
}
