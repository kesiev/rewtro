<?php

$out=[];
$files=scandir(getcwd());

for ($i=0;$i<count($files);$i++)
	if (substr($files[$i], -5)==".json") array_push($out, $files[$i]);

echo(json_encode($out));
