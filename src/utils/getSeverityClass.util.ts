export const getSeverityClass = (key: string) => {
  switch (key) {
    case 'I':
      return `border-gray-200`;
    case 'L':
      return `bg-indigo-100 border-indigo-200 text-indigo-800`;
    case 'M':
      return `bg-amber-100 border-amber-200 text-amber-800`;
    case 'H':
      return `bg-pink-100 border-pink-200 text-pink-800`;
    case 'C':
      return `bg-red-100 border-red-200 text-red-800`;
    default:
      return ``;
  }
};

export const getLighterSeverityClass = (key: string) => {
  switch (key) {
    case 'I':
      return `border rounded-sm border-gray-200`;
    case 'L':
      return `border rounded-sm bg-indigo-50 border-indigo-200 text-indigo-800`;
    case 'M':
      return `border rounded-sm bg-amber-50 border-amber-200 text-amber-800`;
    case 'H':
      return `border rounded-sm bg-pink-50 border-pink-200 text-pink-800`;
    case 'C':
      return `border rounded-sm bg-red-50 border-red-200 text-red-800`;
    default:
      return ``;
  }
};
