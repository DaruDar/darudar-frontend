/**
 *
 * @ngdoc object
 * @name dd.$ddImage
 * @function
 *
 * @description
 * Служба $ddImage позволяет получать физические адреса картинок и их превьюх по URI и максимальным размерам.
 *
 */
defineFactory('$ddImage', function(){
    function ddImage(){
    }
    ddImage.prototype = {
    }
    ddImage.getSrc = getSrc;
    ddImage.getSize = getSize;
    return ddImage;
        
    /**
     * @ngdoc function
     * @name dd.ddImage#getSrc
     * @methodOf dd.$ddImage
     * @function
     *
     * @description
     * Возвращает URL картинки соотвествующий максимально допустимым размерам.
     *
     * @param {String} src URI картинки
     * @param {Object} imgSize Размер оригинала {width: Integer, height: Integer}
     * @param {Object} viewSize Максимальные размеры картинки {width: Integer, height: Integer}
     * @return {String} URL картинки
     */
    function getSrc(src, imgSize, viewSize){
       var size = getDefaultSize(imgSize, viewSize);
       return src;
    }
    /**
     * @ngdoc function
     * @name dd.ddImage#getSize
     * @methodOf dd.$ddImage
     * @function
     *
     * @description
     * Возвращает размеры картинки соотвествующие максимально допустимым размерам.
     *
     * @param {Object} imgSize Размер оригинала {width: Integer, height: Integer}
     * @param {Object} viewSize Максимальные размеры картинки {width: Integer, height: Integer}
     * @return {Object} Размеры картинки {width: Integer, height: Integer}
     */        
    function getSize(imgSize, viewSize){
        var ratio = imgSize.width / imgSize.height,
            size = getDefaultSize(imgSize, viewSize);
        if(size.width / ratio > size.height) {
            return {
                width: size.height * ratio,
                height: size.height
            };
        } else {
            return {
                width: size.width,
                height: size.width / ratio
            };
        }
    }
    function getDefaultSize(imgSize, viewSize){
        var size = {
            width: viewSize.width,
            height: viewSize.height
        };
        if(imgSize.width < size.width && imgSize.height < size.height) {
            return imgSize;
        } else {
            return size;
        }
    }
}); 
