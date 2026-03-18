export default function handler(req, res) {
  res.status(200).json({
    message: "API funguje",
    time: new Date().toISOString()
  });
}
// deploy trigger
