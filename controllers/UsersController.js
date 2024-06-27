// controllers/UsersController.js

import dbClient from '../utils/db';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';
export default class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    try {
      // Check if email and password are provided
      if (!email) {
        return res.status(400).json({ error: 'Missing email' });
      }
      if (!password) {
        return res.status(400).json({ error: 'Missing password' });
      }

      // Check if email already exists in the database
      const userExists = await dbClient.db.collection('users').findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = sha1(password);

      // Insert the new user into the database
      const result = await dbClient.db.collection('users').insertOne({ email, password: hashedPassword });
      const userId = result.insertedId.toString();

      // Return the new user's email and ID with a status code of 201
      return res.status(201).json({ email, id: userId });
    } catch (error) {
      // Handle any errors that occur during user creation
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Fetch the user details from the database using the user ID
      const user = await dbClient.db.collection('users').findOne({ _id: ObjectId(userId) });

      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      return res.json({ email: user.email, id: user._id.toString() });
    } catch (error) {
      console.error('Error fetching user:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
}
