import * as THREE from 'three';

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { Water } from 'three/addons/objects/Water.js';
import { Sky } from 'three/addons/objects/Sky.js';


// ======================================================
// CONFIGURAÇÕES
// ======================================================

// Nome do modelo otimizado que está no GitHub/Vercel
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


// Velocidade máxima
let moveSpeed = 0.08;

// Velocidade de rotação
const rotateSpeed = 0.04;


// ======================================================
// CENA
// ======================================================

const container = document.getElementById('canvas-container');

const scene = new THREE.Scene();


// ======================================================
// CÂMERA
// ======================================================

const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);

camera.position.set(0, 3, 6);


// ======================================================
// RENDERIZADOR
// ======================================================

const renderer = new THREE.WebGLRenderer({
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

renderer.toneMapping = THREE.ACESFilmicToneMapping;

renderer.toneMappingExposure = 1.0;

renderer.shadowMap.enabled = true;

container.appendChild(renderer.domElement);


// ======================================================
// ILUMINAÇÃO
// ======================================================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    2.0
);

scene.add(ambientLight);


const mainLight = new THREE.DirectionalLight(
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


const fillLight = new THREE.DirectionalLight(
    0x90e0ef,
    1.2
);

fillLight.position.set(
    -20,
    20,
    -20
);

scene.add(fillLight);


// ======================================================
// CÉU
// ======================================================

sun = new THREE.Vector3();

const sky = new Sky();

sky.scale.setScalar(10000);

scene.add(sky);


const skyUniforms = sky.material.uniforms;

skyUniforms['turbidity'].value = 8;

skyUniforms['rayleigh'].value = 2;

skyUniforms['mieCoefficient'].value = 0.005;

skyUniforms['mieDirectionalG'].value = 0.8;


const elevation = 20;

const azimuth = 180;

const phi = THREE.MathUtils.degToRad(
    90 - elevation
);

const theta = THREE.MathUtils.degToRad(
    azimuth
);


sun.setFromSphericalCoords(
    1,
    phi,
    theta
);


sky.material.uniforms['sunPosition'].value.copy(
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


water = new Water(
    waterGeometry,
    {

        textureWidth: 512,

        textureHeight: 512,

        waterNormals: waterNormals,

        sunDirection:
            new THREE.Vector3()
                .copy(sun)
                .normalize(),

        sunColor: 0xffffff,

        waterColor: 0x001e0f,

        distortionScale: 3.7,

        fog: scene.fog !== undefined

    }
);


water.rotation.x =
    -Math.PI / 2;


scene.add(water);


// ======================================================
// LIXO
// ======================================================

function createTrashInWater(count = 50) {

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

            color: 0x8b5a2b,

            roughness: 0.8

        });


    const barrelMat =
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


// Cria 50 objetos de lixo
createTrashInWater(50);


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
//
// IMPORTANTE:
// O novo robo.glb foi comprimido usando Draco.
// Por isso precisamos informar ao Three.js
// onde estão os arquivos necessários para
// descompactar o modelo.
//

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


// Conecta o Draco ao GLTFLoader
loader.setDRACOLoader(
    dracoLoader
);


// ======================================================
// CARREGAR ROBÔ
// ======================================================

loader.load(

    MODEL_PATH,

    (gltf) => {

        // Recebe o modelo
        robotModel = gltf.scene;


        // ==================================================
        // CALCULA TAMANHO DO ROBÔ
        // ==================================================

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


        // Altura do robô na água
        baseWaterY =
            -minY +
            (sizeY * 0.15);


        robotModel.position.set(
            0,
            baseWaterY,
            0
        );


        // ==================================================
        // CONFIGURAÇÃO DAS MALHAS
        // ==================================================

        robotModel.traverse(
            (child) => {

                if (child.isMesh) {

                    child.castShadow =
                        true;

                    child.receiveShadow =
                        true;


                    if (child.material) {

                        child.material.needsUpdate =
                            true;

                    }

                }

            }
        );


        // Adiciona o robô à cena
        scene.add(
            robotModel
        );


        // ==================================================
        // CÂMERA INICIAL
        // ==================================================

        const maxDim =
            Math.max(

                box.max.x - box.min.x,

                sizeY,

                box.max.z - box.min.z

            );


        camera.position.set(

            0,

            maxDim * 1.5,

            maxDim * 2.5

        );


        controls.target.copy(
            robotModel.position
        );


        // ==================================================
        // FINALIZA LOADING
        // ==================================================

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

    },


    // ==================================================
    // PROGRESSO
    // ==================================================

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
                `Carregando robô... ${percent.toFixed(0)}%`;

        }

    },


    // ==================================================
    // ERRO
    // ==================================================

    (error) => {

        console.error(
            'Erro ao carregar modelo:',
            error
        );


        if (progressText) {

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


    // ==================================================
    // ANIMAÇÃO DO LIXO
    // ==================================================

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


    // Se o robô ainda não carregou
    if (!robotModel) return;


    // ==================================================
    // WASD
    // ==================================================

    // A = esquerda
    if (keysPressed['a']) {

        robotModel.rotation.y +=
            rotateSpeed;

    }


    // D = direita
    if (keysPressed['d']) {

        robotModel.rotation.y -=
            rotateSpeed;

    }


    // W = frente
    if (keysPressed['w']) {

        robotModel.translateZ(
            moveSpeed
        );

    }


    // S = ré
    if (keysPressed['s']) {

        robotModel.translateZ(
            -moveSpeed
        );

    }


    // ==================================================
    // Q = SUBIR
    // E = DESCER
    // ==================================================

    if (keysPressed['q']) {

        robotModel.position.y +=
            0.05;

    }


    if (keysPressed['e']) {

        robotModel.position.y -=
            0.05;

    }


    // ==================================================
    // FLUTUAÇÃO
    // ==================================================

    // Só aplica a ondulação quando
    // Q/E não estiverem sendo utilizados.

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
    // POSIÇÃO DO ROBÔ
    // ==================================================

    const robotPos =
        new THREE.Vector3();


    robotModel.getWorldPosition(
        robotPos
    );


    // ==================================================
    // COLETA DE LIXO
    // ==================================================

    for (
        let i = trashItems.length - 1;
        i >= 0;
        i--
    ) {

        const trash =
            trashItems[i];


        const dist =
            robotPos.distanceTo(
                trash.position
            );


        // Distância necessária para coletar
        if (dist < 1.8) {

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
            .add(cameraOffset);


    // Movimento suave da câmera
    camera.position.lerp(
        targetCameraPos,
        0.05
    );


    // Olha para o robô
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


    // Anima a água
    if (water) {

        water.material
            .uniforms['time']
            .value +=
            1.0 / 60.0;

    }


    // Atualiza física
    updatePhysics();


    // Atualiza câmera/controles
    controls.update();


    // Renderiza
    renderer.render(
        scene,
        camera
    );

}


// Inicia o jogo
animate();
