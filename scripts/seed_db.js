const { MongoClient } = require('mongodb');

async function seed() {
  const uri = 'mongodb+srv://remy12558_db_user:7UymPwodnvryZ9vZ@content-factory.kozprjg.mongodb.net/?appName=content-factory';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('posts');

    const thread = {
      topic: 'Justin Sun & WLFI: The Puppet Master',
      status: 'Draft',
      content: [
        { text: "The game has changed. WLFI isn't just another token; it's a narrative experiment in the 'Celebrity-Industrial Complex' of crypto. 🧵", order: 1 },
        { text: "Enter Justin Sun. The ultimate catalyst. The man who knows exactly how to bridge the gap between legacy hype and degenerate liquidity. He's the Puppet Master for a reason.", order: 2 },
        { text: "While the masses argue about 'utility', the real alpha is in the distribution network. Sun doesn't build tools; he builds highways for attention.", order: 3 },
        { text: "WLFI represents the convergence of political influence and crypto-native marketing. If you're looking for a whitepaper, you're playing the wrong game.", order: 4 },
        { text: "The strategy is clear: Capture the narrative early, leverage the network effect, and let the market figure out the valuation. Classic Sun. Classic Puppet Master.", order: 5 },
        { text: "Conclusion: Don't fight the tape. Understand the puppeteer, and you'll understand where the liquidity is flowing. 🜂", order: 6 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(thread);
    console.log('Successfully seeded post with id:', result.insertedId);
  } catch (e) {
    console.error('Error seeding database:', e);
  } finally {
    await client.close();
  }
}

seed();
