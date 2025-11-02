import React from 'react';

interface SizeSelectorProps {
  selectedSizes: string[];
  onSizesChange: (sizes: string[]) => void;
}

const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];

const SizeSelector: React.FC<SizeSelectorProps> = ({
  selectedSizes,
  onSizesChange,
}) => {
  const handleSizeToggle = (size: string) => {
    let updatedSizes = [...selectedSizes];

    if (updatedSizes.includes(size)) {
      updatedSizes = updatedSizes.filter((s) => s !== size);
    } else {
      updatedSizes.push(size);
    }

    onSizesChange(updatedSizes);
  };

  return (
    <div className="flex flex-wrap gap-2 sm:gap-3">
      {AVAILABLE_SIZES.map((size) => (
        <button
          key={size}
          type="button"
          onClick={() => handleSizeToggle(size)}
          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded transition-all duration-200 border ${
            selectedSizes.includes(size)
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-slate-900 border-slate-300 hover:border-slate-400'
          }`}
        >
          {size}
        </button>
      ))}
    </div>
  );
};

export default SizeSelector;
