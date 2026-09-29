import type { JSX } from 'preact';

interface LogoMotionProps {
  width?: number;
  height?: number;
  loop?: boolean;
}

export function LogoMotion({ width = 56, height = 56, loop = false }: LogoMotionProps): JSX.Element {
  const style = {
    '--anim-iteration': loop ? 'infinite' : '1',
    '--anim-fill': loop ? 'normal' : 'forwards',
  } as JSX.CSSProperties;

  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
      <style>{`
        svg { overflow: visible; }
        @keyframes kf_top-elements_transform_0 {
          0% { transform: translateY(-18px) translate(5.714px, 12px) rotate(0.262rad) scaleX(0) scaleY(0) translate(-5.714px, -12px); }
          1.67% { transform: translateY(-11.496px) translate(5.714px, 12px) rotate(0.133rad) scaleX(0.361) scaleY(0.361) translate(-5.714px, -12px); }
          3.33% { transform: translateY(-0.854px) translate(5.714px, 12px) rotate(-0.041rad) scaleX(0.953) scaleY(0.953) translate(-5.714px, -12px); }
          5% { transform: translateY(5.07px) translate(5.714px, 12px) rotate(-0.123rad) scaleX(1.282) scaleY(1.282) translate(-5.714px, -12px); }
          6.67% { transform: translateY(4.765px) translate(5.714px, 12px) rotate(-0.126rad) scaleX(1.265) scaleY(1.265) translate(-5.714px, -12px); }
          8.33% { transform: translateY(1.551px) translate(5.714px, 12px) rotate(-0.103rad) scaleX(1.086) scaleY(1.086) translate(-5.714px, -12px); }
          10% { transform: translateY(-1.072px) translate(5.714px, 12px) rotate(-0.086rad) scaleX(0.94) scaleY(0.94) translate(-5.714px, -12px); }
          11.67% { transform: translateY(-1.695px) translate(5.714px, 12px) rotate(-0.081rad) scaleX(0.906) scaleY(0.906) translate(-5.714px, -12px); }
          13.33% { transform: translateY(-0.919px) translate(5.714px, 12px) rotate(-0.083rad) scaleX(0.949) scaleY(0.949) translate(-5.714px, -12px); }
          15% { transform: translateY(0.066px) translate(5.714px, 12px) rotate(-0.086rad) scaleX(1.004) scaleY(1.004) translate(-5.714px, -12px); }
          16.67% { transform: translateY(0.517px) translate(5.714px, 12px) rotate(-0.088rad) scaleX(1.029) scaleY(1.029) translate(-5.714px, -12px); }
          18.33% { transform: translateY(0.411px) translate(5.714px, 12px) rotate(-0.088rad) scaleX(1.023) scaleY(1.023) translate(-5.714px, -12px); }
          20% { transform: translateY(0.092px) translate(5.714px, 12px) rotate(-0.087rad) scaleX(1.005) scaleY(1.005) translate(-5.714px, -12px); }
          21% { transform: translateY(-0.062px) translate(5.714px, 12px) rotate(-0.087rad) scaleX(0.997) scaleY(0.997) translate(-5.714px, -12px); }
          21.67% { transform: translateY(-0.127px) translate(5.714px, 12px) rotate(-0.073rad) scaleX(0.993) scaleY(0.993) translate(-5.714px, -12px); }
          23.33% { transform: translateY(-0.156px) translate(5.714px, 12px) rotate(-0.008rad) scaleX(0.991) scaleY(0.991) translate(-5.714px, -12px); }
          25% { transform: translateY(-0.069px) translate(5.714px, 12px) rotate(0.011rad) scaleX(0.996) scaleY(0.996) translate(-5.714px, -12px); }
          26.67% { transform: translateY(0.019px) translate(5.714px, 12px) rotate(0.003rad) scaleX(1.001) scaleY(1.001) translate(-5.714px, -12px); }
          28.33% { transform: translateY(0.051px) translate(5.714px, 12px) rotate(-0.001rad) scaleX(1.003) scaleY(1.003) translate(-5.714px, -12px); }
          30% { transform: translateY(0.034px) translate(5.714px, 12px) rotate(-0.001rad) scaleX(1.002) scaleY(1.002) translate(-5.714px, -12px); }
          31.67% { transform: translateY(0.004px) translate(5.714px, 12px) rotate(0rad) scaleX(1) scaleY(1) translate(-5.714px, -12px); }
          33.33% { transform: translateY(-0.014px) translate(5.714px, 12px) rotate(0rad) scaleX(0.999) scaleY(0.999) translate(-5.714px, -12px); }
          35% { transform: translateY(-0.014px) translate(5.714px, 12px) rotate(0rad) scaleX(0.999) scaleY(0.999) translate(-5.714px, -12px); }
          36.67% { transform: translateY(0px) translate(5.714px, 12px) rotate(0rad) scaleX(1) scaleY(1) translate(-5.714px, -12px); }
          100% { transform: translateY(0px) translate(5.714px, 12px) rotate(0rad) scaleX(1) scaleY(1) translate(-5.714px, -12px); }
        }
        @keyframes kf_top-elements_opacity_0 {
          0% { animation-timing-function: ease-out; opacity: 0; }
          10% { animation-timing-function: linear; opacity: 1; }
          100% { opacity: 1; }
        }
        #top-elements {
          transform-origin: 0 0;
          animation:
            kf_top-elements_transform_0 2s linear,
            kf_top-elements_opacity_0 2s linear;
          animation-iteration-count: var(--anim-iteration, 1);
          animation-fill-mode: var(--anim-fill, forwards);
        }
        @keyframes kf_top-elements_2_transform_0 {
          0% { transform: translateX(12.571px) translateY(0px) translateY(-18px) translate(5.714px, 5.714px) rotate(0.262rad) scaleX(0) scaleY(0) translate(-5.714px, -5.714px); }
          7.5% { transform: translateX(12.571px) translateY(0px) translateY(-18px) translate(5.714px, 5.714px) rotate(0.262rad) scaleX(0) scaleY(0) translate(-5.714px, -5.714px); }
          8.33% { transform: translateX(12.571px) translateY(0px) translateY(-16.107px) translate(5.714px, 5.714px) rotate(0.222rad) scaleX(0.105) scaleY(0.105) translate(-5.714px, -5.714px); }
          10% { transform: translateX(12.571px) translateY(0px) translateY(-5.966px) translate(5.714px, 5.714px) rotate(0.039rad) scaleX(0.669) scaleY(0.669) translate(-5.714px, -5.714px); }
          11.67% { transform: translateX(12.571px) translateY(0px) translateY(2.98px) translate(5.714px, 5.714px) rotate(-0.095rad) scaleX(1.166) scaleY(1.166) translate(-5.714px, -5.714px); }
          13.33% { transform: translateX(12.571px) translateY(0px) translateY(5.546px) translate(5.714px, 5.714px) rotate(-0.131rad) scaleX(1.308) scaleY(1.308) translate(-5.714px, -5.714px); }
          16.67% { transform: translateX(12.571px) translateY(0px) translateY(0.01px) translate(5.714px, 5.714px) rotate(-0.093rad) scaleX(1.001) scaleY(1.001) translate(-5.714px, -5.714px); }
          28.33% { transform: translateX(12.571px) translateY(0px) translateY(-0.04px) translate(5.714px, 5.714px) rotate(-0.087rad) scaleX(0.998) scaleY(0.998) translate(-5.714px, -5.714px); }
          30% { transform: translateX(12.571px) translateY(0px) translateY(-0.163px) translate(5.714px, 5.714px) rotate(-0.038rad) scaleX(0.991) scaleY(0.991) translate(-5.714px, -5.714px); }
          43.33% { transform: translateX(12.571px) translateY(0px) translateY(0px) translate(5.714px, 5.714px) rotate(0rad) scaleX(1) scaleY(1) translate(-5.714px, -5.714px); }
          100% { transform: translateX(12.571px) translateY(0px) translateY(0px) translate(5.714px, 5.714px) rotate(0rad) scaleX(1) scaleY(1) translate(-5.714px, -5.714px); }
        }
        @keyframes kf_top-elements_2_opacity_0 {
          0% { animation-timing-function: linear; opacity: 0; }
          7.5% { animation-timing-function: ease-out; opacity: 0; }
          17.5% { animation-timing-function: linear; opacity: 1; }
          100% { opacity: 1; }
        }
        #top-elements_2 {
          transform-origin: 0 0;
          animation:
            kf_top-elements_2_transform_0 2s linear,
            kf_top-elements_2_opacity_0 2s linear;
          animation-iteration-count: var(--anim-iteration, 1);
          animation-fill-mode: var(--anim-fill, forwards);
        }
        @keyframes kf_top-elements_3_transform_0 {
          0% { transform: translateX(12.571px) translateY(12.571px) translateY(-18px) translate(5.714px, 5.714px) rotate(0.262rad) scaleX(0) scaleY(0) translate(-5.714px, -5.714px); }
          15% { transform: translateX(12.571px) translateY(12.571px) translateY(-18px) translate(5.714px, 5.714px) rotate(0.262rad) scaleX(0) scaleY(0) translate(-5.714px, -5.714px); }
          16.67% { transform: translateX(12.571px) translateY(12.571px) translateY(-11.496px) translate(5.714px, 5.714px) rotate(0.133rad) scaleX(0.361) scaleY(0.361) translate(-5.714px, -5.714px); }
          18.33% { transform: translateX(12.571px) translateY(12.571px) translateY(-0.854px) translate(5.714px, 5.714px) rotate(-0.041rad) scaleX(0.953) scaleY(0.953) translate(-5.714px, -5.714px); }
          20% { transform: translateX(12.571px) translateY(12.571px) translateY(5.07px) translate(5.714px, 5.714px) rotate(-0.123rad) scaleX(1.282) scaleY(1.282) translate(-5.714px, -5.714px); }
          21.67% { transform: translateX(12.571px) translateY(12.571px) translateY(4.765px) translate(5.714px, 5.714px) rotate(-0.126rad) scaleX(1.265) scaleY(1.265) translate(-5.714px, -5.714px); }
          35% { transform: translateX(12.571px) translateY(12.571px) translateY(0.092px) translate(5.714px, 5.714px) rotate(-0.087rad) scaleX(1.005) scaleY(1.005) translate(-5.714px, -5.714px); }
          51.67% { transform: translateX(12.571px) translateY(12.571px) translateY(0px) translate(5.714px, 5.714px) rotate(0rad) scaleX(1) scaleY(1) translate(-5.714px, -5.714px); }
          100% { transform: translateX(12.571px) translateY(12.571px) translateY(0px) translate(5.714px, 5.714px) rotate(0rad) scaleX(1) scaleY(1) translate(-5.714px, -5.714px); }
        }
        @keyframes kf_top-elements_3_opacity_0 {
          0% { animation-timing-function: linear; opacity: 0; }
          15% { animation-timing-function: ease-out; opacity: 0; }
          25% { animation-timing-function: linear; opacity: 1; }
          100% { opacity: 1; }
        }
        #top-elements_3 {
          transform-origin: 0 0;
          animation:
            kf_top-elements_3_transform_0 2s linear,
            kf_top-elements_3_opacity_0 2s linear;
          animation-iteration-count: var(--anim-iteration, 1);
          animation-fill-mode: var(--anim-fill, forwards);
        }
      `}</style>
      <g id="Elastic">
        <g id="top-elements">
          <g id="left-funnel">
            <rect width="11.4286" height="24" rx="2.28571" id="left-funnel_bg_0" fill="#CBC6C2" />
          </g>
        </g>
        <g id="top-elements_2" transform="translate(12.5714)">
          <g id="left-funnel_2">
            <path d="M0 5.71429C0 2.55837 2.55837 0 5.71429 0V0C8.8702 0 11.4286 2.55837 11.4286 5.71429V5.71429C11.4286 8.8702 8.8702 11.4286 5.71429 11.4286V11.4286C2.55837 11.4286 0 8.8702 0 5.71429V5.71429Z" id="left-funnel_2_bg_0" fill="#EB4807" />
          </g>
        </g>
        <g id="top-elements_3" transform="translate(12.5714 12.5714)">
          <g id="left-funnel_3">
            <rect width="11.4286" height="11.4286" rx="2.28571" id="left-funnel_3_bg_0" fill="white" />
          </g>
        </g>
      </g>
    </svg>
  );
}
