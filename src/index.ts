export function scaffoldMessage(): string {
  return 'Backend scaffold ready';
}

export function main(): void {
  console.log(scaffoldMessage());
}

/* istanbul ignore next: bootstrap when executed as entry script */
if (require.main === module) {
  main();
}
