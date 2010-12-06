
function prefs_overlay_startup() {
    var prefwin = document.getElementById('prefwin');
    var displayPane = document.getElementById('displaySettingsPane');
    var fixedFunctionPane = document.getElementById('fixedFunctionSettingsPane');

    if (displayPane) prefwin.addPane(displayPane);
    if (fixedFunctionPane) prefwin.addPane(fixedFunctionPane);
}
