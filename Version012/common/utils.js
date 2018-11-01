// Add zero in front of numbers < 10
export function zeroPadAndSplit(i, range) {
  i = i.toString();
  if (i.length < range) {
    i = (repeat("0", range - i.length) + i);
  }
  return i.split('');
}

function repeat(string, times) {
  let result = "";
  for (let i = 0; i < times; i++) {
    result += string;
  }
  return result;
}
