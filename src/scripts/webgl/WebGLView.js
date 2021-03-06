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
import BlobTile from '../BlobTile';

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
    this.initLights();
    this.initTweakPane();
    this.initRenderTri();

    this.setupScrollListener();
    this.setupMouseMove();
    this.initBlobTiles();
  }

  setupMouseMove() {
    this.mouse = new THREE.Vector2();
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    document.addEventListener('mousemove', ({ clientX, clientY }) => {
      this.mouse.x = clientX / this.width; // * 2 - 1;
      this.mouse.y = 1.0 - clientY / this.height; // * 2 + 1;

      //   console.log(this.mouse);
    });
  }

  setupScrollListener() {
    document.addEventListener('scroll', this.onScroll.bind(this));
  }

  onScroll(e) {
    let scrollTop = document.documentElement.scrollTop;
    let limit = document.documentElement.scrollHeight - window.innerHeight;

    if (this.tiles) {
      this.tiles.forEach(tile => {
        tile.onScroll(scrollTop, limit);
      });
    }
  }

  initBlobTiles() {
    this.tileEls = document.querySelectorAll('.blob-tile');

    this.tiles = Array.from(this.tileEls).map(
      ($el, i) =>
        new BlobTile(
          $el,
          this.triMaterial.uniforms,
          i,
          this.bgScene,
          this.bgCamera
        )
    );
  }

  setupTetraAnimation() {
    this.tl = new TimelineMax({ paused: true });

    let inTween = TweenMax.fromTo(
      this.tetra.position,
      1.0,
      {
        x: this.vpWorldPos.x.max
      },
      {
        x: 0
      }
    );

    let outTween = TweenMax.fromTo(
      this.tetra.position,
      1.0,
      {
        x: 0
      },
      {
        x: this.vpWorldPos.x.max
      }
    );

    this.tl.add(inTween, 0.0);
    this.tl.add(outTween, 1.0);
  }

  returnBigBlobScene() {
    this.bigBlobEl = document.getElementById('bigBlob');

    this.bigBlobScene = new ScrollMagic.Scene({
      triggerElement: '#bigBlob',
      triggerHook: 1.0,
      duration: this.bigBlobEl.offsetHeight
    }).addIndicators({ name: 'big blob trigger' });

    this.bigBlobScene.on('progress', e => {});

    return this.bigBlobScene;
  }

  returnBlock4Scene() {
    this.block4El = document.getElementById('block4');

    this.block4Scene = new ScrollMagic.Scene({
      triggerElement: '#block4',
      triggerHook: 0.5,
      duration: this.block4El.offsetHeight
    }).addIndicators();

    this.block4Scene.on('progress', e => {
      this.tl.progress(e.progress);

      let rect = this.block4El.getBoundingClientRect();
      let middleOfElPos = rect.top + this.block4El.offsetHeight * 0.5;
      let middleOfElPercent = middleOfElPos / window.innerHeight;

      this.tetra.position.y = THREE.Math.mapLinear(
        middleOfElPercent,
        0,
        1,
        this.vpWorldPos.y.max,
        this.vpWorldPos.y.min
      );
    });

    return this.block4Scene;
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
    return {
      x: {
        min: -width,
        max: width
      },
      y: {
        min: -height,
        max: height
      }
    };
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
        },
        tile0D: {
          // x = normalized left
          // y = normalized top
          // z = normalized width
          // w = normalized height
          value: new THREE.Vector4(0, 0, 0, 0)
        },
        tile1D: {
          value: new THREE.Vector4(0, 0, 0, 0)
        },
        tile2D: {
          value: new THREE.Vector4(0, 0, 0, 0)
        },
        uMouse: {
          value: new THREE.Vector2()
        },
        tile0Hover: {
          value: new THREE.Vector2()
        },
        tile1Hover: {
          value: new THREE.Vector2()
        },
        tile2Hover: {
          value: new THREE.Vector2()
        },
        isTile0Hover: {
          value: 0.0
        },
        isTile1Hover: {
          value: 0.0
        },
        isTile2Hover: {
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

    // this.bgCamera = new THREE.PerspectiveCamera(
    //   50,
    //   window.innerWidth / window.innerHeight,
    //   0.01,
    //   100
    // );
    this.initBgSceneCamera();

    // this.controls = new OrbitControls(this.bgCamera, this.renderer.domElement);

    // this.bgCamera.position.z = 3;
    // this.controls.update();

    this.bgScene = new THREE.Scene();
  }

  initBgSceneCamera() {
    // https://tympanus.net/codrops/2019/10/23/making-gooey-image-hover-effects-with-three-js/
    const perspective = 800;
    const fov =
      (180 * (2 * Math.atan(window.innerHeight / 2 / perspective))) / Math.PI;
    this.bgCamera = new THREE.PerspectiveCamera(
      fov,
      window.innerWidth / window.innerHeight,
      1,
      10000
    );
    this.bgCamera.position.set(0, 0, perspective);
  }

  initLights() {
    this.pointLight = new THREE.PointLight(0xff0000, 1, 100);
    this.pointLight.position.set(0, 0, 50);
    this.bgScene.add(this.pointLight);
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

    if (this.tiles) {
      this.tiles.forEach(tile => {
        tile.update(time);
      });
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
