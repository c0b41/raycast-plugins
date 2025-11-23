export const startCase = (str: string): string => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2") // Add space between camel case
    .replace(/[^a-zA-Z0-9]+/g, " ") // Replace non-alphanumeric characters with space
    .replace(/^\s+|\s+$/g, "") // Trim leading/trailing spaces
    .replace(/\s+(.)/g, (match, char) => char.toUpperCase()) // Capitalize first letter after space
    .replace(/^./, (match) => match.toUpperCase()); // Capitalize the first letter
};
