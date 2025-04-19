import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.MONGODB_URI;

async function generateData() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const spots = db.collection('spots');
    const reviews = db.collection('reviews');
    
    // Clear existing data
    await spots.deleteMany({});
    await reviews.deleteMany({});
    
    // Generate 1000 spots
    const buildings = ['Library', 'Engineering Building', 'Science Center', 'Student Union', 'Arts Center', 'Business School'];
    const floors = ['1st Floor', '2nd Floor', '3rd Floor', 'Basement', 'Ground Floor'];
    const noiseLevels = ['quiet', 'moderate', 'noisy'];
    
    const spotDocs = [];
    
    for (let i = 0; i < 1000; i++) {
      const building = buildings[Math.floor(Math.random() * buildings.length)];
      const floor = floors[Math.floor(Math.random() * floors.length)];
      const noiseLevel = noiseLevels[Math.floor(Math.random() * noiseLevels.length)];
      
      spotDocs.push({
        name: `Study Spot ${i + 1}`,
        building,
        floor,
        hasOutlet: Math.random() > 0.5,
        noiseLevel,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
      });
    }
    
    const result = await spots.insertMany(spotDocs);
    console.log(`Inserted ${result.insertedCount} spots`);
    
    // Generate reviews for some spots
    const allSpots = await spots.find({}).toArray();
    const reviewDocs = [];
    
    for (let i = 0; i < 2000; i++) {
      const spot = allSpots[Math.floor(Math.random() * allSpots.length)];
      
      reviewDocs.push({
        spotId: spot._id.toString(),
        rating: Math.floor(Math.random() * 5) + 1,
        comment: `This is review #${i + 1}. The spot was ${Math.random() > 0.5 ? 'great' : 'okay'}.`,
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000))
      });
    }
    
    const reviewResult = await reviews.insertMany(reviewDocs);
    console.log(`Inserted ${reviewResult.insertedCount} reviews`);
    
  } finally {
    await client.close();
  }
}

generateData().catch(console.error);
