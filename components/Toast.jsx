export default function Toast({ message, visible }) {
  return (
    <div
      id="cultural-toast"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: '#171008',
        border: '1px solid #C9972B',
        color: '#F4E7C5',
        padding: '12px 20px',
        borderRadius: '4px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        fontSize: '14px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.8), 0 0 15px rgba(201,151,43,0.2)',
        zIndex: 9999,
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        transform: visible ? 'translateY(0)' : 'translateY(10px)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {message}
    </div>
  );
}
