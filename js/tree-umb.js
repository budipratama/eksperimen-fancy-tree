var CLIPBOARD = null;

$(function() {
    $("#tree")
        .fancytree({
            checkbox: false,
            checkboxAutoHide: true,
            titlesTabbable: true, // Add all node titles to TAB chain
            quicksearch: true, // Jump to nodes when pressing first character
            glyph: {
                preset: "awesome4",
                map: {}
            },
            // source: SOURCE,
            // source: { url: "umb.json" },
            source: { url: "ajax-tree-products.json" },
            extensions: ["edit", "dnd5", "table", "gridnav","glyph"],
            dnd5: {
                preventVoidMoves: true,
                preventRecursion: true,
                autoExpandMS: 400,
                dragStart: function(node, data) {
                    return true;
                },
                dragEnter: function(node, data) {
                    // return ["before", "after"];
                    return true;
                },
                dragDrop: function(node, data) {
                    console.log('dragDrop ',data.node)
                    console.log('dragDrop parent ',data.node.parent.key)
                    console.log('dragDrop parent ',data.node.parent.id);
                    alert('perlu ajax buat ganti parentnya')
                    data.otherNode.moveTo(node, data.hitMode);
                },
            },
            edit: {
                triggerStart: ["f2", "shift+click", "mac+enter"],
                close: function(event, data) {
                    if (data.save && data.isNew) {
                        // Quick-enter: add new nodes until we hit [enter] on an empty title
                        $("#tree").trigger("nodeCommand", {
                            cmd: "addSibling",
                        });
                    }
                },
            },
            table: {
                indentation: 20,
                nodeColumnIdx: 2,
                checkboxColumnIdx: 0,
            },
            gridnav: {
                autofocusInput: false,
                handleCursorKeys: true,
            },

            lazyLoad: function(event, data) {
                console.log('lazyLoad data ',data)
                console.log('lazyLoad data.node ',data.node)
                console.log('lazyLoad data.response ',data.response)
                console.log('lazyLoad data.result',data.result)
                data.result = { url: "ajax-sub2.json" };
                data.result = {
                    url: "ajax-sub2.json",
                    data: {mode: "children", parent: data.node.key},
                    cache: false
                };
            },
            activate: function(event, data) {
                // console.log('active data ',data)
                console.log('active data.node.key ',data.node.key)
                // console.log('active data.node.data ',data.node.data)
                // console.log('active data.node.title ',data.node.title)
                // console.log('active data.node.id ',data.node.id)
            },
            loadChildren: function(event, data) {
                console.log('loadChildren');
            },
            createNode: function(event, data) {
                console.log('createNode data.node',data.node);
                // case
                // 1. copy paste root maka harus disable foldernya
                //    agar bisa delete node yang sudah di copy
               var attr =  data.node;
               //  attr.folder=false;
                var node = attr,
                    $tdList = $(node.tr).find(">td");

                // Span the remaining columns if it's a folder.
                // We can do this in createNode instead of renderColumns, because
                // the `isFolder` status is unlikely to change later
                if (node.isFolder()) {
                    $tdList
                        .eq(2)
                        .prop("colspan", 6)
                        .nextAll()
                        .remove();
                }
            },
            renderColumns: function(event, data) {
                // var node = data.node,
                //     $tdList = $(node.tr).find(">td");

                // (Index #0 is rendered by fancytree by adding the checkbox)
                // Set column #1 info from node data:
                // $tdList.eq(1).text(node.getIndexHier());
                // (Index #2 is rendered by fancytree)
                // Set column #3 info from node data:
                // $tdList
                //     .eq(3)
                //     .find("input")
                //     .val(node.key);
                // $tdList
                //     .eq(4)
                //     .find("input")
                //     .val(node.data.foo);

                // Static markup (more efficiently defined as html row template):
                // $tdList.eq(3).html("<input type='input' value='"  "" + "'>");
                // ...
            },
            modifyChild: function(event, data) {
                data.tree.info(event.type, data);
            },
        })
        .on("nodeCommand", function(event, data) {
            // Custom event handler that is triggered by keydown-handler and
            // context menu:
            var refNode,
                moveMode,
                tree = $.ui.fancytree.getTree(this),
                node = tree.getActiveNode();
            console.log('nodeCommand ',data)
            switch (data.cmd) {
                case "addChild":
                    refNode = node.getNextSibling() || node.getPrevSibling() || node.getParent();
                    console.log('remove ',node.data.id);

                    node.addChildren();
                    // if( refNode ) {
                    //     refNode.setActive();
                    // }
                    alert("node added persiapan remove via ajax");
                    break;
                case "addSibling":
                case "indent":
                case "moveDown":
                case "moveUp":
                case "outdent":
                case "remove":
                    refNode = node.getNextSibling() || node.getPrevSibling() || node.getParent();
                    console.log('remove ',node.data.id);

                    node.remove();
                    // if( refNode ) {
                    //     refNode.setActive();
                    // }
                    alert("node removed persiapan remove via ajax");
                    break;
                case "rename":
                    tree.applyCommand(data.cmd, node);
                    break;
                case "cut":
                    CLIPBOARD = { mode: data.cmd, data: node };
                    break;
                case "copy":
                    CLIPBOARD = {
                        mode: data.cmd,
                        data: node.toDict(true, function(dict, node) {
                            delete dict.key;
                            delete dict.id;
                            delete dict.folder;
                        }),
                    };
                    break;
                case "clear":
                    CLIPBOARD = null;
                    break;
                case "paste":
                    if (CLIPBOARD.mode === "cut") {
                        // refNode = node.getPrevSibling();
                        CLIPBOARD.data.moveTo(node, "child");
                        CLIPBOARD.data.setActive();
                    } else if (CLIPBOARD.mode === "copy") {
                        node.addChildren(
                            CLIPBOARD.data
                        ).setActive();
                    }
                    break;
                default:
                    alert("Unhandled command: " + data.cmd);
                    return;
            }
        })
        .on("keydown", function(e) {
            var cmd = null;

            // console.log(e.type, $.ui.fancytree.eventToString(e));
            switch ($.ui.fancytree.eventToString(e)) {
                case "ctrl+shift+n":
                case "meta+shift+n": // mac: cmd+shift+n
                    cmd = "addChild";
                    break;
                case "ctrl+c":
                case "meta+c": // mac
                    cmd = "copy";
                    break;
                case "ctrl+v":
                case "meta+v": // mac
                    cmd = "paste";
                    break;
                case "ctrl+x":
                case "meta+x": // mac
                    cmd = "cut";
                    break;
                case "ctrl+n":
                case "meta+n": // mac
                    cmd = "addSibling";
                    break;
                case "del":
                case "meta+backspace": // mac
                    cmd = "remove";
                    break;
                // case "f2":  // already triggered by ext-edit pluging
                //   cmd = "rename";
                //   break;
                case "ctrl+up":
                case "ctrl+shift+up": // mac
                    cmd = "moveUp";
                    break;
                case "ctrl+down":
                case "ctrl+shift+down": // mac
                    cmd = "moveDown";
                    break;
                case "ctrl+right":
                case "ctrl+shift+right": // mac
                    cmd = "indent";
                    break;
                case "ctrl+left":
                case "ctrl+shift+left": // mac
                    cmd = "outdent";
            }
            if (cmd) {
                $(this).trigger("nodeCommand", { cmd: cmd });
                return false;
            }
        });

    /*
     * Tooltips
     */
    // $("#tree").tooltip({
    //   content: function () {
    //     return $(this).attr("title");
    //   }
    // });

    /*
     * Context menu (https://github.com/mar10/jquery-ui-contextmenu)
     */

    $("#tree").contextmenu({
        delegate: "span.fancytree-node",
        callback: function(key, options) {
            var m = "clicked: " + key;
            window.console && console.log(m) || alert(m);
        },
        menu: [
            // {items: customMenu}
            {
                title: "Edit <kbd>[F2]</kbd>",
                cmd: "rename",
                uiIcon: "ui-icon-pencil",
                disabled:function (action,data){
                    allowedDelete = $.ui.fancytree.getNode(data.target).folder;
                    console.log('disabled allowedDelete ',allowedDelete);
                    // var node = $.ui.fancytree.getNode(data.$trigger);
                    // console.log("disabled Node: "+ node.title + " " + node.tooltip);
                    if (allowedDelete == true)
                        return true;
                    else
                        return false;
                }
            },
            {
                title: "Delete <kbd>[Del]</kbd>",
                cmd: "remove",
                uiIcon: "ui-icon-trash",
                disabled:function (action,data){
                    allowedDelete = $.ui.fancytree.getNode(data.target).folder;
                    console.log('disabled allowedDelete ',allowedDelete);
                    // var node = $.ui.fancytree.getNode(data.$trigger);
                    // console.log("disabled Node: "+ node.title + " " + node.tooltip);
                    if (allowedDelete == true)
                        return true;
                    else
                        return false;
                }
            },
            { title: "----" },
            {
                title: "New sibling <kbd>[Ctrl+N]</kbd>",
                cmd: "addSibling",
                uiIcon: "ui-icon-plus",
                disabled:function (action,data){
                    allowedDelete = $.ui.fancytree.getNode(data.target).folder;
                    console.log('disabled allowedDelete ',allowedDelete);
                    // var node = $.ui.fancytree.getNode(data.$trigger);
                    // console.log("disabled Node: "+ node.title + " " + node.tooltip);
                    if (allowedDelete == true)
                        return true;
                    else
                        return false;
                }
            },
            {
                title: "New child <kbd>[Ctrl+Shift+N]</kbd>",
                cmd: "addChild",
                uiIcon: "ui-icon-arrowreturn-1-e",
            },
            { title: "----" },
            {
                title: "Cut <kbd>Ctrl+X</kbd>",
                cmd: "cut",
                uiIcon: "ui-icon-scissors",
            },
            {
                title: "Copy <kbd>Ctrl-C</kbd>",
                cmd: "copy",
                uiIcon: "ui-icon-copy",
            },
            {
                title: "Paste as child<kbd>Ctrl+V</kbd>",
                cmd: "paste",
                uiIcon: "ui-icon-clipboard",
                disabled: true,
            },
        ],
        beforeOpen: function(event, ui) {
            var node = $.ui.fancytree.getNode(ui.target);
            $("#tree").contextmenu(
                "enableEntry",
                "paste",
                !!CLIPBOARD
            );
            node.setActive();
        },
        select: function(event, ui) {
            var that = this;
            // delay the event, so the menu can close and the click event does
            // not interfere with the edit control
            setTimeout(function() {
                $(that).trigger("nodeCommand", { cmd: ui.cmd });
            }, 100);
        },
    });

    function customMenu(node) {
        // The default set of all items
        var items = {
            renameItem: { // The "rename" menu item
                label: "Rename",
                action: function () {
                }
            },
            deleteItem: { // The "delete" menu item
                label: "Delete",
                action: function () {
                }
            }
        };

        if ($(node).hasClass("folder")) {
            // Delete the "delete" menu item
            delete items.deleteItem;
        }

        return items;
    }
});