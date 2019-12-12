import * as THREE from 'three';
import GLTFLoader from 'three-gltf-loader';
import glslify from 'glslify';
import Tweakpane from 'tweakpane';
import fullScreenTriFrag from '../../shaders/fullScreenTri.frag';
import fullScreenTriVert from '../../shaders/fullScreenTri.vert';
import OrbitControls from 'three-orbitcontrols';
import TweenMax from 'TweenMax';
import ScrollMagic from 'ScrollMagic';
import 'debug.addIndicators';
import { MeshDistanceMaterial } from 'three';

export default class WebGLView {
  constructor(app) {
    this.app = app;
    this.PARAMS = {
      rotSpeed: 0.05
    };

    this.init();
  }

  async init() {
    this.initThree();
    this.initBgScene();
    // this.initObject();
    this.initLights();
    this.initTweakPane();
    await this.loadTetra();
    this.initRenderTri();
    this.setupScrollMagic();
  }

  setupTetraAnimation() {
    this.tl = new TimelineMax({ paused: true });

    let inTween = TweenMax.fromTo(
      this.tetra.position,
      1.0,
      {
        y: 0,
        x: this.vpWorldPos.width
      },
      {
        y: 0,
        x: 0
      }
    );

    let outTween = TweenMax.fromTo(
      this.tetra.position,
      1.0,
      {
        y: 0,
        x: 0
      },
      {
        y: 0,
        x: this.vpWorldPos.width
      }
    );

    this.tl.add(inTween, 0.0);
    this.tl.add(outTween, 1.0);
  }

  setupScrollMagic() {
    this.setupTetraAnimation();

    this.controller = new ScrollMagic.Controller();

    this.block4Scene = new ScrollMagic.Scene({
      triggerElement: '#block4',
      triggerHook: 1,
      duration: 800
    }).addIndicators();

    this.block4Scene.on('enter', () => {
      //   debugger;
      //   this.tetra.material.opacity = 1;
    });

    this.block4Scene.on('end', () => {
      //   this.tetra.material.opacity = 0;
    });

    this.block4Scene.on('progress', e => {
      //   console.log('progresssss:  ', e.progress);
      this.tl.progress(e.progress);
    });

    this.controller.addScene(this.block4Scene);
  }

  initTweakPane() {
    this.pane = new Tweakpane();

    this.pane
      .addInput(this.PARAMS, 'rotSpeed', {
        min: 0.0,
        max: 0.5
      })
      .on('change', value => {});
  }

  initThree() {
    this.scene = new THREE.Scene();

    this.camera = new THREE.OrthographicCamera();

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.autoClear = true;

    this.clock = new THREE.Clock();
  }

  getWorldPosOfViewPort(distance, camera) {
    const vFOV = THREE.Math.degToRad(camera.fov);
    const height = 2 * Math.tan(vFOV / 2) * distance;
    const width = height * camera.aspect;
    return { width, height };
  }

  loadTetra() {
    return new Promise((res, rej) => {
      let geo = new THREE.TetrahedronGeometry(0.5, 0);
      let mat = new THREE.MeshStandardMaterial({
        transparent: true
      });
      this.tetra = new THREE.Mesh(geo, mat);
      //   this.tetra.material.opacity = 0;
      console.log('tetra:  ', this.tetra);

      this.bgScene.add(this.tetra);

      this.vpWorldPos = this.getWorldPosOfViewPort(5, this.bgCamera);
      this.tetra.position.set(
        -this.vpWorldPos.width + 1,
        -this.vpWorldPos.height + 1,
        -5
      );

      //   debugger;

      //   let left = 0.8;
      //   let top = 0.8;
      //   let depth = -1.0;
      //   this.tetra.position
      //     .set(-1 + 2 * left, 1 - 2 * top, depth)
      //     .unproject(this.bgCamera);

      res();
    });
  }

  returnRenderTriGeometry() {
    const geometry = new THREE.BufferGeometry();

    // triangle in clip space coords
    const vertices = new Float32Array([-1.0, -1.0, 3.0, -1.0, -1.0, 3.0]);

    geometry.addAttribute('position', new THREE.BufferAttribute(vertices, 2));

    return geometry;
  }

  initRenderTri() {
    // mostly taken from here: https://medium.com/@luruke/simple-postprocessing-in-three-js-91936ecadfb7

    this.resize();
    const geometry = this.returnRenderTriGeometry();

    const resolution = new THREE.Vector2();
    this.renderer.getDrawingBufferSize(resolution);

    this.RenderTriTarget = new THREE.WebGLRenderTarget(
      resolution.x,
      resolution.y,
      {
        format: THREE.RGBFormat,
        stencilBuffer: false,
        depthBuffer: true
      }
    );

    this.triMaterial = new THREE.RawShaderMaterial({
      fragmentShader: glslify(fullScreenTriFrag),
      vertexShader: glslify(fullScreenTriVert),
      uniforms: {
        uScene: {
          type: 't',
          value: this.bgRenderTarget.texture
        },
        uResolution: { value: resolution },
        uTime: {
          value: 0.0
        }
      }
    });

    console.log(this.bgRenderTarget.texture);

    let renderTri = new THREE.Mesh(geometry, this.triMaterial);
    renderTri.frustumCulled = false;
    this.scene.add(renderTri);
  }

  initBgScene() {
    this.bgRenderTarget = new THREE.WebGLRenderTarget(
      window.innerWidth,
      window.innerHeight
    );
    this.bgCamera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );
    // this.controls = new OrbitControls(this.bgCamera, this.renderer.domElement);

    this.bgCamera.position.z = 3;
    // this.controls.update();

    this.bgScene = new THREE.Scene();
  }

  initLights() {
    this.pointLight = new THREE.PointLight(0xff0000, 1, 100);
    this.pointLight.position.set(0, 0, 50);
    this.bgScene.add(this.pointLight);
  }

  initObject() {
    let geo = new THREE.TetrahedronBufferGeometry(10, 0);
    let mat = new THREE.MeshPhysicalMaterial({
      roughness: 0.5,
      metalness: 0.3,
      reflectivity: 1,
      clearcoat: 1
    });
    this.tetra = new THREE.Mesh(geo, mat);
    console.log('tetra:  ', this.tetra);

    // this.bgScene.add(this.tetra);
  }

  resize() {
    if (!this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.fovHeight =
      2 *
      Math.tan((this.camera.fov * Math.PI) / 180 / 2) *
      this.camera.position.z;
    this.fovWidth = this.fovHeight * this.camera.aspect;

    this.renderer.setSize(window.innerWidth, window.innerHeight);

    if (this.trackball) this.trackball.handleResize();
  }

  updateTetra() {
    this.tetra.rotation.y += this.PARAMS.rotSpeed;
    this.tetra.rotation.z += 0.03;
  }

  updateTextMesh() {
    this.textMesh.rotation.y += this.PARAMS.rotSpeed;
    this.textMesh.rotation.x += 0.03;
  }

  update() {
    const delta = this.clock.getDelta();
    const time = performance.now() * 0.0005;

    // this.controls.update();

    if (this.triMaterial) {
      this.triMaterial.uniforms.uTime.value = time;
    }

    if (this.tetra) {
      this.updateTetra();
    }

    if (this.textMesh) {
      this.updateTextMesh();
    }

    if (this.trackball) this.trackball.update();
  }

  draw() {
    this.renderer.setRenderTarget(this.bgRenderTarget);
    this.renderer.render(this.bgScene, this.bgCamera);
    this.renderer.setRenderTarget(null);

    this.renderer.render(this.scene, this.camera);
  }
}
