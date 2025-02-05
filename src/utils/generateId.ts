let counter = 0;

export function generateId(prefix: string = 'id'): string {
  counter += 1;
  return `${prefix}_${counter}_${Date.now()}`;
} 