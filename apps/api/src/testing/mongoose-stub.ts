import * as mongoose from 'mongoose';
import config from '../app/config';

export class MongooseStub {
  static connect = () => {
    mongoose.connect('mongodb://vit:secret@mongodb:27017/test_rcp', config.get('mongoose:options'))
  }

  static disconnect = (done: any) => {
    mongoose.disconnect(done);
  }
}

