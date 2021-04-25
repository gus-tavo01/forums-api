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

- Auth
- Forums
  - Get forums by filters
- Topics
  - GET by id
- Users
  - GET by id
- Comments
- Participants

## Todo doubts

- Participants
  - update forum participants count
- Comments
  - GET topics/{id}/comments
  - POST
  - DELETE
  - PATCH
- Auth
  - fix token expiration validation

## Testing todos

- Users controller
  - post
  - get by id
- Forums controller
  - get by filters
  - post
- Topics controller

## Pendings to be defined

- validator for endpoints
  - POST/PATCH
  - schema validator?
- payload signature
- what routes would be public
  - get forums by filters
  - get topic by id
  - get topics
  - get comments
  - get user profile
- service layer
  - validations
  - service response
  - map service response on apiResponse
- user conf schema
  - account preferences
    - language
  - theme

## Incoming Features

### Load forum image

- use cloudinary

### Forgot password

- client -> api POST call { username, email }
- server -> verify if username and email match with an existing account
- server -> send email with { username, provisionalPwd }
- client -> logs in { username, provisionalPwd }

### Delete my account

- delete forums/topics/comments?

### Invite participants

- endpoint forums/{id}/participants
  - POST
    - update count on forum model
  - DELETE
    - update count on forum model
  - GET by filters
