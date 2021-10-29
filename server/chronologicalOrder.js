

let chronologicalOrder = (oldArray) => {
  let newArray = oldArray.slice().sort((a, b) => b.objectDate - a.objectDate)
  return newArray;
};

// export functions
module.exports = { chronologicalOrder };
