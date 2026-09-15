export const subscribeToUpdates = (cb) => { const i = setInterval(() => cb({ type: 'STATUS_CHANGE', ts: new Date().toISOString() }), 30000); return () => clearInterval(i); };
