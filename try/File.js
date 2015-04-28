var SimpleMailFile = function(){
  var pub = {};
  
  pub.MESSAGE_SOURCE = "message.txt",

  pub.getDataDirectory = function() {
    var dirLocation;
    try {
      dirLocation = technalxs.simplemail.SimpleMailPrefs.prefs.getComplexValue("dataDirectory",
              Components.interfaces.nsIRelativeFilePref).file;
    }
    catch(e) {
      dirLocation = technalxs.simplemail.SimpleMailPrefs.prefs.getComplexValue("dataDirectory",
              Components.interfaces.nsIFile);
    }
    if (!dirLocation.exists()) dirLocation.create(dirLocation.DIRECTORY_TYPE, 0777);
    return dirLocation;
  },

  pub.getExtensionDirectory = function() {
    var id = "simplemail@telega.phpnet.us";
    if (typeof(Components.classes["@mozilla.org/extensions/manager;1"]) !== 'undefined')   {
      dirLocation = Components.classes["@mozilla.org/extensions/manager;1"]
            .getService(Components.interfaces.nsIExtensionManager)
            .getInstallLocation(id)
            .getItemLocation(id);
            return dirLocation;
    }
          Components.utils.import("resource://gre/modules/AddonManager.jsm");
          AddonManager.getAddonByID(id, function(addon) {
            dirLocation = addon.getResourceURI("").QueryInterface(Components.interfaces.nsIFileURL).file;
          });
  },         
  
  pub.getSmilesDirectory = function() {
    var id = "simplemail@telega.phpnet.us";
    if (typeof(Components.classes["@mozilla.org/extensions/manager;1"]) !== 'undefined')   {
      dirLocation = Components.classes["@mozilla.org/extensions/manager;1"]
            .getService(Components.interfaces.nsIExtensionManager)
            .getInstallLocation(id)
            .getItemLocation(id);
    }
    else if (typeof(Components.utils) !== 'undefined' && typeof(Components.utils.import) !== 'undefined') {
      Components.utils.import("resource://gre/modules/AddonManager.jsm");
      AddonManager.getAddonByID(id, function(addon) {
        dirLocation = addon.getResourceURI("").QueryInterface(Components.interfaces.nsIFileURL).file ;
      });
    }
    dirLocation.append("chrome");
    dirLocation.append("skin");
    dirLocation.append("smiles");
    return dirLocation;
  },

  pub.getEnvDirectory = function() {
    var id = "simplemail@telega.phpnet.us";
    if (typeof(Components.classes["@mozilla.org/extensions/manager;1"]) !== 'undefined')   {
      dirLocation = Components.classes["@mozilla.org/extensions/manager;1"]
            .getService(Components.interfaces.nsIExtensionManager)
            .getInstallLocation(id)
            .getItemLocation(id);
    }
    else if (typeof(Components.utils) !== 'undefined' && typeof(Components.utils.import) !== 'undefined') {
          Components.utils.import("resource://gre/modules/AddonManager.jsm");
          AddonManager.getAddonByID(id, function(addon) {
          dirLocation = addon.getResourceURI("").QueryInterface(Components.interfaces.nsIFileURL).file ;
          });
    }
    dirLocation.append("chrome");
    dirLocation.append("skin");
    dirLocation.append("envelope");
    return dirLocation;
  },

  pub.getDirectory = function() {
    var dirLocation = technalxs.simplemail.SimpleMailFile.getDataDirectory();
    for(var i = 0; i < arguments.length; i++) {
      dirLocation.append(arguments[i]);
      if (!dirLocation.exists()) dirLocation.create(dirLocation.DIRECTORY_TYPE, 0777);
    }
    return dirLocation;
  },

  pub.encodeURI = function(url) {
    return encodeURI(url).replace(/'/g, "%27");
  },

  pub.getURL = function() {
    var url = "";
    for(var i = 0; i < arguments.length; i++) {
      url += (url ? "/" : "") + arguments[i];
    }
    return SimpleMailFile.encodeURI("simplemail://" + url);
  },

  pub.getAttachmentsDirectory = function(directory) {
    return technalxs.simplemail.SimpleMailFile.getDirectory("attachments", directory);
  },

  pub.saveAttachment = function(directory, name, contents) {
    var file = technalxs.simplemail.SimpleMailFile.getAttachmentsDirectory(directory);
    file.append(name);
    technalxs.simplemail.SimpleMailFile.writeFile(file, contents);
  },

  pub.deleteAttachments = function(directory) {
    if (!directory) return;

    var file = technalxs.simplemail.SimpleMailFile.getAttachmentsDirectory(directory);
    if (file.exists()) {
      try { file.remove(true); } catch(e) {throw e}
    }
  },

  pub.getAttachmentURL = function(directory, name) {
    return SimpleMailFile.getURL("attachments", directory, name);
  },

  pub.getImagesDirectory = function() {
    return technalxs.simplemail.SimpleMailFile.getDirectory("images");
  },

  pub.deleteImage = function(name) {
    var file = technalxs.simplemail.SimpleMailFile.getImagesDirectory();
    file.append(name);
    try { file.remove(false); } catch(e) {}
  },

  pub.saveUrl = function(url, file) {
    var io = Components.classes["@mozilla.org/network/io-service;1"]
                       .getService(Components.interfaces.nsIIOService);
    var source = io.newURI(url, "UTF-8", null);
      
    var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                            .createInstance(Components.interfaces.nsIWebBrowserPersist);
    
    persist.persistFlags = persist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
    persist.persistFlags |= persist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;
    // Add
    var privacyContext = sourceWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                                     .getInterface(Components.interfaces.nsIWebNavigation)
                                     .QueryInterface(Components.interfaces.nsILoadContext);
                                     
    persist.saveURI(source, null, null, null, null, file, privacyContext);
  },

  pub.saveCanvas = function(canvas, fileName) {
    var file = technalxs.simplemail.SimpleMailFile.getImagesDirectory();
    file.append(fileName);
    technalxs.simplemail.SimpleMailFile.saveUrl(canvas.toDataURL("image/png"), file);
  },

  pub.createOutputStream = function(file) {
    var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                 .createInstance(Components.interfaces.nsIFileOutputStream);
    stream.init(file, 0x04 | 0x08 | 0x20, 0666, 0); // Read & write, create, truncate
    var buffered = Components.classes["@mozilla.org/network/buffered-output-stream;1"]
                   .createInstance(Components.interfaces.nsIBufferedOutputStream);
    buffered.init(stream, 1*1024*1024);
    return { stream: stream,
             buffered: buffered,
             write: function(data) {
               this.buffered.write(data, data.length);
             },
             close: function() {
               this.buffered.close();
               this.stream.close();
             }
           };
  },
  
  pub.createOutputStream2 = function(file) {
    var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                 .createInstance(Components.interfaces.nsIFileOutputStream);
    stream.init(file, 0x04 | 0x08 | 0x10, 0666, 0); // Read & write, create, truncate
    var buffered = Components.classes["@mozilla.org/network/buffered-output-stream;1"]
                   .createInstance(Components.interfaces.nsIBufferedOutputStream);
    buffered.init(stream, 1*1024*1024);
    return { stream: stream,
             buffered: buffered,
             write: function(data) {
               this.buffered.write(data, data.length);
             },
             close: function() {
               this.buffered.close();
               this.stream.close();
             }
           };
  },  

  pub.createUnicharOutputStream = function(file) {
    var stream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                 .createInstance(Components.interfaces.nsIFileOutputStream);
    stream.init(file, 0x04 | 0x08 | 0x20, 0666, 0); // Read & write, create, truncate
    var unichar = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                  .createInstance(Components.interfaces.nsIConverterOutputStream);
    unichar.init(stream, "utf-8", 0, 0xFFFD);

    return { stream: stream,
             unichar: unichar,
             write: function(data) {
               this.unichar.writeString(data);
             },
             close: function() {
               this.unichar.close();
               this.stream.close();
             }
           };
  },

  pub.createInputStream = function(file) {
    var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                 .createInstance(Components.interfaces.nsIFileInputStream);
    stream.init(file,0x01,0444,null);
    var binary = Components.classes["@mozilla.org/binaryinputstream;1"]
                 .createInstance(Components.interfaces.nsIBinaryInputStream); 
    binary.setInputStream(stream);
    return { stream: stream,
             binary: binary, 
             readFully: function() {
               return this.binary.readBytes(this.binary.available());
             },
             close: function() {
               this.binary.close();
               this.stream.close();
             }
           };
  },

  pub.createUnicharInputStream = function(file) {
    var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                 .createInstance(Components.interfaces.nsIFileInputStream);
    stream.init(file, -1, 0, 0);
    var unichar = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                  .createInstance(Components.interfaces.nsIConverterInputStream);
    unichar.init(stream, "utf-8", stream.available(), 0);
    return { stream: stream,
             unichar: unichar,
             readFully: function() {
               var str = {};
               this.unichar.readString(this.stream.available(), str);
               return str.value;
             },
             close: function() {
               this.unichar.close();
               this.stream.close();
             }
           };
  },

  pub.getNsiFile = function(file) {
    if (file instanceof Components.interfaces.nsIFile) return file;
    else {
      var nsiFile = Components.classes["@mozilla.org/file/local;1"]
                .createInstance(Components.interfaces.nsIFile);
      nsiFile.initWithPath(file);
      return nsiFile;
    }
  },

  pub.readFile = function(file, unichar) {
    var nsiFile = technalxs.simplemail.SimpleMailFile.getNsiFile(file);
    var inn = unichar ? technalxs.simplemail.SimpleMailFile.createUnicharInputStream(nsiFile) 
                      : technalxs.simplemail.SimpleMailFile.createInputStream(nsiFile);
    try {
      return inn.readFully();
    }
    finally {
      inn.close();
    }
  },

  pub.createLogFile = function() {
    today = new Date();
    var date = technalxs.simplemail.SimpleMailDate.toShortString(today);
    var date = date.replace(/\//g,"-");
    var file = Components.classes["@mozilla.org/file/directory_service;1"].
           getService(Components.interfaces.nsIProperties).
           get("TmpD", Components.interfaces.nsIFile);
    file.append("Simplemail - " + date + ".log");
    if(!file.exists()) {
      var nsiFile = Components.classes["@mozilla.org/file/local;1"]
              .createInstance(Components.interfaces.nsIFile);
      nsiFile.initWithPath(file.path);
      return nsiFile;
    } else {
      return file;
    }
  },
      
  pub.writeFile = function(file, data, unichar) {
    var nsiFile = technalxs.simplemail.SimpleMailFile.getNsiFile(file);
    var out = unichar ? technalxs.simplemail.SimpleMailFile.createUnicharOutputStream(nsiFile)
                      : technalxs.simplemail.SimpleMailFile.createOutputStream(nsiFile);
    try {
      out.write(data);
    }
    finally {
      out.close();
    } 
  },

  pub.createTemporaryFile = function() {
    var file = Components.classes["@mozilla.org/file/directory_service;1"]
               .getService(Components.interfaces.nsIProperties)
               .get("TmpD", Components.interfaces.nsIFile);
    file.append("simplemail.tmp");
    file.createUnique(file.NORMAL_FILE_TYPE, 0666);

    var out = technalxs.simplemail.SimpleMailFile.createOutputStream(file);
    var inn = technalxs.simplemail.SimpleMailFile.createInputStream(file);

    return { write: function(data) { out.write(data); },
             readFully: function() {
               out.buffered.flush();
               return inn.readFully();
             },
             remove: function() {
               out.close();
               inn.close();
               file.remove(false);
             }
           };
  },

  pub.getStatusIconURL = function(status) {
    var image = (status == "loading") ? "loading.gif" : status + ".png";
    return "chrome://simplemail/skin/status/" + image;
  },
     
  pub.getEnvelopeIconURL = function(name) {
    return "chrome://simplemail/skin/envelope/" + name;
  },

  pub.getFileURL = function(file) {
    var ios = Components.classes["@mozilla.org/network/io-service;1"]
              .getService(Components.interfaces.nsIIOService);
    var fileHandler = ios.getProtocolHandler("file")
                     .QueryInterface(Components.interfaces.nsIFileProtocolHandler);
    return fileHandler.getURLSpecFromFile(file);
  },

  pub.getMimeType = function(uriOrFile) {

    var f=uriOrFile.split('.');
    if(f.length>1)
      return f[1];
    else
      return "application/octet-stream";

    try {
      var mimeService = Components.classes["@mozilla.org/mime;1"]
                        .getService(Components.interfaces.nsIMIMEService);
      if (uriOrFile instanceof Components.interfaces.nsIFile) {
        return mimeService.getTypeFromFile(uriOrFile);
      } else {
        var url = technalxs.simplemail.SimpleMailFile.getNsiURL(uriOrFile);
        return mimeService.getTypeFromURI(url);
      } 
    } catch(e) {
      return "application/octet-stream";
    }
  },

  pub.getFileExtension = function (url) {
    var filename = SimpleMailFile.getFileName(url);
    var ext =  filename.split('.').pop();
    return ext;
  },

  pub.isImage = function(url) {
    var mimeType = SimpleMailFile.getMimeType(url);
    return mimeType.match(/^image/i);
  },

  pub.readURL = function(url) {
    var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                    .getService(Components.interfaces.nsIIOService);
    var bstream = Components.classes["@mozilla.org/binaryinputstream;1"]
                  .createInstance(Components.interfaces.nsIBinaryInputStream);
    var channel = ioService.newChannel(url, null, null);

    var input = channel.open();
    bstream.setInputStream(input);

    var size, data = "";
    while((size = bstream.available())) {
      data += bstream.readBytes(size);
    }
    bstream.close();
    input.close();
    return data;
  },

  pub.getFileName = function(url) {
    //alert(url);
    // var nsiUrl = (nsiUrl instanceof Components.interfaces.nsIURL)
    //                ? url : technalxs.simplemail.SimpleMailFile.getNsiURL(url);
    // return decodeURIComponent(nsiUrl.fileName);
    return 'util.js';
  },

  pub.getNsiURL = function(url) {
    var nsiUrl = Components.classes["@mozilla.org/network/standard-url;1"]
               .createInstance(Components.interfaces.nsIURL);
    nsiUrl.spec = url;
    return nsiUrl;
  },

  pub.isLocalURL = function(url) {
    return ("" + url).match(/^(file:|chrome:|simplemail:)/i);
  },

  pub.chooseFile = function(mode, filters, name) {
    var fp = Components.classes["@mozilla.org/filepicker;1"]
             .createInstance(Components.interfaces.nsIFilePicker);
    fp.init(window, null, mode == "save" ? fp.modeSave :
                          mode == "folder" ? fp.modeGetFolder :
                          mode == "multiple" ? fp.modeOpenMultiple : fp.modeOpen);
    for(var i in filters) {
      switch(filters[i]) {
        case "images": fp.appendFilters(fp.filterImages); break;
        case "html":   fp.appendFilters(fp.filterHTML); break;
        default:       fp.appendFilter(filters[i], filters[i]); break;
      }
    }
    fp.appendFilters(fp.filterAll);
    fp.defaultString = name;

    var result = fp.show();
    if (result == fp.returnOK || result == fp.returnReplace) {
      if (mode != "multiple") return fp.file;
      var enumerate = fp.files;
      var files = [];
      while(enumerate.hasMoreElements()) {
        var file = enumerate.getNext();
        file.QueryInterface(Components.interfaces.nsIFile);
        files.push(file);
      }
      return files;
    }
  },
  
  pub.forEachFile = function(dir, onFile) {
    var files = dir.directoryEntries;
    while(files.hasMoreElements()) {
      var file = files.getNext();
      file.QueryInterface(Components.interfaces.nsIFile);
      onFile(file);
    }
  }
  return pub;
}();