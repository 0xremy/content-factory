const mongoose = require('mongoose');

const URI = 'mongodb+srv://remy12558_db_user:7UymPwodnvryZ9vZ@content-factory.kozprjg.mongodb.net/content-factory?retryWrites=true&w=majority&appName=content-factory';

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const Post = mongoose.model('Post', postSchema);

async function testConnection() {
  console.log('Testing connection to MongoDB Atlas...');
  try {
    await mongoose.connect(URI, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    console.log('✅ Successfully connected to MongoDB Atlas!');

    console.log('Attempting to write a test post...');
    const testPost = new Post({
      title: 'Connectivity Test',
      content: 'This is a test post to verify Render-Atlas connectivity.',
    });
    const savedPost = await testPost.save();
    console.log('✅ Successfully wrote test post with ID:', savedPost._id);

    console.log('Cleaning up test post...');
    await Post.findByIdAndDelete(savedPost._id);
    console.log('✅ Successfully deleted test post.');

    console.log('Everything is working perfectly!');
  } catch (err) {
    console.error('❌ Connection test failed:');
    console.error(err);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

testConnection();
