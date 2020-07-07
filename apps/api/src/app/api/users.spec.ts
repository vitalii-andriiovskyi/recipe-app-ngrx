import { ExpressServer as server } from '../app';
import * as supertest from 'supertest';
import { MongooseStub } from '../../testing/mongoose-stub';
import { User } from '@recipe-app-ngrx/models';
import { UserModel } from '../models/user';
import { redisClient } from '../redis';

const app = server.bootstrap().app;
const request: supertest.SuperTest<supertest.Test> = supertest(app);

describe('UserModel: MongoUserModel', () => {
  const userN: User = {
    username: 'test_faked_user',
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

  beforeAll(() => {
    MongooseStub.connect();
  });

  afterAll(async done => {
    const user = await UserModel.findOne({username: userN.username});
    if (user && user.username === userN.username) {
      await user.remove();
    }
    MongooseStub.disconnect(done);
  });

  describe('GET /api/users/:id', () => {
    let id: string;

    beforeAll(async () => {
      const user = await UserModel.create(userN as any); 
      id = user.id;
    });

    afterAll(async () => {
      const user = await UserModel.findOne({username: userN.username});
      if (user && user.username === userN.username) {
        await user.remove();
      }
    });

    it(`should get the user`, async () => {
      let response = await request.post(`/api/users/authenticate`).send({username: userN.username, password: userN.password});
      const { token } = response.body;

      response = await request.get(`/api/users/${id}`).set('Authorization', `Bearer ${token}`);
      expect(response.body.username).toBe(userN.username);
      expect(response.body.hashedPassword).toBeFalsy();
    });

    it(`should return the error 403 when id is wrong`, async () => {
      let response = await request.post(`/api/users/authenticate`).send({username: userN.username, password: userN.password});
      const { token } = response.body;

      const wrongId = 'wrongId';
      response = await request.get(`/api/users/${wrongId}`).set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(403);
      expect(response['error']['text']).toContain(`User with ${wrongId} doesn't exist`);
    });
   
  });

  describe('POST /api/users/create', () => {

    it('should create the user', async() => {
      const response = await request.post('/api/users/create').send(userN);
      const { userId, token, success } = response.body;

      expect(success).toBeTruthy();
      expect(userId).toBeTruthy();
      expect(token).toBeTruthy();
      await request.delete(`/api/users/${userId}`).set('Authorization', `Bearer ${token}`);

    });

    it('should get error 403 when the user is created', async() => {
      const response = await request.post('/api/users/create').send(userN);
      const { userId, token, success } = response.body;
      expect(success).toBeTruthy();

      const responseAgain = await request.post('/api/users/create').send(userN);
      expect(responseAgain.status).toEqual(403);
      expect(responseAgain['error']['text']).toBe(`Username ${userN.username} is already taken`);

      await request.delete(`/api/users/${userId}`).set('Authorization', `Bearer ${token}`);
    });

    it(`shouldn't create the user when wrong body; Error 500`, async() => {
      const response = await request.post('/api/users/create').send({username: 'ddd'});
      expect(response.status).toEqual(500);

    });

  });

  // -------------------------------------------------------

  describe('DELETE /api/users/:id', () => {
    let response: any,
        token: string,
        userId: string,
        username: string;

    beforeEach(async () => {
      response = await request.post('/api/users/create').send(userN); 
      token = response.body.token;
      userId = response.body.userId;

      const responseWithUser = await request.get(`/api/users/${userId}`).set('Authorization', `Bearer ${token}`);
      const user = responseWithUser.body;
      username = user.username;
    });

    afterEach(async () => {
      const user = await UserModel.findOne({username: userN.username});
      if (user && user.username === userN.username) {
        await user.remove();
      }
    });

    it(`should remove user`, async() => {
      expect(username).toBe(userN.username);

      const deletionRes = await request.delete(`/api/users/${userId}`).set('Authorization', `Bearer ${token}`);
      expect(deletionRes.status).toEqual(200);
    });

    it(`should response with err 403 if user got removed earlier`, async() => {
      expect(username).toBe(userN.username);

      let deletionRes = await request.delete(`/api/users/${userId}`).set('Authorization', `Bearer ${token}`);
      expect(deletionRes.status).toEqual(200);

      deletionRes = await request.delete(`/api/users/${userId}`).set('Authorization', `Bearer ${token}`);
      expect(deletionRes.status).toEqual(403);
      // console.log(deletionRes.error);
      expect(deletionRes['error']['text']).toBe(`There's no user with id: ${userId}`);
    });

    it(`should response with err 403 if user doesn't exist`, async() => {
      expect(username).toBe(userN.username);
      let newId = createNewId(userId, 'a');
      newId = userId !== newId ? newId : createNewId(userId, 'b');
  
      const deletionRes = await request.delete(`/api/users/${newId}`).set('Authorization', `Bearer ${token}`);
      expect(deletionRes.status).toEqual(403);
      expect(deletionRes['error']['text']).toBe(`There's no user with id: ${newId}`);
    });

    it(`should response with err 500 if id isn't objectID`, async() => {
      expect(username).toBe(userN.username);
      const newId = userId + 'a';
  
      const deletionRes = await request.delete(`/api/users/${newId}`).set('Authorization', `Bearer ${token}`);
      expect(deletionRes.status).toEqual(500);
    });
  });

  describe('POST /api/users/authenticate', () => {
    let user,
        id: string;
    beforeAll(async () => {
      await UserModel.create(userN as any); 
      user = await UserModel.findOne({username: userN.username});
      id = `` + user._id;

      // redisClient.on('error', (err) => {
      //   console.log(err);
      // })
      // redisClient.on('connect', () => {
      //   done();
      // })
    });

    afterAll(async () => {
      user = await UserModel.findOne({username: userN.username});
      if (user && user.username === userN.username) {
        await user.remove();
      }
    });

    describe(`There's no token in request`, () => {
      it(`should authenticate the user`, async () => {
        const response = await request.post(`/api/users/authenticate`).send({username: userN.username, password: userN.password});
        const { userId, success, token } = response.body;
        expect(userId).toBe(id);
        expect(token).toBeTruthy();
        expect(success).toBeTruthy();
      });

      it(`should return the error 403 when the password is wrong`, async () => {
        const response = await request.post(`/api/users/authenticate`).send({username: userN.username, password: '2222'});
        expect(response.status).toBe(401);
        expect(response['error']['text']).toBe(`Password is incorrect`);
      });

      it(`should return the error 403 when the user doesn't exist`, async () => {
        const response = await request.post(`/api/users/authenticate`).send({username: 'nobody', password: userN.password});
        expect(response.status).toBe(401);
        expect(response['error']['text']).toBe(`User nobody doesn't exist`);

      });

      it(`should return the error 401 when only the username is sent`, async () => {
        const response = await request.post(`/api/users/authenticate`).send({username: userN.username});
        expect(response.status).toBe(401);
      });

    
    });
    describe(`There's token in request`, () => {
      it(`should return the id of a user`, async () => {
        expect.assertions(4);
        let response = await request.post(`/api/users/authenticate`).send({username: userN.username, password: userN.password});
        const { success, token } = response.body;
        let { userId } = response.body;
        expect(userId).toBe(id);
        expect(token).toBeTruthy();
        expect(success).toBeTruthy();

        response = await request
          .post(`/api/users/authenticate`)
          .set('Authorization', `Bearer ${token}`)
          .send({username: userN.username, password: userN.password});

        userId = response.body.userId;
        expect(userId).toBe(id);

      });
      it(`shouldn't return the id of a user, when token is wrong`, async () => {
        expect.assertions(5);
        let response = await request.post(`/api/users/authenticate`).send({username: userN.username, password: userN.password});
        const { success, userId } = response.body;
        let { token } = response.body;
        expect(userId).toBe(id);
        expect(token).toBeTruthy();
        expect(success).toBeTruthy();

        token = token.slice(0, -4) + 'AAAA';

        response = await request
          .post(`/api/users/authenticate`)
          .set('Authorization', `Bearer ${token}`)
          .send({username: userN.username, password: userN.password});

        const message = response.text;
        const status = response.status;
        expect(message).toBe('Unauthorized');
        expect(status).toBe(400);

      });
    });

    // has token -> give id
    // hasn't token -> check username and pass and allow authentication
    //              -> if allowed store token in redis 
    //                    -> if token stored successfull return obj SuccessAuth
    //                    -> if token didn't store, return error message.
    //              -> if didn't allow, return error AuthError.
    
  });

  describe('DELETE /api/users/logout', () => {
    // if authorization
    //     test response success
    // else
    //     test 400

    // set token -> then remove token

    it(`should logout the user | request contains authorization header`, async() => {
      let response = await request.post('/api/users/create').send(userN);
      const { userId, token, success } = response.body;

      expect(success).toBeTruthy();
      expect(userId).toBeTruthy();
      expect(token).toBeTruthy();

      // test logout
      response = await request.delete('/api/users/logout').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.text).toContain('removed');

      redisClient.del(token);
      await request.delete(`/api/users/${userId}`).set('Authorization', `Bearer ${token}`);

    });

    it(`shouldn't logout the user | request doesn't contain authorization header`, async() => {
      let response = await request.post('/api/users/create').send(userN);
      const { userId, token, success } = response.body;

      expect(success).toBeTruthy();
      expect(userId).toBeTruthy();
      expect(token).toBeTruthy();

      // test logout
      response = await request.delete('/api/users/logout');
      expect(response.status).toBe(500);
      // expect(response.text).toContain('removed');
     
      redisClient.del(token);
      await request.delete(`/api/users/${userId}`).set('Authorization', `Bearer ${token}`);

    });
  })

});

const createNewId = (id: string, lastSymbol: string): string => {
  return id.slice(0, -1) + lastSymbol;
}