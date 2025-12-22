let ioRef = null;

export function setIO(io) {
  ioRef = io;
}

export function getIO() {
  return ioRef;
}

