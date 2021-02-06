// Add zero in front of numbers < 10
export function zeroPadAndSplit(numToPad, range) {
  let numAsString = numToPad.toString();
  if (numAsString.length < range) {
    numAsString = repeat("0", range - numAsString.length) + numAsString;
  }
  return numAsString.split("");
}

function repeat(padChar, times) {
  let padding = "";
  for (let i = 0; i < times; i++) {
    padding += padChar;
  }
  return padding;
}

const METERS_TO_FEET_RATIO = 3.28084 * 10; // Times 10 to include the one value after the point
const FEET_TO_MILES_RATIO = 5280;
const METERS_TO_KM_RATIO = 100;

export function getDistance(distance, unitType) {
  // Check user-settings for distance-units (metric or us)
  if (unitType === "us") {
    distance *= METERS_TO_FEET_RATIO;
    return zeroPadAndSplit(Math.floor(distance / FEET_TO_MILES_RATIO), 3);
  }
  return zeroPadAndSplit(Math.floor(distance / METERS_TO_KM_RATIO), 3);
}
