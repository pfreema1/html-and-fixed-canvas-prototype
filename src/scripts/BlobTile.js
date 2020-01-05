import * as THREE from 'three';
import TweenMax from 'TweenMax';
import tileFrag from '../shaders/tile.frag';
import tileVert from '../shaders/tile.vert';
import glslify from 'glslify';

export default class BlobTile {
  constructor(el, bgScene) {
    this.el = el;
    this.bgScene = bgScene;

    this.scroll = 0;
    this.prevScroll = 0;
    this.scrollDelta = 0;

    this.mouse = new THREE.Vector2(0, 0);
    this.sizes = new THREE.Vector2(0, 0);
    this.offset = new THREE.Vector2(0, 0);

    // animation timings
    this.edgeBevelDuration = 0.5;
    this.colorProgressDuration = 0.3;
    this.circlePatternDuration = 0.3;

    this.loadTextures(['./grid.png']).then(() => {
      this.initTile();
    });


    this.bindEvents();

  }

  loadTextures(paths) {
    return new Promise((res, rej) => {
      this.loader = new THREE.TextureLoader();
      this.textures = [];
      let loadedCount = 0;

      paths.forEach(path => {
        this.loader.load(path, texture => {
          loadedCount++;
          this.textures.push(texture);


          if (loadedCount === paths.length) {
            res();
          }

        });
      });
    });
  }

  bindEvents() {
    window.addEventListener('mousemove', e => {
      this.onMouseMove(e);
    });

    this.el.addEventListener('mouseenter', () => {
      this.onMouseEnter();
    });

    this.el.addEventListener('mouseleave', () => {
      this.onMouseLeave();
    });
  }

  onMouseMove(e) {
    TweenMax.to(this.mouse, 0.5, {
      x: e.clientX,
      y: e.clientY
    });
  }

  onMouseEnter() {
    if (!this.tile) return;

    // edge bevel tween
    TweenMax.to(this.uniforms.u_edgeBevelProgress, this.edgeBevelDuration, {
      value: 1,
      ease: Power2.easeInOut
    });

    // color change tween
    TweenMax.to(this.uniforms.u_colorProgress, this.colorProgressDuration, {
      value: 1,
      ease: Power2.easeOut
    });

    // circle grow tween
    TweenMax.to(this.uniforms.u_circlePatternProgress, this.circlePatternDuration, {
      value: 1,
      delay: 0.2,
      ease: Power2.easeOut
    });
  }

  onMouseLeave() {
    if (!this.tile) return;

    // edge bevel tween
    TweenMax.to(this.uniforms.u_edgeBevelProgress, this.edgeBevelDuration, {
      value: 0,
      ease: Power2.easeInOut,
    });

    // color change tween
    TweenMax.to(this.uniforms.u_colorProgress, this.colorProgressDuration, {
      value: 0,
      ease: Power2.easeOut
    });

    // circle shrink tween 
    TweenMax.killTweensOf(this.uniforms.u_circlePatternProgress);
    TweenMax.to(this.uniforms.u_circlePatternProgress, this.circlePatternDuration, {
      value: 0,
      ease: Power2.easeOut
    });
  }

  initTile() {
    this.uniforms = {
      u_time: { value: 0.0 },
      u_res: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      },
      u_mouse: { value: this.mouse },
      u_edgeBevelProgress: { value: 0 },
      u_texture1: { value: this.textures[0] },
      u_colorProgress: { value: 0 },
      u_circlePatternProgress: { value: 0 }
    };

    this.geo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
    this.mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: glslify(tileVert),
      fragmentShader: glslify(tileFrag),
      transparent: true,
      defines: {
        PI: Math.PI,
        PR: window.devicePixelRatio.toFixed(1)
      }
    });
    // this.mat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    this.tile = new THREE.Mesh(this.geo, this.mat);

    this.tile.position.x = this.offset.x;
    this.tile.position.y = this.offset.y;

    this.tile.scale.set(this.sizes.x, this.sizes.y, 1);

    console.log('this.tile:  ', this.tile);

    this.bgScene.add(this.tile);
  }

  getBounds() {
    const { width, height, left, top } = this.el.getBoundingClientRect();

    if (!this.sizes.equals(new THREE.Vector2(width, height))) {
      this.sizes.set(width, height);
    }

    if (
      !this.offset.equals(
        new THREE.Vector2(
          left - window.innerWidth / 2 + width / 2,
          -top + window.innerHeight / 2 - height / 2
        )
      )
    ) {
      this.offset.set(
        left - window.innerWidth / 2 + width / 2,
        -top + window.innerHeight / 2 - height / 2
      );
    }
  }

  onScroll(scrollTop, limit) {
    // normalized scroll position of entire page
    this.scroll = scrollTop / limit;
  }

  move() {
    if (!this.tile) return;

    this.getBounds();

    TweenMax.set(this.tile.position, {
      x: this.offset.x,
      y: this.offset.y
    });

    TweenMax.to(this.tile.scale, 0.3, {
      x: this.sizes.x - this.scrollDelta,
      y: this.sizes.y - this.scrollDelta,
      z: 1
    });
  }

  update(time) {
    if (!this.tile) return;

    // scrollDelta makes the geometry scale according to mouse scroll
    this.scrollDelta = Math.abs((this.scroll - this.prevScroll) * 2000);


    this.uniforms.u_time.value = time;

    this.move();

    this.prevScroll = this.scroll;

  }
}
