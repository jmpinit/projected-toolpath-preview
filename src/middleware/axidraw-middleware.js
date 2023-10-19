import { AxiDraw } from '../axidraw';

const INTERFACE_NAME = 'axidraw';

export default function createAxiDrawMiddleware() {
  return (store) => {
    const axidraw = new AxiDraw();

    return (next) => (action) => {
      // Only activate if this interface is selected
      const { interfaceType } = store.getState().cnc;
      if (interfaceType !== INTERFACE_NAME) {
        return next(action);
      }

      switch (action.type) {
        case 'CNC_SET_INTERFACE_TYPE': {
          // Disconnect when switching away

          const { connected } = store.getState().cnc;

          if (action.payload !== INTERFACE_NAME && connected) {
            axidraw
              .disconnect()
              .then(() => store.dispatch({ type: 'CNC_DISCONNECTED' }));
          }
          break;
        }
        case 'CNC_CONNECT': {
          const { connected } = store.getState().cnc;

          if (!connected) {
            const { feedRate } = store.getState().cnc;

            axidraw
              .connect()
              .then(() => axidraw.setSpeed(feedRate / 60))
              .then(() => store.dispatch({ type: 'CNC_CONNECTED' }));
          }
          break;
        }
        case 'CNC_DISCONNECT': {
          const { connected } = store.getState().cnc;

          if (connected) {
            axidraw
              .disconnect()
              .then(() => store.dispatch({ type: 'CNC_DISCONNECTED' }));
          }
          break;
        }
        case 'CNC_MOVETO': {
          const { x, y } = action.payload;
          axidraw
            .moveTo(x, y)
            .then(() => store.dispatch({ type: 'CNC_MOVED', payload: { x, y } }));
          break;
        }
        case 'CNC_SET_FEED_RATE': {
          const feedRateMmPerMin = action.payload;
          axidraw.setSpeed(feedRateMmPerMin / 60);
          store.dispatch({ type: 'CNC_FEED_RATE_SET', payload: feedRateMmPerMin });
          break;
        }
        case 'CNC_JOG': {
          const { x: dx, y: dy } = action.payload;

          (async () => {
            const pos = await axidraw.currentPosition();

            // Most machines will have the origin in the lower left of the bed,
            // but the AxiDraw puts origin in the upper left
            const x = pos.x + dx;
            const y = pos.y - dy;
            await axidraw.moveTo(x, y);

            store.dispatch({ type: 'CNC_MOVED', payload: { x, y } });
          })();
          break;
        }
        default:
          break;
      }

      return next(action);
    };
  };
}
