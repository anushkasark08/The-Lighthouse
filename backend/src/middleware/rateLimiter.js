
const store = new Map(); //{ timestamps: [], windowMs }

//Periodic Cleanup of inactive ip address
setInterval(()=>{
  for(const [key, entry] of store.entries()){
    const now = Date.now();
    const active = entry.timestamps.filter((ts)=>now-ts<entry.windowMs);
    if(active.length===0){
      store.delete(key);
    }
    else if(active.length!==entry.timestamps.length){
      store.set(key, {timestamps: active, windowMs: entry.windowMs})
    }
    
  }
}, 60000);

function rateLimiter(options = {}) {
  const windowMs = options.windowMs || 60 * 60 * 1000; 
  const max = options.max || 10; 

  return (req, res, next) => {
    try {
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      const key = `${ip}:${req.method}:${req.path}`;
      const now = Date.now();
      const entry = store.get(key) || {timestamps: [], windowMs};

      // prune old timestamps
      const recent = entry.timestamps.filter((ts) => now - ts < windowMs);
      recent.push(now);
      store.set(key, {timestamps: recent, windowMs});

      if (recent.length > max) {
        const retryAfter = Math.ceil((windowMs - (now - recent[0])) / 1000);
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({ success: false, error: `Too many requests. Try again in ${retryAfter} seconds.` });
      }

      next();
    } catch (err) {
      next();
    }
  };
}

module.exports = rateLimiter;
