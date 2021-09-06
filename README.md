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

## Tech doubt

### BE Validator

- Add support for Patch models
- isOptional validator
- isOneOf validator

### TODOs

## Incoming Features

### Notifications (TBD)

- send notifications to users/forums

### Like/dislike forum comments/posts

- endpoint PATCH forums/{id}/comments/{id}
- body { like: bool, dislike: bool }
- constraints
  - both cannot be set, return unprocessable if both are set
  - each comment can be liked/disliked once per user

### Delete my account (TBD)

- do not delete forums/comments
- disable user
