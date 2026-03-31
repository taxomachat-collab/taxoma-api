// Proxy endpoint for Make webhook: get_checkout_url_by_order_key
// Receives order_key from frontend (/payment page)
// Sends it to Make and returns checkout_url when ready
// Handles JSON parsing and propagates Make errors to frontend

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  const { order_key } = req.query

  if (!order_key) {
    return res.status(400).json({
      error: "missing order_key",
    })
  }

  try {
    const response = await fetch("https://hook.eu2.make.com/d41g49upyg8qzbn2uq2vvxr3mxtlxue4", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ order_key }),
    })

    const text = await response.text()

    try {
      const data = JSON.parse(text)
      return res.status(response.status).json(data)
    } catch {
      return res.status(500).json({
        error: "invalid JSON from Make",
        make_status: response.status,
        raw: text,
      })
    }
  } catch (error) {
    return res.status(500).json({
      error: "failed to fetch from make",
      detail: String(error),
    })
  }
}
