// Used by /finished page to poll order status and retrieve XML download URL

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { order_key } = req.query;

  if (!order_key) {
    return res.status(400).json({
      error: "missing order_key"
    });
  }

  try {
    const response = await fetch("https://hook.eu2.make.com/wvw8a6xobfpmuswkv3nn77j2n5kb6x4n", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ order_key })
    });

    const text = await response.text();

    try {
      const data = JSON.parse(text);
      return res.status(200).json({
        order_key,
        ...data
      });
    } catch {
      return res.status(500).json({
        error: "make returned invalid json",
        raw_response: text
      });
    }
  } catch (error) {
    return res.status(500).json({
      error: "failed to fetch from make",
      detail: String(error)
    });
  }
};
