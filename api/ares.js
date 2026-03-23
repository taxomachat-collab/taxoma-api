import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

export default function IcoLookupRedirect(props) {
    const [ico, setIco] = React.useState("")
    const [loading, setLoading] = React.useState(false)
    const [error, setError] = React.useState("")

    const handleSubmit = async () => {
        const cleanIco = ico.replace(/\D/g, "")

        if (!/^\d{8}$/.test(cleanIco)) {
            setError("IČO musí mít 8 číslic.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch(
                `${props.apiBaseUrl}/api/ares?ico=${encodeURIComponent(cleanIco)}`
            )
            const data = await res.json()

            if (!data.success) {
                if (data.error === "subject_not_found") {
                    setError("Zadané IČO se nepodařilo najít.")
                } else if (
                    data.error === "invalid_ico_format" ||
                    data.error === "invalid_ico_checksum"
                ) {
                    setError("IČO není platné.")
                } else {
                    setError("Nepodařilo se načíst údaje. Zkuste to znovu.")
                }
                return
            }

            const s = data.subject

            if (!s.is_supported_for_this_service) {
                setError("Tahle služba je určena pouze pro OSVČ.")
                return
            }

            const parts = String(s.name || "")
                .trim()
                .split(/\s+/)
            const first_name = parts[0] || ""
            const last_name = parts.slice(1).join(" ") || ""

            const params = new URLSearchParams({
                ico: s.ico || "",
                dic: s.dic || "",
                first_name,
                last_name,
                street: s.street || "",
                house_number: String(s.descriptive_number ?? ""),
                orientation_number: String(s.orientation_number ?? ""),
                city: s.city || "",
                postal_code: s.zip || "",
            })

            window.location.href = `${props.filloutUrl}?${params.toString()}`
        } catch (e) {
            setError("Nepodařilo se načíst údaje. Zkuste to znovu.")
        } finally {
            setLoading(false)
        }
    }

    const onKeyDown = (e) => {
        if (e.key === "Enter" && !loading) {
            handleSubmit()
        }
    }

    return (
        <div style={wrapperStyle}>
            {props.showHeading && (
                <h3 style={headingStyle}>{props.headingText}</h3>
            )}

            {props.showDescription && (
                <p style={descriptionStyle}>{props.descriptionText}</p>
            )}

            <div style={rowStyle(props.stackOnMobile)}>
                <input
                    value={ico}
                    onChange={(e) => setIco(e.target.value)}
                    onKeyDown={onKeyDown}
                    inputMode="numeric"
                    placeholder={props.placeholder}
                    style={inputStyle}
                    disabled={loading}
                />

                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    style={buttonStyle}
                >
                    {loading ? props.loadingText : props.buttonText}
                </button>
            </div>

            <div style={messageWrapStyle}>
                {error ? (
                    <p style={errorStyle}>{error}</p>
                ) : (
                    <p style={hintStyle}>{props.hintText}</p>
                )}
            </div>
        </div>
    )
}

addPropertyControls(IcoLookupRedirect, {
    apiBaseUrl: {
        type: ControlType.String,
        title: "API Base URL",
        defaultValue: "https://project-r6ccw.vercel.app",
    },
    filloutUrl: {
        type: ControlType.String,
        title: "Fillout URL",
        defaultValue: "https://taxoma.fillout.com/t/9HrgSPozHous",
    },
    showHeading: {
        type: ControlType.Boolean,
        title: "Show Heading",
        defaultValue: true,
    },
    headingText: {
        type: ControlType.String,
        title: "Heading",
        defaultValue: "Vyplnění přiznání začíná zde",
    },
    showDescription: {
        type: ControlType.Boolean,
        title: "Show Description",
        defaultValue: true,
    },
    descriptionText: {
        type: ControlType.String,
        title: "Description",
        defaultValue:
            "Zadejte IČO a údaje o podnikateli automaticky načteme z registru ARES.",
    },
    placeholder: {
        type: ControlType.String,
        title: "Placeholder",
        defaultValue: "Zadejte IČO",
    },
    buttonText: {
        type: ControlType.String,
        title: "Button",
        defaultValue: "Načíst údaje →",
    },
    loadingText: {
        type: ControlType.String,
        title: "Loading",
        defaultValue: "Načítám…",
    },
    hintText: {
        type: ControlType.String,
        title: "Hint",
        defaultValue: "Podporujeme pouze OSVČ.",
    },
    stackOnMobile: {
        type: ControlType.Boolean,
        title: "Stack Mobile",
        defaultValue: true,
    },
})

const wrapperStyle = {
    width: "100%",
    maxWidth: 760,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
}

const headingStyle = {
    margin: 0,
    marginBottom: 14,
    fontSize: "clamp(28px, 4vw, 42px)",
    lineHeight: 1.1,
    fontWeight: 500,
    color: "#161616",
}

const descriptionStyle = {
    margin: 0,
    marginBottom: 24,
    fontSize: "clamp(17px, 1.8vw, 22px)",
    lineHeight: 1.45,
    color: "rgba(22,22,22,0.72)",
    maxWidth: 680,
}

const rowStyle = () => ({
    width: "100%",
    display: "flex",
    gap: 12,
    alignItems: "stretch",
    justifyContent: "center",
    flexWrap: "wrap",
})

const inputStyle = {
    flex: "1 1 320px",
    minWidth: 240,
    height: 56,
    padding: "0 18px",
    borderRadius: 999,
    border: "1px solid rgba(22,22,22,0.12)",
    background: "#fff",
    fontSize: 16,
    color: "#161616",
    outline: "none",
    boxSizing: "border-box",
}

const buttonStyle = {
    height: 56,
    padding: "0 24px",
    border: "none",
    borderRadius: 999,
    background: "#245FEA",
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
}

const messageWrapStyle = {
    minHeight: 28,
    marginTop: 12,
}

const hintStyle = {
    margin: 0,
    fontSize: 14,
    color: "rgba(22,22,22,0.55)",
}

const errorStyle = {
    margin: 0,
    fontSize: 14,
    color: "#DC2626",
    fontWeight: 500,
}
