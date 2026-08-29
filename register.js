/**
 * Taxoma — registration submit endpoint
 *
 * Framer -> Vercel -> Make
 *
 * Make webhook is NEVER exposed to the frontend.
 * Store it in Vercel as:
 * MAKE_REGISTER_WEBHOOK_URL
 */

function setCors(res) {
    const allowedOrigins = [
        "https://taxoma.cz",
        "https://www.taxoma.cz",
        // During Framer testing you can temporarily add
        // your current Framer domain here.
    ]

    const origin = res.req?.headers?.origin

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

function boolean(value) {
    return value === true
}

function isValidIco(value) {
    return /^\d{8}$/.test(value)
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false

    const date = new Date(`${value}T12:00:00Z`)

    return !Number.isNaN(date.getTime())
}

function isValidReason(value) {
    return [1, 2, 3].includes(Number(value))
}

function isValidSubmissionId(value) {
    return /^[a-zA-Z0-9_-]{10,100}$/.test(value)
}

function normalizeBody(body) {
    return {
        action: "register",

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

        liability_start_date: text(
            body.liability_start_date,
            10
        ),

        delivery_street: text(
            body.delivery_street,
            150
        ),

        delivery_house_number: text(
            body.delivery_house_number,
            30
        ),

        delivery_orientation_number: text(
            body.delivery_orientation_number,
            30
        ),

        delivery_city: text(
            body.delivery_city,
            150
        ),

        delivery_postal_code: text(
            body.delivery_postal_code,
            10
        ),

        delivery_address_differs: boolean(
            body.delivery_address_differs
        ),

        register_reason: Number(body.register_reason),

        submission_id: text(
            body.submission_id,
            100
        ),

        lang: body.lang === "uk" ? "uk" : "cs",

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

    if (!isValidDate(data.liability_start_date)) {
        errors.push("invalid_liability_start_date")
    }

    if (!isValidReason(data.register_reason)) {
        errors.push("invalid_register_reason")
    }

    if (!isValidSubmissionId(data.submission_id)) {
        errors.push("invalid_submission_id")
    }

    if (data.delivery_address_differs) {
        if (!data.delivery_street) {
            errors.push("missing_delivery_street")
        }

        if (!data.delivery_house_number) {
            errors.push("missing_delivery_house_number")
        }

        if (!data.delivery_city) {
            errors.push("missing_delivery_city")
        }

        if (!data.delivery_postal_code) {
            errors.push("missing_delivery_postal_code")
        }
    }

    return errors
}

export default async function handler(req, res) {
    setCors(res)

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

        const makeResponse = await fetch(webhookUrl, {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },

            body: JSON.stringify(data),

            signal: AbortSignal.timeout(15000),
        })

        if (!makeResponse.ok) {
            console.error(
                "Make webhook failed:",
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
            "Registration endpoint error:",
            error
        )

        return res.status(500).json({
            success: false,
            error: "internal_error",
        })
    }
}
