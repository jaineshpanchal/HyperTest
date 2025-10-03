import { EventEmitter } from 'node:events';

export type BusEvents =
  | { type: 'runStart'; runId: string }
  | { type: 'testStart'; runId: string; testId: string; title: string }
  | { type: 'step'; runId: string; testId: string; message: string }
  | { type: 'artifact'; runId: string; testId: string; kind: string; path: string }
  | { type: 'pass'; runId: string; testId: string }
  | { type: 'fail'; runId: string; testId: string; error: string }
  | { type: 'runEnd'; runId: string };

export class ResultsBus {
  private emitter = new EventEmitter();
  emit(evt: BusEvents) { this.emitter.emit(evt.type, evt); }
  on<T extends BusEvents['type']>(type: T, handler: (e: Extract<BusEvents, { type: T }>) => void) {
    this.emitter.on(type, handler as any);
  }
}
