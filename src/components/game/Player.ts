import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameEngine, GameObject } from '@/lib/gameEngine';

export class Player {
  private engine: GameEngine;
  private gameObject: GameObject;
  private velocity = new THREE.Vector3();
  private keys: { [key: string]: boolean } = {};
  private mouse = new THREE.Vector2();

  
  private weapons: Weapon[] = [];
  private lastShotTime = 0;
  private fireRate = 200; // milliseconds between shots

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.gameObject = this.createPlayerShip();
    this.engine.addGameObject(this.gameObject);
    
    this.setupControls();
    this.initializeWeapons();
  }

  private createPlayerShip(): GameObject {
    // Create ship geometry - sleek spaceship design
    const shipGroup = new THREE.Group();
    
    // Main body
    const bodyGeometry = new THREE.ConeGeometry(0.5, 3, 8);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x4a90e2,
      shininess: 100,
      transparent: true,
      opacity: 0.9
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.rotation.x = Math.PI / 2;
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;
    
    // Wings
    const wingGeometry = new THREE.BoxGeometry(2.5, 0.1, 1);
    const wingMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x357abd,
      shininess: 80
    });
    const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
    leftWing.position.set(0, -0.5, -0.5);
    leftWing.castShadow = true;
    
    const rightWing = leftWing.clone();
    rightWing.position.set(0, 0.5, -0.5);
    
    // Engine glow effects
    const engineGeometry = new THREE.CylinderGeometry(0.2, 0.3, 0.8);
    const engineMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x00ffff,
      emissive: 0x004444,
      transparent: true,
      opacity: 0.8
    });
    
    const leftEngine = new THREE.Mesh(engineGeometry, engineMaterial);
    leftEngine.position.set(-0.8, 0, -1.5);
    leftEngine.rotation.x = Math.PI / 2;
    
    const rightEngine = leftEngine.clone();
    rightEngine.position.set(0.8, 0, -1.5);
    
    shipGroup.add(bodyMesh, leftWing, rightWing, leftEngine, rightEngine);
    
    // Add particle system for engine trail
    this.addEngineTrail(shipGroup);

    // Create physics body
    const shape = new CANNON.Box(new CANNON.Vec3(1, 1, 1.5));
    const body = new CANNON.Body({ mass: 1 });
    body.addShape(shape);
    body.position.set(0, 0, 0);
    body.material = new CANNON.Material('player');

    return {
      id: 'player',
      mesh: shipGroup,
      body,
      update: (deltaTime: number) => {
        this.update(deltaTime);
      },
      dispose: () => {
        shipGroup.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => mat.dispose());
            } else {
              child.material.dispose();
            }
          }
        });
      }
    };
  }

  private addEngineTrail(shipGroup: THREE.Group) {
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.PointsMaterial({
      color: 0x00ffff,
      size: 0.1,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });

    const trailVertices = [];
    for (let i = 0; i < 50; i++) {
      trailVertices.push(0, 0, 0);
    }

    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailVertices, 3));
    const trail = new THREE.Points(trailGeometry, trailMaterial);
    shipGroup.add(trail);

    // Store reference for trail updates
    (shipGroup as any).engineTrail = trail;
  }

  private setupControls() {
    // Keyboard controls
    document.addEventListener('keydown', (event) => {
      this.keys[event.code] = true;
      
      // Shooting
      if (event.code === 'Space') {
        event.preventDefault();
        this.shoot();
      }
    });

    document.addEventListener('keyup', (event) => {
      this.keys[event.code] = false;
    });

    // Mouse controls for aiming
    document.addEventListener('mousemove', (event) => {
      this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    document.addEventListener('click', (event) => {
      event.preventDefault();
      this.shoot();
    });
  }

  private initializeWeapons() {
    this.weapons.push(new Weapon('laser', this.engine));
  }

  private update(deltaTime: number) {
    if (!this.gameObject.body) return;

    const moveSpeed = 15;

    // Reset velocity
    this.velocity.set(0, 0, 0);

    // Movement controls
    if (this.keys['KeyW'] || this.keys['ArrowUp']) {
      this.velocity.z -= moveSpeed;
    }
    if (this.keys['KeyS'] || this.keys['ArrowDown']) {
      this.velocity.z += moveSpeed;
    }
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.velocity.x -= moveSpeed;
    }
    if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.velocity.x += moveSpeed;
    }

    // Apply movement
    this.gameObject.body.velocity.x = this.velocity.x;
    this.gameObject.body.velocity.y = this.velocity.y;
    this.gameObject.body.velocity.z = this.velocity.z;

    // Rotation based on movement for visual flair
    if (this.velocity.x !== 0) {
      this.gameObject.mesh.rotation.z = -this.velocity.x * 0.1;
    } else {
      this.gameObject.mesh.rotation.z *= 0.9; // Smooth return to center
    }

    // Keep player within bounds
    const bounds = 25;
    if (this.gameObject.body.position.x > bounds) this.gameObject.body.position.x = bounds;
    if (this.gameObject.body.position.x < -bounds) this.gameObject.body.position.x = -bounds;
    if (this.gameObject.body.position.z > bounds) this.gameObject.body.position.z = bounds;
    if (this.gameObject.body.position.z < -bounds) this.gameObject.body.position.z = -bounds;

    // Update camera to follow player
    const camera = this.engine.getCamera();
    const playerPos = this.gameObject.mesh.position;
    
    camera.position.lerp(
      new THREE.Vector3(playerPos.x, playerPos.y + 8, playerPos.z + 12),
      deltaTime * 2
    );
    camera.lookAt(playerPos.x, playerPos.y, playerPos.z - 5);

    // Update engine trail effect
    this.updateEngineTrail();

    // Update weapons
    this.weapons.forEach(weapon => weapon.update(deltaTime));
  }

  private updateEngineTrail() {
    const trail = (this.gameObject.mesh as any).engineTrail;
    if (!trail) return;

    const positions = trail.geometry.attributes.position.array;
    
    // Shift existing trail points back
    for (let i = positions.length - 3; i >= 3; i -= 3) {
      positions[i] = positions[i - 3];
      positions[i + 1] = positions[i - 2];
      positions[i + 2] = positions[i - 1];
    }

    // Add new trail point at ship position
    const shipPos = this.gameObject.mesh.position;
    positions[0] = shipPos.x;
    positions[1] = shipPos.y;
    positions[2] = shipPos.z - 2;

    trail.geometry.attributes.position.needsUpdate = true;
  }

  private shoot() {
    const now = Date.now();
    if (now - this.lastShotTime < this.fireRate) return;

    this.weapons.forEach(weapon => {
      weapon.fire(this.gameObject.mesh.position, this.gameObject.mesh.rotation);
    });

    this.lastShotTime = now;
  }

  public takeDamage(amount: number) {
    // Implement damage logic here
    console.log(`Player took ${amount} damage`);
  }

  public dispose() {
    this.gameObject.dispose();
    this.weapons.forEach(weapon => weapon.dispose());
  }
}

class Weapon {
  private engine: GameEngine;
  private projectiles: Projectile[] = [];

  constructor(type: string, engine: GameEngine) {
    this.engine = engine;
  }

  fire(position: THREE.Vector3, rotation: THREE.Euler) {
    const projectile = new Projectile(this.engine, position.clone(), rotation);
    this.projectiles.push(projectile);

    // Clean up old projectiles
    this.projectiles = this.projectiles.filter(p => !p.shouldRemove());
  }

  update(deltaTime: number) {
    this.projectiles.forEach(projectile => projectile.update(deltaTime));
    this.projectiles = this.projectiles.filter(p => !p.shouldRemove());
  }

  dispose() {
    this.projectiles.forEach(p => p.dispose());
    this.projectiles = [];
  }
}

class Projectile {
  private engine: GameEngine;
  private gameObject: GameObject;
  private lifetime = 3; // seconds
  private speed = 50;

  constructor(engine: GameEngine, position: THREE.Vector3, rotation: THREE.Euler) {
    this.engine = engine;
    this.gameObject = this.createProjectile(position, rotation);
    this.engine.addGameObject(this.gameObject);
  }

  private createProjectile(position: THREE.Vector3, rotation: THREE.Euler): GameObject {
    const geometry = new THREE.SphereGeometry(0.1);
    const material = new THREE.MeshPhongMaterial({ 
      color: 0x00ff00,
      emissive: 0x004400,
      transparent: true,
      opacity: 0.9
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.position.z -= 1; // Start in front of ship

    // Create physics body
    const shape = new CANNON.Sphere(0.1);
    const body = new CANNON.Body({ mass: 0.1 });
    body.addShape(shape);
    body.position.copy(position as any);
    body.position.z -= 1;

    // Set initial velocity
    const direction = new THREE.Vector3(0, 0, -1);
    direction.applyEuler(rotation);
    body.velocity.set(
      direction.x * this.speed,
      direction.y * this.speed,
      direction.z * this.speed
    );

    return {
      id: `projectile-${Math.random()}`,
      mesh,
      body,
      update: (deltaTime: number) => {
        this.lifetime -= deltaTime;
      },
      dispose: () => {
        geometry.dispose();
        material.dispose();
      }
    };
  }

  update(deltaTime: number) {
    this.lifetime -= deltaTime;
  }

  shouldRemove(): boolean {
    return this.lifetime <= 0;
  }

  dispose() {
    this.engine.removeGameObject(this.gameObject.id);
  }
}