import * as THREE from 'three';
import TweenMax from 'TweenMax';
import { Vector2 } from 'three';
import fitPlaneToScreen from '../scripts/utils/fitPlaneToScreen';

export default class BlobTile {
  constructor(el, renderTriUniforms, index, bgScene, bgCamera) {
    this.el = el;
    this.duration = 0.8;
    this.scroll = 0;
    this.prevScroll = 0;

    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    this.renderTriUniforms = renderTriUniforms;
    this.index = index;
    this.bgScene = bgScene;
    this.bgCamera = bgCamera;

    this.setupScreenBounds();

    this.createTileMesh();

    this.setupHoverListener();
  }

  setupScreenBounds() {
    this.pD = fitPlaneToScreen(
      this.bgCamera,
      -6,
      this.windowWidth,
      this.windowHeight
    );

    this.screenBounds = {
      x: {
        min: (this.pD.height / 2) * -1,
        max: this.pD.height / 2
      },
      y: {
        min: (this.pD.width / 2) * -1,
        max: this.pD.width / 2
      }
    };
  }

  createTileMesh() {
    this.geometry = new THREE.BoxBufferGeometry(1, 1, 1);
    this.material = new THREE.MeshBasicMaterial({ color: 0x0fff00 });
    this.tile = new THREE.Mesh(this.geometry, this.material);

    this.tile.position.z = -6;

    this.bgScene.add(this.tile);
  }

  setupHoverListener() {
    this.normalizedHover = new Vector2();

    this.el.addEventListener('mousemove', e => {
      this.normalizedHover.x = (e.x - this.left) / this.width;
      this.normalizedHover.y = 1.0 - (e.y - this.top) / this.height;

      this.renderTriUniforms[`tile${this.index}Hover`].value.set(
        this.normalizedHover.x,
        this.normalizedHover.y
      );

      this.renderTriUniforms[`isTile${this.index}Hover`].value = 1.0;
    });

    this.el.addEventListener('mouseout', () => {
      this.renderTriUniforms[`isTile${this.index}Hover`].value = 0.0;
    });
  }

  initTile() {
    this.getElBounds();
  }

  getElBounds() {
    const { width, height, left, top } = this.el.getBoundingClientRect();

    this.width = width;
    this.height = height;
    this.left = left;
    this.top = top;

    this.normalizedLeft = left / this.windowWidth;
    this.normalizedTop = 1.0 - top / this.windowHeight;
    this.normalizedWidth = width / this.windowWidth;
    this.normalizedHeight = height / this.windowHeight;

    // console.log(this.normalizedTop);

    // update uniforms
    this.renderTriUniforms[`tile${this.index}D`].value.set(
      this.normalizedLeft,
      this.normalizedTop,
      this.normalizedWidth,
      this.normalizedHeight
    );
  }

  onScroll(scrollTop, limit) {
    // normalized scroll position of entire page
    this.scroll = scrollTop / limit;

    this.updateTilePosition();
  }

  updateTilePosition() {
    // console.log(this.normalizedTop);
    if (this.normalizedTop > 0 && this.normalizedTop < 1) {
      this.tile.position.y = THREE.Math.mapLinear(
        this.normalizedTop,
        0,
        1,
        this.screenBounds.y.min,
        this.screenBounds.y.max
      );
    } else {
      // move tile mesh off screen
      this.tile.position.y = this.screenBounds.y.min - 5;
    }
    console.log(this.tile.position.y);
  }

  update() {
    this.delta = Math.abs((this.scroll - this.prevScroll) * 2000);

    this.getElBounds();

    this.prevScroll = this.scroll;

    if (!this.isHovering) return;
    this.uniforms.u_time.value += this.clock.getDelta();
  }
}
