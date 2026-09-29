export default async function handler(req, res) {
  const { file_id } = req.query;

  if (!file_id) {
    return res.status(400).json({ error: 'Thiếu tham số file_id' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    return res.status(500).json({ error: 'Chưa cấu hình TELEGRAM_BOT_TOKEN trên Vercel.' });
  }

  try {
    // Gọi Telegram lấy file_path tươi mới
    const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${file_id}`);
    const fileData = await fileRes.json();

    if (fileData.ok) {
      const filePath = fileData.result.file_path;
      const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;
      
      // Chuyển hướng người dùng trực tiếp đến file
      return res.redirect(302, downloadUrl);
    } else {
      return res.status(404).json({ error: 'File không tồn tại hoặc đã bị xóa khỏi Telegram.' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
