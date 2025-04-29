// spinePreview.js
import { SpinePlayer } from '@esotericsoftware/spine-player';

const readAsDataURI = (file, mimeType) => 
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

export async function handleFiles(items) {
  const fileMap = new Map()
  // 按文件类型分组存储
  const addToMap = (ext, file) => {
    if (!fileMap.has(ext)) fileMap.set(ext, []);
    fileMap.get(ext).push(file);
  };

  const processEntry = async (entry) => {
    if (entry.isFile) {
      const file = await new Promise((res) => entry.file(res))
      const ext = file.name.split(".").pop()
      console.log("Collected file:", file.name)
      addToMap(ext, file)
    } else if (entry.isDirectory) {
      const dirReader = entry.createReader()
      const entries = await new Promise((res) => dirReader.readEntries(res))
      for (const subEntry of entries) await processEntry(subEntry)
    }
  }

  for (const item of items) {
    const entry = item.webkitGetAsEntry && item.webkitGetAsEntry()
    if (entry) await processEntry(entry)
  }

  // 支持JSON和二进制格式
if (fileMap.has("json") || fileMap.has("skel")) {
  const ext = fileMap.has("json") ? "json" : "skel";
  const file = fileMap.get(ext)[0];
  const reader = new FileReader();
  
  reader.onload = async (event) => {
    const skeletonData = event.target.result;
    await Promise.all([
      ...(fileMap.get('atlas') || []).map(f => readAsDataURI(f, 'text/plain')),
      ...(fileMap.get('png') || []).map(f => readAsDataURI(f, 'image/png'))
    ]);
    parseAndRenderSpineFile(skeletonData, fileMap, ext);
  };
  
  if (ext === 'json') {
    reader.readAsText(file);
  } else {
    reader.readAsArrayBuffer(file);
  }
}
}
// 导出解析渲染函数
 export async function parseAndRenderSpineFile(content, fileMap, ext) {
  // 创建Blob URL映射

  const rawDataURIs = {
    [`${fileMap.get(ext)[0].name}`]: ext === 'json' 
      ? await readAsDataURI(fileMap.get(ext)[0], 'application/json')
      : await readAsDataURI(fileMap.get(ext)[0], 'application/octet-stream'),
    ...(fileMap.has('atlas') ? { [fileMap.get('atlas')[0].name]: await readAsDataURI(fileMap.get('atlas')[0], 'text/plain') } : {}),
    ...Object.fromEntries(
        await Promise.all(
          Array.from(fileMap.get('png') || [])
            .map(async (file) => [file.name, await readAsDataURI(file, 'image/png')])
        )
      )
  };

  const config = {
    skeleton: fileMap.get(ext)[0].name,
    atlas: fileMap.get('atlas')[0].name,
    premultipliedAlpha: fileMap.has('atlas') ? false : true,
    debug: { bones: false, regions: false },
    rawDataURIs: rawDataURIs,
    format: ext === 'skel' ? 'binary' : 'json',
    success: (player) => {
     
    }
  };

  // 初始化Spine播放器
  new SpinePlayer('player-container', config);
}
