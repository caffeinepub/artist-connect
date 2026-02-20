// File validation utilities for image uploads

export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface FileValidationResult {
  file: File;
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: JPEG, PNG, GIF, WebP`
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
    };
  }

  return { valid: true };
}

export function validateImageBatch(files: File[]): {
  valid: FileValidationResult[];
  invalid: FileValidationResult[];
} {
  const valid: FileValidationResult[] = [];
  const invalid: FileValidationResult[] = [];

  files.forEach(file => {
    const result = validateImageFile(file);
    if (result.valid) {
      valid.push({ file, valid: true });
    } else {
      invalid.push({ file, valid: false, error: result.error });
    }
  });

  return { valid, invalid };
}
