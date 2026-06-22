/* ──────────────────────────────────────────────
   NAV: active link on scroll
   ────────────────────────────────────────────── */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('nav a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  navLinks.forEach(a => { a.classList.toggle('active', a.getAttribute('href') === '#' + current); });
}, {passive:true});

/* ──────────────────────────────────────────────
   QUIZ
   ────────────────────────────────────────────── */
function checkQ(btn, result, qid) {
  const box = btn.closest('.quiz-box');
  box.querySelectorAll('.quiz-opt').forEach(b => b.disabled = true);
  btn.classList.add(result);
  const fb = document.getElementById(qid + '-' + result);
  fb.classList.add('show', result);
}

/* ──────────────────────────────────────────────
   RL SIMULATOR
   ────────────────────────────────────────────── */
const rlCanvas = document.getElementById('rl-canvas');
const rlCtx = rlCanvas.getContext('2d');
const emfSlider = document.getElementById('emf');
const rSlider = document.getElementById('R-val');
const lSlider = document.getElementById('L-val');

function drawRL() {
  const W = rlCanvas.width, H = rlCanvas.height;
  const emf = parseFloat(emfSlider.value);
  const R = parseFloat(rSlider.value);
  const L = parseFloat(lSlider.value);
  const tau = L/R;
  const Ifinal = emf/R;
  const UL = 0.5*L*Ifinal*Ifinal;

  document.getElementById('emf-val').textContent = emf.toFixed(1)+' V';
  document.getElementById('R-display').textContent = R.toFixed(1)+' Ω';
  document.getElementById('L-display').textContent = L.toFixed(1)+' H';
  document.getElementById('tau-out').textContent = tau.toFixed(2)+' s';
  document.getElementById('ifinal-out').textContent = Ifinal.toFixed(2)+' A';
  document.getElementById('ul-out').textContent = UL.toFixed(2)+' J';

  rlCtx.clearRect(0,0,W,H);
  const tmax = 5*tau;
  const pad = 40;

  // grid
  rlCtx.strokeStyle = 'rgba(255,255,255,0.05)';
  rlCtx.lineWidth = 1;
  for(let g=0; g<=4; g++) {
    const x = pad + (W-2*pad)*g/4;
    rlCtx.beginPath(); rlCtx.moveTo(x,pad); rlCtx.lineTo(x,H-pad); rlCtx.stroke();
    const y = pad + (H-2*pad)*g/4;
    rlCtx.beginPath(); rlCtx.moveTo(pad,y); rlCtx.lineTo(W-pad,y); rlCtx.stroke();
  }

  // axes
  rlCtx.strokeStyle = '#334155'; rlCtx.lineWidth = 1.5;
  rlCtx.beginPath(); rlCtx.moveTo(pad,H-pad); rlCtx.lineTo(W-pad,H-pad); rlCtx.stroke();
  rlCtx.beginPath(); rlCtx.moveTo(pad,pad); rlCtx.lineTo(pad,H-pad); rlCtx.stroke();

  // axis labels
  rlCtx.fillStyle = '#64748b'; rlCtx.font = '11px monospace';
  rlCtx.fillText('t', W-pad+5, H-pad+4);
  rlCtx.fillText('i(t)', pad+4, pad-6);
  rlCtx.fillText('0', pad-12, H-pad+4);

  // I_final dashed line
  rlCtx.strokeStyle = 'rgba(245,200,66,0.3)'; rlCtx.lineWidth=1; rlCtx.setLineDash([4,4]);
  rlCtx.beginPath(); rlCtx.moveTo(pad,pad+5); rlCtx.lineTo(W-pad,pad+5); rlCtx.stroke();
  rlCtx.setLineDash([]);
  rlCtx.fillStyle = 'rgba(245,200,66,0.6)';
  rlCtx.fillText('I_f='+Ifinal.toFixed(2)+'A', W-pad-80, pad+3);

  // tau marker
  const tauX = pad + (W-2*pad)*(tau/tmax);
  rlCtx.strokeStyle = 'rgba(167,139,250,0.4)'; rlCtx.lineWidth=1; rlCtx.setLineDash([3,3]);
  rlCtx.beginPath(); rlCtx.moveTo(tauX,pad); rlCtx.lineTo(tauX,H-pad); rlCtx.stroke();
  rlCtx.setLineDash([]);
  rlCtx.fillStyle = 'rgba(167,139,250,0.7)';
  rlCtx.fillText('τ', tauX-4, H-pad+14);

  // current curve
  rlCtx.strokeStyle = '#4a9eff'; rlCtx.lineWidth=2.5;
  rlCtx.beginPath();
  for(let px=0; px<=W-2*pad; px++) {
    const t = tmax * px/(W-2*pad);
    const i_val = Ifinal*(1-Math.exp(-t/tau));
    const x = pad+px;
    const y = (H-pad) - (H-2*pad-10)*(i_val/Ifinal);
    if(px===0) rlCtx.moveTo(x,y); else rlCtx.lineTo(x,y);
  }
  rlCtx.stroke();

  // voltage curve (di/dt proportional)
  rlCtx.strokeStyle = '#34d399'; rlCtx.lineWidth=1.5; rlCtx.setLineDash([3,3]);
  rlCtx.beginPath();
  for(let px=0; px<=W-2*pad; px++) {
    const t = tmax * px/(W-2*pad);
    const diDt = (Ifinal/tau)*Math.exp(-t/tau);
    const x = pad+px;
    const y = (H-pad) - (H-2*pad-10)*(diDt/(Ifinal/tau));
    if(px===0) rlCtx.moveTo(x,y); else rlCtx.lineTo(x,y);
  }
  rlCtx.stroke();
  rlCtx.setLineDash([]);

  // legend
  rlCtx.fillStyle='#4a9eff'; rlCtx.fillRect(pad+8,pad+14,20,3);
  rlCtx.fillStyle='#4a9eff'; rlCtx.font='11px monospace';
  rlCtx.fillText('i(t)', pad+32, pad+18);
  rlCtx.fillStyle='#34d399'; rlCtx.fillRect(pad+70,pad+14,20,2);
  rlCtx.fillStyle='#34d399';
  rlCtx.fillText('di/dt', pad+94, pad+18);
}
emfSlider.addEventListener('input', drawRL);
rSlider.addEventListener('input', drawRL);
lSlider.addEventListener('input', drawRL);
drawRL();

/* ──────────────────────────────────────────────
   LC OSCILLATOR
   ────────────────────────────────────────────── */
const lcCanvas = document.getElementById('lc-canvas');
const lcCtx = lcCanvas.getContext('2d');
let lcTime = 0;
let lcPaused = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const omega0 = 2; // rad/s (normalized)

function animateLC() {
  const W = lcCanvas.width, H = lcCanvas.height;
  const pad = 30;
  lcCtx.clearRect(0,0,W,H);

  // grid
  lcCtx.strokeStyle='rgba(255,255,255,0.04)'; lcCtx.lineWidth=1;
  for(let g=0;g<=6;g++) {
    const x=pad+(W-2*pad)*g/6;
    lcCtx.beginPath();lcCtx.moveTo(x,pad);lcCtx.lineTo(x,H-pad);lcCtx.stroke();
  }
  lcCtx.beginPath();lcCtx.moveTo(pad,H/2);lcCtx.lineTo(W-pad,H/2);
  lcCtx.strokeStyle='rgba(255,255,255,0.08)';lcCtx.stroke();

  const cycles = 3;
  const T = 2*Math.PI/omega0;

  function drawWave(fn, color, lineW=1.5, dash=false) {
    lcCtx.strokeStyle=color; lcCtx.lineWidth=lineW;
    if(dash) lcCtx.setLineDash([3,3]); else lcCtx.setLineDash([]);
    lcCtx.beginPath();
    for(let px=0;px<=W-2*pad;px++) {
      const t=(T*cycles)*px/(W-2*pad);
      const v=fn(t);
      const x=pad+px;
      const y=H/2 - (H/2-pad-5)*v;
      if(px===0)lcCtx.moveTo(x,y);else lcCtx.lineTo(x,y);
    }
    lcCtx.stroke();
    lcCtx.setLineDash([]);
  }

  // q(t) = cos(ω₀t)
  drawWave(t=>Math.cos(omega0*t), '#4a9eff', 2);
  // i(t) = -sin(ω₀t)
  drawWave(t=>-Math.sin(omega0*t), '#f5c842', 2);
  // U_E = cos²
  drawWave(t=>Math.pow(Math.cos(omega0*t),2), '#34d399', 1.5, true);
  // U_B = sin²
  drawWave(t=>Math.pow(Math.sin(omega0*t),2), '#a78bfa', 1.5, true);

  // moving cursor
  const cursorT = lcTime % (T*cycles);
  const cursorX = pad + (W-2*pad)*cursorT/(T*cycles);
  lcCtx.strokeStyle='rgba(255,255,255,0.3)'; lcCtx.lineWidth=1; lcCtx.setLineDash([2,2]);
  lcCtx.beginPath();lcCtx.moveTo(cursorX,pad);lcCtx.lineTo(cursorX,H-pad);lcCtx.stroke();
  lcCtx.setLineDash([]);

  if(!lcPaused) lcTime += 0.02;
  requestAnimationFrame(animateLC);
}
const lcToggle = document.getElementById('lc-toggle');
lcToggle.addEventListener('click', () => {
  lcPaused = !lcPaused;
  lcToggle.textContent = lcPaused ? 'Reanudar animación' : 'Pausar animación';
  lcToggle.setAttribute('aria-pressed', String(lcPaused));
});
if(lcPaused) { lcToggle.textContent = 'Reanudar animación'; lcToggle.setAttribute('aria-pressed','true'); }
animateLC();

/* ──────────────────────────────────────────────
   LRC DAMPING
   ────────────────────────────────────────────── */
const lrcCanvas = document.getElementById('lrc-canvas');
const lrcCtx = lrcCanvas.getContext('2d');

function drawLRC() {
  const W = lrcCanvas.width, H = lrcCanvas.height;
  const pad = 30;
  lrcCtx.clearRect(0,0,W,H);

  lrcCtx.strokeStyle='rgba(255,255,255,0.04)'; lrcCtx.lineWidth=1;
  lrcCtx.beginPath();lrcCtx.moveTo(pad,H/2);lrcCtx.lineTo(W-pad,H/2);
  lrcCtx.strokeStyle='rgba(255,255,255,0.08)';lrcCtx.stroke();

  const L=1, C=0.25; // normalized
  const omega0=1/Math.sqrt(L*C);
  const tmax=30;

  function drawDamped(R, color) {
    const alpha=R/(2*L);
    const omegaD=Math.sqrt(Math.max(0,omega0*omega0-alpha*alpha));
    lrcCtx.strokeStyle=color; lrcCtx.lineWidth=2;
    lrcCtx.beginPath();
    for(let px=0;px<=W-2*pad;px++){
      const t=tmax*px/(W-2*pad);
      let v;
      if(R*R<4*L/C) { // underdamped
        v=Math.exp(-alpha*t)*Math.cos(omegaD*t);
      } else if(R*R===4*L/C) { // critical
        v=(1+alpha*t)*Math.exp(-alpha*t);
      } else { // overdamped
        const r1=-alpha+Math.sqrt(alpha*alpha-omega0*omega0);
        const r2=-alpha-Math.sqrt(alpha*alpha-omega0*omega0);
        v=0.5*(Math.exp(r1*t)+Math.exp(r2*t));
      }
      const x=pad+px;
      const y=H/2-(H/2-pad-5)*v;
      if(px===0)lrcCtx.moveTo(x,y);else lrcCtx.lineTo(x,y);
    }
    lrcCtx.stroke();
  }

  drawDamped(0.3,'#4a9eff');   // underdamped
  drawDamped(4.0,'#f5c842');   // critical: R=2√(L/C)=4 for L=1, C=0.25
  drawDamped(6.0,'#f87171');   // overdamped
}
drawLRC();

/* ──────────────────────────────────────────────
   RESONANCE SIMULATOR
   ────────────────────────────────────────────── */
const resCanvas = document.getElementById('res-canvas');
const resCtx = resCanvas.getContext('2d');
const resR = document.getElementById('res-R');
const resL = document.getElementById('res-L');
const resC = document.getElementById('res-C');

function drawResonance() {
  const W=resCanvas.width, H=resCanvas.height, pad=40;
  const R=parseFloat(resR.value);
  const L=parseFloat(resL.value)*1e-3;
  const C=parseFloat(resC.value)*1e-6;

  document.getElementById('res-R-val').textContent=R.toFixed(1)+' Ω';
  document.getElementById('res-L-val').textContent=parseFloat(resL.value).toFixed(0)+' mH';
  document.getElementById('res-C-val').textContent=parseFloat(resC.value).toFixed(0)+' μF';

  const f0=1/(2*Math.PI*Math.sqrt(L*C));
  const Imax=1/R;
  document.getElementById('res-f0').textContent=f0.toFixed(0)+' Hz';
  document.getElementById('res-Zmin').textContent=R.toFixed(1)+' Ω';
  document.getElementById('res-Imax').textContent=(Imax*1000).toFixed(0)+' mA';

  resCtx.clearRect(0,0,W,H);

  const fmin=f0*0.1, fmax=f0*5;

  // grid
  resCtx.strokeStyle='rgba(255,255,255,0.04)'; resCtx.lineWidth=1;
  for(let g=0;g<=4;g++){
    const x=pad+(W-2*pad)*g/4;
    resCtx.beginPath();resCtx.moveTo(x,pad);resCtx.lineTo(x,H-pad);resCtx.stroke();
    const y=pad+(H-2*pad)*g/4;
    resCtx.beginPath();resCtx.moveTo(pad,y);resCtx.lineTo(W-pad,y);resCtx.stroke();
  }

  // axes
  resCtx.strokeStyle='#334155'; resCtx.lineWidth=1.5;
  resCtx.beginPath();resCtx.moveTo(pad,H-pad);resCtx.lineTo(W-pad,H-pad);resCtx.stroke();
  resCtx.beginPath();resCtx.moveTo(pad,pad);resCtx.lineTo(pad,H-pad);resCtx.stroke();

  resCtx.fillStyle='#64748b'; resCtx.font='11px monospace';
  resCtx.fillText('f (Hz)', W-pad-40, H-pad+16);
  resCtx.fillText('|I|(A)', pad+4, pad-6);

  // resonance line
  const res_x=pad+(W-2*pad)*(f0-fmin)/(fmax-fmin);
  resCtx.strokeStyle='rgba(245,200,66,0.25)'; resCtx.lineWidth=1; resCtx.setLineDash([4,4]);
  resCtx.beginPath();resCtx.moveTo(res_x,pad);resCtx.lineTo(res_x,H-pad);resCtx.stroke();
  resCtx.setLineDash([]);
  resCtx.fillStyle='rgba(245,200,66,0.7)'; resCtx.font='11px monospace';
  resCtx.fillText('f₀='+f0.toFixed(0)+'Hz', res_x+4, pad+14);

  // |I(f)| curve
  resCtx.strokeStyle='#4a9eff'; resCtx.lineWidth=2.5;
  resCtx.beginPath();
  for(let px=0;px<=W-2*pad;px++){
    const f=fmin+(fmax-fmin)*px/(W-2*pad);
    const omega=2*Math.PI*f;
    const XL=omega*L, XC=1/(omega*C);
    const Z=Math.sqrt(R*R+(XL-XC)*(XL-XC));
    const I=1/Z; // V_rms=1V
    const x=pad+px;
    const y=(H-pad)-(H-2*pad-5)*(I/Imax);
    if(px===0)resCtx.moveTo(x,y);else resCtx.lineTo(x,y);
  }
  resCtx.stroke();
}
resR.addEventListener('input', drawResonance);
resL.addEventListener('input', drawResonance);
resC.addEventListener('input', drawResonance);
drawResonance();
