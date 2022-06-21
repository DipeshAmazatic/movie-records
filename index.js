const express = require('express');
const users = require('./routes/users');
const movies = require('./routes/movies');
const user_auth = require('./routes/user_auth');
const app = express();

const port = process.env.PORT || 3000;
app.use(express.json());
app.use('/api/users', users);
app.use('/api/movie', movies);
app.use('/api/auth', user_auth);

app.listen(port, () => console.log(`Listening on port ${port}`));