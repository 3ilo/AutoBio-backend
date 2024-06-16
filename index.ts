import express, { Express, Request, Response } from 'express';
import { IUserSchema } from './models/User';
const User = require('./models/User')
const cookieParser = require('cookie-parser');
const app: Express = express();
const cors = require('cors');
const jwt = require('jsonwebtoken');
const withAuth = require('./middleware/withAuth.ts');

require('dotenv').config();

const whitelist = ['http://localhost:5173'];

app.use(express.json());
app.use(cors({ origin: whitelist, credentials: true }));
app.use(cookieParser());
app.use(express.static('dist'));

app.get('/api/home', (req: Request, res: Response) => {
  res.send('Welcome!');
});

app.get('/api/secret', withAuth, function (req: Request, res: Response) {
  res.send('The password is potato');
});

// Check if token is valid
app.get('/checkToken', withAuth, function (req: Request, res: Response) {
  res.sendStatus(200);
});

// POST route to register a user
app.post('/api/register', function (req: Request, res: Response) {
  const { email, password } = req.body;
  const user = new User({ email, password });
  user
    .save()
    .then((_: any) => {
      res.status(200).send('Welcome to the club!');
    })
    .catch((error: any) => {
      res
        .status(500)
        .send(`Error registering new user please try again: ${error}`);
    });
});

// POST route to authenticate a user
app.post('/api/authenticate', function (req: Request, res: Response) {
  const { email, password } = req.body;
  User.findOne({ email })
    .then((user: IUserSchema) => {
      if (!user) {
        res.status(401).json({
          error: 'Incorrect email or password'
        });
      } else {
        user.isCorrectPassword(password, function (err: any, same: Boolean | null | undefined) {
          if (err) {
            res.status(500).json({
              error: 'Internal error please try again'
            });
          } else if (!same) {
            res.status(401).json({
              error: 'Incorrect email or password'
            });
          } else {
            // Issue token
            const payload = { email };
            const token = jwt.sign(payload, process.env.AUTH_SECRET, {
              expiresIn: '1h'
            });
            res.cookie('token', token, { httpOnly: true }).sendStatus(200);
          }
        });
      }
    })
    .catch((err: Error, user: IUserSchema) => {
      console.log(err);
      res.status(500).json({
        error: 'Internal error please try again1'
      });
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
