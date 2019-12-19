<?php

// A quick and dirty way to create a working Offline Application worker :)

header('Content-Type: text/javascript');

?>

var CACHE = 'rewtro-cache';
var precacheFiles =

<?php

function getDirContents($dir, &$results = array()){
    $files = scandir($dir);

    foreach($files as $key => $value){
        $path = realpath($dir.DIRECTORY_SEPARATOR.$value);
        if(!is_dir($path)) {
            $results[] = $path;
        } else if($value != "." && $value != "..") {
            getDirContents($path, $results);
        }
    }

    return $results;
}

$path=realpath("libs");

$files=getDirContents($path);
$out=[];

for ($i=0;$i<count($files);$i++) {
  $filename=substr($files[$i],strlen($path));
  if ($filename[0]==DIRECTORY_SEPARATOR) $filename=substr($filename, 1);
    $filename="libs/".str_replace("\\","/",$filename);
    array_push($out,$filename);
  
}

echo json_encode($out);

?>

;
self.addEventListener('install', function(evt) {
  evt.waitUntil(precache().then(function() {
      return self.skipWaiting();
  })
  );
});


self.addEventListener('activate', function(event) {
      return self.clients.claim();
});

self.addEventListener('fetch', function(evt) {
  evt.respondWith(fromCache(evt).catch(fromServer(evt.request)));
  evt.waitUntil(update(evt.request));
});


function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll(precacheFiles);
  });
}

function fromCache(evt) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(evt.request).then(function (matching) {
      return matching || fetch(evt.request).then(function(response) {
          cache.put(evt.request, response.clone());
          return response;
        });
    });
  });
}

function update(request) {
  return caches.open(CACHE).then(function (cache) {
    return fetch(request).then(function (response) {
      return cache.put(request, response);
    });
  });
}

function fromServer(request){
	return fetch(request).then(function(response){ return response})
}