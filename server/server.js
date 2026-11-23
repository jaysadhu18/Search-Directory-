const app = require('./src/app');
const { ready } = require('./src/db/connection');

const PORT = process.env.PORT || 5000;

ready
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize the database:', error);
    process.exit(1);
  });
