export default class Stack {
  private count: number = 0;
  private storage: object = {};
  constructor() {

  }
  public push<T>(value: T) {
    this.storage[this.count] = value;
    this.count++;
  }
  public pop(): any {
    if (this.empty()) return undefined;
    this.count--;
    let result: any = this.storage[this.count];
    delete this.storage[this.count];
    return result;
  }
  public empty(): boolean {
    return this.count === 0;
  }
  public peek(): any {
    return this.storage[this.count];
  }
  public size(): number {
    return this.count;
  }
}