import { Schema, Model, model, Document, HookNextFunction } from 'mongoose';
import { bindNodeCallback } from 'rxjs';
import { take } from 'rxjs/operators';

import { Counter } from '@recipe-app-ngrx/models';
import getLogger from '../utils/logger';

const logger = getLogger(module);

const CounterSchema: Schema = new Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 }
});

export interface CounterDocument extends Counter, Document { 
  _id: string;
};

export const CounterModel: Model<CounterDocument> = model<CounterDocument>('Counter', CounterSchema);

export function increment(entityId: string, entity: Document, next: HookNextFunction ) {
  bindNodeCallback(CounterModel.findByIdAndUpdate)
    .call(
      CounterModel,
      { _id: entityId },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    ).pipe(take(1))
    .subscribe(
      count => {
        logger.info(`...count: + ${JSON.stringify(count)}`);
        entity.id = count.seq;
        next();
      },
      err => {
        logger.error(`counter error: + ${err}`);
        next(err);
      }
    );
}