import CustomerFeedback from '../models/FeedbackSchema.js';

export const submitFeedback = async (req, res) => {
  try {
    const { rating } = req.query;

    if (!['happy', 'neutral', 'sad'].includes(rating)) {
      return res.status(400).send('Invalid rating type');
    }

    await CustomerFeedback.findOneAndUpdate(
      { rating },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).send('Failed to submit feedback');
  }
};

// Get total stats
export const getFeedbackStats = async (req, res) => {
    try {
      const stats = await CustomerFeedback.aggregate([
        {
          $group: {
            _id: "$rating",
            count: { $sum: "$count" }
          }
        },
        {
          $project: {
            rating: "$_id",
            count: 1,
            _id: 0
          }
        }
      ]);
      
      // Ensure all rating types are included, even with zero counts
      const allRatings = ['happy', 'neutral', 'sad'];
      const completeStats = allRatings.map(rating => {
        const found = stats.find(item => item.rating === rating);
        return found || { rating, count: 0 };
      });
  
      res.json(completeStats);
    } catch (error) {
      console.error('Error fetching feedback stats:', error);
      res.status(500).send('Failed to fetch stats');
    }
  };