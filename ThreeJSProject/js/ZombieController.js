function ZombieController() {
    var object = this;

    //One way is held free until a zombie runs down
    var runningLane = 0;

    var spawnPoints = new Array(4);
    spawnPoints[0] = new THREE.Vector3(0, 0, 30);
    spawnPoints[1] = new THREE.Vector3(30, 0, 0);
    spawnPoints[2] = new THREE.Vector3(0, 0, -30);
    spawnPoints[3] = new THREE.Vector3(-30, 0, 0);


    this.lastZombieSpawnTime = 1;

    this.zombies = new Array(4);
    this.zombies[0] = [];
    this.zombies[1] = [];
    this.zombies[2] = [];
    this.zombies[3] = [];

    this.loadedZombies = new Array(25); //max of zombies 


    this.load = function(listener)  {
        for(let i = 0; i < object.loadedZombies.length ; i++) {
            object.loadedZombies[i] = new Zombie(listener);
            object.loadedZombies[i].load();
        }
    }


    this.update = function(timeDelta, timeFixed, scene)  {
        //spawn zombies
        if(object.lastZombieSpawnTime + calculateDeltaZombieSpawnTime(timeFixed) < timeFixed)
        {
            //Random spawnpoint of Zombie
            let random = Math.floor(Math.random() * 4); 
            console.log("random",random);
            if(random != runningLane){
                spawnZombie(random, false);
            }else{
                spawnZombie(random, true);
                runningLane = Math.floor(Math.random() * 4);
            }
            object.lastZombieSpawnTime = timeFixed;
        }

        for(let l = 0; l < object.zombies.length; l++){
            for(let i = object.zombies[l].length-1; i>=0; i--){
                object.zombies[l][i].update(timeDelta);
                if(object.zombies[l][i].canDespawn(timeFixed)){
                    scene.remove(object.zombies[l][i]);
                    let z = object.zombies[l].splice(i, 1)[0];
                    object.loadedZombies.push(z);
                    console.log("loadedzombies: ",object.loadedZombies.length);
                }
            }
        }
    }
    this.getZombies = function()
    {
        return object.zombies;
    }

    function spawnZombie(lane, running){
        console.log("loadedzombies: ",object.loadedZombies.length);
        let direction = new THREE.Vector3(0,0,-1);
        direction.applyAxisAngle(new THREE.Vector3(0,1,0), Math.PI/2*lane);
        let z = object.loadedZombies.pop();
        console.log(z);
        if(!z) console.log("EROORRRRRRRR");
        z.spawn(scene,spawnPoints[lane],direction,running);
        object.zombies[lane].push(z);
    }

    function calculateDeltaZombieSpawnTime(timeFixed)
    {
        return  350/(timeFixed+30)+1;
    }

    this.isAttacking = function()
    {
        let b = false;
        object.zombies.forEach(function(zombieList) {
            zombieList.forEach(function(z) {
                if(z.attacking && !z.dead){
                    b = true;
                }
            });
        });
        return b;
    }
    
    function doesZombieHitPlayer(player)
    {
        object.zombies.forEach(function(zombieList) {
            zombieList.forEach(function(z) {
                z.update(timeDelta);
            });
        });
        return false;
    }
}