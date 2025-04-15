import mongoose from 'mongoose';

const customerFeedbackSchema = new mongoose.Schema({
  rating: {
    type: String,
    enum: ['happy', 'neutral', 'sad'],
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});

const CustomerFeedback = mongoose.model('CustomerFeedback', customerFeedbackSchema);
export default CustomerFeedback;
