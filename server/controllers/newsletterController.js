import Newsletter from '../models/NewsletterSchema.js';
import { io } from '../index.js'; 

// Create initial newsletters if the collection is empty
export const createNewsletters = async (req, res) => {
  try {
    // Check if newsletters already exist
    const count = await Newsletter.countDocuments();
    
    if (count === 0) {
      // Create initial newsletters if none exist
      const initialNewsletters = [
        {
            title: "Education Amidst the Pandemic",
            serviceNum: 1,
            clicks: 0,
            link: "https://cloudswyft.co/education-amidst-the-pandemic-the-role-of-cloud-based-learning-platforms-in-continuing-learning-and-instruction/"
        },
        {
            title: "Virtual Computer Labs",
            serviceNum: 2,
            clicks: 0,
            link: "https://cloudswyft.co/how-virtual-computer-labs-are-revolutionising-the-way-universities-teach/"
        },
        {
            title: "CloudSwyft, the startup",
            serviceNum: 3,
            clicks: 0,
            link: "https://cloudswyft.co/cloudswyft-the-startup-that-aims-to-change-the-way-companies-do-human-capital-development/"
        },
        {
            title: "Finding your Career",
            serviceNum: 4,
            clicks: 0,
            link: "https://cloudswyft.co/finding-your-career-amidst-the-pandemic/"
        }
      ];
      
      await Newsletter.insertMany(initialNewsletters);
      return res.status(201).json({ 
        success: true, 
        message: "Initial newsletters created successfully",
        data: initialNewsletters
      });
    } else {
      // If newsletters exist, create a new one from request body
      const { title, serviceNum } = req.body;
      
      if (!title || !serviceNum) {
        return res.status(400).json({ 
          success: false, 
          message: "Title and serviceNum are required" 
        });
      }
      
      const existingNewsletter = await Newsletter.findOne({ serviceNum });
      if (existingNewsletter) {
        return res.status(400).json({ 
          success: false, 
          message: "Newsletter with this serviceNum already exists" 
        });
      }
      
      const newNewsletter = new Newsletter({
        title,
        serviceNum,
        clicks: 0,
        link,
      });
      
      await newNewsletter.save();
      return res.status(201).json({ 
        success: true, 
        message: "Newsletter created successfully",
        data: newNewsletter
      });
    }
  } catch (error) {
    console.error("Error creating newsletters:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to create newsletters", 
      error: error.message 
    });
  }
};
const getFormattedClickData = async () => {
  const newsletters = await Newsletter.find().sort({ serviceNum: 1 });
  const totalClicks = newsletters.reduce((sum, newsletter) => sum + newsletter.clicks, 0);
  
  return newsletters.map(newsletter => {
    const popularity = totalClicks > 0 
      ? Math.round((newsletter.clicks / totalClicks) * 100) 
      : 0;
    
    return {
      serviceNum: newsletter.serviceNum,
      title: newsletter.title,
      clicks: newsletter.clicks,
      link: newsletter.link,
      popularity: popularity, // Percentage of total clicks
    };
  });
};

// Track clicks on newsletters
export const monitorClicks = async (req, res) => {
  try {
    const { serviceNum } = req.params;
    const { redirectUrl } = req.query;
    
    // Find and update the newsletter's click count
    const newsletter = await Newsletter.findOneAndUpdate(
      { serviceNum: Number(serviceNum) },
      { $inc: { clicks: 1 } },
      { new: true }
    );
    
    if (!newsletter) {
      return res.status(404).json({ 
        success: false, 
        message: "Newsletter not found" 
      });
    }
    
    // Get updated data and emit via websocket
    const updatedData = await getFormattedClickData();
    io.emit('click-data-update', updatedData);
    
    // If redirectUrl is provided, redirect the user
    if (redirectUrl) {
      return res.redirect(redirectUrl);
    }
    
    // Otherwise return the updated newsletter data
    return res.status(200).json({ 
      success: true, 
      message: "Click tracked successfully",
      data: newsletter
    });
  } catch (error) {
    console.error("Error tracking clicks:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to track click", 
      error: error.message 
    });
  }
};

// Get click-through rate data for frontend display
export const getClickData = async (req, res) => {
  try {
    const clickData = await getFormattedClickData();
    return res.status(200).json(clickData);
  } catch (error) {
    console.error("Error fetching click data:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to fetch click-through data", 
      error: error.message 
    });
  }
};