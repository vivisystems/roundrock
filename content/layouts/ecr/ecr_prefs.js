
function prefs_overlay_startup() {
    var prefwin = document.getElementById('prefwin');
    var displayPane = document.getElementById('displaySettingsPane');

    if (displayPane) prefwin.addPane(displayPane);
}
