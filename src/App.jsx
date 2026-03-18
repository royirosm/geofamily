import { useState } from "react"

const messages = [
  "🎉 Ο πάπης είναι ΑΠΙΘΑΝΟΣ",
  "🐬 Ο Ττουλιός θα κερδίσει μετάλιο στο μπάντμιντον",
  "⭐ Ο πάπης είναι ΤΕΛΕΙΟΣ",
  "🦋 Η μάμη είναι η καλύτερη στο squash",
  "🍕 Η Μελέα κάνει ωραίους τροχούς",
  "🌺 Θα φάω την Μελέα",
  "🚀 Ο Ττουλλιός είναι παχύς"
]

export default function App() {
  const [message, setMessage] = useState(null)
  const [bounce, setBounce] = useState(false)

  function showMessage() {
    const random = messages[Math.floor(Math.random() * messages.length)]
    setMessage(random)
    setBounce(true)
    setTimeout(() => setBounce(false), 500)
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f5af19, #f12711)",
      fontFamily: "Georgia, serif",
      padding: "20px",
      textAlign: "center"
    }}>
      <h1 style={{ color: "white", fontSize: "2.5rem", marginBottom: "40px" }}>
        🌍 GeoFamily
      </h1>

      <button
        onClick={showMessage}
        style={{
          padding: "20px 40px",
          fontSize: "1.5rem",
          borderRadius: "50px",
          border: "none",
          background: "white",
          color: "#f12711",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
          transition: "transform 0.1s",
        }}
        onMouseDown={e => e.target.style.transform = "scale(0.95)"}
        onMouseUp={e => e.target.style.transform = "scale(1)"}
      >
        ✨ Πάτησε με!
      </button>

      {message && (
        <div style={{
          marginTop: "40px",
          background: "white",
          borderRadius: "20px",
          padding: "24px 36px",
          fontSize: "1.4rem",
          fontWeight: "bold",
          color: "#333",
          boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
          animation: bounce ? "none" : "fadeIn 0.4s ease",
          maxWidth: "500px"
        }}>
          {message}
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
