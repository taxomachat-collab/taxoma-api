import { getCzechNameGreeting } from "../data/czech-names.js"

function setCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

export default async function handler(req, res) {
    setCors(res)

    if (req.method === "OPTIONS") {
        return res.status(200).end()
    }

    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            error: "method_not_allowed",
        })
    }

    const name = String(req.query.name || "").trim()

    if (!name) {
        return res.status(400).json({
            success: false,
            error: "missing_name",
        })
    }

    const vocative = getCzechNameGreeting(name)

    return res.status(200).json({
        success: true,
        name,
        vocative,
        found: vocative !== null,
    })
}
