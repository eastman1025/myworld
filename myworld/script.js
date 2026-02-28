// 1. 기본 설정
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// 2. 조명 및 배경
scene.add(new THREE.AmbientLight(0xffffff, 1.0));
const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(100, 200, 100);
scene.add(sunLight);

const starsGeometry = new THREE.BufferGeometry();
const starsVertices = [];
for (let i = 0; i < 2000; i++) {
    starsVertices.push((Math.random() - 0.5) * 1500, (Math.random() - 0.5) * 1500, (Math.random() - 0.5) * 1500);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({ color: 0xddddff, size: 2 }));
scene.add(stars);

// 3. 행성 로드 및 생성
const planets = [];
function loadPlanet(path, scale, x, y, z, name) {
    const loader = new THREE.GLTFLoader();
    loader.load(path, (gltf) => {
        const p = gltf.scene;
        p.scale.set(scale, scale, scale);
        p.position.set(x, y, z);
        p.userData = { name: name };
        scene.add(p);
        planets.push(p);
    });
}

loadPlanet('./models/earth.glb', 10, 150, 80, -300, "Chatbot Planet");
loadPlanet('./models/jupiter.glb', 15, -200, 120, -450, "Idle Game Planet");
loadPlanet('./models/neptune.glb', 12, 250, -150, -600, "Text Adventure");
loadPlanet('./models/venus.glb', 8, -100, -180, -250, "Fairy Tale Planet");

// 4. 캐릭터 로드
let character;
new THREE.GLTFLoader().load('./models/Astronaut.glb', (gltf) => {
    character = gltf.scene;
    character.scale.set(5, 5, 5);
    scene.add(character);
});

// 5. 컨트롤 (마우스 & 키보드)
let yaw = Math.PI, pitch = 0;
const keys = {};
document.addEventListener('mousemove', (e) => {
    if (document.pointerLockElement === renderer.domElement) {
        yaw -= e.movementX * 0.002;
        pitch -= e.movementY * 0.002;
        pitch = Math.max(-Math.PI / 2 + 0.1, Math.min(Math.PI / 2 - 0.1, pitch));
    }
});
renderer.domElement.onclick = () => renderer.domElement.requestPointerLock();
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// 6. 메인 루프 (자동 감지 로직 포함)
let nearbyPlanet = null;
let lastInteractionTime = 0;
let isTransitioning = false;

function animate() {
    requestAnimationFrame(animate);

    if (character) {
        // 이동 (마우스 방향 기반)
        const speed = 1.5;
        const lookDir = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const rightDir = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        const move = new THREE.Vector3(0, 0, 0);
        if (keys['w']) move.add(lookDir);
        if (keys['s']) move.sub(lookDir);
        if (keys['a']) move.sub(rightDir);
        if (keys['d']) move.add(rightDir);
        character.position.add(move.normalize().multiplyScalar(speed));
        character.rotation.y = yaw + Math.PI;

        // 카메라 추적
        const camOffset = new THREE.Vector3(0, 15, 40).applyAxisAngle(new THREE.Vector3(1, 0, 0), pitch).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
        camera.position.copy(character.position).add(camOffset);
        camera.lookAt(character.position);

        // --- 자동 거리 감지 ---
        const ui = document.getElementById('interaction-ui');
        const nameTag = document.getElementById('planet-name');
        let found = false;

        planets.forEach(p => {
            if (character.position.distanceTo(p.position) < 80) {
                nearbyPlanet = p.userData.name;
                nameTag.innerText = nearbyPlanet;
                ui.style.display = 'block';
                found = true;
            }
        });

        if (!found) {
            ui.style.display = 'none';
            nearbyPlanet = null;
        }
    }

    // F 상호작용
    if (keys['f'] && nearbyPlanet && !isTransitioning) {
        isTransitioning = true; 
        
        if (nearbyPlanet === "Chatbot Planet") {
            window.open('chatbot.html', '_blank'); 
            setTimeout(() => { isTransitioning = false; }, 2000);
        } else {
            console.log(`${nearbyPlanet}은 준비 중입니다.`);
            // alert 대신 하단 UI에 "준비 중입니다"라고 텍스트만 바꿔주는 게 더 세련됩니다.
            setTimeout(() => { isTransitioning = false; }, 1000);
        }
    }

    stars.rotation.y += 0.0001;
    planets.forEach(p => p.rotation.y += 0.005);
    renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});