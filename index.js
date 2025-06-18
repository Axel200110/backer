require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

const downloadFolder = path.join(__dirname, 'downloads');

// Create download folder if not exist
if (!fs.existsSync(downloadFolder)) {
  fs.mkdirSync(downloadFolder);
}

app.post('/download', (req, res) => {
  const { url, format } = req.body;

  if (!url || !format) {
    return res.status(400).json({ error: 'URL or format missing' });
  }

  const uniqueFilename = Date.now().toString();
  let command = '';

  switch (format) {
    case 'best':
      command = `yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best" --merge-output-format mp4 -o "${downloadFolder}/${uniqueFilename}.%(ext)s" "${url}"`;
      break;
    case 'mp4':
      command = `yt-dlp -S ext:mp4,res,codec:avc -f "bv*+ba/best" --merge-output-format mp4 -o "${downloadFolder}/${uniqueFilename}.%(ext)s" "${url}"`;
      break;
    case '720p':
      command = `yt-dlp -S ext:mp4,res,codec:avc -f "bestvideo[height<=720]+bestaudio/best" --merge-output-format mp4 -o "${downloadFolder}/${uniqueFilename}.%(ext)s" "${url}"`;
      break;
    case '1080p':
      command = `yt-dlp -S ext:mp4,res,codec:avc -f "bestvideo[height<=1080]+bestaudio/best" --merge-output-format mp4 -o "${downloadFolder}/${uniqueFilename}.%(ext)s" "${url}"`;
      break;
    case '4k':
      command = `yt-dlp -S ext:mp4,res,codec:avc -f "bestvideo[height<=2160]+bestaudio/best" --merge-output-format mp4 -o "${downloadFolder}/${uniqueFilename}.%(ext)s" "${url}"`;
      break;
    default:
      return res.status(400).json({ error: 'Invalid format selected' });
  }

  exec(command, (error) => {
    if (error) {
      console.error(`Download error: ${error.message}`);
      return res.status(500).json({ error: 'Download failed' });
    }

    const downloadedFile = fs.readdirSync(downloadFolder).find(f => f.startsWith(uniqueFilename) && f.endsWith('.mp4'));
    if (!downloadedFile) {
      return res.status(500).json({ error: 'Downloaded file not found' });
    }

    const filePath = path.join(downloadFolder, downloadedFile);
    res.download(filePath, (err) => {
      if (err) {
        console.error(`File send error: ${err.message}`);
      }
      fs.unlinkSync(filePath); // delete file after sending
    });
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
