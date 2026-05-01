export function cx(
  styles: Record<string, string>,
  ...names: Array<string | false | null | undefined>
) {
  return names.filter(Boolean).map((name) => styles[name as string]).join(' ');
}
