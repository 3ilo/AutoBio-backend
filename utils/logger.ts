const info = (msg: String) => {
  console.log(msg);
};

const error = (msg: String) => {
  console.error(msg);
};

module.exports = {
  info,
  error
};
