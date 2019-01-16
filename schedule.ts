class CancelJob {

}
class Job {
  interval: number; // pause interval * unit between runs
  latest: number; // upper limit to the interval
  jobFunc: Function; // the job job_func to run
  unit: string; // time units, e.g. 'minutes', 'hours', ...
  atTime: string; // optional time at which this job runs
  lastRun: number; // datetime of the last run
  nextRun: number; // datetime of next run
  period: number; // timedelta between runs, only vlaid for
  startDay: string; // specific day of the week to start on
  tags: Set; // unique set of tags for the job
  scheduler: Scheduler; // scheduler to register with
  constructor(interval: number = 1, sched: Scheduler) {
    this.interval = interval;
    this.scheduler = sched;
    this.tags = new Set();
  }
  get shouldRun(): boolean {
    return this.timestamp >= this.nextRun;
  }
  get timestamp(): number {
    return new Date().getTime();
  }
  public lessThan(other: Job): boolean {
    return this.nextRun < other.nextRun;
  }
  toString(): string {
    return '';
  }
  get second(): Job {
    return this.seconds;
  }
  get seconds(): Job {
    this.unit = 'seconds';
    return this;
  }
  get minute(): Job {
    return self.minutes;
  }
  get minutes(): Job {
    this.unit = 'minutes';
    return this;
  }
  get hour(): Job {
    return this.hours;
  }
  get hours(): Job {
    this.unit = 'hours';
    return this;
  }
  get day(): Job {
    return this.days;
  }
  get days(): Job {
    this.unit = 'days';
    return this;
  }
  get week(): Job {
    return this.weeks;
  }
  get weeks(): Job {
    this.unit = 'weeks';
    return this;
  }
  get monday(): Job {
    this.startDay = 'monday';
    return this.weeks;
  }
  get tuesday(): Job {
    this.startDay = 'tuesday';
    return this.weeks;
  }
  get wednesday(): Job {
    this.startDay = 'wednesday';
    return this.weeks;
  }
  get thursday(): Job {
    this.startDay = 'thursday';
    return this.weeks;
  }
  get friday(): Job {
    this.startDay = 'friday';
    return this.weeks;
  }
  get saturday(): Job {
    this.startDay = 'saturday';
    return this.weeks;
  }
  get sunday(): Job {
    this.startDay = 'sunday';
    return this.weeks;
  }
  public tag(...tags): Job {
    tags.map(tag => this.tags.set(tag));
    return this;
  }
  public at(timeStr): Job {
    
  }
}
class Scheduler {
  jobs: Array<Job>;
  constructor() {
    this.jobs = [];
  }
  runPending(): void {
    const runnableJobs: Array<Job> = this.jobs.filter(job => job.shouldRun)
  }
  runAll(delaySeconds: number): void {
    this.jobs.map(job => {
      this._runJob(job);
      // sleep 
    })
  }
  clear(tag?: string): void {
    if (!tag) this.jobs = [];
    else {
      this.jobs = this.jobs.filter(job => job.tags.indexOf(tag) > -1);
    }
  }
  cancelJob(job: Job): void {
    try {
      const idx: number = this.jobs.indexOf(job);
      if (idx > -1) this.jobs.splice(idx, 1);
    } catch (e) {
      console.log(e);
    }
  }
  every(interval: number = 1): Job {
    const job: Job = new Job(interval, this);
    return job;
  }
  private _runJob(job): void {
    const ret = job.run();
    if (ret instanceof CancelJob) {
      this.cancelJob(job);
    }
  }
  get nextRun(): number {
    if (!this.jobs) return 0;
    return Math.min(self.jobs).nextRun;
  }
  get idleSeconds(): number {
    return this.nextRun - this.timestamp
  }
}