# Forums Api

## Description

Restful API for forums management

- public url: https://forums-api.herokuapp.com

## Getting started

- Install the project dependencies `npm install`
- Run the application locally `npm run dev`
- Run the tests `npm run test`

## Project Structure

### Controllers/Endpoints

- Define HTTP status
- Access data layer through repos
- Business specific validations
- Invoke model validator

### Repositories

- Consumes DB
- Create DB queries
- Return mapped entity

## App testing

### Unit

- Controllers
  - Mocked service calls
  - Mock express
- Repositories
  - Mocked DB calls

### Integration

- Controllers
  - CRUD E2E operations
  - No mocked services
  - Mock express
- Repositories

## Core endpoints

- Auth
  - Login
- Forums
  - Get forums by filters
  - POST forum
- Participants
  - POST add to forum
  - DELETE remove from forum

## Testing todos (remove later)

- Users controller
  - post
  - get by id
- Forums controller
  - get by filters
  - post
- Comments controller
  - integration, unit

## Incoming Features

### Forum Participants

#### Invite participants

- endpoint forums/{id}/participants
  - POST
    - update count on forum model
  - DELETE /{id}
    - update count on forum model

#### Manage Participants

- GET /{id}
  - retrieve participant profile?
  - to be defined later
- PATCH /{id}
  - edit role on forum

### Load images

- available when
  - creating a forum
  - user avatar
  - posting a comment
- use cloudinary

### Forgot password (Complete Flow)

- client -> api POST call request a secret code for { username, email }
- server -> verify if username and email matches with an existing account
  - success -> return successful response, then send an email with the secret code
  - failure -> return failed response, do not send any email
- client -> got response from BE
  - success -> display a modal to enter the secret code
  - failure -> display a message that the account is not asociated with the provided email
- client -> send request POST (BE verifies secret code) {}
- server -> validate secret code is valid (equals as the genereted previously)
  - success -> send successful response
  - failure -> send failure response, set tries count +1
- client -> got response from BE
  - success -> redirect user to the reset pwd interface
  - failure -> display message that the code is incorrect

### Notifications (TBD)

- send notifications to users/forums

### Like/dislike comments

- endpoint PATCH forums/{id}/comments/{id}
- body { like: bool, dislike: bool }
- constraints
  - both cannot be set, return unprocessable if both are set
  - each comment can be liked/disliked once per user

### Delete my account

- do not delete forums/comments
- disable user

### Update preferences

- change app language
- change app theme
