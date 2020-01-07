#pragma glslify: snoise3 = require('glsl-noise/simplex/3d')

uniform float u_time;
uniform vec2 u_res;
uniform vec2 u_mouse;

varying vec2 v_uv;

float circle(in vec2 _st, in float _radius, in float blurriness){
    vec2 dist = _st;
	  return 1. - smoothstep(_radius-(_radius*blurriness), _radius+(_radius*blurriness), dot(dist,dist)*4.0);
}

float smoothen(float d1, float d2) {
    float k = 1.5;
    return -log(exp(-k * d1) + exp(-k * d2)) / k;
}

void main() {
  vec2 resolution = u_res;  
  vec2 uv = v_uv;
  float time = u_time * 0.05;
  vec3 bgColor = vec3(0.90,0.92,0.93);
  vec3 circleColor = vec3(1.0);

  vec2 st = gl_FragCoord.xy / resolution.xy - vec2(.5);
  st.y *= resolution.y / resolution.x;

  vec2 mouse = vec2((u_mouse.x / u_res.x) * 2. - 1.,-(u_mouse.y / u_res.y) * 2. + 1.) * -.5;
  mouse.y *= resolution.y / resolution.x;

  // draw circle with mouse
  vec2 cPos = st + mouse;  // not sure why but we have to add st to mouse to get an accurate position
  float c = circle(cPos, 0.1, 0.1);
  bgColor = mix(bgColor, circleColor, c);

  // metaball
  // vec2 p0 = cPos;
  vec2 p0 = vec2(cos(u_time) * 0.3, 0.0);
  vec2 p1 = vec2(-cos(u_time) * 0.3, 0.0);
  float d = smoothen(distance(st, p0) * 20.0, distance(st, p1) * 20.0);
  // size the metaballs
  float m = smoothstep(2.5, 2.51, d);
  bgColor = mix(bgColor, circleColor, 1.0 - m);

  gl_FragColor = vec4(bgColor, 1.0);
}