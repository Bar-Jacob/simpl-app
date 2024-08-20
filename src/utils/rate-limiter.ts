import rateLimit from "express-rate-limit";

export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message: "Too many requests, please try again later.",
  });
};
