const generatePosition = (min, max) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export { generatePosition };
