var debug = (typeof(window) == "object") ? window : {};
debug.viewer = exports;

var $ = debug.$ = require("jquery");

var common = debug.common = require("../common.js");


var FIELDS = common.FIELDS;


var BnayStreamWeb = exports.BnayStreamWeb = function BnayStreamWeb(root) {
 if (!(this instanceof BnayStreamWeb))
  return new BnayStreamWeb(root, doc);
 
 var self = this;
 var $$ = make$(root);
 
 self.root = root;
 var fields = {};
 
 function field(name, value) {
  name = name.replace(/[^a-zA-Z0-9_-]/g, "");
  
  if (!FIELDS[name])
   return;
  
  if (typeof(value) == "undefined")
   return fields[name];
  
  var spec = FIELDS[name];
  var label = spec[0];
  var defaultValue = spec[1];
  var type = typeof(defaultValue);
  if (value == null)
   value = defaultValue;
  
  fields[name] = value;
  console.log("" + name + ": " + value);
  
  var field = $$(".app-go-form > [data-name='" + name + "']");
  if (!field.length) {
   field = $($$(".app-templates > .app-field-"+type).text());
   field.attr("data-name", name);
   var $$$ = make$(field);
   $$$("input").attr("id", name).attr("name", name);
   $$$("label").attr("for", name);
   $$$(".app-field-caption").text(label);
   if (["url"].indexOf(name) > -1)
    $$$("input").attr("type", "url");
   window.componentHandler.upgradeElements(field[0]);
   $$(".app-go-form").append(field.hide());
  }
  var $$$ = make$(field);
  if (type == "string") {
   $$$("input").val(value)
   if (value)
    field.addClass("is-dirty");
   else
    field.removeClass("is-dirty");
  }
  if (type == "boolean") {
   if (value) {
    $$$("input").attr("checked", "checked");
    $$$("label").addClass("is-checked");
   } else {
    $$$("input").removeAttr("checked");
    $$$("label").removeClass("is-checked");
   }
  }
  field.show();
 }

 function init() {
  for (var name in FIELDS) {
   if (FIELDS.hasOwnProperty(name)) {
    (function(name) {
     self[name] = function(value) { return field(name, value); };
     self[name](null);
    })(name);
   }
  }
  
  self.update();
  
  $$(".app-go").click(function() {
   $$(".app-go-form").submit();
  });
  $$(".app-stop").click(function() {
   $$(".app-stop-form").submit();
  }).hide();
 }
 
 self.sync = function() {
  self.update();
 };
 
 self.update = function() {
  $.get("status")
   .done(function(status) {
    for (var name in status) {
     if (FIELDS.hasOwnProperty(name))
      (function(name) { self[name](status[name]); })(name);
    }
    if (status["_running"])
     $(".app-stop").show();
    else
     $(".app-stop").hide();
   });
 };
 
 init();
}


function make$(el) {
 return function() {
  if (arguments.length > 0)
   return el.find.apply(el, arguments);
  else
   return el;
 };
};


function main() {
 debug.app = new BnayStreamWeb($(".app-root"), document);
}


main()
