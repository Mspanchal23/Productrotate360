const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const fs = require('fs');

// Point fluent-ffmpeg to the local binaries
const ffmpegDir = path.join(__dirname, '../ffmpeg');
ffmpeg.setFfmpegPath(path.join(ffmpegDir, 'ffmpeg.exe'));
ffmpeg.setFfprobePath(path.join(ffmpegDir, 'ffprobe.exe'));

const extractFrames = (videoPath, productId, frameCount = 72) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, '../uploads/frames', productId);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // First, get video duration
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        return reject(new Error(`FFprobe error: ${err.message}`));
      }

      const duration = metadata.format.duration;
      const fps = frameCount / duration;
      const frames = [];

      ffmpeg(videoPath)
        .outputOptions([
          `-vf fps=${fps},scale=1200:-1`,
          '-q:v 2',
          '-f image2',
        ])
        .output(path.join(outputDir, 'frame-%03d.jpg'))
        .on('end', () => {
          // Read extracted frames
          const files = fs.readdirSync(outputDir)
            .filter((f) => f.endsWith('.jpg'))
            .sort();

          files.forEach((file, index) => {
            frames.push({
              index,
              path: `/uploads/frames/${productId}/${file}`,
              width: 1200,
              height: 0, // Will be determined by aspect ratio
            });
          });

          resolve(frames);
        })
        .on('error', (err) => {
          reject(new Error(`FFmpeg error: ${err.message}`));
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${Math.round(progress.percent || 0)}%`);
        })
        .run();
    });
  });
};

module.exports = { extractFrames };
