export const config = {
  api: {
    bodyParser: false, // Tắt bodyParser để stream file nhị phân
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ error: 'Chưa cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trên Vercel' });
  }

  try {
    // 1. Upload file trực tiếp lên Telegram Channel/Chat
    const response = await fetch(`https://api.telegram.org/bot${token}/sendDocument?chat_id=${chatId}`, {
      method: 'POST',
      headers: {
        'content-type': req.headers['content-type'],
      },
      body: req,
      duplex: 'half',
    });

    const data = await response.json();

    if (data.ok) {
      const fileId = data.result.document.file_id;
      
      // 2. Lấy File Path từ Telegram để tạo Direct Download Link
      const fileRes = await fetch(`https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`);
      const fileData = await fileRes.json();
      const filePath = fileData.result.file_path;
      const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

      return res.status(200).json({
        success: true,
        fileName: data.result.document.file_name,
        fileSize: data.result.document.file_size,
        downloadUrl: downloadUrl,
      });
    } else {
      return res.status(400).json({ success: false, error: data.description });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
