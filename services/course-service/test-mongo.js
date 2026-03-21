const mongoose = require('mongoose');
const uri = process.env.MONGO_URI || '<SET_YOUR_MONGODB_URI>';
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => { console.log('Connected successfully!'); process.exit(0); })
  .catch(err => { console.error('Connection error:', err.message); process.exit(1); });
