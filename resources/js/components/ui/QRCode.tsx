import React, { useEffect, useRef } from 'react';
import { Download, Share2, Copy, Check } from 'lucide-react';

interface QRCodeProps {
  value: string;
  size?: number;
  title?: string;
  showActions?: boolean;
  className?: string;
}

const QRCode: React.FC<QRCodeProps> = ({
  value,
  size = 200,
  title,
  showActions = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Simple QR code generation using canvas
    // In production, use a library like 'qrcode' or 'qr.js'
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // Generate QR code using Google Charts API (simple solution)
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
    };
    img.src = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(value)}&choe=UTF-8`;
  }, [value, size]);

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `${title || 'qrcode'}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title || 'Share',
          url: value,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className={`inline-block ${className}`}>
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="block"
        />

        {title && (
          <p className="text-center text-sm font-medium text-gray-700 mt-3">
            {title}
          </p>
        )}

        {showActions && (
          <div className="flex items-center justify-center gap-2 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={downloadQR}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Download QR Code"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={copyLink}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title={copied ? 'Copied!' : 'Copy Link'}
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={shareQR}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCode;
