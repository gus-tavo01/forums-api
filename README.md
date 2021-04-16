# Forums Api

## Description

Restful API for forums management

- public url: https://forums-api.herokuapp.com

## Getting started

- Install the project dependencies `npm install`
- Run the application locally `npm run dev`
- Run the tests `npm run test`

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

## App testing

### Unit

- Controllers
  - Mocked service calls
- Services
  - Mocked repo calls

### Integration E2e

- Repository layer
  - CRUD operations
  - No mocked data

## Base endpoints todos

- user create account (register)

## Todo doubts

- use response middleware
  - users endpoint
  - forums endpoint
  - auth endpoint
- POST reset password
  - Auth controller

## Testing todos

- Users controller
  - post
  - get by id
- Forums controller
  - get by filters
  - post
- Topics controller
  - get by id
  - post
  - GET
  - DELETE

## Pendings to be defined

- define what routes will be protected
- define service layer
  - validations
  - service response
  - map service response on apiResponse
- define user conf schema
  - account preferences
    - language
  - theme
- define email send workflow
