import { GrblController } from 'grbl-control';

const INTERFACE_NAME = 'grbl';
const DEFAULT_FEED_RATE = 1000;

export default function createGrblMiddleware() {
  return (store) => {
    const grbl = new GrblController();

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
            grbl
              .disconnect()
              .then(() => store.dispatch({ type: 'CNC_DISCONNECTED' }));
          }
          break;
        }
        case 'CNC_CONNECT':
          if (!grbl.connected) {
            grbl
              .connect()
              .then(() => store.dispatch({ type: 'CNC_CONNECTED' }));
          }
          break;
        case 'CNC_DISCONNECT':
          if (grbl.connected) {
            grbl
              .disconnect()
              .then(() => store.dispatch({ type: 'CNC_DISCONNECTED' }));
          }
          break;
        case 'CNC_MOVETO': {
          const { x, y } = action.payload;

          const { feedRate: currentFeedRate } = store.getState().cnc;
          const feedRate = currentFeedRate || DEFAULT_FEED_RATE;

          grbl
            .jog(`G21G90X${x.toFixed(3)}Y${y.toFixed(3)} F${feedRate.toFixed(3)}`)
            .then(() => store.dispatch({ type: 'CNC_MOVED', payload: { x, y } }));
          break;
        }
        case 'CNC_SET_FEED_RATE': {
          const feedRateMmPerMin = action.payload;
          store.dispatch({ type: 'CNC_FEED_RATE_SET', payload: feedRateMmPerMin });
          break;
        }
        case 'CNC_JOG': {
          const { x: dx, y: dy } = action.payload;
          const { feedRate: currentFeedRate, lastCommandedPos } = store.getState().cnc;
          const { x, y } = lastCommandedPos || { x: 0, y: 0 };
          const feedRate = currentFeedRate || DEFAULT_FEED_RATE;

          grbl
            .jog(`G21G91X${dx.toFixed(3)}Y${dy.toFixed(3)} F${feedRate.toFixed(3)}`)
            .then(() => store.dispatch({ type: 'CNC_MOVED', payload: { x: x + dx, y: y + dy } }));

          break;
        }
        default:
          break;
      }

      return next(action);
    };
  };
}
