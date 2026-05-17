// WebGL renderer for the cinematic intro.
// Owns GL context, fullscreen quad, uniforms, and the render loop.
// Adaptive: caps DPR, lowers render scale + quality if avg frame time > 22ms.

import { VERT_SRC, FRAG_SRC } from './shaders.js';

export function createIntroRenderer(canvas) {
  const gl = canvas.getContext('webgl', {
    premultipliedAlpha: false,
    antialias: false,
    alpha: false,
  });
  if (!gl) {
    return { ok: false, start: () => {}, stop: () => {}, setProgress: () => {}, dispose: () => {} };
  }

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('[intro] shader compile error:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }
  const vs = compile(gl.VERTEX_SHADER, VERT_SRC);
  const fs = compile(gl.FRAGMENT_SHADER, FRAG_SRC);
  if (!vs || !fs) {
    return { ok: false, start: () => {}, stop: () => {}, setProgress: () => {}, dispose: () => {} };
  }

  const program = gl.createProgram();
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return { ok: false, start: () => {}, stop: () => {}, setProgress: () => {}, dispose: () => {} };
  }
  gl.useProgram(program);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
    gl.STATIC_DRAW
  );
  const aPos = gl.getAttribLocation(program, 'a_pos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  const uRes      = gl.getUniformLocation(program, 'u_res');
  const uTime     = gl.getUniformLocation(program, 'u_time');
  const uProgress = gl.getUniformLocation(program, 'u_progress');
  const uQuality  = gl.getUniformLocation(program, 'u_quality');
  const uPointer  = gl.getUniformLocation(program, 'u_pointer');

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  let renderScale = isMobile ? 0.75 : 1.0;
  let quality     = isMobile ? 0.65 : 1.0;
  const dprCap    = isMobile ? 1.25 : 1.5;

  let progress = 0;
  const pointer = [0, 0];
  const pointerTarget = [0, 0];
  let running = false;
  let rafId = 0;
  const startT = performance.now();

  const FRAME_WINDOW = 30;
  const frameTimes = [];
  let lastFrame = startT;
  let downscaled = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, dprCap) * renderScale;
    const w = Math.max(1, Math.floor(window.innerWidth  * dpr));
    const h = Math.max(1, Math.floor(window.innerHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  }

  function onPointer(e) {
    const aspect = window.innerWidth / window.innerHeight;
    pointerTarget[0] = ((e.clientX / window.innerWidth)  * 2 - 1) * aspect;
    pointerTarget[1] = -((e.clientY / window.innerHeight) * 2 - 1);
  }

  function tick() {
    if (!running) return;
    const now = performance.now();
    const dt  = now - lastFrame;
    lastFrame = now;

    if (!downscaled) {
      frameTimes.push(dt);
      if (frameTimes.length > FRAME_WINDOW) frameTimes.shift();
      if (frameTimes.length === FRAME_WINDOW) {
        const avg = frameTimes.reduce((a, b) => a + b, 0) / FRAME_WINDOW;
        if (avg > 22) {
          renderScale *= 0.75;
          quality = Math.max(0.55, quality - 0.2);
          downscaled = true;
          resize();
        }
      }
    }

    pointer[0] += (pointerTarget[0] - pointer[0]) * 0.06;
    pointer[1] += (pointerTarget[1] - pointer[1]) * 0.06;

    const t = (now - startT) / 1000;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, t);
    gl.uniform1f(uProgress, progress);
    gl.uniform1f(uQuality, quality);
    gl.uniform2f(uPointer, pointer[0], pointer[1]);

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    rafId = requestAnimationFrame(tick);
  }

  function start() {
    if (running) return;
    running = true;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(tick);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }
  function onVisibility() {
    if (document.hidden) stop();
    else if (progress < 1) start();
  }

  resize();
  window.addEventListener('resize', resize);
  window.addEventListener('pointermove', onPointer, { passive: true });
  document.addEventListener('visibilitychange', onVisibility);

  return {
    ok: true,
    start,
    stop,
    setProgress: (v) => { progress = v; },
    dispose: () => {
      stop();
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    },
  };
}
