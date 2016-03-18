var es6 = require('es6-shim');
var Promise = require('bluebird');

//promise html image
function getImage(url) {
		return new Promise(function (resolve, reject) {
			var image = new Image();
			image.src = url;
			image.onload = function() {
				resolve(image);
			};
      image.onerror = function(e) {
      	resolve(e);
      }
		});
}

//a task is a promise returning function (needed to avoid the promise to proceed immediately)
var tasks = [
	()=>getImage("http://www.free-emoticons.com/files/funny-emoticons/7279.png"),
	()=>getImage("http://www.free-emoticons.com/files/funny-emoticons/7278.png"),
	()=>getImage("http://www.free-emoticons.com/files/funny-emoticons/7277.png"),
	()=>getImage("http://www.free-emoticons.com/files/funny-emoticons/7276.png"),
	()=>getImage("http://www.free-emoticons.com/files/funny-emoticons/7275.png"),
	()=>getImage("http://www.free-emoticons.com/files/funny-emoticons/7274.png"),
	()=>getImage("http://www.free-emoticons.com/files/funny-emoticons/7273.png"),
	()=>getImage("http://www.free-emoticons.com/files/funny-emoticons/7272.png"),
	()=>getImage("http://www.free-emoticons.com/files/funny-emoticons/7271.png"),
	()=>getImage("http://www.free-emoticons.com/files/funny-emoticons/7270.png")
];

//queue returns a promise returning function. tasks is an array of promise returning functions, and concurrent
//is the max. number of tasks to be executed in parallel
function queue(tasks, concurrent) {
	return function() {
    var result = new Array(tasks.length);
    var running = 0;
    var pending = tasks.length;
    var cursor = 0;

    function next(onDone, onError) {
			if (cursor < tasks.length && running < concurrent) {
        let index = cursor;
        ++cursor;
        ++running;

				function save(v) {
          result[index] = v;
          --running;
          --pending;
          if (pending === 0)
          	onDone(result);
          else
          	next(onDone, onError);
          return v;
        }

				//execute task/resolve promise, and save result
        tasks[index]().then(save, save);

				//load next task
        next(onDone, onError);
      }
    }

    return new Promise(function(resolve, reject) {
      next(function(result) {
        resolve(result);
      }, reject);
    });
	}
}

module.exports = queue;


//create queue of images to load (max. 5 simultaneously)
//var loadimages = queue(tasks, 5);

/*
//note that every queue is a promise returning function, ergo a task!
//for that queues can be composed to other queues, each with an individual
//setting for concurrency, ultimatively allowing to describe complex sequences of
//async procedures easily.

var transformimages = queue(transformtasks, 1);
var sequence = queue([loadimages, transformimages], 1)
/* */

//invoke queue sequence
/*
loadimages().then(function(result) {
	result.forEach(function(elem) {
  	if(elem instanceof Image)
    	document.body.appendChild(elem);
    console.log(elem);
  })
}).catch(function(e) { console.log(e) });
/* */
