import { useState, useMemo, useCallback } from "react";
import { Loader2 } from "lucide-react";

interface Props {
  imageUrl: string | null;
  onClose: () => void;
  onApply?: (enhancedUrl: string) => void;
}

const ImageEnhancementModal = ({ imageUrl, onClose, onApply }: Props) => {
  const [selectedOptimization, setSelectedOptimization] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const buildTransformUrl = useCallback(
    (baseUrl: string, transformation: string): string => {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}tr=${transformation}`;
    },
    []
  );

  const optimizations = useMemo(
    () => [
      { id: 'bgremove', label: 'Remove Background', transform: 'e-bgremove', icon: '🎨' },
      { id: 'retouch', label: 'Retouch', transform: 'e-retouch-value:3', icon: '✨' },
      { id: 'upscale', label: 'Upscale', transform: 'e-upscale', icon: '📈' },
      { id: 'crop', label: 'Smart Crop', transform: 'fo-auto:crop-smart', icon: '✂️' }
    ],
    []
  );

  if (!imageUrl) return null;

  const handleApply = () => {
    if (selectedOptimization && onApply) {
      const enhancedUrl = buildTransformUrl(imageUrl, selectedOptimization);
      onApply(enhancedUrl);
    }
    onClose();
  };

  const handleButtonClick = useCallback(
    (transform: string) => {
      setIsLoading(true);
      setSelectedOptimization(transform);
    },
    []
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-semibold text-slate-900 mb-4">Enhance Image</h2>

        <div className="mb-6 rounded-lg overflow-hidden bg-slate-100 relative flex items-center justify-center min-h-96">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
              <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
          )}
          <img
            src={selectedOptimization ? buildTransformUrl(imageUrl, selectedOptimization) : imageUrl}
            alt="Preview"
            className="w-full h-auto object-cover max-h-96"
            onLoadStart={() => setIsLoading(true)}
            onLoad={() => setIsLoading(false)}
            onError={() => setIsLoading(false)}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {optimizations.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => handleButtonClick(opt.transform)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition ${
                selectedOptimization === opt.transform
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-gray-50'
              }`}
            >
              <span className="text-2xl">{opt.icon}</span>
              <span className="text-xs font-medium text-center">{opt.label}</span>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 bg-blue-500 text-white rounded-lg py-2 font-semibold hover:bg-blue-600 transition"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-200 text-slate-900 rounded-lg py-2 font-semibold hover:bg-gray-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageEnhancementModal;