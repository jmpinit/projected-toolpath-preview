export default function appReducer(state, action) {
  if (state === undefined) {
    return {
      mapping: true,
    };
  }

  switch (action.type) {
    case 'APP_MAPPING_START':
      return {
        ...state,
        mapping: true,
      };
    case 'APP_MAPPING_STOP':
      return {
        ...state,
        mapping: false,
      };
    default:
      return state;
  }
}
