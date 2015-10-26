require.config({
    paths: {
        "three" : "../bower_components/three.js/build/three",
        "paper" : "../bower_components/paper/dist/paper-full",
        "main" : "main",
        "animate2D" : "animate2D",
        "animate3D" : "animate3D"
    }
    ,
    shim: {}
});

requirejs(["main"], function(main){
    main.InitPaper();
    //main.InitThree();
});