#! /bin/bash
set -e

news_version() {
    head -n 1 NEWS.md | cut -d" " -f 2
}

package_version() {
    jq -r .version <package.json | cut -d- -f1
}

verify_version() {
    if [ $(news_version) != $(package_version) ]; then
        cat >&2 <<EOF
Package version ($(package_version)) does not match the version in NEWS.md ($(news_version)).

Please add NEWS items for the upcoming release, and make sure the versions
align.
EOF
    fi
}

prompt_for_firmware_update() {
    echo -n "Is the firmware bundle up to date? (y/N) "

    read a

    case "$a" in
        y|Y)
            ;;
        *)
            exit 1
            ;;
    esac
}

update_shipped_firmware() {
    VERSION=$(package_version)

    tools/update-firmware
    git add static/**/{experimental,default}.hex
    TMP=$(mktemp)
    cat >${TMP} <<EOF
Update the firmware files we ship with

Built using Chrysalis-Firmware-Bundle-${VERSION} and the latest Kaleidoscope.
EOF
    git commit -s -F "${TMP}"
    rm -f "${TMP}"
}

update_version() {
    TMP=$(mktemp)
    VERSION="$1"
    jq ". | .[\"version\"] = \"${VERSION}\"" <package.json >"${TMP}"
    mv "${TMP}" package.json
}

update_release_date() {
    TMP=$(mktemp)
    sed -e "s,\*\*UNRELEASED\*\*,Released on $(date +%Y-%m-%d)," <NEWS.md >${TMP}
    mv "${TMP}" NEWS.md
}

commit_preparations() {
    TMP=$(mktemp)
    git add package.json NEWS.md
    cat >${TMP} <<EOF
Preparations for Chrysalis $(package_version)

Bump the version, and finalize the release date.
EOF
    git commit -s -F "${TMP}"
    rm -f "${TMP}"
}

extract_news() {
    PREV_RELEASE_LINE=$(expr $(grep -n "^===" NEWS.md | head -n 2 | tail -n 1 | cut -d: -f1) - 3)
    if [ ${PREV_RELEASE_LINE} == 2 ]; then
        PREV_RELEASE_LINE=$(wc -l NEWS.md)
    fi

    head -n ${PREV_RELEASE_LINE} NEWS.md | tail -n +5 | awk '{printf "%s ",$0} /^$/{print "\n"} END{print ""}'
}

push_changes() {
    git push
}

create_draft_release() {
    VERSION=$(package_version)
    TMP=$(mktemp)
    cat >${TMP} <<EOF
$(extract_news)
EOF

    gh release create chrysalis-${VERSION} -d -F "${TMP}" -t "Chrysalis ${VERSION}"

    rm -f "${TMP}"
}

verify_version
prompt_for_firmware_update
update_shipped_firmware
update_version "$@"
update_release_date
commit_preparations
push_changes
create_draft_release
