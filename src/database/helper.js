const strikePricesArray = (underlyingValue) => {
  const tempArray = [];
  for (let i = 1; i <= 16; i++) {
    if (i <= 8) {
      const roundedNumber = underlyingValue - i * 100;
      const value = Math.ceil(roundedNumber / 100) * 100;
      tempArray.push(value);
    }
    if (i === 8) {
      tempArray.push(underlyingValue);
    }
    if (i > 8) {
      const roundedNumber = underlyingValue + (i - 8) * 100;
      const value = Math.ceil(roundedNumber / 100) * 100;
      tempArray.push(value);
    }
  }

  return tempArray;
};


const getOpenInterestSignal = (currData, oldData) => {
  if (
    currData.underlyingValue > oldData.underlyingValue &&
    currData.openInterest > oldData.openInterest
  ) {
    return "LONG BUILDUP";
  } else if (
    currData.underlyingValue < oldData.underlyingValue &&
    currData.openInterest > oldData.openInterest
  ) {
    return "SHORT BUILDUP";
  } else if (
    currData.underlyingValue < oldData.underlyingValue &&
    currData.openInterest < oldData.openInterest
  ) {
    return "LONG UNWINDING";
  } else if (
    currData.underlyingValue > oldData.underlyingValue &&
    currData.openInterest < oldData.openInterest
  ) {
    return "SHORT COVERING";
  } else {
    return "NA";
  }
};

export { strikePricesArray, getOpenInterestSignal };
