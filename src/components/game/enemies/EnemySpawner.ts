import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { GameEngine, GameObject } from '@/lib/gameEngine';

export class EnemySpawner {
  private engine: GameEngine;
  private enemies: Enemy[] = [];
  private spawnTimer = 0;
  private spawnRate = 2; // seconds between spawns
  private maxEnemies = 10;

  constructor(engine: GameEngine) {
    this.engine = engine;
  }

  public update(deltaTime: number) {
    this.spawnTimer += deltaTime;

    // Spawn new enemy if conditions are met
    if (this.spawnTimer >= this.spawnRate && this.enemies.length < this.maxEnemies) {
      this.spawnEnemy();
      this.spawnTimer = 0;
    }

    // Update all enemies
    this.enemies.forEach(enemy => enemy.update(deltaTime));

    // Remove dead enemies
    this.enemies = this.enemies.filter(enemy => {
      if (enemy.shouldRemove()) {
        enemy.dispose();
        return false;
      }
      return true;
    });
  }

  private spawnEnemy() {
    const enemy = new Enemy(this.engine);
    this.enemies.push(enemy);
  }

  public getEnemies(): Enemy[] {
    return this.enemies;
  }

  public dispose() {
    this.enemies.forEach(enemy => enemy.dispose());
    this.enemies = [];
  }
}

class Enemy {
  private engine: GameEngine;
  private gameObject: GameObject;
  private health = 50;
  private speed = 8;
  private lifetime = 30; // seconds before auto-removal
  private target = new THREE.Vector3(0, 0, 0); // Target player position
  private lastShotTime = 0;
  private fireRate = 1500; // milliseconds between shots

  constructor(engine: GameEngine) {
    this.engine = engine;
    this.gameObject = this.createEnemyShip();
    this.engine.addGameObject(this.gameObject);
    this.setRandomSpawnPosition();
  }

  private createEnemyShip(): GameObject {
    const enemyGroup = new THREE.Group();

    // Main body - more angular, hostile looking
    const bodyGeometry = new THREE.OctahedronGeometry(0.6);
    const bodyMaterial = new THREE.MeshPhongMaterial({
      color: 0xff4444,
      shininess: 50,
      transparent: true,
      opacity: 0.9
    });
    const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
    bodyMesh.castShadow = true;
    bodyMesh.receiveShadow = true;

    // Weapon pods
    const weaponGeometry = new THREE.CylinderGeometry(0.1, 0.15, 0.8);
    const weaponMaterial = new THREE.MeshPhongMaterial({
      color: 0x664444,
      shininess: 30
    });

    const leftWeapon = new THREE.Mesh(weaponGeometry, weaponMaterial);
    leftWeapon.position.set(-0.5, 0, 0.5);
    leftWeapon.rotation.x = Math.PI / 2;

    const rightWeapon = leftWeapon.clone();
    rightWeapon.position.set(0.5, 0, 0.5);

    // Engine glow (hostile red)
    const engineGeometry = new THREE.SphereGeometry(0.2);
    const engineMaterial = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0x440000,
      transparent: true,
      opacity: 0.7
    });

    const engine = new THREE.Mesh(engineGeometry, engineMaterial);
    engine.position.set(0, 0, -0.8);

    enemyGroup.add(bodyMesh, leftWeapon, rightWeapon, engine);

    // Create physics body
    const shape = new CANNON.Sphere(0.8);
    const body = new CANNON.Body({ mass: 1 });
    body.addShape(shape);
    body.material = new CANNON.Material('enemy');

    return {
      id: `enemy-${Math.random()}`,
      mesh: enemyGroup,
      body,
      update: (deltaTime: number) => {
        this.updateBehavior(deltaTime);
      },
      dispose: () => {
        enemyGroup.traverse((child) => {
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

  private setRandomSpawnPosition() {
    if (!this.gameObject.body) return;

    const spawnDistance = 30;
    const angle = Math.random() * Math.PI * 2;
    
    this.gameObject.body.position.set(
      Math.cos(angle) * spawnDistance,
      (Math.random() - 0.5) * 10,
      Math.sin(angle) * spawnDistance
    );
  }

  private updateBehavior(deltaTime: number) {
    if (!this.gameObject.body) return;

    this.lifetime -= deltaTime;

    // Get player position (assuming player is at origin for now)
    const playerObject = this.engine.getGameObject('player');
    if (playerObject) {
      this.target.copy(playerObject.mesh.position);
    }

    // AI behavior: Move toward player
    const currentPos = new THREE.Vector3().copy(this.gameObject.body.position as any);
    const direction = this.target.clone().sub(currentPos).normalize();

    // Apply movement
    this.gameObject.body.velocity.x = direction.x * this.speed;
    this.gameObject.body.velocity.y = direction.y * this.speed * 0.5; // Less vertical movement
    this.gameObject.body.velocity.z = direction.z * this.speed;

    // Rotate to face movement direction
    this.gameObject.mesh.lookAt(this.target);

    // Shooting behavior
    const distanceToTarget = currentPos.distanceTo(this.target);
    if (distanceToTarget < 15 && this.canShoot()) {
      this.shoot();
    }

    // Add some rotation for visual appeal
    this.gameObject.mesh.rotation.y += deltaTime * 2;
  }

  private canShoot(): boolean {
    const now = Date.now();
    return now - this.lastShotTime > this.fireRate;
  }

  private shoot() {
    if (!this.gameObject.body) return;

    new EnemyProjectile(
      this.engine,
      new THREE.Vector3().copy(this.gameObject.mesh.position),
      this.target.clone()
    );

    this.lastShotTime = Date.now();
  }

  public takeDamage(amount: number) {
    this.health -= amount;
    
    // Visual feedback for taking damage
    const group = this.gameObject.mesh as THREE.Group;
    const firstMesh = group.children[0] as THREE.Mesh;
    if (firstMesh && firstMesh.material) {
      const material = firstMesh.material as THREE.MeshPhongMaterial;
      const originalColor = material.color.clone();
      material.color.setHex(0xffffff); // Flash white
      
      setTimeout(() => {
        material.color.copy(originalColor);
      }, 100);
    }
  }

  public shouldRemove(): boolean {
    return this.health <= 0 || this.lifetime <= 0;
  }

  public update(_deltaTime: number) {
    // This method is called by the spawner
    // The actual update logic is in the gameObject.update callback
  }

  public dispose() {
    this.engine.removeGameObject(this.gameObject.id);
  }
}

class EnemyProjectile {
  private engine: GameEngine;
  private gameObject: GameObject;
  private lifetime = 5; // seconds
  private speed = 25;

  constructor(engine: GameEngine, startPosition: THREE.Vector3, targetPosition: THREE.Vector3) {
    this.engine = engine;
    this.gameObject = this.createProjectile(startPosition, targetPosition);
    this.engine.addGameObject(this.gameObject);
  }

  private createProjectile(startPosition: THREE.Vector3, targetPosition: THREE.Vector3): GameObject {
    const geometry = new THREE.SphereGeometry(0.08);
    const material = new THREE.MeshPhongMaterial({
      color: 0xff0000,
      emissive: 0x220000,
      transparent: true,
      opacity: 0.8
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(startPosition);

    // Create physics body
    const shape = new CANNON.Sphere(0.08);
    const body = new CANNON.Body({ mass: 0.05 });
    body.addShape(shape);
    body.position.copy(startPosition as any);

    // Calculate and set velocity toward target
    const direction = targetPosition.sub(startPosition).normalize();
    body.velocity.set(
      direction.x * this.speed,
      direction.y * this.speed,
      direction.z * this.speed
    );

    return {
      id: `enemy-projectile-${Math.random()}`,
      mesh,
      body,
      update: (deltaTime: number) => {
        this.lifetime -= deltaTime;
        if (this.lifetime <= 0) {
          this.engine.removeGameObject(this.gameObject.id);
        }
      },
      dispose: () => {
        geometry.dispose();
        material.dispose();
      }
    };
  }
}