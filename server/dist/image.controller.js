"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const sharp = require("sharp");
let ImageController = class ImageController {
    async compress(file, quality, targetSizeKB) {
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
        if (file.mimetype === 'image/png') {
            format = 'webp';
            mime = 'image/webp';
        }
        else if (file.mimetype === 'image/webp') {
            format = 'webp';
            mime = 'image/webp';
        }
        else if (file.mimetype === 'image/jpeg') {
            format = 'jpeg';
            mime = 'image/jpeg';
        }
        let minQ = 0.1, maxQ = q, best = output, bestDiff = Math.abs(output.length / 1024 - target);
        for (let i = 0; i < 8; i++) {
            let buf;
            if (format === 'jpeg') {
                buf = await sharp(file.buffer).jpeg({ quality: Math.round(q * 100) }).toBuffer();
            }
            else if (format === 'webp') {
                buf = await sharp(file.buffer).webp({ quality: Math.round(q * 100) }).toBuffer();
            }
            else if (format === 'png') {
                buf = await sharp(file.buffer).png({ compressionLevel: Math.round(9 - q * 8.9) }).toBuffer();
            }
            else {
                buf = await sharp(file.buffer).toBuffer();
            }
            const diff = Math.abs(buf.length / 1024 - target);
            if (diff < bestDiff) {
                best = buf;
                bestDiff = diff;
            }
            if (buf.length / 1024 > target) {
                maxQ = q;
                q = (minQ + q) / 2;
            }
            else {
                minQ = q;
                q = (q + maxQ) / 2;
            }
            if (diff / target < 0.05)
                break;
        }
        return {
            buffer: best.toString('base64'),
            size: best.length,
            mime,
        };
    }
};
exports.ImageController = ImageController;
__decorate([
    (0, common_1.Post)('compress'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('quality')),
    __param(2, (0, common_1.Body)('targetSizeKB')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ImageController.prototype, "compress", null);
exports.ImageController = ImageController = __decorate([
    (0, common_1.Controller)('api/image')
], ImageController);
//# sourceMappingURL=image.controller.js.map