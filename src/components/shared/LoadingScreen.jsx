// frontend/src/components/shared/LoadingScreen.jsx
export default function LoadingScreen() {
  const chars  = ['p','r','i','n','t','f','(','.',' ','.','.',' ',')'];
  const colors = ['#7ED957','#00C8A0','#00C8E8','#7ED957','#00C8A0','#00C8E8',
                  '#E8FFF5','#6B9E80','transparent','#6B9E80','#6B9E80','transparent','#E8FFF5'];

  // Lily pad positions (% of track width, 0-100)
  const pads = [8, 28, 50, 72, 92];

  return (
    <>
      <style>{`
        /*
         * Frog hops: translateX moves it along the track,
         * translateY does the parabolic arc between each pad.
         * scaleY squishes on landing.  No side-to-side wobble.
         */
        @keyframes frog-hop {
          /* land on pad 1 */
          0%   { transform: translateX(0%)   translateY(0px)   scaleY(1);    }
          /* arc to pad 2 */
          8%   { transform: translateX(5%)   translateY(-54px) scaleY(1.1);  }
          16%  { transform: translateX(20%)  translateY(0px)   scaleY(0.78); }
          17%  { transform: translateX(20%)  translateY(0px)   scaleY(1);    }
          /* arc to pad 3 */
          25%  { transform: translateX(29%)  translateY(-54px) scaleY(1.1);  }
          33%  { transform: translateX(42%)  translateY(0px)   scaleY(0.78); }
          34%  { transform: translateX(42%)  translateY(0px)   scaleY(1);    }
          /* arc to pad 4 */
          42%  { transform: translateX(51%)  translateY(-54px) scaleY(1.1);  }
          50%  { transform: translateX(64%)  translateY(0px)   scaleY(0.78); }
          51%  { transform: translateX(64%)  translateY(0px)   scaleY(1);    }
          /* arc to pad 5 */
          59%  { transform: translateX(73%)  translateY(-54px) scaleY(1.1);  }
          67%  { transform: translateX(84%)  translateY(0px)   scaleY(0.78); }
          68%  { transform: translateX(84%)  translateY(0px)   scaleY(1);    }
          /* pause at end, then snap back */
          78%  { transform: translateX(84%)  translateY(0px)   scaleY(1);    }
          79%  { transform: translateX(0%)   translateY(0px)   scaleY(1);    }
          100% { transform: translateX(0%)   translateY(0px)   scaleY(1);    }
        }

        /* Shadow shrinks as frog rises, grows as it lands */
        @keyframes shadow-hop {
          0%   { transform: scaleX(1);    opacity:.35; }
          8%   { transform: scaleX(.5);   opacity:.15; }
          16%  { transform: scaleX(1.15); opacity:.45; }
          17%  { transform: scaleX(1);    opacity:.35; }
          25%  { transform: scaleX(.5);   opacity:.15; }
          33%  { transform: scaleX(1.15); opacity:.45; }
          34%  { transform: scaleX(1);    opacity:.35; }
          42%  { transform: scaleX(.5);   opacity:.15; }
          50%  { transform: scaleX(1.15); opacity:.45; }
          51%  { transform: scaleX(1);    opacity:.35; }
          59%  { transform: scaleX(.5);   opacity:.15; }
          67%  { transform: scaleX(1.15); opacity:.45; }
          68%  { transform: scaleX(1);    opacity:.35; }
          78%  { transform: scaleX(1);    opacity:.35; }
          79%  { transform: scaleX(0);    opacity:0;   }
          80%  { transform: scaleX(1);    opacity:.35; }
          100% { transform: scaleX(1);    opacity:.35; }
        }

        /* Ripple on each lily pad when frog lands */
        @keyframes ripple {
          0%   { transform: scale(1);   opacity:.6; }
          50%  { transform: scale(1.6); opacity:.2; }
          100% { transform: scale(1);   opacity:.6; }
        }

        @keyframes blink { 0%,49%{opacity:1} 50%,100%{opacity:0} }
      `}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Quicksand',sans-serif",
        background: 'linear-gradient(160deg,#041A0E,#062213,#0D3B22)',
        gap: 0, overflow: 'hidden',
      }}>

        {/* ── Hopping track ── */}
        <div style={{
          position: 'relative',
          width: '100%', maxWidth: 420,
          height: 110,
          margin: '0 auto',
        }}>

          {/* Lily pads */}
          {pads.map((x, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: `${x}%`, bottom: 16,
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
            }}>
              {/* Pad glow ring */}
              <div style={{
                width: 38, height: 14,
                borderRadius: '50%',
                background: '#1A6B3C',
                boxShadow: '0 2px 0 #0D3B22',
                animation: `ripple ${3+i*.4}s ease-in-out infinite`,
                animationDelay: `${i*0.4}s`,
              }} />
            </div>
          ))}

          {/* Frog + shadow wrapper — animates along the track */}
          <div style={{
            position: 'absolute',
            left: 0, bottom: 16,
            width: '16%',           /* same as first hop offset */
            animation: 'frog-hop 2.4s ease-in-out infinite',
            animationTimingFunction: 'linear',
          }}>
            {/* Shadow */}
            <div style={{
              width: 32, height: 10, borderRadius: '50%',
              background: 'rgba(0,0,0,.4)',
              margin: '0 auto',
              animation: 'shadow-hop 2.4s linear infinite',
            }} />
            {/* Frog emoji */}
            <div style={{
              fontSize: 52, lineHeight: 1,
              textAlign: 'center',
              marginTop: -8,
              userSelect: 'none',
            }}>🐸</div>
          </div>
        </div>

        {/* ── Terminal text — static, no bouncing ── */}
        <div style={{
          fontFamily: 'monospace', fontSize: 18,
          background: '#041A0E', borderRadius: 14,
          padding: '12px 22px', display: 'flex', gap: 2,
          alignItems: 'center', boxShadow: '0 6px 0 #020E07',
          border: '2px solid #0D3B22', marginTop: 18,
          letterSpacing: 1,
        }}>
          {chars.map((char, i) => (
            <span key={i} style={{
              color: colors[i],
              display: 'inline-block',
              minWidth: char === ' ' ? 5 : 'auto',
            }}>{char}</span>
          ))}
          <span style={{ color:'#7ED957', animation:'blink 1s step-end infinite', marginLeft:3 }}>▌</span>
        </div>

      </div>
    </>
  );
}
