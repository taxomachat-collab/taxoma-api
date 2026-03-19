// Used by /payment page
// Sends order_key to Make webhook

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

    const data = await response.json()

    return res.status(200).json(data)
  } catch (error) {
    return res.status(500).json({
      error: "failed to fetch from make",
      detail: String(error),
    })
  }
}
