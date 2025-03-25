import { ReceivedEmail, ReplyEmail } from "../models/EmailSchema.js";
import NodeCache from 'node-cache';

const cache = new NodeCache({ stdTTL: 3600 }); // Cache for 1 hour

export const clearHandlingTimeCache = () => {
  cache.del('handlingTimeData');
  console.log('Handling time cache cleared');
};

export const calculateHandlingTime = async () => {
  try {
    // Use aggregation pipeline to do most work in database
    const result = await ReceivedEmail.aggregate([
      {
        $lookup: {
          from: "replyemails", // Make sure this matches your collection name
          localField: "threadId",
          foreignField: "threadId",
          as: "reply"
        }
      },
      {
        $unwind: {
          path: "$reply",
          preserveNullAndEmptyArrays: false // Only include emails with replies
        }
      },
      {
        $project: {
          handlingTimeHours: {
            $divide: [
              { $subtract: ["$reply.repliedAt", "$timestamp"] },
              1000 * 60 * 60
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: "$handlingTimeHours",
          boundaries: [0, 1, 3, 6, 12, 18, 24, Infinity],
          default: "24+",
          output: {
            count: { $sum: 1 }
          }
        }
      }
    ]);

    // Create a map of all possible ranges with 0 as default
    const rangeMap = {
      "0-1": 0,
      "1-3": 0,
      "4-6": 0,
      "7-12": 0,
      "13-18": 0,
      "19-24": 0,
      "24+": 0
    };

    // Update the counts based on aggregation results
    result.forEach(item => {
      // Determine which range this bucket belongs to
      if (item._id === 0) rangeMap["0-1"] += item.count;
      else if (item._id === 1) rangeMap["1-3"] += item.count;
      else if (item._id === 3) rangeMap["4-6"] += item.count;
      else if (item._id === 6) rangeMap["7-12"] += item.count;
      else if (item._id === 12) rangeMap["13-18"] += item.count;
      else if (item._id === 18) rangeMap["19-24"] += item.count;
      else if (item._id === 24) rangeMap["24+"] += item.count;
    });

    // Convert to array format
    return Object.entries(rangeMap).map(([hours, responses]) => ({
      hours,
      responses
    }));
  } catch (error) {
    console.error("Error calculating handling time:", error);
    throw error;
  }
};

export const fetchHandlingTimeData = async (req, res) => {
  try {
    const cacheKey = 'handlingTimeData';
    let data = cache.get(cacheKey);
    
    if (!data) {
      console.log('Cache miss - calculating fresh data');
      data = await calculateHandlingTime();
      cache.set(cacheKey, data);
    } else {
      console.log('Serving from cache');
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error('Error in fetchHandlingTimeData:', error);
    res.status(500).json({ error: "Failed to fetch handling time data" });
  }
};