import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';


// ======================================================
// CONFIGURAÇÕES
// ======================================================

const MODEL_PATH = 'robo.glb';


// ======================================================
// VARIÁVEIS
// ======================================================

let water;
let sun;

let robotModel = null;

let baseWaterY = 0.1;

const trashItems = [];


// ======================================================
// CONTROLES
// ======================================================

const keysPressed = {};

let moveSpeed = 0.08;

const rotateSpeed = 0.04;


// ======================================================
// ELEMENTOS DA INTERFACE
// ======================================================

const oceanButton =
    document.getElementById('ocean-button');

const monitorButton =
    document.getElementById('monitor-button');

const oceanInfo =
    document.getElementById('ocean-info');

const monitorInstructions =
    document.getElementById('monitor-instructions');

const speedPanel =
    document.getElementById('speed-panel');

const telemetry =
    document.getElementById('telemetry');

const speedSlider =
    document.getElementById('speed');

const speedValue =
    document.getElementById('speedValue');

const telemetrySpeed =
    document.getElementById('telemetrySpeed');

const posX =
    document.getElementById('posX');

const posY =
    document.getElementById('posY');

const posZ =
    document.getElementById('posZ');

const robotStatus =
    document.getElementById('robotStatus');


// ======================================================
// MODO ATUAL
// ======================================================

let currentMode = 'monitor';


// ======================================================
// FUNÇÃO: MODO MONITORAMENTO
// ======================================================

function setMonitorMode() {

    currentMode = 'monitor';


    // Ativa botão monitoramento
    if (monitorButton) {

        monitorButton.classList.add(
            'active'
        );

    }


    // Desativa botão oceano
    if (oceanButton) {

        oceanButton.classList.remove(
            'active'
        );

    }


    // Mostra instruções
    if (monitorInstructions) {

        monitorInstructions.classList.remove(
            'hidden'
        );

    }


    // Mostra painel de velocidade
    if (speedPanel) {

        speedPanel.classList.remove(
            'hidden'
        );

    }


    // Mostra telemetria
    if (telemetry) {

        telemetry.classList.remove(
            'hidden'
        );

    }


    // Esconde informações do oceano
    if (oceanInfo) {

        oceanInfo.classList.add(
            'hidden'
        );

    }


    console.log(
        'Modo Monitoramento ativado'
    );

}


// ======================================================
// FUNÇÃO: MODO OCEANO
// ======================================================

function setOceanMode() {

    currentMode = 'ocean';


    // Ativa botão oceano
    if (oceanButton) {

        oceanButton.classList.add(
            'active'
        );

    }


    // Desativa botão monitoramento
    if (monitorButton) {

        monitorButton.classList.remove(
            'active'
        );

    }


    // Esconde instruções
    if (monitorInstructions) {

        monitorInstructions.classList.add(
            'hidden'
        );

    }


    // Esconde painel de velocidade
    if (speedPanel) {

        speedPanel.classList.add(
            'hidden'
        );

    }


    // Esconde telemetria
    if (telemetry) {

        telemetry.classList.add(
            'hidden'
        );

    }


    // Mostra informações do oceano
    if (oceanInfo) {

        oceanInfo.classList.remove(
            'hidden'
        );

    }


    console.log(
        'Modo Oceano ativado'
    );

}


// ======================================================
// EVENTOS DOS BOTÕES
// ======================================================

if (monitorButton) {

    monitorButton.addEventListener(
        'click',
        () => {

            setMonitorMode();

        }
    );

}


if (oceanButton) {

    oceanButton.addEventListener(
        'click',
        () => {

            setOceanMode();

        }
    );

}


// ======================================================
// CONTROLE DE VELOCIDADE
// ======================================================

if (speedSlider) {

    speedSlider.addEventListener(
        'input',
        () => {

            const value =
                Number(speedSlider.value);


            // Atualiza velocidade do robô
            moveSpeed =
                value / 1000;


            // Atualiza texto
            if (speedValue) {

                speedValue.innerText =
                    `${value}%`;

            }


            if (telemetrySpeed) {

                telemetrySpeed.innerText =
                    `${value}%`;

            }


            // Atualiza visual do slider
            speedSlider.style.background =
                `linear-gradient(
                    to right,
                    #ffffff 0%,
                    #ffffff ${value}%,
                    #30383e ${value}%,
                    #30383e 100%
                )`;

        }
    );

}


// ======================================================
// CENA
// ======================================================

const container =
    document.getElementById(
        'canvas-container'
    );


const scene =
    new THREE.Scene();


// ======================================================
// CÂMERA
// ======================================================

const camera =
    new THREE.PerspectiveCamera(

        55,

        window.innerWidth /
        window.innerHeight,

        0.1,

        2000

    );


camera.position.set(
    0,
    3,
    6
);


// ======================================================
// RENDERIZADOR
// ======================================================

const renderer =
    new THREE.WebGLRenderer({

        antialias: true,

        powerPreference:
            'high-performance'

    });


renderer.setSize(
    window.innerWidth,
    window.innerHeight
);


renderer.setPixelRatio(
    Math.min(
        window.devicePixelRatio,
        2
    )
);


renderer.toneMapping =
    THREE.ACESFilmicToneMapping;


renderer.toneMappingExposure =
    1.0;


renderer.shadowMap.enabled =
    true;


container.appendChild(
    renderer.domElement
);


// ======================================================
// ILUMINAÇÃO
// ======================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        2.0
    );


scene.add(
    ambientLight
);


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


mainLight.castShadow =
    true;


scene.add(
    mainLight
);


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


scene.add(
    fillLight
);


// ======================================================
// CÉU
// ======================================================

sun =
    new THREE.Vector3();


const sky =
    new Sky();


sky.scale.setScalar(
    10000
);


scene.add(
    sky
);


const skyUniforms =
    sky.material.uniforms;


skyUniforms[
    'turbidity'
].value = 8;


skyUniforms[
    'rayleigh'
].value = 2;


skyUniforms[
    'mieCoefficient'
].value = 0.005;


skyUniforms[
    'mieDirectionalG'
].value = 0.8;


const elevation =
    20;


const azimuth =
    180;


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
].value.copy(
    sun
);


// ======================================================
// ÁGUA
// ======================================================

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
                texture.wrapT =
                THREE.RepeatWrapping;

        }

    );


water =
    new Water(

        waterGeometry,

        {

            textureWidth:
                512,

            textureHeight:
                512,

            waterNormals:
                waterNormals,

            sunDirection:

                new THREE.Vector3()
                    .copy(sun)
                    .normalize(),

            sunColor:
                0xffffff,

            waterColor:
                0x001e0f,

            distortionScale:
                3.7,

            fog:
                scene.fog !== undefined

        }

    );


water.rotation.x =
    -Math.PI / 2;


scene.add(
    water
);


// ======================================================
// LIXO
// ======================================================

function createTrashInWater(
    count = 50
) {

    const crateGeo =
        new THREE.BoxGeometry(
            0.8,
            0.8,
            0.8
        );


    const barrelGeo =
        new THREE.CylinderGeometry(
            0.4,
            0.4,
            1.0,
            12
        );


    const crateMat =
        new THREE.MeshStandardMaterial({

            color:
                0x8b5a2b,

            roughness:
                0.8

        });


    const barrelMat =
        new THREE.MeshStandardMaterial({

            color:
                0xd90429,

            roughness:
                0.3,

            metalness:
                0.5

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
                    ? crateGeo
                    : barrelGeo,

                isCrate
                    ? crateMat
                    : barrelMat

            );


        const angle =
            Math.random() *
            Math.PI *
            2;


        const distance =
            10 +
            Math.random() * 70;


        mesh.position.x =
            Math.cos(angle) *
            distance;


        mesh.position.z =
            Math.sin(angle) *
            distance;


        mesh.position.y =
            0.2;


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


        scene.add(
            mesh
        );


        trashItems.push(
            mesh
        );

    }

}


// Cria lixo
createTrashInWater(
    50
);


// ======================================================
// LOADING SCREEN
// ======================================================

const loadingScreen =
    document.getElementById(
        'loading-screen'
    );


const progressText =
    document.getElementById(
        'progress-text'
    );


// ======================================================
// DRACO LOADER
// ======================================================

const dracoLoader =
    new DRACOLoader();


dracoLoader.setDecoderPath(
    'https://unpkg.com/three@0.178.0/examples/jsm/libs/draco/'
);


// ======================================================
// GLTF LOADER
// ======================================================

const loader =
    new GLTFLoader();


loader.setDRACOLoader(
    dracoLoader
);


// ======================================================
// CARREGAR ROBÔ
// ======================================================

loader.load(

    MODEL_PATH,


    (gltf) => {

        robotModel =
            gltf.scene;


        // Calcula tamanho
        const box =
            new THREE.Box3()
                .setFromObject(
                    robotModel
                );


        const minY =
            box.min.y;


        const sizeY =
            box.max.y -
            box.min.y;


        // Altura na água
        baseWaterY =
            -minY +
            (sizeY * 0.15);


        robotModel.position.set(

            0,

            baseWaterY,

            0

        );


        // Configura malhas
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

                        child.material.needsUpdate =
                            true;

                    }

                }

            }
        );


        scene.add(
            robotModel
        );


        // Câmera inicial
        const maxDim =
            Math.max(

                box.max.x -
                box.min.x,

                sizeY,

                box.max.z -
                box.min.z

            );


        camera.position.set(

            0,

            maxDim * 1.5,

            maxDim * 2.5

        );


        controls.target.copy(
            robotModel.position
        );


        // Finaliza loading
        if (
            loadingScreen
        ) {

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

    },


    // Progresso
    (xhr) => {

        if (

            xhr.lengthComputable &&

            progressText

        ) {

            const percent =

                (
                    xhr.loaded /
                    xhr.total
                )

                * 100;


            progressText.innerText =

                `Carregando robô... ${percent.toFixed(0)}%`;

        }

    },


    // Erro
    (error) => {

        console.error(

            'Erro ao carregar modelo:',

            error

        );


        if (
            progressText
        ) {

            progressText.innerText =
                'Erro ao carregar modelo GLB';


            progressText.style.color =
                '#ff4d4d';

        }

    }

);


// ======================================================
// ORBIT CONTROLS
// ======================================================

const controls =
    new OrbitControls(

        camera,

        renderer.domElement

    );


controls.enableDamping =
    true;


controls.dampingFactor =
    0.08;


controls.maxPolarAngle =
    Math.PI / 2 - 0.01;


controls.minDistance =
    2;


controls.maxDistance =
    30;


// ======================================================
// TECLADO
// ======================================================

window.addEventListener(

    'keydown',

    (e) => {

        keysPressed[
            e.key.toLowerCase()
        ] = true;

    }

);


window.addEventListener(

    'keyup',

    (e) => {

        keysPressed[
            e.key.toLowerCase()
        ] = false;

    }

);


// ======================================================
// FÍSICA E MOVIMENTO
// ======================================================

function updatePhysics() {

    const time =
        Date.now() * 0.003;


    // Anima lixo
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


    if (
        !robotModel
    ) return;


    // A = esquerda
    if (
        keysPressed['a']
    ) {

        robotModel.rotation.y +=
            rotateSpeed;

    }


    // D = direita
    if (
        keysPressed['d']
    ) {

        robotModel.rotation.y -=
            rotateSpeed;

    }


    // W = frente
    if (
        keysPressed['w']
    ) {

        robotModel.translateZ(
            moveSpeed
        );

    }


    // S = ré
    if (
        keysPressed['s']
    ) {

        robotModel.translateZ(
            -moveSpeed
        );

    }


    // Q = subir
    if (
        keysPressed['q']
    ) {

        robotModel.position.y +=
            0.05;

    }


    // E = descer
    if (
        keysPressed['e']
    ) {

        robotModel.position.y -=
            0.05;

    }


    // Flutuação
    if (

        !keysPressed['q'] &&

        !keysPressed['e']

    ) {

        robotModel.position.y =

            baseWaterY +

            Math.sin(
                time * 1.5
            ) * 0.05;

    }


    // ==================================================
    // TELEMETRIA
    // ==================================================

    if (
        posX
    ) {

        posX.innerText =
            robotModel.position.x.toFixed(
                2
            );

    }


    if (
        posY
    ) {

        posY.innerText =
            robotModel.position.y.toFixed(
                2
            );

    }


    if (
        posZ
    ) {

        posZ.innerText =
            robotModel.position.z.toFixed(
                2
            );

    }


    if (
        robotStatus
    ) {

        const isMoving =

            keysPressed['w'] ||

            keysPressed['a'] ||

            keysPressed['s'] ||

            keysPressed['d'] ||

            keysPressed['q'] ||

            keysPressed['e'];


        robotStatus.innerText =
            isMoving
                ? 'EM MOVIMENTO'
                : 'PARADO';

    }


    // Posição do robô
    const robotPos =
        new THREE.Vector3();


    robotModel.getWorldPosition(
        robotPos
    );


    // Coleta lixo
    for (

        let i =
            trashItems.length - 1;

        i >= 0;

        i--

    ) {

        const trash =
            trashItems[i];


        const dist =
            robotPos.distanceTo(
                trash.position
            );


        if (
            dist < 1.8
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


    // ==================================================
    // CÂMERA SEGUINDO O ROBÔ
    // ==================================================

    const cameraOffset =
        new THREE.Vector3(

            0,

            2.5,

            -5

        );


    cameraOffset.applyAxisAngle(

        new THREE.Vector3(
            0,
            1,
            0
        ),

        robotModel.rotation.y

    );


    const targetCameraPos =

        robotPos.clone()
            .add(
                cameraOffset
            );


    camera.position.lerp(

        targetCameraPos,

        0.05

    );


    controls.target.lerp(

        robotPos.clone()
            .add(

                new THREE.Vector3(

                    0,

                    0.5,

                    0

                )

            ),

        0.1

    );

}


// ======================================================
// RESIZE
// ======================================================

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


// ======================================================
// LOOP PRINCIPAL
// ======================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    // Anima água
    if (
        water
    ) {

        water.material
            .uniforms['time']
            .value +=
            1.0 / 60.0;

    }


    // Atualiza robô
    updatePhysics();


    // Atualiza controles
    controls.update();


    // Renderiza
    renderer.render(

        scene,

        camera

    );

}


// ======================================================
// INICIA O JOGO
// ======================================================

animate();
