import React, { useRef, useState } from "react";
// Jscbc: 导入必要的 React 钩子
import imageCompression from "browser-image-compression"; // Jscbc: 引入前端图片压缩库

interface ImageInfo {
  file: File;
  url: string;
  size: number;
}

interface CompressState {
  frontend: {
    compressing: boolean;
    progress: number;
    compressed?: ImageInfo;
  };
  backend: {
    compressing: boolean;
    progress: number;
    compressed?: ImageInfo;
  };
}

// Jscbc: 后端精准压缩API对接
async function compressImageOnServer(file: File, quality: number, targetSizeKB: number) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('quality', quality.toString());
  formData.append('targetSizeKB', targetSizeKB.toString());
  // Jscbc: 动态获取后端API地址
  const BASE_URL = import.meta.env.VITE_API_BASE_URL;
  const res = await fetch(`${BASE_URL}/api/image/compress`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  // 直接拼接 base64 图片 url，避免二次 fetch
  const url = `data:${data.mime};base64,${data.buffer}`;
  const blob = await (await fetch(url)).blob();
  return {
    blob,
    size: data.size,
    url,
  };
}

const App: React.FC = () => {
  // Jscbc: 多图原图数组
  const [originals, setOriginals] = useState<ImageInfo[]>([]);
  // Jscbc: 多图压缩状态数组
  const [compressStates, setCompressStates] = useState<CompressState[]>([]);
  const [quality, setQuality] = useState(0.7); // Jscbc: 默认压缩质量 70%
  const fileInput = useRef<HTMLInputElement>(null);

  // Jscbc: 处理多图上传
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const imgs = files.map(file => ({
      file,
      url: URL.createObjectURL(file),
      size: file.size,
    }));
    setOriginals(imgs);
    setCompressStates(imgs.map(() => ({
      frontend: { compressing: false, progress: 0 },
      backend: { compressing: false, progress: 0 }
    })));
  };

  // Jscbc: 单张图片压缩，index为图片序号
  const handleCompress = async (index: number) => {
    setCompressStates(states => states.map((s, i) =>
      i === index
        ? { ...s, frontend: { ...s.frontend, compressing: true, progress: 0 } }
        : s
    ));
    const original = originals[index];
    try {
      const targetSize = original.size * quality;
      let currentQuality = quality;
      let minQuality = 0.1;
      let maxQuality = quality;
      let bestFile = original.file;
      let bestSize = original.size;
      let lastDiff = Math.abs(original.size - targetSize);
      const maxTries = 8;
      for (let i = 0; i < maxTries; i++) {
        setCompressStates(states => states.map((s, idx) =>
          idx === index
            ? { ...s, frontend: { ...s.frontend, progress: Math.round((i / maxTries) * 100) } }
            : s
        ));
        const options = {
          maxSizeMB: original.size / 1024 / 1024,
          maxWidthOrHeight: undefined,
          useWebWorker: true,
          initialQuality: currentQuality,
          fileType: original.file.type,
        };
        const compressedFile = await imageCompression(original.file, options);
        const diff = Math.abs(compressedFile.size - targetSize);
        if (diff < lastDiff) {
          bestFile = compressedFile;
          bestSize = compressedFile.size;
          lastDiff = diff;
        }
        if (compressedFile.size > targetSize) {
          maxQuality = currentQuality;
          currentQuality = (minQuality + currentQuality) / 2;
        } else {
          minQuality = currentQuality;
          currentQuality = (currentQuality + maxQuality) / 2;
        }
        if (diff / targetSize < 0.05) break;
      }
      setCompressStates(states => states.map((s, idx) =>
        idx === index
          ? {
              ...s,
              frontend: {
                compressing: false,
                progress: 100,
                compressed: {
                  file: bestFile,
                  url: URL.createObjectURL(bestFile),
                  size: bestSize,
                }
              }
            }
          : s
      ));
    } catch (err) {
      alert("压缩失败: " + (err as Error).message);
      setCompressStates(states => states.map((s, idx) =>
        idx === index ? { ...s, frontend: { ...s.frontend, compressing: false, progress: 0 } } : s
      ));
    }
  };

  // Jscbc: 单张图片后端精准压缩，index为图片序号
  const handleBackendCompress = async (index: number) => {
    setCompressStates(states => states.map((s, i) =>
      i === index
        ? { ...s, backend: { ...s.backend, compressing: true, progress: 0 } }
        : s
    ));
    const original = originals[index];
    try {
      const targetSizeKB = (original.size * quality) / 1024;
      const result = await compressImageOnServer(original.file, quality, targetSizeKB);
      setCompressStates(states => states.map((s, idx) =>
        idx === index
          ? {
              ...s,
              backend: {
                compressing: false,
                progress: 100,
                compressed: {
                  file: new File([result.blob], original.file.name, { type: result.blob.type }),
                  url: result.url,
                  size: result.size,
                }
              }
            }
          : s
      ));
    } catch (err) {
      alert("后端压缩失败: " + (err as Error).message);
      setCompressStates(states => states.map((s, idx) =>
        idx === index ? { ...s, backend: { ...s.backend, compressing: false, progress: 0 } } : s
      ));
    }
  };

  // Jscbc: 下载压缩后的图片
  const handleDownload = (index: number) => {
    const compressed = compressStates[index]?.frontend.compressed;
    if (!compressed) return;
    const a = document.createElement("a");
    a.href = compressed.url;
    const originalName = compressed.file.name;
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.'));
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    const compressedName = `${nameWithoutExt}_compressed${ext}`;
    a.download = compressedName;
    a.click();
  };

  return (
    <div className="fixed inset-0 min-h-screen w-full bg-gradient-to-br from-gray-100 to-gray-300 font-sans flex items-center justify-center">
      <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[90vh] px-2 sm:px-8">
        <h1 className="text-4xl font-bold mb-6 text-gray-900 tracking-tight drop-shadow-sm text-center">图片压缩工具</h1>
        <div className="bg-white/80 rounded-2xl shadow-xl p-4 sm:p-8 flex flex-col items-center w-full">
          <input
            ref={fileInput}
            type="file"
            accept="image/png, image/jpeg"
            multiple
            className="hidden"
            onChange={handleUpload}
          />
          <button
            className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium mb-4 transition w-full max-w-xs"
            onClick={() => fileInput.current?.click()}
          >
            选择图片（可多选）
          </button>
          {/* Jscbc: 批量图片预览区 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full mt-4">
            {originals.map((img, idx) => (
              <div key={img.url} className="flex flex-col items-center bg-white/70 rounded-xl shadow p-4">
                <img src={img.url} alt="原图" className="w-full max-w-[180px] h-32 object-contain rounded border border-gray-200" />
                <span className="text-xs text-gray-400 mt-2">原图：{(img.size / 1024).toFixed(2)} KB</span>
                {/* 前端压缩结果展示 */}
                {compressStates[idx]?.frontend.compressed ? (
                  <>
                    <img src={compressStates[idx].frontend.compressed!.url} alt="压缩后" className="w-full max-w-[180px] h-32 object-contain rounded border border-gray-200 mt-2" />
                    <span className="text-xs text-gray-400 mt-2">压缩后：{(compressStates[idx].frontend.compressed!.size / 1024).toFixed(2)} KB</span>
                  </>
                ) : (
                  <div className="w-full max-w-[180px] h-32 flex items-center justify-center bg-gray-50 rounded border border-dashed border-gray-300 text-gray-300 mt-2">无</div>
                )}
                {/* 后端压缩结果展示 */}
                {compressStates[idx]?.backend.compressed && (
                  <>
                    <img src={compressStates[idx].backend.compressed.url} alt="后端压缩后" className="w-full max-w-[180px] h-32 object-contain rounded border border-purple-400 mt-2" />
                    <span className="text-xs text-purple-400 mt-2">后端压缩后：{(compressStates[idx].backend.compressed.size / 1024).toFixed(2)} KB</span>
                  </>
                )}
                <div className="flex flex-col gap-2 w-full mt-4">
                  <button
                    className="px-4 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition disabled:bg-gray-300 disabled:text-gray-400"
                    onClick={() => handleCompress(idx)}
                    disabled={compressStates[idx]?.frontend.compressing}
                  >
                    {compressStates[idx]?.frontend.compressing ? `压缩中...${compressStates[idx].frontend.progress}%` : "前端压缩"}
                  </button>
                  <button
                    className="px-4 py-1 rounded bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow transition disabled:bg-gray-300 disabled:text-gray-400"
                    onClick={() => handleBackendCompress(idx)}
                    disabled={compressStates[idx]?.backend.compressing}
                  >
                    {compressStates[idx]?.backend.compressing ? `压缩中...${compressStates[idx].backend.progress}%` : "后端精准压缩"}
                  </button>
                  <button
                    className="px-4 py-1 rounded bg-green-600 hover:bg-green-700 text-white font-semibold shadow transition disabled:bg-gray-300 disabled:text-gray-400"
                    onClick={() => handleDownload(idx)}
                    disabled={!compressStates[idx]?.frontend.compressed}
                  >
                    下载压缩图片
                  </button>
                </div>
              </div>
            ))}
          </div>
          {/* Jscbc: 压缩参数与说明 */}
          {originals.length > 0 && (
            <div className="w-full flex flex-col items-center mt-8">
              <label className="mb-2 text-gray-700 text-sm">压缩质量：{Math.round(quality * 100)}%</label>
              <input
                type="range"
                min={0.1}
                max={1}
                step={0.01}
                value={quality}
                onChange={e => setQuality(Number(e.target.value))}
                className="w-full max-w-xs accent-blue-500"
                disabled={compressStates.some(s => s.frontend.compressing || s.backend.compressing)}
              />
              <span className="text-xs text-gray-500 mt-2">压缩质量仅为建议，实际体积受图片内容影响</span>
            </div>
          )}
        </div>
        <footer className="mt-10 text-gray-400 text-xs text-center w-full">© {new Date().getFullYear()} Apple 风格图片压缩工具</footer>
      </div>
    </div>
  );
};

export default App;
