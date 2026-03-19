module.exports = async (req, res) => {
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

    const data = await response.json();

    return res.status(200).json({
      order_key,
      ...data
    });
  } catch (error) {
    return res.status(500).json({
      error: "failed to fetch from make"
    });
  }
};
