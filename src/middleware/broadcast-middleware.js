export default function createBroadcastMiddleware() {
  const channel = new BroadcastChannel('redux');
  const uuid = Math.random().toString(36).substring(2, 15);

  return (store) => {
    // When we start up, we want to get the latest state from the other tabs
    channel.postMessage(JSON.stringify({
      uuid,
      type: 'GET_STATE',
    }));

    channel.onmessage = (event) => {
      const action = JSON.parse(event.data);

      if (action.uuid !== uuid) {
        if (action.type === 'GET_STATE') {
          channel.postMessage(JSON.stringify({
            uuid,
            type: 'SET_STATE',
            payload: store.getState(),
          }));

          return;
        }

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
