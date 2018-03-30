
function isInt(n) {
   return n % 1 === 0;
}

function Palette()
{
	this._dim = 100;//px
	this._numberColor = 0;
	this._displayText = true;
	this._palette = document.createElement("div");
		this._palette.className = "Palette"
	this._boxes = [];
}
/**
 * [addColor description]
 * @param {[string]} color [is the value of the color]
 * @param {[string]} name  [is the name associated with the color, optional]
 */
Palette.prototype.addColor = function(color, name) {
//new element
	var box = document.createElement("div");
//a bit of style
	box.style.backgroundColor = color;
	box.style.width = this._dim + "px";
	box.style.height = this._dim + "px";
	box.className = "box_palette hvr-shrink";
//number of boxes + 1
	this._numberColor++;
//a bit of content

	if(this._displayText)
	{
		if(typeof name !== "undefined")
			box.innerHTML = "<h3>"+name+"</h3>";
		else
			box.innerHTML = "<h3>"+color+"</h3>";
	}

	//--------------
	//add event(s)
	var supthis = this;
	box.addEventListener('click',function(){
		supthis.click(color,name);//allow user to implement his own behavior
	},false);
//append to the palette
	this._palette.appendChild(box);
};
/**
 * [appendTo allow to insert the palette into the element parent]
 * @param  {[DOM object]} parent [element in which the palette will be inserted]
 */
Palette.prototype.appendTo = function(parent) {
	parent.appendChild(this._palette);
};
/**
 * [dim allow user to safely change the dimension of the color boxes]
 * @param  {[int]} dim
 */
Palette.prototype.dim = function(dim) {
	if(isInt(dim))
	{
		if(dim > 20)
			this._dim = dim;
		else
			this._dim = 20;
	}
}