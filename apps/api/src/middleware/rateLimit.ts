// Rate limiting middleware
const requestLimits = new Map<string, number[]>();

export const rateLimit = (req: any, res: any, next: any) => {
  const ip = req.ip;
  const now = Date.now();
  const oneMinuteAgo = now - 60000;

  if (!requestLimits.has(ip)) {
    requestLimits.set(ip, []);
  }

  const times = requestLimits.get(ip)!.filter(time => time > oneMinuteAgo);

  if (times.length >= 100) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  times.push(now);
  requestLimits.set(ip, times);
  next();
};
