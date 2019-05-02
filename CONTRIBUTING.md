# CONTRIBUTING


## Project structure
.
├── package.json        -- project definition
├── __tests__
|   ├── Integration Test.json   -- Postman Collection
|   └── Environment.json        -- Postman Environment
├── src
|   ├── func
|       ├── auth             -- controllers to authentication.
|       |   └── login.js
|       |   └── register.js
|       |   └── forget.js
|       |   └── reset.js
|   ├── lib -- shared utilities between every functions, regardless of the resource it's in charge of.
└── scripts
   ├── prepare -- script to install dependencies
   ├── deploy -- script to deploy service to AWS

How to add a new endpoint

Create a new folder in functions which represents the resource it's responsible for. Folder name should be in plural. For example, if I want to create new endpoints for CRUD posts, func/posts should be created.
Add controller to func/{resource}/controllers. It's recommended to:

Only write business workflow in the controller. Other non-relevant logic such as request/response validation should be done at handler level with the help of middlewares (before going to the controller).
Break down business logic into step-by-step functions, each function is named after the purpose of the function in human-readable language; accepts event as the only parameter and must return event, except for the last function.
Glue them together by using Promise-chain.

See here for references.

Create a new entry in serverless.yml and route path to the correct handler.
Add unit tests for each function above to functions/{resource}/tests along with fixtures.
Add integration tests to __tests__

Update endpoint table in README.md.
Update endpoint explanation in HOW-IT-WORKS.md.
Add changes to CHANGELOG.md.


Merge Request Acceptance Criteria

MR must be reviewed internally before sending to the service's owner.
Unit test must be updated if necessary.
All tests must pass.
Lint must pass.
Pipeline must be successful.
OpenAPI specification must be updated.
Endpoint table in README.md must be updated.

HOW-IT-WORKS.md must be updated.

CHANGELOG.md must be updated.
