

let chronologicalOrder = (array) => {
  array.sort((a, b) => {
    return new Date(a.dateObject) - new Date(b.dateObject);
  })
  return array;
};

// export functions
module.exports = { chronologicalOrder };
