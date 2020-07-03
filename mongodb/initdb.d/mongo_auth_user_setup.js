db = db.getSiblingDB('rcp')
db.createUser(
  {
    user: "vit",
    pwd: "secret",  // or cleartext password
    roles: [
       { role: "readWrite", db: "rcp" }
    ]
  }
)

db = db.getSiblingDB('test_rcp')

db.createUser({
  user: 'vit',
  pwd: 'secret',
  roles: [
    { role: 'readWrite', db: 'test_rcp' }
  ],
});

db = db.getSiblingDB('surf')

db.createUser({
  user: 'vit',
  pwd: 'secret',
  roles: [
    { role: 'readWrite', db: 'surf' }
  ],
});