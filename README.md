#node-token-jwt

This project is based on the tutorial https://scotch.io/tutorials/authenticate-a-node-js-api-with-json-web-tokens

Calling http://localhost:3333/api/adduser adds a user to the mongo table auth (at mongodb://localhost:27017) In this demo this API can be called without authentication.

Using Postman, calling http://localhost:3333/api/authenticate with valid name and password parameters returns a token;

{
  "success": true,
  "message": "Enjoy your token!",
  "token": "eyJhbGciOiJIUzI1... (893 chars) "
}

This token then needs to be added as an x-access-taken parameter when calling http://localhost:3333/api/users

