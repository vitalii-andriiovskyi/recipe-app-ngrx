#!/bin/bash
mongoimport --db rcp --collection users --file /data/db/users.json && \
mongoimport --db rcp --collection recipes --file /data/db/recipes.json && \
mongoimport --db rcp --collection counters --file /data/db/counters.json && \
mongoimport --db test_rcp --collection users --file /data/db/users.json