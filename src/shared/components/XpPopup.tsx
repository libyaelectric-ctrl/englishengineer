const STYLE_ID = 'xp-popup-keyframes';

function ensureKeyframes(): void {
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
@keyframes xpFloatUp {
  0% { opacity: 1; transform: translateY(0) scale(1); }
  60% { opacity: 1; transform: translateY(-60px) scale(1.1); }
  100% { opacity: 0; transform: translateY(-100px) scale(0.9); }
}`;
  document.head.appendChild(style);
}

export function showXpPopup(amount: number): void {
  ensureKeyframes();

  const el = document.createElement('div');
  el.textContent = `+${amount} XP`;
  el.style.cssText = `
position:fixed;
bottom:100px;
left:50%;
transform:translateX(-50%);
padding:10px 24px;
border-radius:9999px;
background:#22c55e;
color:#fff;
font-weight:900;
font-size:18px;
font-family:Inter,system-ui,sans-serif;
z-index:9999;
pointer-events:none;
box-shadow:0 4px 20px rgba(34,197,94,0.4);
animation:xpFloatUp 2s ease-out forwards;
`;

  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2100);
}
