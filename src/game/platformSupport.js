export const SUPPORT_SURFACE_MISS_GRACE_FRAMES = 2;

function distanceToSurface(candidate, playerFeetY) {
  return Math.abs(playerFeetY - candidate.y);
}

export function chooseSurfaceCandidate(
  candidates,
  playerFeetY,
  preferredContact = null,
) {
  if (!candidates.length) {
    return null;
  }

  if (preferredContact) {
    const sameSegment = candidates.find(
      (candidate) =>
        candidate.route.id === preferredContact.routeId &&
        candidate.segmentIndex === preferredContact.segmentIndex,
    );
    if (sameSegment) {
      return sameSegment;
    }

    const sameRoute = candidates
      .filter((candidate) => candidate.route.id === preferredContact.routeId)
      .sort(
        (a, b) =>
          distanceToSurface(a, playerFeetY) -
          distanceToSurface(b, playerFeetY),
      );
    if (sameRoute.length) {
      return sameRoute[0];
    }
  }

  return [...candidates].sort(
    (a, b) =>
      distanceToSurface(a, playerFeetY) -
      distanceToSurface(b, playerFeetY),
  )[0];
}

export function canFollowSupportedSurface({
  wasSupported,
  previousContact,
  candidate,
  velocityY,
  currentFeetY,
  surfaceY,
  maxDistance,
}) {
  return Boolean(
    wasSupported &&
      previousContact?.routeId === candidate?.route.id &&
      velocityY >= -1 &&
      Math.abs(currentFeetY - surfaceY) <= maxDistance,
  );
}

export function canBridgeSurfaceMiss({
  wasSupported,
  velocityY,
  missFrames,
}) {
  return Boolean(
    wasSupported &&
      velocityY >= -1 &&
      missFrames < SUPPORT_SURFACE_MISS_GRACE_FRAMES,
  );
}
