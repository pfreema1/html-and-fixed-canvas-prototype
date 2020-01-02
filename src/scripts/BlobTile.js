import * as THREE from 'three';
import TweenMax from 'TweenMax';
import { Vector2 } from 'three';

export default class BlobTile {
  constructor(el, renderTriUniforms, index) {
    this.el = el;
    this.duration = 0.8;
    this.scroll = 0;
    this.prevScroll = 0;

    this.windowWidth = window.innerWidth;
    this.windowHeight = window.innerHeight;

    this.renderTriUniforms = renderTriUniforms;
    this.index = index;

    this.setupHoverListener();
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
    this.getBounds();
  }

  getBounds() {
    const { width, height, left, top } = this.el.getBoundingClientRect();

    this.width = width;
    this.height = height;
    this.left = left;
    this.top = top;

    let normalizedLeft = left / this.windowWidth;
    let normalizedTop = 1.0 - top / this.windowHeight;
    let normalizedWidth = width / this.windowWidth;
    let normalizedHeight = height / this.windowHeight;

    // update uniforms
    this.renderTriUniforms[`tile${this.index}D`].value.set(
      normalizedLeft,
      normalizedTop,
      normalizedWidth,
      normalizedHeight
    );
  }

  move() {
    this.getBounds();
  }

  onScroll(scrollTop, limit) {
    this.scroll = scrollTop / limit;
    // console.log(this.scroll);
  }

  update() {
    this.delta = Math.abs((this.scroll - this.prevScroll) * 2000);

    this.move();

    this.prevScroll = this.scroll;

    if (!this.isHovering) return;
    this.uniforms.u_time.value += this.clock.getDelta();
  }
}
