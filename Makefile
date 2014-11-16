.DELETE_ON_ERROR:

extension.zip: manifest.json
	@rm -f $@
	zip -r $@ data images scripts styles manifest.json index.html
