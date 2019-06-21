# CONTRIBUTING


## Project structure

```bash
.
├── __tests__
|   ├── Integration Test.json   -- Postman Collection
|   └── Environment.json        -- Postman Environment
├── .nginx
|   ├── nginx.conf -- Nginx Configuration
├── resources
|   ├── schemass -- Schemas definition
├── scripts
|   ├── prepare -- script to install dependencies
|   ├── deploy -- script to deploy service to AWS
├── src
|   ├── func
|       ├── auth             -- controllers to authentication.
|       |   └── login.js
|       |   └── register.js
|       |   └── forget.js
|       |   └── reset.js
|   ├── lib -- shared utilities between every functions, regardless of the resource it's in charge of.
├── .babelrc -- Babel configuration
├── .eslintrc.json -- Project linting configuration
├── .travis.yml  -- Travis CI/CD definition
├── CHANGELOG.md
├── CONTRIBUTING.md
├── docker-compose.yml -- Docker compose file
├── HOW-IT-WORKS.md
├── jest.config.js -- Jest config file
├── jest.setup.js -- Jest setup file
└── package.json        -- project definition

```

## How to add a new endpoint

- Create a new folder in functions which represents the resource it's responsible for. Folder name should be in plural. For example, if I want to create new endpoints for CRUD posts, func/posts should be created.
- Add controller to src/func/{resource}. It's recommended to:

      - Only write business workflow in the controller. Other non-relevant logic such as request/response validation should be done at handler level with the help of middlewares (before going to the controller).
      - Break down business logic into step-by-step functions, each function is named after the purpose of the function in human-readable language; accepts event as the only parameter and must return event, except for the last function.
      - Glue them together by using Promise-chain.

- Create a new entry in routes.js and route path to the correct handler.
Add unit tests for each function above to func/{resource}/tests along with fixtures.
- Add integration tests to __tests__
- Update endpoint table in README.md.
- Update endpoint explanation in HOW-IT-WORKS.md.
- Add changes to CHANGELOG.md.


## Merge Request Acceptance Criteria

- MR must be reviewed internally before sending to the service's owner.
- Unit test must be updated if necessary.
- All tests must pass.
- Lint must pass.
- Pipeline must be successful.
- OpenAPI specification must be updated.
- Endpoint table in README.md must be updated.
- HOW-IT-WORKS.md must be updated.
- CHANGELOG.md must be updated.
