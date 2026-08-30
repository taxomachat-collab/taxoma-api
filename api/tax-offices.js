/**
 * Tax office codelist API endpoint for Taxoma
 *
 * Server-side proxy for the official MOJE daně codelist.
 * Returns a simplified JSON list for the Framer frontend.
 */

function setCors(res) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

function normalizeText(value) {
    return String(value || "")
        .replace(/\s+/g, " ")
        .trim()
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

    try {
        const today = new Date().toISOString().slice(0, 10)

        const url =
            `https://mojedane.gov.cz/dpr/epo_ciselnik` +
            `?C=pracufo&PL=${encodeURIComponent(today)}`

        const response = await fetch(url, {
            method: "GET",
            headers: {
                Accept: "application/xml,text/xml,*/*",
                "User-Agent": "Taxoma/1.0",
            },
        })

        if (!response.ok) {
            const text = await response.text()

            return res.status(502).json({
                success: false,
                error: "tax_office_upstream_error",
                upstream_status: response.status,
                upstream_body: text.slice(0, 500),
            })
        }

        const xmlText = await response.text()

        if (!xmlText.trim()) {
            return res.status(502).json({
                success: false,
                error: "empty_tax_office_response",
            })
        }

        const tagMatches = xmlText.match(/<[^!?][^>]*>/g) || []

        const seen = new Set()
        const offices = []

        for (const tag of tagMatches) {
            const attrs = {}

            const attrRegex =
                /([A-Za-z0-9_:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g

            let match

            while ((match = attrRegex.exec(tag)) !== null) {
                attrs[match[1].toLowerCase()] =
                    match[2] ?? match[3] ?? ""
            }

            const pracufo =
                attrs.c_pracufo ||
                attrs.pracufo ||
                attrs.k_pracufo ||
                attrs.k_ufo_vema ||
                ""

            if (!/^\d{4}$/.test(pracufo)) continue
            if (seen.has(pracufo)) continue

            const ufo =
                attrs.c_ufo ||
                attrs.ufo ||
                attrs.k_ufo ||
                ""

            if (!ufo) continue

            const preferredNameKeys = [
                "nazev",
                "naz_pracufo",
                "nazu_pracufo",
                "naz_prac",
                "nazu_prac",
                "nazev_prac",
                "naz_ufo",
                "nazu_ufo",
                "popis",
            ]

            let name = ""

            for (const key of preferredNameKeys) {
                if (
                    attrs[key] &&
                    /[A-Za-zÁ-ž]/.test(attrs[key])
                ) {
                    name = normalizeText(attrs[key])
                    break
                }
            }

            if (!name) {
                const candidates = Object.values(attrs)
                    .filter(
                        (value) =>
                            typeof value === "string" &&
                            /[A-Za-zÁ-ž]/.test(value) &&
                            !/^\d{4}-\d{2}-\d{2}$/.test(value)
                    )
                    .sort((a, b) => b.length - a.length)

                name = normalizeText(candidates[0] || "")
            }

            if (!name) continue

            seen.add(pracufo)

            offices.push({
                pracufo,
                ufo,
                name,
            })
        }

        offices.sort((a, b) =>
            a.name.localeCompare(b.name, "cs", {
                sensitivity: "base",
            })
        )

        if (!offices.length) {
            return res.status(502).json({
                success: false,
                error: "tax_office_parse_failed",
                preview: xmlText.slice(0, 1000),
            })
        }

        res.setHeader(
            "Cache-Control",
            "public, s-maxage=86400, stale-while-revalidate=604800"
        )

        return res.status(200).json({
            success: true,
            count: offices.length,
            offices,
        })
    } catch (error) {
        console.error("tax-offices error:", error)

        return res.status(500).json({
            success: false,
            error: "internal_error",
            message:
                error instanceof Error
                    ? error.message
                    : String(error),
        })
    }
}
