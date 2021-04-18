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

## Core endpoints

- Forums
  - Get forums by filters
- Topics
  - GET by id
- Users
  - GET by id

## Todo doubts

- forums controller
  - POST
    - assign author from auth user
- use response middleware
  - users endpoint
  - forums endpoint
- auth
  - fix token expiration validation

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

- validator for endpoints
  - POST/PATCH
  - schema validator?
- payload signature
- what routes would be public
- service layer
  - validations
  - service response
  - map service response on apiResponse
- user conf schema
  - account preferences
    - language
  - theme

## Incoming Features

### Forgot password

- client -> api POST call { username, email }
- server -> verify if username and email match with an existing account
- server -> send email with { username, provisionalPwd }
- client -> logs in { username, provisionalPwd }

### Delete my account
