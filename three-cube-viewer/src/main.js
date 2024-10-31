import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, cube, controls;
const cubeSize = 10;
const cubeEdgeLength = 0.03;
const cubes = [];

function init() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xffffff, 0);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    camera.position.set(1, 1, 1);
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.enableZoom = true;

    createCube();
    window.addEventListener('resize', onWindowResize, false);

    animate();
}

function createCube() {
    cube = new THREE.Object3D();
    const geometry = new THREE.BoxGeometry(cubeEdgeLength, cubeEdgeLength, cubeEdgeLength);

    for (let x = 0; x < cubeSize; x++) {
        for (let y = 0; y < cubeSize; y++) {
            for (let z = 0; z < cubeSize; z++) {
                const coreMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });
                const core = new THREE.Mesh(geometry, coreMaterial);

                const shellGeometry = new THREE.BoxGeometry(cubeEdgeLength * 1.1, cubeEdgeLength * 1.1, cubeEdgeLength * 1.1);
                const shellMaterial = new THREE.MeshBasicMaterial({
                    color: 0x0066ff,
                    transparent: true,
                    opacity: 0.3
                });
                const shell = new THREE.Mesh(shellGeometry, shellMaterial);

                const edges = new THREE.LineSegments(
                    new THREE.EdgesGeometry(shellGeometry),
                    new THREE.LineBasicMaterial({ color: 0x0066ff })
                );

                const combinedCube = new THREE.Group();
                combinedCube.add(core);
                combinedCube.add(shell);
                combinedCube.add(edges);

                combinedCube.position.set(
                    (x - (cubeSize - 1) / 2) * cubeEdgeLength * 2,
                    (y - (cubeSize - 1) / 2) * cubeEdgeLength * 2,
                    (z - (cubeSize - 1) / 2) * cubeEdgeLength * 2
                );
                cube.add(combinedCube);
                cubes.push(combinedCube);
            }
        }
    }
    scene.add(cube);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate(time) {
    requestAnimationFrame(animate);

    time *= 0.0003;

    cubes.forEach((c) => {
        const { x, y, z } = c.position;
        const distance = Math.sqrt(x * x + y * y + z * z);
        const maxDistance = Math.sqrt(3) * ((cubeSize - 1) / 2) * cubeEdgeLength * 2;
        const normalizedDistance = distance / maxDistance;

        const wave = Math.sin(normalizedDistance * 8 + time * 3) * 0.5 + 0.5;
        const scale = 0.7 + wave * 0.6;

        c.children[0].scale.setScalar(scale);
        c.children[1].scale.setScalar(scale);
        c.children[1].material.opacity = 0.15 + wave * 0.4;
        c.children[1].material.color.setHex(0x0066ff);
    });

    controls.update();
    renderer.render(scene, camera);
}

document.getElementById('screenshot-button').addEventListener('click', function() {
    const resolution = document.getElementById('resolution-select').value;
    let width, height;

    switch (resolution) {
        case '4K':
            width = 3840;
            height = 2160;
            break;
        case '8K':
            width = 7680;
            height = 4320;
            break;
        case '16K':
            width = 15360;
            height = 8640;
            break;
        default:
            width = 3840;
            height = 2160;
    }

    const originalAspect = camera.aspect;
    const originalWidth = renderer.domElement.width;
    const originalHeight = renderer.domElement.height;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height, false);
    renderer.render(scene, camera);

    const dataURL = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `screenshot_${resolution}.png`;
    link.click();

    camera.aspect = originalAspect;
    camera.updateProjectionMatrix();
    renderer.setSize(originalWidth, originalHeight);
});

init();
