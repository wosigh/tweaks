APPID = org.webosinternals.tweaks

package: clean
	palm-package . package node-service

test: package
	- palm-install -r ${APPID}
	palm-install ${APPID}_*.ipk
	palm-launch ${APPID}

clean:
	find . -name '*~' -delete
	rm -f ipkgtmp*.tar.gz
	rm -f ${APPID}_*.ipk

clobber: clean
