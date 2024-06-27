import mongodb from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const dbURL = `mongodb://${host}:${port}/${database}`;

    this.client = new mongodb.MongoClient(dbURL, { useUnifiedTopology: true });
    this.connect(); // Call connect method to establish connection
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(); // Access the default database
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    try {
      const usersCollection = this.db.collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error getting number of users:', error);
      throw error;
    }
  }

  async nbFiles() {
    try {
      const filesCollection = this.db.collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (error) {
      console.error('Error getting number of files:', error);
      throw error;
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
