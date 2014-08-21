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
        },
        writeable: false
    },
    
    unscaledSelection: {
        get: function() {
            return this._selection;
        },
        writable: false
    }
} );

AreaSelector.prototype._initElements = function() {
    var self = this;

    self.container = div();
    self.area.css.position = 'absolute';
    self.area.css.left = 0;
    self.area.css.top = 0;
    self.area.css.right = 0;
    self.area.css.bottom = 0;

    self.area = div();
    self.area.css.position = 'absolute';
    self.area.css.left = 0;
    self.area.css.top = 0;
    self.area.css.right = 0;
    self.area.css.bottom = 0;
    self.area.css.border = self.options.borderWidth + 'px solid ' + self.options.borderColor;
    self.container.appendChild( self.area );
    
    // handles
    var negMarginOffset = '-' + ( self.options.handleSize / 2 ) + 'px';
    
    var nw = div();
    nw.css.position = 'absolute';
    nw.css.left = 0;
    nw.css.top = 0;
    nw.css.marginTop = negMarginOffset;
    nw.css.marginLeft = negMarginOffset;

    var n = div();
    n.css.position = 'absolute';
    n.css.left = '50%';
    n.css.top = 0;
    n.css.marginTop = negMarginOffset;
    n.css.marginLeft = negMarginOffset;

    var ne = div();
    ne.css.position = 'absolute';
    ne.css.right = 0;
    ne.css.top = 0;
    ne.css.marginTop = negMarginOffset;
    ne.css.marginRight = negMarginOffset;

    var e = div();
    e.css.position = 'absolute';
    e.css.right = 0;
    e.css.top = '50%';
    e.css.marginTop = negMarginOffset;
    e.css.marginRight = negMarginOffset;

    var se = div();
    se.css.position = 'absolute';
    se.css.right = 0;
    se.css.bottom = 0;
    se.css.marginBottom = negMarginOffset;
    se.css.marginRight = negMarginOffset;

    var s = div();
    nw.css.position = 'absolute';
    nw.css.left = '50%';
    nw.css.bottom = 0;
    nw.css.marginBottom = negMarginOffset;
    nw.css.marginLeft = negMarginOffset;

    var sw = div();
    nw.css.position = 'absolute';
    nw.css.left = 0;
    nw.css.bottom = 0;
    nw.css.marginBottom = negMarginOffset;
    nw.css.marginLeft = negMarginOffset;

    var w = div();
    nw.css.position = 'absolute';
    nw.css.left = 0;
    nw.css.top = '50%';
    nw.css.marginTop = negMarginOffset;
    nw.css.marginLeft = negMarginOffset;

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
        
        handle.css.border = '1px solid ' + self.options.borderColor;

        self.area.appendChild( handle );
    } );
    
    self.mask = null;
    
    if ( self.options.mask ) {
        self.mask = div();
        self.mask.css.position = 'absolute';
        self.mask.css.borderColor = self.options.maskColor;
        self.mask.css.borderWidth = 0;
        self.mask.css.borderStyle = 'solid';
        self.mask.css.left = 0;
        self.mask.css.top = 0;
        self.mask.css.right = 0;
        self.mask.css.bottom = 0;
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

    self.area.css.left = self._selection.left;
    self.area.css.top = self._selection.top;
    self.area.css.right = self._selection.right;
    self.area.css.bottom = self._selection.bottom;
    
    if ( self.mask ) {
        self.mask.css.left = self.area.css.left;
        self.mask.css.top = self.area.css.top;
        self.mask.css.right = self.area.css.right;
        self.mask.css.bottom = self.area.css.bottom;
        
        self.mask.css.borderLeftWidth = self.area.css.left;
        self.mask.css.borderTopWidth = self.area.css.top;
        self.mask.css.borderRightWidth = self.area.css.right;
        self.mask.css.borderBottomWidth = self.area.css.bottom;
    }
};
