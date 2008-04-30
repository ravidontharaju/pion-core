# -----------------------------------------
# Pion Platform automake configuration file
# -----------------------------------------

docs: doxygen-doc
	rm -rf common/doc/html
	rm -rf net/doc/html
	ln -s ../../platform/doc/html common/doc/html
	ln -s ../../platform/doc/html net/doc/html
