<html>
<head>
<style type="text/css">
#cssshow {
	position: relative;
	width: 720px;
	height: 320px;
}
#cssshow > * {
	display: block;
	position: absolute;
	width: 720px;
	height: 320px;
}
#cssshow > .cssshow_fading {
	opacity: 0;
		-ms-transition: opacity 1440ms;
		-o-transition: opacity 1440ms;
		-webkit-transition: opacity 1440ms;
	transition: opacity 1440ms;
	z-index: 2;
}
#cssshow > .cssshow_shown {
	z-index: 1;
}
#cssshow > .cssshow_hidden {
	z-index: 0;
}
#cssshow > .cssshow_loading {
	visibility: hidden;
}
</style>
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
<script>

var CSSShow = {
	current: 0,
	interval: null,
	init: function() {
		var container = document.getElementById('cssshow');
		this.images = container.children;
		if (this.images.length == 0) {
			return;
		}

		var hiddenProperty, hiddenEvent;
		var props = {
			'hidden': 'visibilitychange',
			'mozHidden': 'mozvisibilitychange',
			'msHidden': 'msvisibilitychange',
			'webkitHidden': 'webkitvisibilitychange'
		};
		for (var prop in props) {
			if (prop in document) {
				hiddenProperty = prop;
				hiddenEvent = props[prop];
				break;
			}
		}

		window.addEventListener('load', function() {
			if (hiddenProperty) {
				document.addEventListener(hiddenEvent, function() {
					if (document[hiddenProperty]) {
						CSSShow.stop();
					} else {
						CSSShow.start();
					}
				}, false);
				if (!document[hiddenProperty]) {
					CSSShow.start();
				}
			} else {
				CSSShow.start();
			}
		}, false);
	},
	start: function() {
		this.interval = setInterval(function() {
			var next = (CSSShow.current + 1) % CSSShow.images.length;
			CSSShow.showImage(next);
		}, 4440);
	},
	stop: function() {
		clearInterval(this.interval);
	},
	showImage: function(aIndex) {
		var currentImage = this.images[this.current];
		var nextImage = this.images[aIndex];

		currentImage.className = 'cssshow_fading';
		nextImage.className = 'cssshow_shown';
		setTimeout(function() {
			currentImage.className = 'cssshow_hidden';
			CSSShow.current = aIndex;
		}, 1500);
	}
}
CSSShow.init();

</script>
</body>
</html>
