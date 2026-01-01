// import React, { useState, useRef } from 'react';

// const GeminiChat = () => {
//   const [isOpen, setIsOpen] = useState(false);
//   const [input, setInput] = useState("");
//   const [messages, setMessages] = useState([{ role: 'bot', text: 'hello' }]);
  
//   // Dùng tọa độ tuyệt đối (left, top) để dễ tính toán 4 cạnh
//   const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
//   const [isDragging, setIsDragging] = useState(false);
//   const draggingRef = useRef(false);

//   const handleMouseDown = (e) => {
//     draggingRef.current = false;
//     setIsDragging(true);

//     const offsetX = e.clientX - position.x;
//     const offsetY = e.clientY - position.y;

//     const onMouseMove = (moveEvent) => {
//       draggingRef.current = true;
//       let newX = moveEvent.clientX - offsetX;
//       let newY = moveEvent.clientY - offsetY;

//       // Giới hạn không cho bay ra khỏi màn hình khi đang kéo
//       newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
//       newY = Math.max(0, Math.min(newY, window.innerHeight - 60));

//       setPosition({ x: newX, y: newY });
//     };

//     const onMouseUp = (endEvent) => {
//       setIsDragging(false);
//       document.removeEventListener('mousemove', onMouseMove);
//       document.removeEventListener('mouseup', onMouseUp);

//       if (draggingRef.current) {
//         const x = endEvent.clientX - offsetX;
//         const y = endEvent.clientY - offsetY;
//         const w = window.innerWidth;
//         const h = window.innerHeight;

//         // Tính khoảng cách tới 4 cạnh
//         const distLeft = x;
//         const distRight = w - (x + 60);
//         const distTop = y;
//         const distBottom = h - (y + 60);

//         const minDist = Math.min(distLeft, distRight, distTop, distBottom);

//         // "Hít" vào cạnh gần nhất
//         if (minDist === distLeft) setPosition({ x: 10, y: y });
//         else if (minDist === distRight) setPosition({ x: w - 70, y: y });
//         else if (minDist === distTop) setPosition({ x: x, y: 10 });
//         else setPosition({ x: x, y: h - 70 });
//       }
//     };

//     document.addEventListener('mousemove', onMouseMove);
//     document.addEventListener('mouseup', onMouseUp);
//   };

//   const handleSendMessage = async () => {
//     if (!input.trim()) return;
//     const userMsg = { role: 'user', text: input };
//     setMessages(prev => [...prev, userMsg]);
//     setInput("");
//     try {
//       const response = await fetch('http://localhost:5000/api/ask-gemini', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: input }),
//       });
//       const data = await response.json();
//       setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
//     } catch (err) {
//       setMessages(prev => [...prev, { role: 'bot', text: 'Lỗi kết nối AI!' }]);
//     }
//   };

//   return (
//     <div 
//       style={{ 
//         position: 'fixed', 
//         left: `${position.x}px`, 
//         top: `${position.y}px`, 
//         zIndex: 999999,
//         transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
//         userSelect: 'none'
//       }}
//     >
//       {/* Nút tròn Gemini */}
//       <div 
//         onMouseDown={handleMouseDown}
//         onClick={() => !draggingRef.current && setIsOpen(!isOpen)}
//         style={{
//           width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#10b981',
//           display: 'flex', justifyContent: 'center', alignItems: 'center', 
//           cursor: 'grab', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
//           border: '2px solid rgba(255,255,255,0.2)'
//         }}
//       >
//         <img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg" width="30" alt="icon" draggable="false" />
//       </div>

    //   {/* Khung Chat */}
    //   {isOpen && (
    //     <div style={{
    //       position: 'absolute', 
    //       // Tự động nhảy hướng khung chat dựa trên vị trí nút
    //       bottom: position.y > window.innerHeight / 2 ? '70px' : 'auto',
    //       top: position.y <= window.innerHeight / 2 ? '70px' : 'auto',
    //       right: position.x > window.innerWidth / 2 ? '0' : 'auto',
    //       left: position.x <= window.innerWidth / 2 ? '0' : 'auto',
    //       width: '320px', height: '450px', backgroundColor: 'white', borderRadius: '15px', 
    //       boxShadow: '0 10px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
    //     }}>
    //       <div style={{ padding: '15px', background: '#10b981', color: 'white', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between' }}>
    //         <span>Gemini AI</span>
    //         <span onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }}>×</span>
    //       </div>
    //       <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f8f9fa' }}>
    //         {messages.map((m, i) => (
    //           <div key={i} style={{
    //             alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
    //             padding: '10px 14px', borderRadius: '15px', fontSize: '14px',
    //             backgroundColor: m.role === 'user' ? '#10b981' : 'white',
    //             color: m.role === 'user' ? 'white' : '#333', maxWidth: '85%',
    //             boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    //           }}>{m.text}</div>
    //         ))}
    //       </div>
    //       <div style={{ padding: '10px', display: 'flex', gap: '8px', background: 'white' }}>
    //         <input 
    //           style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }}
    //           value={input} onChange={(e) => setInput(e.target.value)}
    //           onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
    //           placeholder="Hỏi trợ lý AI..."
    //         />
    //       </div>
    //     </div>
    //   )}
//     </div>
//   );
// };

// export default GeminiChat;



import React, { useState, useRef } from 'react';

const GeminiChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([{ role: 'bot', text: 'hello' }]);
  
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 150 });
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);

  const handleMouseDown = (e) => {
    draggingRef.current = false;
    setIsDragging(true);
    const offsetX = e.clientX - position.x;
    const offsetY = e.clientY - position.y;

    const onMouseMove = (moveEvent) => {
      draggingRef.current = true;
      let newX = moveEvent.clientX - offsetX;
      let newY = moveEvent.clientY - offsetY;
      newX = Math.max(0, Math.min(newX, window.innerWidth - 60));
      newY = Math.max(0, Math.min(newY, window.innerHeight - 60));
      setPosition({ x: newX, y: newY });
    };

    const onMouseUp = (endEvent) => {
      setIsDragging(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);

      if (draggingRef.current) {
        const x = endEvent.clientX - offsetX;
        const y = endEvent.clientY - offsetY;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const distLeft = x;
        const distRight = w - (x + 60);
        const distTop = y;
        const distBottom = h - (y + 60);
        const minDist = Math.min(distLeft, distRight, distTop, distBottom);

        if (minDist === distLeft) setPosition({ x: 10, y: y });
        else if (minDist === distRight) setPosition({ x: w - 70, y: y });
        else if (minDist === distTop) setPosition({ x: x, y: 10 });
        else setPosition({ x: x, y: h - 70 });
      }
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    try {
      const response = await fetch('http://localhost:5000/api/ask-gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Lỗi kết nối AI!' }]);
    }
  };

  return (
    <div 
      style={{ 
        position: 'fixed', 
        left: `${position.x}px`, 
        top: `${position.y}px`, 
        zIndex: 999999,
        transition: isDragging ? 'none' : 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        userSelect: 'none'
      }}
    >
      {/* Nút hình con vịt vàng */}
      <div 
        onMouseDown={handleMouseDown}
        onClick={() => !draggingRef.current && setIsOpen(!isOpen)}
        style={{
          width: '65px', height: '65px', 
          backgroundColor: '#FFD700', // Màu vàng con vịt
          borderRadius: '50% 50% 45% 45%', // Tạo hình hơi giống quả trứng/đầu vịt
          display: 'flex', justifyContent: 'center', alignItems: 'center', 
          cursor: 'grab', boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
          border: '3px solid #F4A460', // Viền màu cam nhạt cho giống mỏ vịt
          fontSize: '30px',
          position: 'relative'
        }}
      >
        <span>🐤</span> {/* Icon con vịt */}
        
        {/* Logo Gemini nhỏ đính kèm ở góc để biết là AI */}
        <div style={{
            position: 'absolute', bottom: '-5px', right: '-5px',
            background: 'white', borderRadius: '50%', width: '25px', height: '25px',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg" width="15" alt="gemini" />
        </div>
      </div>

      Khung Chat (Giữ nguyên logic của bà)
      {isOpen && (
        <div style={{
          position: 'absolute', 
          bottom: position.y > window.innerHeight / 2 ? '80px' : 'auto',
          top: position.y <= window.innerHeight / 2 ? '80px' : 'auto',
          right: position.x > window.innerWidth / 2 ? '0' : 'auto',
          left: position.x <= window.innerWidth / 2 ? '0' : 'auto',
          width: '320px', height: '450px', backgroundColor: 'white', borderRadius: '15px', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          <div style={{ padding: '15px', background: '#FFD700', color: '#5D4037', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #F4A460' }}>
            <span>Gemini</span>
            <span onClick={() => setIsOpen(false)} style={{ cursor: 'pointer' }}>×</span>
          </div>
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', background: '#FFFDF0' }}>
            {messages.map((m, i) => (
              <div key={i} style={{
                alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                padding: '10px 14px', borderRadius: '15px', fontSize: '14px',
                backgroundColor: m.role === 'user' ? '#FFD700' : 'white',
                color: '#333', maxWidth: '85%',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                border: m.role === 'user' ? 'none' : '1px solid #eee'
              }}>{m.text}</div>
            ))}
          </div>
          <div style={{ padding: '10px', display: 'flex', gap: '8px', background: 'white' }}>
            <input 
              style={{ flex: 1, padding: '10px', borderRadius: '20px', border: '1px solid #FFD700', outline: 'none' }}
              value={input} onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Tôi có thể giúp gì cho bạn hôm nay!"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiChat;
