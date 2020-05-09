import * as THREE from 'three';

const WIDTH = 500;
const HEIGHT = 500;

// レンダラーを作成
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('canvas') as HTMLCanvasElement,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(WIDTH, HEIGHT);

// シーンを作成
const scene = new THREE.Scene();

// カメラを作成
const camera = new THREE.PerspectiveCamera(45, WIDTH / HEIGHT);
camera.position.set(0, 0, 1000);

// 箱を作成
const geometry = new THREE.BoxGeometry(200, 200, 200);
const material = new THREE.MeshNormalMaterial();
const box = new THREE.Mesh(geometry, material);
scene.add(box);

tick();

function tick() {
  box.rotation.y += 0.01;
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
