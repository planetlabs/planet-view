.DELETE_ON_ERROR:
NODE_BIN := ./node_modules/.bin
export PATH := $(NODE_BIN):$(PATH)

BUILD_DIR := ./dist
SRC_DIR := ./src

ZIP := $(shell pwd -P)/extension.zip
UPDATE := major minor patch

# Create a release archive for the extension
$(ZIP): clean build
	@rm -f $@
	cd $(BUILD_DIR) && zip -r $@ .

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
	@npm install
	@touch $@

.PHONY: build
build: node_modules/.install
	@npm run build

.PHONY: clean
clean:
	@rm -rf $(BUILD_DIR)

.PHONY: lint
lint:
	@npm run lint

.PHONY: start
start: node_modules/.install
	@npm start
