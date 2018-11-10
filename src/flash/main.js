function flashCheck() {
  let swf,
    swf_ver,
    hasFlash = false,
    ver;
  try {
    if (document.all) {
      swf = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');
      if (swf) {
        hasFlash = true;
        swf_ver = swf.GetVariable('$version');
      }
    } else {
      if (navigator.plugins && navigator.plugins.length > 0) {
        swf = navigator.plugins['Shockwave Flash'];
        if (swf) {
          hasFlash = true;
          swf_ver = swf.description;
        }
      }
    }
    if (typeof swf_ver !== 'string') {
      swf_ver = '';
    }
    ver = (swf_ver || '0 r0').match(/\d+/g);
  } catch (e) {}
  return {
    hasFlash, // has flash
    ver, // flash version
  };
}
