When we make query for some data of save the data, the corresponding action fires. It gets caught by `EntityEffects`. `EntityEffects` takes into account these actions:

* EntityOp.QUERY_ALL.
* EntityOp.QUERY_LOAD.
* EntityOp.QUERY_BY_KEY.
* EntityOp.QUERY_MANY.
* EntityOp.SAVE_ADD_ONE.
* EntityOp.SAVE_DELETE_ONE.
* EntityOp.SAVE_UPDATE_ONE.
* EntityOp.SAVE_UPSERT_ON.
* EntityOp.CANCEL_PERSIST.

All of them except the last one are consumed by Effect `persist$`. When one of them is recognized in the Effect `persist$`, the code calls the needed method from `DefaultDataService` or `CustomDataService` for certain entity.
Then that method makes query to the remote server. If the server responds with data, success action fires. In another case error action fires. All of next actions are intercepted by reducer `EntityCollectionReducer` which is created by `EntityCollectionReducerFactory`. This reducer doesn't take into account the type of action. It relies on  `action.payload.entityOp`.
Also `EntityEffects` fires Error action in the case when there's no implementation for actions remembered above.

The method `entityCollectionReducerRegistry.registerReducer('EntityName', customReducer)` overwrites the reducer provided by `ngrx-data` library.

## Angular Material: mat-select

* To show droplist click on `.mat-select-trigger`.
* To hide droplist click on `.cdk-overlay-container .cdk-ovelay-backdrop`.

## Docker issues

### Issue with file sharing

`ERROR: for db  Cannot create container for service db: status code not OK but 500: {"Message":"Unhandled exception: Filesharing has been cancelled"}
Encountered errors while bringing up the project.`

To solve it run *Docker Desktop > Settings > File Sharing* and add needed drive.  
[Docker Compose failed to build - Filesharing has been cancelled](https://stackoverflow.com/questions/60754297/docker-compose-failed-to-build-filesharing-has-been-cancelled).

### Issue with `bcrypt`

```cli
Error: /usr/src/recipe-app-api/node_modules/bcrypt/lib/binding/napi-v3/bcrypt_lib.node: invalid ELF header
recipe-app-api    |     at Object.Module._extensions..node (internal/modules/cjs/loader.js:1188:18)
recipe-app-api    |     at Module.load (internal/modules/cjs/loader.js:986:32)
recipe-app-api    |     at Function.Module._load (internal/modules/cjs/loader.js:879:14)
recipe-app-api    |     at Module.require (internal/modules/cjs/loader.js:1026:19)
recipe-app-api    |     at require (internal/modules/cjs/helpers.js:72:18)
recipe-app-api    |     at Object.<anonymous> (/usr/src/recipe-app-api/node_modules/bcrypt/bcrypt.js:6:16)
recipe-app-api    |     at Module._compile (internal/modules/cjs/loader.js:1138:30)
recipe-app-api    |     at Object.Module._extensions..js (internal/modules/cjs/loader.js:1158:10)
recipe-app-api    |     at Module.load (internal/modules/cjs/loader.js:986:32)
recipe-app-api    |     at Function.Module._load (internal/modules/cjs/loader.js:879:14)
recipe-app-api    |     at Module.require (internal/modules/cjs/loader.js:1026:19)
recipe-app-api    |     at require (internal/modules/cjs/helpers.js:72:18)
recipe-app-api    |     at Object.bcrypt (/usr/src/recipe-app-api/dist/apps/api/webpack:/external "bcrypt":1:1)
recipe-app-api    |     at __webpack_require__ (/usr/src/recipe-app-api/dist/apps/api/webpack:/webpack/bootstrap:19:1)
recipe-app-api    |     at Module.<anonymous> (/usr/src/recipe-app-api/dist/apps/api/main.js:741:64)
recipe-app-api    |     at Module../apps/api/src/app/models/user.ts (/usr/src/recipe-app-api/dist/apps/api/main.js:863:30)
recipe-app-api    | No type errors found
```

The reason of the problem was using wrong `bcrypt` version. Version for Windows was installed but not the version for Linux. The funny thing is that: `.dockerignore` exluded `node_modules` and `dockerfile` had the command `RUN npm install --unsafe-perm`. So it had to install right version. But the `docker-compose.override.yml` had the line:

```yml
  volumes:
  - ./:/usr/src/recipe-app-api
```

what overrode `node_modules`. To fix the problem, it's needed to use `volumes` in the way it can't copy `node_modules`.

### Issue with postinstall

`ngcc --properties es2015 browser module main --first-only`  ended up with `postinstall: cannot run in wd`.

Solution:  
`dockerfile`

```dockerfile
RUN npm install --unsafe-perm
# or
RUN yarn config set unsafe-perm true && yarn
```

[.dockerignore in multi-stage builds](https://forums.docker.com/t/dockerignore-in-multi-stage-builds/57169/3).

### Issue with `mongodb` and `recipe-api`

`recipe-api` couldn't connect to `mongodb` container. This is because of using wrong host:

`docker-compose.yml`

```yml
  environment:
    MONGODB_URI: mongodb://vit:secret@127.0.0.1:27017/rcp
```

`127.0.0.1` must be the name of the container with MongoDB `mondodb`.

```yml
  environment:
    MONGODB_URI: mongodb://vit:secret@mongodb:27017/rcp
```
