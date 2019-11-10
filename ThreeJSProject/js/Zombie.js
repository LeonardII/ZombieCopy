function Zombie(startPosition, walkDirection, running, controller) {
    var object = this;
    //this.controller = controller;
    this.startPosition = startPosition.clone();
    this.running = running;
    walkDirection.normalize();
    if(running){
        this.walkDirection = walkDirection.multiplyScalar(0.07);
    }else{
        this.walkDirection = walkDirection.multiplyScalar(0.01);
    }
    this.wait = 0;
    this.animations = [];
    this.mesh = null;
    this.mixer = null;

    this.dead = false;
    this.attacking = false;


    this.despawnTime;

    this.load = function(scene)  {
        var loader = new THREE.GLTFLoader();
        loader.load( './models/zombie1/scene.gltf', function ( gltf ) {
            object.mesh = gltf.scene;
            object.mesh.scale.set(0.01,0.01,0.01);
            object.mesh.children[0].material = new THREE.MeshStandardMaterial({
                roughness: 0.1,
                color: 0xffffff
            });
            let modelOrientation = new THREE.Vector3(0,0,-1);
            if(object.walkDirection.x <= 0){
                object.mesh.rotation.y = modelOrientation.angleTo(object.walkDirection) + Math.PI;  
            }else{
                object.mesh.rotation.y = -modelOrientation.angleTo(object.walkDirection) + Math.PI;  
            }
            
            object.wait = Math.random()*10.0 + 5.0;
                         
            object.mesh.position.x = object.startPosition.x;
            object.mesh.position.y = object.startPosition.y;
            object.mesh.position.z = object.startPosition.z;
            scene.add(object.mesh);

            object.mixer = new THREE.AnimationMixer( object.mesh );
            object.mixer.clipAction( gltf.animations[0] ).play();
            object.animations = gltf.animations;
        }, undefined, function ( e ) {
            console.error( e );
        } );
    }
    this.die = function()
    {
        if(!object.dead){
            score ++;
            object.dead = true;
            object.mixer.stopAllAction();
            var animation = object.mixer.clipAction( object.animations[1] );
            animation.setLoop( THREE.LoopOnce );
            animation.clampWhenFinished = true;
            animation.enable = true;
            object.despawnTime = 5 + timeFixed;
            animation.play();
            return true;
        }
        return false;
    }
    this.canDespawn = function(timeFixed)
    {
        //console.log(object.dead, object.despawnTime, timeFixed);
        return object.dead && object.despawnTime && object.despawnTime < timeFixed;
    }
    this.update = function(timeDelta) {
        if ( object.mixer ) {
            object.mixer.update(timeDelta );
        
            if(object.mesh && !object.dead){ 
                if(object.wait != -1){
                    if(object.wait>0){
                        object.wait -= timeDelta;
                        object.mixer.clipAction( object.animations[0] ).play();
                    }else{
                        object.mixer.stopAllAction();
                        if(object.running){
                            object.mixer.clipAction( object.animations[5] ).play();
                        }else{
                            object.mixer.clipAction( object.animations[9] ).play();
                        }
                        object.wait = -1;
                    }
                }else{
                    if (object.mesh.position.length() > 1) {
                        object.mesh.position.x += (object.walkDirection.x);
                        object.mesh.position.y += (object.walkDirection.y);
                        object.mesh.position.z += (object.walkDirection.z);
                    }else{
                        object.mixer.clipAction( object.animations[0] ).play();
                        object.attacking = true;
                    }
                }   
            }
        }
    }
}