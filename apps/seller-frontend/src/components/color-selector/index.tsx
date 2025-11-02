'use client';

import { Plus, X } from 'lucide-react';
import React, { useState, useCallback, useEffect } from 'react';

type Props = {
  onColorsChange?: (colors: string[]) => void;
  defaultColors?: string[];
  maxColors?: number;
  allowDuplicates?: boolean;
};

const ColorSelector = ({
  onColorsChange,
  defaultColors = [],
  maxColors = 10,
  allowDuplicates = false,
}: Props) => {
  // Validate and normalize default colors
  const normalizeColor = (color: string): string => {
    try {
      // Handle various color formats
      if (!color.startsWith('#')) {
        color = '#' + color;
      }
      // Validate hex color format
      if (!/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)) {
        return '#000000'; // Default to black if invalid
      }
      return color.toUpperCase();
    } catch {
      return '#000000';
    }
  };

  const validDefaultColors = defaultColors
    .map(normalizeColor)
    .filter((color, index, self) => self.indexOf(color) === index); // Remove duplicates from defaults

  const [colors, setColors] = useState<string[]>(validDefaultColors);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [hue, setHue] = useState<number>(0);
  const [saturation, setSaturation] = useState<number>(100);
  const [lightness, setLightness] = useState<number>(50);
  const [tempR, setTempR] = useState<number>(255);
  const [tempG, setTempG] = useState<number>(0);
  const [tempB, setTempB] = useState<number>(0);
  const [inputError, setInputError] = useState<string>('');

  const predefinedColors = [
    '#FFFFFF', // White
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
  ];

  // Helper function to convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
        .toUpperCase()
    );
  };

  // Add color function
  const addColorToList = useCallback(
    (color: string) => {
      const normalizedColor = normalizeColor(color);

      // Check if already exists
      const colorExists = colors.includes(normalizedColor);
      if (colorExists && !allowDuplicates) {
        setInputError(`Color ${normalizedColor} is already selected`);
        setTimeout(() => setInputError(''), 3000);
        return;
      }

      // Check max colors limit
      if (colors.length >= maxColors) {
        setInputError(`Maximum ${maxColors} colors allowed`);
        setTimeout(() => setInputError(''), 3000);
        return;
      }

      const newColors = [...colors, normalizedColor];
      setColors(newColors);
      setInputError('');
      setShowPicker(false);
      onColorsChange?.(newColors);
    },
    [colors, onColorsChange, maxColors, allowDuplicates]
  );

  const removeColor = useCallback(
    (index: number) => {
      if (index < 0 || index >= colors.length) {
        console.warn(`Invalid color index: ${index}`);
        return;
      }

      const newColors = colors.filter((_, i) => i !== index);
      setColors(newColors);
      setInputError('');
      onColorsChange?.(newColors);
    },
    [colors, onColorsChange]
  );

  const handleAddFromPicker = () => {
    const currentColor = rgbToHex(tempR, tempG, tempB);
    addColorToList(currentColor);
  };

  // Sync external defaultColors changes
  useEffect(() => {
    if (defaultColors && defaultColors.length > 0) {
      const normalizedDefaults = defaultColors
        .map(normalizeColor)
        .filter((color, index, self) => self.indexOf(color) === index);

      if (JSON.stringify(normalizedDefaults) !== JSON.stringify(colors)) {
        setColors(normalizedDefaults);
        onColorsChange?.(normalizedDefaults);
      }
    }
  }, []);

  const canAddMore = colors.length < maxColors;

  return (
    <div className="w-full space-y-4">
      {/* Predefined Colors + Picker in same row */}
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          {predefinedColors.map((color) => {
            const isSelected = colors.includes(color);
            return (
              <button
                key={color}
                type="button"
                onClick={() => addColorToList(color)}
                disabled={!canAddMore && !isSelected}
                className={`w-8 h-8 rounded border-2 transition duration-200 flex items-center justify-center ${
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-300'
                    : 'border-slate-300 hover:border-slate-400 hover:scale-110'
                } ${!canAddMore && !isSelected ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ backgroundColor: color }}
                title={`${color}${isSelected ? ' (selected)' : ''}`}
                aria-label={`Select color ${color}`}
              />
            );
          })}

          {/* Selected Custom Colors */}
          {colors.length > 0 && (
            <>
              {colors.map((color, index) => {
                // Only show custom colors (not in predefined list)
                if (!predefinedColors.includes(color)) {
                  return (
                    <div
                      key={`${color}-${index}`}
                      className="relative group"
                      role="button"
                      tabIndex={0}
                      aria-label={`Color ${color} at position ${index + 1}`}
                    >
                      <div
                        className="w-8 h-8 rounded border-2 border-slate-300 transition shadow-sm hover:shadow-md cursor-pointer"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-200 shadow-md hover:bg-red-600"
                        title="Remove color"
                        aria-label={`Remove ${color} from selection`}
                      >
                        <X size={10} />
                      </button>
                    </div>
                  );
                }
                return null;
              })}
            </>
          )}

          {/* Custom Color Picker Button */}
          {canAddMore && (
            <button
              type="button"
              onClick={() => setShowPicker(!showPicker)}
              className="w-8 h-8 rounded border-2 border-slate-300 bg-white flex items-center justify-center hover:border-slate-400 hover:bg-slate-50 transition duration-200 cursor-pointer"
              title="Pick custom color"
              aria-label="Open custom color picker"
            >
              <Plus size={16} className="text-slate-600" />
            </button>
          )}
        </div>

        {/* Color Count */}
        <div className="text-xs text-slate-500 font-medium mt-2">
          {colors.length} / {maxColors} colors selected
        </div>
      </div>

      {/* Color Picker - inline with color row */}
      {showPicker && canAddMore && (
        <div className="border border-slate-300 rounded-lg p-4 bg-white shadow-lg space-y-3">
          {/* Large Color Gradient Area */}
          <div className="space-y-2">
            <div
              className="w-full h-48 rounded border border-slate-300 cursor-crosshair relative"
              style={{
                background: `linear-gradient(90deg, rgb(255, 255, 255), hsl(${hue}, 100%, 50%))`,
              }}
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const satPercent = (x / rect.width) * 100;
                const lightPercent = 100 - (y / rect.height) * 100;
                setSaturation(satPercent);
                setLightness(lightPercent);

                // Convert HSL to RGB
                const hslToRgb = (
                  h: number,
                  s: number,
                  l: number
                ): { r: number; g: number; b: number } => {
                  s /= 100;
                  l /= 100;
                  const k = (n: number) =>
                    (n + h / 30) % 12;
                  const a =
                    s * Math.min(l, 1 - l);
                  const f = (n: number) =>
                    l -
                    a *
                      Math.max(
                        -1,
                        Math.min(
                          k(n) - 3,
                          Math.min(9 - k(n), 1)
                        )
                      );
                  return {
                    r: Math.round(255 * f(0)),
                    g: Math.round(255 * f(8)),
                    b: Math.round(255 * f(4)),
                  };
                };

                const rgb = hslToRgb(hue, satPercent, lightPercent);
                setTempR(rgb.r);
                setTempG(rgb.g);
                setTempB(rgb.b);
              }}
            >
              {/* Brightness indicator line */}
              <div
                className="absolute w-1 h-1 border-2 border-white rounded-full pointer-events-none shadow-md"
                style={{
                  left: `${saturation}%`,
                  top: `${100 - lightness}%`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            </div>
          </div>

          {/* Hue Spectrum Slider */}
          <div className="space-y-1">
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => setHue(Number(e.target.value))}
              className="w-full h-6 rounded appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  hsl(0, 100%, 50%),
                  hsl(60, 100%, 50%),
                  hsl(120, 100%, 50%),
                  hsl(180, 100%, 50%),
                  hsl(240, 100%, 50%),
                  hsl(300, 100%, 50%),
                  hsl(360, 100%, 50%))`,
              }}
            />
          </div>

          {/* RGB Value Inputs */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-slate-600 font-medium mb-1 block">
                R
              </label>
              <input
                type="number"
                min="0"
                max="255"
                value={tempR}
                onChange={(e) => {
                  const value = Math.min(
                    255,
                    Math.max(0, Number(e.target.value))
                  );
                  setTempR(value);
                }}
                className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-center"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium mb-1 block">
                G
              </label>
              <input
                type="number"
                min="0"
                max="255"
                value={tempG}
                onChange={(e) => {
                  const value = Math.min(
                    255,
                    Math.max(0, Number(e.target.value))
                  );
                  setTempG(value);
                }}
                className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-center"
              />
            </div>
            <div>
              <label className="text-xs text-slate-600 font-medium mb-1 block">
                B
              </label>
              <input
                type="number"
                min="0"
                max="255"
                value={tempB}
                onChange={(e) => {
                  const value = Math.min(
                    255,
                    Math.max(0, Number(e.target.value))
                  );
                  setTempB(value);
                }}
                className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-center"
              />
            </div>
          </div>

          {/* Color Preview and Add Button */}
          <div className="flex gap-2 items-center">
            <div
              className="w-12 h-12 rounded border-2 border-slate-300 shadow-sm flex-shrink-0"
              style={{
                backgroundColor: rgbToHex(tempR, tempG, tempB),
              }}
            />
            <button
              type="button"
              onClick={handleAddFromPicker}
              className="flex-1 px-3 py-2 bg-blue-600 text-white rounded font-medium text-sm hover:bg-blue-700 transition"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {inputError && (
        <div className="text-sm text-red-600 font-medium animate-pulse">
          {inputError}
        </div>
      )}

      {/* Empty State */}
      {colors.length === 0 && (
        <div className="text-sm text-slate-400 italic text-center py-2">
          Select colors from predefined options or pick a custom color
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
