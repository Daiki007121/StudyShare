import express from 'express';
import { getCollection, connectToDatabase } from '../db/mongodb.js';

const router = express.Router();

// Get reviews for a spot
router.get('/spot/:spotId', async (req, res) => {
  try {
    await connectToDatabase();
    const reviews = await getCollection('reviews')
      .find({ spotId: req.params.spotId })
      .sort({ createdAt: -1 }) // Newest first
      .toArray();
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new review
router.post('/', async (req, res) => {
  try {
    await connectToDatabase();
    const review = {
      ...req.body,
      createdAt: new Date()
    };
    const result = await getCollection('reviews').insertOne(review);
    res.status(201).json({ ...result, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
