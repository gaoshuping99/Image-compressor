import { Controller, Post, UploadedFile, UseInterceptors, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as sharp from 'sharp';

@Controller('api/image')
export class ImageController {
  @Post('compress')
  @UseInterceptors(FileInterceptor('file'))
  async compress(
    @UploadedFile() file: any,
    @Body('quality') quality: string,
    @Body('targetSizeKB') targetSizeKB: string
  ) {
    // Jscbc: 参数校验，避免 file 为空导致 500
    if (!file || !file.buffer) {
      return {
        error: 'No file uploaded',
        buffer: '',
        size: 0,
        mime: '',
      };
    }

    let q = Number(quality) || 0.7;
    let target = Number(targetSizeKB) || 500;
    let output = file.buffer;
    let format = 'jpeg';
    let mime = 'image/jpeg';

    // 自动判断格式
    if (file.mimetype === 'image/png') {
      // Jscbc: PNG 转为 webp 格式，有损压缩，体积更小，浏览器兼容性好
      format = 'webp';
      mime = 'image/webp';
    } else if (file.mimetype === 'image/webp') {
      format = 'webp';
      mime = 'image/webp';
    } else if (file.mimetype === 'image/jpeg') {
      format = 'jpeg';
      mime = 'image/jpeg';
    }

    // 二分法逼近目标体积
    let minQ = 0.1, maxQ = q, best = output, bestDiff = Math.abs(output.length/1024 - target);
    for (let i = 0; i < 8; i++) {
      let buf: Buffer;
      if (format === 'jpeg') {
        buf = await sharp(file.buffer).jpeg({ quality: Math.round(q * 100) }).toBuffer();
      } else if (format === 'webp') {
        buf = await sharp(file.buffer).webp({ quality: Math.round(q * 100) }).toBuffer();
      } else if (format === 'png') {
        buf = await sharp(file.buffer).png({ compressionLevel: Math.round(9 - q * 8.9) }).toBuffer();
      } else {
        buf = await sharp(file.buffer).toBuffer();
      }
      const diff = Math.abs(buf.length / 1024 - target);
      if (diff < bestDiff) { best = buf; bestDiff = diff; }
      if (buf.length / 1024 > target) { maxQ = q; q = (minQ + q) / 2; }
      else { minQ = q; q = (q + maxQ) / 2; }
      if (diff / target < 0.05) break;
    }
    return {
      buffer: best.toString('base64'),
      size: best.length,
      mime,
    };
  }
} 