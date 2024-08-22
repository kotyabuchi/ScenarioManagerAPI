export default class PerformanceMonitor {
  private startTime: number;
  private queryCount: number = 0;

  constructor() {
    this.startTime = performance.now();
  }

  logQuery(query: string, params: any[]) {
    this.queryCount++;
    console.log(`Query ${this.queryCount}:`, query);
    console.log('Params:', params);
  }

  end() {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    console.log(`Total queries: ${this.queryCount}`);
    console.log(`Total duration: ${duration.toFixed(2)}ms`);
  }
}
