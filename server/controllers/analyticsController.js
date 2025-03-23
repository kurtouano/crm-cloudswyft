import { ReceivedEmail, ReplyEmail } from "../models/EmailSchema.js";

// Function to calculate handling time and aggregate data
export const calculateHandlingTime = async () => {
  try {
    // Fetch all received emails and replies in bulk
    const receivedEmails = await ReceivedEmail.find();
    const replies = await ReplyEmail.find();

    // Create a map of replies by threadId for quick lookup
    const replyMap = new Map();
    for (const reply of replies) {
      replyMap.set(reply.threadId, reply);
    }

    // Initialize an object to store the count of responses in each time range
    const handlingTimeRanges = {
      "0-1": 0,
      "1-3": 0,
      "4-6": 0,
      "7-12": 0,
      "13-18": 0,
      "19-24": 0,
      "24+": 0,
    };

    // Loop through each received email
    for (const email of receivedEmails) {
      // Find the corresponding reply using the threadId from the map
      const reply = replyMap.get(email.threadId);

      if (reply) {
        // Calculate the handling time in hours
        const handlingTimeHours = (reply.repliedAt - email.timestamp) / (1000 * 60 * 60);

        // Assign the handling time to the appropriate range
        if (handlingTimeHours <= 1) {
          handlingTimeRanges["0-1"] += 1;
        } else if (handlingTimeHours <= 3) {
          handlingTimeRanges["1-3"] += 1;
        } else if (handlingTimeHours <= 6) {
          handlingTimeRanges["4-6"] += 1;
        } else if (handlingTimeHours <= 12) {
          handlingTimeRanges["7-12"] += 1;
        } else if (handlingTimeHours <= 18) {
          handlingTimeRanges["13-18"] += 1;
        } else if (handlingTimeHours <= 24) {
          handlingTimeRanges["19-24"] += 1;
        } else {
          handlingTimeRanges["24+"] += 1;
        }
      }
    }

    // Convert the handlingTimeRanges object into an array for the chart
    const responseData = Object.keys(handlingTimeRanges).map((range) => ({
      hours: range,
      responses: handlingTimeRanges[range],
    }));

    return responseData;
  } catch (error) {
    console.error("Error calculating handling time:", error);
    throw error;
  }
};

export const fetchHandlingTimeData = async (req, res) => {
    try {
      const handlingTimeData = await calculateHandlingTime();
      res.status(200).json(handlingTimeData);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch handling time data" });
    }
  };