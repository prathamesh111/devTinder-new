
authRouter
POST /signup
POST /login
POST /logout

profileRouter
GET /profile
PATCH /profile/edit
PATCH /profile/password

connectionRequestRouter
POST /request/send/interested/:userId
POST /request/send/ignored/:userID
POST  /request/review/accepted/reviewId
POST /request/review/rejected/reviewId

userRouter
GET /connections
GET /requests/received
GET /feed - gets you for the profiles of the other users on platform


status -> ignore, interested, accepted, rejected
