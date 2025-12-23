
/**
 * Compresses an image file using Canvas.
 * Returns both a base64 string for preview and a Blob for efficient network upload.
 */
export async function compressImage(
  file: File, 
  maxWidth = 1000, 
  quality = 0.6 // Slightly lower quality for significantly smaller size
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (maxWidth / width) * height;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Preview data
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5);
        
        // Binary blob for upload
        canvas.toBlob((blob) => {
          if (blob) {
            resolve({ dataUrl, blob });
          } else {
            reject(new Error("Blob creation failed"));
          }
        }, 'image/jpeg', quality);
      };
      img.onerror = () => reject(new Error("Image loading failed"));
    };
    reader.onerror = () => reject(new Error("File reading failed"));
  });
}
