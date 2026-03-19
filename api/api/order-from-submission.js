// Used by /processing page to retrieve order_key from submission_id

module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
  res.setHeader("Access-Control-Allow-Headers", "Content-Type")

  if (req.method === "OPTIONS") {
    return res.status(200).end()
  }

  const { submission_id } = req.query

  if (!submission_id) {
    return res.status(400).json({
      error: "missing submission_id",
    })
  }

  try {
    const response = await fetch("https://hook.eu2.make.com/hmrp34yaqnj5io0rytrz0xvk431s36bn", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ submission_id }),
    })

    const text = await response.text()

    try {
      const data = JSON.parse(text)
      return res.status(200).json(data)
    } catch {
      return res.status(500).json({
        error: "make returned invalid json",
        raw_response: text,
      })
    }
  } catch (error) {
    return res.status(500).json({
      error: "failed to fetch from make",
      detail: String(error),
    })
  }
}
