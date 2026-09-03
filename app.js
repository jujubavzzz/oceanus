import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';


// ============================================================
// CONFIGURAÇÕES
// ============================================================

const MODEL_PATH = 'robo.glb';

let robotModel = null;

let water = null;
let sky = null;
let grid = null;

let currentMode = 'monitor';

const trashItems = [];


// ============================================================
// MOVIMENTAÇÃO
// ============================================================

const keysPressed = {};

let velocity = new THREE.Vector3();

let moveSpeed = 0.08;

const acceleration = 0.015;
const friction = 0.88;

const rotateSpeed = 0.035;

const verticalSpeed = 0.05;


// Altura do robô no oceano
let baseWaterY = 0.5;


// ============================================================
// ELEMENTOS HTML
// ============================================================

const container =
    document.getElementById('canvas-container');

const loadingScreen =
    document.getElementById('loading-screen');

const progressText =
    document.getElementById('progress-text');

const speedSlider =
    document.getElementById('speed');

const speedValue =
    document.getElementById('speedValue');

const telemetrySpeed =
    document.getElementById('telemetrySpeed');

const robotStatus =
    document.getElementById('robotStatus');

const posX =
    document.getElementById('posX');

const posY =
    document.getElementById('posY');

const posZ =
    document.getElementById('posZ');

const oceanButton =
    document.getElementById('ocean-button');

const monitorButton =
    document.getElementById('monitor-button');


// ============================================================
// CENA
// ============================================================

const scene = new THREE.Scene();

scene.background =
    new THREE.Color(0x020304);


// ============================================================
// CÂMERA
// ============================================================

const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

camera.position.set(
    0,
    3,
    7
);


// ============================================================
// RENDERIZADOR
// ============================================================

const renderer =
    new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: 'high-performance'
    });

renderer.setSize(
    window.innerWidth,
    window.innerHeight
);

renderer.setPixelRatio(
    Math.min(window.devicePixelRatio, 2)
);

renderer.toneMapping =
    THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.0;

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
    THREE.PCFSoftShadowMap;

container.appendChild(
    renderer.domElement
);


// ============================================================
// ILUMINAÇÃO
// ============================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        2.0
    );

scene.add(ambientLight);


const mainLight =
    new THREE.DirectionalLight(
        0xffffff,
        3.0
    );

mainLight.position.set(
    20,
    40,
    20
);

mainLight.castShadow = true;

scene.add(mainLight);


const fillLight =
    new THREE.DirectionalLight(
        0x90e0ef,
        1.2
    );

fillLight.position.set(
    -20,
    20,
    -20
);

scene.add(fillLight);


// ============================================================
// CONTROLES DE CÂMERA
// ============================================================

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping = true;

controls.dampingFactor = 0.08;

controls.maxPolarAngle =
    Math.PI / 2 - 0.01;

controls.minDistance = 2;

controls.maxDistance = 30;


// ============================================================
// CÉU
// ============================================================

const sun =
    new THREE.Vector3();

sky = new Sky();

sky.scale.setScalar(10000);

scene.add(sky);


const skyUniforms =
    sky.material.uniforms;

skyUniforms['turbidity'].value = 8;

skyUniforms['rayleigh'].value = 2;

skyUniforms['mieCoefficient'].value =
    0.005;

skyUniforms['mieDirectionalG'].value =
    0.8;


const elevation = 20;

const azimuth = 180;

const phi =
    THREE.MathUtils.degToRad(
        90 - elevation
    );

const theta =
    THREE.MathUtils.degToRad(
        azimuth
    );


sun.setFromSphericalCoords(
    1,
    phi,
    theta
);


sky.material.uniforms[
    'sunPosition'
].value.copy(sun);


// ============================================================
// ÁGUA
// ============================================================

const waterGeometry =
    new THREE.PlaneGeometry(
        10000,
        10000
    );


const textureLoader =
    new THREE.TextureLoader();


const waterNormals =
    textureLoader.load(
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/waternormals.jpg',
        (texture) => {

            texture.wrapS =
                THREE.RepeatWrapping;

            texture.wrapT =
                THREE.RepeatWrapping;

        }
    );


water =
    new Water(
        waterGeometry,
        {
            textureWidth: 512,
            textureHeight: 512,

            waterNormals:
                waterNormals,

            sunDirection:
                new THREE.Vector3()
                    .copy(sun)
                    .normalize(),

            sunColor: 0xffffff,

            waterColor: 0x001e0f,

            distortionScale: 3.7,

            fog: false
        }
    );


water.rotation.x =
    -Math.PI / 2;

scene.add(water);


// ============================================================
// GRID DO MONITORAMENTO
// ============================================================

function createMonitoringGrid() {

    const size = 2000;

    const divisions = 160;

    grid =
        new THREE.GridHelper(
            size,
            divisions,
            0x123247,
            0x07131c
        );

    grid.position.y = 0;

    scene.add(grid);

}


createMonitoringGrid();


// ============================================================
// LIXO
// ============================================================

function createTrashInWater(count = 50) {

    const crateGeometry =
        new THREE.BoxGeometry(
            0.8,
            0.8,
            0.8
        );


    const barrelGeometry =
        new THREE.CylinderGeometry(
            0.4,
            0.4,
            1.0,
            12
        );


    const crateMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x8b5a2b,
            roughness: 0.8
        });


    const barrelMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xd90429,
            roughness: 0.3,
            metalness: 0.5
        });


    for (
        let i = 0;
        i < count;
        i++
    ) {

        const isCrate =
            Math.random() > 0.5;


        const mesh =
            new THREE.Mesh(

                isCrate
                    ? crateGeometry
                    : barrelGeometry,

                isCrate
                    ? crateMaterial
                    : barrelMaterial

            );


        const angle =
            Math.random() *
            Math.PI *
            2;


        const distance =
            10 +
            Math.random() *
            70;


        mesh.position.x =
            Math.cos(angle) *
            distance;


        mesh.position.z =
            Math.sin(angle) *
            distance;


        mesh.position.y = 0.2;


        mesh.rotation.x =
            Math.random() *
            Math.PI;


        mesh.rotation.y =
            Math.random() *
            Math.PI;


        mesh.userData = {

            offset:
                Math.random() * 100,

            initialY:
                mesh.position.y

        };


        scene.add(mesh);

        trashItems.push(mesh);

    }

}


createTrashInWater(50);


// ============================================================
// CARREGAR ROBÔ
// ============================================================

const loader =
    new GLTFLoader();


loader.load(

    MODEL_PATH,

    (gltf) => {

        robotModel =
            gltf.scene;


        // ------------------------------------------
        // TAMANHO / ALTURA
        // ------------------------------------------

        const box =
            new THREE.Box3()
                .setFromObject(
                    robotModel
                );


        const size =
            box.getSize(
                new THREE.Vector3()
            );


        const minY =
            box.min.y;


        baseWaterY =
            -minY +
            size.y * 0.15;


        // ------------------------------------------
        // POSIÇÃO INICIAL
        // ------------------------------------------

        robotModel.position.set(
            0,
            1,
            0
        );


        // ------------------------------------------
        // MATERIAIS
        // ------------------------------------------

        robotModel.traverse(
            (child) => {

                if (
                    child.isMesh
                ) {

                    child.castShadow =
                        true;

                    child.receiveShadow =
                        true;


                    if (
                        child.material
                    ) {

                        child.material
                            .needsUpdate = true;

                    }

                }

            }
        );


        scene.add(
            robotModel
        );


        // ------------------------------------------
        // CÂMERA
        // ------------------------------------------

        const maxDim =
            Math.max(
                size.x,
                size.y,
                size.z
            );


        camera.position.set(
            0,
            maxDim * 1.5,
            maxDim * 2.5
        );


        controls.target.copy(
            robotModel.position
        );


        // ------------------------------------------
        // FINALIZA LOADING
        // ------------------------------------------

        if (loadingScreen) {

            loadingScreen.style.opacity =
                '0';


            setTimeout(
                () => {

                    loadingScreen.style.display =
                        'none';

                },
                500
            );

        }


        // Começa no monitoramento
        setMonitorMode();

    },


    (xhr) => {

        if (
            xhr.lengthComputable &&
            progressText
        ) {

            const percent =
                (
                    xhr.loaded /
                    xhr.total
                ) * 100;


            progressText.innerText =
                `Carregando OCEANUS... ${percent.toFixed(0)}%`;

        }

    },


    (error) => {

        console.error(
            'Erro ao carregar modelo:',
            error
        );


        if (progressText) {

            progressText.innerText =
                'Erro ao carregar modelo.glb';

            progressText.style.color =
                '#ff4d4d';

        }

    }

);


// ============================================================
// TECLADO
// ============================================================

window.addEventListener(
    'keydown',
    (event) => {

        const key =
            event.key.toLowerCase();

        keysPressed[key] = true;


        // Evita a página
        // de tentar rolar
        if (
            [
                'w',
                'a',
                's',
                'd',
                'q',
                'e',
                'arrowup',
                'arrowdown',
                'arrowleft',
                'arrowright'
            ].includes(key)
        ) {

            event.preventDefault();

        }

    }
);


window.addEventListener(
    'keyup',
    (event) => {

        keysPressed[
            event.key.toLowerCase()
        ] = false;

    }
);


// ============================================================
// VELOCIDADE
// ============================================================

if (speedSlider) {

    speedSlider.addEventListener(
        'input',
        () => {

            const value =
                Number(
                    speedSlider.value
                );


            moveSpeed =
                0.02 +
                (
                    value / 100
                ) * 0.12;


            if (speedValue) {

                speedValue.textContent =
                    `${value}%`;

            }


            if (telemetrySpeed) {

                telemetrySpeed.textContent =
                    `${value}%`;

            }

        }
    );

}


// ============================================================
// MODO OCEANO
// ============================================================

function setOceanMode() {

    currentMode =
        'ocean';


    // Água aparece
    if (water) {

        water.visible = true;

    }


    // Céu aparece
    if (sky) {

        sky.visible = true;

    }


    // Grid desaparece
    if (grid) {

        grid.visible = false;

    }


    // LIXOS APARECEM
    trashItems.forEach(
        (item) => {

            item.visible = true;

        }
    );


    // Fundo
    scene.background =
        new THREE.Color(
            0x87ceeb
        );


    scene.fog = null;


    // Interface
    const instructions =
        document.getElementById(
            'monitor-instructions'
        );


    const speedPanel =
        document.getElementById(
            'speed-panel'
        );


    const telemetry =
        document.getElementById(
            'telemetry'
        );


    const oceanInfo =
        document.getElementById(
            'ocean-info'
        );


    if (instructions)
        instructions.classList.add(
            'hidden'
        );


    if (speedPanel)
        speedPanel.classList.add(
            'hidden'
        );


    if (telemetry)
        telemetry.classList.add(
            'hidden'
        );


    if (oceanInfo)
        oceanInfo.classList.remove(
            'hidden'
        );


    // Botões
    if (oceanButton)
        oceanButton.classList.add(
            'active'
        );


    if (monitorButton)
        monitorButton.classList.remove(
            'active'
        );

}


// ============================================================
// MODO MONITORAMENTO
// ============================================================

function setMonitorMode() {

    currentMode =
        'monitor';


    // Água desaparece
    if (water) {

        water.visible = false;

    }


    // Céu desaparece
    if (sky) {

        sky.visible = false;

    }


    // Grid aparece
    if (grid) {

        grid.visible = true;

    }


    // LIXOS DESAPARECEM
    trashItems.forEach(
        (item) => {

            item.visible = false;

        }
    );


    // Fundo preto
    scene.background =
        new THREE.Color(
            0x020304
        );


    scene.fog =
        new THREE.FogExp2(
            0x020304,
            0.012
        );


    // Interface
    const instructions =
        document.getElementById(
            'monitor-instructions'
        );


    const speedPanel =
        document.getElementById(
            'speed-panel'
        );


    const telemetry =
        document.getElementById(
            'telemetry'
        );


    const oceanInfo =
        document.getElementById(
            'ocean-info'
        );


    if (instructions)
        instructions.classList.remove(
            'hidden'
        );


    if (speedPanel)
        speedPanel.classList.remove(
            'hidden'
        );


    if (telemetry)
        telemetry.classList.remove(
            'hidden'
        );


    if (oceanInfo)
        oceanInfo.classList.add(
            'hidden'
        );


    // Botões
    if (monitorButton)
        monitorButton.classList.add(
            'active'
        );


    if (oceanButton)
        oceanButton.classList.remove(
            'active'
        );

}


// ============================================================
// BOTÕES
// ============================================================

if (oceanButton) {

    oceanButton.addEventListener(
        'click',
        () => {

            setOceanMode();

        }
    );

}


if (monitorButton) {

    monitorButton.addEventListener(
        'click',
        () => {

            setMonitorMode();

        }
    );

}


// ============================================================
// MOVIMENTAÇÃO SUAVE
// ============================================================

function updateMovement() {

    if (!robotModel) {
        return;
    }


    let moving = false;


    // ------------------------------------------
    // FRENTE
    // ------------------------------------------

    if (
        keysPressed['w'] ||
        keysPressed['arrowup']
    ) {

        velocity.z += acceleration;

        moving = true;

    }


    // ------------------------------------------
    // RÉ
    // ------------------------------------------

    if (
        keysPressed['s'] ||
        keysPressed['arrowdown']
    ) {

        velocity.z -= acceleration;

        moving = true;

    }


    // ------------------------------------------
    // ESQUERDA
    // ------------------------------------------

    if (
        keysPressed['a'] ||
        keysPressed['arrowleft']
    ) {

        robotModel.rotation.y +=
            rotateSpeed;

        moving = true;

    }


    // ------------------------------------------
    // DIREITA
    // ------------------------------------------

    if (
        keysPressed['d'] ||
        keysPressed['arrowright']
    ) {

        robotModel.rotation.y -=
            rotateSpeed;

        moving = true;

    }


    // ------------------------------------------
    // SUBIR
    // Q
    // ------------------------------------------

    if (
        keysPressed['q']
    ) {

        robotModel.position.y +=
            verticalSpeed;

        moving = true;

    }


    // ------------------------------------------
    // DESCER
    // E
    // ------------------------------------------

    if (
        keysPressed['e']
    ) {

        robotModel.position.y -=
            verticalSpeed;

        moving = true;

    }


    // ------------------------------------------
    // LIMITA VELOCIDADE
    // ------------------------------------------

    const maxVelocity =
        moveSpeed;


    velocity.z =
        THREE.MathUtils.clamp(
            velocity.z,
            -maxVelocity,
            maxVelocity
        );


    // ------------------------------------------
    // APLICA MOVIMENTO
    // ------------------------------------------

    if (
        Math.abs(velocity.z) >
        0.0001
    ) {

        robotModel.translateZ(
            velocity.z
        );

        moving = true;

    }


    // ------------------------------------------
    // ATRITO
    // ------------------------------------------

    velocity.z *= friction;


    // ------------------------------------------
    // FLUTUAÇÃO
    // SOMENTE NO OCEANO
    // ------------------------------------------

    if (
        currentMode === 'ocean'
    ) {

        const time =
            performance.now() *
            0.0015;


        if (
            !keysPressed['q'] &&
            !keysPressed['e']
        ) {

            robotModel.position.y =
                baseWaterY +
                Math.sin(
                    time
                ) * 0.05;

        }

    }


    // ------------------------------------------
    // TELEMETRIA
    // ------------------------------------------

    updateTelemetry(
        moving
    );

}


// ============================================================
// TELEMETRIA
// ============================================================

function updateTelemetry(
    moving
) {

    if (!robotModel) {
        return;
    }


    if (posX) {

        posX.textContent =
            robotModel.position.x
                .toFixed(2);

    }


    if (posY) {

        posY.textContent =
            robotModel.position.y
                .toFixed(2);

    }


    if (posZ) {

        posZ.textContent =
            robotModel.position.z
                .toFixed(2);

    }


    if (robotStatus) {

        robotStatus.textContent =
            moving
                ? 'MOVENDO'
                : 'PARADO';

    }


    if (telemetrySpeed) {

        const value =
            speedSlider
                ? speedSlider.value
                : 86;


        telemetrySpeed.textContent =
            `${value}%`;

    }

}


// ============================================================
// ANIMAÇÃO DOS LIXOS
// ============================================================

function updateTrash() {

    if (
        currentMode !== 'ocean'
    ) {

        return;

    }


    const time =
        performance.now() *
        0.003;


    trashItems.forEach(
        (item) => {

            item.position.y =
                item.userData.initialY +
                Math.sin(
                    time +
                    item.userData.offset
                ) * 0.05;


            item.rotation.y +=
                0.005;

        }
    );

}


// ============================================================
// COLETA DE LIXO
// ============================================================

function collectTrash() {

    if (
        currentMode !== 'ocean'
    ) {

        return;

    }


    if (!robotModel) {

        return;

    }


    const robotPosition =
        new THREE.Vector3();


    robotModel.getWorldPosition(
        robotPosition
    );


    for (
        let i =
            trashItems.length - 1;

        i >= 0;

        i--
    ) {

        const trash =
            trashItems[i];


        const distance =
            robotPosition.distanceTo(
                trash.position
            );


        if (
            distance < 1.8
        ) {

            scene.remove(
                trash
            );


            trashItems.splice(
                i,
                1
            );

        }

    }

}


// ============================================================
// CÂMERA SEGUINDO O ROBÔ
// ============================================================

function updateCamera() {

    if (!robotModel) {
        return;
    }


    const robotPosition =
        new THREE.Vector3();


    robotModel.getWorldPosition(
        robotPosition
    );


    // Distância da câmera
    const cameraOffset =
        new THREE.Vector3(
            0,
            2.8,
            -6
        );


    // Rotaciona o offset
    // conforme o robô
    cameraOffset.applyAxisAngle(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        robotModel.rotation.y
    );


    const targetCameraPosition =
        robotPosition
            .clone()
            .add(
                cameraOffset
            );


    // Movimento suave
    camera.position.lerp(
        targetCameraPosition,
        0.055
    );


    // Olha para o robô
    const target =
        robotPosition
            .clone()
            .add(
                new THREE.Vector3(
                    0,
                    0.5,
                    0
                )
            );


    controls.target.lerp(
        target,
        0.08
    );

}


// ============================================================
// RESIZE
// ============================================================

window.addEventListener(
    'resize',
    () => {

        camera.aspect =
            window.innerWidth /
            window.innerHeight;


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );

    }
);


// ============================================================
// LOOP PRINCIPAL
// ============================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    // Água
    if (water) {

        water.material
            .uniforms['time']
            .value +=
            1 / 60;

    }


    updateMovement();

    updateTrash();

    collectTrash();

    updateCamera();

    controls.update();


    renderer.render(
        scene,
        camera
    );

}


// ============================================================
// INICIAR
// ============================================================

animate();