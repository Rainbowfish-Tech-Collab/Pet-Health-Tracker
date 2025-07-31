import express from 'express';
const router = express.Router({ mergeParams: true });

// GET /pets/:petId/symptoms
router.get('/', async (req, res) => {
  try {
    const { graph } = req.query;

    // Return mock data for graph view
    if (graph?.toLowerCase() === 'true') {
      // Generate last 7 days of mock symptom data
      const mockData = [];
      const symptoms = ['Lethargy', 'Coughing', 'Sneezing', 'Loss of Appetite'];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        // Randomly decide if there were symptoms on this day (30% chance)
        if (Math.random() < 0.3) {
          mockData.push({
            symptom: symptoms[Math.floor(Math.random() * symptoms.length)],
            timestamp: date.toISOString(),
            value: 1, // Each occurrence counts as 1 for frequency
            symptom_date: date.toISOString().split('T')[0]
          });
        }
      }
      return res.json(mockData);
    }

    // For non-graph requests, return empty data for now
    res.json({ message: 'No symptoms found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
