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
};
CSSShow.init();
