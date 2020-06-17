import { ExpressServer as server } from '../app';
import * as supertest from 'supertest';
import { MongooseStub } from '../../testing/mongoose-stub';
import { User } from '@recipe-app-ngrx/models';
import { UserModel } from '../models/user';

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
      const response = await request.get(`/api/users/${id}`);
      expect(response.body.username).toBe(userN.username);
      expect(response.body.hashedPassword).toBeFalsy();
    });

    it(`should return the error 403 when id is wrong`, async () => {
      const wrongId = 'wrongId';
      const response = await request.get(`/api/users/${wrongId}`);
      expect(response.status).toBe(403);
      expect(response['error']['text']).toContain(`User with ${wrongId} doesn't exist`);
    });
   
  });

  describe('POST /api/users/create', () => {

    it('should create the user', async() => {
      const response = await request.post('/api/users/create').send(userN);

      expect(response.body.username).toBe(userN.username);
      await request.delete(`/api/users/${response.body._id}`).set('Authorization', `Bearer ${response.body.token}`);

    });

    it('should get error 403 when the user is created', async() => {
      const response = await request.post('/api/users/create').send(userN);
      expect(response.body.username).toBe(userN.username);

      const responseAgain = await request.post('/api/users/create').send(userN);
      expect(responseAgain.status).toEqual(403);
      expect(responseAgain['error']['text']).toBe(`Username ${userN.username} is already taken`);

      await request.delete(`/api/users/${response.body._id}`).set('Authorization', `Bearer ${response.body.token}`);
    });

    it(`shouldn't create the user when wrong body; Error 500`, async() => {
      const response = await request.post('/api/users/create').send({username: 'ddd'});
      expect(response.status).toEqual(500);

    });

  });

  // -------------------------------------------------------

  describe('DELETE /api/users/:id', () => {
    let response: any;

    beforeEach(async () => {
      response = await request.post('/api/users/create').send(userN); 
    });

    afterEach(async () => {
      const user = await UserModel.findOne({username: userN.username});
      if (user && user.username === userN.username) {
        await user.remove();
      }
    });

    it(`should remove user`, async() => {
      expect(response.body.username).toBe(userN.username);

      const deletionRes = await request.delete(`/api/users/${response.body._id}`).set('Authorization', `Bearer ${response.body.token}`);
      expect(deletionRes.status).toEqual(200);
    });

    it(`should response with err 403 if user got removed earlier`, async() => {
      expect(response.body.username).toBe(userN.username);

      let deletionRes = await request.delete(`/api/users/${response.body._id}`).set('Authorization', `Bearer ${response.body.token}`);
      expect(deletionRes.status).toEqual(200);

      deletionRes = await request.delete(`/api/users/${response.body._id}`).set('Authorization', `Bearer ${response.body.token}`);
      expect(deletionRes.status).toEqual(403);
      // console.log(deletionRes.error);
      expect(deletionRes['error']['text']).toBe(`There's no user with id: ${response.body._id}`);
    });

    it(`should response with err 403 if user doesn't exist`, async() => {
      expect(response.body.username).toBe(userN.username);
      const id = response.body._id;
      let newId = createNewId(id, 'a');
      newId = id !== newId ? newId : createNewId(id, 'b');
  
      const deletionRes = await request.delete(`/api/users/${newId}`).set('Authorization', `Bearer ${response.body.token}`);
      expect(deletionRes.status).toEqual(403);
      expect(deletionRes['error']['text']).toBe(`There's no user with id: ${newId}`);
    });

    it(`should response with err 500 if id isn't objectID`, async() => {
      expect(response.body.username).toBe(userN.username);
      const newId = response.body._id + 'a';
  
      const deletionRes = await request.delete(`/api/users/${newId}`).set('Authorization', `Bearer ${response.body.token}`);
      expect(deletionRes.status).toEqual(500);
    });
  });

  describe('POST /api/users/authenticate', () => {

    beforeAll(async () => {
      await UserModel.create(userN as any); 
    });

    afterAll(async () => {
      const user = await UserModel.findOne({username: userN.username});
      if (user && user.username === userN.username) {
        await user.remove();
      }
    });

    it(`should authenticate the user`, async () => {
      const response = await request.post(`/api/users/authenticate`).send({username: userN.username, password: userN.password});
      expect(response.body.username).toBe(userN.username);
      expect(response.body.token).toBeTruthy();
      expect(response.body.hashedPassword).toBeFalsy();
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

    it(`should return the error 500 when only the username is sent`, async () => {
      const response = await request.post(`/api/users/authenticate`).send({username: userN.username});
      expect(response.status).toBe(500);
    });

  });

});

const createNewId = (id: string, lastSymbol: string): string => {
  return id.slice(0, -1) + lastSymbol;
}