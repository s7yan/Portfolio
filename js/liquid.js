// WebGL Liquid Background — flowing noise field with cursor-reactive ripples
// Renders behind page content. Cosmic purple/blue palette to match hero.

const canvas = document.getElementById('liquidCanvas');
if (canvas) {
  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false });

  if (gl) {
    const vertSrc = `
      attribute vec2 a_pos;
      void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
    `;

    const fragSrc = `
      precision highp float;
      uniform vec2 u_res;
      uniform float u_time;
      uniform vec2 u_mouse;
      uniform float u_mouseInfluence;

      // Hash & value noise
      vec2 hash2(vec2 p) {
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
        return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(dot(hash2(i + vec2(0,0)), f - vec2(0,0)),
                      dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
                  mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
                      dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.03;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - 0.5 * u_res.xy) / min(u_res.x, u_res.y);
        vec2 mouse = (u_mouse - 0.5 * u_res.xy) / min(u_res.x, u_res.y);

        // Domain warping for liquid feel
        float t = u_time * 0.08;
        vec2 q = vec2(fbm(uv + vec2(0.0, t)), fbm(uv + vec2(5.2, -t)));
        vec2 r = vec2(
          fbm(uv + 1.6 * q + vec2(1.7 + 0.15 * t, 9.2)),
          fbm(uv + 1.6 * q + vec2(8.3 - 0.13 * t, 2.8))
        );
        float f = fbm(uv + 2.4 * r);

        // Mouse ripple distortion
        float md = length(uv - mouse);
        float ripple = exp(-md * 4.5) * u_mouseInfluence;
        f += ripple * 0.35 * sin(md * 22.0 - u_time * 2.6);

        // Color palette: deep cosmic violet → soft indigo highlights
        vec3 c1 = vec3(0.04, 0.02, 0.10);  // deep void
        vec3 c2 = vec3(0.22, 0.10, 0.46);  // mid violet
        vec3 c3 = vec3(0.55, 0.42, 0.95);  // accent purple
        vec3 c4 = vec3(0.36, 0.62, 1.00);  // cool blue highlight

        vec3 col = mix(c1, c2, smoothstep(-0.3, 0.4, f));
        col = mix(col, c3, smoothstep(0.30, 0.85, f) * 0.65);
        col = mix(col, c4, smoothstep(0.55, 1.10, f) * 0.35);

        // Vignette + soft glow toward center
        float vig = smoothstep(1.2, 0.3, length(uv));
        col *= 0.45 + 0.55 * vig;

        // Subtle ripple light
        col += vec3(0.45, 0.38, 0.85) * ripple * 0.18;

        gl_FragColor = vec4(col, 1.0);
      }
    `;

    function compile(type, src) {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.warn('Liquid shader error:', gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    }

    const vs = compile(gl.VERTEX_SHADER, vertSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(program, 'u_res');
    const uTime = gl.getUniformLocation(program, 'u_time');
    const uMouse = gl.getUniformLocation(program, 'u_mouse');
    const uMouseInf = gl.getUniformLocation(program, 'u_mouseInfluence');

    let mouse = [window.innerWidth / 2, window.innerHeight / 2];
    let mouseInfluence = 0;
    let targetInfluence = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);

    window.addEventListener('pointermove', (e) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      mouse = [e.clientX * dpr, (window.innerHeight - e.clientY) * dpr];
      targetInfluence = 1.0;
    }, { passive: true });

    window.addEventListener('pointerleave', () => { targetInfluence = 0; });

    const start = performance.now();
    function frame() {
      const t = (performance.now() - start) / 1000;
      mouseInfluence += (targetInfluence - mouseInfluence) * 0.04;
      targetInfluence *= 0.985;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uMouse, mouse[0], mouse[1]);
      gl.uniform1f(uMouseInf, mouseInfluence);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      requestAnimationFrame(frame);
    }
    frame();
  }
}
