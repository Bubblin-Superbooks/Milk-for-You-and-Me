"use strict";

function getViewNumber(req, page) {
    return parseInt((page || req.turn("page")) / 2 + 1, 10);
}

var pushToStateFlag = true;

$(document).ready(function () {
    function click(el) {
        el.contents().unbind("tap doubletap mouseover vmouseover mouseout vmouseout pinch mouseup vmouseup mousemove vmousemove swipe mousedown vmousedown drag touchstart touchmove touchend dragstart dragend dragover");
        if (Turn.isTouchDevice) {
            el.contents().bind("vmousedown vmouseover vmouseout vmouseup vmousemove", function (item) {
                item.pageX += el.offset().left;
                item.pageY += el.offset().top;
                $superbook.trigger(item);
            });
        } else {
            el.contents().bind("mouseover vmouseover mouseout vmouseout mouseup vmouseup mousemove vmousemove", function (item) {
                item.pageX += el.offset().left;
                item.pageY += el.offset().top;
                $(document).trigger(item);
            });
            el.contents().bind("mousedown vmousedown", function (item) {
                item.pageX += el.offset().left;
                item.pageY += el.offset().top;
                $superbook.trigger(item);
            });
        }
        $(".turnoff", $("iframe").contents()).on("touchend doubletap mouseover vmouseover mouseout vmouseout pinch mouseup vmouseup mousemove vmousemove swipe mousedown vmousedown drag touchstart touchmove dragstart dragend dragover", function (event) {
            event.stopPropagation();
        });

        $(".selectable", $("iframe").contents()).on("touchend doubletap mouseover vmouseover mouseout vmouseout pinch mouseup vmouseup mousemove vmousemove swipe mousedown vmousedown drag touchstart touchmove dragstart dragend dragover", function (event) {
            event.stopPropagation();
        });

        $("a", $("iframe").contents()).on("touchend doubletap mouseover vmouseover mouseout vmouseout pinch mouseup vmouseup mousemove vmousemove swipe mousedown vmousedown drag touchstart touchmove dragstart dragend dragover", function (dataAndEvents) {
            return false;
        });
        if (Turn.isTouchDevice) {
            $("a.page", $("iframe").contents()).off().on("tap", function (dataAndEvents) {
                var matches = $(this).attr("href");
                $superbook.turn("page", matches);
                return false;
            });
            $("a:not(.page)", $("iframe").contents()).off().on("tap", function (dataAndEvents) {
                var url = $(this).attr("href");
                window.open(url, "_blank");
                return false;
            });
        } else {
            $("a:not(.page)", $("iframe").contents()).off().on(" click", function (dataAndEvents) {
                var url = $(this).attr("href");
                window.open(url, "_blank");
                return false;
            });
            $("a.page", $("iframe").contents()).off().on("click", function (dataAndEvents) {
                var matches = $(this).attr("href");
                $superbook.turn("page", matches);
                return false;
            });
        }
    }
    var $superbook = $("#superbook");

    $superbook.turn({
        pageWidth: 1115,
        pageHeight: 1443,
        autoCenter: true,
        responsive: true,
        display: "single",
        animatedAutoCenter: true,
        smartFlip: true,
        swipe: true,
        iframeSupport: true
    });

    $("iframe").each(function (dataAndEvents) {
        this.onload = function () {
            click($(this));
        };
    });
    var target = document.querySelector("#superbook");
    var mutationObserver = new MutationObserver(function (failures) {
        failures.forEach(function (record) {
            if (record.type === "childList") {
                if (record.addedNodes && record.addedNodes.length > 0 && record.addedNodes[0].className === "page-wrapper") {
                    var images = $(record.addedNodes[0]).find("iframe");
                    if (images.length > 0) {
                        images[0].onload = function () {
                            click($(this));
                        };
                    }
                }
            }
        });
    });
    var mutationConfig = {
        attributes: true,
        childList: true,
        characterData: true
    };
    if ($("#superbook").length) {
        mutationObserver.observe(target, mutationConfig);
    }
    if ($superbook.length > 0) {
        document.body.addEventListener("touchmove", function (types) {
            types.preventDefault();
        });
    }

    var id = $("#bookname").val();

    var s = Cookies.get("" + id);

    var page = $superbook.turn("page");
    var views = $superbook.turn("view");

    $superbook.turn("page", s);

    $superbook.bind("turned", function (dataAndEvents, m1, deepDataAndEvents) {
        Cookies.remove("" + id);
        Cookies.set("" + id, parseInt(m1));
    });

    if (Turn.isTouchDevice) {
        $("body .ui-arrow-next-page").on("tap", function (dataAndEvents) {
            $superbook.turn("next");
        });
        $("body .ui-arrow-previous-page").on("tap", function (dataAndEvents) {
            $superbook.turn("previous");
        });
    } else {
        $(".ui-arrow-next-page").on("click", function (dataAndEvents) {
            $superbook.turn("next");
        });
        $(".ui-arrow-previous-page").on("click", function (dataAndEvents) {
            $superbook.turn("previous");
        });
    }
    key("left, pageup, up", function (e) {
        e.preventDefault(e);
        $superbook.turn("previous");
    });
    key("right, pagedown, down, space", function (e) {
        e.preventDefault(e);
        $superbook.turn("next");
    });
    key("⌘ + left, ⌘ + pageup, ⌘ + up, ctrl + left, ctrl + pageup, ctrl + up", function (e) {
        e.preventDefault(e);
        $superbook.turn("page", 1);
    });
    key("⌘ + right, ⌘ + pagedown, ⌘ + down, ctrl + right, ctrl + pagedown, ctrl + down", function (e) {
        e.preventDefault(e);
        $superbook.turn("page", $superbook.turn("pages"));
    });
    var path = window.location.hash;
    var href = window.location.href;
    href = href.split('#')[0];
    var historyApi = !!(window.history && history.replaceState);
    if (historyApi) {
        if (path === "") {
            if (typeof s !== "undefined") {
                path = "#" + s;
            } else {
                path = "#" + 1;
            }
        }
        history.replaceState(null, null, href + path);
        $superbook.turn("page", path.substring(1));
    }
    $superbook.bind("turning", function (dataAndEvents, stepid, deepDataAndEvents) {
        if (pushToStateFlag) {
            var shouldBeHash = "#" + stepid;
            window.history.pushState("", "", href + shouldBeHash);
        }
        pushToStateFlag = true;
    });
    $(window).on("popstate", function (dataAndEvents) {
        var raw = window.location.hash;
        var num = "#" + parseInt($superbook.turn("page"));
        if (raw !== num) {
            pushToStateFlag = false;
            $superbook.turn("page", raw.substring(1));
        }
    });
});