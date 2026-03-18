export default async function handler(req, res) {
  const { order_id } = req.query;

  if (!order_id) {
    return res.status(400).json({
      error: "missing order_id"
    });
  }

  try {
    const response = await fetch("SEM_DÁŠ_WEBHOOK_URL", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ order_id })
    });

    const data = await response.json();

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: "failed to fetch from make"
    });
  }
}
