import { combineReducers } from 'redux';
import appReducer from './app';
import calibrationReducer from './calibration';
import cncReducer from './cnc';

export default combineReducers({
  app: appReducer,
  calibration: calibrationReducer,
  cnc: cncReducer,
});
