function useResponse(req, res, next) {
  res.response = (apiResponse) => {
    res.status(apiResponse.statusCode);
    res.json(apiResponse);
  };
  next();
}

module.exports = useResponse;
