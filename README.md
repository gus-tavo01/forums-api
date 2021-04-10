# Forums Api

## Description

Restful API for forums management

- public url: https://forums-api.herokuapp.com

## App Layers

### Controller/Endpoint

- Consumes services
- Business specific validations
- Http status code is defined here

### Service

- Consumes repositories
- Basic validations for empties and required fields

### Repositories

- Consumes DB
- Create DB queries
- No validations here

## Important todos

- define basic endpoints
  - GET forums (done)
  - GET topics, GET topic
  - GET user (profile)?
- create pagination

## Pendings

- deploy database on server
- configure dev environment (env variables)
- define service layer
- define test strategy
- add missing schemas
  - user
  - login
  - preferences
