import * as XLSX from "xlsx"

const FS_PAGE_URL =
    "https://financnisprava.gov.cz/cs/dane/placeni-dani/bankovni-ucty-financnich-uradu"

const CACHE_TTL = 24 * 60 * 60 * 1000

let cache = {
    loadedAt: 0,
    rows: null,
    sourceUrl: null,
}

function normalize(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
}

async function findCurrentXlsxUrl() {
    const response = await fetch(FS_PAGE_URL, {
        headers: {
            "User-Agent": "Taxoma/1.0",
        },
    })

    if (!response.ok) {
        throw new Error(`FS page returned ${response.status}`)
    }

    const html = await response.text()

    const matches = [
        ...html.matchAll(
            /href=["']([^"']*priloha_4[^"']*\.xlsx[^"']*)["']/gi
        ),
    ]

    if (!matches.length) {
        throw new Error("Příloha č. 4 XLSX nebyla na stránce FS nalezena.")
    }

    let url = matches[0][1]

    url = url.replace(/&amp;/g, "&")

    if (url.startsWith("/")) {
        url = new URL(url, FS_PAGE_URL).href
    }

    if (!/^https?:\/\//i.test(url)) {
        url = new URL(url, FS_PAGE_URL).href
    }

    return url
}

async function loadFsData() {
    const now = Date.now()

    if (
        cache.rows &&
        cache.loadedAt &&
        now - cache.loadedAt < CACHE_TTL
    ) {
        return cache
    }

    const xlsxUrl = await findCurrentXlsxUrl()

    const response = await fetch(xlsxUrl, {
        headers: {
            "User-Agent": "Taxoma/1.0",
        },
    })

    if (!response.ok) {
        throw new Error(`FS XLSX returned ${response.status}`)
    }

    const arrayBuffer = await response.arrayBuffer()

    const workbook = XLSX.read(arrayBuffer, {
        type: "array",
    })

    const firstSheetName = workbook.SheetNames[0]

    if (!firstSheetName) {
        throw new Error("XLSX Finanční správy neobsahuje žádný list.")
    }

    const sheet = workbook.Sheets[firstSheetName]

    const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        raw: false,
        defval: "",
    })

    if (!rows.length) {
        throw new Error("XLSX Finanční správy je prázdný.")
    }

    cache = {
        loadedAt: now,
        rows,
        sourceUrl: xlsxUrl,
    }

    return cache
}

function findVatAccount(rows, ufoCode) {
    /*
     * Prozatím z XLSX hledáme:
     * - řádek příslušného finančního úřadu
     * - účet DPH začínající 705-
     *
     * UFO kód používáme hlavně k jednoznačnému napojení v dalším kroku.
     *
     * Důležité:
     * pokud se struktura XLSX změní nebo účet nenajdeme jednoznačně,
     * endpoint raději selže a frontend použije ruční fallback.
     */

    const accountRegex = /\b705-\d{5,10}\/0710\b/

    const matchingRows = rows.filter((row) => {
        const text = row.map(normalize).join(" ")
        return text.includes(normalize(ufoCode))
    })

    for (const row of matchingRows) {
        for (const cell of row) {
            const value = String(cell ?? "").trim()
            const match = value.match(accountRegex)

            if (match) {
                return {
                    account: match[0],
                    row,
                }
            }
        }
    }

    return null
}

export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET")

        return res.status(405).json({
            ok: false,
            error: "method_not_allowed",
        })
    }

    const office =
        typeof req.query.office === "string"
            ? req.query.office.trim()
            : ""

    if (!office) {
        return res.status(400).json({
            ok: false,
            error: "missing_office",
        })
    }

    const parts = office.split("|")

    if (parts.length !== 2) {
        return res.status(400).json({
            ok: false,
            error: "invalid_office",
        })
    }

    const [workplaceCode, ufoCode] = parts

    if (!workplaceCode || !ufoCode) {
        return res.status(400).json({
            ok: false,
            error: "invalid_office",
        })
    }

    try {
        const fsData = await loadFsData()

        const result = findVatAccount(fsData.rows, ufoCode)

        if (!result) {
            return res.status(404).json({
                ok: false,
                error: "vat_account_not_found",
                fallback: true,
            })
        }

        return res.status(200).json({
            ok: true,
            office,
            workplace_code: workplaceCode,
            ufo: ufoCode,
            account: result.account,
            source: "Finanční správa",
            source_url: fsData.sourceUrl,
        })
    } catch (error) {
        console.error("payment-details error:", error)

        return res.status(503).json({
            ok: false,
            error: "fs_data_unavailable",
            fallback: true,
        })
    }
}
