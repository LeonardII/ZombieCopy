function Zombie(listener) {
    var object = this;
    
    this.wait = 0;
    this.animations = [];
    this.mesh = null;
    this.mixer = null;

    this.dead = false;
    this.attacking = false;

    this.sound = new THREE.PositionalAudio( listener );
    
    this.despawnTime;

    this.load = function()  {
        var loader = new THREE.GLTFLoader();
        loader.load( './models/zombie1/scene.gltf', function ( gltf ) {
            object.mesh = gltf.scene;
            object.mesh.scale.set(0.01,0.01,0.01);
            object.mesh.children[0].material = new THREE.MeshStandardMaterial({
                roughness: 0.1,
                color: 0xffffff
            });
                         
            object.animations = gltf.animations;

            var audioLoader = new THREE.AudioLoader();
            
            let random = Math.floor(Math.random() * 8); //choose Random sound
            let soundName;
            switch(random){
                case 0: soundName = 'zombieSound1.mp3'; break;
                case 1: soundName = 'zombieSound2.mp3'; break;
                case 2: soundName = 'zombieSound3.mp3'; break;
                case 3: soundName = 'zombieSound4.mp3'; break;
                case 4: soundName = 'zombieSound5.mp3'; break;
                case 5: soundName = 'zombieSound6.mp3'; break;
                case 6: soundName = 'zombieSound7.mp3'; break;
                case 7: soundName = 'zombieSound8.mp3'; break;
                case 8: soundName = 'zombieSound9.mp3'; break;
            }
            audioLoader.load( 'sounds/zombie/'+soundName, function( buffer ) {
                object.sound.setBuffer( buffer );
                object.sound.setRefDistance( 3 );
                object.mesh.add(object.sound);
            });

        }, undefined, function ( e ) {
            console.error( e );
        } );

        
    }
    this.spawn = function(scene,startPosition, walkDirection, running)
    {
        object.startPosition = startPosition.clone();
        object.running = running;
        walkDirection.normalize();
        if(running){
            object.walkDirection = walkDirection.multiplyScalar(0.07);
        }else{
            object.walkDirection = walkDirection.multiplyScalar(0.01);
        }
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
        object.mixer.clipAction( object.animations[0] ).play();
    }
    this.die = function()
    {
        if(!object.dead){
            score ++;
            object.dead = true;
            object.mixer.stopAllAction();
            var animation;
            
            if (Math.random() < 0.3){
                animation = object.mixer.clipAction( object.animations[2] );//Zombie fällt nach vorne
            }else{
                animation = object.mixer.clipAction( object.animations[1] );//Zombie fällt nach hinten
            }
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
                if(Math.random() < timeDelta * 0.1){ //alle ~10 Sekunden ein Sound
                    object.sound.play(); 
                }
            }
        }
    }
}