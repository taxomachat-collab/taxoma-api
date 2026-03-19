import { useEffect, useState, useRef } from "react"

function JumpingDots() {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 3)
    }, 260)

    return () => clearInterval(interval)
  }, [])

  const dotStyle = (index) => ({
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    background: "#245FEA",
    transform: step === index ? "translateY(-8px)" : "translateY(0px)",
    opacity: step === index ? 1 : 0.28,
    transition: "all 0.18s ease",
  })

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: "8px",
        height: "20px",
        marginBottom: "26px",
      }}
    >
      <div style={dotStyle(0)} />
      <div style={dotStyle(1)} />
      <div style={dotStyle(2)} />
    </div>
  )
}

function ErrorMark() {
  return (
    <div
      style={{
        width: "56px",
        height: "56px",
        margin: "0 auto 26px auto",
        borderRadius: "50%",
        background: "#FEF2F2",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          background: "#DC2626",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "18px",
          fontWeight: 700,
        }}
      >
        !
      </div>
    </div>
  )
}

export default function PaymentRedirect() {
  const [status, setStatus] = useState("loading")
  const stopped = useRef(false)
  const attemptsRef = useRef(0)
  const timeoutRef = useRef(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const orderKey = params.get("order_key")

    if (!orderKey) {
      setStatus("missing")
      stopped.current = true
      return
    }

    const checkCheckoutUrl = async () => {
      if (stopped.current) return

      try {
        const res = await fetch(
          `https://project-r6ccw.vercel.app/api/get-checkout-url?order_key=${encodeURIComponent(orderKey)}`
        )

        if (stopped.current) return

        const data = await res.json()
        console.log("Payment response:", data)

        if (data.checkout_url) {
          stopped.current = true
          window.location.href = data.checkout_url
          return
        }

        attemptsRef.current += 1

        if (attemptsRef.current > 40) {
          setStatus("timeout")
          stopped.current = true
          return
        }

        setStatus("processing")
        timeoutRef.current = setTimeout(checkCheckoutUrl, 3000)
      } catch (e) {
        console.error(e)
        setStatus("error")
        stopped.current = true
      }
    }

    checkCheckoutUrl()

    return () => {
      stopped.current = true
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const renderContent = () => {
    switch (status) {
      case "loading":
        return (
          <>
            <JumpingDots />
            <h1 style={title}>Připravujeme platební bránu</h1>
            <p style={description}>Načítáme platební odkaz…</p>
          </>
        )

      case "processing":
        return (
          <>
            <JumpingDots />
            <h1 style={title}>Připravujeme platební bránu</h1>
            <p style={description}>
              Za okamžik budete automaticky přesměrováni na zabezpečenou platbu.
            </p>
          </>
        )

      case "timeout":
        return (
          <>
            <ErrorMark />
            <h1 style={title}>Příprava platby trvá déle než obvykle</h1>
            <p style={description}>Zkuste stránku za chvíli obnovit.</p>
          </>
        )

      case "missing":
        return (
          <>
            <ErrorMark />
            <h1 style={title}>Chybí identifikátor objednávky</h1>
            <p style={description}>
              Otevřete stránku znovu přes správný odkaz.
            </p>
          </>
        )

      case "error":
        return (
          <>
            <ErrorMark />
            <h1 style={title}>Nepodařilo se otevřít platbu</h1>
            <p style={description}>Zkuste stránku za chvíli obnovit.</p>
          </>
        )

      default:
        return null
    }
  }
// Used by /payment page
// Polls backend using order_key until checkout_url is available
// Redirects user to Stripe payment when ready
  return <section style={section}>{renderContent()}</section>
}

const section = {
  minHeight: "70vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "80px 24px",
  fontFamily: "Inter, sans-serif",
}

const title = {
  fontSize: "clamp(30px, 4.2vw, 44px)",
  lineHeight: 1.1,
  fontWeight: 500,
  marginBottom: "18px",
  color: "#161616",
}

const description = {
  fontSize: "clamp(18px, 1.8vw, 24px)",
  opacity: 0.7,
  color: "#161616",
}
