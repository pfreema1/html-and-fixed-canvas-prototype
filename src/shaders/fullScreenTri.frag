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
    // vec4 box0Color = vec4(0.0, 0.0, 1.0, 1.0);
    // vec4 box1Color = vec4(1.0, 0.0, 0.0, 1.0);
    // vec4 box2Color = vec4(0.0, 1.0, 0.0, 1.0);

    // // hover shits
    // if(isTile0Hover == 1.0) {
    //     box0Color = vec4(0.5, 0.0, 1.0, 1.0);
    // }

    // // box0
    // if(tile0D.y > 0.0 && tile0D.y < 1.0 + tile0D.w) {
    //     float leftBorder = step(tile0D.x, uv.x);
    //     float rightBorder = 1.0 - step(tile0D.x + tile0D.z, uv.x);
    //     float topBorder = 1.0 - step(tile0D.y, uv.y);
    //     float bottomBorder = step(tile0D.y - tile0D.w, uv.y);

    //     color = mix(color, box0Color, leftBorder * rightBorder * topBorder * bottomBorder);
    // }

    // // box1
    // if(tile1D.y > 0.0 && tile1D.y < 1.0 + tile1D.w) {
    //     float leftBorder = step(tile1D.x, uv.x);
    //     float rightBorder = 1.0 - step(tile1D.x + tile1D.z, uv.x);
    //     float topBorder = 1.0 - step(tile1D.y, uv.y);
    //     float bottomBorder = step(tile1D.y - tile1D.w, uv.y);

    //     color = mix(color, box1Color, leftBorder * rightBorder * topBorder * bottomBorder);
    // }

    // // box2
    // if(tile2D.y > 0.0 && tile2D.y < 1.0 + tile2D.w) {
    //     float leftBorder = step(tile2D.x, uv.x);
    //     float rightBorder = 1.0 - step(tile2D.x + tile2D.z, uv.x);
    //     float topBorder = 1.0 - step(tile2D.y, uv.y);
    //     float bottomBorder = step(tile2D.y - tile2D.w, uv.y);

    //     color = mix(color, box2Color, leftBorder * rightBorder * topBorder * bottomBorder);
    // }

    
        
    gl_FragColor = vec4(color);
}