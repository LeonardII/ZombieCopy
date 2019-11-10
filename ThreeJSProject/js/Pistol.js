function Pistol() {
    var object = this;
    this.animations = [];
    this.mesh = null;
    this.mixer = null;
    this.raycaster = null;
    //The amount of available bullets which are inside the pistol.
    this.bulletsInChamber = 0;
    //The amount of available bullets which are NOT inside the pistol.
    this.bulletsStored = 0;
    this.reloadTimeRemaining = 0;
    this.timetoReload = 3;
    const magazineSize = 6;
    const cooldown = 0.4;

    var cooldownRemaining = 0;
    this.load = function (scene) {
        let loader = new THREE.GLTFLoader();
        loader.load('./models/Pistol.glb', function (gltf) {
            object.mesh = gltf.scene;
            object.mesh.children[0].material = new THREE.MeshStandardMaterial({
                roughness: 0.7,
                color: 0xffffff,
                metalness: 1
            });
            object.mesh.position.set(0, 1.7, -1.5);
            object.mesh.scale.set(0.33, 0.33, 0.33);

            scene.add(object.mesh);

            object.mixer = new THREE.AnimationMixer(object.mesh);
            object.animations = gltf.animations;

            object.raycaster = new THREE.Raycaster();

            object.bulletsInChamber = magazineSize;
            object.bulletsStored = magazineSize;
        }, undefined, function (e) {
            console.error(e);
        });
    }
    this.trytoReload = function () {
        if (this.bulletsInChamber < magazineSize && this.reloadTimeRemaining <= 0) {
            sfxReload.play();
            this.reloadTimeRemaining = this.timetoReload;
            return true;
        }
        return false;
    }
    this.update = function (timeDelta) {
        if (this.reloadTimeRemaining > 0) {
            this.reloadTimeRemaining -= timeDelta;
            //If reloading has been finished.
            if (this.reloadTimeRemaining <= 0) {
                if (this.bulletsStored >= magazineSize - this.bulletsInChamber) {
                    let delta = magazineSize - this.bulletsInChamber;
                    this.bulletsStored -= delta;
                    this.bulletsInChamber += delta;
                }
                else if (this.bulletsStored > 0) {
                    this.bulletsInChamber += this.bulletsStored;
                    this.bulletsStored = 0;
                }
                else {

                }
            }
        }
        if (cooldownRemaining > 0) {
            cooldownRemaining -= timeDelta;
        }
        if (object.mixer) {
            object.mixer.update(timeDelta);
        }
    }

    this.trytoShoot = function (camera, listofZombies) {
        let returnValue = false;
        if (cooldownRemaining <= 0 && this.reloadTimeRemaining <= 0 && this.bulletsInChamber > 0) {
            cooldownRemaining = cooldown;
            this.bulletsInChamber--;

            sfxGun1.play();

            let directionCamera = new THREE.Vector3(0, 0, 0);
            camera.getWorldDirection(directionCamera);
            //RAYCASTING
            object.raycaster.set(camera.position, directionCamera);
            for (let i = 0; i < listofZombies.length; i++) {
                for (let j = 0; j < listofZombies[i].length; j++) {
                    let array = [listofZombies[i][j].mesh];
                    let intersects = object.raycaster.intersectObjects(array, true);
                    if (intersects.length > 0) {
                        returnValue = true;
                        intersects[0].object.material.color.set(0xff0000);
                        let killed = listofZombies[i][j].die();
                        if ( killed ) {
                            object.bulletsStored +=2;
                        }
                    }
                }
            }
            //ANIMATIONS
            let animation = object.mixer.clipAction(object.animations[0]);
            animation.setLoop(THREE.LoopOnce);
            animation.clampWhenFinished = true;
            animation.enable = true;

            animation.play().reset();

            let animation2 = object.mixer.clipAction(object.animations[1]);
            animation2.setLoop(THREE.LoopOnce);
            animation2.clampWhenFinished = true;
            animation2.enable = true;

            animation2.play().reset();

            //RECOIL
            let target = new THREE.Vector3(camera.position.x + directionCamera.x, camera.position.y + directionCamera.y, camera.position.z + directionCamera.z)
            camera.lookAt(new THREE.Vector3(target.x + Math.random() * 0.005, target.y + Math.random() * 0.2, target.z + Math.random() * 0.005));

            if (this.bulletsInChamber == 0) {
                this.trytoReload();
            }
        }
        return returnValue;
    }
}