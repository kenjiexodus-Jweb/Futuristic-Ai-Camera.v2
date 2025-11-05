require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const FormData = require('form-data');

const app = express();
const port = process.env.PORT || 3000;
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(express.static('public'));

app.post('/upload', upload.single('photo'), async (req, res) => {
  const photoPath = req.file.path;
  console.log('📸 Photo received:', photoPath);
  console.log('➡️ Sending to Telegram...');

  const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`;

  try {
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('photo', fs.createReadStream(photoPath));

    const response = await axios.post(telegramUrl, formData, {
      headers: formData.getHeaders(),
    });

    console.log('📬 Telegram response:', response.data);
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Telegram error:', error.response?.data || error.message);
    res.status(500).json({ success: false });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});