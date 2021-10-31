let removeDuplicates = (list) => {
  // let newList = [...new Set(list)];
  
  let newList = [];
  let uniqueEvent = {};


  for (let i = 0; i < list.length; i++) {
    let eventURL = list[i].linkToOriginalPost;
    if (eventURL.slice(-1) !== "/") {
      eventURL += "/";
    }
    uniqueEvent[eventURL] = list[i];
  }
  // console.log(uniqueEvent);
  for (let i in uniqueEvent) {
    newList.push(uniqueEvent[i]);
  }
  
  return newList;
};

// export functions
module.exports = { removeDuplicates };
