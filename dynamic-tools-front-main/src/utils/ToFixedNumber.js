const ToFixedNumber = (num) => {
  if (Number.isInteger(num)) {
    return num;
  }

  return num?.toFixed(3);
};

export default ToFixedNumber;
