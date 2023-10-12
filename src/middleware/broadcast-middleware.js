export default function createBroadcastMiddleware() {
  const channel = new BroadcastChannel('redux');
  const uuid = Math.random().toString(36).substring(2, 15);

  return (store) => {
    channel.onmessage = (event) => {
      const action = JSON.parse(event.data);

      if (action.uuid !== uuid) {
        console.log('BroadcastMiddleware received action', action);
        store.dispatch(action);
      }
    };

    return (next) => (action) => {
      if (!('uuid' in action)) {
        channel.postMessage(JSON.stringify({
          uuid,
          ...action,
        }));

        console.log('BroadcastMiddleware sent action', action);
      }

      return next(action);
    };
  };
}
