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
    const response = await fetch("SEM_VLOZ_NOVY_WEBHOOK", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ submission_id }),
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
