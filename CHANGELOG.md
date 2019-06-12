# Changelog

The format is based on [Keep a Changelog](http://keepachangelog.com/).

## [Unreleased]

### Added

- Added `cors`.
- Added initial Postman collection to test integration.
- Added `scopes` in JWT claims to handle API Authorization.
- Added `ForbiddenError` to handle API Authorization Error.

### Changed

- Changed `login-user+v1.json` and `create-user+v1.json` schema to follow JSON API Spec.
- Change request & response of `register` and `login` controller to follow JSON API Spec.
- Changed `login-user+v1.json` schema to support `scopes` property in request payload

### Fixed

- Fixed wrong-working `jwtPassport` middleware.

### Removed
