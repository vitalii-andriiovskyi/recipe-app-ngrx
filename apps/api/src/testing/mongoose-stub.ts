import * as mongoose from 'mongoose';
import * as config from '../app/config';

export class MongooseStub {
  static connect = () => {
    mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'))
  }

  static disconnect = (done: any) => {
    mongoose.disconnect(done);
  }
}

