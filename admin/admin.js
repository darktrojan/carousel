var outer = document.getElementById('outer');

var ThumbnailUI = {
	inner: null,
	imagePath: '../images',
	thumbsContainer: null,
	containerPosition: null,
	columnWidth: 190,
	rowHeight: 90,
	imageCount: null,
	rowLength: null,
	rowCount: null,
	leftPadding: null,
	trash: null,

	init: function() {
		this.inner = document.getElementById('thumbnailui');
		this.thumbsContainer = document.getElementById('thumbs');
		this.containerPosition = DraggableObject.fixBCR(this.thumbsContainer);
		this.trash = document.getElementById('trash');

		this.inner.ondragstart = function() {
			return false;
		};

		var self = this;
		this.DraggableThumbnail.prototype = new DraggableObject;
		this.DraggableThumbnail.prototype.customMouseMove = function(aEvent) {
			if (!this.holder) {
				this.holder = document.createElement('div');
				this.holder.id = 'holder';
				self.thumbsContainer.appendChild(this.holder);
				this.domNode.classList.add('moving');
				document.body.appendChild(this.domNode);
				this.images = self.thumbsContainer.querySelectorAll('img');
			}

			this.domNode.style.left = aEvent.pageX - this.dragStartX + 'px';
			this.domNode.style.top = aEvent.pageY - this.dragStartY + 'px';

			var trashPosition = DraggableObject.fixBCR(self.trash);
			if (aEvent.pageX >= trashPosition.left && aEvent.pageX < trashPosition.right &&
				aEvent.pageY >= trashPosition.top && aEvent.pageY < trashPosition.bottom) {
				self.trash.style.backgroundColor = '#c00';
				this.domNode.style.opacity = '0.5';
				this.position = -1;
				return;
			}
			self.trash.style.backgroundColor = null;
			this.domNode.style.opacity = null;

			var x = aEvent.pageX - self.containerPosition.left - self.leftPadding;
			var y = aEvent.pageY - self.containerPosition.top;

			var rowPosition =
				Math.max(Math.min(Math.floor(y / self.rowHeight), self.rowLength - 1), 0);
			var columnPosition =
				Math.max(Math.min(Math.floor(x / self.columnWidth), self.rowCount - 1), 0);

			this.position = rowPosition * self.rowLength + columnPosition;
			if (this.position > this.images.length) {
				if (self.rowCount == 1) {
					this.position = this.images.length;
				} else {
					var distanceToPreviousRow = y - (self.rowCount - 1) * self.rowHeight;
					var distanceToPreviousColumn = x - (this.images.length % self.rowLength + 1) * self.columnWidth;
					if (distanceToPreviousRow < distanceToPreviousColumn) {
						this.position = (rowPosition - 1) * self.rowLength + columnPosition;
					} else {
						this.position = this.images.length;
					}
				}
			}

			for (var i = 0, j = 0; i <= this.images.length; i++) {
				if (i == this.position) {
					self.positionImage(this.holder, i);
				} else {
					self.positionImage(this.images[j++], i);
				}
			}
		};
		this.DraggableThumbnail.prototype.customMouseUp = function(aEvent) {
			this.domNode.classList.remove('moving');

			if (this.holder) {
				self.thumbsContainer.removeChild(this.holder);
				if (this.position == -1) {
					self.trash.style.backgroundColor = null;
					document.body.removeChild(this.domNode);
					self.setImageCount();
				} else {
					self.positionImage(this.domNode, this.position);
					self.thumbsContainer.insertBefore(this.domNode, self.thumbsContainer.children[this.position]);
				}
				delete this.holder;
			}
		};
		this.DraggableThumbnail.prototype.customDblClick = function(aEvent) {
			var oldLink = this.domNode.dataset.link || '';
			var newLink = prompt('Enter a link:', oldLink);
			if (newLink != null) {
				this.domNode.dataset.link = newLink;
			}
		};
		this.loadOrder();
	},
	loadOrder: function() {
		var self = this;
		XHR.get(this.imagePath + '/order.json', function(req) {
			var order = JSON.parse(req.responseText);
			for (var i = 0; i < order.length; i++) {
				var thumb = document.createElement('img');
				thumb.src = self.imagePath + '/' + order[i]['image'];
				if (order[i]['link']) {
					thumb.dataset.link = order[i]['link'];
				}
				self.thumbsContainer.appendChild(thumb);
				new ThumbnailUI.DraggableThumbnail(thumb);
			}
			self.setImageCount();
		});
	},
	setImageCount: function() {
		this.imageCount = this.thumbsContainer.children.length;
		this.rowLength = Math.min(this.imageCount, Math.floor(this.containerPosition.width / this.columnWidth));
		this.rowCount = Math.ceil(this.imageCount / this.rowLength);
		this.leftPadding = Math.floor((this.containerPosition.width - this.rowLength * this.columnWidth) / 2);
		this.thumbsContainer.style.height = this.rowCount * this.rowHeight + 'px';

		for (var i = 0; i < this.thumbsContainer.children.length; i++) {
			var thumb = this.thumbsContainer.children[i];
			this.positionImage(thumb, i);
		}
	},
	positionImage: function(aImage, aPosition) {
		var column = aPosition % this.rowLength;
		var row = Math.floor(aPosition / this.rowLength);
		aImage.style.left = (column * this.columnWidth + 5 + this.leftPadding) + 'px';
		aImage.style.top = (row * this.rowHeight + 5) + 'px';
	},
	saveOrder: function() {
		var order = [];
		for (var i = 0; i < this.thumbsContainer.children.length; i++) {
			var thumb = this.thumbsContainer.children[i];
			var thumbObject = {};
			thumbObject.image =
				thumb.dataset.filename || thumb.src.substring(thumb.src.lastIndexOf('/') + 1);
			if (thumb.dataset.link) {
				thumbObject.link = thumb.dataset.link;
			}
			order.push(thumbObject);
		}
		XHR.post('saveorder.php', 'order=' + encodeURIComponent(JSON.stringify(order)), function() {});
	},
	DraggableThumbnail: function(aThumbnail) {
		this.init(aThumbnail);
	}
};
ThumbnailUI.init();

var CanvasUI = {
	inner: null,
	canvas: null,
	context: null,
	saveButton: null,

	init: function() {
		var self = this;
		var image, height, minTop, imageTop;
		this.inner = document.getElementById('canvasui');
		this.canvas = document.querySelector('canvas');
		this.context = this.canvas.getContext('2d');
		this.context.fillStyle = '#eee';
		this.saveButton = this.inner.querySelector('button');
		this.reset();

		document.documentElement.addEventListener('dragenter', function(aEvent) {
			if (!outer.classList.contains('showcanvas'))
				return;

			aEvent.stopPropagation();
			aEvent.preventDefault();
		}, false);
		document.documentElement.addEventListener('dragover', function(aEvent) {
			if (!outer.classList.contains('showcanvas'))
				return;

			aEvent.stopPropagation();
			aEvent.preventDefault();
		}, false);
		document.documentElement.addEventListener('drop', function(aEvent) {
			if (!outer.classList.contains('showcanvas'))
				return;

			if (aEvent.dataTransfer.files.length == 0)
				return;

			aEvent.stopPropagation();
			aEvent.preventDefault();
			image = document.createElement('img');
			image.onload = function() {
				height = image.height * self.canvas.width / image.width;
				minTop = self.canvas.height - height;
				imageTop = minTop / 2;
				self.context.drawImage(image, 0, 0, image.width, image.height, 0, imageTop, self.canvas.width, height);
				self.saveButton.disabled = false;
			};

			if ('URL' in window) {
				image.src = URL.createObjectURL(aEvent.dataTransfer.files[0]);
			} else {
				var reader = new FileReader();
				reader.onload = function() {
					image.src = this.result;
				}
				reader.readAsDataURL(aEvent.dataTransfer.files[0]);
			}
		}, false);

		new DraggableObject(this.canvas).customMouseMove = function(aEvent) {
			if (!image)
				return;

			imageTop = imageTop - this.pageStartY + aEvent.pageY;
			imageTop = Math.max(Math.min(imageTop, 0), minTop);
			this.pageStartY = aEvent.pageY;
			self.context.drawImage(image, 0, 0, image.width, image.height, 0, imageTop, self.canvas.width, height);
		};
	},
	reset: function() {
		this.saveButton.disabled = true;
		this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
	},
	saveToThumbs: function() {
		var self = this;
		function finish(aURL, aBlob) {
			var thumb = document.createElement('img');
			thumb.src = aURL;
			ThumbnailUI.thumbsContainer.appendChild(thumb);
			ThumbnailUI.setImageCount();
			new ThumbnailUI.DraggableThumbnail(thumb);
			self.hide();

			var data = new FormData();
			data.append('upload', aBlob);
			XHR.postFormData('saveimage.php', data, function(req) {
				thumb.dataset.filename = req.responseText;
			});
		}

		// Not used due to https://bugzil.la/822190
		// if ('toBlob' in this.canvas) {
		// 	this.canvas.toBlob(function(aBlob) {
		// 		finish(URL.createObjectURL(aBlob), aBlob);
		// 	}, 'image/jpeg', 0.7);
		// } else {
			var dataURL = this.canvas.toDataURL('image/jpeg', 0.7);
			var byteString = atob(dataURL.split(',')[1]);
			var buffer = new ArrayBuffer(byteString.length);
			var array = new Uint8Array(buffer);
			for (var i = 0; i < byteString.length; i++) {
				array[i] = byteString.charCodeAt(i);
			}
			finish(dataURL, new Blob([array]));
		// }
	},
	show: function() {
		this.reset();
		outer.classList.add('showcanvas');
	},
	hide: function() {
		outer.classList.remove('showcanvas');
	}
};
CanvasUI.init();
