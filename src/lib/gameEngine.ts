import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export interface GameObject {
  id: string;
  mesh: THREE.Object3D;
  body?: CANNON.Body;
  update: (deltaTime: number) => void;
  dispose: () => void;
}

export class GameEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private world: CANNON.World;
  private gameObjects: Map<string, GameObject> = new Map();
  private clock: THREE.Clock = new THREE.Clock();
  private isRunning = false;
  private animationId: number | null = null;

  constructor(canvas: HTMLCanvasElement) {
    // Initialize Three.js scene
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    this.renderer = new THREE.WebGLRenderer({ 
      canvas, 
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    // Initialize Cannon.js physics world
    this.world = new CANNON.World({
      gravity: new CANNON.Vec3(0, 0, 0) // No gravity in space
    });
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.defaultContactMaterial.friction = 0.1;
    this.world.defaultContactMaterial.restitution = 0.7;

    // Set up initial camera position
    this.camera.position.set(0, 5, 10);
    this.camera.lookAt(0, 0, 0);

    // Add basic lighting
    this.setupLighting();

    // Add space environment
    this.setupEnvironment();

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
  }

  private setupLighting() {
    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    this.scene.add(ambientLight);

    // Directional light (sun-like)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(50, 50, 50);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 200;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    this.scene.add(directionalLight);

    // Point lights for dynamic lighting
    const pointLight1 = new THREE.PointLight(0x00ff88, 0.5, 100);
    pointLight1.position.set(-20, 10, -20);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x8800ff, 0.5, 100);
    pointLight2.position.set(20, -10, 20);
    this.scene.add(pointLight2);
  }

  private setupEnvironment() {
    // Create starfield background
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1,
      transparent: true,
      opacity: 0.8
    });

    const starsVertices = [];
    for (let i = 0; i < 10000; i++) {
      const x = (Math.random() - 0.5) * 2000;
      const y = (Math.random() - 0.5) * 2000;
      const z = (Math.random() - 0.5) * 2000;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starsVertices, 3));
    const starField = new THREE.Points(starsGeometry, starsMaterial);
    this.scene.add(starField);

    // Add nebula-like background
    const nebulaMaterial = new THREE.MeshBasicMaterial({
      color: 0x220066,
      transparent: true,
      opacity: 0.1
    });
    const nebulaGeometry = new THREE.SphereGeometry(500, 32, 32);
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    this.scene.add(nebula);
  }

  private handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  public addGameObject(gameObject: GameObject) {
    this.gameObjects.set(gameObject.id, gameObject);
    this.scene.add(gameObject.mesh);
    
    if (gameObject.body) {
      this.world.addBody(gameObject.body);
    }
  }

  public removeGameObject(id: string) {
    const gameObject = this.gameObjects.get(id);
    if (gameObject) {
      this.scene.remove(gameObject.mesh);
      if (gameObject.body) {
        this.world.removeBody(gameObject.body);
      }
      gameObject.dispose();
      this.gameObjects.delete(id);
    }
  }

  public getGameObject(id: string): GameObject | undefined {
    return this.gameObjects.get(id);
  }

  public start() {
    this.isRunning = true;
    this.clock.start();
    this.gameLoop();
  }

  public stop() {
    this.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public pause() {
    this.isRunning = false;
  }

  public resume() {
    this.isRunning = true;
    this.clock.start();
    this.gameLoop();
  }

  private gameLoop() {
    if (!this.isRunning) return;

    const deltaTime = this.clock.getDelta();
    
    // Update physics
    this.world.step(1 / 60, deltaTime, 3);

    // Update all game objects
    for (const gameObject of this.gameObjects.values()) {
      gameObject.update(deltaTime);
      
      // Sync physics body with mesh
      if (gameObject.body && gameObject.mesh) {
        gameObject.mesh.position.copy(gameObject.body.position as any);
        gameObject.mesh.quaternion.copy(gameObject.body.quaternion as any);
      }
    }

    // Render the scene
    this.renderer.render(this.scene, this.camera);

    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  public getScene(): THREE.Scene {
    return this.scene;
  }

  public getCamera(): THREE.PerspectiveCamera {
    return this.camera;
  }

  public getRenderer(): THREE.WebGLRenderer {
    return this.renderer;
  }

  public getPhysicsWorld(): CANNON.World {
    return this.world;
  }

  public dispose() {
    this.stop();
    
    // Dispose all game objects
    for (const gameObject of this.gameObjects.values()) {
      gameObject.dispose();
    }
    this.gameObjects.clear();

    // Dispose renderer
    this.renderer.dispose();
    
    // Remove event listeners
    window.removeEventListener('resize', this.handleResize);
  }
}