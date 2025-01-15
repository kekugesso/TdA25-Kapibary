const CreateMatrix = (x: number, y: number) =>
  Array.from({ length: y }, () => Array(x).fill(""));

export { CreateMatrix };
