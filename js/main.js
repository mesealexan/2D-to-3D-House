define(["three", "paper", "animate2D", "animate3D"], function(three, paper, animate2D, animate3D){
    var main = {};

    /***private fields***/
    var camFOV = 45;
    var width, height;
    var camNear = 1, camFar = 100;

    /***public functions***/
    
    main.InitPaper = function(){
        //animate2D.canvas = document.getElementById('paperCanvas');
        //paper.setup(animate2D.canvas);
        //addTestText();
        //paper.view.onFrame = animate2D.onFrame;
    };

    main.InitThree = function(){
        animate3D.scene = new THREE.Scene();
        var container = document.getElementById("webGL");
        width = container.clientWidth;
        height = container.clientHeight;
        addRenderer3D(container);
        addCamera3D();
        addLight3D();
        addTestCube();
        animate3D.Animate();
    };

    /***private functions***/
    function addRenderer3D(container){
        animate3D.renderer = new THREE.WebGLRenderer();
        animate3D.renderer.setSize( width, height );
        container.appendChild( animate3D.renderer.domElement );
    }

    function addCamera3D(){
        animate3D.camera = new THREE.PerspectiveCamera( camFOV, width / height, camNear, camFar );
        animate3D.scene.add(animate3D.camera);
    }

    function addLight3D(){
        animate3D.scene.add(new THREE.AmbientLight( 0x333333 ));
    }

    /***hello world functions***/
    function addTestText(){//paper
        animate2D.helloWorld = new paper.PointText({
            point: paper.view.center,
            content: 'Hello world!',
            fillColor: 'red',
            fontFamily: 'Courier New',
            fontWeight: 'bold',
            fontSize: 35
        });
    }

    function addTestCube(){//three
        var geometry = new THREE.BoxGeometry( 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {color: Math.random() * 0xffffff} );
        var cube = new THREE.Mesh( geometry, material );
        cube.position.z -= 10;
        cube.rotation.z = Math.random();
        animate3D.helloWorld = cube;
        animate3D.scene.add( cube );
    }

    return main;
});