precision highp float;
uniform sampler2D uScene;
uniform vec2 uResolution;
uniform float uTime;
uniform vec4 tile0D;
uniform vec4 tile1D;
uniform vec4 tile2D;
uniform vec2 uMouse;
uniform vec2 tile0Hover;
uniform vec2 tile1Hover;
uniform vec2 tile2Hover;
uniform float isTile0Hover;
uniform float isTile1Hover;
uniform float isTile2Hover;

float rect(vec2 st, vec2 size){
	size = 0.25-size*0.25;
    vec2 uv = smoothstep(size,size+size*vec2(0.002),st*(1.0-st));
	return uv.x*uv.y;
}

void main() {
    vec2 uv = gl_FragCoord.xy / uResolution.xy;
    vec4 color = texture2D(uScene, uv);
    
        
    gl_FragColor = vec4(color);
}