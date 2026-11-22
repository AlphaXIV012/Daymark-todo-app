// Works with Express 4 and 5 by forwarding rejected promises to next(error).
export function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}
