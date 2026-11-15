  /*
    Van Langen Labs landing page
    ---------------------------------
    Logo texture rendered through WebGL2 on a full-screen quad.

    Effect:
    - centered responsive logo
    - underwater / relief-glass refraction
    - subtle cyan caustic overlay
    - optional light sparkle / shimmer
  */

  const CONFIG = {
    logoUrl: "vanlangenlabs.png",

    // Logo size in pixels. Final size is:
    // min(screen width * logoScreenScale, screen height * logoScreenScale, logoMaxSizePx)
    logoMaxSizePx: 420.0,
    logoScreenScale: 0.72,

    // Refraction/distortion.
    // Good values:
    // 0.055 = subtle
    // 0.095 = visible
    // 0.140 = strong underwater effect
    refractionStrength: 0.105,

    // Extra RGB split caused by the virtual glass/water.
    // Keep this fairly low.
    chromaStrength: 0.0045,

    // Bright caustic/plasma overlay from the ShaderToy-like field.
    // 0.00 = off
    // 0.18 = subtle/visible
    // 0.30 = stronger
    causticIntensity: 0.22,

    // General cyan logo glow.
    glowIntensity: 0.05,

    // Soft halo behind logo.
    haloIntensity: 0.065,

    // Animation speed multiplier.
    // 0.5 = slow
    // 1.0 = normal
    // 1.5 = more active
    animationSpeed: 0.75,

    // Light sparkle/specular shimmer.
    // 0.00 = off
    // 0.15 = subtle
    // 0.35 = clear
    // 0.60 = quite shiny
    sparkleIntensity: 0.35,

    // Size/sharpness of sparkle highlights.
    // Higher = thinner sharper highlights.
    sparkleSharpness: 28.0,

    // How many diagonal shimmer bands pass over the logo.
    sparkleFrequency: 3.5,

    // Speed of shimmer bands.
    sparkleSpeed: 0.35,

    // Vertical offset of the logo from the screen center, as a fraction of
    // screen height. Positive moves the logo up.
    // 0.00 = centered
    // 0.08 = slightly higher
    // 0.15 = clearly above center
    logoVerticalOffset: 0.08
  };

  const canvas = document.getElementById("glcanvas");
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: true,
    premultipliedAlpha: false
  });
  const isFileProtocol = window.location.protocol === "file:";

  let fallbackEnabled = false;

  function enableFallback(reason) {
    if (fallbackEnabled) {
      return;
    }

    fallbackEnabled = true;
    document.body.classList.add("no-webgl");

    if (reason) {
      console.error(reason);
    }
  }

  if (isFileProtocol) {
    enableFallback("WebGL is disabled on file:// to avoid browser texture security restrictions.");
  }

  if (!gl && !fallbackEnabled) {
    enableFallback("WebGL2 not supported");
  }

  if (gl && !fallbackEnabled) {

  const vertexShaderSource = `#version 300 es
    precision highp float;

    in vec2 a_position;
    out vec2 v_uv;

    void main() {
      v_uv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `#version 300 es
    precision highp float;

    #define TAU 6.28318530718
    #define MAX_ITER 5

    uniform sampler2D u_logo;
    uniform vec2 u_resolution;
    uniform float u_time;

    uniform float u_logoMaxSizePx;
    uniform float u_logoScreenScale;
    uniform float u_refractionStrength;
    uniform float u_chromaStrength;
    uniform float u_causticIntensity;
    uniform float u_glowIntensity;
    uniform float u_haloIntensity;
    uniform float u_animationSpeed;
    uniform float u_sparkleIntensity;
    uniform float u_sparkleSharpness;
    uniform float u_sparkleFrequency;
    uniform float u_sparkleSpeed;
    uniform float u_logoVerticalOffset;

    in vec2 v_uv;
    out vec4 outColor;

    float shadertoyCaustic(vec2 uv) {
      float time = u_time * u_animationSpeed * 0.5 + 23.0;

      vec2 p = mod(uv * TAU, TAU) - 250.0;
      vec2 i = p;

      float c = 1.0;
      float inten = 0.005;

      for (int n = 0; n < MAX_ITER; n++) {
        float t = time * (1.0 - (3.5 / float(n + 1)));

        i = p + vec2(
          cos(t - i.x) + sin(t + i.y),
          sin(t - i.y) + cos(t + i.x)
        );

        c += 1.0 / length(vec2(
          p.x / (sin(i.x + t) / inten),
          p.y / (cos(i.y + t) / inten)
        ));
      }

      c /= float(MAX_ITER);
      c = 1.17 - pow(c, 1.4);

      return pow(abs(c), 8.0);
    }

    float heightField(vec2 uv) {
      float t = u_time * u_animationSpeed;

      // Slowly drift the caustic layer over the logo.
      vec2 movingUv = uv * 1.15 + vec2(t * 0.025, -t * 0.018);

      float c1 = shadertoyCaustic(movingUv);
      float c2 = shadertoyCaustic(movingUv * 1.7 + vec2(2.4, 1.3));

      return c1 * 0.75 + c2 * 0.25;
    }

    float sparkleField(vec2 uv, vec2 normal, float brightness) {
      float t = u_time * u_animationSpeed;

      // Diagonal moving shimmer bands.
      float diagonal =
        uv.x * 0.72 +
        uv.y * 1.12 +
        normal.x * 1.8 +
        normal.y * 1.2;

      float band = sin(
        diagonal * TAU * u_sparkleFrequency -
        t * TAU * u_sparkleSpeed
      );

      // Convert sine wave into thin highlights.
      float shimmer = pow(max(band, 0.0), u_sparkleSharpness);

      // Add small water-caustic sparkle points.
      float caustic = heightField(uv + vec2(0.17, 0.31));
      float points = pow(max(caustic, 0.0), 2.4);

      // Keep the sparkle mostly on visible/bright parts of the logo.
      float logoMask = smoothstep(0.08, 0.75, brightness);

      return (shimmer * 0.85 + points * 0.15) * logoMask;
    }

    void main() {
      vec2 pixel = v_uv * u_resolution;

      float logoSizePx = min(
        min(u_resolution.x * u_logoScreenScale, u_resolution.y * u_logoScreenScale),
        u_logoMaxSizePx
      );

      // Shift the logo up by a fraction of screen height.
      vec2 logoCenter = u_resolution * (0.5 + vec2(0.0, u_logoVerticalOffset));
      vec2 centered = pixel - logoCenter;
      vec2 logoUv = centered / logoSizePx + 0.5;

      float baseInside =
        step(0.0, logoUv.x) *
        step(0.0, logoUv.y) *
        step(logoUv.x, 1.0) *
        step(logoUv.y, 1.0);

      // Sample height around current uv to create a pseudo-normal.
      // This is the "relief glass / water surface".
      float e = 0.0028;

      float hL = heightField(logoUv - vec2(e, 0.0));
      float hR = heightField(logoUv + vec2(e, 0.0));
      float hD = heightField(logoUv - vec2(0.0, e));
      float hU = heightField(logoUv + vec2(0.0, e));

      vec2 normal = vec2(hL - hR, hD - hU);

      vec2 refractedUv = logoUv + normal * u_refractionStrength;

      float inside =
        step(0.0, refractedUv.x) *
        step(0.0, refractedUv.y) *
        step(refractedUv.x, 1.0) *
        step(refractedUv.y, 1.0);

      // Small RGB split makes the glass/refraction more visible.
      vec4 texR = texture(u_logo, refractedUv + normal * u_chromaStrength);
      vec4 texG = texture(u_logo, refractedUv);
      vec4 texB = texture(u_logo, refractedUv - normal * u_chromaStrength);

      vec4 logo = vec4(texR.r, texG.g, texB.b, texG.a) * inside;

      float logoBrightness = max(max(logo.r, logo.g), logo.b);

      // Caustic overlay from the same field.
      float caustic = heightField(logoUv);

      vec3 causticColour = clamp(
        vec3(pow(abs(caustic), 1.6)) + vec3(0.0, 0.35, 0.5),
        0.0,
        1.0
      );

      vec3 causticOverlay =
        causticColour *
        smoothstep(0.08, 0.85, logoBrightness) *
        baseInside *
        u_causticIntensity;

      // Specular light sparkle / shimmer.
      float sparkle = sparkleField(logoUv, normal, logoBrightness);

      vec3 sparkleColour =
        vec3(0.72, 0.95, 1.0) *
        sparkle *
        u_sparkleIntensity *
        baseInside;

      // Extra small white core on the strongest sparkles.
      vec3 sparkleCore =
        vec3(1.0) *
        pow(sparkle, 2.2) *
        u_sparkleIntensity *
        0.65 *
        baseInside;

      // Soft background halo around the logo.
      float distFromCenter = length(centered / logoSizePx);
      float halo = smoothstep(1.0, 0.0, distFromCenter) * u_haloIntensity;
      vec3 background = vec3(0.0, 0.015, 0.035) * halo;

      // Restrained cyan glow from the logo itself.
      vec3 glow = vec3(0.0, 0.55, 1.0) * logoBrightness * u_glowIntensity;

      vec3 color =
        background +
        logo.rgb +
        causticOverlay +
        glow +
        sparkleColour +
        sparkleCore;

      outColor = vec4(color, 1.0);
    }
  `;

  function createShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader);
      gl.deleteShader(shader);
      throw new Error(message);
    }

    return shader;
  }

  function createProgram(vertexSource, fragmentSource) {
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program);
      gl.deleteProgram(program);
      throw new Error(message);
    }

    return program;
  }

  const program = createProgram(vertexShaderSource, fragmentShaderSource);

  const locations = {
    position: gl.getAttribLocation(program, "a_position"),
    logo: gl.getUniformLocation(program, "u_logo"),
    resolution: gl.getUniformLocation(program, "u_resolution"),
    time: gl.getUniformLocation(program, "u_time"),

    logoMaxSizePx: gl.getUniformLocation(program, "u_logoMaxSizePx"),
    logoScreenScale: gl.getUniformLocation(program, "u_logoScreenScale"),
    refractionStrength: gl.getUniformLocation(program, "u_refractionStrength"),
    chromaStrength: gl.getUniformLocation(program, "u_chromaStrength"),
    causticIntensity: gl.getUniformLocation(program, "u_causticIntensity"),
    glowIntensity: gl.getUniformLocation(program, "u_glowIntensity"),
    haloIntensity: gl.getUniformLocation(program, "u_haloIntensity"),
    animationSpeed: gl.getUniformLocation(program, "u_animationSpeed"),
    sparkleIntensity: gl.getUniformLocation(program, "u_sparkleIntensity"),
    sparkleSharpness: gl.getUniformLocation(program, "u_sparkleSharpness"),
    sparkleFrequency: gl.getUniformLocation(program, "u_sparkleFrequency"),
    sparkleSpeed: gl.getUniformLocation(program, "u_sparkleSpeed"),
    logoVerticalOffset: gl.getUniformLocation(program, "u_logoVerticalOffset")
  };

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

  // Full-screen quad, rendered as two triangles.
  const positions = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,

    -1,  1,
     1, -1,
     1,  1
  ]);

  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

  gl.enableVertexAttribArray(locations.position);
  gl.vertexAttribPointer(locations.position, 2, gl.FLOAT, false, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Temporary black pixel until image is loaded.
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255])
  );

  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let imageLoaded = false;

  const image = new Image();
  const logoUrl = new URL(CONFIG.logoUrl, window.location.href);
  const isCrossOrigin = logoUrl.origin !== window.location.origin;

  // Only use CORS mode for truly cross-origin assets.
  if (isCrossOrigin) {
    image.crossOrigin = "anonymous";
  }

  image.src = logoUrl.href;

  image.onload = () => {
    try {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
      );

      imageLoaded = true;
    } catch (error) {
      enableFallback(`Texture upload failed for ${CONFIG.logoUrl}: ${error}`);
    }
  };

  image.onerror = () => {
    enableFallback(`Could not load ${CONFIG.logoUrl}`);
  };

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const width = Math.floor(canvas.clientWidth * dpr);
    const height = Math.floor(canvas.clientHeight * dpr);

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      gl.viewport(0, 0, width, height);
    }
  }

  function uploadConfigUniforms() {
    gl.uniform1f(locations.logoMaxSizePx, CONFIG.logoMaxSizePx);
    gl.uniform1f(locations.logoScreenScale, CONFIG.logoScreenScale);
    gl.uniform1f(locations.refractionStrength, CONFIG.refractionStrength);
    gl.uniform1f(locations.chromaStrength, CONFIG.chromaStrength);
    gl.uniform1f(locations.causticIntensity, CONFIG.causticIntensity);
    gl.uniform1f(locations.glowIntensity, CONFIG.glowIntensity);
    gl.uniform1f(locations.haloIntensity, CONFIG.haloIntensity);
    gl.uniform1f(locations.animationSpeed, CONFIG.animationSpeed);
    gl.uniform1f(locations.sparkleIntensity, CONFIG.sparkleIntensity);
    gl.uniform1f(locations.sparkleSharpness, CONFIG.sparkleSharpness);
    gl.uniform1f(locations.sparkleFrequency, CONFIG.sparkleFrequency);
    gl.uniform1f(locations.sparkleSpeed, CONFIG.sparkleSpeed);
    gl.uniform1f(locations.logoVerticalOffset, CONFIG.logoVerticalOffset);
  }

  function render(timeMs) {
    if (fallbackEnabled) {
      return;
    }

    resizeCanvas();

    const time = timeMs * 0.001;

    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.bindVertexArray(vao);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.uniform1i(locations.logo, 0);
    gl.uniform2f(locations.resolution, canvas.width, canvas.height);
    gl.uniform1f(locations.time, time);

    uploadConfigUniforms();

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
