import { ObjectId } from 'mongodb';
import { redisClient } from '../utils/redis';
import dbClient from '../utils/db';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export default class FilesController {
  static async postUpload(req, res) {
    const { name, type, data, parentId = '0', isPublic = false } = req.body;
    const userId = req.user?.userId;

    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type or invalid type' });
    }

    if ((type !== 'folder') && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    try {
      if (parentId !== '0') {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      let newFile = {
        userId: ObjectId(userId),
        name,
        type,
        isPublic,
        parentId: parentId === '0' ? '0' : ObjectId(parentId),
      };

      if (type !== 'folder') {
        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';

        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }

        const filePath = path.join(folderPath, `${uuidv4()}`);
        fs.writeFileSync(filePath, Buffer.from(data, 'base64'));
        newFile.localPath = filePath;
      }

      const result = await dbClient.db.collection('files').insertOne(newFile);
      newFile = { ...newFile, id: result.insertedId.toString() };

      return res.status(201).json(newFile);
    } catch (error) {
      console.error('Error creating file:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    if (!ObjectId.isValid(fileId)) {
      return res.status(404).json({ error: 'Not found' });
    }

    const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { parentId = '0', page = 0 } = req.query;
    const pageNum = parseInt(page, 10);
    const pageSize = 20;

    const query = { userId: ObjectId(userId) };
    if (parentId !== '0') {
      query.parentId = ObjectId(parentId);
    } else {
      query.parentId = '0';
    }

    const files = await dbClient.db.collection('files')
      .find(query)
      .skip(pageNum * pageSize)
      .limit(pageSize)
      .toArray();

    return res.status(200).json(files);
  }
}
