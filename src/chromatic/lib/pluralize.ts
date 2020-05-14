export function pluralize(n: number, noun: string, noNumber: boolean = false): string {
    let pluralizedNoun = n === 1 ? noun : `${noun}s`;
    if (pluralizedNoun.endsWith('ys')) {
      pluralizedNoun = pluralizedNoun.replace(/ys$/, 'ies');
    }
    return noNumber ? pluralizedNoun : `${n} ${pluralizedNoun}`;
  }