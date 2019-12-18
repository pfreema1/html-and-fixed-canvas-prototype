import * as THREE from 'three';
import TweenMax from 'TweenMax';

export default class BlobTile {
  constructor(el) {
    this.el = el;
    this.duration = 0.8;
    this.scroll = 0;
    this.prevScroll = 0;
  }

  initTile() {
    this.getBounds();

    this.uniforms = {};
  }

  getBounds() {
    const { width, height, left, top } = this.el.getBoundingClientRect();
  }

  move() {
    this.getBounds();
  }

  onScroll(scrollTop, limit) {
    this.scroll = scrollTop / limit;
    console.log(this.scroll);
  }

  update() {
    this.delta = Math.abs((this.scroll - this.prevScroll) * 2000);

    this.move();

    this.prevScroll = this.scroll;

    if (!this.isHovering) return;
    this.uniforms.u_time.value += this.clock.getDelta();
  }
}
