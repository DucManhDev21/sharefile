const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export default async function handler(req, res) {
  const { file_id } = req.query;

  if (!file_id) {
    return res.status(400).json({ error: 'Thiếu tham số file_id' });
  }

  try {
    const fileRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file_id}`);
    const fileData = await fileRes.json();

    if (!fileData.ok) {
      throw new Error('Không lấy được đường dẫn file từ Telegram');
    }

    const filePath = fileData.result.file_path;
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${filePath}`;

    // Tự động chuyển hướng tới đường dẫn tải trực tiếp
    return res.redirect(302, fileUrl);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
