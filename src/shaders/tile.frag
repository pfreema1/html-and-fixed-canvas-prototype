#pragma glslify: snoise3 = require('glsl-noise/simplex/3d')

uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_edgeBevelProgress;
uniform float u_colorProgress;
uniform float u_circlePatternProgress;
uniform sampler2D u_texture1;

varying vec2 v_uv;

float circle(in vec2 _st, in float _radius, in float blurriness){
    vec2 dist = _st;
	  return 1. - smoothstep(_radius-(_radius*blurriness), _radius+(_radius*blurriness), dot(dist,dist)*4.0);
}

void main() {
  vec2 resolution = u_res;  // original: u_res * PR  
  vec2 uv = v_uv;
  float time = u_time * 0.05;
  float edgeBevelProgress = u_edgeBevelProgress;  
  float colorProgress = u_colorProgress;
  float circlePatternProgress = u_circlePatternProgress;
  vec4 texture1Color = texture2D(u_texture1, uv);
  vec3 unhoveredColor = vec3(0.97,0.97,0.98);
  vec3 hoveredColor = vec3(0.24,0.33,0.49);

  vec2 st = gl_FragCoord.xy / resolution.xy - vec2(.5);
  st.y *= resolution.y / resolution.x;

  vec2 mouse = vec2((u_mouse.x / u_res.x) * 2. - 1.,-(u_mouse.y / u_res.y) * 2. + 1.) * -.5;
  mouse.y *= resolution.y / resolution.x;

  float grd = 0.1 * edgeBevelProgress;  // grd is the modifier to give the beveled edges
  float sqr = 100. * ((smoothstep(0.0, grd, uv.x) - smoothstep(1.0 - grd, 1.0, uv.x)) * (smoothstep(0.0, grd, uv.y) - smoothstep(1.0 - grd, 1.0, uv.y))) - 10.;

  // mouse circle
  vec2 cpos = st + mouse;  // not sure why but we have to add st to mouse to get an accurate position
  float c = circle(cpos, .04 * edgeBevelProgress, 2.0) * 50.; 

  // pattern circle
  vec2 textureCirclePos = uv - vec2(1.0, -0.2);
  float textureCircle = circle(textureCirclePos, 1.5 * circlePatternProgress, 0.01);

  float finalMask = smoothstep(0.0, 0.1, sqr - c);

  // mix the bgColor based on colorProgress
  vec3 bgColor = mix(unhoveredColor, hoveredColor, colorProgress);

  // mix in the textureCircle color
  bgColor = mix(bgColor, vec3(texture1Color), textureCircle);

  gl_FragColor = vec4(bgColor, finalMask);
}