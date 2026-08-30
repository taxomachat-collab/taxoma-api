import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/**
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight auto
 */

type Lang = "cs" | "uk"

type RegistrationProps = {
    style?: React.CSSProperties
    apiBase: string
    processingPath: string
    topGap: number
}

type AresSubject = {
    ico?: string
    dic?: string
    name?: string
    street?: string
    descriptive_number?: string
    orientation_number?: string
    city?: string
    zip?: string
    country_code?: string
    country_name?: string
    data_box?: string
    is_supported_for_this_service?: boolean
    unsupported_reason?: string
}

type TaxOffice = {
    pracufo: string
    ufo: string
    name: string
}

type FormState = {
    ico: string
    dic: string

    registry_name: string
    first_name: string
    last_name: string

    street: string
    house_number: string
    orientation_number: string
    city: string
    postal_code: string

    email: string
    phone: string

    delivery_address_differs: boolean
    delivery_street: string
    delivery_house_number: string
    delivery_orientation_number: string
    delivery_city: string
    delivery_postal_code: string

    register_reason: 1 | 2 | 3 | null
    liability_start_date: string
    tax_office: string

    consent: boolean
}

const COPY = {
    cs: {
        title: "Registrace identifikované osoby",
        subtitle: "Taxoma tě provede registrací krok za krokem.",
        langCs: "CZ",
        langUk: "UA",

        steps: ["IČO", "Údaje", "Důvod", "Datum", "Finanční úřad", "Kontrola"],

        icoTitle: "Začneme IČO",
        icoText:
            "Načteme údaje z registru ARES, abys je nemusel přepisovat ručně.",
        icoLabel: "IČO",
        icoPlaceholder: "např. 12345678",
        lookup: "Načíst údaje",
        loadingAres: "Načítáme údaje z registru…",
        invalidIco: "Zadej IČO v délce 8 číslic.",
        aresError:
            "Údaje se nepodařilo načíst. Zkontroluj IČO a zkus to znovu.",
        unsupported:
            "Podle ARES tento subjekt není pro tuto službu podporovaný.",

        foundTitle: "Našli jsme tě!",
        continue: "Pokračovat",
        back: "Zpět",

        detailsTitle: "Zkontroluj údaje",
        detailsText: "Údaje z ARES můžeš upravit, pokud se něco neshoduje.",
        registryName: "Název / jméno v ARES",
        firstName: "Jméno",
        lastName: "Příjmení",
        dic: "DIČ",
        dicHelp: "Pokud DIČ ještě nemáš, nech pole prázdné.",
        street: "Ulice",
        houseNumber: "Číslo popisné",
        orientationNumber: "Číslo orientační",
        city: "Obec",
        postalCode: "PSČ",
        email: "E-mail",
        emailText:
            "Pro odeslání registrace použijeme tento e-mail. Můžeš ho změnit.",
        phone: "Telefon",
        optional: "nepovinné",
        differentDelivery: "Doručovací adresa je jiná",
        deliveryTitle: "Doručovací adresa",

        reasonTitle: "Proč se registruješ?",
        reasonText: "Vyber situaci, která se tě týká.",
        reason1: "Nakupuji služby od firmy z jiné země EU",
        reason2: "Jezdím pro Bolt nebo Uber",
        reason3: "Poskytuji služby firmě z jiné země EU",
        reasonReaction1: "Zahraniční služby, rozumím ✓",
        reasonReaction2: "Bolt nebo Uber, rozumím ✓",
        reasonReaction3: "Zahraniční klient, rozumím ✓",

        dateTitleGeneric: "Od kdy se tě důvod registrace týká?",
        dateTitleDriver: "Kdy jsi začal jezdit pro Bolt nebo Uber?",
        dateText:
            "Finanční úřad chce konkrétní datum. Pokud přesný den neznáš, zvol co nejpřesnější přibližné datum.",
        dateLabel: "Datum",
        dateResult: "Podle zadaného data jde o",

        taxTitle: "Finanční úřad",
        taxText:
            "Začni psát město nebo název pracoviště. Nabídneme odpovídající finanční úřad.",
        taxLabel: "Finanční úřad",
        taxPlaceholder: "Začni psát, např. Plzeň",
        taxDevNote: "Seznam se načítá z oficiálního číselníku MOJE daně.",

        reviewTitle: "Zkontroluj registraci",
        reviewText:
            "Všechno zůstává na této stránce. Jednotlivé části můžeš upravit přímo tady.",
        edit: "Upravit",
        save: "Uložit",
        cancel: "Zrušit",
        identitySection: "Osobní a kontaktní údaje",
        reasonSection: "Důvod registrace",
        dateSection: "Datum",
        officeSection: "Finanční úřad",
        deliverySection: "Doručovací adresa",
        consent: "Potvrzuji, že uvedené údaje jsou správné.",
        warningTitle: "Upozornění při podání",
        warningText:
            "Portál Finanční správy může zobrazit upozornění i na údaje, které pro identifikovanou osobu nemusí být relevantní — například na nevyplněný účet pro vrácení DPH. Upozornění proto nemusí znamenat chybu v registraci.",
        submit: "Odeslat registraci",
        submitting: "Odesíláme registraci…",
        submitError: "Registraci se nepodařilo odeslat. Zkus to prosím znovu.",

        required: "Vyplň prosím všechna povinná pole.",
        progressPrepared: "Registrace je z",
        progressPrepared2: "% připravená",
    },

    uk: {
        title: "Реєстрація ідентифікованої особи",
        subtitle: "Taxoma проведе тебе реєстрацією крок за кроком.",
        langCs: "CZ",
        langUk: "UA",

        steps: ["IČO", "Дані", "Причина", "Дата", "Податкова", "Перевірка"],

        icoTitle: "Почнемо з IČO",
        icoText:
            "Ми завантажимо дані з реєстру ARES, щоб тобі не довелося переписувати їх вручну.",
        icoLabel: "IČO",
        icoPlaceholder: "напр. 12345678",
        lookup: "Завантажити дані",
        loadingAres: "Завантажуємо дані з реєстру…",
        invalidIco: "Введи IČO з 8 цифр.",
        aresError:
            "Не вдалося завантажити дані. Перевір IČO та спробуй ще раз.",
        unsupported:
            "За даними ARES цей суб’єкт не підтримується цією послугою.",

        foundTitle: "Ми тебе знайшли!",
        continue: "Продовжити",
        back: "Назад",

        detailsTitle: "Перевір дані",
        detailsText: "Дані з ARES можна виправити, якщо щось не збігається.",
        registryName: "Назва / ім’я в ARES",
        firstName: "Ім’я",
        lastName: "Прізвище",
        dic: "DIČ",
        dicHelp: "Якщо DIČ ще немає, залиш поле порожнім.",
        street: "Вулиця",
        houseNumber: "Номер будинку",
        orientationNumber: "Орієнтаційний номер",
        city: "Місто / населений пункт",
        postalCode: "Поштовий індекс",
        email: "E-mail",
        emailText:
            "Для відправлення реєстрації використаємо цей e-mail. Його можна змінити.",
        phone: "Телефон",
        optional: "необов’язково",
        differentDelivery: "Адреса для листування інша",
        deliveryTitle: "Адреса для листування",

        reasonTitle: "Чому ти реєструєшся?",
        reasonText: "Вибери ситуацію, яка тебе стосується.",
        reason1: "Купую послуги у компанії з іншої країни ЄС",
        reason2: "Працюю з Bolt або Uber",
        reason3: "Надаю послуги компанії з іншої країни ЄС",
        reasonReaction1: "Іноземні послуги, зрозуміло ✓",
        reasonReaction2: "Bolt або Uber, зрозуміло ✓",
        reasonReaction3: "Іноземний клієнт, зрозуміло ✓",

        dateTitleGeneric: "Від якої дати діє причина реєстрації?",
        dateTitleDriver: "Коли ти почав працювати з Bolt або Uber?",
        dateText:
            "Податкова хоче конкретну дату. Якщо точний день невідомий, вкажи максимально точну приблизну дату.",
        dateLabel: "Дата",
        dateResult: "За введеною датою це",

        taxTitle: "Податкова служба",
        taxText:
            "Почни вводити місто або назву відділення. Ми запропонуємо відповідний податковий орган.",
        taxLabel: "Податковий орган",
        taxPlaceholder: "Почни вводити, напр. Plzeň",
        taxDevNote: "Список завантажується з офіційного довідника MOJE daně.",

        reviewTitle: "Перевір реєстрацію",
        reviewText:
            "Усе залишається на цій сторінці. Кожен блок можна редагувати без переходу назад.",
        edit: "Редагувати",
        save: "Зберегти",
        cancel: "Скасувати",
        identitySection: "Особисті та контактні дані",
        reasonSection: "Причина реєстрації",
        dateSection: "Дата",
        officeSection: "Податкова служба",
        deliverySection: "Адреса для листування",
        consent: "Підтверджую, що наведені дані правильні.",
        warningTitle: "Попередження під час подання",
        warningText:
            "Портал фінансової адміністрації може показувати попередження і щодо даних, які для ідентифікованої особи можуть бути нерелевантними — наприклад, щодо відсутнього рахунку для повернення ПДВ. Таке попередження не обов’язково означає помилку.",
        submit: "Надіслати реєстрацію",
        submitting: "Надсилаємо реєстрацію…",
        submitError: "Не вдалося надіслати реєстрацію. Спробуй ще раз.",

        required: "Заповни, будь ласка, всі обов’язкові поля.",
        progressPrepared: "Реєстрація готова на",
        progressPrepared2: "%",
    },
} as const

const cardStyle: React.CSSProperties = {
    background:
        "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,248,255,0.98) 100%)",
    border: "1px solid rgba(108, 76, 255, 0.18)",
    borderRadius: 26,
    boxShadow: "0 22px 65px rgba(67, 42, 150, 0.12)",
}

const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid rgba(44, 35, 72, 0.16)",
    borderRadius: 14,
    padding: "14px 15px",
    fontSize: 16,
    lineHeight: 1.3,
    outline: "none",
    background: "#fff",
    color: "#17131f",
}

function Field({
    label,
    value,
    onChange,
    placeholder,
    type = "text",
    help,
    required,
    digitsOnly = false,
    maxLength,
    inputMode,
}: {
    label: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    type?: string
    help?: string
    required?: boolean
    digitsOnly?: boolean
    maxLength?: number
    inputMode?: "text" | "numeric" | "tel" | "email" | "decimal" | "search"
}) {
    return (
        <label style={{ display: "grid", gap: 7 }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#2a2038" }}>
                {label}
                {required ? " *" : ""}
            </div>
            <input
                type={type}
                value={value}
                placeholder={placeholder}
                maxLength={maxLength}
                inputMode={inputMode}
                onChange={(event) => {
                    const raw = event.target.value
                    onChange(digitsOnly ? raw.replace(/\\D/g, "") : raw)
                }}
                style={{
                    ...inputStyle,
                    border: "1px solid rgba(96, 71, 220, 0.20)",
                    boxShadow: "0 5px 20px rgba(87, 61, 180, 0.035)",
                }}
            />
            {help && (
                <div
                    style={{ fontSize: 12, color: "#756b86", lineHeight: 1.45 }}
                >
                    {help}
                </div>
            )}
        </label>
    )
}

function PrimaryButton({
    children,
    onClick,
    disabled,
    type = "button",
}: {
    children: React.ReactNode
    onClick?: () => void
    disabled?: boolean
    type?: "button" | "submit"
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={{
                border: 0,
                borderRadius: 999,
                padding: "14px 20px",
                fontSize: 15,
                fontWeight: 800,
                cursor: disabled ? "not-allowed" : "pointer",
                color: "#fff",
                background: disabled
                    ? "#c4bdd2"
                    : "linear-gradient(135deg, #6f45ff 0%, #4f63ff 100%)",
                boxShadow: disabled
                    ? "none"
                    : "0 12px 28px rgba(97, 73, 255, 0.24)",
            }}
        >
            {children}
        </button>
    )
}

function SecondaryButton({
    children,
    onClick,
}: {
    children: React.ReactNode
    onClick?: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                border: "1px solid rgba(71, 54, 115, 0.16)",
                borderRadius: 999,
                padding: "13px 18px",
                fontSize: 14,
                fontWeight: 750,
                cursor: "pointer",
                background: "#fff",
                color: "#2d2440",
            }}
        >
            {children}
        </button>
    )
}

function Choice({
    active,
    title,
    onClick,
}: {
    active: boolean
    title: string
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                width: "100%",
                textAlign: "left",
                padding: 17,
                borderRadius: 17,
                cursor: "pointer",
                border: active
                    ? "1.5px solid #6d4cff"
                    : "1px solid rgba(56, 44, 87, 0.14)",
                background: active ? "rgba(109,76,255,0.07)" : "#fff",
                color: "#20182f",
                fontWeight: 750,
                fontSize: 15,
            }}
        >
            {title}
        </button>
    )
}

function SectionHeader({ title, text }: { title: string; text?: string }) {
    return (
        <div style={{ display: "grid", gap: 8 }}>
            <h2
                style={{
                    margin: 0,
                    fontSize: "clamp(25px, 5vw, 38px)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.035em",
                    color: "#17131f",
                }}
            >
                {title}
            </h2>
            {text && (
                <p
                    style={{
                        margin: 0,
                        maxWidth: 620,
                        fontSize: 15,
                        lineHeight: 1.55,
                        color: "#675e74",
                    }}
                >
                    {text}
                </p>
            )}
        </div>
    )
}

function Progress({
    step,
    labels,
    prepared,
    prefix,
    suffix,
}: {
    step: number
    labels: readonly string[]
    prepared: number
    prefix: string
    suffix: string
}) {
    return (
        <div style={{ display: "grid", gap: 10 }}>
            <div
                style={{
                    height: 8,
                    borderRadius: 999,
                    background: "rgba(76, 54, 112, 0.09)",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        width: `${prepared}%`,
                        height: "100%",
                        borderRadius: 999,
                        background:
                            "linear-gradient(90deg, #7549ff 0%, #4e63ff 100%)",
                        transition: "width 220ms ease",
                    }}
                />
            </div>

            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                    color: "#6f667b",
                    fontSize: 12,
                }}
            >
                <span>{labels[Math.min(step, labels.length - 1)]}</span>
                <strong style={{ color: "#3b2f52" }}>
                    {prefix} {prepared}
                    {suffix}
                </strong>
            </div>
        </div>
    )
}

function formatMonth(value: string, lang: Lang) {
    if (!value) return ""
    const date = new Date(`${value}T12:00:00`)
    if (Number.isNaN(date.getTime())) return ""

    return new Intl.DateTimeFormat(lang === "uk" ? "uk-UA" : "cs-CZ", {
        month: "long",
        year: "numeric",
    }).format(date)
}

function reasonLabel(reason: FormState["register_reason"], lang: Lang) {
    const c = COPY[lang]
    if (reason === 1) return c.reason1
    if (reason === 2) return c.reason2
    if (reason === 3) return c.reason3
    return ""
}

function reasonReaction(reason: FormState["register_reason"], lang: Lang) {
    const c = COPY[lang]
    if (reason === 1) return c.reasonReaction1
    if (reason === 2) return c.reasonReaction2
    if (reason === 3) return c.reasonReaction3
    return ""
}

function generateSubmissionId() {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
        return crypto.randomUUID()
    }

    return `taxoma_${Date.now()}_${Math.random().toString(36).slice(2, 12)}`
}

function initialState(): FormState {
    return {
        ico: "",
        dic: "",

        registry_name: "",
        first_name: "",
        last_name: "",

        street: "",
        house_number: "",
        orientation_number: "",
        city: "",
        postal_code: "",

        email: "",
        phone: "",

        delivery_address_differs: false,
        delivery_street: "",
        delivery_house_number: "",
        delivery_orientation_number: "",
        delivery_city: "",
        delivery_postal_code: "",

        register_reason: null,
        liability_start_date: "",
        tax_office: "",

        consent: false,
    }
}

export default function Registration(props: RegistrationProps) {
    const {
        style,
        apiBase = "https://project-r6ccw.vercel.app",
        processingPath = "/processing",
        topGap = 96,
    } = props

    const [lang, setLang] = React.useState<Lang>("cs")
    const [step, setStep] = React.useState(0)
    const [form, setForm] = React.useState<FormState>(() => initialState())

    const [aresSubject, setAresSubject] = React.useState<AresSubject | null>(
        null
    )
    const [aresLoading, setAresLoading] = React.useState(false)
    const [aresError, setAresError] = React.useState("")

    const [taxOffices, setTaxOffices] = React.useState<TaxOffice[]>([])
    const [taxOfficeQuery, setTaxOfficeQuery] = React.useState("")
    const [taxOfficeOpen, setTaxOfficeOpen] = React.useState(false)
    const [taxOfficeLoading, setTaxOfficeLoading] = React.useState(false)
    const [taxOfficeLoadError, setTaxOfficeLoadError] = React.useState("")

    const [submitLoading, setSubmitLoading] = React.useState(false)
    const [submitError, setSubmitError] = React.useState("")

    const [reviewEdit, setReviewEdit] = React.useState<
        "identity" | "reason" | "date" | "office" | "delivery" | null
    >(null)

    const c = COPY[lang]

    React.useEffect(() => {
        if (typeof window === "undefined") return

        const params = new URLSearchParams(window.location.search)
        const queryLang = params.get("lang")
        const email = params.get("email")

        if (queryLang === "uk") setLang("uk")
        if (queryLang === "cs") setLang("cs")

        if (email) {
            setForm((current) => ({
                ...current,
                email,
            }))
        }
    }, [])

    React.useEffect(() => {
        if (typeof window === "undefined") return

        async function loadTaxOffices() {
            setTaxOfficeLoading(true)
            setTaxOfficeLoadError("")

            try {
                const today = new Date().toISOString().slice(0, 10)
                const url = `https://mojedane.gov.cz/dpr/epo_ciselnik?C=pracufo&PL=${today}`
                const response = await fetch(url)

                if (!response.ok) throw new Error("tax_office_codelist_failed")

                const xmlText = await response.text()
                const xml = new DOMParser().parseFromString(
                    xmlText,
                    "application/xml"
                )

                const all = Array.from(xml.getElementsByTagName("*"))
                const seen = new Set<string>()
                const rows: TaxOffice[] = []

                const regionUfo: Record<string, string> = {
                    "20": "451",
                    "21": "452",
                    "22": "453",
                    "23": "454",
                    "24": "455",
                    "25": "456",
                    "26": "457",
                    "27": "458",
                    "28": "459",
                    "29": "460",
                    "30": "461",
                    "31": "462",
                    "32": "463",
                    "33": "464",
                    "40": "13",
                }

                for (const element of all) {
                    const attrs = Array.from(element.attributes || [])
                    if (!attrs.length) continue

                    const values = Object.fromEntries(
                        attrs.map((a) => [a.name.toLowerCase(), a.value])
                    )

                    const pracufo =
                        values.c_pracufo ||
                        values.pracufo ||
                        values.k_pracufo ||
                        values.k_ufo_vema ||
                        ""

                    if (!/^\\d{4}$/.test(pracufo) || seen.has(pracufo)) continue

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
                        if (values[key] && /[A-Za-zÁ-ž]/.test(values[key])) {
                            name = values[key]
                            break
                        }
                    }

                    if (!name) {
                        const candidates = attrs
                            .map((a) => a.value)
                            .filter(
                                (v) =>
                                    /[A-Za-zÁ-ž]/.test(v) &&
                                    !/^\\d{4}-\\d{2}-\\d{2}$/.test(v)
                            )
                            .sort((a, b) => b.length - a.length)

                        name = candidates[0] || ""
                    }

                    if (!name) continue

                    const ufo =
                        values.c_ufo || regionUfo[pracufo.slice(0, 2)] || ""

                    if (!ufo) continue

                    seen.add(pracufo)
                    rows.push({
                        pracufo,
                        ufo,
                        name: name.replace(/\\s+/g, " ").trim(),
                    })
                }

                rows.sort((a, b) =>
                    a.name.localeCompare(b.name, "cs", { sensitivity: "base" })
                )

                if (!rows.length) throw new Error("empty_tax_office_codelist")

                setTaxOffices(rows)
            } catch (error) {
                console.error(error)
                setTaxOfficeLoadError(
                    lang === "uk"
                        ? "Список податкових органів не вдалося завантажити."
                        : "Seznam finančních úřadů se nepodařilo načíst."
                )
            } finally {
                setTaxOfficeLoading(false)
            }
        }

        loadTaxOffices()
    }, [])

    const patch = React.useCallback((values: Partial<FormState>) => {
        setForm((current) => ({
            ...current,
            ...values,
        }))
    }, [])

    const prepared = React.useMemo(() => {
        const checks = [
            /^\d{8}$/.test(form.ico),
            !!form.first_name &&
                !!form.last_name &&
                !!form.street &&
                !!form.house_number &&
                (!aresSubject?.orientation_number ||
                    !!form.orientation_number) &&
                !!form.city &&
                !!form.postal_code &&
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email),
            !!form.register_reason,
            !!form.liability_start_date,
            !!form.tax_office,
            form.consent,
        ]

        const done = checks.filter(Boolean).length
        return Math.round((done / checks.length) * 100)
    }, [form])

    async function lookupAres() {
        setAresError("")
        setAresSubject(null)

        const ico = form.ico.replace(/\s+/g, "")

        if (!/^\d{8}$/.test(ico)) {
            setAresError(c.invalidIco)
            return
        }

        setAresLoading(true)

        try {
            const response = await fetch(
                `${apiBase.replace(/\/$/, "")}/api/ares?ico=${encodeURIComponent(ico)}`
            )

            const data = await response.json()

            if (!response.ok || !data?.success || !data?.subject) {
                throw new Error(data?.error || "ares_error")
            }

            const subject: AresSubject = data.subject

            if (subject.is_supported_for_this_service === false) {
                setAresSubject(subject)
                setAresError(c.unsupported)
                return
            }

            setAresSubject(subject)

            const fullName = (subject.name || "").trim()
            const nameParts = fullName.split(/\s+/).filter(Boolean)

            let firstName = ""
            let lastName = ""

            if (nameParts.length === 1) {
                firstName = nameParts[0]
            } else if (nameParts.length > 1) {
                lastName = nameParts[nameParts.length - 1]
                firstName = nameParts.slice(0, -1).join(" ")
            }

            patch({
                ico: subject.ico || ico,
                dic: subject.dic || "",
                registry_name: fullName,
                first_name: firstName,
                last_name: lastName,
                street: subject.street || "",
                house_number: subject.descriptive_number || "",
                orientation_number: subject.orientation_number || "",
                city: subject.city || "",
                postal_code: subject.zip || "",
            })
        } catch (error) {
            console.error(error)
            setAresError(c.aresError)
        } finally {
            setAresLoading(false)
        }
    }

    function detailsValid() {
        return (
            !!form.first_name &&
            !!form.last_name &&
            !!form.street &&
            !!form.house_number &&
            (!aresSubject?.orientation_number || !!form.orientation_number) &&
            !!form.city &&
            !!form.postal_code &&
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        )
    }

    function deliveryValid() {
        if (!form.delivery_address_differs) return true

        return (
            !!form.delivery_street &&
            !!form.delivery_house_number &&
            !!form.delivery_city &&
            !!form.delivery_postal_code
        )
    }

    async function submitRegistration() {
        setSubmitError("")

        if (
            !detailsValid() ||
            !deliveryValid() ||
            !form.register_reason ||
            !form.liability_start_date ||
            !form.tax_office ||
            !form.consent
        ) {
            setSubmitError(c.required)
            return
        }

        setSubmitLoading(true)

        const submissionId = generateSubmissionId()

        try {
            const params =
                typeof window !== "undefined"
                    ? new URLSearchParams(window.location.search)
                    : new URLSearchParams()

            const payload = {
                ico: form.ico,
                dic: form.dic,

                first_name: form.first_name,
                last_name: form.last_name,

                street: form.street,
                house_number: form.house_number,
                orientation_number: form.orientation_number,
                city: form.city,
                postal_code: form.postal_code,

                email: form.email,
                phone: form.phone,

                tax_office: form.tax_office,
                liability_start_date: form.liability_start_date,

                delivery_street: form.delivery_address_differs
                    ? form.delivery_street
                    : "",
                delivery_house_number: form.delivery_address_differs
                    ? form.delivery_house_number
                    : "",
                delivery_orientation_number: form.delivery_address_differs
                    ? form.delivery_orientation_number
                    : "",
                delivery_city: form.delivery_address_differs
                    ? form.delivery_city
                    : "",
                delivery_postal_code: form.delivery_address_differs
                    ? form.delivery_postal_code
                    : "",
                delivery_address_differs: form.delivery_address_differs,

                register_reason: form.register_reason,
                submission_id: submissionId,
                lang,
                ref: params.get("ref") || "",
                test: params.get("test") || "",
            }

            const response = await fetch(
                `${apiBase.replace(/\/$/, "")}/api/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Accept: "application/json",
                    },
                    body: JSON.stringify(payload),
                }
            )

            const data = await response.json().catch(() => null)

            if (!response.ok || !data?.success) {
                console.error("Registration failed:", response.status, data)
                throw new Error(data?.error || "registration_failed")
            }

            if (typeof window !== "undefined") {
                const url = new URL(processingPath, window.location.origin)

                url.searchParams.set(
                    "submission_id",
                    data.submission_id || submissionId
                )
                url.searchParams.set("lang", lang)

                const ref = params.get("ref")
                if (ref) url.searchParams.set("ref", ref)

                window.location.href = url.toString()
            }
        } catch (error) {
            console.error(error)
            setSubmitError(c.submitError)
        } finally {
            setSubmitLoading(false)
        }
    }

    function renderDetailsFields() {
        return (
            <div style={{ display: "grid", gap: 16 }}>
                {form.registry_name && (
                    <div
                        style={{
                            padding: 14,
                            borderRadius: 14,
                            background: "rgba(109,76,255,0.06)",
                            color: "#4b3b69",
                            fontSize: 13,
                            lineHeight: 1.5,
                        }}
                    >
                        <strong>{c.registryName}:</strong> {form.registry_name}
                    </div>
                )}

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, minmax(0,1fr))",
                        gap: 12,
                    }}
                >
                    <Field
                        label={c.firstName}
                        value={form.first_name}
                        onChange={(value) => patch({ first_name: value })}
                        required
                    />
                    <Field
                        label={c.lastName}
                        value={form.last_name}
                        onChange={(value) => patch({ last_name: value })}
                        required
                    />
                </div>

                <Field
                    label={c.dic}
                    value={form.dic}
                    onChange={(value) => patch({ dic: value })}
                    help={c.dicHelp}
                />

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr 1fr",
                        gap: 12,
                    }}
                >
                    <Field
                        label={c.street}
                        value={form.street}
                        onChange={(value) => patch({ street: value })}
                        required
                    />
                    <Field
                        label={c.houseNumber}
                        value={form.house_number}
                        onChange={(value) => patch({ house_number: value })}
                        digitsOnly
                        inputMode="numeric"
                        maxLength={6}
                        required
                    />
                    <Field
                        label={c.orientationNumber}
                        value={form.orientation_number}
                        onChange={(value) =>
                            patch({ orientation_number: value })
                        }
                        digitsOnly
                        inputMode="numeric"
                        maxLength={4}
                        required={!!aresSubject?.orientation_number}
                    />
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr",
                        gap: 12,
                    }}
                >
                    <Field
                        label={c.city}
                        value={form.city}
                        onChange={(value) => patch({ city: value })}
                        required
                    />
                    <Field
                        label={c.postalCode}
                        value={form.postal_code}
                        onChange={(value) => patch({ postal_code: value })}
                        digitsOnly
                        inputMode="numeric"
                        maxLength={5}
                        required
                    />
                </div>

                <Field
                    label={c.email}
                    value={form.email}
                    onChange={(value) => patch({ email: value })}
                    type="email"
                    help={c.emailText}
                    required
                />

                <Field
                    label={`${c.phone} (${c.optional})`}
                    value={form.phone}
                    onChange={(value) => patch({ phone: value })}
                    type="tel"
                />

                <label
                    style={{
                        display: "flex",
                        gap: 10,
                        alignItems: "center",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#342943",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={form.delivery_address_differs}
                        onChange={(event) =>
                            patch({
                                delivery_address_differs: event.target.checked,
                            })
                        }
                    />
                    {c.differentDelivery}
                </label>

                {form.delivery_address_differs && (
                    <div
                        style={{
                            display: "grid",
                            gap: 14,
                            padding: 16,
                            borderRadius: 18,
                            background: "rgba(71, 56, 102, 0.035)",
                        }}
                    >
                        <strong style={{ color: "#2c213d" }}>
                            {c.deliveryTitle}
                        </strong>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr 1fr",
                                gap: 12,
                            }}
                        >
                            <Field
                                label={c.street}
                                value={form.delivery_street}
                                onChange={(value) =>
                                    patch({ delivery_street: value })
                                }
                                required
                            />
                            <Field
                                label={c.houseNumber}
                                value={form.delivery_house_number}
                                onChange={(value) =>
                                    patch({ delivery_house_number: value })
                                }
                                digitsOnly
                                inputMode="numeric"
                                maxLength={6}
                                required
                            />
                            <Field
                                label={c.orientationNumber}
                                value={form.delivery_orientation_number}
                                onChange={(value) =>
                                    patch({
                                        delivery_orientation_number: value,
                                    })
                                }
                                digitsOnly
                                inputMode="numeric"
                                maxLength={4}
                            />
                        </div>

                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "2fr 1fr",
                                gap: 12,
                            }}
                        >
                            <Field
                                label={c.city}
                                value={form.delivery_city}
                                onChange={(value) =>
                                    patch({ delivery_city: value })
                                }
                                required
                            />
                            <Field
                                label={c.postalCode}
                                value={form.delivery_postal_code}
                                onChange={(value) =>
                                    patch({ delivery_postal_code: value })
                                }
                                digitsOnly
                                inputMode="numeric"
                                maxLength={5}
                                required
                            />
                        </div>
                    </div>
                )}
            </div>
        )
    }

    function renderReview() {
        return (
            <div style={{ display: "grid", gap: 16 }}>
                <ReviewCard
                    title={c.identitySection}
                    editLabel={c.edit}
                    saveLabel={c.save}
                    cancelLabel={c.cancel}
                    editing={reviewEdit === "identity"}
                    onEdit={() => setReviewEdit("identity")}
                    onSave={() => setReviewEdit(null)}
                    onCancel={() => setReviewEdit(null)}
                >
                    {reviewEdit === "identity" ? (
                        renderDetailsFields()
                    ) : (
                        <SummaryRows
                            rows={[
                                [c.icoLabel, form.ico],
                                [c.registryName, form.registry_name],
                                [
                                    `${c.firstName} / ${c.lastName}`,
                                    `${form.first_name} ${form.last_name}`.trim(),
                                ],
                                [c.dic, form.dic || "—"],
                                [
                                    c.street,
                                    `${form.street} ${form.house_number}${
                                        form.orientation_number
                                            ? `/${form.orientation_number}`
                                            : ""
                                    }`,
                                ],
                                [
                                    `${c.city} / ${c.postalCode}`,
                                    `${form.city}, ${form.postal_code}`,
                                ],
                                [c.email, form.email],
                                [c.phone, form.phone || "—"],
                            ]}
                        />
                    )}
                </ReviewCard>

                {form.delivery_address_differs && (
                    <ReviewCard
                        title={c.deliverySection}
                        editLabel={c.edit}
                        saveLabel={c.save}
                        cancelLabel={c.cancel}
                        editing={reviewEdit === "delivery"}
                        onEdit={() => setReviewEdit("delivery")}
                        onSave={() => setReviewEdit(null)}
                        onCancel={() => setReviewEdit(null)}
                    >
                        {reviewEdit === "delivery" ? (
                            <div style={{ display: "grid", gap: 14 }}>
                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "2fr 1fr 1fr",
                                        gap: 12,
                                    }}
                                >
                                    <Field
                                        label={c.street}
                                        value={form.delivery_street}
                                        onChange={(value) =>
                                            patch({
                                                delivery_street: value,
                                            })
                                        }
                                    />
                                    <Field
                                        label={c.houseNumber}
                                        value={form.delivery_house_number}
                                        onChange={(value) =>
                                            patch({
                                                delivery_house_number: value,
                                            })
                                        }
                                    />
                                    <Field
                                        label={c.orientationNumber}
                                        value={form.delivery_orientation_number}
                                        onChange={(value) =>
                                            patch({
                                                delivery_orientation_number:
                                                    value,
                                            })
                                        }
                                    />
                                </div>

                                <div
                                    style={{
                                        display: "grid",
                                        gridTemplateColumns: "2fr 1fr",
                                        gap: 12,
                                    }}
                                >
                                    <Field
                                        label={c.city}
                                        value={form.delivery_city}
                                        onChange={(value) =>
                                            patch({
                                                delivery_city: value,
                                            })
                                        }
                                    />
                                    <Field
                                        label={c.postalCode}
                                        value={form.delivery_postal_code}
                                        onChange={(value) =>
                                            patch({
                                                delivery_postal_code: value,
                                            })
                                        }
                                    />
                                </div>
                            </div>
                        ) : (
                            <SummaryRows
                                rows={[
                                    [
                                        c.street,
                                        `${form.delivery_street} ${form.delivery_house_number}${
                                            form.delivery_orientation_number
                                                ? `/${form.delivery_orientation_number}`
                                                : ""
                                        }`,
                                    ],
                                    [
                                        `${c.city} / ${c.postalCode}`,
                                        `${form.delivery_city}, ${form.delivery_postal_code}`,
                                    ],
                                ]}
                            />
                        )}
                    </ReviewCard>
                )}

                <ReviewCard
                    title={c.reasonSection}
                    editLabel={c.edit}
                    saveLabel={c.save}
                    cancelLabel={c.cancel}
                    editing={reviewEdit === "reason"}
                    onEdit={() => setReviewEdit("reason")}
                    onSave={() => setReviewEdit(null)}
                    onCancel={() => setReviewEdit(null)}
                >
                    {reviewEdit === "reason" ? (
                        <div style={{ display: "grid", gap: 10 }}>
                            <Choice
                                active={form.register_reason === 1}
                                title={c.reason1}
                                onClick={() => patch({ register_reason: 1 })}
                            />
                            <Choice
                                active={form.register_reason === 2}
                                title={c.reason2}
                                onClick={() => patch({ register_reason: 2 })}
                            />
                            <Choice
                                active={form.register_reason === 3}
                                title={c.reason3}
                                onClick={() => patch({ register_reason: 3 })}
                            />
                        </div>
                    ) : (
                        <SummaryRows
                            rows={[
                                [
                                    c.reasonSection,
                                    reasonLabel(form.register_reason, lang),
                                ],
                            ]}
                        />
                    )}
                </ReviewCard>

                <ReviewCard
                    title={c.dateSection}
                    editLabel={c.edit}
                    saveLabel={c.save}
                    cancelLabel={c.cancel}
                    editing={reviewEdit === "date"}
                    onEdit={() => setReviewEdit("date")}
                    onSave={() => setReviewEdit(null)}
                    onCancel={() => setReviewEdit(null)}
                >
                    {reviewEdit === "date" ? (
                        <Field
                            label={c.dateLabel}
                            value={form.liability_start_date}
                            onChange={(value) =>
                                patch({
                                    liability_start_date: value,
                                })
                            }
                            type="date"
                        />
                    ) : (
                        <SummaryRows
                            rows={[[c.dateLabel, form.liability_start_date]]}
                        />
                    )}
                </ReviewCard>

                <ReviewCard
                    title={c.officeSection}
                    editLabel={c.edit}
                    saveLabel={c.save}
                    cancelLabel={c.cancel}
                    editing={reviewEdit === "office"}
                    onEdit={() => setReviewEdit("office")}
                    onSave={() => setReviewEdit(null)}
                    onCancel={() => setReviewEdit(null)}
                >
                    {reviewEdit === "office" ? (
                        <div style={{ fontSize: 13, color: "#655a72" }}>
                            {lang === "uk"
                                ? "Повернись на крок «Податкова», якщо хочеш змінити відділення."
                                : "Pokud chceš úřad změnit, vrať se na krok Finanční úřad."}
                        </div>
                    ) : (
                        <SummaryRows
                            rows={[
                                [
                                    c.taxLabel,
                                    taxOfficeQuery || form.tax_office || "—",
                                ],
                            ]}
                        />
                    )}
                </ReviewCard>

                <div
                    style={{
                        padding: 17,
                        borderRadius: 18,
                        background: "rgba(94, 65, 255, 0.065)",
                        border: "1px solid rgba(94, 65, 255, 0.11)",
                    }}
                >
                    <strong
                        style={{
                            display: "block",
                            marginBottom: 6,
                            color: "#2e2055",
                        }}
                    >
                        {c.warningTitle}
                    </strong>
                    <div
                        style={{
                            color: "#665c78",
                            fontSize: 13,
                            lineHeight: 1.55,
                        }}
                    >
                        {c.warningText}
                    </div>
                </div>

                <label
                    style={{
                        display: "flex",
                        gap: 11,
                        alignItems: "flex-start",
                        fontSize: 14,
                        lineHeight: 1.45,
                        color: "#30263d",
                    }}
                >
                    <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(event) =>
                            patch({ consent: event.target.checked })
                        }
                        style={{ marginTop: 3 }}
                    />
                    {c.consent}
                </label>

                {submitError && (
                    <div
                        style={{
                            padding: 13,
                            borderRadius: 14,
                            background: "#fff3f3",
                            color: "#a23131",
                            fontSize: 13,
                        }}
                    >
                        {submitError}
                    </div>
                )}

                <PrimaryButton
                    onClick={submitRegistration}
                    disabled={submitLoading || !form.consent}
                >
                    {submitLoading ? c.submitting : c.submit}
                </PrimaryButton>
            </div>
        )
    }

    return (
        <div
            style={{
                width: "100%",
                height: "auto",
                minHeight: "unset",
                boxSizing: "border-box",
                padding: `${topGap}px clamp(18px, 4vw, 42px) clamp(40px, 6vw, 70px)`,
                background:
                    "radial-gradient(circle at 12% 0%, rgba(126, 74, 255, 0.18), transparent 31%), radial-gradient(circle at 88% 18%, rgba(67, 115, 255, 0.10), transparent 28%), #fbfaff",
                fontFamily:
                    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                ...style,
            }}
        >
            <div
                style={{
                    width: "min(760px, 100%)",
                    margin: "0 auto",
                    display: "grid",
                    gap: 18,
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            padding: 4,
                            borderRadius: 999,
                            background: "rgba(92, 67, 183, 0.08)",
                            border: "1px solid rgba(92, 67, 183, 0.10)",
                        }}
                    >
                        {(["cs", "uk"] as Lang[]).map((value) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setLang(value)}
                                style={{
                                    border: 0,
                                    cursor: "pointer",
                                    padding: "8px 12px",
                                    borderRadius: 999,
                                    fontWeight: 850,
                                    fontSize: 12,
                                    color: lang === value ? "#fff" : "#51465f",
                                    background:
                                        lang === value
                                            ? "linear-gradient(135deg, #7447ff 0%, #4f63ff 100%)"
                                            : "transparent",
                                }}
                            >
                                {value === "cs" ? c.langCs : c.langUk}
                            </button>
                        ))}
                    </div>
                </div>

                <Progress
                    step={step}
                    labels={c.steps}
                    prepared={prepared}
                    prefix={c.progressPrepared}
                    suffix={c.progressPrepared2}
                />

                <main
                    style={{
                        ...cardStyle,
                        padding: "clamp(20px, 4vw, 34px)",
                    }}
                >
                    {step === 0 && (
                        <div style={{ display: "grid", gap: 22 }}>
                            <SectionHeader
                                title={c.icoTitle}
                                text={c.icoText}
                            />

                            <Field
                                label={c.icoLabel}
                                value={form.ico}
                                onChange={(value) => {
                                    patch({
                                        ico: value
                                            .replace(/\D/g, "")
                                            .slice(0, 8),
                                    })
                                    setAresSubject(null)
                                    setAresError("")
                                }}
                                placeholder={c.icoPlaceholder}
                                digitsOnly
                                inputMode="numeric"
                                maxLength={8}
                                required
                            />

                            {aresLoading && (
                                <div
                                    style={{
                                        padding: 14,
                                        borderRadius: 15,
                                        background: "rgba(96, 73, 244, 0.06)",
                                        color: "#584a77",
                                        fontSize: 13,
                                    }}
                                >
                                    {c.loadingAres}
                                </div>
                            )}

                            {aresError && (
                                <div
                                    style={{
                                        padding: 14,
                                        borderRadius: 15,
                                        background: "#fff3f3",
                                        color: "#a23131",
                                        fontSize: 13,
                                    }}
                                >
                                    {aresError}
                                </div>
                            )}

                            {aresSubject &&
                                !aresError &&
                                aresSubject.is_supported_for_this_service !==
                                    false && (
                                    <div
                                        style={{
                                            padding: 17,
                                            borderRadius: 18,
                                            background:
                                                "rgba(69, 176, 111, 0.07)",
                                            border: "1px solid rgba(69, 176, 111, 0.14)",
                                            display: "grid",
                                            gap: 6,
                                        }}
                                    >
                                        <strong
                                            style={{
                                                color: "#3d238f",
                                                fontSize: 22,
                                                lineHeight: 1.15,
                                                letterSpacing: "-0.02em",
                                            }}
                                        >
                                            {c.foundTitle}
                                        </strong>
                                        <span
                                            style={{
                                                color: "#345a42",
                                                lineHeight: 1.45,
                                            }}
                                        >
                                            {aresSubject.name ||
                                                form.registry_name}
                                        </span>
                                        <span
                                            style={{
                                                color: "#6a766d",
                                                fontSize: 13,
                                            }}
                                        >
                                            {[
                                                aresSubject.street,
                                                aresSubject.descriptive_number,
                                                aresSubject.orientation_number
                                                    ? `/${aresSubject.orientation_number}`
                                                    : "",
                                                aresSubject.city,
                                                aresSubject.zip,
                                            ]
                                                .filter(Boolean)
                                                .join(" ")}
                                        </span>
                                    </div>
                                )}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "flex-end",
                                    gap: 10,
                                    flexWrap: "wrap",
                                }}
                            >
                                {!aresSubject && (
                                    <PrimaryButton
                                        onClick={lookupAres}
                                        disabled={aresLoading}
                                    >
                                        {c.lookup}
                                    </PrimaryButton>
                                )}

                                {aresSubject &&
                                    !aresError &&
                                    aresSubject.is_supported_for_this_service !==
                                        false && (
                                        <PrimaryButton
                                            onClick={() => setStep(1)}
                                        >
                                            {c.continue}
                                        </PrimaryButton>
                                    )}
                            </div>
                        </div>
                    )}

                    {step === 1 && (
                        <div style={{ display: "grid", gap: 22 }}>
                            <SectionHeader
                                title={c.detailsTitle}
                                text={c.detailsText}
                            />

                            {renderDetailsFields()}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 10,
                                    flexWrap: "wrap",
                                }}
                            >
                                <SecondaryButton onClick={() => setStep(0)}>
                                    {c.back}
                                </SecondaryButton>

                                <PrimaryButton
                                    onClick={() => setStep(2)}
                                    disabled={
                                        !detailsValid() || !deliveryValid()
                                    }
                                >
                                    {c.continue}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div style={{ display: "grid", gap: 22 }}>
                            <SectionHeader
                                title={c.reasonTitle}
                                text={c.reasonText}
                            />

                            <div style={{ display: "grid", gap: 10 }}>
                                <Choice
                                    active={form.register_reason === 1}
                                    title={c.reason1}
                                    onClick={() =>
                                        patch({
                                            register_reason: 1,
                                        })
                                    }
                                />
                                <Choice
                                    active={form.register_reason === 2}
                                    title={c.reason2}
                                    onClick={() =>
                                        patch({
                                            register_reason: 2,
                                        })
                                    }
                                />
                                <Choice
                                    active={form.register_reason === 3}
                                    title={c.reason3}
                                    onClick={() =>
                                        patch({
                                            register_reason: 3,
                                        })
                                    }
                                />
                            </div>

                            {form.register_reason && (
                                <div
                                    style={{
                                        padding: 13,
                                        borderRadius: 14,
                                        background: "rgba(68, 174, 111, 0.07)",
                                        color: "#2f7048",
                                        fontSize: 13,
                                        fontWeight: 700,
                                    }}
                                >
                                    {reasonReaction(form.register_reason, lang)}
                                </div>
                            )}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 10,
                                    flexWrap: "wrap",
                                }}
                            >
                                <SecondaryButton onClick={() => setStep(1)}>
                                    {c.back}
                                </SecondaryButton>

                                <PrimaryButton
                                    onClick={() => setStep(3)}
                                    disabled={!form.register_reason}
                                >
                                    {c.continue}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div style={{ display: "grid", gap: 22 }}>
                            <SectionHeader
                                title={
                                    form.register_reason === 2
                                        ? c.dateTitleDriver
                                        : c.dateTitleGeneric
                                }
                                text={c.dateText}
                            />

                            <Field
                                label={c.dateLabel}
                                value={form.liability_start_date}
                                onChange={(value) =>
                                    patch({
                                        liability_start_date: value,
                                    })
                                }
                                type="date"
                                required
                            />

                            {form.liability_start_date && (
                                <div
                                    style={{
                                        padding: 13,
                                        borderRadius: 14,
                                        background: "rgba(74, 90, 255, 0.06)",
                                        color: "#4f4770",
                                        fontSize: 13,
                                    }}
                                >
                                    ✓ {c.dateResult}{" "}
                                    <strong>
                                        {formatMonth(
                                            form.liability_start_date,
                                            lang
                                        )}
                                    </strong>
                                    .
                                </div>
                            )}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 10,
                                    flexWrap: "wrap",
                                }}
                            >
                                <SecondaryButton onClick={() => setStep(2)}>
                                    {c.back}
                                </SecondaryButton>

                                <PrimaryButton
                                    onClick={() => setStep(4)}
                                    disabled={!form.liability_start_date}
                                >
                                    {c.continue}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div style={{ display: "grid", gap: 22 }}>
                            <SectionHeader
                                title={c.taxTitle}
                                text={c.taxText}
                            />

                            <div
                                style={{
                                    display: "grid",
                                    gap: 8,
                                    position: "relative",
                                }}
                            >
                                <div
                                    style={{
                                        fontSize: 13,
                                        fontWeight: 800,
                                        color: "#2a2038",
                                    }}
                                >
                                    {c.taxLabel} *
                                </div>

                                <input
                                    value={taxOfficeQuery}
                                    placeholder={c.taxPlaceholder}
                                    inputMode="search"
                                    autoComplete="off"
                                    onFocus={() => setTaxOfficeOpen(true)}
                                    onChange={(event) => {
                                        setTaxOfficeQuery(event.target.value)
                                        setTaxOfficeOpen(true)
                                        patch({ tax_office: "" })
                                    }}
                                    style={{
                                        ...inputStyle,
                                        border: "1px solid rgba(96, 71, 220, 0.22)",
                                        boxShadow:
                                            "0 8px 28px rgba(87, 61, 180, 0.06)",
                                    }}
                                />

                                {taxOfficeLoading && (
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#756b86",
                                        }}
                                    >
                                        {lang === "uk"
                                            ? "Завантажуємо список…"
                                            : "Načítáme seznam…"}
                                    </div>
                                )}

                                {taxOfficeLoadError && (
                                    <div
                                        style={{
                                            fontSize: 12,
                                            color: "#a23131",
                                        }}
                                    >
                                        {taxOfficeLoadError}
                                    </div>
                                )}

                                {taxOfficeOpen &&
                                    taxOfficeQuery.trim() &&
                                    taxOffices.length > 0 && (
                                        <div
                                            style={{
                                                position: "absolute",
                                                zIndex: 20,
                                                left: 0,
                                                right: 0,
                                                top: 72,
                                                maxHeight: 280,
                                                overflowY: "auto",
                                                borderRadius: 16,
                                                background: "#fff",
                                                border: "1px solid rgba(91, 64, 180, 0.16)",
                                                boxShadow:
                                                    "0 18px 48px rgba(47, 28, 93, 0.16)",
                                                padding: 6,
                                            }}
                                        >
                                            {taxOffices
                                                .filter((office) =>
                                                    office.name
                                                        .toLocaleLowerCase("cs")
                                                        .includes(
                                                            taxOfficeQuery
                                                                .trim()
                                                                .toLocaleLowerCase(
                                                                    "cs"
                                                                )
                                                        )
                                                )
                                                .slice(0, 12)
                                                .map((office) => (
                                                    <button
                                                        key={`${office.pracufo}-${office.ufo}`}
                                                        type="button"
                                                        onClick={() => {
                                                            patch({
                                                                tax_office: `${office.pracufo}|${office.ufo}`,
                                                            })
                                                            setTaxOfficeQuery(
                                                                office.name
                                                            )
                                                            setTaxOfficeOpen(
                                                                false
                                                            )
                                                        }}
                                                        style={{
                                                            width: "100%",
                                                            display: "grid",
                                                            gap: 3,
                                                            textAlign: "left",
                                                            border: 0,
                                                            background:
                                                                "transparent",
                                                            padding:
                                                                "11px 12px",
                                                            borderRadius: 11,
                                                            cursor: "pointer",
                                                            color: "#281d39",
                                                        }}
                                                    >
                                                        <strong
                                                            style={{
                                                                fontSize: 13,
                                                            }}
                                                        >
                                                            {office.name}
                                                        </strong>
                                                        <span
                                                            style={{
                                                                fontSize: 11,
                                                                color: "#81768e",
                                                            }}
                                                        >
                                                            {office.pracufo}
                                                        </span>
                                                    </button>
                                                ))}
                                        </div>
                                    )}

                                {form.tax_office && (
                                    <div
                                        style={{
                                            display: "inline-flex",
                                            width: "fit-content",
                                            alignItems: "center",
                                            gap: 7,
                                            padding: "7px 10px",
                                            borderRadius: 999,
                                            background:
                                                "linear-gradient(135deg, rgba(112,71,255,0.11), rgba(79,99,255,0.09))",
                                            color: "#4932a3",
                                            fontSize: 12,
                                            fontWeight: 800,
                                        }}
                                    >
                                        ✓{" "}
                                        {lang === "uk" ? "Вибрано" : "Vybráno"}
                                    </div>
                                )}

                                <div
                                    style={{
                                        fontSize: 12,
                                        color: "#756b86",
                                        lineHeight: 1.45,
                                    }}
                                >
                                    {c.taxDevNote}
                                </div>
                            </div>

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    gap: 10,
                                    flexWrap: "wrap",
                                }}
                            >
                                <SecondaryButton onClick={() => setStep(3)}>
                                    {c.back}
                                </SecondaryButton>

                                <PrimaryButton
                                    onClick={() => setStep(5)}
                                    disabled={!form.tax_office}
                                >
                                    {c.continue}
                                </PrimaryButton>
                            </div>
                        </div>
                    )}

                    {step === 5 && (
                        <div style={{ display: "grid", gap: 22 }}>
                            <SectionHeader
                                title={c.reviewTitle}
                                text={c.reviewText}
                            />

                            {renderReview()}

                            <div>
                                <SecondaryButton onClick={() => setStep(4)}>
                                    {c.back}
                                </SecondaryButton>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    )
}

function SummaryRows({ rows }: { rows: Array<[string, React.ReactNode]> }) {
    return (
        <div style={{ display: "grid", gap: 9 }}>
            {rows.map(([label, value], index) => (
                <div
                    key={`${label}-${index}`}
                    style={{
                        display: "grid",
                        gridTemplateColumns: "minmax(120px, 0.8fr) 1.4fr",
                        gap: 14,
                        paddingBottom: index === rows.length - 1 ? 0 : 9,
                        borderBottom:
                            index === rows.length - 1
                                ? "none"
                                : "1px solid rgba(54, 41, 82, 0.08)",
                    }}
                >
                    <span
                        style={{
                            color: "#786e83",
                            fontSize: 12,
                            fontWeight: 700,
                        }}
                    >
                        {label}
                    </span>
                    <span
                        style={{
                            color: "#292035",
                            fontSize: 13,
                            fontWeight: 650,
                            overflowWrap: "anywhere",
                        }}
                    >
                        {value || "—"}
                    </span>
                </div>
            ))}
        </div>
    )
}

function ReviewCard({
    title,
    editLabel,
    saveLabel,
    cancelLabel,
    editing,
    onEdit,
    onSave,
    onCancel,
    children,
}: {
    title: string
    editLabel: string
    saveLabel: string
    cancelLabel: string
    editing: boolean
    onEdit: () => void
    onSave: () => void
    onCancel: () => void
    children: React.ReactNode
}) {
    return (
        <section
            style={{
                border: "1px solid rgba(59, 45, 89, 0.11)",
                borderRadius: 18,
                padding: 16,
                display: "grid",
                gap: 14,
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "center",
                }}
            >
                <strong style={{ color: "#251b36" }}>{title}</strong>

                {editing ? (
                    <div style={{ display: "flex", gap: 8 }}>
                        <button
                            type="button"
                            onClick={onCancel}
                            style={{
                                border: 0,
                                background: "transparent",
                                cursor: "pointer",
                                color: "#756a82",
                                fontWeight: 750,
                                fontSize: 12,
                            }}
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={onSave}
                            style={{
                                border: 0,
                                background: "transparent",
                                cursor: "pointer",
                                color: "#5b42ef",
                                fontWeight: 850,
                                fontSize: 12,
                            }}
                        >
                            {saveLabel}
                        </button>
                    </div>
                ) : (
                    <button
                        type="button"
                        onClick={onEdit}
                        style={{
                            border: 0,
                            background: "transparent",
                            cursor: "pointer",
                            color: "#5b42ef",
                            fontWeight: 850,
                            fontSize: 12,
                        }}
                    >
                        {editLabel}
                    </button>
                )}
            </div>

            {children}
        </section>
    )
}

Registration.defaultProps = {
    width: 760,
    height: 1200,
}

addPropertyControls(Registration, {
    topGap: {
        type: ControlType.Number,
        title: "Top Gap",
        defaultValue: 96,
        min: 0,
        max: 240,
        step: 4,
        unit: "px",
    },
    apiBase: {
        type: ControlType.String,
        title: "API",
        defaultValue: "https://project-r6ccw.vercel.app",
    },
    processingPath: {
        type: ControlType.String,
        title: "Processing",
        defaultValue: "/processing",
    },
})
