import * as THREE from 'three';
import TweenMax from 'TweenMax';
import fullScreenBlobFrag from '../shaders/fullScreenBlob.frag';
import fullScreenBlobVert from '../shaders/fullScreenBlob.vert';
import glslify from 'glslify';

export default class FullScreenBlob {
    constructor(el, bgScene) {
        this.el = el;
        this.bgScene = bgScene;

        this.scroll = 0;
        this.prevScroll = 0;
        this.scrollDelta = 0;

        this.mouse = new THREE.Vector2(0, 0);
        this.sizes = new THREE.Vector2(0, 0);
        this.offset = new THREE.Vector2(0, 0);

        this.initFullScreenBlob();

        this.bindEvents();
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

    }

    onMouseLeave() { }

    initFullScreenBlob() {
        this.uniforms = {
            u_time: { value: 0.0 },
            u_res: {
                value: new THREE.Vector2(window.innerWidth, window.innerHeight)
            },
            u_mouse: { value: this.mouse },
        };

        this.geo = new THREE.PlaneBufferGeometry(1, 1, 1, 1);
        this.mat = new THREE.ShaderMaterial({
            uniforms: this.uniforms,
            vertexShader: glslify(fullScreenBlobVert),
            fragmentShader: glslify(fullScreenBlobFrag),
            transparent: true,
            defines: {}
        });

        this.fullScreenBlob = new THREE.Mesh(this.geo, this.mat);

        this.fullScreenBlob.position.x = this.offset.x;
        this.fullScreenBlob.position.y = this.offset.y;

        this.fullScreenBlob.scale.set(this.sizes.x, this.sizes.y, 1);

        console.log('this.fullScreenBlob:  ', this.fullScreenBlob);

        this.bgScene.add(this.fullScreenBlob);
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
        this.scroll = scrollTop / limit;
    }

    move() {
        if (!this.fullScreenBlob) return;

        this.getBounds();

        TweenMax.set(this.fullScreenBlob.position, {
            x: this.offset.x,
            y: this.offset.y
        });

        TweenMax.to(this.fullScreenBlob.scale, 0.3, {
            x: this.sizes.x - this.scrollDelta,
            y: this.sizes.y - this.scrollDelta,
            z: 1
        });
    }

    update(time) {
        if (!this.fullScreenBlob) return;

        this.scrollDelta = Math.abs((this.scroll - this.prevScroll) * 2000);

        this.uniforms.u_time.value = time;

        this.move();

        this.prevScroll = this.scroll;
    }
}