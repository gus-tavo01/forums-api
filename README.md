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
- Create service response

### Repositories

- Consumes DB
- Create DB queries
- No validations here

## Base endpoints todos

- define basic endpoints
  - GET topic
  - GET user (profile)?

## Testing todos

- Users controller
  - post
  - get by id
- Forums controller
  - get by filters
  - post
- Topics controller
  - get by id

## Pendings to be defined

- define service layer
  - validations
  - service response
- define test strategy
  - unit
    - services
    - controllers
  - integration
    - repositories?
    - services
    - controllers (E2e)
- define missing user conf schema
  - user
    - account preferences TBD
    - theme
- define email send workflow
- add/configure passport
