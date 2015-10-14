SHELL   := /usr/bin/env bash
LOGODIR := img/logos

.PHONY: save-logo-stats
save-logo-stats:
	@which identify > /dev/null 2>&1 || (echo "Please brew install imagemagick" && false)
	identify -format " - %f %b %G\n" $(LOGODIR)/*.{svg,png} |gsort -hk2 > $(LOGODIR)/README.md
	du -hs $(LOGODIR) >> $(LOGODIR)/README.md

.PHONY: optimize-logos
optimize-logos:
	@which mogrify  > /dev/null 2>&1 || (echo "Please brew install imagemagick" && false)
	@which gsort    > /dev/null 2>&1 || (echo "Please brew install coreutils"   && false)
	@which pngquant > /dev/null 2>&1 || (echo "Please brew install pngquant"    && false)

	mogrify -resize 800x800\> $(LOGODIR)/*.png
	pngquant \
	  --force \
	  --skip-if-larger \
		--quality 90-100 \
		--ext '.png' \
		--speed 1 \
		$(LOGODIR)/*.png
	$(MAKE) save-logo-stats
