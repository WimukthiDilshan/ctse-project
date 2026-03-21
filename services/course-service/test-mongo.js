const mongoose = require('mongoose');
const uri = 'mongodb+srv://wimukthi2010_db_user:OOamEpUlOFQ8lPWn@cluster0.awyrjzu.mongodb.net/student_db?appName=Cluster0';
mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 })
  .then(() => { console.log('Connected successfully!'); process.exit(0); })
  .catch(err => { console.error('Connection error:', err.message); process.exit(1); });
