/**
 * Some utilitie functions used by FECPos
 *
 *
 * @public
 * @name FECPosUtils
 * @namespace FECPosUtils
 */
GREUtils.define('FECPosUtils', GeckoJS.global);

// path end with "/"
FECPosUtils.addSlash = function(path){
    //
    return (path + '/').replace(/\/+/g,'/');
};

// remove "/" of the path end
FECPosUtils.removeSlash = function(path){
    //
    return (path).replace(/\/$/,'');;
};
