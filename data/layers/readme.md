mapshaper -i region.min.geojson -dissolve2 -each 'FID = $.id' -o denmark.geojson
