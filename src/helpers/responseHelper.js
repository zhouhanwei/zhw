const createResponse = (status, message, data = null) => {
  return {
    code: status === 'success' ? 200 : 500,
    status,
    message,
    data,
  };
};

const createListResponse = (status, message, data = null) => {
  const { count, rows } = data;
  return {
    code: status === 'success' ? 200 : 500,
    status,
    message,
    data: rows,
    total: count,
  };
};

module.exports = { createResponse, createListResponse };