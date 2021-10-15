let removeDuplicates = (oldArray) => {
  let newArray = [...new Set(oldArray)];
  return newArray;
};

// export functions
module.exports = { removeDuplicates };
