<html>
<head>
<link rel="stylesheet" href="show.css" />
</head>

<body>
<div id="cssshow"><?

$imagePath = './images';
$order = json_decode(file_get_contents($imagePath.'/order.json'));
$i = 0;
foreach ($order as $image) {
	printf(
		'<img src="%s" class="%s" />',
		$imagePath.'/'.$image,
		$i++ == 0 ? 'cssshow_shown' : 'cssshow_loading'
	);
}

?></div>
<button onclick="CSSShow.stop();">stop</button>
<button onclick="CSSShow.start();">start</button>

<script src="show.js"></script>
</body>
</html>
