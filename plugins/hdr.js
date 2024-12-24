import FormData from 'form-data';
import Jimp from 'jimp';

let handler = async (m, { conn, usedPrefix, command }) => {
  const waitMessage = 'Processing... Please wait.';
  const supportedMimeTypes = /image\/(jpe?g|png)/;

  const processImage = async (actionKey, method) => {
    conn[actionKey] = conn[actionKey] || {};
    let q = m.quoted || m;
    let mime = (q.msg || q).mimetype || q.mediaType || '';

    if (!mime) throw 'Please provide a photo.';
    if (!supportedMimeTypes.test(mime)) throw `Mime type ${mime} is not supported.`;

    conn[actionKey][m.sender] = true;
    m.reply(waitMessage);

    let img = await q.download();
    if (!img) throw 'Failed to download the image.';

    let error = false;
    try {
      const processedImage = await processing(img, method);
      await conn.sendFile(m.chat, processedImage, '', 'Done!', m);
    } catch (e) {
      error = true;
      console.error(e);
    } finally {
      if (error) {
        m.reply('Process failed :(');
      }
      delete conn[actionKey][m.sender];
    }
  };

  switch (command) {
    case 'dehaze':
      await processImage('enhancer', 'dehaze');
      break;
    case 'recolor':
      await processImage('recolor', 'recolor');
      break;
    case 'hdr':
      await processImage('hdr', 'enhance');
      break;
    default:
      throw 'Unknown command.';
  }
};

handler.help = ['dehaze', 'recolor', 'hdr'];
handler.tags = ['tools'];
handler.command = ['dehaze', 'recolor', 'hdr'];
export default handler;

async function processing(imageBuffer, method) {
  const supportedMethods = ['enhance', 'recolor', 'dehaze'];
  if (!supportedMethods.includes(method)) method = 'enhance';

  const form = new FormData();
  form.append('model_version', 1);
  form.append('image', imageBuffer, {
    filename: 'enhance_image_body.jpg',
    contentType: 'image/jpeg',
  });

  const url = `https://inferenceengine.vyro.ai/${method}`;

  return new Promise((resolve, reject) => {
    form.submit(
      {
        url: url,
        headers: {
          'User-Agent': 'okhttp/4.9.3',
          Connection: 'Keep-Alive',
          'Accept-Encoding': 'gzip',
        },
      },
      (err, res) => {
        if (err) return reject(err);

        let data = [];
        res
          .on('data', chunk => data.push(chunk))
          .on('end', () => resolve(Buffer.concat(data)))
          .on('error', reject);
      }
    );
  });
}
