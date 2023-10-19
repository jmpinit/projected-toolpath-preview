export function chunk(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

/**
 * Deeply update the values in an object based on another object. Only overwrite values that are
 * defined in the update object.
 * @param obj - The object to update
 * @param update - The object containing the new values
 */
export function deepPartialUpdate(obj, update) {
  return Object.keys(update).reduce((acc, key) => {
    const value = update[key];

    if (value === undefined) {
      return acc;
    }

    if (typeof value === 'object' && !Array.isArray(value)) {
      return {
        ...acc,
        [key]: deepPartialUpdate(acc[key], value),
      };
    }

    return {
      ...acc,
      [key]: value,
    };
  }, obj);
}

export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
