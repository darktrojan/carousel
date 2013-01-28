<?

$imagePath = '../images';
$order = json_decode(file_get_contents($imagePath.'/order.json'));

$dirHandle = opendir($imagePath);
while ($file = readdir($dirHandle)) {
	if (preg_match('/\.(jpg|png)$/', $file) && !in_array($file, $order)) {
		unlink($imagePath.'/'.$file);
	}
}
closedir($dirHandle);
