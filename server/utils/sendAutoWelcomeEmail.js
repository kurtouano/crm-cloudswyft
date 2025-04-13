  // Used in Lead Controller.js for Automated Sending Of Emails Upon Import Leads
 
  import axios from "axios";
  import { SentEmail } from "../models/EmailSchema.js";

  export const sendAutoWelcomeEmail = async (lead, accessToken) => {
    try {
      const emailContent = `
  Hi ${lead.company},

  I hope you're doing well!

  I wanted to personally check in and see if there's anything we can assist you with. Whether you need help with exploring our platform, have questions, or just want to explore new solutions for your business — we’re here for you.

  If you’d like, we can schedule a quick call to discuss how Cloudswyft can help you reach your goals.

  👉 [Schedule a Meeting]

  Thank you for being part of our community!

  Best regards,  
  Cloudswyft
  `;

    const emailData = {
      message: {
        subject: "Just Checking In — How Can We Help You Grow?",
        body: { contentType: "Text", content: emailContent },
        toRecipients: [{ emailAddress: { address: lead.bestEmail } }]
      },
      saveToSentItems: "true"
    };

    await axios.post("https://graph.microsoft.com/v1.0/me/sendMail", emailData, {
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    });

    await new SentEmail({
      to: lead.bestEmail,
      subject: "Just Checking In — How Can We Help You Grow?",
      content: emailContent,
      sentAt: new Date(),
      attachments: []
    }).save();

    console.log(`✅ Auto email sent to ${lead.bestEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${lead.bestEmail}:`, error.response?.data || error.message);
  }
};
