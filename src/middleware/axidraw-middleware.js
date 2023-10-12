import { AxiDraw } from '../axidraw';

export default function createAxiDrawMiddleware() {
  return (store) => {
    const axidraw = new AxiDraw();

    return (next) => (action) => {
      switch (action.type) {
        case 'CNC_CONNECT':
          // if (!axidraw.connected) {
          //   axidraw
          //     .connect()
          //     .then(() => axidraw.setSpeed(2000 / 60))
          //     .then(() => store.dispatch({ type: 'CNC_CONNECTED' }));
          // }
          store.dispatch({ type: 'CNC_CONNECTED' });
          break;
        case 'CNC_MOVETO': {
          const { x, y } = action.payload;
          // axidraw.moveTo(x, y).then();
          store.dispatch({ type: 'CNC_MOVED', payload: { x, y } });
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
