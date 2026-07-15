"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Crop, Upload, X, ZoomIn } from 'lucide-react';

export default function ImageCropper({ onCropComplete, onCancel }: { onCropComplete: (file: Blob, previewUrl: string, sizeKb: number) => void, onCancel: () => void }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileSize, setFileSize] = useState(0);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    image.onload = () => {
      setImg(image);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
  };

  useEffect(() => {
    if (img && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Target 800x600 (4:3)
      canvas.width = 800;
      canvas.height = 600;
      
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Calculate base scale to 'cover' the canvas
      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
      const baseScale = Math.max(scaleX, scaleY);
      const scale = baseScale * zoom;
      
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      
      const drawX = (canvas.width - drawW) / 2 + pan.x;
      const drawY = (canvas.height - drawH) / 2 + pan.y;
      
      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      
      // Calculate compressed size estimate
      const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
      setFileSize(Math.round(dataUrl.length * 0.75 / 1024));
    }
  }, [img, zoom, pan]);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };
  const handlePointerUp = () => setIsDragging(false);

  const handleConfirm = () => {
    if (!canvasRef.current) return;
    // Compress and enforce < 500KB
    let quality = 0.9;
    let dataUrl = canvasRef.current.toDataURL('image/jpeg', quality);
    while (dataUrl.length * 0.75 > 500 * 1024 && quality > 0.1) {
      quality -= 0.1;
      dataUrl = canvasRef.current.toDataURL('image/jpeg', quality);
    }
    
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => onCropComplete(blob, dataUrl, Math.round(blob.size / 1024)));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Crop className="w-5 h-5 text-blue-600"/> ছবি ক্রপ করুন</h3>
          <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5"/></button>
        </div>
        
        <div className="p-6 flex flex-col gap-6">
          {!img ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 rounded-xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <div className="bg-blue-100 p-4 rounded-full text-blue-600"><Upload className="w-8 h-8"/></div>
              <div className="text-center">
                <p className="font-bold text-slate-700">ক্লিক করে ছবি নির্বাচন করুন</p>
                <p className="text-sm text-slate-500 mt-1">Standard Size: 4:3 Aspect Ratio</p>
              </div>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFile} />
            </div>
          ) : (
            <>
              <div 
                className="w-full max-w-sm mx-auto aspect-[4/3] bg-slate-100 rounded-xl overflow-hidden cursor-move touch-none border border-slate-200 relative"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
              >
                <canvas ref={canvasRef} className="w-full h-full object-cover" />
                <div className="absolute inset-0 border border-white/50 pointer-events-none"></div>
              </div>
              
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                  <ZoomIn className="w-5 h-5 text-slate-400" />
                  <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} className="flex-1 accent-blue-600" />
                </div>
                <p className="text-center text-sm text-slate-500">ছবি টেনে ঠিক করুন (Pan to adjust)</p>
                <p className="text-center text-xs font-bold text-emerald-600 mt-2">ফাইনাল সাইজ: ~{fileSize} KB (Max 500KB)</p>
              </div>
            </>
          )}
        </div>
        
        {img && (
          <div className="p-4 border-t border-slate-100 flex gap-3">
            <button onClick={() => setImg(null)} className="flex-1 py-3 text-slate-600 bg-slate-100 font-bold rounded-xl hover:bg-slate-200">অন্য ছবি নিন</button>
            <button type="button" onClick={handleConfirm} className="flex-1 py-3 text-white bg-blue-600 font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">সেভ করুন</button>
          </div>
        )}
      </div>
    </div>
  );
}
