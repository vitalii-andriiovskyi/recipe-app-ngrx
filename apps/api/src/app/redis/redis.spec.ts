import { response } from 'express';
import { readFirst } from '@nrwl/angular/testing';
import { setToken, getToken, removeToken } from './index';
import { redisClient } from './index';

describe(`Redis methods`, () => {

  beforeAll(done => {
    redisClient.on("error", function(error) {
      console.error(error);
    });
    redisClient.on("connect", function() {
      console.log('connected');
      // console.log('redisClient1CCC: ', redisClient);
      // const mockGet = jest.fn().mockImplementation(redisClientTest.get.bind(redisClientTest));
      // const mockSet = jest.fn().mockImplementation(redisClientTest.set.bind(redisClientTest));
      // const mockRedisClient = jest.fn().mockImplementation(() => {
      //     return {
      //       get: mockGet,
      //       set: mockSet
      //     };
      //   });
      // jest.mock('./index', () => {
      //   return jest.fn().mockImplementation(() => {
      //       return {
      //         redisClient: mockRedisClient
      //       };
      //     })
      // });
      done();
    });
    
  })

  afterAll(done => {
    redisClient.quit(done);
  })

  describe('setToken() function', () => {
    it(`should set token in the redis db`, async done => {
      await new Promise(resolve => setTimeout(resolve, 4000));
      try {
        const key = 'key';
        const value = 'someId'
        const authData = await readFirst(setToken(key, value)).catch(err => console.log(err));
        expect(authData.token).toBe(key);
        expect(authData.userId).toBe(value);
        redisClient.del(key);

        done();
      } catch (err) {
        done.fail(err);
      }
    });
  });

  describe('getToken() function', () => {
    it(`should get token from redis db`, async done => {
      expect.assertions(4);
      await new Promise(resolve => setTimeout(resolve, 4000));
      try {
        const key = 'key';
        const value = 'someId'
        const authData = await readFirst(setToken(key, value)).catch(err => console.log(err));
        expect(authData.token).toBe(key);
        expect(authData.userId).toBe(value);

        const token = await new Promise(resolve => {
          return getToken(key, (err, res) => {
            expect(res).toBe(value);
            resolve(res);
            return response;
          });
        });

        expect(token).toBe(value);
        redisClient.del(key);

        done();
      } catch (err) {
        done.fail(err);
      }
    })
  });
  describe('removeToken() function', () => {
    it(`should remove token from the redis db`, async done => {
      await new Promise(resolve => setTimeout(resolve, 4000));
      try {
        const token = 'someToken';
        const value = 'someId'
        const authData = await readFirst(setToken(token, value)).catch(err => console.log(err));
        expect(authData.token).toBe(token);
        expect(authData.userId).toBe(value);

        const removeTokenSucces = await readFirst(removeToken(token));
        expect(removeTokenSucces).toBeTruthy();

        const removedToken = await new Promise(resolve => {
          return getToken(token, (err, res) => {
            expect(res).toBe(null);
            resolve(res);
            return response;
          });
        });
        expect(removedToken).toBeFalsy();

        done();
      } catch (err) {
        done.fail(err);
      }
    });
  });

})