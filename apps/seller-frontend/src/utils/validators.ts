export const validateSlug = (value: string): string | true => {
  if (!value) {
    return 'Slug is required';
  }
  if (value.length > 50) {
    return 'Slug must be max 50 characters';
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    return 'Slug can only contain lowercase letters, numbers, and hyphens';
  }
  return true;
};

export const validateVideoUrl = (value: string): string | true => {
  if (!value) {
    return true;
  }

  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
  const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;

  if (!youtubeRegex.test(value) && !vimeoRegex.test(value)) {
    return 'Please enter a valid YouTube or Vimeo URL';
  }
  return true;
};

export const validatePrice = (value: string): string | true => {
  if (!value) {
    return 'Price is required';
  }
  const price = parseFloat(value);
  if (isNaN(price) || price < 0) {
    return 'Price must be a valid positive number';
  }
  return true;
};
export const validateStock = (value: string): string | true => {
  if (!value) {
    return 'Stock is required';
  }
  const stock = parseFloat(value);
  if (!Number.isInteger(stock) || stock < 0) {
    return 'Stock must be a valid positive integer';
  }
  return true;
};
