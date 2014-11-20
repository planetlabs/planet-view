.DELETE_ON_ERROR:
NODE_BIN := ./node_modules/.bin
export PATH := $(NODE_BIN):$(PATH)

BUILD_DIR := ./build
SRC_DIR := ./src
DIST_DIR := $(BUILD_DIR)/dist

SRC_ALL_SCRIPT := $(shell find $(SRC_DIR) -name '*.js')
SRC_MAIN_SCRIPT := $(shell find $(SRC_DIR) -name 'main.js')
SRC_ALL_STYLE := $(shell find $(SRC_DIR) -name '*.less')
SRC_MAIN_STYLE := $(shell find $(SRC_DIR) -name 'main.less')
SRC_ASSETS := $(shell find $(SRC_DIR) -name 'assets' -type d)

DIST_MAIN_SCRIPT := $(patsubst $(SRC_DIR)/%,$(DIST_DIR)/%,$(SRC_MAIN_SCRIPT))
DIST_MAIN_STYLE := $(patsubst $(SRC_DIR)/%.less,$(DIST_DIR)/%.css,$(SRC_MAIN_STYLE))
DIST_ASSETS := $(patsubst $(SRC_DIR)/%,$(DIST_DIR)/%,$(SRC_ASSETS))

ZIP := $(shell pwd -P)/extension.zip
UPDATE := major minor patch

# Create a release archive for the extension
$(ZIP): clean dist
	@rm -f $@
	cd $(DIST_DIR) && zip -r $@ .

$(UPDATE): node_modules/.install
	@source `git --exec-path`/git-sh-setup && require_clean_work_tree "bump version" "Please commit or stash them."
	$(eval NEW_VERSION := $(shell $(NODE_BIN)/semver --increment $@ `$(NODE_BIN)/json -f package.json version`))
	@json --in-place -f package.json -e "this.version='$(NEW_VERSION)'";
	@json --in-place -f $(SRC_DIR)/manifest.json -e "this.version='$(NEW_VERSION)'";
	@git add package.json $(SRC_DIR)/manifest.json
	git commit -m "$(NEW_VERSION)"
	git tag -a "v$(NEW_VERSION)" -m "$(NEW_VERSION)"

.PHONY: release
release: $(ZIP)

# Install Node based dependencies
node_modules/.install: package.json
	@npm prune
	@npm install
	@npm dedupe
	@touch $@

.PHONY: dist
dist: $(DIST_MAIN_SCRIPT) $(DIST_MAIN_STYLE) $(DIST_DIR)/index.html $(DIST_DIR)/manifest.json $(DIST_ASSETS)

$(DIST_MAIN_SCRIPT): $(SRC_ALL_SCRIPT) node_modules/.install
	@mkdir -p $(dir $@)
	@browserify --debug $(patsubst $(DIST_DIR)/%,$(SRC_DIR)/%,./$@) > $@

$(DIST_MAIN_STYLE): $(SRC_ALL_STYLE) node_modules/.install
	@mkdir -p $(dir $@)
	@lessc --source-map-less-inline --source-map-map-inline \
			--source-map-rootpath=$(SRC_DIR) \
			$(patsubst $(DIST_DIR)/%.css,$(SRC_DIR)/%.less,./$@) | autoprefixer --browsers 'Chrome >= 35' --output $@

$(DIST_DIR)/index.html: $(SRC_DIR)/index.html
	@mkdir -p $(DIST_DIR)
	@cp $< $@

$(DIST_DIR)/manifest.json: $(SRC_DIR)/manifest.json
	@mkdir -p $(DIST_DIR)
	@cp $< $@

.PHONY: $(DIST_ASSETS)
$(DIST_ASSETS):
	@mkdir -p $(dir $@)
	@rsync --recursive --update --perms --executability $(patsubst $(DIST_DIR)/%,$(SRC_DIR)/%,./$@) $(dir $@)

.PHONY: clean
clean:
	@rm -rf $(BUILD_DIR)

.PHONY: test
test: node_modules/.install
	@jscs $(SRC_DIR);
	@lessc --lint $(SRC_ALL_STYLE);

.PHONY: start
start: node_modules/.install
	@watchy --watch package.json,src -- make test dist;
