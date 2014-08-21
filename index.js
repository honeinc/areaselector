/*
 * areaselector
 * Andy Burke (aburke@bitflood.org)
 */

/* jshint browser:true */
/* jshint -W097 */
/* globals require, module */
'use strict';

var extend = require( 'extend' );

var div = document.createElement.bind( document, 'div' );

module.exports = AreaSelector;

var unitScale = {
    x: 1.0,
    y: 1.0
};

function clamp( value, min, max ) {
    return Math.min( Math.max( value, min ), max );
}

//
////
//

function Selection( opts ) {
    var self = this;
    opts = opts || {};
    self.aspect = opts.aspect;
    self.bounds = opts.bounds;
    self.left = opts.left || 0;
    self.top = opts.top || 0;
    self.width = opts.width || 0;
    self.height = opts.height || 0;
}

Object.defineProperties( Selection.prototype, {
    left: {
        get: function() {
            return this._left;
        },
        set: function( value ) {
            this._left = this.bounds ? clamp( value, this.bounds.min.x, this.bounds.max.x ) : value;
        }
    },
    
    top: {
        get: function() {
            return this._top;
        },
        set: function( value ) {
            this._top = this.bounds ? clamp( value, this.bounds.min.y, this.bounds.max.y ) : value;
        }
    },
    
    width: {
        get: function() {
            return this._width;
        },
        set: function( value ) {
            this._width = value;
            
            if ( this.maximums && typeof( this.maximums.x ) !== 'undefined' ) {
                if ( this._left + this._width > this.maximums.x ) {
                    this._width = this.maximums.x - this._left;
                }
            }
            
            if ( this.minimums && typeof( this.minimums.width ) !== 'undefined' ) {
                this._width = this._width >= this.minimums.width ? this._width : this.minimums.width;
            }

            if ( this.maximums && typeof( this.maximums.width ) !== 'undefined' ) {
                this._width = this._width <= this.maximums.width ? this._width : this.maximums.width;
            }
            
            if ( this.aspect ) {
                this._height = this._width * ( 1 / this.aspect );
                if ( this.maximums && typeof( this.maximums.y ) !== 'undefined' ) {
                    if ( this._top + this._height > this.maximums.y ) {
                        this._height = this.maximums.y - this._top;
                    }
                }
            }
        }
    },
    
    height: {
        get: function() {
            return this._height;
        },
        set: function( value ) {
            this._height = value;

            if ( this.maximums && typeof( this.maximums.y ) !== 'undefined' ) {
                if ( this._top + this._height > this.maximums.y ) {
                    this._height = this.maximums.y - this._top;
                }
            }

            if ( this.minimums && typeof( this.minimums.height ) !== 'undefined' ) {
                this._height = this._height >= this.minimums.height ? this._height : this.minimums.height;
            }

            if ( this.maximums && typeof( this.maximums.height ) !== 'undefined' ) {
                this._height = this._height <= this.maximums.height ? this._height : this.maximums.height;
            }

            if ( this.aspect ) {
                this._width = this._height * this.aspect;
                if ( this.maximums && typeof( this.maximums.x ) !== 'undefined' ) {
                    if ( this._left + this._width > this.maximums.x ) {
                        this._width = this.maximums.x - this._left;
                    }
                }
            }
        }
    }
} );

Selection.prototype.getScaled = function( scale ) {
    var self = this;
    return new Selection( {
        aspect: self.aspect,
        left: self.left * scale,
        top: self.top * scale,
        width: self.width * scale,
        height: self.height * scale,
        bounds: self.bounds ? {
            min: {
                x: self.bounds.min.x * scale,
                y: self.bounds.min.y * scale
            },
            max: {
                x: self.bounds.max.x * scale,
                y: self.bounds.max.y * scale
            }
        } : null
    } );
};

//
////
//

var defaults = {
    handleSize: 4,
    borderColor: '#fff',
    borderWidth: 1,
    mask: true,
    maskColor: 'rgba( 0, 0, 0, 0.5 )'
};

function AreaSelector( element, options ) {
    var self = this;
    self.element = element;
    self.options = extend( {}, defaults, options );
    
    self._initElements();
    
    self._selection = new Selection( self.options );

    self._scale = {
        x: 1.0,
        y: 1.0
    };
    
    self._detectScale();
    
    return self;
}

Object.defineProperties( AreaSelector.prototype, {
    selection: {
        get: function() {
            return this._selection.getScaled( this._scale );
        }
    },
    
    unscaledSelection: {
        get: function() {
            return this._selection;
        }
    }
} );

AreaSelector.prototype._initElements = function() {
    var self = this;

    self.container = div();
    self.container.style.position = 'absolute';
    self.container.style.left = '0px';
    self.container.style.top = '0px';
    self.container.style.right = '0px';
    self.container.style.bottom = '0px';
    self.container.style.overflow = 'hidden';

    self.area = div();
    self.area.style.position = 'absolute';
    self.area.style.left = '0px';
    self.area.style.top = '0px';
    self.area.style.width = '0px';
    self.area.style.height = '0px';
    self.area.style.border = self.options.borderWidth + 'px solid ' + self.options.borderColor;
    self.area.style.cursor = 'move';
    self.area.style.zIndex = 1;
    self.container.appendChild( self.area );
    
    // handles
    var negMarginOffset = '-' + ( 1 + ( self.options.handleSize / 2 ) ) + 'px';
    
    var nw = div();
    nw.style.position = 'absolute';
    nw.style.left = '0px';
    nw.style.top = '0px';
    nw.style.width = self.options.handleSize + 'px';
    nw.style.height = self.options.handleSize + 'px';
    nw.style.marginTop = negMarginOffset;
    nw.style.marginLeft = negMarginOffset;
    nw.style.cursor = 'nwse-resize';

    var n = div();
    n.style.position = 'absolute';
    n.style.left = '50%';
    n.style.top = '0px';
    n.style.width = self.options.handleSize + 'px';
    n.style.height = self.options.handleSize + 'px';
    n.style.marginTop = negMarginOffset;
    n.style.marginLeft = negMarginOffset;
    n.style.cursor = 'ns-resize';

    var ne = div();
    ne.style.position = 'absolute';
    ne.style.right = '0px';
    ne.style.top = '0px';
    ne.style.width = self.options.handleSize + 'px';
    ne.style.height = self.options.handleSize + 'px';
    ne.style.marginTop = negMarginOffset;
    ne.style.marginRight = negMarginOffset;
    ne.style.cursor = 'nesw-resize';

    var e = div();
    e.style.position = 'absolute';
    e.style.right = '0px';
    e.style.top = '50%';
    e.style.width = self.options.handleSize + 'px';
    e.style.height = self.options.handleSize + 'px';
    e.style.marginTop = negMarginOffset;
    e.style.marginRight = negMarginOffset;
    e.style.cursor = 'ew-resize';

    var se = div();
    se.style.position = 'absolute';
    se.style.right = '0px';
    se.style.bottom = '0px';
    se.style.width = self.options.handleSize + 'px';
    se.style.height = self.options.handleSize + 'px';
    se.style.marginBottom = negMarginOffset;
    se.style.marginRight = negMarginOffset;
    se.style.cursor = 'nwse-resize';

    var s = div();
    s.style.position = 'absolute';
    s.style.left = '50%';
    s.style.bottom = '0px';
    s.style.width = self.options.handleSize + 'px';
    s.style.height = self.options.handleSize + 'px';
    s.style.marginBottom = negMarginOffset;
    s.style.marginLeft = negMarginOffset;
    s.style.cursor = 'ns-resize';

    var sw = div();
    sw.style.position = 'absolute';
    sw.style.left = '0px';
    sw.style.bottom = '0px';
    sw.style.width = self.options.handleSize + 'px';
    sw.style.height = self.options.handleSize + 'px';
    sw.style.marginBottom = negMarginOffset;
    sw.style.marginLeft = negMarginOffset;
    sw.style.cursor = 'nesw-resize';

    var w = div();
    w.style.position = 'absolute';
    w.style.left = '0px';
    w.style.top = '50%';
    w.style.width = self.options.handleSize + 'px';
    w.style.height = self.options.handleSize + 'px';
    w.style.marginTop = negMarginOffset;
    w.style.marginLeft = negMarginOffset;
    w.style.cursor = 'ew-resize';

    self.handles = {
        nw: nw,
        n: n,
        ne: ne,
        e: e,
        se: se,
        s: s,
        sw: sw,
        w: w
    };
    
    Object.keys( self.handles ).forEach( function( handleKey ) {
        var handle = self.handles[ handleKey ];
        
        handle.style.border = '1px solid ' + self.options.borderColor;

        self.area.appendChild( handle );
    } );
    
    self.mask = null;
    
    if ( self.options.mask ) {
        self.mask = div();
        self.mask.style.position = 'absolute';
        self.mask.style.outlineColor = self.options.maskColor;
        self.mask.style.outlineStyle = 'solid';
        self.mask.style.outlineWidth = '10000px';
        self.mask.style.left = '0px';
        self.mask.style.top = '0px';
        self.mask.style.width = '0px';
        self.mask.style.height = '0px';
        self.container.appendChild( self.mask );
    }
    
    self.element.appendChild( self.container );
};


AreaSelector.prototype._detectScale = function() {
    var self = this;
    if ( self.element.tagName !== 'IMG' ) {
        return;
    }
    
    self._scale.x = self.element.naturalScale ? self.element.width / self.element.naturalScale : 1.0;
    self._scale.y = self.element.naturalHeight ? self.element.height / self.element.naturalHeight : 1.0;
};

AreaSelector.prototype.destroy = function() {
    var self = this;
    self.element.removeChild( self.container );
    self.mask = null;
    self.area = null;
    self.handles = [];
    self.container = null;
    self._selection = null;
    self.options = null;
};

AreaSelector.prototype.setSelection = function( left, top, right, bottom, unscaled ) {
    var self = this;
    var scale = unscaled ? unitScale : self._scale;
    
    var width = right - left;
    var height = bottom - top;
    
    self._selection.left = left * scale.x;
    self._selection.top = top * scale.y;
    self._selection.width = width * scale.x;
    self._selection.height = height * scale.y;
};

AreaSelector.prototype.update = function() {
    var self = this;

    self.area.style.left = self._selection.left + 'px';
    self.area.style.top = self._selection.top + 'px';
    self.area.style.width = self._selection.width + 'px';
    self.area.style.height = self._selection.height + 'px';
    
    if ( self.mask ) {
        self.mask.style.left = ( self._selection.left - 1 ) + 'px';
        self.mask.style.top = ( self._selection.top - 1 ) + 'px';
        self.mask.style.width = ( self._selection.width + 2 )+ 'px';
        self.mask.style.height = ( self._selection.height + 2 ) + 'px';
    }
};
