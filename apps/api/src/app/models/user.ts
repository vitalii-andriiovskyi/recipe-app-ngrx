import {Document, model, Model, Schema, Types} from 'mongoose';
import * as bcrypt from 'bcrypt';
import { from, throwError, Observable, bindNodeCallback, of } from 'rxjs';
import { exhaustMap, switchMap, map, catchError } from 'rxjs/operators';
import config from '../config';
import * as jwt from 'jsonwebtoken';
import { CommonError, CommonErrorTypes } from '../utils/error';
import { User } from '@recipe-app-ngrx/models';
import getLogger from '../utils/logger';

const logger = getLogger(module);

const UserSchema: Schema = new Schema({
  username: {
    type: String,
    unique: true,
    required: true
  },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String,
  },
  phone: String,
  token: String,
  hashedPassword: {
    type: String,
    required: true
  },
});

UserSchema.methods.encryptPassword = function(password: string) {
  return bcrypt.hashSync(password, 10);
} 


UserSchema.virtual('password')
  .set(function(password: string) {
    this._plainPassword = password;
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() { return this._plainPassword });

UserSchema.methods.checkPassword = function(password: string): boolean {
  return bcrypt.compareSync(password, this.hashedPassword);
};

UserSchema.methods.getPublicFields = function() {
  return {
    _id: this._id,
    username: this.username,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    address: this.address ? this.address : {},
    phone: this.phone ? this.phone : '',
    // token: jwt.sign({ sub: this._id }, config.get('secret'))
  };
};

UserSchema.statics.getUser = function(id: string): Observable<any> {
  const selfUser = this;

  return bindNodeCallback(selfUser.findById).call(selfUser, id).pipe(
    switchMap(function(user) {
      if(user) {
        return of(user['getPublicFields']());
      }
      logger.error(`User with ${id} doesn't exist`);
      return throwError(new CommonError(`User with ${id} doesn't exist`, CommonErrorTypes.GettingError));
    }),
    catchError(err => throwError(new CommonError(`User with ${id} doesn't exist. Message: ${err.message}`, CommonErrorTypes.GettingError)))
  )
};

UserSchema.statics.authenticate = function(username: string, password: string): Observable<any> {
  const selfUser = this;
  if (!username || !password ) {
    return throwError(new CommonError(`Incorrect form submission`, CommonErrorTypes.CommonError))
  }

  // return from(selfUser.findOne({username: username})).pipe(
  return bindNodeCallback(selfUser.findOne).call(selfUser, {username: username}).pipe(
    switchMap(function(user) {
      if (user) {
        if (user['checkPassword'](password)) {
          // authentication successful
          logger.info('auth is successful');
          return of(user['getPublicFields']());
        } else {
          logger.error('wrong password');
          return throwError(new CommonError(`Password is incorrect`, CommonErrorTypes.AuthError));
        }
      }
      logger.error(`User ${username} doesn't exist`);
      return throwError(new CommonError(`User ${username} doesn't exist`, CommonErrorTypes.CommonError));
    })
  );
}

UserSchema.statics.createUser = function(userParam: User): Observable<any> {
  const selfUser = this;
  // return from(selfUser.findOne({username: userParam.username})).pipe(
  return bindNodeCallback(selfUser.findOne).call(selfUser, {username: userParam.username}).pipe(
    exhaustMap(user => {
      if (user) {
        return throwError(new CommonError(`Username ${userParam.username} is already taken`, CommonErrorTypes.CreationError));
      } 
      const newUser = new selfUser({...userParam});
      return from(newUser.save()).pipe(
        map(createdUser => createdUser['getPublicFields']())
      );
    })
  );
}

UserSchema.statics.removeUser = function(id: any): Observable<any> {
  const selfUser = this;

  if ( !Types.ObjectId.isValid(id) )  {
    logger.error(`${id} is invalid ObjectId`);
    return throwError(new CommonError(`${id} is invalid ObjectId`, CommonErrorTypes.CommonError));
  }
  
  return bindNodeCallback(selfUser.findById).call(selfUser, id).pipe(
    exhaustMap(user => {
      if (user === null) {
        return throwError(new CommonError(`There's no user with id: ${id}`, CommonErrorTypes.DeletionError));
      } 
      
      return from(user['remove']());
    })
  );
}

export interface NongoUserDocument extends User, Document {
  _id: string;
  encryptPassword: () => string;
  checkPassword: () => boolean;
  getPublicFields: () => any;
  password: string;
}
export interface MongoUserModel extends Model<NongoUserDocument>  {
  authenticate: (username: string, password: string) => Observable<any>;
  createUser: (userParam: User) => Observable<any>;
  removeUser: (id: any) => Observable<any>;
  getUser: (id: string) => Observable<any>;
}

export const UserModel: MongoUserModel = model<NongoUserDocument, MongoUserModel>('User', UserSchema);
