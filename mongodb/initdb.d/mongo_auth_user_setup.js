db.createUser(
  {
    user: "vit",
    pwd: "secret",  // or cleartext password
    roles: [
       { role: "readWrite", db: "rcp" },
       { role: "readWrite", db: "test_rcp" },
    ]
  }
)
