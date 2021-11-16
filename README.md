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
  - No mocked dependencies (except express js)
- Services
  - Nothing mocked

## Tech doubt

### BE Validator

- Implement full npm validator
  - forums controller
  - participants controller
  - auth controller

## Incoming Features

### Notifications (TBD)

- notification
  - id
  - type (U, F)
  - code (User added in forum) Entity_Action_Detail (USER_ADDED_FORUM) // improve codes
- forum notifications
  - new participant added
  - someone's role updated
- user notifications
  - invitation to be a forum participant
  - rejected from a forum
  - password changed

### Comments endpoint

- POST
- PATCH
  - edit content message
  - like/dislike
- DELETE
  - soft delete ({ id, content, likes, dislikes, recipient, removed })
- GET
  - paginated comments

### Like/dislike forum comments/posts

- endpoint PATCH forums/{id}/comments/{id}
- body { like: bool, dislike: bool }
- constraints
  - both cannot be set, return unprocessable if both are set
  - each comment can be liked/disliked once per user

### Delete my account (TBD)

- do not delete forums/comments
- disable user
