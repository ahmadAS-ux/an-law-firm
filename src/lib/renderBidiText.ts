/**
 * Wraps Latin runs inside Arabic context for safer BiDi display.
 * Returns a string with HTML markers — use only with dangerouslySetInnerHTML
 * if needed, or prefer <LTR> components in React.
 */
export function wrapEnglishFragments(text: string): string {
  if (!text) return text;
  return text.replace(
    /([A-Za-z0-9][A-Za-z0-9\s.,&/@:-]*[A-Za-z0-9]|[A-Za-z0-9])/g,
    '<bdi dir="ltr">$1</bdi>',
  );
}
