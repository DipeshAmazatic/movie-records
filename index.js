const express = require('express');
const user = require('./routes/user');
const movie = require('./routes/movie');
const genre = require('./routes/genre');
const people = require('./routes/people');
const user_auth = require('./routes/user_auth');
const app = express();

const port = process.env.PORT || 3000;
app.use(express.json());
app.use('/api/user', user);
app.use('/api/movie', movie);
app.use('/api/genre', genre);
app.use('/api/people', people);
app.use('/api/auth', user_auth);

app.listen(port, () => console.log(`Listening on port ${port}`));