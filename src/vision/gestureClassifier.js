
/**
 * MediaPipe hand landmarks:
 * 0 = wrist
 * 4 = thumb tip
 * 8 = index tip
 * 12 = middle tip
 * 16 = ring tip
 * 20 = pinky tip
 *
 * Each finger also has intermediate joints.
 */

function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function fingerExtended(landmarks, tip, pip, mcp) {
  const wrist = landmarks[0];

  // Compare tip and joints relative to the wrist.
  // This is a simple starting rule, not a universal
  // solution for every hand orientation.
  const tipDistance = distance(landmarks[tip], wrist);
  const pipDistance = distance(landmarks[pip], wrist);
  const mcpDistance = distance(landmarks[mcp], wrist);

  return (
    tipDistance > pipDistance * 1.08 &&
    tipDistance > mcpDistance * 1.2
  );
}

export function classifyGesture(landmarks) {
  if (!landmarks || landmarks.length !== 21) {
    return {
      gesture: "Unknown",
      confidence: 0,
      reason: "No hand detected"
    };
  }

  const index = fingerExtended(landmarks, 8, 6, 5);
  const middle = fingerExtended(landmarks, 12, 10, 9);
  const ring = fingerExtended(landmarks, 16, 14, 13);
  const pinky = fingerExtended(landmarks, 20, 18, 17);

  const extendedCount = [index, middle, ring, pinky]
    .filter(Boolean).length;

  // Start with the three basic configurations.
  if (extendedCount >= 4) {
    return {
      gesture: "Paper",
      confidence: 0.85,
      reason: "Four fingers extended"
    };
  }

  if (index && middle && !ring && !pinky) {
    return {
      gesture: "Scissors",
      confidence: 0.85,
      reason: "Index and middle fingers extended"
    };
  }

  if (extendedCount === 0) {
    return {
      gesture: "Rock",
      confidence: 0.75,
      reason: "Four fingers appear curled"
    };
  }

  return {
    gesture: "Unknown",
    confidence: 0,
    reason: "Ambiguous hand pose"
  };
}
