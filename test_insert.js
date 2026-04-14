const mongoose = require('mongoose');

const MONGO_URI = 'mongodb+srv://remy12558_db_user:matkhau258@content-factory.kozprjg.mongodb.net/content-factory?appName=content-factory';

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');
    
    const Post = mongoose.model('Post', new mongoose.Schema({
      title: String,
      content: mongoose.Schema.Types.Mixed,
      status: String,
      language: String,
      createdAt: { type: Date, default: Date.now }
    }));

    const testPost = {
      title: '[TEST] Hệ thống đã thông!',
      content: 'Đây là bài test nhỏ để kiểm tra kết nối. Nếu anh thấy dòng này, mọi thứ đã OK! ✅',
      status: 'pending',
      language: 'vi'
    };

    const result = await Post.create(testPost);
    console.log('✅ Successfully inserted test post:', result._id);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

run();
