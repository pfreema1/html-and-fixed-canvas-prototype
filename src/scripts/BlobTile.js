import * as THREE from 'three';
import TweenMax from 'TweenMax';
import { Vector2 } from 'three';
import fitPlaneToScreen from '../scripts/utils/fitPlaneToScreen';
import tileFrag from '../shaders/tile.frag';
import tileVert from '../shaders/tile.vert';
import glslify from 'glslify';

export default class BlobTile {
  constructor(el, renderTriUniforms, index, bgScene, bgCamera) {
    this.el = el;
    this.edgeBevelDuration = 0.5;
    this.colorProgressDuration = 0.3;
    this.scroll = 0;
    this.prevScroll = 0;
    this.delta = 0;

    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    this.renderTriUniforms = renderTriUniforms;
    this.index = index;
    this.bgScene = bgScene;
    this.bgCamera = bgCamera;
    this.mouse = new THREE.Vector2(0, 0);
    this.sizes = new THREE.Vector2(0, 0);
    this.offset = new THREE.Vector2(0, 0);

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
    this.isHovering = true;

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
  }

  onMouseLeave() {
    if (!this.tile) return;

    // edge bevel tween
    TweenMax.to(this.uniforms.u_edgeBevelProgress, this.edgeBevelDuration, {
      value: 0,
      ease: Power2.easeInOut,
      onComplete: () => {
        this.isHovering = false;
      }
    });

    // color change tween
    TweenMax.to(this.uniforms.u_colorProgress, this.colorProgressDuration, {
      value: 0,
      ease: Power2.easeOut
    });
  }

  initTile() {

    console.log(this.textures);

    this.uniforms = {
      u_time: { value: 0.0 },
      u_res: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      },
      u_mouse: { value: this.mouse },
      u_edgeBevelProgress: { value: 0 },
      u_texture1: { value: this.textures[0] },
      u_colorProgress: { value: 0 }
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

    // TweenMax.set(this.tile.position, {
    //   x: 0,
    //   y: 0
    // });

    TweenMax.to(this.tile.scale, 0.3, {
      x: this.sizes.x - this.delta,
      y: this.sizes.y - this.delta,
      z: 1
    });
  }

  update(time) {
    // delta makes the geometry scale according to mouse scroll
    this.delta = Math.abs((this.scroll - this.prevScroll) * 2000);

    if (!this.tile) return;

    this.uniforms.u_time.value = time;

    this.move();

    this.prevScroll = this.scroll;

    if (!this.isHovering) return;

    // console.log(this.mouse);
  }
}
