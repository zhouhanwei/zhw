const createResponse = (status, message, data = null) => {
  return {
    code: status === 'success' ? 200 : 500,
    status,
    message,
    data,
  };
};

module.exports = { createResponse };