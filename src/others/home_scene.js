import * as THREE from 'three';

class HomeScene {
    constructor(elementID) {
        const DOMScene = document.getElementById(elementID);

        const sceneWidth = window.innerWidth;
        const sceneHeight = window.innerHeight;


        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer();


        this.renderer.setSize(sceneWidth, sceneHeight);



        DOMScene.appendChild(this.renderer.domElement)

        this.geometry = new THREE.BoxGeometry(1, 1, 1);
        this.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(this.geometry, this.material);

        this.scene.add(this.cube);

        this.camera.position.z = 5;
        this.animate = this.animate.bind(this);

        this.renderer.domElement.classList.add('three-scene');
    }

    animate() {
        this.cube.rotation.x += 0.01;
        this.cube.rotation.y += 0.01;
        this.renderer.render(this.scene, this.camera);
    }

    start() {
        this.renderer.setAnimationLoop(this.animate)
    }
}

export default HomeScene;



