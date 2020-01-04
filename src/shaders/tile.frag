#pragma glslify: snoise3 = require('glsl-noise/simplex/3d')

uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_mouse;
uniform float u_progressHover;

varying vec2 v_uv;

float circle(in vec2 _st, in float _radius, in float blurriness){
    vec2 dist = _st;
	  return 1. - smoothstep(_radius-(_radius*blurriness), _radius+(_radius*blurriness), dot(dist,dist)*4.0);
}

void main() {
  vec2 resolution = u_res;  // original: u_res * PR  
  vec2 uv = v_uv;
  float time = u_time * 0.05;
  float progressHover = u_progressHover;  // tweens from 0 to 1 when mouse in and reverse when mouse out

  vec2 st = gl_FragCoord.xy / resolution.xy - vec2(.5);
  st.y *= resolution.y / resolution.x;

  vec2 mouse = vec2((u_mouse.x / u_res.x) * 2. - 1.,-(u_mouse.y / u_res.y) * 2. + 1.) * -.5;
  mouse.y *= resolution.y / resolution.x;

  float grd = 0.1 * progressHover;  // grd is the modifier to give the beveled edges
  float sqr = 100. * ((smoothstep(0.0, grd, uv.x) - smoothstep(1.0 - grd, 1.0, uv.x)) * (smoothstep(0.0, grd, uv.y) - smoothstep(1.0 - grd, 1.0, uv.y))) - 10.;

  vec2 cpos = st + mouse;

  float c = circle(cpos, .04 * progressHover, 2.0) * 50.;  // default: 50.0

  float finalMask = smoothstep(0.0, 0.1, sqr - c);

  float color = c;

  gl_FragColor = vec4(vec3(color), finalMask);
}