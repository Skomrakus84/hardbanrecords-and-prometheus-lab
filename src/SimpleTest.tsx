export default function SimpleTest() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: 'red', fontSize: '48px' }}>TEST WORKING!</h1>
      <p style={{ fontSize: '24px' }}>This is a simple test component</p>
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => alert('Button works!')} 
          style={{ 
            padding: '10px 20px', 
            backgroundColor: 'blue', 
            color: 'white', 
            border: 'none',
            fontSize: '18px',
            borderRadius: '5px'
          }}
        >
          Click me!
        </button>
      </div>
    </div>
  );
}