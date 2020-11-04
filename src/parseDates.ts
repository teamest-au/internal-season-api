const dateFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export default function parseDates(part: any): any {
  if (Array.isArray(part)) {
    return part.map(parseDates);
  } else if (typeof part === 'object' && part !== null) {
    return Object.keys(part).reduce((acc, key) => {
      return {
        ...acc,
        [key]: parseDates(part[key]),
      };
    }, {});
  } else if (typeof part === 'string' && dateFormat.test(part)) {
    return new Date(part);
  }
  return part;
}
