import { SpinePlayer } from '@esotericsoftware/spine-player';

export const readAsDataURI = (file, mimeType) => 
  new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      const result = e.target.result;
      const byteArray = typeof result === 'string' 
        ? new TextEncoder().encode(result)
        : new Uint8Array(result);
      let binary = '';
      byteArray.forEach(byte => binary += String.fromCharCode(byte));
      resolve(`data:${mimeType};base64,${btoa(binary)}`);
    };
    if (file.type.startsWith('text/')) 
      reader.readAsText(file);
    else 
      reader.readAsArrayBuffer(file);
  });

export function initDragDrop(dropArea) {
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
  });

  ['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => 
      dropArea.classList.add('highlight'), false
    );
  });

  ['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, () => 
      dropArea.classList.remove('highlight'), false
    );
  });

  dropArea.addEventListener('drop', handleDrop);
}

async function handleDrop(e) {
  const dt = e.dataTransfer;
  const items = [...dt.items];
  // 文件处理逻辑迁移...
}
