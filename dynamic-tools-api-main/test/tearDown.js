const { execSync } = require('child_process');

module.exports = async () =>
  await new Promise(async (resolve, reject) => {
    setTimeout(() => {
      resolve();
      process.exit();
    }, 1000);
  });
