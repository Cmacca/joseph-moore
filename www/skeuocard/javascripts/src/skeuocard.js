/*
"Skeuocard" -- A Skeuomorphic Credit-Card Input Enhancement
@description Skeuocard is a skeuomorphic credit card input plugin, supporting 
             progressive enhancement. It renders a credit-card input which 
             behaves similarly to a physical credit card.
@author Ken Keiter <ken@kenkeiter.com>
@updated 2013-07-25
@website http://kenkeiter.com/
@exports [window.Skeuocard]
*/

var CCIssuers, CCProducts, Skeuocard,
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; },
  __slice = [].slice,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

Skeuocard = (function() {
  function Skeuocard(el, opts) {
    var optDefaults;
    if (opts == null) {
      opts = {};
    }
    this.el = {
      container: $(el),
      underlyingFields: {}
    };
    this._inputViews = {};
    this._tabViews = {};
    this.product = void 0;
    this.productShortname = void 0;
    this.issuerShortname = void 0;
    this._cardProductNeedsLayout = true;
    this.acceptedCardProducts = {};
    this.visibleFace = 'front';
    this._initialValidationState = {};
    this._validationState = {
      number: false,
      exp: false,
      name: false,
      cvc: false
    };
    this._faceFillState = {
      front: false,
      back: false
    };
    optDefaults = {
      debug: false,
      acceptedCardProducts: [],
      cardNumberPlaceholderChar: 'X',
      genericPlaceholder: "XXXX XXXX XXXX XXXX",
      typeInputSelector: '[name="cc_type"]',
      numberInputSelector: '[name="cc_number"]',
      expInputSelector: '[name="cc_exp"]',
      nameInputSelector: '[name="cc_name"]',
      cvcInputSelector: '[name="cc_cvc"]',
      currentDate: new Date(),
      initialValues: {},
      validationState: {},
      strings: {
        hiddenFaceFillPrompt: "Click here to<br /> fill in the other side.",
        hiddenFaceErrorWarning: "There's a problem on the other side.",
        hiddenFaceSwitchPrompt: "Back to the other side..."
      }
    };
    this.options = $.extend(optDefaults, opts);
    this._conformDOM();
    this._setAcceptedCardProducts();
    this._createInputs();
    this._updateProductIfNeeded();
    this._flipToInvalidSide();
  }

  Skeuocard.prototype._conformDOM = function() {
    var el, fieldName, fieldValue, _ref, _ref1, _ref2,
      _this = this;
    this.el.container.removeClass('no-js');
    this.el.container.addClass("skeuocard js");
    this.el.container.find("> :not(input,select,textarea)").remove();
    this.el.container.find("> input,select,textarea").hide();
    this.el.underlyingFields = {
      type: this.el.container.find(this.options.typeInputSelector),
      number: this.el.container.find(this.options.numberInputSelector),
      exp: this.el.container.find(this.options.expInputSelector),
      name: this.el.container.find(this.options.nameInputSelector),
      cvc: this.el.container.find(this.options.cvcInputSelector)
    };
    _ref = this.options.initialValues;
    for (fieldName in _ref) {
      fieldValue = _ref[fieldName];
      this.el.underlyingFields[fieldName].val(fieldValue);
    }
    _ref1 = this.el.underlyingFields;
    for (fieldName in _ref1) {
      el = _ref1[fieldName];
      this.options.initialValues[fieldName] = el.val();
    }
    _ref2 = this.el.underlyingFields;
    for (fieldName in _ref2) {
      el = _ref2[fieldName];
      if (this.options.validationState[fieldName] === false || el.hasClass('invalid')) {
        this._initialValidationState[fieldName] = false;
        if (!el.hasClass('invalid')) {
          el.addClass('invalid');
        }
      }
    }
    this.el.underlyingFields.number.bind("change", function(e) {
      _this._inputViews.number.setValue(_this._getUnderlyingValue('number'));
      return _this.render();
    });
    this.el.underlyingFields.exp.bind("change", function(e) {
      _this._inputViews.exp.setValue(_this._getUnderlyingValue('exp'));
      return _this.render();
    });
    this.el.underlyingFields.name.bind("change", function(e) {
      _this._inputViews.exp.setValue(_this._getUnderlyingValue('name'));
      return _this.render();
    });
    this.el.underlyingFields.cvc.bind("change", function(e) {
      _this._inputViews.exp.setValue(_this._getUnderlyingValue('cvc'));
      return _this.render();
    });
    this.el.surfaceFront = $("<div>").attr({
      "class": "face front"
    });
    this.el.surfaceBack = $("<div>").attr({
      "class": "face back"
    });
    this.el.cardBody = $("<div>").attr({
      "class": "card-body"
    });
    this.el.surfaceFront.appendTo(this.el.cardBody);
    this.el.surfaceBack.appendTo(this.el.cardBody);
    this.el.cardBody.appendTo(this.el.container);
    this._tabViews.front = new this.FlipTabView('front');
    this._tabViews.back = new this.FlipTabView('back');
    this.el.surfaceFront.prepend(this._tabViews.front.el);
    this.el.surfaceBack.prepend(this._tabViews.back.el);
    this._tabViews.front.hide();
    this._tabViews.back.hide();
    this._tabViews.front.el.click(function() {
      return _this.flip();
    });
    this._tabViews.back.el.click(function() {
      return _this.flip();
    });
    return this.el.container;
  };

  Skeuocard.prototype._setAcceptedCardProducts = function() {
    var matcher, product, _ref,
      _this = this;
    if (this.options.acceptedCardProducts.length === 0) {
      this.el.underlyingFields.type.find('option').each(function(i, _el) {
        var cardProductShortname, el;
        el = $(_el);
        cardProductShortname = el.attr('data-card-product-shortname') || el.attr('value');
        return _this.options.acceptedCardProducts.push(cardProductShortname);
      });
    }
    for (matcher in CCProducts) {
      product = CCProducts[matcher];
      if (_ref = product.companyShortname, __indexOf.call(this.options.acceptedCardProducts, _ref) >= 0) {
        this.acceptedCardProducts[matcher] = product;
      }
    }
    return this.acceptedCardProducts;
  };

  Skeuocard.prototype._updateProductIfNeeded = function() {
    var matchedIssuerIdentifier, matchedProduct, matchedProductIdentifier, number;
    number = this._getUnderlyingValue('number');
    matchedProduct = this.getProductForNumber(number);
    matchedProductIdentifier = (matchedProduct != null ? matchedProduct.companyShortname : void 0) || '';
    matchedIssuerIdentifier = (matchedProduct != null ? matchedProduct.issuerShortname : void 0) || '';
    if ((this.productShortname !== matchedProductIdentifier) || (this.issuerShortname !== matchedIssuerIdentifier)) {
      this.productShortname = matchedProductIdentifier;
      this.issuerShortname = matchedIssuerIdentifier;
      this.product = matchedProduct;
      this._cardProductNeedsLayout = true;
      this.trigger('productWillChange.skeuocard', [this, this.productShortname, matchedProductIdentifier]);
      this._log("Triggering render because product changed.");
      this.render();
      return this.trigger('productDidChange.skeuocard', [this, this.productShortname, matchedProductIdentifier]);
    }
  };

  Skeuocard.prototype._createInputs = function() {
    var _this = this;
    this._inputViews.number = new this.SegmentedCardNumberInputView();
    this._inputViews.exp = new this.ExpirationInputView({
      currentDate: this.options.currentDate
    });
    this._inputViews.name = new this.TextInputView({
      "class": "cc-name",
      placeholder: "YOUR NAME"
    });
    this._inputViews.cvc = new this.TextInputView({
      "class": "cc-cvc",
      placeholder: "XXX",
      requireMaxLength: true
    });
    this._inputViews.number.el.addClass('cc-number');
    this._inputViews.number.el.appendTo(this.el.surfaceFront);
    this._inputViews.name.el.appendTo(this.el.surfaceFront);
    this._inputViews.exp.el.addClass('cc-exp');
    this._inputViews.exp.el.appendTo(this.el.surfaceFront);
    this._inputViews.cvc.el.appendTo(this.el.surfaceBack);
    this._inputViews.number.bind("change", function(e, input) {
      _this._setUnderlyingValue('number', input.getValue());
      _this._updateValidationStateForInputView('number');
      return _this._updateProductIfNeeded();
    });
    this._inputViews.exp.bind("keyup", function(e, input) {
      _this._setUnderlyingValue('exp', input.value);
      return _this._updateValidationStateForInputView('exp');
    });
    this._inputViews.name.bind("keyup", function(e) {
      _this._setUnderlyingValue('name', $(e.target).val());
      return _this._updateValidationStateForInputView('name');
    });
    this._inputViews.cvc.bind("keyup", function(e) {
      _this._setUnderlyingValue('cvc', $(e.target).val());
      return _this._updateValidationStateForInputView('cvc');
    });
    this._inputViews.number.setValue(this._getUnderlyingValue('number'));
    this._inputViews.exp.setValue(this._getUnderlyingValue('exp'));
    this._inputViews.name.el.val(this._getUnderlyingValue('name'));
    return this._inputViews.cvc.el.val(this._getUnderlyingValue('cvc'));
  };

  Skeuocard.prototype._log = function() {
    var msg;
    msg = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    if ((typeof console !== "undefined" && console !== null ? console.log : void 0) && !!this.options.debug) {
      if (this.options.debug != null) {
        return console.log.apply(console, ["[skeuocard]"].concat(__slice.call(msg)));
      }
    }
  };

  Skeuocard.prototype._flipToInvalidSide = function() {
    var fieldName, state, _errorCounts, _oppositeFace, _ref, _ref1;
    if (Object.keys(this._initialValidationState).length > 0) {
      _oppositeFace = this.visibleFace === 'front' ? 'back' : 'front';
      _errorCounts = {
        front: 0,
        back: 0
      };
      _ref = this._initialValidationState;
      for (fieldName in _ref) {
        state = _ref[fieldName];
        _errorCounts[(_ref1 = this.product) != null ? _ref1.layout[fieldName] : void 0]++;
      }
      if (_errorCounts[this.visibleFace] === 0 && _errorCounts[_oppositeFace] > 0) {
        return this.flip();
      }
    }
  };

  Skeuocard.prototype.render = function() {
    var container, el, fieldName, inputEl, sel, surfaceName, _hiddenFaceFilled, _hiddenFaceValid, _oppositeFace, _ref, _visibleFaceFilled, _visibleFaceValid,
      _this = this;
    this._log("*** start rendering ***");
    if (this._cardProductNeedsLayout === true) {
      if (this.product !== void 0) {
        this._log("[render]", "Activating product", this.product);
        this.el.container.removeClass(function(index, css) {
          return (css.match(/\b(product|issuer)-\S+/g) || []).join(' ');
        });
        this.el.container.addClass("product-" + this.product.companyShortname);
        if (this.product.issuerShortname != null) {
          this.el.container.addClass("issuer-" + this.product.issuerShortname);
        }
        this._setUnderlyingCardType(this.product.companyShortname);
        this._inputViews.number.setGroupings(this.product.cardNumberGrouping);
        this._inputViews.exp.show();
        this._inputViews.name.show();
        this._inputViews.exp.reconfigure({
          pattern: this.product.expirationFormat
        });
        this._inputViews.cvc.show();
        this._inputViews.cvc.attr({
          maxlength: this.product.cvcLength,
          placeholder: new Array(this.product.cvcLength + 1).join(this.options.cardNumberPlaceholderChar)
        });
        _ref = this.product.layout;
        for (fieldName in _ref) {
          surfaceName = _ref[fieldName];
          sel = surfaceName === 'front' ? 'surfaceFront' : 'surfaceBack';
          container = this.el[sel];
          inputEl = this._inputViews[fieldName].el;
          if (!(container.has(inputEl).length > 0)) {
            this._log("Moving", inputEl, "=>", container);
            el = this._inputViews[fieldName].el.detach();
            $(el).appendTo(this.el[sel]);
          }
        }
      } else {
        this._log("[render]", "Becoming generic.");
        this._inputViews.exp.clear();
        this._inputViews.cvc.clear();
        this._inputViews.exp.hide();
        this._inputViews.name.hide();
        this._inputViews.cvc.hide();
        this._inputViews.number.setGroupings([this.options.genericPlaceholder.length]);
        /*
        @_inputViews.number.reconfigure
          groupings: [@options.genericPlaceholder.length],
          placeholder: @options.genericPlaceholder
        */

        this.el.container.removeClass(function(index, css) {
          return (css.match(/\bproduct-\S+/g) || []).join(' ');
        });
        this.el.container.removeClass(function(index, css) {
          return (css.match(/\bissuer-\S+/g) || []).join(' ');
        });
      }
      this._cardProductNeedsLayout = false;
    }
    this._log("Validation state:", this._validationState);
    this.showInitialValidationErrors();
    _oppositeFace = this.visibleFace === 'front' ? 'back' : 'front';
    _visibleFaceFilled = this._faceFillState[this.visibleFace];
    _visibleFaceValid = this.isFaceValid(this.visibleFace);
    _hiddenFaceFilled = this._faceFillState[_oppositeFace];
    _hiddenFaceValid = this.isFaceValid(_oppositeFace);
    if (_visibleFaceFilled && !_visibleFaceValid) {
      this._log("Visible face is filled, but invalid; showing validation errors.");
      this.showValidationErrors();
    } else if (!_visibleFaceFilled) {
      this._log("Visible face hasn't been filled; hiding validation errors.");
      this.hideValidationErrors();
    } else {
      this._log("Visible face has been filled, and is valid.");
      this.hideValidationErrors();
    }
    if (this.visibleFace === 'front' && this.fieldsForFace('back').length > 0) {
      if (_visibleFaceFilled && _visibleFaceValid && !_hiddenFaceFilled) {
        this._tabViews.front.prompt(this.options.strings.hiddenFaceFillPrompt, true);
      } else if (_hiddenFaceFilled && !_hiddenFaceValid) {
        this._tabViews.front.warn(this.options.strings.hiddenFaceErrorWarning, true);
      } else if (_hiddenFaceFilled && _hiddenFaceValid) {
        this._tabViews.front.prompt(this.options.strings.hiddenFaceSwitchPrompt, true);
      } else {
        this._tabViews.front.hide();
      }
    } else {
      if (_hiddenFaceValid) {
        this._tabViews.back.prompt(this.options.strings.hiddenFaceSwitchPrompt, true);
      } else {
        this._tabViews.back.warn(this.options.strings.hiddenFaceErrorWarning, true);
      }
    }
    if (!this.isValid()) {
      this.el.container.removeClass('valid');
      this.el.container.addClass('invalid');
    } else {
      this.el.container.addClass('valid');
      this.el.container.removeClass('invalid');
    }
    return this._log("*** rendering complete ***");
  };

  Skeuocard.prototype.showInitialValidationErrors = function() {
    var fieldName, state, _ref, _results;
    _ref = this._initialValidationState;
    _results = [];
    for (fieldName in _ref) {
      state = _ref[fieldName];
      if (state === false && this._validationState[fieldName] === false) {
        _results.push(this._inputViews[fieldName].addClass('invalid'));
      } else {
        _results.push(this._inputViews[fieldName].removeClass('invalid'));
      }
    }
    return _results;
  };

  Skeuocard.prototype.showValidationErrors = function() {
    var fieldName, state, _ref, _results;
    _ref = this._validationState;
    _results = [];
    for (fieldName in _ref) {
      state = _ref[fieldName];
      if (state === true) {
        _results.push(this._inputViews[fieldName].removeClass('invalid'));
      } else {
        _results.push(this._inputViews[fieldName].addClass('invalid'));
      }
    }
    return _results;
  };

  Skeuocard.prototype.hideValidationErrors = function() {
    var fieldName, state, _ref, _results;
    _ref = this._validationState;
    _results = [];
    for (fieldName in _ref) {
      state = _ref[fieldName];
      if ((this._initialValidationState[fieldName] === false && state === true) || (this._initialValidationState[fieldName] == null)) {
        _results.push(this._inputViews[fieldName].el.removeClass('invalid'));
      } else {
        _results.push(void 0);
      }
    }
    return _results;
  };

  Skeuocard.prototype.setFieldValidationState = function(fieldName, valid) {
    if (valid) {
      this.el.underlyingFields[fieldName].removeClass('invalid');
    } else {
      this.el.underlyingFields[fieldName].addClass('invalid');
    }
    return this._validationState[fieldName] = valid;
  };

  Skeuocard.prototype.isFaceFilled = function(faceName) {
    var fields, filled, name;
    fields = this.fieldsForFace(faceName);
    filled = (function() {
      var _i, _len, _results;
      _results = [];
      for (_i = 0, _len = fields.length; _i < _len; _i++) {
        name = fields[_i];
        if (this._inputViews[name].isFilled()) {
          _results.push(name);
        }
      }
      return _results;
    }).call(this);
    if (fields.length > 0) {
      return filled.length === fields.length;
    } else {
      return false;
    }
  };

  Skeuocard.prototype.fieldsForFace = function(faceName) {
    var face, fn, _ref;
    if ((_ref = this.product) != null ? _ref.layout : void 0) {
      return (function() {
        var _ref1, _results;
        _ref1 = this.product.layout;
        _results = [];
        for (fn in _ref1) {
          face = _ref1[fn];
          if (face === faceName) {
            _results.push(fn);
          }
        }
        return _results;
      }).call(this);
    }
    return [];
  };

  Skeuocard.prototype._updateValidationStateForInputView = function(fieldName) {
    var field, fieldValid;
    field = this._inputViews[fieldName];
    fieldValid = field.isValid() && !(this._initialValidationState[fieldName] === false && field.getValue() === this.options.initialValues[fieldName]);
    if (fieldValid !== this._validationState[fieldName]) {
      this.setFieldValidationState(fieldName, fieldValid);
      this._faceFillState.front = this.isFaceFilled('front');
      this._faceFillState.back = this.isFaceFilled('back');
      this.trigger('validationStateDidChange.skeuocard', [this, this._validationState]);
      this._log("Change in validation for " + fieldName + " triggers re-render.");
      return this.render();
    }
  };

  Skeuocard.prototype.isFaceValid = function(faceName) {
    var fieldName, valid, _i, _len, _ref;
    valid = true;
    _ref = this.fieldsForFace(faceName);
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      fieldName = _ref[_i];
      valid &= this._validationState[fieldName];
    }
    return !!valid;
  };

  Skeuocard.prototype.isValid = function() {
    return this._validationState.number && this._validationState.exp && this._validationState.name && this._validationState.cvc;
  };

  Skeuocard.prototype._getUnderlyingValue = function(field) {
    return this.el.underlyingFields[field].val();
  };

  Skeuocard.prototype._setUnderlyingValue = function(field, newValue) {
    this.trigger('change.skeuocard', [this]);
    return this.el.underlyingFields[field].val(newValue);
  };

  Skeuocard.prototype.flip = function() {
    var surfaceName, targetFace;
    targetFace = this.visibleFace === 'front' ? 'back' : 'front';
    this.trigger('faceWillBecomeVisible.skeuocard', [this, targetFace]);
    this.visibleFace = targetFace;
    this.render();
    this.el.cardBody.toggleClass('flip');
    surfaceName = this.visibleFace === 'front' ? 'surfaceFront' : 'surfaceBack';
    this.el[surfaceName].find('input').first().focus();
    return this.trigger('faceDidBecomeVisible.skeuocard', [this, targetFace]);
  };

  Skeuocard.prototype.getProductForNumber = function(num) {
    var d, issuer, m, matcher, parts, _ref;
    _ref = this.acceptedCardProducts;
    for (m in _ref) {
      d = _ref[m];
      parts = m.split('/');
      matcher = new RegExp(parts[1], parts[2]);
      if (matcher.test(num)) {
        issuer = this.getIssuerForNumber(num) || {};
        return $.extend({}, d, issuer);
      }
    }
    return void 0;
  };

  Skeuocard.prototype.getIssuerForNumber = function(num) {
    var d, m, matcher, parts;
    for (m in CCIssuers) {
      d = CCIssuers[m];
      parts = m.split('/');
      matcher = new RegExp(parts[1], parts[2]);
      if (matcher.test(num)) {
        return d;
      }
    }
    return void 0;
  };

  Skeuocard.prototype._setUnderlyingCardType = function(shortname) {
    var _this = this;
    return this.el.underlyingFields.type.find('option').each(function(i, _el) {
      var el;
      el = $(_el);
      if (shortname === (el.attr('data-card-product-shortname') || el.attr('value'))) {
        return el.val(el.attr('value'));
      }
    });
  };

  Skeuocard.prototype.trigger = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.el.container).trigger.apply(_ref, args);
  };

  Skeuocard.prototype.bind = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.el.container).trigger.apply(_ref, args);
  };

  return Skeuocard;

})();

/*
Skeuocard::FlipTabView
Handles rendering of the "flip button" control and its various warning and 
prompt states.

TODO: Rebuild this so that it observes events and contains its own logic.
*/


Skeuocard.prototype.FlipTabView = (function() {
  function FlipTabView(face, opts) {
    if (opts == null) {
      opts = {};
    }
    this.el = $("<div class=\"flip-tab " + face + "\"><p></p></div>");
    this.options = opts;
  }

  FlipTabView.prototype._setText = function(text) {
    return this.el.find('p').html(text);
  };

  FlipTabView.prototype.warn = function(message, withAnimation) {
    if (withAnimation == null) {
      withAnimation = false;
    }
    this._resetClasses();
    this.el.addClass('warn');
    this._setText(message);
    this.show();
    if (withAnimation) {
      this.el.removeClass('warn-anim');
      return this.el.addClass('warn-anim');
    }
  };

  FlipTabView.prototype.prompt = function(message, withAnimation) {
    if (withAnimation == null) {
      withAnimation = false;
    }
    this._resetClasses();
    this.el.addClass('prompt');
    this._setText(message);
    this.show();
    if (withAnimation) {
      this.el.removeClass('valid-anim');
      return this.el.addClass('valid-anim');
    }
  };

  FlipTabView.prototype._resetClasses = function() {
    this.el.removeClass('valid-anim');
    this.el.removeClass('warn-anim');
    this.el.removeClass('warn');
    return this.el.removeClass('prompt');
  };

  FlipTabView.prototype.show = function() {
    return this.el.show();
  };

  FlipTabView.prototype.hide = function() {
    return this.el.hide();
  };

  return FlipTabView;

})();

/*
Skeuocard::TextInputView
*/


Skeuocard.prototype.TextInputView = (function() {
  function TextInputView() {}

  TextInputView.prototype.bind = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.el).bind.apply(_ref, args);
  };

  TextInputView.prototype.trigger = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.el).trigger.apply(_ref, args);
  };

  TextInputView.prototype._getFieldCaretPosition = function(el) {
    var input, sel, selLength;
    input = el.get(0);
    if (input.selectionEnd != null) {
      return input.selectionEnd;
    } else if (document.selection) {
      input.focus();
      sel = document.selection.createRange();
      selLength = document.selection.createRange().text.length;
      sel.moveStart('character', -input.value.length);
      return selLength;
    }
  };

  TextInputView.prototype._setFieldCaretPosition = function(el, pos) {
    var input, range;
    input = el.get(0);
    if (input.createTextRange != null) {
      range = input.createTextRange();
      range.move("character", pos);
      return range.select();
    } else if (input.selectionStart != null) {
      input.focus();
      return input.setSelectionRange(pos, pos);
    }
  };

  TextInputView.prototype.show = function() {
    return this.el.show();
  };

  TextInputView.prototype.hide = function() {
    return this.el.hide();
  };

  TextInputView.prototype.addClass = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.el).addClass.apply(_ref, args);
  };

  TextInputView.prototype.removeClass = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.el).removeClass.apply(_ref, args);
  };

  TextInputView.prototype._zeroPadNumber = function(num, places) {
    var zero;
    zero = places - num.toString().length + 1;
    return Array(zero).join("0") + num;
  };

  return TextInputView;

})();

Skeuocard.prototype.SegmentedCardNumberInputView = (function() {
  SegmentedCardNumberInputView.prototype._digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  SegmentedCardNumberInputView.prototype._arrowKeys = {
    left: 37,
    up: 38,
    right: 39,
    down: 40
  };

  SegmentedCardNumberInputView.prototype._specialKeys = [8, 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 91, 93, 144, 145, 224];

  function SegmentedCardNumberInputView(opts) {
    if (opts == null) {
      opts = {};
    }
    this.optDefaults = {
      value: "",
      groupings: [19],
      placeholderChar: "X"
    };
    this.options = $.extend({}, this.optDefaults, opts);
    this._state = {
      selectingAll: false
    };
    this._buildDOM();
    this.setGroupings(this.options.groupings);
  }

  SegmentedCardNumberInputView.prototype._buildDOM = function() {
    this.el = $('<fieldset>');
    this.el.delegate("input", "keypress", this._handleGroupKeyPress.bind(this));
    this.el.delegate("input", "keydown", this._handleGroupKeyDown.bind(this));
    this.el.delegate("input", "keyup", this._handleGroupKeyUp.bind(this));
    this.el.delegate("input", "paste", this._handleGroupPaste.bind(this));
    return this.el.delegate("input", "change", this._handleGroupChange.bind(this));
  };

  SegmentedCardNumberInputView.prototype._handleGroupKeyDown = function(e) {
    var currentTarget, inputGroupEl, inputMaxLength, nextInputEl, prevInputEl, selectionEnd;
    if (e.ctrlKey || e.metaKey) {
      return this._handleModifiedKeyDown(e);
    }
    inputGroupEl = $(e.currentTarget);
    currentTarget = e.currentTarget;
    selectionEnd = currentTarget.selectionEnd;
    inputMaxLength = currentTarget.maxLength;
    prevInputEl = inputGroupEl.prevAll('input');
    nextInputEl = inputGroupEl.nextAll('input');
    if (e.which === 8 && prevInputEl.length > 0) {
      if (selectionEnd === 0) {
        this._focusField(prevInputEl.first(), 'end');
      }
    }
    return true;
  };

  SegmentedCardNumberInputView.prototype._handleGroupKeyUp = function(e) {
    var currentTarget, inputGroupEl, inputMaxLength, nextInputEl, selectionEnd, _ref;
    inputGroupEl = $(e.currentTarget);
    currentTarget = e.currentTarget;
    selectionEnd = currentTarget.selectionEnd;
    inputMaxLength = currentTarget.maxLength;
    nextInputEl = inputGroupEl.nextAll('input');
    if (e.ctrlKey || e.metaKey) {
      return false;
    }
    if ((_ref = e.which) === 37 || _ref === 38 || _ref === 39 || _ref === 40) {
      if (this._state.selectingAll) {
        this._endSelectAll();
      }
    }
    switch (e.which) {
      case this._arrowKeys.left:
        if (selectionEnd === 0) {
          this._focusField(inputGroupEl.prev(), 'end');
        }
        break;
      case this._arrowKeys.right:
        if (selectionEnd === inputMaxLength) {
          this._focusField(inputGroupEl.next(), 'start');
        }
        break;
      case this._arrowKeys.up:
        this._focusField(inputGroupEl.next(), 'start');
        e.preventDefault();
        break;
      case this._arrowKeys.down:
        this._focusField(inputGroupEl.prev(), 'start');
        e.preventDefault();
        break;
      default:
        if (selectionEnd === inputMaxLength) {
          if (nextInputEl.length !== 0) {
            this._focusField(nextInputEl.first(), 'start');
          } else {
            e.preventDefault();
          }
        }
    }
    this.trigger('change', [this]);
    return true;
  };

  SegmentedCardNumberInputView.prototype._handleGroupKeyPress = function(e) {
    var currentTarget, inputGroupEl, inputMaxLength, isDigit, nextInputEl, selectionEnd, _ref, _ref1;
    inputGroupEl = $(e.currentTarget);
    currentTarget = e.currentTarget;
    selectionEnd = currentTarget.selectionEnd;
    inputMaxLength = currentTarget.maxLength;
    isDigit = (_ref = String.fromCharCode(e.which), __indexOf.call(this._digits, _ref) >= 0);
    nextInputEl = inputGroupEl.nextAll('input');
    if (e.ctrlKey || e.metaKey || (_ref1 = e.which, __indexOf.call(this._specialKeys, _ref1) >= 0) || isDigit) {
      return true;
    } else {
      e.preventDefault();
      return false;
    }
  };

  SegmentedCardNumberInputView.prototype._handleGroupPaste = function(e) {
    var _this = this;
    return setTimeout(function() {
      var newValue;
      newValue = _this.getValue().replace(/[^0-9]+/g, '');
      if (_this._state.selectingAll) {
        _this._endSelectAll();
      }
      _this.setValue(newValue);
      return _this.trigger('change', [_this]);
    }, 50);
  };

  SegmentedCardNumberInputView.prototype._handleModifiedKeyDown = function(e) {
    var char;
    char = String.fromCharCode(e.which);
    switch (char) {
      case 'A':
        this._beginSelectAll();
        return e.preventDefault();
    }
  };

  SegmentedCardNumberInputView.prototype._handleGroupChange = function(e) {
    return e.stopPropagation();
  };

  SegmentedCardNumberInputView.prototype._getFocusedField = function() {
    return this.el.find("input:focus");
  };

  SegmentedCardNumberInputView.prototype._beginSelectAll = function() {
    var fieldEl;
    if (this._state.selectingAll === false) {
      this._state.selectingAll = true;
      this._state.lastGrouping = this.options.groupings;
      this._state.lastValue = this.getValue();
      this.setGroupings(this.optDefaults.groupings);
      this.el.addClass('selecting-all');
      fieldEl = this.el.find("input");
      return fieldEl[0].setSelectionRange(0, fieldEl.val().length);
    } else {
      fieldEl = this.el.find("input");
      return fieldEl[0].setSelectionRange(0, fieldEl.val().length);
    }
  };

  SegmentedCardNumberInputView.prototype._endSelectAll = function() {
    if (this._state.selectingAll) {
      if (this._state.lastValue === this.getValue()) {
        this.setGroupings(this._state.lastGrouping);
      } else {
        this._focusField(this.el.find('input').last(), 'end');
      }
      this.el.removeClass('selecting-all');
      return this._state.selectingAll = false;
    }
  };

  SegmentedCardNumberInputView.prototype._indexInValueAtFieldSelection = function(field) {
    var groupingIndex, i, len, offset, _i, _len, _ref;
    groupingIndex = this.el.find('input').index(field);
    offset = 0;
    _ref = this.options.groupings;
    for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
      len = _ref[i];
      if (i < groupingIndex) {
        offset += len;
      }
    }
    return offset + field[0].selectionEnd;
  };

  SegmentedCardNumberInputView.prototype.setGroupings = function(groupings) {
    var groupEl, groupLength, _caretPosition, _currentField, _i, _len, _value;
    _currentField = this._getFocusedField();
    _value = this.getValue();
    _caretPosition = 0;
    if (_currentField.length > 0) {
      _caretPosition = this._indexInValueAtFieldSelection(_currentField);
    }
    this.el.empty();
    for (_i = 0, _len = groupings.length; _i < _len; _i++) {
      groupLength = groupings[_i];
      groupEl = $("<input>").attr({
        type: 'text',
        pattern: '[0-9]*',
        size: groupLength,
        maxlength: groupLength,
        "class": "group" + groupLength,
        placeholder: new Array(groupLength + 1).join(this.options.placeholderChar)
      });
      this.el.append(groupEl);
    }
    this.options.groupings = groupings;
    this.setValue(_value);
    _currentField = this._focusFieldForValue([_caretPosition, _caretPosition]);
    if ((_currentField != null) && _currentField[0].selectionEnd === _currentField[0].maxLength) {
      return this._focusField(_currentField.next(), 'start');
    }
  };

  SegmentedCardNumberInputView.prototype._focusFieldForValue = function(place) {
    var field, fieldOffset, fieldPosition, groupIndex, groupLength, value, _i, _lastStartPos, _len, _ref;
    value = this.getValue();
    if (place === 'start') {
      field = this.el.find('input').first();
      this._focusField(field, place);
    } else if (place === 'end') {
      field = this.el.find('input').last();
      this._focusField(field, place);
    } else {
      field = void 0;
      fieldOffset = void 0;
      _lastStartPos = 0;
      _ref = this.options.groupings;
      for (groupIndex = _i = 0, _len = _ref.length; _i < _len; groupIndex = ++_i) {
        groupLength = _ref[groupIndex];
        if (place[1] > _lastStartPos && place[1] <= _lastStartPos + groupLength) {
          field = $(this.el.find('input')[groupIndex]);
          fieldPosition = place[1] - _lastStartPos;
        }
        _lastStartPos += groupLength;
      }
      if ((field != null) && (fieldPosition != null)) {
        this._focusField(field, [fieldPosition, fieldPosition]);
      } else {
        this._focusField(this.el.find('input'), 'end');
      }
    }
    return field;
  };

  SegmentedCardNumberInputView.prototype._focusField = function(field, place) {
    var fieldLen;
    if (field.length !== 0) {
      field[0].focus();
      if ($(field[0]).is(':visible') && field[0] === document.activeElement) {
        if (place === 'start') {
          return field[0].setSelectionRange(0, 0);
        } else if (place === 'end') {
          fieldLen = field[0].maxLength;
          return field[0].setSelectionRange(fieldLen, fieldLen);
        } else {
          return field[0].setSelectionRange(place[0], place[1]);
        }
      }
    }
  };

  SegmentedCardNumberInputView.prototype.setValue = function(newValue) {
    var el, groupIndex, groupLength, groupVal, _i, _lastStartPos, _len, _ref, _results;
    _lastStartPos = 0;
    _ref = this.options.groupings;
    _results = [];
    for (groupIndex = _i = 0, _len = _ref.length; _i < _len; groupIndex = ++_i) {
      groupLength = _ref[groupIndex];
      el = $(this.el.find('input').get(groupIndex));
      groupVal = newValue.substr(_lastStartPos, groupLength);
      el.val(groupVal);
      _results.push(_lastStartPos += groupLength);
    }
    return _results;
  };

  SegmentedCardNumberInputView.prototype.getValue = function() {
    var buffer, el, _i, _len, _ref;
    buffer = "";
    _ref = this.el.find('input');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      el = _ref[_i];
      buffer += $(el).val();
    }
    return buffer;
  };

  SegmentedCardNumberInputView.prototype.maxLength = function() {
    return this.options.groupings.reduce(function(a, b) {
      return a + b;
    });
  };

  SegmentedCardNumberInputView.prototype.isFilled = function() {
    return this.getValue().length === this.maxLength();
  };

  SegmentedCardNumberInputView.prototype.isValid = function() {
    return this.isFilled() && this.isValidLuhn(this.getValue());
  };

  SegmentedCardNumberInputView.prototype.isValidLuhn = function(identifier) {
    var alt, i, num, sum, _i, _ref;
    sum = 0;
    alt = false;
    for (i = _i = _ref = identifier.length - 1; _i >= 0; i = _i += -1) {
      num = parseInt(identifier.charAt(i), 10);
      if (isNaN(num)) {
        return false;
      }
      if (alt) {
        num *= 2;
        if (num > 9) {
          num = (num % 10) + 1;
        }
      }
      alt = !alt;
      sum += num;
    }
    return sum % 10 === 0;
  };

  SegmentedCardNumberInputView.prototype.bind = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.el).bind.apply(_ref, args);
  };

  SegmentedCardNumberInputView.prototype.trigger = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.el).trigger.apply(_ref, args);
  };

  SegmentedCardNumberInputView.prototype.show = function() {
    return this.el.show();
  };

  SegmentedCardNumberInputView.prototype.hide = function() {
    return this.el.hide();
  };

  SegmentedCardNumberInputView.prototype.addClass = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.el).addClass.apply(_ref, args);
  };

  SegmentedCardNumberInputView.prototype.removeClass = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.el).removeClass.apply(_ref, args);
  };

  return SegmentedCardNumberInputView;

})();

/*
Skeuocard::ExpirationInputView
*/


Skeuocard.prototype.ExpirationInputView = (function(_super) {
  __extends(ExpirationInputView, _super);

  function ExpirationInputView(opts) {
    var _this = this;
    if (opts == null) {
      opts = {};
    }
    opts.dateFormatter || (opts.dateFormatter = function(date) {
      return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
    });
    opts.dateParser || (opts.dateParser = function(value) {
      var dateParts;
      dateParts = value.split('-');
      return new Date(dateParts[2], dateParts[1] - 1, dateParts[0]);
    });
    opts.currentDate || (opts.currentDate = new Date());
    opts.pattern || (opts.pattern = "MM/YY");
    this.options = opts;
    this.date = void 0;
    this.value = void 0;
    this.el = $("<fieldset>");
    this.el.delegate("input", "keydown", function(e) {
      return _this._onKeyDown(e);
    });
    this.el.delegate("input", "keyup", function(e) {
      return _this._onKeyUp(e);
    });
  }

  ExpirationInputView.prototype._getFieldCaretPosition = function(el) {
    var input, sel, selLength;
    input = el.get(0);
    if (input.selectionEnd != null) {
      return input.selectionEnd;
    } else if (document.selection) {
      input.focus();
      sel = document.selection.createRange();
      selLength = document.selection.createRange().text.length;
      sel.moveStart('character', -input.value.length);
      return selLength;
    }
  };

  ExpirationInputView.prototype._setFieldCaretPosition = function(el, pos) {
    var input, range;
    input = el.get(0);
    if (input.createTextRange != null) {
      range = input.createTextRange();
      range.move("character", pos);
      return range.select();
    } else if (input.selectionStart != null) {
      input.focus();
      return input.setSelectionRange(pos, pos);
    }
  };

  ExpirationInputView.prototype.setPattern = function(pattern) {
    var char, groupings, i, patternParts, _currentLength, _i, _len;
    groupings = [];
    patternParts = pattern.split('');
    _currentLength = 0;
    for (i = _i = 0, _len = patternParts.length; _i < _len; i = ++_i) {
      char = patternParts[i];
      _currentLength++;
      if (patternParts[i + 1] !== char) {
        groupings.push([_currentLength, char]);
        _currentLength = 0;
      }
    }
    this.options.groupings = groupings;
    return this._setGroupings(this.options.groupings);
  };

  ExpirationInputView.prototype._setGroupings = function(groupings) {
    var fieldChars, group, groupChar, groupLength, input, sep, _i, _len, _startLength;
    fieldChars = ['D', 'M', 'Y'];
    this.el.empty();
    _startLength = 0;
    for (_i = 0, _len = groupings.length; _i < _len; _i++) {
      group = groupings[_i];
      groupLength = group[0];
      groupChar = group[1];
      if (__indexOf.call(fieldChars, groupChar) >= 0) {
        input = $('<input>').attr({
          type: 'text',
          pattern: '[0-9]*',
          placeholder: new Array(groupLength + 1).join(groupChar),
          maxlength: groupLength,
          "class": 'cc-exp-field-' + groupChar.toLowerCase() + ' group' + groupLength
        });
        input.data('fieldtype', groupChar);
        this.el.append(input);
      } else {
        sep = $('<span>').attr({
          "class": 'separator'
        });
        sep.html(new Array(groupLength + 1).join(groupChar));
        this.el.append(sep);
      }
    }
    this.groupEls = this.el.find('input');
    if (this.date != null) {
      return this._updateFieldValues();
    }
  };

  ExpirationInputView.prototype._updateFieldValues = function() {
    var currentDate,
      _this = this;
    currentDate = this.date;
    if (!this.groupEls) {
      return this.setPattern(this.options.pattern);
    }
    return this.groupEls.each(function(i, _el) {
      var el, groupLength, year;
      el = $(_el);
      groupLength = parseInt(el.attr('maxlength'));
      switch (el.data('fieldtype')) {
        case 'M':
          return el.val(_this._zeroPadNumber(currentDate.getMonth() + 1, groupLength));
        case 'D':
          return el.val(_this._zeroPadNumber(currentDate.getDate(), groupLength));
        case 'Y':
          year = groupLength >= 4 ? currentDate.getFullYear() : currentDate.getFullYear().toString().substr(2, 4);
          return el.val(year);
      }
    });
  };

  ExpirationInputView.prototype.clear = function() {
    this.value = "";
    this.date = null;
    return this.groupEls.each(function() {
      return $(this).val('');
    });
  };

  ExpirationInputView.prototype.setDate = function(newDate) {
    this.date = newDate;
    this.value = this.options.dateFormatter(newDate);
    return this._updateFieldValues();
  };

  ExpirationInputView.prototype.setValue = function(newValue) {
    this.value = newValue;
    this.date = this.options.dateParser(newValue);
    return this._updateFieldValues();
  };

  ExpirationInputView.prototype.getDate = function() {
    return this.date;
  };

  ExpirationInputView.prototype.getValue = function() {
    return this.value;
  };

  ExpirationInputView.prototype.reconfigure = function(opts) {
    if (opts.pattern != null) {
      this.setPattern(opts.pattern);
    }
    if (opts.value != null) {
      return this.setValue(opts.value);
    }
  };

  ExpirationInputView.prototype._onKeyDown = function(e) {
    var groupCaretPos, groupEl, groupMaxLength, nextInputEl, prevInputEl, _ref;
    e.stopPropagation();
    groupEl = $(e.currentTarget);
    groupEl = $(e.currentTarget);
    groupMaxLength = parseInt(groupEl.attr('maxlength'));
    groupCaretPos = this._getFieldCaretPosition(groupEl);
    prevInputEl = groupEl.prevAll('input').first();
    nextInputEl = groupEl.nextAll('input').first();
    if (e.which === 8 && groupCaretPos === 0 && !$.isEmptyObject(prevInputEl)) {
      prevInputEl.focus();
    }
    if ((_ref = e.which) === 37 || _ref === 38 || _ref === 39 || _ref === 40) {
      switch (e.which) {
        case 37:
          if (groupCaretPos === 0 && !$.isEmptyObject(prevInputEl)) {
            return prevInputEl.focus();
          }
          break;
        case 39:
          if (groupCaretPos === groupMaxLength && !$.isEmptyObject(nextInputEl)) {
            return nextInputEl.focus();
          }
          break;
        case 38:
          if (!$.isEmptyObject(groupEl.prev('input'))) {
            return prevInputEl.focus();
          }
          break;
        case 40:
          if (!$.isEmptyObject(groupEl.next('input'))) {
            return nextInputEl.focus();
          }
      }
    }
  };

  ExpirationInputView.prototype._onKeyUp = function(e) {
    var arrowKeys, dateObj, day, groupCaretPos, groupEl, groupMaxLength, groupValLength, month, nextInputEl, pattern, specialKeys, year, _ref, _ref1;
    e.stopPropagation();
    specialKeys = [8, 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 91, 93, 144, 145, 224];
    arrowKeys = [37, 38, 39, 40];
    groupEl = $(e.currentTarget);
    groupMaxLength = parseInt(groupEl.attr('maxlength'));
    groupCaretPos = this._getFieldCaretPosition(groupEl);
    if (_ref = e.which, __indexOf.call(specialKeys, _ref) < 0) {
      groupValLength = groupEl.val().length;
      pattern = new RegExp('[^0-9]+', 'g');
      groupEl.val(groupEl.val().replace(pattern, ''));
      if (groupEl.val().length < groupValLength) {
        this._setFieldCaretPosition(groupEl, groupCaretPos - 1);
      } else {
        this._setFieldCaretPosition(groupEl, groupCaretPos);
      }
    }
    nextInputEl = groupEl.nextAll('input').first();
    if ((_ref1 = e.which, __indexOf.call(specialKeys, _ref1) < 0) && groupEl.val().length === groupMaxLength && !$.isEmptyObject(nextInputEl) && this._getFieldCaretPosition(groupEl) === groupMaxLength) {
      nextInputEl.focus();
    }
    day = parseInt(this.el.find('.cc-exp-field-d').val()) || 1;
    month = parseInt(this.el.find('.cc-exp-field-m').val());
    year = parseInt(this.el.find('.cc-exp-field-y').val());
    if (month === 0 || year === 0) {
      this.value = "";
      this.date = null;
    } else {
      if (year < 2000) {
        year += 2000;
      }
      dateObj = new Date(year, month - 1, day);
      this.value = this.options.dateFormatter(dateObj);
      this.date = dateObj;
    }
    this.trigger("keyup", [this]);
    return false;
  };

  ExpirationInputView.prototype._inputGroupEls = function() {
    return this.el.find("input");
  };

  ExpirationInputView.prototype.isFilled = function() {
    var el, inputEl, _i, _len, _ref;
    _ref = this.groupEls;
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      inputEl = _ref[_i];
      el = $(inputEl);
      if (el.val().length !== parseInt(el.attr('maxlength'))) {
        return false;
      }
    }
    return true;
  };

  ExpirationInputView.prototype.isValid = function() {
    return this.isFilled() && ((this.date.getFullYear() === this.options.currentDate.getFullYear() && this.date.getMonth() >= this.options.currentDate.getMonth()) || this.date.getFullYear() > this.options.currentDate.getFullYear());
  };

  return ExpirationInputView;

})(Skeuocard.prototype.TextInputView);

Skeuocard.prototype.TextInputView = (function(_super) {
  __extends(TextInputView, _super);

  function TextInputView(opts) {
    this.el = $("<input>").attr({
      type: 'text',
      placeholder: opts.placeholder,
      "class": opts["class"]
    });
    this.options = opts;
  }

  TextInputView.prototype.clear = function() {
    return this.el.val("");
  };

  TextInputView.prototype.attr = function() {
    var args, _ref;
    args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
    return (_ref = this.el).attr.apply(_ref, args);
  };

  TextInputView.prototype.isFilled = function() {
    return this.el.val().length > 0;
  };

  TextInputView.prototype.isValid = function() {
    if (this.options.requireMaxLength) {
      return this.el.val().length === parseInt(this.el.attr('maxlength'));
    } else {
      return this.isFilled();
    }
  };

  TextInputView.prototype.getValue = function() {
    return this.el.val();
  };

  return TextInputView;

})(Skeuocard.prototype.TextInputView);

window.Skeuocard = Skeuocard;

/*
# Card Definitions
*/


CCProducts = {};

CCProducts[/^30[0-5][0-9]/] = {
  companyName: "Diners Club",
  companyShortname: "dinersclubintl",
  cardNumberGrouping: [4, 6, 4],
  expirationFormat: "MM/YY",
  cvcLength: 3,
  layout: {
    number: 'front',
    exp: 'front',
    name: 'front',
    cvc: 'back'
  }
};

CCProducts[/^3095/] = {
  companyName: "Diners Club International",
  companyShortname: "dinersclubintl",
  cardNumberGrouping: [4, 6, 4],
  expirationFormat: "MM/YY",
  cvcLength: 3,
  layout: {
    number: 'front',
    exp: 'front',
    name: 'front',
    cvc: 'back'
  }
};

CCProducts[/^36\d{2}/] = {
  companyName: "Diners Club International",
  companyShortname: "dinersclubintl",
  cardNumberGrouping: [4, 6, 4],
  expirationFormat: "MM/YY",
  cvcLength: 3,
  layout: {
    number: 'front',
    exp: 'front',
    name: 'front',
    cvc: 'back'
  }
};

CCProducts[/^35\d{2}/] = {
  companyName: "JCB",
  companyShortname: "jcb",
  cardNumberGrouping: [4, 4, 4, 4],
  expirationFormat: "MM/YY",
  cvcLength: 3,
  layout: {
    number: 'front',
    exp: 'front',
    name: 'front',
    cvc: 'back'
  }
};

CCProducts[/^3[47]/] = {
  companyName: "American Express",
  companyShortname: "amex",
  cardNumberGrouping: [4, 6, 5],
  expirationFormat: "MM/YY",
  cvcLength: 4,
  layout: {
    number: 'front',
    exp: 'front',
    name: 'front',
    cvc: 'front'
  }
};

CCProducts[/^38/] = {
  companyName: "Hipercard",
  companyShortname: "hipercard",
  cardNumberGrouping: [4, 4, 4, 4],
  expirationFormat: "MM/YY",
  cvcLength: 3,
  layout: {
    number: 'front',
    exp: 'front',
    name: 'front',
    cvc: 'back'
  }
};

CCProducts[/^4[0-9]\d{2}/] = {
  companyName: "Visa",
  companyShortname: "visa",
  cardNumberGrouping: [4, 4, 4, 4],
  expirationFormat: "MM/YY",
  cvcLength: 3,
  layout: {
    number: 'front',
    exp: 'front',
    name: 'front',
    cvc: 'back'
  }
};

CCProducts[/^5[0-8]\d{2}/] = {
  companyName: "Mastercard",
  companyShortname: "mastercard",
  cardNumberGrouping: [4, 4, 4, 4],
  expirationFormat: "MM/YY",
  cvcLength: 3,
  layout: {
    number: 'front',
    exp: 'front',
    name: 'front',
    cvc: 'back'
  }
};

CCProducts[/^6011/] = {
  companyName: "Discover",
  companyShortname: "discover",
  cardNumberGrouping: [4, 4, 4, 4],
  expirationFormat: "MM/YY",
  cvcLength: 3,
  layout: {
    number: 'front',
    exp: 'front',
    name: 'front',
    cvc: 'back'
  }
};

CCIssuers = {};

/*
Hack fixes the Chase Sapphire card's stupid (nice?) layout non-conformity.
*/


CCIssuers[/^414720/] = {
  issuingAuthority: "Chase",
  issuerName: "Chase Sapphire Card",
  issuerShortname: "chase-sapphire",
  layout: {
    number: 'front',
    exp: 'front',
    name: 'front',
    cvc: 'front'
  }
};