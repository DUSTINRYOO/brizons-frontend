export function cls(...classnames: string[]) {
  return classnames.join(" ");
}
export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
