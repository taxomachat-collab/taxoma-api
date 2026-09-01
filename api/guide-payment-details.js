import * as XLSX from "xlsx"

const FS_PAGE_URL =
    "https://financnisprava.gov.cz/cs/dane/placeni-dani/bankovni-ucty-financnich-uradu"

const CACHE_TTL = 24 * 60 * 60 * 1000

const UFO_NAMES = {
    "451": "Finanční úřad pro hlavní město Prahu",
    "452": "Finanční úřad pro Středočeský kraj",
    "453": "Finanční úřad pro Jihočeský kraj",
    "454": "Finanční úřad pro Plzeňský kraj",
    "455": "Finanční úřad pro Karlovarský kraj",
    "456": "Finanční úřad pro Ústecký kraj",
    "457": "Finanční úřad pro Liberecký kraj",
    "458": "Finanční úřad pro Královéhradecký kraj",
    "459": "Finanční úřad pro Pardubický kraj",
    "460": "Finanční úřad pro Kraj Vysočina",
    "461": "Finanční úřad pro Jihomoravský kraj",
    "462": "Finanční úřad pro Olomoucký kraj",
    "463": "Finanční úřad pro Moravskoslezský kraj",
    "464": "Finanční úřad pro Zlínský kraj",
}

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
    const response = await fetch(FS_PAGE_URL)

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
        throw new Error("Příloha č. 4 XLSX nebyla nalezena.")
    }

    const href = matches[0][1].replace(/&amp;/g, "&")

    return new URL(href, FS_PAGE_URL).href
}

async function loadFsData() {
    const now = Date.now()

    if (cache.rows && now - cache.loadedAt < CACHE_TTL) {
        return cache
    }

    const sourceUrl = await findCurrentXlsxUrl()

    const response = await fetch(sourceUrl)

    if (!response.ok) {
        throw new Error(`FS XLSX returned ${response.status}`)
    }

    const buffer = await response.arrayBuffer()

    const workbook = XLSX.read(buffer, {
        type: "array",
    })

    const rows = []

    // Prohledáme všechny listy, ne pouze první.
    for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName]

        const sheetRows = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            raw: false,
            defval: "",
        })

        rows.push(...sheetRows)
    }

    if (!rows.length) {
        throw new Error("XLSX neobsahuje žádná data.")
    }

    cache = {
        loadedAt: now,
        rows,
        sourceUrl,
    }

    return cache
}

function extractVatAccount(value) {
    const text = String(value ?? "")
        .replace(/\s+/g, "")
        .trim()

    // Standardní český formát účtu DPH finanční správy.
    const match = text.match(/705-\d{5,10}\/0710/)

    return match ? match[0] : null
}

function findVatAccount(rows, officeName) {
    const wantedOffice = normalize(officeName)

    /*
     * Nejprve najdeme řádek, který obsahuje název
     * konkrétního finančního úřadu.
     */
    const officeRows = rows.filter((row) => {
        const rowText = normalize(row.join(" "))

        return rowText.includes(wantedOffice)
    })

    /*
     * Bez jednoznačně nalezeného FÚ nic neodhadujeme.
     */
    if (!officeRows.length) {
        return null
    }

    const accounts = new Set()

    for (const row of officeRows) {
        for (const cell of row) {
            const account = extractVatAccount(cell)

            if (account) {
                accounts.add(account)
            }
        }
    }

    /*
     * Bezpečnostní pojistka:
     * přijmeme výsledek pouze tehdy, když jsme pro daný
     * finanční úřad našli právě jeden účet DPH.
     */
    if (accounts.size !== 1) {
        return null
    }

    return [...accounts][0]
}

export default async function handler(req, res) {
    // Povolit volání z Frameru / budoucí domény Taxomy.
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    // CORS preflight.
    if (req.method === "OPTIONS") {
        return res.status(204).end()
    }

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

    const officeName = UFO_NAMES[ufoCode]

    if (!officeName) {
        return res.status(404).json({
            ok: false,
            error: "unknown_financial_office",
            fallback: true,
        })
    }

    try {
        const fsData = await loadFsData()

        const account = findVatAccount(
            fsData.rows,
            officeName
        )

        if (!account) {
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

            office_name: officeName,

            tax: "DPH",
            account,

            source: "Finanční správa",
            source_url: fsData.sourceUrl,
        })
    } catch (error) {
        console.error(
            "guide-payment-details error:",
            error
        )

        return res.status(503).json({
            ok: false,
            error: "fs_data_unavailable",
            fallback: true,
        })
    }
}
