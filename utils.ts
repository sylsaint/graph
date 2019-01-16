export function uuid(): string {
  const s4 = () => {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export function getType(t: any): string {
  return t.constructor.prototype.toString().slice(8, -1);
}

export function getTypeLower(t: any): string {
  return getType(t).toLowerCase();
}