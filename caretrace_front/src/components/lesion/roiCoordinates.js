// MiniViewer / MeasurementView가 공유하는 좌표 변환 순수 함수 모음.
// 화면에 렌더링된 <img>의 표시 크기와 DICOM 원본 픽셀 크기가 다를 수 있으므로
// naturalWidth/naturalHeight(원본) 대비 clientWidth/clientHeight(표시) 비율로 환산한다.

// canvas의 내부 해상도(width/height 속성)를 이미지의 "표시" 크기와 맞춘다.
// CSS 크기만 바꾸고 내부 해상도를 그대로 두면 캔버스가 늘어나 보이는 흔한 버그가 생긴다.
export function resizeCanvasToImage(canvas, img) {
  canvas.width = img.clientWidth;
  canvas.height = img.clientHeight;
  canvas.style.width = `${img.clientWidth}px`;
  canvas.style.height = `${img.clientHeight}px`;
}

// 캔버스(=이미지 표시) 좌표 -> 실제 DICOM 픽셀 좌표
export function toDicomPoint(canvasX, canvasY, img) {
  const scaleX = img.naturalWidth / img.clientWidth;
  const scaleY = img.naturalHeight / img.clientHeight;

  return {
    x: canvasX * scaleX,
    y: canvasY * scaleY,
  };
}

// 실제 DICOM 픽셀 좌표 -> 캔버스(=이미지 표시) 좌표
export function toDisplayPoint(dicomX, dicomY, img) {
  const scaleX = img.clientWidth / img.naturalWidth;
  const scaleY = img.clientHeight / img.naturalHeight;

  return {
    x: dicomX * scaleX,
    y: dicomY * scaleY,
  };
}

// DICOM PixelSpacing 태그는 "row\\column" 순서(Y, X 순)로 내려온다.
// X, Y 순서로 착각하기 쉬운 지점이므로 별도 유틸로 분리했다.
export function parsePixelSpacing(pixelSpacingTagValue) {
  if (!pixelSpacingTagValue) {
    return { x: null, y: null };
  }

  const parts = String(pixelSpacingTagValue).split("\\");
  if (parts.length < 2) {
    return { x: null, y: null };
  }

  const rowSpacing = Number(parts[0]); // Y 방향(세로) 간격
  const columnSpacing = Number(parts[1]); // X 방향(가로) 간격

  return {
    x: Number.isFinite(columnSpacing) ? columnSpacing : null,
    y: Number.isFinite(rowSpacing) ? rowSpacing : null,
  };
}
