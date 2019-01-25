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