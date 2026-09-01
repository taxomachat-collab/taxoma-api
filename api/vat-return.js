/**
 * Taxoma — VAT return submit endpoint
 *
 * Framer -> Vercel -> Make
 *
 * Uses the same Make webhook as registration:
 * MAKE_REGISTER_WEBHOOK_URL
 */

function setCors(req, res) {
    const allowedOrigins = [
        "https://taxoma.cz",
        "https://www.taxoma.cz",
        "https://nuanced-outcomes-882593.framer.app",
    ]

    const origin = req.headers.origin

    if (origin && allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin)
        res.setHeader("Vary", "Origin")
    }

    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")
}

function text(value, maxLength = 500) {
    if (value === null || value === undefined) return ""

    return String(value)
        .trim()
        .slice(0, maxLength)
}

function number(value) {
    const n = Number(value)
    return Number.isFinite(n) ? n : 0
}

function boolean(value) {
    return value === true
}

function isValidIco(value) {
    return /^\d{8}$/.test(value)
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidTaxPeriod(value) {
    return /^\d{4}-\d{2}-\d{2}$/.test(value)
}

function isValidSubmissionState(value) {
    return ["first_submit", "already_submitted"].includes(value)
}

function isValidSubmissionId(value) {
    return /^[a-zA-Z0-9_-]{10,150}$/.test(value)
}

function normalizeBody(body) {
    return {
        action: "vat_return",

        ico: text(body.ico, 8),
        dic: text(body.dic, 20),

        first_name: text(body.first_name, 150),
        last_name: text(body.last_name, 150),

        street: text(body.street, 150),
        house_number: text(body.house_number, 30),
        orientation_number: text(body.orientation_number, 30),
        city: text(body.city, 150),
        postal_code: text(body.postal_code, 10),

        email: text(body.email, 254),
        phone: text(body.phone, 30),

        tax_office: text(body.tax_office, 50),

        tax_period_raw: text(body.tax_period_raw, 10),
        base_amount: number(body.base_amount),

        submission_id: text(body.submission_id, 150),
        submission_state: text(body.submission_state, 50),

        additional_reason_text:
            body.additional_reason_text === null
                ? null
                : text(body.additional_reason_text, 1000),

        additional_reason_date: text(
            body.additional_reason_date,
            10
        ),

        lang: body.lang === "uk" ? "uk" : "cs",

        is_late: boolean(body.is_late),

        ref: text(body.ref, 150),
        test: text(body.test, 100),
    }
}

function validate(data) {
    const errors = []

    if (!isValidIco(data.ico)) {
        errors.push("invalid_ico")
    }

    if (!data.first_name) {
        errors.push("missing_first_name")
    }

    if (!data.last_name) {
        errors.push("missing_last_name")
    }

    if (!data.street) {
        errors.push("missing_street")
    }

    if (!data.house_number) {
        errors.push("missing_house_number")
    }

    if (!data.city) {
        errors.push("missing_city")
    }

    if (!data.postal_code) {
        errors.push("missing_postal_code")
    }

    if (!isValidEmail(data.email)) {
        errors.push("invalid_email")
    }

    if (!data.tax_office) {
        errors.push("missing_tax_office")
    }

    if (!isValidTaxPeriod(data.tax_period_raw)) {
        errors.push("invalid_tax_period")
    }

    if (!(data.base_amount > 0)) {
        errors.push("invalid_base_amount")
    }

    if (!isValidSubmissionState(data.submission_state)) {
        errors.push("invalid_submission_state")
    }

    if (!isValidSubmissionId(data.submission_id)) {
        errors.push("invalid_submission_id")
    }

    if (
        data.submission_state === "already_submitted" &&
        data.is_late
    ) {
        if (!data.additional_reason_text) {
            errors.push("missing_additional_reason_text")
        }

        if (
            !/^\d{4}-\d{2}-\d{2}$/.test(
                data.additional_reason_date
            )
        ) {
            errors.push("invalid_additional_reason_date")
        }
    }

    return errors
}

export default async function handler(req, res) {
    setCors(req, res)

    if (req.method === "OPTIONS") {
        return res.status(204).end()
    }

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "method_not_allowed",
        })
    }

    const webhookUrl =
        process.env.MAKE_REGISTER_WEBHOOK_URL

    if (!webhookUrl) {
        console.error(
            "MAKE_REGISTER_WEBHOOK_URL is not configured"
        )

        return res.status(500).json({
            success: false,
            error: "server_configuration_error",
        })
    }

    try {
        const body =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : req.body

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body)
        ) {
            return res.status(400).json({
                success: false,
                error: "invalid_request_body",
            })
        }

        const data = normalizeBody(body)
        const errors = validate(data)

        if (errors.length > 0) {
            return res.status(400).json({
                success: false,
                error: "validation_failed",
                fields: errors,
            })
        }

        const makeResponse = await fetch(
            webhookUrl,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },

                body: JSON.stringify(data),

                signal:
                    AbortSignal.timeout(15000),
            }
        )

        if (!makeResponse.ok) {
            console.error(
                "Make VAT return webhook failed:",
                makeResponse.status
            )

            return res.status(502).json({
                success: false,
                error: "processing_failed",
            })
        }

        return res.status(200).json({
            success: true,
            submission_id: data.submission_id,
        })
    } catch (error) {
        console.error(
            "VAT return endpoint error:",
            error
        )

        return res.status(500).json({
            success: false,
            error: "internal_error",
        })
    }
}
