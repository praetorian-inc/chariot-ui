export function isArrayBufferEmpty(arrayBuffer: ArrayBuffer) {
  // Convert the ArrayBuffer to a Uint8Array
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert the Uint8Array to a string
  const string = new TextDecoder().decode(uint8Array);

  // Check if the string is empty
  return string === '' || string === `""`;
}
