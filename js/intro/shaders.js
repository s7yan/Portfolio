// Vertex + fragment shader sources for the cinematic intro.
// One full-screen quad; all visual phases live in the fragment shader,
// driven by a single `u_progress` uniform tweened by GSAP (0 → 1).

export const VERT_SRC = `
  attribute vec2 a_pos;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`;

// Phase map (u_progress):
//   0.00–0.15  black + grain + faint ambient core
//   0.15–0.30  ambient glow blooms
//   0.30–0.60  liquid noise mask carves scene into view, UV displaces
//   0.60–0.85  portal scene fully visible — floor, fog, dust, chromatic settles
//   0.85–1.00  canvas alpha → 0, hands off to underlying page
export const FRAG_SRC = `
  precision highp float;

  uniform vec2  u_res;
  uniform float u_time;
  uniform float u_progress;
  uniform float u_quality;
  uniform vec2  u_pointer;

  // ── Noise primitives ───────────────────────────────────────────────────────
  vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float vnoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(dot(hash2(i + vec2(0,0)), f - vec2(0,0)),
                    dot(hash2(i + vec2(1,0)), f - vec2(1,0)), u.x),
                mix(dot(hash2(i + vec2(0,1)), f - vec2(0,1)),
                    dot(hash2(i + vec2(1,1)), f - vec2(1,1)), u.x), u.y);
  }

  // 3-octave FBM, fixed cost
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    v += a * vnoise(p); p *= 2.03; a *= 0.5;
    v += a * vnoise(p); p *= 2.03; a *= 0.5;
    v += a * vnoise(p);
    return v;
  }

  // Cheap 2-octave variant for mask/displacement (called multiple times)
  float fbm2(vec2 p) {
    return 0.5 * vnoise(p) + 0.25 * vnoise(p * 2.03);
  }

  // ── Scene: portal + reflective floor + atmospheric haze ─────────────────────
  // Called ONCE per pixel — keep it lean.
  vec3 portalScene(vec2 uv, float t) {
    vec3 col = vec3(0.0);

    // Central portal: soft core + ring halo + outer bleed
    float d = length(uv);
    float core  = exp(-d * 5.5);
    float halo  = exp(-pow(abs(d - 0.28), 2.0) * 95.0);
    float bleed = exp(-d * 1.6) * 0.32;
    col += vec3(0.78, 0.62, 1.00) * core * 1.9;
    col += vec3(0.65, 0.80, 1.00) * halo * 1.5;
    col += vec3(0.32, 0.20, 0.55) * bleed;

    // Reflective floor: mirrors portal with sine ripples (no noise sample needed)
    if (uv.y < -0.02) {
      vec2 refl = vec2(uv.x, -uv.y - 0.04);
      float wave = sin(length(refl) * 11.0 - t * 1.4) * 0.045;
      refl.y += wave * smoothstep(0.55, 0.0, abs(uv.y));
      float rd = length(refl);
      float rcore = exp(-rd * 5.0) * 0.55;
      float rhalo = exp(-pow(abs(rd - 0.28), 2.0) * 70.0) * 0.4;
      vec3  rcol  = vec3(0.55, 0.45, 0.95) * rcore + vec3(0.55, 0.70, 0.95) * rhalo;
      col += rcol * smoothstep(-0.85, -0.02, uv.y);
      col *= 0.55 + 0.45 * smoothstep(-0.95, -0.10, uv.y);
    }

    // Atmospheric haze toward top
    col += vec3(0.10, 0.08, 0.22) * smoothstep(-0.1, 0.9, uv.y) * 0.5;

    return col;
  }

  // ── Reveal mask: descending threshold over flow-warped noise ────────────────
  float revealMask(vec2 uv, float p) {
    vec2 q = vec2(
      fbm2(uv * 1.1 + vec2(0.0, u_time * 0.04)),
      fbm2(uv * 1.1 + vec2(3.7, -u_time * 0.04))
    );
    float n  = fbm2(uv * 1.6 + q * 2.0);
    float th = mix(1.05, -0.45, smoothstep(0.08, 0.55, p));
    return smoothstep(th, th - 0.28, n);
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);

    float p = u_progress;
    float t = u_time;

    uv += u_pointer * 0.020;
    uv *= mix(1.06, 1.00, smoothstep(0.0, 1.0, p));

    // Liquid UV displacement (single fbm2 call, calms quickly)
    float displaceAmp = (1.0 - smoothstep(0.10, 0.65, p)) * 0.12;
    float fl = fbm2(uv * 1.3 + vec2(t * 0.10, -t * 0.10));
    vec2 sceneUV = uv + vec2(fl, -fl) * displaceAmp;

    // Single scene sample
    vec3 baseScene = portalScene(sceneUV, t);

    // Chromatic shift via channel reweight on same sample (no extra calls)
    float lum = dot(baseScene, vec3(0.299, 0.587, 0.114));
    float ca  = (1.0 - smoothstep(0.30, 0.85, p)) * 0.10;
    vec3 scene = baseScene + vec3(ca, 0.0, -ca) * lum * 0.6;

    // Reveal mask + intensity ramp — start visible content very early
    float mask = revealMask(uv, p);
    float intensity = smoothstep(0.0, 0.30, p);
    vec3 col = scene * mask * intensity;

    // Ambient center glow — present from frame 1, peaks early
    float ambient = exp(-length(uv) * 2.2)
                  * smoothstep(0.0, 0.15, p)
                  * (1.0 - smoothstep(0.25, 0.55, p))
                  * 0.65;
    col += vec3(0.40, 0.28, 0.70) * ambient;

    // Film grain
    float grain = (fract(sin(dot(gl_FragCoord.xy + t * 60.0, vec2(12.9898, 78.233))) * 43758.5453) - 0.5);
    col += grain * (0.040 - 0.025 * smoothstep(0.45, 0.85, p));

    // Vignette
    float vig = smoothstep(1.35, 0.40, length(uv));
    col *= 0.55 + 0.45 * vig;

    gl_FragColor = vec4(col, 1.0);
  }
`;
