define(["three"], function(three){
    var animate3D = {
        camera: undefined,
        renderer: undefined,
        scene: undefined,
        frameID : undefined
    };

    animate3D.Animate = function(){
        animate3D.helloWorld.rotation.z += Math.PI / 200;
        animate3D.renderer.render(animate3D.scene, animate3D.camera);
        animate3D.frameID = requestAnimationFrame(animate3D.Animate);
    };

    animate3D.StopAnimating = function(){ cancelAnimationFrame(animate3D.frameID); };

    return animate3D;
});