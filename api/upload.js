export const config = {
  api: {
    bodyParser: false, // Tắt bodyParser mặc định để hỗ trợ stream file dung lượng lớn
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Phương thức không được hỗ trợ' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ 
      error: 'Thiếu cấu hình TELEGRAM_BOT_TOKEN hoặc TELEGRAM_CHAT_ID trên Vercel Environment Variables.' 
    });
  }

  try {
    // Forward dữ liệu file trực tiếp lên Telegram API
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
      // Trả về file_id cố định vĩnh viễn
      return res.status(200).json({
        success: true,
        fileId: data.result.document.file_id,
        fileName: data.result.document.file_name,
        fileSize: data.result.document.file_size,
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        error: data.description || 'Không thể upload file lên Telegram.' 
      });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
