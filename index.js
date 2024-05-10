// update
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://ph-cars-doctors.firebaseapp.com',
      'https://ph-cars-doctors.web.app',
    ],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.zrua0aj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// middlewares
const logger = (req, res, next) => {
  console.log('log info ', req.method, req.url);
  next();
};
const verifyToken = (req, res, next) => {
  const token = req?.cookies.token;
  // console.log('token in middleware', token);
  if (!token) {
    return res.status(401).send({ massage: 'unauthorized access' });
  }
  jwt.verify(token, process.env.TOKEN, (err, decoded) => {
    if (err) {
      return res.status(401).send({ massage: 'unauthorized access' });
    }
    req.user = decoded;
    next();
  });
};
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
};
async function run() {
  try {
    const serviceCollection = client.db('phCarDoctors').collection('Services');
    const bookingsCollection = client.db('phCarDoctors').collection('Bookings');
    // auth related apis
    app.post('/auth/jwt', logger, (req, res) => {
      const user = req.body;
      console.log(`user for token`, user);
      const token = jwt.sign(user, process.env.TOKEN, { expiresIn: '2h' });
      res // save to browser cookie
        .cookie('token', token, cookieOptions)
        .send({ success: true });
    });
    app.post('/auth/logout', async (req, res) => {
      const user = req.body;
      console.log(`user logout`);
      res
        .clearCookie('token', { ...cookieOptions, maxAge: 0 })
        .send({ success: true });
    });
    // rest services apis
    app.get('/api/services', async (req, res) => {
      const cursor = serviceCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });
    app.get('/api/services/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const options = {
        projection: { service_id: 1, title: 1, price: 1, img: 1 },
      };
      const result = await serviceCollection.findOne(query, options);
      res.send(result);
    });
    app.get('/api/bookings/', logger, verifyToken, async (req, res) => {
      console.log('token owner : ', req.user); // console the user from verifyToken()
      console.log(req.query.email);
      // verify that specific user try to access his own secret or not
      if (req.user.email !== req.query?.email) {
        return res.status(403).send({ massage: 'Forbidden Access' });
      }
      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
      }
      const cursor = bookingsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
    app.post('/api/bookings/', async (req, res) => {
      const doc = req.body;
      //   delete doc._id;
      console.log(doc);
      const result = await bookingsCollection.insertOne(doc);
      res.send(result);
    });
    app.delete('/api/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await bookingsCollection.deleteOne(query);
      res.send(result);
    });
    app.patch('/api/bookings/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updatedBooking = req.body;
      const updatedDoc = {
        $set: {
          status: updatedBooking.status,
        },
      };
      console.log(updatedBooking);
      const result = await bookingsCollection.updateOne(filter, updatedDoc);
      res.send(result);
    });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
  }
}
run().catch(console.dir);
app.get('/', (req, res) => {
  res.send('Welcome to Programming Hero Cart Doctor Server');
});
app.listen(port, () => {
  console.log(`server listening at ${port}`);
});
