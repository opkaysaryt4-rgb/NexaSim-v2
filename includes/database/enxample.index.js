const { MongoClient } = require('mongodb');
const logger = require('../logger');

const uri = "mongodb+srv://Kawsar9340:Kawsar9340@kawsar0340.nqwjiif.mongodb.net/?retryWrites=true&w=majority&appName=Kawsar0340"; // Replace with your MongoDB URL
const client = new MongoClient(uri);

async function connect() {
    try {
        await client.connect();
        logger.info('Connected to MongoDB');
        return client.db('nexasim');
    } catch (err) {
        logger.error(`Failed to connect to MongoDB: ${err.message}`);
        process.exit(1);
    }
}

module.exports = { connect };
