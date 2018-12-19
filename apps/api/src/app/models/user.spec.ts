import { MongooseStub } from '../../testing/mongoose-stub';
import { readFirst } from '@nrwl/nx/testing';
import { UserModel } from './user';
import { User } from '@recipe-app-ngrx/models';
import { CommonErrorTypes } from '../utils/error';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import * as config from '../config';
import * as jwt from 'jsonwebtoken';

describe('UserModel: MongoUserModel', () => {
  beforeAll(() => {
    MongooseStub.connect();
  });

  afterAll((done) => {
      MongooseStub.disconnect(done);
  });

  describe('Creation and removing of the user', () => {
    const userN: User = {
      username: 'faked_user',
      password: '11111',
      firstName: 'faked_user',
      lastName: 'faked_user',
      email: 'email@gmail.com',
      address: {
        street: 'string',
        city: 'string',
        state: 'string',
        zip: 'string',
      },
      phone: '+ 380',
    }

    it('should create the user and remove it', async done => {
      try {
        const user = await readFirst(UserModel.createUser(userN));
        expect(user.username).toBe(userN.username);

        let userModel = await UserModel.findOne({username: userN.username});
        expect(userModel.username).toBe(userN.username);


        // ******************************************************************

        const removedUser = await readFirst(UserModel.removeUser(user._id));
        expect(removedUser._id).toEqual(user._id);

        userModel = await UserModel.findOne({username: userN.username});
        expect(userModel).toEqual(null);

        done();
      } catch (err) {
        done.fail(err);
      }

    });

    it('shouldn\'t create the user with missing data', async done => {
      const wrongUser: any = {
        username: 'faked_user',
        password: '11111',
        firstName: 'faked_user',
        lastName: 'faked_user',
      }
      try {
        const wrongUser$ = UserModel.createUser(wrongUser).pipe(
          catchError(err => of(err))
        );
        const errWrongUser = await readFirst(wrongUser$);
        expect(errWrongUser.message).toContain('User validation failed');

        done();
      } catch (err) {
        done.fail(err);
      }

    });

    it('should throw an err while creating the user which is already created', async done => {
      try {
        const user = await readFirst(UserModel.createUser(userN));
  
        const userAgain$ = UserModel.createUser(userN).pipe(
          catchError(err => of(err.type))
        );
  
        const errType = await readFirst(userAgain$);
        expect(errType).toBe(CommonErrorTypes.CreationError);
  
        await readFirst(UserModel.removeUser(user._id));
  
        done();
      } catch (err) {
        done.fail(err);
      }
  
    });
    // ------------------------------------------------------------------------

    it('should throw an err while removing the user which doesn\'t exist', async done => {
      try {
        const removeUser$ = UserModel.removeUser('5c18cb336a07d64bac65f000').pipe(
          catchError(err => of(err.type))
        );
        
        const errType = await readFirst(removeUser$);
        expect(errType).toBe(CommonErrorTypes.DeletionError);
  
        done();
      } catch (err) {
        done.fail(err);
      }
  
    });
    // ------------------------------------------------------------------------
    
    it('should throw an err while passing the invalid objectID to \'removeUser\'', async done => {
      try {
        const removeUser$ = UserModel.removeUser('5c18cb336a07d64bac6').pipe(
          catchError(err => of(err))
        );
        
        const errRes = await readFirst(removeUser$);
        expect(errRes.message).toBe('5c18cb336a07d64bac6 is invalid ObjectId');
        expect(errRes.type).toBe(CommonErrorTypes.CommonError);
  
        done();
      } catch (err) {
        done.fail(err);
      }
  
    });
    // ------------------------------------------------------------------------

  });

  describe(`Static 'authenticate()' and methods 'encryptPassword()', 'checkPassword()', 'getPublicFields()'`, () => {
    const userN: User = {
      username: 'faked_user',
      password: '11111',
      firstName: 'faked_user',
      lastName: 'faked_user',
      email: 'email@gmail.com',
      address: {
        street: 'string',
        city: 'string',
        state: 'string',
        zip: 'string',
      },
      phone: '+ 380',
    };

    let user: any

    beforeAll( async () => {
      user = await readFirst(UserModel.createUser(userN));
    });

    afterAll( async () => {
      await readFirst(UserModel.removeUser(user._id));
    });

    it(`should authenticate 'faked_user' with right username and password`, async done => {
      try {
        const authUser = await readFirst(UserModel.authenticate(userN.username, userN.password));
        expect(authUser.password).toBeFalsy();
        expect(authUser._id).toBeTruthy();
        expect(authUser.username).toBe(userN.username);

        const token = jwt.sign({ sub: authUser._id }, config.get('secret'));
        expect(authUser.token).toEqual(token);

        done();
      } catch (err) {
        done.fail(err);
      }
    });

    it(`should return the error while authenticating the user with wrong password`, async done => {
      try {
        const auth$ = UserModel.authenticate(userN.username, 'pass').pipe(
          catchError( err => of(err.type))
        );
        const authErr = await readFirst(auth$);
        expect(authErr).toBe(CommonErrorTypes.AuthError);
        
        done();
      } catch (err) {
        done.fail(err);
      }
    });

    it(`should return the error while authenticating the user which doesn\'t exist`, async done => {
      try {
        const auth$ = UserModel.authenticate('user_name', 'pass').pipe(
          catchError( err => of(err))
        );
        const authErr = await readFirst(auth$);
        expect(authErr.type).toBe(CommonErrorTypes.CommonError);
        expect(authErr.message).toContain(`User user_name doesn't exist`);
        
        done();
      } catch (err) {
        done.fail(err);
      }
    });

    // ------------------------------------------------------------------------
    it(`'checkPassword' should return 'true' when password is correct `, () => {
      const res = user.checkPassword('11111');
      expect(res).toBeTruthy();
    });

    it(`'checkPassword' should return 'false' when password is incorrect `, () => {
      const res = user.checkPassword('2222');
      expect(res).toBeFalsy();
    });

    it(`'getPublicFields' should return actual data about user`, () => {
      const publicUser = user.getPublicFields();
      expect(publicUser.username).toBe(userN.username);
      expect(publicUser.firstName).toBe(userN.firstName);
      expect(publicUser.lastName).toBe(userN.lastName);
      expect(publicUser.email).toBe(userN.email);
      expect(publicUser.address.city).toBe(userN.address.city);
      expect(publicUser.address.street).toBe(userN.address.street);
      expect(publicUser.address.state).toBe(userN.address.state);
      expect(publicUser.address.zip).toBe(userN.address.zip);
      expect(publicUser.phone).toBe(userN.phone);
      expect(publicUser.password).toBeFalsy();

      expect(publicUser.token).toBeTruthy();
      expect(publicUser._id).toBeTruthy();
    });

    it(`should get password set by the user`, () => {
      expect(user.password).toEqual('11111');
    });

    it(`should set new password and new hashedPassword`, () => {
      const oldHashedPassword = user.hashedPassword;
      const hash = 'hash';
      user.encryptPassword = jest.fn(pass => `${hash}-${pass}`);

      const newPassword = '2222';
      user.password = newPassword;
      expect(user.password).toEqual(newPassword);
      expect(user.hashedPassword).toEqual(`${hash}-${newPassword}`);
    });

  });

});