import * as THREE from 'three';

export function initWebGL() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas) return {};

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene = new THREE.Scene();
  
  // Camera
  const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 0, 5);

  // ═══════════════════════════════════════════════
  // 1. THE BLACK HOLE SHADER
  // ═══════════════════════════════════════════════
  // This is a 2D plane placed far back that renders the gravitational lensing
  // and accretion disk of the black hole purely using GPU math.
  const bgGeo = new THREE.PlaneGeometry(30, 30);
  
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    varying vec2 vUv;

    // Fast Simplex Noise for plasma texture
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ; m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    void main() {
      // Center coordinates and fix aspect ratio
      vec2 st = vUv - 0.5;
      st.x *= uResolution.x / uResolution.y;

      float r = length(st);
      float a = atan(st.y, st.x);
      float t = uTime * 0.5;

      // 1. EVENT HORIZON
      float bhRadius = 0.12;
      float eventHorizon = smoothstep(bhRadius, bhRadius + 0.005, r);

      // 2. GRAVITATIONAL LENSING
      // Warp space heavily near the event horizon
      float lensing = 1.0 - (bhRadius * bhRadius) / (r * r + 0.001);
      vec2 warpedSt = st * lensing;
      float warpedR = length(warpedSt);

      // 3. ACCRETION DISK (The horizontal glowing plane)
      // Thickness tapers off farther away from center
      float diskThickness = 0.003 + 0.02 * smoothstep(0.4, 0.05, abs(warpedSt.x));
      float disk = smoothstep(diskThickness, 0.0, abs(warpedSt.y));
      // Fade out at the edges horizontally
      disk *= smoothstep(0.8, 0.15, abs(warpedSt.x));
      // Cut off exactly at the event horizon
      disk *= smoothstep(bhRadius, bhRadius + 0.01, r);
      
      // Plasma texture inside the disk
      float plasma = snoise(vec2(warpedSt.x * 20.0 - t * 2.0, warpedSt.y * 50.0));
      disk *= 0.6 + 0.4 * plasma;

      // 4. PHOTON RING (The halo of light warped above and below)
      float ringRadius = 0.16;
      float ringThickness = 0.015;
      float halo = smoothstep(ringThickness, 0.0, abs(r - ringRadius));
      // Halo is brightest at the top and bottom due to lensing of the back of the disk
      halo *= 0.2 + 0.8 * abs(sin(a));
      halo *= smoothstep(bhRadius, bhRadius + 0.01, r);
      
      // Halo plasma
      float ringPlasma = snoise(vec2(a * 4.0 - t, r * 30.0));
      halo *= 0.7 + 0.3 * ringPlasma;

      // 5. AMBIENT GLOWS
      float diskGlow = exp(-abs(warpedSt.y) * 25.0) * smoothstep(0.7, 0.1, abs(warpedSt.x));
      float haloGlow = exp(-abs(r - ringRadius) * 15.0) * (0.3 + 0.7 * abs(sin(a)));
      float centerGlow = exp(-r * 4.0);

      // 6. COLOR PALETTE (Reflect.app Deep Violet/Purple)
      vec3 spaceColor = vec3(0.01, 0.005, 0.03); // Deepest dark purple
      vec3 coreColor = vec3(1.0, 0.95, 1.0);     // Blinding white-purple
      vec3 diskColor = vec3(0.6, 0.2, 1.0);      // Neon violet
      vec3 haloColor = vec3(0.3, 0.0, 0.7);      // Darker deep purple

      vec3 finalColor = spaceColor;
      
      // Add Glows
      finalColor += diskColor * diskGlow * 0.7;
      finalColor += haloColor * haloGlow * 0.9;
      finalColor += haloColor * centerGlow * 0.5;
      
      // Add Solid structures
      finalColor += coreColor * disk * 1.5;
      finalColor += diskColor * halo * 1.5;

      // Punch out the Black Hole
      finalColor *= eventHorizon;

      // Edge Vignette to blend into space
      finalColor *= smoothstep(1.0, 0.3, r);

      gl_FragColor = vec4(finalColor, 1.0);
    }
  `;

  const uniforms = {
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  };

  const bgMat = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms,
    depthWrite: false
  });

  const bgMesh = new THREE.Mesh(bgGeo, bgMat);
  bgMesh.position.z = -10;
  scene.add(bgMesh);

  // ═══════════════════════════════════════════════
  // 2. LIVE PARTICLE EFFECTS (Orbiting Debris)
  // ═══════════════════════════════════════════════
  const particlesGeo = new THREE.BufferGeometry();
  const particleCount = 1000;
  const posArray = new Float32Array(particleCount * 3);
  const randArray = new Float32Array(particleCount);

  for(let i=0; i<particleCount; i++) {
    // Distribute in a wide disk shape
    const radius = 0.5 + Math.random() * 8;
    const angle = Math.random() * Math.PI * 2;
    posArray[i*3] = Math.cos(angle) * radius;
    posArray[i*3+1] = (Math.random() - 0.5) * 0.3; // Flat disk
    posArray[i*3+2] = Math.sin(angle) * radius;
    randArray[i] = Math.random(); // Random seed for twinkling
  }

  particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  particlesGeo.setAttribute('aRand', new THREE.BufferAttribute(randArray, 1));

  const pVert = `
    attribute float aRand;
    varying float vRand;
    void main() {
      vRand = aRand;
      vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = (12.0 * aRand + 4.0) / -mvPosition.z; // Perspective sizing
      gl_Position = projectionMatrix * mvPosition;
    }
  `;
  
  const pFrag = `
    varying float vRand;
    uniform float uTime;
    void main() {
      // Create soft circular particles
      vec2 xy = gl_PointCoord.xy - vec2(0.5);
      float ll = length(xy);
      if(ll > 0.5) discard;
      
      // Twinkle effect based on time and random seed
      float alpha = 0.2 + 0.8 * sin(uTime * 3.0 * vRand + vRand * 10.0);
      
      // Purple-to-white color mix
      vec3 color = mix(vec3(0.5, 0.2, 1.0), vec3(1.0, 1.0, 1.0), vRand);
      gl_FragColor = vec4(color, alpha * (1.0 - ll*2.0));
    }
  `;

  const particlesMat = new THREE.ShaderMaterial({
    vertexShader: pVert,
    fragmentShader: pFrag,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
  // Tilt the particle disk back to match the 2D lensing perspective of the shader
  particlesMesh.rotation.x = Math.PI / 2 - 0.15; 
  particlesMesh.position.z = -5; // Place in front of the background
  scene.add(particlesMesh);

  // ═══════════════════════════════════════════════
  // ANIMATION & INTERACTION
  // ═══════════════════════════════════════════════
  let targetX = 0;
  let targetY = 0;
  document.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 1.5;
    targetY = (e.clientY / window.innerHeight - 0.5) * 1.5;
  });

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    
    // Update Shader Times
    uniforms.uTime.value = t;
    particlesMat.uniforms.uTime.value = t;

    // Slowly rotate the particle disk
    particlesMesh.rotation.z = t * 0.08;

    // Smooth Parallax Camera
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, -10);

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
  });

  return { updateCamera: () => {} };
}
