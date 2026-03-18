module.exports = (req, res) => {
  const { order_id } = req.query;

  if (!order_id) {
    return res.status(400).json({
      error: "missing order_id"
    });
  }

  return res.status(200).json({
    order_id,
    status: "processing",
    price: 199,
    download_url: null
  });
};
