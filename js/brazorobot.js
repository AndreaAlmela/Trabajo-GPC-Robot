
// BRAZO ROBOT

// Escena

const escena = new THREE.Scene();
escena.background = new THREE.Color(0x303844);

// Cámara
const camara = new THREE.PerspectiveCamera(
    45, window.innerWidth / window.innerHeight, 1, 3000
);
camara.position.set(330, 270, 370);

// Render
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.shadowMap.autoUpdate = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.autoClear = false;

document.getElementById("container").appendChild(renderer.domElement);


// Texturas

const cargadorTexturas = new THREE.TextureLoader();

const texturaMetal = cargadorTexturas.load("images/metal_128.jpg");
texturaMetal.wrapS = texturaMetal.wrapT = THREE.RepeatWrapping;
texturaMetal.repeat.set(2, 2);

const texturaMadera = cargadorTexturas.load("images/wood512.jpg");
texturaMadera.wrapS = texturaMadera.wrapT = THREE.RepeatWrapping;
texturaMadera.repeat.set(2, 2);

const texturaSuelo = cargadorTexturas.load("images/pisometalico_1024.jpg");
texturaSuelo.wrapS = texturaSuelo.wrapT = THREE.RepeatWrapping;
texturaSuelo.center.set(0.5, 0.5);
texturaSuelo.rotation = Math.PI;
texturaSuelo.repeat.set(1, 1);
texturaSuelo.anisotropy = renderer.capabilities.getMaxAnisotropy();
texturaSuelo.minFilter = THREE.LinearMipmapLinearFilter;

const carasEntorno = [
    "images/posx.jpg", "images/negx.jpg",
    "images/posy.jpg", "images/negy.jpg",
    "images/posz.jpg", "images/negz.jpg"
];

// Entorno

const entorno = new THREE.CubeTextureLoader().load(carasEntorno);
entorno.encoding = THREE.sRGBEncoding;
escena.background = new THREE.Color(0x252d36);



// Iluminación
escena.add(new THREE.AmbientLight(0xffffff, 0.38));

const direccional = new THREE.DirectionalLight(0xffffff, 1.05);
direccional.position.set(-260, 420, 260);
direccional.castShadow = true;
direccional.shadow.mapSize.set(2048, 2048);
direccional.shadow.camera.left = -360;
direccional.shadow.camera.right = 360;
direccional.shadow.camera.top = 360;
direccional.shadow.camera.bottom = -360;
direccional.shadow.camera.near = 1;
direccional.shadow.camera.far = 1200;
direccional.shadow.bias = -0.00025;
escena.add(direccional, direccional.target);

const foco = new THREE.SpotLight(
    0xffedce, 1.25, 1100, Math.PI / 5, 0.35, 1.2
);
foco.position.set(260, 460, -240);
foco.target.position.set(0, 90, 0);
foco.castShadow = true;
foco.shadow.mapSize.set(1024, 1024);
foco.shadow.bias = -0.0003;
escena.add(foco, foco.target);



// Habitación

const habitacion = new THREE.Mesh(
    new THREE.BoxGeometry(1200, 700, 1200),
    carasEntorno.map((ruta) => {
        const textura = cargadorTexturas.load(ruta);
        textura.encoding = THREE.sRGBEncoding;
        return new THREE.MeshBasicMaterial({map: textura,
            color: 0x92999f, side: THREE.BackSide});
    })
);

habitacion.position.y = 345;
habitacion.receiveShadow = true;
escena.add(habitacion);


// Suelo

const suelo = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshPhongMaterial({
        map: texturaSuelo,
        color: 0xffffff,
        shininess: 18
    })
);
suelo.rotation.x = -Math.PI / 2;
suelo.receiveShadow = true;
escena.add(suelo);



// Materiales

const materialAzul = new THREE.MeshPhongMaterial({
    color: 0x9fc8e8, map: texturaMetal, shininess: 85});

const materialMetal = new THREE.MeshPhongMaterial({
    color: 0xe0e4e6, map: texturaMetal, shininess: 105});

const materialOscuro = new THREE.MeshPhongMaterial({
    color: 0x65727b, map: texturaMetal, shininess: 70});

const materialMate = new THREE.MeshLambertMaterial({
    color: 0xb7a184, map: texturaMadera});

const materialPinza = new THREE.MeshPhongMaterial({
    color: 0xffb04a, map: texturaMetal, shininess: 55, side: THREE.DoubleSide});

const materialRotula = new THREE.MeshPhongMaterial({
    color: 0xd9f0ff, map: texturaMetal, envMap: entorno, combine: THREE.MixOperation,
    reflectivity: 0.8, shininess: 130});

// Funcion auxiliar
function pieza(geometria, material, padre, x = 0, y = 0, z = 0) {
    const malla = new THREE.Mesh(geometria, material);
    malla.position.set(x, y, z);
    malla.castShadow = true;
    malla.receiveShadow = true;
    padre.add(malla);
    return malla;
}


// Robot

const robot = new THREE.Group();
escena.add(robot);



// Base

const base = new THREE.Group();
robot.add(base);

// Cilindro
pieza(
    new THREE.CylinderGeometry(50, 50, 15, 48),
    materialAzul, base, 0, 7.5, 0
);


// Brazo

const brazo = new THREE.Group();


brazo.position.y = 22;
base.add(brazo);


const eje = pieza(
    new THREE.CylinderGeometry(20, 20, 18, 40),
    materialOscuro, brazo
);
eje.rotation.x = Math.PI / 2;


pieza(new THREE.BoxGeometry(18, 120, 12), materialMate, brazo, 0, 60, 0);


// Rótula

const articulacion = new THREE.Group();
articulacion.position.y = 120;
brazo.add(articulacion);

// Esfera de radio 20

pieza(new THREE.SphereGeometry(20, 40, 32), materialRotula, articulacion);


// Antebrazo

const antebrazo = new THREE.Group();
antebrazo.rotation.order = "YZX";
articulacion.add(antebrazo);

pieza(new THREE.CylinderGeometry(22, 22, 6, 40), materialOscuro, antebrazo, 0, 0, 0);

// Cuatro palos
for (const x of [-8, 8]) {
    for (const z of [-10, 10]) {
        pieza(new THREE.BoxGeometry(4, 80, 4), materialMetal, antebrazo, x, 40, z);
    }
}


// Mano

const manoGrupo = new THREE.Group();

manoGrupo.position.y = 80;
antebrazo.add(manoGrupo);

// Cilindro (radio 15, longitud 40)
const mano = pieza(new THREE.CylinderGeometry(15, 15, 40, 40), materialAzul, manoGrupo);
mano.rotation.x = Math.PI / 2;


// Pinza

const pinza = new THREE.Group();
manoGrupo.add(pinza);

// Cuña pinza
function crearCuna() {
    const vertices = [];
    const uvs = [];

   
    const A = [19, -9.5, -2];
    const B = [19, 9.5, -2];
    const C = [19, 9.5, 2];
    const D = [19, -9.5, 2];
    const E = [38, -7.5, -1];
    const F = [38, 7.5, -1];
    const G = [38, 7.5, 1];
    const H = [38, -7.5, 1];

    function cara(a, b, c, d) {
        vertices.push(...a, ...b, ...c, ...a, ...c, ...d);
        uvs.push(0,0, 1,0, 1,1, 0,0, 1,1, 0,1);
    }

    cara(A, B, F, E);
    cara(D, H, G, C);
    cara(B, C, G, F);
    cara(D, A, E, H);
    cara(E, F, G, H);
    cara(A, D, C, B);

    const geometria = new THREE.BufferGeometry();
    geometria.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geometria.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
    geometria.computeVertexNormals();

    return geometria;
}

const geometriaCuna = crearCuna();


function crearDedo(signo) {
    const grupo = new THREE.Group();
    grupo.userData.signo = signo;
    pinza.add(grupo);

    // Parte rectangular
    pieza(new THREE.BoxGeometry(19, 19, 4), materialPinza, grupo, 9.5, 0, 0);

    // Parte en forma de cuña
    pieza(geometriaCuna, materialPinza, grupo);

    
    const guia = pieza(new THREE.BoxGeometry(3, 3, 1), materialOscuro, grupo, 10, 0, 0);

    return { grupo, guia, signo };
}

const dedoA = crearDedo(-1);
const dedoB = crearDedo(1);


// Controles del robot


const parametros = {
    giroBase: 0,
    giroBrazo: 0,
    giroAntebrazoY: 0,
    giroAntebrazo: 0,
    giroMano: 0,
    aperturaPinza: 0,
    alambre: false,
    animacion: () => iniciarAnimacion(),
    detener: () => detenerAnimacion()
};

function aplicarParametros() {
    base.rotation.y = THREE.MathUtils.degToRad(parametros.giroBase);
    brazo.rotation.z = THREE.MathUtils.degToRad(parametros.giroBrazo);

    // Giro del antebrazo sobre los dos ejes de la rotula
    antebrazo.rotation.y = THREE.MathUtils.degToRad(parametros.giroAntebrazoY);
    antebrazo.rotation.z = THREE.MathUtils.degToRad(parametros.giroAntebrazo);

    pinza.rotation.z = THREE.MathUtils.degToRad(parametros.giroMano);

    // Apertura simetrica
    const separacion = parametros.aperturaPinza;

    for (const dedo of [dedoA, dedoB]) {
        dedo.grupo.position.set(0, 0, dedo.signo * (2 + separacion));

        dedo.guia.scale.z = separacion + 3;
        dedo.guia.position.z = -dedo.signo * separacion / 2;
    }
}




// Interfaz dat.GUI

const gui = new dat.GUI({ width: 290 });
gui.domElement.style.marginTop = "8px";

const guiBase = gui.addFolder("Articulaciones");

guiBase.add(parametros, "giroBase", -180, 180, 1).name("Giro de la base").onChange(aplicarParametros);
guiBase.add(parametros, "giroBrazo", -45, 45, 1).name("Giro del brazo Z").onChange(aplicarParametros);
guiBase.add(parametros, "giroAntebrazoY", -180, 180, 1).name("Giro antebrazo Y").onChange(aplicarParametros);
guiBase.add(parametros, "giroAntebrazo", -90, 90, 1).name("Giro del antebrazo Z").onChange(aplicarParametros);
guiBase.add(parametros, "giroMano", -40, 220, 1).name("Giro de la pinza Z").onChange(aplicarParametros);
guiBase.add(parametros, "aperturaPinza", 0, 15, 1).name("Apertura de pinza").onChange(aplicarParametros);

guiBase.open();


gui.add(parametros, "alambre").name("Ver en alambre").onChange((valor) => {
    robot.traverse((objeto) => {
        if (objeto.isMesh) {
            const materiales = Array.isArray(objeto.material)
                ? objeto.material : [objeto.material];

            materiales.forEach(material => {
                if (material && "wireframe" in material) {material.wireframe = valor;}
            });
        }
    });
});


gui.add(parametros, "animacion").name("Iniciar animacion");
gui.add(parametros, "detener").name("Detener animacion");



// Animación


// Animacion

let animando = false;
let tiempoAnimacion = 0;
let valoresIniciales = null;

function iniciarAnimacion() {
    if (animando) return;

    animando = true;
    tiempoAnimacion = 0;

    valoresIniciales = {
        base: parametros.giroBase,
        brazo: parametros.giroBrazo,
        antebrazoY: parametros.giroAntebrazoY,
        antebrazo: parametros.giroAntebrazo,
        mano: parametros.giroMano,
        pinza: parametros.aperturaPinza
    };
}

function detenerAnimacion() {
    animando = false;
}

function actualizarAnimacion(delta) {
    if (!animando || !valoresIniciales) return;

    tiempoAnimacion += delta;
    const t = (tiempoAnimacion % 8) / 8;
    const onda = Math.sin(t * Math.PI * 2);

  
    parametros.giroBase = THREE.MathUtils.clamp(valoresIniciales.base + 55 * onda, -180, 180);
    parametros.giroBrazo = THREE.MathUtils.clamp(valoresIniciales.brazo + 22 * Math.sin(t * Math.PI * 4),-45, 45);
    parametros.giroAntebrazoY = THREE.MathUtils.clamp(valoresIniciales.antebrazoY + 30 * onda, -180, 180);
    parametros.giroAntebrazo = THREE.MathUtils.clamp(valoresIniciales.antebrazo - 20 * onda, -90, 90);
    parametros.giroMano = THREE.MathUtils.clamp(valoresIniciales.mano + 10 * onda, -40, 220);

    const aperturaInicial = valoresIniciales.pinza;
    const aperturaObjetivo = aperturaInicial < 7.5 ? 15 : 0;

    parametros.aperturaPinza = aperturaInicial +
        (aperturaObjetivo - aperturaInicial) *
        (1 - Math.cos(t * Math.PI * 2)) / 2;

    aplicarParametros();
}



// Movimiento teclado

const teclas = Object.create(null);
const velocidad = 100;

window.addEventListener("keydown", (evento) => {
    if (evento.key.startsWith("Arrow")) {
        evento.preventDefault();
        teclas[evento.key] = true;
    }
});

window.addEventListener("keyup", (evento) => {
    if (evento.key.startsWith("Arrow")) {
        evento.preventDefault();
        teclas[evento.key] = false;
    }
});




// Cámara orbital

const controlesCamara = new THREE.OrbitControls(camara, renderer.domElement);
controlesCamara.enableKeys = false;
controlesCamara.target.set(0, 120, 0);
controlesCamara.enableDamping = true;
controlesCamara.dampingFactor = 0.06;
controlesCamara.minDistance = 180;
controlesCamara.maxDistance = 1000;
controlesCamara.maxPolarAngle = Math.PI * 0.49;



// Cámara cenital

const camaraCenital = new THREE.OrthographicCamera(
    -280, 280, 280, -280, 1, 1800
);
camaraCenital.up.set(0, 0, -1);

const marcoMiniatura = document.createElement("div");
marcoMiniatura.style.cssText = [
    "position:fixed", "z-index:5", "pointer-events:none",
    "border:2px solid rgba(255,255,255,.9)",
    "box-shadow:0 2px 12px rgba(0,0,0,.5)",
    "box-sizing:border-box"
].join(";");

document.body.appendChild(marcoMiniatura);



// Renderizado

const reloj = new THREE.Clock();

function renderizar() {
    requestAnimationFrame(renderizar);

    const delta = Math.min(reloj.getDelta(), 0.05);

    // Movimiento del robot
    if (teclas.ArrowUp) robot.position.z -= velocidad * delta;
    if (teclas.ArrowDown) robot.position.z += velocidad * delta;
    if (teclas.ArrowLeft) robot.position.x -= velocidad * delta;
    if (teclas.ArrowRight) robot.position.x += velocidad * delta;

    robot.position.x = THREE.MathUtils.clamp(robot.position.x, -450, 450);
    robot.position.z = THREE.MathUtils.clamp(robot.position.z, -450, 450);

    // Actualizacion de luces
    direccional.position.set(robot.position.x - 260, 420, robot.position.z + 260);
    direccional.target.position.set(robot.position.x, 0, robot.position.z);

    foco.position.set(robot.position.x + 260, 460, robot.position.z - 240);
    foco.target.position.set(robot.position.x, 90, robot.position.z);

    renderer.shadowMap.needsUpdate = true;

    actualizarAnimacion(delta);
    gui.updateDisplay();
    controlesCamara.update();

    const ancho = window.innerWidth;
    const alto = window.innerHeight;
    const ladoMiniatura = Math.floor(Math.min(ancho, alto) / 4);

    const margen = 12;
    const xMiniatura = margen;
    const yMiniatura = alto - ladoMiniatura - margen;


    // Vista principal
    renderer.setScissorTest(false);
    renderer.setViewport(0, 0, ancho, alto);
    renderer.clear(true, true, true);
    renderer.render(escena, camara);


    // Vista cenital
    const centroMiniX = robot.position.x;
    const centroMiniZ = robot.position.z;

    camaraCenital.position.set(centroMiniX, 900, centroMiniZ);
    camaraCenital.lookAt(centroMiniX, 0, centroMiniZ);
    camaraCenital.updateMatrixWorld();

    renderer.setScissorTest(true);
    renderer.setViewport(xMiniatura, yMiniatura, ladoMiniatura, ladoMiniatura);
    renderer.setScissor(xMiniatura, yMiniatura, ladoMiniatura, ladoMiniatura);

    renderer.clear(true, true, true);
    renderer.render(escena, camaraCenital);
    renderer.setScissorTest(false);

    marcoMiniatura.style.width = `${ladoMiniatura}px`;
    marcoMiniatura.style.height = `${ladoMiniatura}px`;
    marcoMiniatura.style.left = `${xMiniatura}px`;
    marcoMiniatura.style.top = `${margen}px`;
}



// Redimensionar ventana

function redimensionar() {
    const ancho = window.innerWidth;
    const alto = window.innerHeight;

    camara.aspect = ancho / alto;
    camara.updateProjectionMatrix();
    renderer.setSize(ancho, alto);
}

window.addEventListener("resize", redimensionar);


// Inicio

aplicarParametros();
renderizar();

