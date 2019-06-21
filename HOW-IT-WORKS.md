# HOW IT WORKS

## Register

1. Validate request with corresponding schema. If request does not valid, throw `BadRequestError`, end flow; else continue
2. Check registered email is existing or not.

    2.1 If it is existing, throw `BadRequestError` then end flow here

    2.2 If is is not existing, continue the flow

3. Create record for new user
4. Return response for end-user

## Login

In the login, we support two flow name: password flow and refresh-token flow

### Password flow

1. Validate request with corresponding schema. If request does not valid, throw `BadRequestError`, end flow; else continue.
2. Get user record from `storageLibrary`. If user does not exist, throw `NotFoundError`, end flow; else continue.
3. Check user password. If password does not match with password which is store in `storageLibrary`, throw `BadRequestError`, end flow; else continue.
4. Generate `accessToken`, `refreshToken`, `expireAt` 
5. Send these above field to response

### Refresh Token flow

1. Validate request with corresponding schema. If request does not valid, throw `BadRequestError`, end flow; else continue.
3. Check validity of `refreshToken`. If `refreshToken` does not valid or expired, throw `BadRequestError`, end flow; else continue.
3. From `refreshToken`, find user.
4. Generate `accessToken`, `refreshToken`, `expireAt`
5. Send these above field to response