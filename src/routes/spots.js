import express from 'express';
import { ObjectId } from 'mongodb';
import { getCollection, connectToDatabase } from '../db/mongodb.js';

const router = express.Router();

// Get all spots
router.get('/', async (req, res) => {
  try {
    await connectToDatabase();
    const spots = await getCollection('spots')
      .find()
      .sort({ createdAt: -1 }) // Newest first
      .toArray();
    res.json(spots);
  } catch (error) {
    console.error('Error fetching spots:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new spot
router.post('/', async (req, res) => {
  try {
    await connectToDatabase();
    const spot = {
      ...req.body,
      createdAt: new Date()
    };
    const result = await getCollection('spots').insertOne(spot);
    res.status(201).json({ ...result, _id: result.insertedId });
  } catch (error) {
    console.error('Error creating spot:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get spot by ID
router.get('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const spot = await getCollection('spots').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (spot) {
      res.json(spot);
    } else {
      res.status(404).json({ message: 'Spot not found' });
    }
  } catch (error) {
    console.error('Error fetching spot:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update spot
router.put('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const result = await getCollection('spots').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: req.body }
    );
    
    if (result.matchedCount === 0) {
      res.status(404).json({ message: 'Spot not found' });
    } else {
      res.json({ message: 'Spot updated successfully' });
    }
  } catch (error) {
    console.error('Error updating spot:', error);
    res.status(400).json({ message: error.message });
  }
});

// Delete spot
router.delete('/:id', async (req, res) => {
  try {
    await connectToDatabase();
    const result = await getCollection('spots').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (result.deletedCount === 0) {
      res.status(404).json({ message: 'Spot not found' });
    } else {
      // Also delete all reviews for this spot
      await getCollection('reviews').deleteMany({ spotId: req.params.id });
      res.json({ message: 'Spot and its reviews deleted successfully' });
    }
  } catch (error) {
    console.error('Error deleting spot:', error);
    res.status(400).json({ message: error.message });
  }
});

export default router;
