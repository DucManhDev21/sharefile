import formidable from 'formidable';
import fs from 'fs';
import FormData from 'form-data';

export const config = {
  api: {
    bodyParser: false,
  },
};

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method không hợp lệ' });
  }

  const form = formidable({});

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: 'Lỗi đọc file tải lên' });

    const file = files.document?.[0] || files.document;
    if (!file) return res.status(400).json({ error: 'Không tìm thấy tệp gửi lên' });

    try {
      const formData = new FormData();
      formData.append('chat_id', CHAT_ID);
      formData.append('document', fs.createReadStream(file.filepath), file.originalFilename);

      const telegramRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, {
        method: 'POST',
        body: formData,
      });

      const data = await telegramRes.json();
      if (!data.ok) throw new Error(data.description || 'Lỗi gửi file lên Telegram');

      const doc = data.result.document;
      return res.status(200).json({
        success: true,
        fileId: doc.file_id,
        fileName: doc.file_name,
        fileSize: doc.file_size
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  });
}
