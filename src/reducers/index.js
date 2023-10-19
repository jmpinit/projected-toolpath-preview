import { combineReducers } from 'redux';
import appReducer from './app';
import calibrationReducer from './calibration';
import cncReducer from './cnc';

const subReducer = combineReducers({
  app: appReducer,
  calibration: calibrationReducer,
  cnc: cncReducer,
});

export default function rootReducer(state, action) {
  if (action.type === 'SET_STATE') {
    return action.payload;
  }

  return subReducer(state, action);
}
