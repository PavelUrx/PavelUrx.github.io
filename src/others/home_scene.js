import * as THREE from 'three';

class HomeScene {
    constructor(elementID) {
        const DOMScene = document.getElementById(elementID);

        const sceneWidth = window.innerWidth;
        const sceneHeight = window.innerHeight;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(sceneWidth, sceneHeight);
        DOMScene.appendChild(this.renderer.domElement);

        this.heightMap = this.createHeightMap(256);
        this.heightMap.needsUpdate = true;


        this.geometry = new THREE.PlaneGeometry(20, 20, 100, 100);


        this.material = new THREE.ShaderMaterial({
            uniforms: {
                heightMap: { value: this.heightMap },
                contourLevel: { value: 0.9 },
                contourThickness: { value: 0.15 }
            },
            vertexShader: `
                varying vec2 vUv;
                uniform sampler2D heightMap; // Declare heightMap uniform
                uniform float time; // Add time uniform for animation

                void main() {
                    vUv = uv;
                    vec3 pos = position;
                    float height = texture(heightMap, vUv).r; // Get height from texture
                    pos.z += height * 2.0; // Scale height

                    // Apply undulating effect using sine wave
                    pos.z += sin(vUv.x * 10.0 + time) * 0.5; // Adjust frequency and amplitude
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                varying vec2 vUv;
                uniform sampler2D heightMap;
                uniform float contourLevel;
                uniform float contourThickness;

                void main() {
                    float height = texture(heightMap, vUv).r;
                    float distanceToContour = abs(height - contourLevel);
                    if (distanceToContour < contourThickness) {
                        gl_FragColor = vec4(0.98, 0.58, 0.0, 1.0); // Contour line color
                    } else {
                        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Background color
                    }
                }
            `,
            transparent: true
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        this.camera.position.set(0, 0, 5);
        this.camera.lookAt(0, 0, 0);

        this.animate = this.animate.bind(this);
        this.renderer.domElement.classList.add('three-scene');

        window.addEventListener('resize', () => {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        });
    }

    createHeightMap(size) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext('2d');
        const imageData = context.createImageData(size, size);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const value = Math.abs(Math.sin((x + y) / 10));
                const color = value * 255;
                const index = (x + y * size) * 4;
                imageData.data[index] = color;
                imageData.data[index + 1] = color;
                imageData.data[index + 2] = color;
                imageData.data[index + 3] = 255;
            }
        }

        context.putImageData(imageData, 0, 0);
        return new THREE.Texture(canvas);
    }

    animate() {
        this.material.uniforms.time = { value: performance.now() * 0.0005 };
        this.renderer.render(this.scene, this.camera);
    }

    start() {
        this.renderer.setAnimationLoop(this.animate);
    }
}

export default HomeScene;
