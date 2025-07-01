const axios = require('axios');
const fs = require('fs');

module.exports = {
  name: 'squidwardgrave',
  description: 'Generates a Squidward grave image with custom text for hridoy only',
  guide: '{pn}squidwardgrave <text>',
  usePrefix: true,

  async execute({ api, event, args }) {
    const text = args.join(' ');
    if (!text) return api.sendMessage('Please provide text! Use !squidwardgrave <text>', event.threadID);

    const author = 'hridoy';
    if (event.senderID !== author) return;

    const url = `https://sus-apis.onrender.com/api/squidward-grave?text=${encodeURIComponent(text)}`;
    const cacheDir = './cache';
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const pathImg = `${cacheDir}/squidward_grave.png`;

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      fs.writeFileSync(pathImg, Buffer.from(response.data));

      api.sendMessage(
        { attachment: fs.createReadStream(pathImg) },
        event.threadID,
        () => fs.unlinkSync(pathImg)
      );
    } catch (err) {
      api.sendMessage('Failed to generate image!', event.threadID);
    }
  }
};