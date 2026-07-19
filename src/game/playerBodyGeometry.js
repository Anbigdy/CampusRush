export function anchorBodyGeometryToFoot(body, {
  previousPositionX,
  previousPositionY,
  centerX,
  bottom,
}) {
  body.position.set(
    centerX - body.width / 2,
    bottom - body.height,
  );

  const shapeShiftX = body.position.x - previousPositionX;
  const shapeShiftY = body.position.y - previousPositionY;
  [body.prev, body.prevFrame, body.autoFrame].forEach((historyPosition) => {
    historyPosition.x += shapeShiftX;
    historyPosition.y += shapeShiftY;
  });
  body.updateCenter();

  return { shapeShiftX, shapeShiftY };
}
